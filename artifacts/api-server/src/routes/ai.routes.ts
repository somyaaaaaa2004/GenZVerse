import { Router } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate, loadUser } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as aiService from "../services/ai.service.js";

const router = Router();

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

router.get("/ai/messages", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const messages = await aiService.getAiMessages(authReq.user!.id);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/ai/messages",
  authenticate,
  loadUser,
  validateBody(messageSchema),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await aiService.sendAiMessage(
        authReq.user!.id,
        req.body.content,
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/ai/insights", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const insights = await aiService.getAiInsights(authReq.user!.id);
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
});

router.delete("/ai/messages", authenticate, loadUser, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await aiService.clearAiMessages(authReq.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
