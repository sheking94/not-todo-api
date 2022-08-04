import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import authRoutes from "./auth.routes";
import todoRoutes from "./todo.routes";
import userRoutes from "./user.routes";

const router = Router();

router.get("/healthcheck", (_, res) => res.sendStatus(StatusCodes.OK));

router.use(authRoutes);
router.use(todoRoutes);
router.use(userRoutes);

export default router;
