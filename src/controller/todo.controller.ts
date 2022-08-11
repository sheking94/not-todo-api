import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

import { CreateToDoInput, UpdateToDoInput } from "../schema/todo.schema";
import { createToDo, updateToDo } from "../service/todo.service";

export async function createToDoHandler(
  req: Request<{}, {}, CreateToDoInput>,
  res: Response
) {
  const description = req.body.description;
  const userId = res.locals.user._id;

  try {
    const todo = await createToDo({ userId, description });

    return res.status(StatusCodes.CREATED).send({
      message: "ToDo created successfully.",
      todo: omit(todo.toJSON(), ["__v"]),
    });
  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
}

export async function updateToDoHandler(
  req: Request<{ todoid: string }, {}, UpdateToDoInput>,
  res: Response
) {
  const toDoId = req.params.todoid;
  const description = req.body.description;
  const done = req.body.done;
  const userId = res.locals.user._id;

  try {
    const todo = await updateToDo({ userId, toDoId, description, done });

    return res.status(StatusCodes.OK).send({
      message: "ToDo updated successfully.",
      todo: omit(todo.toJSON(), ["__v"]),
    });
  } catch (e: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
}
