import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate, loadUser } from "../middleware/auth.js";
import * as profileService from "../services/profile.service.js";

const router = Router();

router.get("/profile", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await profileService.getFullProfile(authReq.user!.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

router.get("/profile/friends", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const friends = await profileService.getFriends(authReq.user!.id);
    res.json({ success: true, data: friends });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/profile/achievements",
  authenticate,
  loadUser,
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const achievements = await profileService.getAchievements(
        authReq.user!.id,
      );
      res.json({ success: true, data: achievements });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/profile/sessions", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const sessions = await profileService.getSessions(authReq.user!.id);
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
});

router.get("/leaderboard", async (req, res, next) => {
  try {
    const period = (req.query.period as string) ?? "weekly";
    const data = await profileService.getLeaderboard(period);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/life-wrapped",
  authenticate,
  loadUser,
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await profileService.getLifeWrapped(authReq.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/public/stats", async (_req, res, next) => {
  try {
    const data = await profileService.getPublicStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
