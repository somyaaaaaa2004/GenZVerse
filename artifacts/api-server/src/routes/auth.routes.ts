import { Router } from "express";
import crypto from "node:crypto";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/google.service.js";
import { env } from "../config/env.js";

const router = Router();
const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

router.post(
  "/auth/register",
  authRateLimiter,
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.registerUser(req.body, req, res);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/auth/login",
  authRateLimiter,
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const result = await authService.loginUser(req.body, req, res);
      res.json({
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/auth/refresh", authRateLimiter, async (req, res, next) => {
  try {
    const refreshToken =
      (req.cookies?.refreshToken as string | undefined) ??
      (req.body?.refreshToken as string | undefined);
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Refresh token required" },
      });
      return;
    }
    const result = await authService.refreshTokens(refreshToken, req, res);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const refreshToken =
      (req.cookies?.refreshToken as string | undefined) ??
      (req.body?.refreshToken as string | undefined);
    const result = await authService.logoutUser(
      authReq.user!.id,
      refreshToken,
      res,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout-all", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await authService.logoutAllDevices(authReq.user!.id, res);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await authService.getCurrentUser(authReq.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/auth/forgot-password",
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/auth/reset-password",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  async (req, res, next) => {
    try {
      const result = await authService.resetPassword(
        req.body.token,
        req.body.newPassword,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/auth/verify-email",
  validateBody(verifyEmailSchema),
  async (req, res, next) => {
    try {
      const result = await authService.verifyEmail(
        req.body.token,
        req.body.email,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/auth/resend-verification",
  authRateLimiter,
  validateBody(resendVerificationSchema),
  async (req, res, next) => {
    try {
      const result = await authService.resendVerification(req.body.email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

// Legacy route aliases for backward compatibility during migration
router.post(
  "/auth/signup",
  authRateLimiter,
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const result = await authService.registerUser(req.body, req, res);
      res.status(201).json({
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/auth/google", (_req, res, next) => {
  try {
    if (!env.GOOGLE_CLIENT_ID) {
      res.status(503).json({
        success: false,
        error: { code: "NOT_CONFIGURED", message: "Google OAuth is not configured" },
      });
      return;
    }
    const state = crypto.randomUUID();
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      domain: env.COOKIE_DOMAIN,
      path: "/",
      maxAge: OAUTH_STATE_TTL_MS,
    });
    res.redirect(getGoogleAuthUrl(state));
  } catch (err) {
    next(err);
  }
});

router.get("/auth/google/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
    res.clearCookie(OAUTH_STATE_COOKIE, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      domain: env.COOKIE_DOMAIN,
      path: "/",
    });
    if (!code) {
      res.redirect(`${env.APP_URL}/login?error=google_auth_failed`);
      return;
    }
    if (!state || !expectedState || state !== expectedState) {
      res.redirect(`${env.APP_URL}/login?error=google_state_mismatch`);
      return;
    }
    const result = await handleGoogleCallback(code, req, res);
    const nextPath = result.user.onboardingCompleted ? "/dashboard" : "/onboarding";
    res.redirect(`${env.APP_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`);
  } catch (err) {
    next(err);
  }
});

export default router;
