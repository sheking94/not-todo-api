import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

import { CreateToDoInput, UpdateToDoInput } from "../schema/todo.schema";
import {
  createToDo,
  findToDoById,
  findToDosByUserId,
  updateToDo,
} from "../service/todo.service";

export async function createToDoHandler(
  req: Request<{}, {}, CreateToDoInput>,
  res: Response
) {
  const description = req.body.description;
  const userId = res.locals.user._id;

  const toDo = await createToDo({ userId, description });

  return res.status(StatusCodes.CREATED).send({
    message: "ToDo created successfully.",
    todo: toDo,
  });
}

export async function getToDosHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const toDos = await findToDosByUserId(userId);

  return res.status(StatusCodes.OK).send({
    todos: toDos,
  });
}

export async function updateToDoHandler(
  req: Request<{ todoid: string }, {}, UpdateToDoInput>,
  res: Response
) {
  const toDoId = req.params.todoid;
  const description = req.body.description;
  const done = req.body.done;
  const userId = res.locals.user._id;

  // find ToDo, check if exists
  const toDo = await findToDoById(toDoId);

  if (!toDo) return res.status(StatusCodes.NOT_FOUND).send("ToDo not found.");

  // check if todo's userId matches current user's id
  if (toDo.user && toDo.user.toString() !== userId.toString())
    return res
      .status(StatusCodes.FORBIDDEN)
      .send("No rights to update this ToDo.");

  // update ToDo
  const toDoUpdated = await updateToDo({ toDoId, description, done });

  return res.status(StatusCodes.OK).send({
    message: "ToDo updated successfully.",
    todo: toDoUpdated,
  });
}
