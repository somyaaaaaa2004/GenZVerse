import { Router } from "express";
import { db, challengesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/challenges", async (_req, res) => {
  const challenges = await db.select().from(challengesTable).where(eq(challengesTable.isActive, true)).limit(20);
  res.json(challenges);
});

export default router;
