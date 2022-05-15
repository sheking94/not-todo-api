import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/healthcheck", (_, res) => res.sendStatus(StatusCodes.OK));

router.use(userRoutes);
router.use(authRoutes);

export default router;
