import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import squadsRouter from "./squads";
import communitiesRouter from "./communities";
import challengesRouter from "./challenges";
import activitiesRouter from "./activities";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(dashboardRouter);
router.use(squadsRouter);
router.use(communitiesRouter);
router.use(challengesRouter);
router.use(activitiesRouter);

export default router;
