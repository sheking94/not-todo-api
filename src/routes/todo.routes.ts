import { Router } from "express";

import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import { createToDoHandler } from "../controller/todo.controller";
import { createToDoSchema } from "../schema/todo.schema";

const router = Router();

router.post(
  "/api/todos",
  requireUser,
  validateResource(createToDoSchema),
  createToDoHandler
);

// router.get("/api/todos", requireUser, getCurrentUserToDosHandler);

export default router;
