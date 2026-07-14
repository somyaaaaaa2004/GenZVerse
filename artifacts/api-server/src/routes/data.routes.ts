import { Router } from "express";
import { prisma } from "@workspace/db";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateQuery } from "../middleware/validate.js";
import { paginationSchema } from "../validators/auth.validator.js";
import { ValidationError } from "../utils/errors.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.get(
  "/squads",
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const items = await prisma.squad.findMany({
        orderBy: { xp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/squads/featured", async (_req, res, next) => {
  try {
    const items = await prisma.squad.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { xp: "desc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/squads/:id", async (req, res, next) => {
  try {
    const squad = await prisma.squad.findUnique({ where: { id: req.params.id } });
    if (!squad) throw new NotFoundError("Squad not found");
    res.json(squad);
  } catch (err) {
    next(err);
  }
});

router.post("/squads", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, description, category } = req.body ?? {};
    if (!name || !category) {
      throw new ValidationError("Name and category are required");
    }
    const squad = await prisma.squad.create({
      data: {
        name,
        description: description ?? null,
        category,
        createdById: authReq.user!.id,
      },
    });
    res.status(201).json(squad);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/communities",
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const items = await prisma.community.findMany({
        orderBy: { memberCount: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/communities/featured", async (_req, res, next) => {
  try {
    const items = await prisma.community.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { memberCount: "desc" },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/activities", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const activities = await prisma.activity.findMany({
      where: { userId: authReq.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

export default router;
