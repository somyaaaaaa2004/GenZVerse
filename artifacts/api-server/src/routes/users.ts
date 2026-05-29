import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUserIdFromToken } from "./auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function requireAuth(req: any, res: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return userId;
}

router.patch("/users/me", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { username, fullName, avatarUrl, age, occupation, bio, interests, goals } = req.body;

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (username !== undefined) updateData.username = username;
  if (fullName !== undefined) updateData.fullName = fullName;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (age !== undefined) updateData.age = age;
  if (occupation !== undefined) updateData.occupation = occupation;
  if (bio !== undefined) updateData.bio = bio;
  if (interests !== undefined) updateData.interests = interests;
  if (goals !== undefined) updateData.goals = goals;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
  res.json(formatUser(user));
});

router.post("/users/onboarding", async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const { username, age, occupation, interests, goals } = req.body;

  const updateData: Partial<typeof usersTable.$inferInsert> = {
    onboardingCompleted: true,
    lifeScore: 55,
    xp: 500,
    streak: 1,
  };
  if (username) updateData.username = username;
  if (age) updateData.age = age;
  if (occupation) updateData.occupation = occupation;
  if (interests) updateData.interests = interests;
  if (goals) updateData.goals = goals;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId)).returning();
  res.json(formatUser(user));
});

export default router;
