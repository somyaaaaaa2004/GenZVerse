import { Router } from "express";
import { db, communitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/communities", async (_req, res) => {
  const communities = await db.select().from(communitiesTable).orderBy(communitiesTable.memberCount).limit(20);
  res.json(communities);
});

router.get("/communities/featured", async (_req, res) => {
  const communities = await db.select().from(communitiesTable).where(eq(communitiesTable.isFeatured, true)).limit(6);
  res.json(communities);
});

export default router;
