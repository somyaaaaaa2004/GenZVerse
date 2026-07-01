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
  const { passwordHash: _pw, passwordResetToken: _prt, passwordResetExpiry: _pre, ...rest } = user;
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

// Forgot password — generates a reset token stored in the DB.
// In production: email the reset link. Here: return it in the response for demo use.
router.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);

  // Always return success to avoid leaking whether an email is registered
  if (!user) {
    res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    return;
  }

  const resetToken = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.update(usersTable).set({
    passwordResetToken: resetToken,
    passwordResetExpiry: expiry,
  }).where(eq(usersTable.id, user.id));

  // Return the reset token so the frontend can build the reset URL
  // In production, this would be emailed instead
  res.json({
    success: true,
    message: "Reset link generated. Check your email (or use the resetToken below in dev).",
    resetToken,
  });
});

// Reset password — verifies the token and sets a new password
router.post("/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword || typeof token !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.passwordResetToken, token)).limit(1);

  if (!user || !user.passwordResetExpiry) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  if (new Date() > user.passwordResetExpiry) {
    res.status(400).json({ error: "Reset token has expired. Please request a new one." });
    return;
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt) + ":" + salt;

  await db.update(usersTable).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiry: null,
  }).where(eq(usersTable.id, user.id));

  res.json({ success: true, message: "Password updated successfully. You can now log in." });
});

export default router;
