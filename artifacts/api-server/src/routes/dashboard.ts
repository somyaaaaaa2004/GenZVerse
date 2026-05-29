import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  const authHeader = req.headers.authorization;
  let userId: number | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    userId = getUserIdFromToken(authHeader.slice(7));
  }

  if (userId) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user) {
      res.json({
        lifeScore: user.lifeScore,
        lifeScoreTrend: 12,
        productivityScore: Math.min(100, user.lifeScore + 5),
        productivityTrend: 8,
        socialScore: Math.min(100, user.lifeScore - 3),
        socialTrend: 15,
        learningScore: Math.min(100, user.lifeScore - 8),
        learningTrend: 5,
        financeScore: Math.min(100, user.lifeScore - 12),
        financeTrend: -2,
        styleScore: Math.min(100, user.lifeScore + 10),
        styleTrend: 20,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        tasksCompleted: 5,
        squadsJoined: 2,
        challengesWon: 1,
      });
      return;
    }
  }

  res.json({
    lifeScore: 87,
    lifeScoreTrend: 12,
    productivityScore: 78,
    productivityTrend: 8,
    socialScore: 82,
    socialTrend: 15,
    learningScore: 76,
    learningTrend: 5,
    financeScore: 71,
    financeTrend: -2,
    styleScore: 88,
    styleTrend: 20,
    streak: 29,
    xp: 2450,
    level: 12,
    tasksCompleted: 5,
    squadsJoined: 2,
    challengesWon: 1,
  });
});

router.get("/dashboard/activity", async (req, res) => {
  res.json([
    { id: 1, type: "task", description: "Completed 5 Tasks", xpEarned: 50, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: "squad", description: "Joined Startup Squad", xpEarned: 30, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, type: "upgrade", description: "Upgraded to Pro", xpEarned: null, createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 4, type: "read", description: "Read 20 Pages", xpEarned: 40, createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 5, type: "morning", description: "Morning Run", xpEarned: 60, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]);
});

export default router;
