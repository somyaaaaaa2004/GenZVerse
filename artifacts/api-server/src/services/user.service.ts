import { prisma } from "@workspace/db";
import type { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { sanitizeUser } from "../utils/password.js";
import { createAuditLog } from "./audit.service.js";

export async function updateProfile(
  userId: string,
  data: {
    username?: string;
    displayName?: string;
    bio?: string;
    country?: string;
    timezone?: string;
    interests?: string[];
    goals?: string[];
    avatarUrl?: string;
    bannerUrl?: string;
  },
) {
  if (data.username) {
    const taken = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });
    if (taken) throw new ValidationError("Username already taken");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      country: data.country,
      timezone: data.timezone,
      interests: data.interests,
      goals: data.goals,
      avatarUrl: data.avatarUrl,
      bannerUrl: data.bannerUrl,
    },
  });

  await createAuditLog({
    userId,
    action: "PROFILE_UPDATED",
    resource: "user",
    resourceId: userId,
  });

  return sanitizeUser(user);
}

export async function completeOnboarding(
  userId: string,
  data: { interests?: string[]; goals?: string[]; displayName?: string },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      interests: data.interests ?? [],
      goals: data.goals ?? [],
      displayName: data.displayName,
      xp: { increment: 100 },
    },
  });

  await prisma.xpHistory.create({
    data: {
      userId,
      amount: 100,
      reason: "Completed onboarding",
      source: "onboarding",
    },
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "onboarding",
      description: "Completed onboarding",
      xpEarned: 100,
    },
  });

  return sanitizeUser(user);
}

export async function softDeleteAccount(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), email: `deleted_${userId}@deleted.local` },
  });

  await createAuditLog({
    userId,
    action: "ACCOUNT_DELETED",
    resource: "user",
    resourceId: userId,
  });

  return { success: true };
}

export async function getDashboardStats(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) throw new NotFoundError("User not found");

  const [squadsJoined, challengesWon, tasksCompleted] = await Promise.all([
    prisma.communityMember.count({ where: { userId } }),
    prisma.challengeProgress.count({ where: { userId, completed: true } }),
    prisma.activity.count({
      where: { userId, type: { in: ["task", "challenge"] } },
    }),
  ]);

  return {
    lifeScore: user.lifeScore,
    productivityScore: user.productivityScore,
    socialScore: user.socialScore,
    learningScore: user.learningScore,
    financeScore: user.financeScore,
    styleScore: user.styleScore,
    xp: user.xp,
    level: user.level,
    streak: user.currentStreak,
    longestStreak: user.longestStreak,
    activityScore: user.activityScore,
    squadsJoined,
    challengesWon,
    tasksCompleted,
    friendsCount: user.friendsCount,
    communitiesJoined: user.communitiesJoined,
    challengesCompleted: user.challengesCompleted,
  };
}

export async function getDashboardActivity(userId: string, limit = 20) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDashboardOverview(userId: string) {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(dayStart);
  weekStart.setDate(dayStart.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { settings: true },
  });
  if (!user) throw new NotFoundError("User not found");

  const [
    todayActivity,
    weeklyActivity,
    monthlyActivity,
    activeChallenges,
    completedChallenges,
    recentNotifications,
    friendActivity,
    friendSuggestions,
    communitySuggestions,
    challengeSuggestions,
    achievementsCount,
    thisMonthXp,
  ] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, createdAt: { gte: dayStart } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.activity.findMany({
      where: { userId, createdAt: { gte: weekStart } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activity.findMany({
      where: { userId, createdAt: { gte: monthStart } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.challengeProgress.findMany({
      where: { userId, completed: false },
      include: { challenge: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.challengeProgress.findMany({
      where: { userId, completed: true },
      include: { challenge: true },
      orderBy: { completedAt: "desc" },
      take: 8,
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.activity.findMany({
      where: {
        user: {
          friendshipsAsUser: {
            some: { friendId: userId, blockedAt: null },
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
      take: 20,
    }),
    prisma.user.findMany({
      where: {
        id: { not: userId },
        deletedAt: null,
        interests: { hasSome: user.interests.slice(0, 5) },
      },
      orderBy: [{ xp: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        level: true,
        xp: true,
      },
    }),
    prisma.community.findMany({
      orderBy: [{ isFeatured: "desc" }, { memberCount: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        memberCount: true,
        category: true,
        imageUrl: true,
      },
    }),
    prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: [{ participantCount: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        xpReward: true,
        participantCount: true,
        goal: true,
      },
    }),
    prisma.userAchievement.count({ where: { userId } }),
    prisma.xpHistory.aggregate({
      where: { userId, createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  const weekByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = date.toDateString();
    const total = weeklyActivity
      .filter((a) => a.createdAt.toDateString() === key)
      .reduce((sum, a) => sum + (a.xpEarned ?? 0), 0);
    return { date: key, xp: total };
  });

  const monthByDay = Array.from({ length: now.getDate() }, (_, index) => {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() + index);
    const key = date.toDateString();
    const total = monthlyActivity
      .filter((a) => a.createdAt.toDateString() === key)
      .reduce((sum, a) => sum + (a.xpEarned ?? 0), 0);
    return { date: key, xp: total };
  });

  const completedThisWeek = completedChallenges.filter(
    (p) => p.completedAt && p.completedAt >= weekStart,
  ).length;
  const attemptedThisWeek = activeChallenges.length + completedThisWeek;

  return {
    summary: {
      todayProgress: todayActivity.reduce((sum, a) => sum + (a.xpEarned ?? 0), 0),
      dailyGoals: Math.min(100, Math.round((todayActivity.length / 5) * 100)),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      xp: user.xp,
      level: user.level,
      xpToNextLevel: Math.max(0, (user.level + 1) * (user.level + 1) * 100 - user.xp),
      thisMonthXp: thisMonthXp._sum.amount ?? 0,
      achievementsCount,
      completionRate:
        attemptedThisWeek === 0 ? 0 : Math.round((completedThisWeek / attemptedThisWeek) * 100),
    },
    weeklyActivity: weekByDay,
    monthlyActivity: monthByDay,
    activeChallenges: activeChallenges.map((p) => ({
      id: p.challenge.id,
      title: p.challenge.title,
      category: p.challenge.category,
      progress: p.progress,
      goal: p.challenge.goal,
      completionPercent: Math.min(
        100,
        Math.round((p.progress / Math.max(1, p.challenge.goal)) * 100),
      ),
      endDate: p.challenge.endDate,
      xpReward: p.challenge.xpReward,
    })),
    completedChallenges: completedChallenges.map((p) => ({
      id: p.challenge.id,
      title: p.challenge.title,
      completedAt: p.completedAt,
      xpReward: p.challenge.xpReward,
      category: p.challenge.category,
    })),
    notifications: recentNotifications,
    friendActivity,
    suggested: {
      friends: friendSuggestions,
      communities: communitySuggestions,
      challenges: challengeSuggestions,
    },
    quickActions: [
      { key: "create_challenge", label: "Create challenge", href: "/dashboard/challenges" },
      { key: "invite_friends", label: "Invite friends", href: "/dashboard/invites" },
      { key: "discover_people", label: "Discover friends", href: "/dashboard/social" },
    ],
    productivitySummary: {
      mostActiveDay: weekByDay.slice().sort((a, b) => b.xp - a.xp)[0]?.date ?? null,
      weeklyXp: weekByDay.reduce((sum, d) => sum + d.xp, 0),
      monthlyXp: monthByDay.reduce((sum, d) => sum + d.xp, 0),
      activityCountWeek: weeklyActivity.length,
      activityCountMonth: monthlyActivity.length,
    },
  };
}

export async function updateSettings(
  userId: string,
  data: Prisma.UserSettingsUncheckedUpdateInput,
) {
  const { userId: _ignoredUserId, ...rest } =
    data as Prisma.UserSettingsUncheckedUpdateInput & { userId?: string };
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: rest,
  });
}

export async function getSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}
