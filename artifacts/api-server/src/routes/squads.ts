import { Router } from "express";
import { db, squadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/squads", async (_req, res) => {
  const squads = await db.select().from(squadsTable).orderBy(squadsTable.xp).limit(20);
  res.json(squads);
});

router.get("/squads/featured", async (_req, res) => {
  const squads = await db.select().from(squadsTable).where(eq(squadsTable.isFeatured, true)).limit(6);
  res.json(squads);
});

router.post("/squads", async (req, res) => {
  const { name, description, category } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: "name and category are required" });
    return;
  }
  const [squad] = await db.insert(squadsTable).values({
    name,
    description,
    category,
    memberCount: 1,
    onlineCount: 1,
    xp: 0,
    isFeatured: false,
  }).returning();
  res.status(201).json(squad);
});

router.get("/squads/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [squad] = await db.select().from(squadsTable).where(eq(squadsTable.id, id)).limit(1);
  if (!squad) {
    res.status(404).json({ error: "Squad not found" });
    return;
  }
  res.json(squad);
});

export default router;
