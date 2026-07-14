import type { Request, Response, NextFunction } from "express";
import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { env } from "../config/env.js";
import { ForbiddenError } from "../utils/errors.js";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function signToken(token: string): string {
  const secret = env.CSRF_SECRET ?? env.JWT_ACCESS_SECRET;
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function issueCsrfToken(_req: Request, res: Response): string {
  const token = randomBytes(32).toString("hex");
  const signed = signToken(token);
  res.cookie(CSRF_COOKIE, signed, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
  });
  return token;
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken) {
    next(new ForbiddenError("CSRF token missing"));
    return;
  }

  const expected = signToken(headerToken);
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    next(new ForbiddenError("Invalid CSRF token"));
    return;
  }

  next();
}
