import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@prisma/client";
import type { AuthPayload } from "../middleware/auth.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

function parseDuration(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[unit] ?? 86_400_000);
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashSecureToken(token: string): string {
  return hashRefreshToken(token);
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export function signAccessToken(userId: string, role: UserRole): string {
  const payload: AuthPayload = { sub: userId, role, type: "access" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions["expiresIn"],
  });
}

export function getRefreshExpiry(rememberMe: boolean): Date {
  const duration = rememberMe
    ? env.JWT_REFRESH_REMEMBER_EXPIRY
    : env.JWT_REFRESH_EXPIRY;
  return new Date(Date.now() + parseDuration(duration));
}

export function getAccessExpiry(): Date {
  return new Date(Date.now() + parseDuration(env.JWT_ACCESS_EXPIRY));
}

export function createTokenPair(
  userId: string,
  role: UserRole,
  rememberMe: boolean,
): TokenPair {
  const refreshToken = generateRefreshToken();
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken,
    accessExpiresAt: getAccessExpiry(),
    refreshExpiresAt: getRefreshExpiry(rememberMe),
  };
}
