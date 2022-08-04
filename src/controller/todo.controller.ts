import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";

import { CreateToDoInput } from "../schema/todo.schema";
import { createToDo } from "../service/todo.service";

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
