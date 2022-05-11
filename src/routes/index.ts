import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import userRoutes from "./user.routes";

const router = Router();

router.get("/healthcheck", (_, res) => res.sendStatus(StatusCodes.OK));

router.use(userRoutes);

export default router;
