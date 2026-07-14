import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  updateProfileSchema,
  onboardingSchema,
  uploadRequestSchema,
  settingsSchema,
} from "../validators/auth.validator.js";
import * as userService from "../services/user.service.js";
import { createPresignedUploadUrl } from "../services/storage.service.js";

const router = Router();

router.get("/users/me", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { getCurrentUser } = await import("../services/auth.service.js");
    const user = await getCurrentUser(authReq.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/users/me",
  authenticate,
  validateBody(updateProfileSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await userService.updateProfile(authReq.user!.id, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/users/onboarding",
  authenticate,
  validateBody(onboardingSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await userService.completeOnboarding(
        authReq.user!.id,
        req.body,
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

router.delete("/users/me", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await userService.softDeleteAccount(authReq.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/users/upload-url",
  authenticate,
  validateBody(uploadRequestSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await createPresignedUploadUrl({
        ...req.body,
        userId: authReq.user!.id,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/users/settings", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const settings = await userService.getSettings(authReq.user!.id);
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/users/settings",
  authenticate,
  validateBody(settingsSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const settings = await userService.updateSettings(
        authReq.user!.id,
        req.body,
      );
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
