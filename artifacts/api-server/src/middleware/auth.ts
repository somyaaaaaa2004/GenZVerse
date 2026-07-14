import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@workspace/db";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import type { UserRole } from "@prisma/client";

export interface AuthPayload {
  sub: string;
  role: UserRole;
  type: "access";
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    if (payload.type !== "access") {
      next(new UnauthorizedError("Invalid token type"));
      return;
    }
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken as string | undefined;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    if (payload.type === "access") {
      req.user = { id: payload.sub, role: payload.role };
    }
  } catch {
    // ignore invalid optional token
  }
  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}

export async function loadUser(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }

  const user = await prisma.user.findFirst({
    where: { id: req.user.id, deletedAt: null },
  });

  if (!user) {
    next(new UnauthorizedError());
    return;
  }

  next();
}
