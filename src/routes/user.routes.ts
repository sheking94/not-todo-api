import { Router } from "express";

import { createUserHandler } from "../controller/user.controller";
import validateResource from "../middleware/validateResource";
import { createUserSchema } from "../schema/user.schema";

const router = Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

export default router;
