import { Router } from "express";

import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import {
  createToDoHandler,
  updateToDoHandler,
} from "../controller/todo.controller";
import { createToDoSchema, updateToDoSchema } from "../schema/todo.schema";

const router = Router();

router.post(
  "/api/todos",
  requireUser,
  validateResource(createToDoSchema),
  createToDoHandler
);
router.put(
  "/api/todos/:todoid",
  requireUser,
  validateResource(updateToDoSchema),
  updateToDoHandler
);

// router.get("/api/todos", requireUser, getCurrentUserToDosHandler);

export default router;
