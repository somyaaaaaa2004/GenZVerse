import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function sanitizeUser<T extends Record<string, unknown>>(user: T) {
  const {
    passwordHash: _ph,
    passwordResetToken: _prt,
    passwordResetExpiry: _pre,
    emailVerificationToken: _evt,
    emailVerificationExpiry: _eve,
    failedLoginAttempts: _fla,
    lockedUntil: _lu,
    googleId: _gid,
    ...safe
  } = user as T & {
    passwordHash?: string;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    failedLoginAttempts?: number;
    lockedUntil?: Date;
    googleId?: string;
  };
  return safe;
}
