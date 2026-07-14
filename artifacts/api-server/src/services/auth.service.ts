import { prisma } from "@workspace/db";
import type { Response } from "express";
import { env } from "../config/env.js";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from "../utils/errors.js";
import { hashPassword, verifyPassword, sanitizeUser } from "../utils/password.js";
import {
  createTokenPair,
  generateSecureToken,
  hashRefreshToken,
  hashSecureToken,
} from "../services/token.service.js";
import {
  sendEmail,
  buildVerificationEmail,
  buildPasswordResetEmail,
} from "../services/email.service.js";
import { createAuditLog } from "../services/audit.service.js";
import { consumeInviteOnSignup } from "./social.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN,
  path: "/",
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean,
) {
  res.cookie("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
}

function getClientMeta(req: { ip?: string; headers: Record<string, unknown> }) {
  return {
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip ??
      undefined,
    userAgent: req.headers["user-agent"] as string | undefined,
  };
}

async function recordLogin(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  suspicious = false,
) {
  await prisma.loginHistory.create({
    data: { userId, ipAddress, userAgent, success, suspicious },
  });
}

async function detectSuspiciousLogin(
  userId: string,
  ipAddress?: string,
): Promise<boolean> {
  if (!ipAddress) return false;
  const recent = await prisma.loginHistory.findMany({
    where: {
      userId,
      success: true,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  const knownIps = new Set(recent.map((r) => r.ipAddress).filter(Boolean));
  return knownIps.size > 0 && !knownIps.has(ipAddress);
}

async function createSession(
  userId: string,
  role: import("@prisma/client").UserRole,
  rememberMe: boolean,
  ipAddress?: string,
  userAgent?: string,
) {
  const tokens = createTokenPair(userId, role, rememberMe);
  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashRefreshToken(tokens.refreshToken),
      rememberMe,
      expiresAt: tokens.refreshExpiresAt,
      ipAddress,
      userAgent,
    },
  });
  return tokens;
}

async function generateUniqueUsername(email: string, preferred?: string): Promise<string> {
  const sanitize = (value: string) =>
    value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";

  let base = preferred ? sanitize(preferred) : sanitize(email.split("@")[0] ?? "user");
  let candidate = base;
  let suffix = 0;

  while (await prisma.user.findFirst({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
}

export async function registerUser(
  data: {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
    inviteCode?: string;
    emailInviteToken?: string;
  },
  req: { ip?: string; headers: Record<string, unknown> },
  res: Response,
) {
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Email already in use");

  if (data.username) {
    const usernameTaken = await prisma.user.findFirst({
      where: { username: data.username },
    });
    if (usernameTaken) throw new ConflictError("Username already in use");
  }

  const verificationToken = generateSecureToken();
  const passwordHash = await hashPassword(data.password);
  const username = data.username ?? (await generateUniqueUsername(email));

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: data.displayName ?? null,
      emailVerificationToken: hashSecureToken(verificationToken),
      emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      settings: { create: {} },
    },
  });

  const emailContent = buildVerificationEmail(verificationToken, email);
  await sendEmail({ to: email, ...emailContent });
  await consumeInviteOnSignup(data.inviteCode, user.id, data.emailInviteToken);

  const meta = getClientMeta(req);
  const session = await createSession(
    user.id,
    user.role,
    false,
    meta.ipAddress,
    meta.userAgent,
  );

  setAuthCookies(res, session.accessToken, session.refreshToken, false);

  await createAuditLog({
    userId: user.id,
    action: "USER_REGISTERED",
    resource: "user",
    resourceId: user.id,
    ipAddress: meta.ipAddress,
  });

  return {
    user: sanitizeUser(user),
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

export async function loginUser(
  data: { identifier: string; password: string; rememberMe?: boolean },
  req: { ip?: string; headers: Record<string, unknown> },
  res: Response,
) {
  const identifier = data.identifier.trim();
  const normalized = identifier.toLowerCase();
  const isEmail = identifier.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: normalized, deletedAt: null }
      : { username: identifier, deletedAt: null },
  });

  const meta = getClientMeta(req);

  if (!user || !user.passwordHash) {
    if (user) {
      await recordLogin(user.id, false, meta.ipAddress, meta.userAgent);
    }
    throw new UnauthorizedError("Invalid credentials");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new UnauthorizedError("Account temporarily locked. Try again later.");
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const updates: { failedLoginAttempts: number; lockedUntil?: Date } = {
      failedLoginAttempts: attempts,
    };
    if (attempts >= env.ACCOUNT_LOCKOUT_THRESHOLD) {
      updates.lockedUntil = new Date(Date.now() + env.ACCOUNT_LOCKOUT_DURATION_MS);
    }
    await prisma.user.update({ where: { id: user.id }, data: updates });
    await recordLogin(user.id, false, meta.ipAddress, meta.userAgent);
    throw new UnauthorizedError("Invalid credentials");
  }

  const suspicious = await detectSuspiciousLogin(user.id, meta.ipAddress);
  await recordLogin(user.id, true, meta.ipAddress, meta.userAgent, suspicious);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: meta.ipAddress,
      presenceStatus: "ONLINE",
      lastSeenAt: new Date(),
    },
  });

  const session = await createSession(
    user.id,
    user.role,
    data.rememberMe ?? false,
    meta.ipAddress,
    meta.userAgent,
  );

  setAuthCookies(res, session.accessToken, session.refreshToken, data.rememberMe ?? false);

  await createAuditLog({
    userId: user.id,
    action: suspicious ? "LOGIN_SUSPICIOUS" : "LOGIN_SUCCESS",
    resource: "session",
    ipAddress: meta.ipAddress,
  });

  return {
    user: sanitizeUser(user),
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    suspiciousLogin: suspicious,
  };
}

export async function refreshTokens(
  refreshToken: string,
  req: { ip?: string; headers: Record<string, unknown> },
  res: Response,
) {
  const tokenHash = hashRefreshToken(refreshToken);
  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session || session.user.deletedAt) {
    const reused = await prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: { not: null },
      },
    });
    if (reused) {
      await prisma.session.updateMany({
        where: { userId: reused.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await createAuditLog({
        userId: reused.userId,
        action: "REFRESH_TOKEN_REUSE",
        resource: "session",
        ipAddress: getClientMeta(req).ipAddress,
      });
    }
    throw new UnauthorizedError("Invalid refresh token");
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await createSession(
    session.userId,
    session.user.role,
    session.rememberMe,
    session.ipAddress ?? undefined,
    session.userAgent ?? undefined,
  );

  setAuthCookies(res, tokens.accessToken, tokens.refreshToken, session.rememberMe);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: sanitizeUser(session.user),
  };
}

export async function logoutUser(
  userId: string,
  refreshToken: string | undefined,
  res: Response,
) {
  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.session.updateMany({
      where: { userId, refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await prisma.user.update({
    where: { id: userId },
    data: { presenceStatus: "OFFLINE", lastSeenAt: new Date() },
  });
  clearAuthCookies(res);
  await createAuditLog({ userId, action: "LOGOUT", resource: "session" });
  return { success: true };
}

export async function logoutAllDevices(userId: string, res: Response) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { presenceStatus: "OFFLINE", lastSeenAt: new Date() },
  });
  clearAuthCookies(res);
  await createAuditLog({ userId, action: "LOGOUT_ALL", resource: "session" });
  return { success: true };
}

export async function forgotPassword(email: string) {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null },
  });

  if (user) {
    const token = generateSecureToken();
    const tokenHash = hashSecureToken(token);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const emailContent = buildPasswordResetEmail(token);
    await sendEmail({ to: normalized, ...emailContent });
  }

  return {
    success: true,
    message: "If that email exists, a reset link has been sent.",
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashSecureToken(token);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpiry: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) throw new ValidationError("Invalid or expired reset token");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: "PASSWORD_RESET",
    resource: "user",
    resourceId: user.id,
  });

  return { success: true, message: "Password updated successfully." };
}

export async function verifyEmail(token: string, email: string) {
  const tokenHash = hashSecureToken(token);

  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      emailVerificationToken: tokenHash,
      emailVerificationExpiry: { gt: new Date() },
      deletedAt: null,
    },
  });

  if (!user) throw new ValidationError("Invalid or expired verification token");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  return { success: true, user: sanitizeUser(updated) };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim(), deletedAt: null },
  });

  if (!user) {
    return { success: true, message: "If that email exists, a verification link has been sent." };
  }

  if (user.emailVerified) {
    throw new ValidationError("Email is already verified");
  }

  const token = generateSecureToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashSecureToken(token),
      emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const emailContent = buildVerificationEmail(token, user.email);
  await sendEmail({ to: user.email, ...emailContent });

  return { success: true, message: "Verification email sent." };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: {
      achievements: { include: { achievement: true } },
      settings: true,
    },
  });
  if (!user) throw new NotFoundError("User not found");
  return sanitizeUser(user);
}
