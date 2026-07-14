import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import * as userService from "../services/user.service.js";

const router = Router();

router.get("/dashboard/stats", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const stats = await userService.getDashboardStats(authReq.user!.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard/activity", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const activities = await userService.getDashboardActivity(authReq.user!.id);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard/overview", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await userService.getDashboardOverview(authReq.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/notifications", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const notifications = await userService.getNotifications(authReq.user!.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

export default router;
