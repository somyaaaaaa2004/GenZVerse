import { Router } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import * as outfitService from "../services/outfit.service.js";

const router = Router();
const routeParam = (value: string | string[] | undefined): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0] as string;
  return "";
};

const listSchema = z.object({
  styleTag: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  brand: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url(),
  styleTag: z.string().min(1).max(50),
  price: z.number().min(0).max(100000).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

const shareSchema = z.object({
  platform: z.enum(["whatsapp", "instagram", "facebook", "twitter", "linkedin", "copy", "native"]),
});

router.get("/outfits", authenticate, validateQuery(listSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const q = req.query as unknown as { styleTag?: string; cursor?: string; limit: number };
    const data = await outfitService.listOutfits(authReq.user!.id, q);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/outfits/dna", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.getStyleDna(authReq.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/outfits/trending", authenticate, async (_req, res, next) => {
  try {
    const data = await outfitService.getTrendingStyles();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/outfits", authenticate, validateBody(createSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.createOutfit(authReq.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/outfits/:id/like", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.toggleOutfitLike(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/outfits/:id/bookmark", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.toggleOutfitBookmark(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/outfits/:id/share", authenticate, validateBody(shareSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.shareOutfit(
      authReq.user!.id,
      routeParam(req.params.id),
      req.body.platform,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/outfits/:id/comments", authenticate, async (req, res, next) => {
  try {
    const data = await outfitService.listOutfitComments(routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/outfits/:id/comments", authenticate, validateBody(commentSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await outfitService.addOutfitComment(
      authReq.user!.id,
      routeParam(req.params.id),
      req.body.content,
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
