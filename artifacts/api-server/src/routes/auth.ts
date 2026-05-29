import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { SignupBody, LoginBody } from "@workspace/api-zod";

const router = Router();

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(userId: number): string {
  const payload = JSON.stringify({ userId, iat: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

export function getUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

function formatUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, ...rest } = user;
  return rest;
}

router.post("/auth/signup", async (req, res) => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password, fullName } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt) + ":" + salt;

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    fullName: fullName ?? null,
    lifeScore: 42,
    xp: 150,
    level: 1,
    streak: 0,
    onboardingCompleted: false,
    interests: [],
    goals: [],
  }).returning();

  const token = generateToken(user.id);
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const parts = user.passwordHash.split(":");
  if (parts.length !== 2) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const [hash, salt] = parts;
  const expectedHash = hashPassword(password, salt);
  if (hash !== expectedHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id);
  res.json({ token, user: formatUser(user) });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
