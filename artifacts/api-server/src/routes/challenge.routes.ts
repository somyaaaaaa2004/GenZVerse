import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  challengeCheckinSchema,
  challengeCommentSchema,
  challengeCreateSchema,
  challengeListSchema,
  challengeUpdateSchema,
} from "../validators/challenge.validator.js";
import * as challengeService from "../services/challenge.service.js";

const router = Router();

const routeParam = (value: string | string[] | undefined): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0] as string;
  return "";
};

router.get("/challenges", authenticate, validateQuery(challengeListSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.listChallenges(authReq.user!.id, req.query as unknown as Parameters<typeof challengeService.listChallenges>[1]);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges", authenticate, validateBody(challengeCreateSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.createChallenge(authReq.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/challenges/:id", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.getChallengeDetail(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.patch("/challenges/:id", authenticate, validateBody(challengeUpdateSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.updateChallenge(authReq.user!.id, routeParam(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete("/challenges/:id", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.deleteChallenge(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/duplicate", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.duplicateChallenge(authReq.user!.id, routeParam(req.params.id));
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/join", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.joinChallenge(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/leave", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.leaveChallenge(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/pause", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.pauseChallenge(authReq.user!.id, routeParam(req.params.id), true);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/resume", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.pauseChallenge(authReq.user!.id, routeParam(req.params.id), false);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/checkin", authenticate, validateBody(challengeCheckinSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.checkinChallenge(authReq.user!.id, routeParam(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/bookmark", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.toggleBookmark(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/like", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.toggleLike(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/challenges/:id/comments", authenticate, validateBody(challengeCommentSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await challengeService.addComment(authReq.user!.id, routeParam(req.params.id), req.body.content);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;

