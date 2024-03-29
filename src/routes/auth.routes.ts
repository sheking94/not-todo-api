import { request, Router } from "express";

import {
  createSessionHandler,
  deleteSessionHandler,
  refreshSessionHandler,
} from "../controller/auth.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import { createSessionSchema } from "../schema/auth.schema";

const router = Router();

router.post(
  "/api/sessions",
  validateResource(createSessionSchema),
  createSessionHandler
);
router.delete("/api/sessions/logout", deleteSessionHandler);
router.post("/api/sessions/refresh", refreshSessionHandler);

export default router;
