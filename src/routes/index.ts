import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/healthcheck", (_, res) => res.sendStatus(StatusCodes.OK));

export default router;
