import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    await createUser(body);

    return res.status(StatusCodes.CREATED).send("User created successfully.");
  } catch (e: any) {
    // error 11000 - user with this email already exists
    if (e.code === 11000)
      return res
        .status(StatusCodes.CONFLICT)
        .send("Account with this email already exists.");

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
  }
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.status(StatusCodes.OK).send(res.locals.user);
}
