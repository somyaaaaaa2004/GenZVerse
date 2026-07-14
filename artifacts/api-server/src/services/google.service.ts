import { OAuth2Client } from "google-auth-library";
import { prisma } from "@workspace/db";
import type { Response } from "express";
import { env } from "../config/env.js";
import { ValidationError } from "../utils/errors.js";
import { sanitizeUser } from "../utils/password.js";
import {
  createTokenPair,
  hashRefreshToken,
} from "./token.service.js";
import { setAuthCookies } from "./auth.service.js";
import { createAuditLog } from "./audit.service.js";

function getClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new ValidationError("Google OAuth is not configured");
  }
  return new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );
}

export function getGoogleAuthUrl(state: string) {
  const client = getClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state,
    prompt: "consent",
  });
}

export async function handleGoogleCallback(
  code: string,
  req: { ip?: string; headers: Record<string, unknown> },
  res: Response,
) {
  const client = getClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new ValidationError("Google authentication failed");

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new ValidationError("Invalid Google account");
  }

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip;
  const userAgent = req.headers["user-agent"] as string | undefined;

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: payload.sub }, { email: payload.email }],
      deletedAt: null,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        emailVerified: payload.email_verified ?? true,
        emailVerifiedAt: payload.email_verified ? new Date() : null,
        googleId: payload.sub,
        authProvider: "GOOGLE",
        displayName: payload.name ?? payload.email.split("@")[0],
        avatarUrl: payload.picture,
        onboardingCompleted: false,
      },
    });
    await prisma.userSettings.create({ data: { userId: user.id } });
    await createAuditLog({
      userId: user.id,
      action: "USER_REGISTERED_GOOGLE",
      resource: "user",
      resourceId: user.id,
      ipAddress,
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: payload.sub,
        authProvider: "GOOGLE",
        avatarUrl: user.avatarUrl ?? payload.picture,
        emailVerified: true,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
    });
  }

  const { accessToken, refreshToken, refreshExpiresAt } = createTokenPair(
    user.id,
    user.role,
    false,
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      rememberMe: false,
      expiresAt: refreshExpiresAt,
      ipAddress,
      userAgent,
    },
  });

  setAuthCookies(res, accessToken, refreshToken, false);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ipAddress, presenceStatus: "ONLINE", lastSeenAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: "USER_LOGIN_GOOGLE",
    resource: "user",
    resourceId: user.id,
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  };
}
