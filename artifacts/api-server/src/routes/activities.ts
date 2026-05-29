import { Router } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router = Router();

router.get("/activities", async (req, res) => {
  const authHeader = req.headers.authorization;
  let userId: number | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    userId = getUserIdFromToken(authHeader.slice(7));
  }

  if (userId) {
    const activities = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.userId, userId))
      .orderBy(desc(activitiesTable.createdAt))
      .limit(20);
    res.json(activities);
    return;
  }

  res.json([
    { id: 1, type: "task", description: "Completed morning routine", xpEarned: 50, createdAt: new Date().toISOString() },
    { id: 2, type: "squad", description: "Squad challenge accepted", xpEarned: 30, createdAt: new Date().toISOString() },
    { id: 3, type: "learn", description: "Finished design course module", xpEarned: 80, createdAt: new Date().toISOString() },
  ]);
});

export default router;
