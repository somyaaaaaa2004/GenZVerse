import { prisma } from "@workspace/db";
import { NotFoundError } from "../utils/errors.js";
import { sanitizeUser } from "../utils/password.js";

export async function getFriends(userId: string, limit = 24) {
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          lastLoginAt: true,
        },
      },
    },
  });

  return friendships.map((f) => ({
    id: f.friend.id,
    username: f.friend.username,
    displayName: f.friend.displayName,
    avatarUrl: f.friend.avatarUrl,
    isOnline:
      f.friend.lastLoginAt != null &&
      Date.now() - f.friend.lastLoginAt.getTime() < 15 * 60 * 1000,
  }));
}

export async function getAchievements(userId: string) {
  const earned = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
  });

  return earned.map((e) => ({
    id: e.achievement.id,
    slug: e.achievement.slug,
    name: e.achievement.name,
    description: e.achievement.description,
    iconUrl: e.achievement.iconUrl,
    xpReward: e.achievement.xpReward,
    earnedAt: e.earnedAt,
  }));
}

export async function getSessions(userId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    rememberMe: s.rememberMe,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
  }));
}

export async function getLeaderboard(period = "weekly", limit = 50) {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { period },
    orderBy: { rank: "asc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          level: true,
        },
      },
    },
  });

  if (entries.length > 0) return entries;

  const topUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { xp: "desc" },
    take: limit,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      level: true,
      xp: true,
      activityScore: true,
    },
  });

  return topUsers.map((u, i) => ({
    id: `${period}-${u.id}`,
    userId: u.id,
    period,
    rank: i + 1,
    xp: u.xp,
    score: u.activityScore,
    user: u,
  }));
}

export async function getLifeWrapped(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) throw new NotFoundError("User not found");

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [xpHistory, activities, achievements, challengeWins] = await Promise.all([
    prisma.xpHistory.findMany({
      where: { userId, createdAt: { gte: yearStart } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activity.findMany({
      where: { userId, createdAt: { gte: yearStart } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.userAchievement.count({
      where: { userId, earnedAt: { gte: yearStart } },
    }),
    prisma.challengeProgress.count({
      where: { userId, completed: true, completedAt: { gte: yearStart } },
    }),
  ]);

  const monthlyXp = Array.from({ length: 12 }, (_, month) => {
    const total = xpHistory
      .filter((x) => x.createdAt.getMonth() === month)
      .reduce((sum, x) => sum + x.amount, 0);
    return { month: month + 1, xp: total };
  });

  return {
    year: new Date().getFullYear(),
    lifeScore: user.lifeScore,
    level: user.level,
    xp: user.xp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    challengesCompleted: challengeWins,
    achievementsEarned: achievements,
    friendsCount: user.friendsCount,
    communitiesJoined: user.communitiesJoined,
    monthlyXp,
    topMoments: activities.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      xpEarned: a.xpEarned,
      createdAt: a.createdAt,
    })),
    scores: {
      life: user.lifeScore,
      productivity: user.productivityScore,
      social: user.socialScore,
      learning: user.learningScore,
      finance: user.financeScore,
      style: user.styleScore,
    },
  };
}

export async function getPublicStats() {
  const [userCount, communityCount, challengeCount, squadCount] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.community.count(),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.squad.count(),
    ]);

  return { userCount, communityCount, challengeCount, squadCount };
}

export async function getFullProfile(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!user) throw new NotFoundError("User not found");

  const [friends, achievements, recentActivity] = await Promise.all([
    getFriends(userId, 12),
    getAchievements(userId),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    user: sanitizeUser(user),
    friends,
    achievements,
    recentActivity,
  };
}
