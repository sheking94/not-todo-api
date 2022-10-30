import { Router } from "express";

import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/validateResource";
import {
  createToDoHandler,
  deleteToDoHandler,
  getToDosHandler,
  updateToDoHandler,
} from "../controller/todo.controller";
import { createToDoSchema, updateToDoSchema } from "../schema/todo.schema";

const router = Router();

router.get("/api/todos", requireUser, getToDosHandler);
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
router.delete("/api/todos/:todoid", requireUser, deleteToDoHandler);

// router.get("/api/todos", requireUser, getCurrentUserToDosHandler);

export default router;
