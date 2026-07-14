import { prisma } from "@workspace/db";
import crypto from "node:crypto";
import type { MembershipStatus, Prisma } from "@prisma/client";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import { createAuditLog } from "./audit.service.js";
import { sendEmail, buildInvitationEmail } from "./email.service.js";
import { env } from "../config/env.js";
import { emitToUser } from "../realtime/hub.js";

async function getRequesterGraph(userId: string) {
  const [friendships, memberships] = await Promise.all([
    prisma.friendship.findMany({
      where: { userId, blockedAt: null },
      select: { friendId: true },
    }),
    prisma.communityMember.findMany({
      where: { userId, status: "APPROVED" },
      select: { communityId: true },
    }),
  ]);

  return {
    friendIds: new Set(friendships.map((f) => f.friendId)),
    communityIds: new Set(memberships.map((m) => m.communityId)),
  };
}

export async function searchUsers(
  currentUserId: string,
  query: string,
  limit: number,
  cursor?: string,
) {
  const trimmed = query.trim();
  const like = trimmed.replace(/\s+/g, " ");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
  const { friendIds, communityIds } = await getRequesterGraph(currentUserId);

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    id: { not: currentUserId },
    OR: [
      { username: { contains: like, mode: "insensitive" } },
      { displayName: { contains: like, mode: "insensitive" } },
      ...(isUuid ? [{ id: trimmed }] : []),
      {
        AND: [
          { settings: { is: { allowEmailSearch: true, hideEmail: false } } },
          { email: { contains: like, mode: "insensitive" } },
        ],
      },
    ],
  };

  const users = await prisma.user.findMany({
    where,
    include: { settings: true },
    orderBy: [{ xp: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = users.length > limit;
  const pageUsers = hasMore ? users.slice(0, limit) : users;

  const enriched = await Promise.all(
    pageUsers.map(async (user) => {
      const [incomingRequest, outgoingRequest, mutualFriends, mutualCommunities] =
        await Promise.all([
          prisma.friendRequest.findFirst({
            where: { senderId: user.id, recipientId: currentUserId, status: "PENDING" },
            select: { id: true },
          }),
          prisma.friendRequest.findFirst({
            where: { senderId: currentUserId, recipientId: user.id, status: "PENDING" },
            select: { id: true },
          }),
          prisma.friendship.count({
            where: { userId: user.id, friendId: { in: [...friendIds] } },
          }),
          prisma.communityMember.count({
            where: {
              userId: user.id,
              status: "APPROVED",
              communityId: { in: [...communityIds] },
            },
          }),
        ]);

      const isFriend = friendIds.has(user.id);
      const isOnline = user.presenceStatus === "ONLINE";

      return {
        id: user.id,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
        username: user.username,
        xp: user.settings?.hideXp ? null : user.xp,
        level: user.level,
        status: user.settings?.hideOnlineStatus ? "HIDDEN" : user.presenceStatus,
        isOnline: user.settings?.hideOnlineStatus ? false : isOnline,
        lastSeenAt: user.settings?.hideLastSeen ? null : user.lastSeenAt,
        mutualFriends,
        mutualCommunities,
        relationship: isFriend
          ? "FRIEND"
          : incomingRequest
            ? "REQUEST_RECEIVED"
            : outgoingRequest
              ? "REQUEST_SENT"
              : "NONE",
        incomingRequestId: incomingRequest?.id ?? null,
        outgoingRequestId: outgoingRequest?.id ?? null,
      };
    }),
  );

  return {
    items: enriched,
    nextCursor: hasMore ? pageUsers[pageUsers.length - 1]?.id : null,
  };
}

export async function sendFriendRequest(senderId: string, recipientId: string) {
  if (senderId === recipientId) throw new ValidationError("Cannot add yourself");

  const recipient = await prisma.user.findFirst({
    where: { id: recipientId, deletedAt: null },
    include: { settings: true },
  });
  if (!recipient) throw new NotFoundError("User not found");
  if (!recipient.settings?.allowFriendRequests) {
    throw new ValidationError("This user is not accepting friend requests");
  }

  const existingFriendship = await prisma.friendship.findFirst({
    where: { userId: senderId, friendId: recipientId },
  });
  if (existingFriendship) throw new ConflictError("Already friends");

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, recipientId, status: "PENDING" },
        { senderId: recipientId, recipientId: senderId, status: "PENDING" },
      ],
    },
  });
  if (existingRequest) throw new ConflictError("Friend request already pending");

  const request = await prisma.friendRequest.create({
    data: { senderId, recipientId, status: "PENDING" },
  });

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: "FRIEND_REQUEST",
      title: "New friend request",
      body: "You received a new friend request.",
      data: { requestId: request.id, senderId },
    },
  });
  emitToUser(recipientId, {
    type: "social:friend_request",
    payload: { requestId: request.id, senderId },
  });

  return request;
}

export async function getFriendRequests(userId: string) {
  const [incoming, outgoing] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { recipientId: userId, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, xp: true, level: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: { senderId: userId, status: "PENDING" },
      include: {
        recipient: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, xp: true, level: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { incoming, outgoing };
}

export async function handleFriendRequest(
  userId: string,
  requestId: string,
  action: "accept" | "decline" | "cancel",
) {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") throw new NotFoundError("Request not found");

  if (action === "cancel") {
    if (request.senderId !== userId) throw new ValidationError("Only sender can cancel");
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } });
    return { success: true };
  }

  if (request.recipientId !== userId) throw new ValidationError("Only recipient can handle request");

  if (action === "decline") {
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "REJECTED" } });
    return { success: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.friendRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });
    await tx.friendship.createMany({
      data: [
        { userId: request.senderId, friendId: request.recipientId },
        { userId: request.recipientId, friendId: request.senderId },
      ],
      skipDuplicates: true,
    });
    await tx.user.update({
      where: { id: request.senderId },
      data: { friendsCount: { increment: 1 } },
    });
    await tx.user.update({
      where: { id: request.recipientId },
      data: { friendsCount: { increment: 1 } },
    });
    await tx.notification.create({
      data: {
        userId: request.senderId,
        type: "FRIEND_ACCEPTED",
        title: "Friend request accepted",
        body: "Your friend request has been accepted.",
        data: { requestId: request.id, acceptedBy: request.recipientId },
      },
    });
    await tx.activity.createMany({
      data: [
        { userId: request.senderId, type: "friend", description: "Connected with a new friend" },
        { userId: request.recipientId, type: "friend", description: "Connected with a new friend" },
      ],
    });
  });
  emitToUser(request.senderId, {
    type: "social:friend_request_accepted",
    payload: { requestId, acceptedBy: request.recipientId },
  });

  return { success: true };
}

export async function getFriends(userId: string) {
  const friends = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        include: {
          settings: true,
          achievements: { take: 3, orderBy: { earnedAt: "desc" }, include: { achievement: true } },
        },
      },
    },
    orderBy: [{ isPinned: "desc" }, { isFavorite: "desc" }, { createdAt: "desc" }],
  });

  return friends.map((f) => ({
    id: f.friend.id,
    username: f.friend.username,
    displayName: f.friend.displayName,
    avatarUrl: f.friend.avatarUrl,
    level: f.friend.level,
    xp: f.friend.settings?.hideXp ? null : f.friend.xp,
    streak: f.friend.settings?.hideStreak ? null : f.friend.currentStreak,
    isOnline: !f.friend.settings?.hideOnlineStatus && f.friend.presenceStatus === "ONLINE",
    lastSeenAt: f.friend.settings?.hideLastSeen ? null : f.friend.lastSeenAt,
    isMuted: f.isMuted,
    isFavorite: f.isFavorite,
    isPinned: f.isPinned,
    achievements: f.friend.settings?.hideAchievements
      ? []
      : f.friend.achievements.map((a) => ({
          id: a.achievement.id,
          name: a.achievement.name,
          iconUrl: a.achievement.iconUrl,
        })),
  }));
}

export async function updateFriendPreference(
  userId: string,
  friendId: string,
  patch: Partial<{ isMuted: boolean; isFavorite: boolean; isPinned: boolean; blockedAt: Date | null }>,
) {
  const existing = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
  if (!existing) throw new NotFoundError("Friendship not found");

  return prisma.friendship.update({
    where: { userId_friendId: { userId, friendId } },
    data: patch,
  });
}

export async function removeFriend(userId: string, friendId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    await tx.user.update({ where: { id: userId }, data: { friendsCount: { decrement: 1 } } });
    await tx.user.update({ where: { id: friendId }, data: { friendsCount: { decrement: 1 } } });
  });
  return { success: true };
}

export async function getOrCreateInviteLink(userId: string) {
  const now = new Date();
  const existing = await prisma.inviteLink.findFirst({
    where: {
      createdById: userId,
      status: "PENDING",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  await prisma.inviteLink.updateMany({
    where: {
      createdById: userId,
      status: "PENDING",
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  const code = crypto.randomUUID().slice(0, 8).toUpperCase();
  return prisma.inviteLink.create({
    data: {
      code,
      createdById: userId,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function inviteByEmail(userId: string, email: string) {
  const normalized = email.toLowerCase().trim();
  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, displayName: true, username: true },
  });
  if (!sender) throw new NotFoundError("User not found");
  if (sender.email.toLowerCase() === normalized) {
    throw new ValidationError("You cannot invite yourself");
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null },
    select: { id: true },
  });
  if (existingUser) {
    throw new ConflictError("This person already has a GenZVerse account");
  }

  const pending = await prisma.emailInvitation.findFirst({
    where: {
      senderId: userId,
      email: normalized,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });
  if (pending) {
    throw new ConflictError("An invitation is already pending for this email");
  }

  const inviteLink = await getOrCreateInviteLink(userId);
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const invitation = await prisma.emailInvitation.create({
    data: {
      email: normalized,
      token,
      senderId: userId,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const link = `${env.APP_URL}/invite/${inviteLink.code}?emailInvite=${token}&email=${encodeURIComponent(normalized)}`;
  const inviterName = sender.displayName || sender.username || "A friend";
  const emailContent = buildInvitationEmail({ inviterName, link });
  const delivery = await sendEmail({ to: invitation.email, ...emailContent });

  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title: "Invite sent",
      body: `Invitation emailed to ${normalized}`,
      data: { invitationId: invitation.id, emailSent: delivery.sent },
    },
  }).catch(() => undefined);

  return {
    invitation,
    inviteLink,
    link,
    emailSent: delivery.sent,
    emailMode: delivery.mode,
    previewUrl: delivery.previewUrl,
    message: delivery.sent
      ? "Invitation email sent"
      : "Invitation saved, but email delivery failed. Share the invite link instead.",
  };
}

export async function resendEmailInvite(userId: string, invitationId: string) {
  const invitation = await prisma.emailInvitation.findFirst({
    where: { id: invitationId, senderId: userId },
  });
  if (!invitation) throw new NotFoundError("Invitation not found");
  if (invitation.status === "ACCEPTED") {
    throw new ValidationError("Invitation already accepted");
  }
  if (invitation.status === "REVOKED") {
    throw new ValidationError("Invitation was cancelled");
  }

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, username: true },
  });
  const inviteLink = await getOrCreateInviteLink(userId);
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const updated = await prisma.emailInvitation.update({
    where: { id: invitation.id },
    data: {
      token,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const link = `${env.APP_URL}/invite/${inviteLink.code}?emailInvite=${token}&email=${encodeURIComponent(updated.email)}`;
  const emailContent = buildInvitationEmail({
    inviterName: sender?.displayName || sender?.username || "A friend",
    link,
  });
  const delivery = await sendEmail({ to: updated.email, ...emailContent });
  return {
    invitation: updated,
    link,
    emailSent: delivery.sent,
    previewUrl: delivery.previewUrl,
    message: delivery.sent ? "Invitation resent" : "Resent failed to deliver email",
  };
}

export async function cancelEmailInvite(userId: string, invitationId: string) {
  const invitation = await prisma.emailInvitation.findFirst({
    where: { id: invitationId, senderId: userId },
  });
  if (!invitation) throw new NotFoundError("Invitation not found");
  if (invitation.status === "ACCEPTED") {
    throw new ValidationError("Cannot cancel an accepted invitation");
  }
  const updated = await prisma.emailInvitation.update({
    where: { id: invitation.id },
    data: { status: "REVOKED", respondedAt: new Date() },
  });
  return { invitation: updated, success: true };
}

export async function getInviteDashboard(userId: string) {
  const link = await getOrCreateInviteLink(userId);
  const now = new Date();
  await prisma.emailInvitation.updateMany({
    where: { senderId: userId, status: "PENDING", expiresAt: { lte: now } },
    data: { status: "EXPIRED" },
  });

  const [emailInvites, acceptedUsers] = await Promise.all([
    prisma.emailInvitation.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      where: { invitedById: userId },
      select: { id: true, username: true, displayName: true, createdAt: true, avatarUrl: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    inviteLink: `${env.APP_URL}/invite/${link.code}`,
    inviteCode: link.code,
    stats: {
      totalSent: emailInvites.length,
      pending: emailInvites.filter((i) => i.status === "PENDING").length,
      accepted: acceptedUsers.length,
      rejected: emailInvites.filter((i) => i.status === "REVOKED").length,
      expired: emailInvites.filter((i) => i.status === "EXPIRED").length,
      referralXp: acceptedUsers.length * 100,
    },
    history: emailInvites,
    acceptedUsers,
  };
}

export async function getPublicProfile(viewerId: string | null, target: { id?: string; username?: string }) {
  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      ...(target.id ? { id: target.id } : {}),
      ...(target.username ? { username: target.username } : {}),
    },
    include: { settings: true },
  });
  if (!user) throw new NotFoundError("User not found");

  const isSelf = viewerId === user.id;
  const isFriend = viewerId
    ? !!(await prisma.friendship.findUnique({
        where: { userId_friendId: { userId: viewerId, friendId: user.id } },
      }))
    : false;
  const visibility = user.settings?.profileVisibility ?? "public";
  const allowed =
    isSelf ||
    visibility === "public" ||
    (visibility === "friends" && isFriend);

  if (!allowed) {
    throw new ValidationError("Profile is private");
  }

  const [friendsCount, communities, achievements, recentActivity] = await Promise.all([
    prisma.friendship.count({ where: { userId: user.id, blockedAt: null } }),
    prisma.communityMember.findMany({
      where: { userId: user.id, status: "APPROVED" },
      include: { community: true },
      take: 8,
      orderBy: { joinedAt: "desc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      take: 12,
      orderBy: { earnedAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { userId: user.id },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      country: user.country,
      timezone: user.timezone,
      level: user.level,
      xp: user.settings?.hideXp && !isSelf ? null : user.xp,
      currentStreak: user.settings?.hideStreak && !isSelf ? null : user.currentStreak,
      longestStreak: user.settings?.hideStreak && !isSelf ? null : user.longestStreak,
      presenceStatus: user.settings?.hideOnlineStatus && !isSelf ? "HIDDEN" : user.presenceStatus,
      lastSeenAt: user.settings?.hideLastSeen && !isSelf ? null : user.lastSeenAt,
      joinedAt: user.createdAt,
      friendsCount,
      communitiesJoined: user.communitiesJoined,
      challengesCompleted: user.challengesCompleted,
      activityScore: user.activityScore,
      canViewEmail: !user.settings?.hideEmail || isSelf,
      email: !user.settings?.hideEmail || isSelf ? user.email : null,
      isFriend,
    },
    achievements:
      user.settings?.hideAchievements && !isSelf
        ? []
        : achievements.map((a) => ({
            id: a.achievement.id,
            slug: a.achievement.slug,
            name: a.achievement.name,
            iconUrl: a.achievement.iconUrl,
            earnedAt: a.earnedAt,
          })),
    communities:
      user.settings?.hideCommunities && !isSelf
        ? []
        : communities.map((m) => ({
            id: m.community.id,
            name: m.community.name,
            slug: m.community.slug,
            imageUrl: m.community.imageUrl,
            memberCount: m.community.memberCount,
            category: m.community.category,
            role: m.role,
          })),
    activity:
      user.settings?.hideActivity && !isSelf
        ? []
        : recentActivity,
  };
}

export async function discoverCommunities(
  userId: string,
  input: {
    q?: string;
    category?: string;
    visibility?: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
    cursor?: string;
    limit: number;
    sort?: "trending" | "newest" | "members";
  },
) {
  const where: Prisma.CommunityWhereInput = {
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.q
      ? {
          OR: [
            { name: { contains: input.q, mode: "insensitive" } },
            { description: { contains: input.q, mode: "insensitive" } },
            { tags: { hasSome: input.q.split(/\s+/).filter(Boolean) } },
          ],
        }
      : {}),
  };

  const orderBy =
    input.sort === "newest"
      ? [{ createdAt: "desc" as const }]
      : input.sort === "members"
        ? [{ memberCount: "desc" as const }, { createdAt: "desc" as const }]
        : [{ isFeatured: "desc" as const }, { memberCount: "desc" as const }, { createdAt: "desc" as const }];

  const communities = await prisma.community.findMany({
    where,
    orderBy,
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    include: {
      members: {
        where: { userId, status: "APPROVED" },
        take: 1,
      },
    },
  });
  const hasMore = communities.length > input.limit;
  const items = hasMore ? communities.slice(0, input.limit) : communities;

  return {
    items: items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      category: c.category,
      memberCount: c.memberCount,
      tags: c.tags,
      visibility: c.visibility,
      isFeatured: c.isFeatured,
      joined: c.members.length > 0,
    })),
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  };
}

export async function joinCommunity(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) throw new NotFoundError("Community not found");

  const existing = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });

  if (existing?.status === "APPROVED") {
    throw new ConflictError("Already a member");
  }

  const status: MembershipStatus =
    community.visibility === "PUBLIC" ? "APPROVED" : "PENDING";

  const member = await prisma.communityMember.upsert({
    where: { communityId_userId: { communityId, userId } },
    create: { communityId, userId, role: "MEMBER", status },
    update: { status },
  });

  if (status === "APPROVED") {
    await prisma.community.update({
      where: { id: communityId },
      data: { memberCount: { increment: 1 } },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { communitiesJoined: { increment: 1 } },
    });
  } else if (community.createdById) {
    await prisma.notification.create({
      data: {
        userId: community.createdById,
        type: "COMMUNITY_INVITE",
        title: "New community join request",
        body: "A user requested to join your community.",
        data: { communityId, userId },
      },
    });
    emitToUser(community.createdById, {
      type: "social:notification",
      payload: { kind: "COMMUNITY_JOIN_REQUEST", communityId, userId },
    });
  }

  return { membership: member, requiresApproval: status === "PENDING" };
}

export async function consumeInviteOnSignup(
  inviteCode: string | undefined,
  newUserId: string,
  emailInviteToken?: string,
) {
  let inviterId: string | null = null;
  let emailInvitationId: string | null = null;

  if (emailInviteToken) {
    const emailInvite = await prisma.emailInvitation.findFirst({
      where: {
        token: emailInviteToken,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });
    if (emailInvite && emailInvite.senderId !== newUserId) {
      inviterId = emailInvite.senderId;
      emailInvitationId = emailInvite.id;
    }
  }

  if (!inviterId && inviteCode) {
    const inviteLink = await prisma.inviteLink.findFirst({
      where: {
        code: inviteCode.toUpperCase(),
        status: "PENDING",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (inviteLink && inviteLink.createdById !== newUserId) {
      inviterId = inviteLink.createdById;
      await prisma.inviteLink.update({
        where: { id: inviteLink.id },
        data: { useCount: { increment: 1 }, acceptedCount: { increment: 1 } },
      });
    }
  }

  if (!inviterId) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: newUserId },
      data: { invitedById: inviterId!, inviteAcceptedAt: new Date() },
    });
    await tx.friendship.createMany({
      data: [
        { userId: inviterId!, friendId: newUserId },
        { userId: newUserId, friendId: inviterId! },
      ],
      skipDuplicates: true,
    });
    await tx.user.update({
      where: { id: inviterId! },
      data: { friendsCount: { increment: 1 }, xp: { increment: 100 } },
    });
    await tx.user.update({
      where: { id: newUserId },
      data: { friendsCount: { increment: 1 } },
    });
    if (emailInvitationId) {
      await tx.emailInvitation.update({
        where: { id: emailInvitationId },
        data: {
          status: "ACCEPTED",
          acceptedByUserId: newUserId,
          respondedAt: new Date(),
        },
      });
    }
    await tx.activity.create({
      data: {
        userId: inviterId!,
        type: "invite",
        description: "Your invite was accepted and you earned referral XP",
        xpEarned: 100,
      },
    });
    await tx.notification.create({
      data: {
        userId: inviterId!,
        type: "INVITE_RECEIVED",
        title: "Invite accepted",
        body: "Someone joined GenZVerse through your invitation. +100 XP",
        data: { newUserId },
      },
    });
  });
}

export async function createCommunity(
  userId: string,
  input: {
    name: string;
    slug: string;
    description?: string;
    category: string;
    tags?: string[];
    rules?: string[];
    visibility?: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  },
) {
  const community = await prisma.community.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      category: input.category,
      tags: input.tags ?? [],
      rules: input.rules ?? [],
      visibility: input.visibility ?? "PUBLIC",
      createdById: userId,
      memberCount: 1,
      members: {
        create: {
          userId,
          role: "OWNER",
          status: "APPROVED" as MembershipStatus,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { communitiesJoined: { increment: 1 } },
  });
  await createAuditLog({ userId, action: "COMMUNITY_CREATED", resource: "community", resourceId: community.id });
  return community;
}

