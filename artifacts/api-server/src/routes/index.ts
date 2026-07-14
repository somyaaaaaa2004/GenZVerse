import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import dataRoutes from "./data.routes.js";
import profileRoutes from "./profile.routes.js";
import aiRoutes from "./ai.routes.js";
import socialRoutes from "./social.routes.js";
import challengeRoutes from "./challenge.routes.js";
import outfitRoutes from "./outfit.routes.js";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(userRoutes);
router.use(dashboardRoutes);
router.use(dataRoutes);
router.use(profileRoutes);
router.use(aiRoutes);
router.use(socialRoutes);
router.use(challengeRoutes);
router.use(outfitRoutes);

export default router;
