import { prisma } from "@workspace/db";
import type { Prisma } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../utils/errors.js";
import { emitToUser } from "../realtime/hub.js";

function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

async function addXp(userId: string, amount: number, reason: string, source = "challenge") {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
  const nextLevel = calculateLevelFromXp(user.xp);
  if (nextLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: nextLevel },
    });
  }
  await prisma.xpHistory.create({
    data: { userId, amount, reason, source },
  });
  return { xp: user.xp, level: nextLevel };
}

export async function createChallenge(
  userId: string,
  input: {
    title: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    bannerUrl?: string;
    category: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    challengeType:
      | "ONE_TIME"
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY"
      | "CUSTOM_DATE"
      | "TIME_BASED"
      | "PROGRESS_BASED"
      | "MILESTONE_BASED"
      | "COMPETITIVE"
      | "COLLABORATIVE";
    visibility: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY" | "COMMUNITY_ONLY";
    goal: number;
    xpReward: number;
    badgeReward?: string;
    rewardText?: string;
    rules?: string[];
    startDate?: string;
    endDate?: string;
  },
) {
  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  const endDate = input.endDate ? new Date(input.endDate) : null;
  if (endDate && endDate <= startDate) {
    throw new ValidationError("endDate must be after startDate");
  }
  const durationDays = endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 30;

  const challenge = await prisma.challenge.create({
    data: {
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      icon: input.icon,
      bannerUrl: input.bannerUrl,
      category: input.category,
      difficulty: input.difficulty,
      challengeType: input.challengeType,
      visibility: input.visibility,
      goal: input.goal,
      xpReward: input.xpReward,
      badgeReward: input.badgeReward,
      rewardText: input.rewardText,
      rules: input.rules ?? [],
      startDate,
      endDate,
      durationDays,
      daysLeft: durationDays,
      createdById: userId,
      progress: {
        create: {
          userId,
          progress: 0,
          completed: false,
        },
      },
      participantCount: 1,
    },
  });

  await addXp(userId, 20, "Challenge created", "challenge_create");
  await prisma.activity.create({
    data: {
      userId,
      type: "challenge_created",
      description: `Created challenge: ${challenge.title}`,
      metadata: { challengeId: challenge.id },
    },
  });

  return challenge;
}

export async function updateChallenge(
  userId: string,
  challengeId: string,
  input: Prisma.ChallengeUpdateInput,
) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (challenge.createdById !== userId) throw new ForbiddenError("Only creator can edit challenge");
  return prisma.challenge.update({
    where: { id: challengeId },
    data: input,
  });
}

export async function deleteChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (challenge.createdById !== userId) throw new ForbiddenError("Only creator can delete challenge");
  await prisma.challenge.delete({ where: { id: challengeId } });
  return { success: true };
}

export async function duplicateChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new NotFoundError("Challenge not found");
  return prisma.challenge.create({
    data: {
      title: `${challenge.title} (Copy)`,
      description: challenge.description,
      imageUrl: challenge.imageUrl,
      icon: challenge.icon,
      bannerUrl: challenge.bannerUrl,
      category: challenge.category,
      difficulty: challenge.difficulty,
      challengeType: challenge.challengeType,
      visibility: challenge.visibility,
      goal: challenge.goal,
      xpReward: challenge.xpReward,
      badgeReward: challenge.badgeReward,
      rewardText: challenge.rewardText,
      rules: challenge.rules,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      durationDays: challenge.durationDays,
      daysLeft: challenge.daysLeft,
      createdById: userId,
    },
  });
}

export async function listChallenges(
  userId: string,
  input: {
    q?: string;
    category?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    challengeType?:
      | "ONE_TIME"
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY"
      | "CUSTOM_DATE"
      | "TIME_BASED"
      | "PROGRESS_BASED"
      | "MILESTONE_BASED"
      | "COMPETITIVE"
      | "COLLABORATIVE";
    visibility?: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY" | "COMMUNITY_ONLY";
    status?: "ACTIVE" | "COMPLETED" | "BOOKMARKED" | "CREATED";
    cursor?: string;
    limit: number;
  },
) {
  const where: Prisma.ChallengeWhereInput = {
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { description: { contains: input.q, mode: "insensitive" } },
            { category: { contains: input.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.difficulty ? { difficulty: input.difficulty } : {}),
    ...(input.challengeType ? { challengeType: input.challengeType } : {}),
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.status === "CREATED" ? { createdById: userId } : {}),
    ...(input.status === "ACTIVE"
      ? { progress: { some: { userId, completed: false } } }
      : {}),
    ...(input.status === "COMPLETED"
      ? { progress: { some: { userId, completed: true } } }
      : {}),
    ...(input.status === "BOOKMARKED"
      ? { bookmarks: { some: { userId } } }
      : {}),
  };

  const items = await prisma.challenge.findMany({
    where,
    include: {
      _count: { select: { comments: true, likes: true, bookmarks: true, progress: true } },
      progress: { where: { userId }, take: 1 },
      bookmarks: { where: { userId }, take: 1 },
    },
    orderBy: [{ createdAt: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });
  const hasMore = items.length > input.limit;
  const page = hasMore ? items.slice(0, input.limit) : items;

  return {
    items: page.map((c) => {
      const p = c.progress[0];
      const completion = p ? Math.min(100, Math.round((p.progress / Math.max(1, c.goal)) * 100)) : 0;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        imageUrl: c.imageUrl,
        icon: c.icon,
        bannerUrl: c.bannerUrl,
        category: c.category,
        difficulty: c.difficulty,
        challengeType: c.challengeType,
        visibility: c.visibility,
        goal: c.goal,
        xpReward: c.xpReward,
        badgeReward: c.badgeReward,
        participantCount: c.participantCount,
        daysLeft: c.daysLeft,
        completion,
        joined: Boolean(p),
        completed: p?.completed ?? false,
        progress: p?.progress ?? 0,
        commentsCount: c._count.comments,
        likesCount: c._count.likes,
        bookmarked: c.bookmarks.length > 0,
        createdAt: c.createdAt,
      };
    }),
    nextCursor: hasMore ? page[page.length - 1]?.id : null,
  };
}

export async function joinChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || !challenge.isActive) throw new NotFoundError("Challenge not found");

  const existing = await prisma.challengeProgress.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (existing) throw new ConflictError("Already joined");

  await prisma.challengeProgress.create({
    data: { challengeId, userId, progress: 0, completed: false },
  });
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { participantCount: { increment: 1 } },
  });
  await prisma.activity.create({
    data: {
      userId,
      type: "challenge_joined",
      description: `Joined challenge: ${challenge.title}`,
      metadata: { challengeId },
    },
  });

  return { success: true };
}

export async function leaveChallenge(userId: string, challengeId: string) {
  const existing = await prisma.challengeProgress.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (!existing) throw new NotFoundError("Challenge not joined");
  await prisma.challengeProgress.delete({
    where: { challengeId_userId: { challengeId, userId } },
  });
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { participantCount: { decrement: 1 } },
  });
  return { success: true };
}

export async function pauseChallenge(userId: string, challengeId: string, paused: boolean) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (challenge.createdById !== userId) throw new ForbiddenError("Only creator can modify");
  return prisma.challenge.update({
    where: { id: challengeId },
    data: { isPaused: paused },
  });
}

export async function checkinChallenge(
  userId: string,
  challengeId: string,
  input: { progress: number; note?: string; proofUrl?: string },
) {
  const [challenge, progress] = await Promise.all([
    prisma.challenge.findUnique({ where: { id: challengeId } }),
    prisma.challengeProgress.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    }),
  ]);
  if (!challenge) throw new NotFoundError("Challenge not found");
  if (!progress) throw new ValidationError("Join challenge first");
  if (progress.completed) throw new ValidationError("Challenge already completed");

  const newProgressValue = progress.progress + input.progress;
  const completed = newProgressValue >= challenge.goal;

  const result = await prisma.$transaction(async (tx) => {
    await tx.challengeCheckin.create({
      data: {
        challengeId,
        userId,
        progress: input.progress,
        note: input.note,
        proofUrl: input.proofUrl,
      },
    });

    const updated = await tx.challengeProgress.update({
      where: { challengeId_userId: { challengeId, userId } },
      data: {
        progress: newProgressValue,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    const xpAward = completed ? challenge.xpReward : Math.max(5, Math.floor(challenge.xpReward / 10));
    const xpState = await addXp(
      userId,
      xpAward,
      completed ? `Completed challenge: ${challenge.title}` : `Challenge check-in: ${challenge.title}`,
    );

    if (completed) {
      await tx.user.update({
        where: { id: userId },
        data: { challengesCompleted: { increment: 1 } },
      });
      await tx.notification.create({
        data: {
          userId,
          type: "CHALLENGE_COMPLETED",
          title: "Challenge completed!",
          body: `You completed ${challenge.title}`,
          data: { challengeId, xpAward },
        },
      });
      if (challenge.createdById && challenge.createdById !== userId) {
        emitToUser(challenge.createdById, {
          type: "social:notification",
          payload: { kind: "CHALLENGE_COMPLETED", challengeId, byUserId: userId },
        });
      }
    }

    await tx.activity.create({
      data: {
        userId,
        type: completed ? "challenge_completed" : "challenge_progress",
        description: completed
          ? `Completed challenge: ${challenge.title}`
          : `Progress update in ${challenge.title}`,
        xpEarned: xpAward,
        metadata: { challengeId, progress: updated.progress, goal: challenge.goal },
      },
    });

    await recomputeLeaderboards(tx, userId);
    await unlockAchievements(tx, userId);

    return { updated, xpState, completed };
  });

  emitToUser(userId, {
    type: "social:notification",
    payload: {
      kind: result.completed ? "CHALLENGE_COMPLETED" : "CHALLENGE_PROGRESS",
      challengeId,
    },
  });

  return {
    progress: result.updated.progress,
    completed: result.completed,
    xp: result.xpState.xp,
    level: result.xpState.level,
    completionPercent: Math.min(100, Math.round((result.updated.progress / Math.max(1, challenge.goal)) * 100)),
  };
}

async function recomputeLeaderboards(tx: Prisma.TransactionClient, userId: string) {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const periods = ["weekly", "monthly", "yearly", "all-time"] as const;
  for (const period of periods) {
    const before = new Date();
    if (period === "weekly") before.setDate(before.getDate() - 7);
    if (period === "monthly") before.setMonth(before.getMonth() - 1);
    if (period === "yearly") before.setFullYear(before.getFullYear() - 1);

    const periodXp =
      period === "all-time"
        ? user.xp
        : (
            await tx.xpHistory.aggregate({
              where: { userId, createdAt: { gte: before } },
              _sum: { amount: true },
            })
          )._sum.amount ?? 0;

    const activityCount = await tx.activity.count({
      where: period === "all-time" ? { userId } : { userId, createdAt: { gte: before } },
    });
    await tx.leaderboardEntry.upsert({
      where: { userId_period: { userId, period } },
      create: {
        userId,
        period,
        rank: 0,
        xp: periodXp,
        score: user.activityScore + activityCount,
      },
      update: {
        xp: periodXp,
        score: user.activityScore + activityCount,
      },
    });
  }
}

async function unlockAchievements(tx: Prisma.TransactionClient, userId: string) {
  const [completedCount, friendCount] = await Promise.all([
    tx.challengeProgress.count({ where: { userId, completed: true } }),
    tx.friendship.count({ where: { userId, blockedAt: null } }),
  ]);

  const achievements = await tx.achievement.findMany({
    where: { slug: { in: ["first-challenge", "ten-challenges", "first-friend"] } },
  });
  const unlocked = await tx.userAchievement.findMany({
    where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
  });
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  for (const achievement of achievements) {
    const shouldUnlock =
      (achievement.slug === "first-challenge" && completedCount >= 1) ||
      (achievement.slug === "ten-challenges" && completedCount >= 10) ||
      (achievement.slug === "first-friend" && friendCount >= 1);
    if (!shouldUnlock || unlockedIds.has(achievement.id)) continue;
    await tx.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    await addXp(userId, achievement.xpReward, `Achievement unlocked: ${achievement.name}`, "achievement");
    await tx.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: "Achievement unlocked",
        body: achievement.name,
        data: { achievementId: achievement.id },
      },
    });
  }
}

export async function toggleBookmark(userId: string, challengeId: string) {
  const existing = await prisma.challengeBookmark.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (existing) {
    await prisma.challengeBookmark.delete({
      where: { challengeId_userId: { challengeId, userId } },
    });
    return { bookmarked: false };
  }
  await prisma.challengeBookmark.create({
    data: { challengeId, userId },
  });
  return { bookmarked: true };
}

export async function addComment(userId: string, challengeId: string, content: string) {
  const comment = await prisma.challengeComment.create({
    data: { challengeId, userId, content },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
  return comment;
}

export async function toggleLike(userId: string, challengeId: string) {
  const existing = await prisma.challengeLike.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });
  if (existing) {
    await prisma.challengeLike.delete({
      where: { challengeId_userId: { challengeId, userId } },
    });
    return { liked: false };
  }
  await prisma.challengeLike.create({ data: { challengeId, userId } });
  return { liked: true };
}

export async function getChallengeDetail(userId: string, challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      progress: {
        where: { userId },
        take: 1,
      },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: { likes: true, comments: true, bookmarks: true, progress: true },
      },
      checkins: {
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });
  if (!challenge) throw new NotFoundError("Challenge not found");
  const p = challenge.progress[0];
  return {
    ...challenge,
    myProgress: p
      ? {
          progress: p.progress,
          completed: p.completed,
          completionPercent: Math.min(100, Math.round((p.progress / Math.max(1, challenge.goal)) * 100)),
        }
      : null,
  };
}

