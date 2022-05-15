import { Router } from "express";

import {
  createUserHandler,
  getCurrentUserHandler,
} from "../controller/user.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import { createUserSchema } from "../schema/user.schema";

const router = Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

router.get("/api/users/me", requireUser, getCurrentUserHandler);

export default router;
