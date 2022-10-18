import config from "config";
import { Request, Response } from "express";
import { DocumentType } from "@typegoose/typegoose";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";

import { CreateSessionInput } from "../schema/auth.schema";
import { User } from "../model/user.model";
import {
  deleteSessionById,
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import { findUserByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";

async function createSessionHelper(res: Response, user: DocumentType<User>) {
  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user._id);

  res.cookie("accessToken", accessToken, {
    maxAge: config.get<number>("accessTokenCookieTtl"),
    httpOnly: true,
    domain: config.get<string>("domain"),
    path: "/",
    sameSite: "strict",
    secure: false,
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: config.get<number>("refreshTokenCookieTtl"),
    httpOnly: true,
    domain: config.get<string>("domain"),
    path: "/",
    sameSite: "strict",
    secure: false,
  });

  return res.status(StatusCodes.CREATED).send("Session created successfully.");
}

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid email or password.";

  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) return res.status(StatusCodes.UNAUTHORIZED).send(message);

  const isValid = await user.validatePassword(password);

  if (!isValid) return res.status(StatusCodes.UNAUTHORIZED).send(message);

  return createSessionHelper(res, user);
}

export async function refreshSessionHandler(req: Request, res: Response) {
  const message = "Could not refresh session.";

  // const refreshToken = get(req, "headers.x-refresh");

  const refreshToken = req.cookies.refreshToken;

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) return res.status(StatusCodes.UNAUTHORIZED).send(message);

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid)
    return res.status(StatusCodes.UNAUTHORIZED).send(message);

  const user = await findUserById(String(session.user));

  if (!user) return res.status(StatusCodes.UNAUTHORIZED).send(message);

  deleteSessionById(session._id);

  return createSessionHelper(res, user);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const message = "Could not log out.";

  const refreshToken = req.cookies.refreshToken;

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) return res.status(StatusCodes.UNAUTHORIZED).send(message);

  const session = await findSessionById(decoded.session);

  if (!session) return res.status(StatusCodes.NOT_FOUND).send(message);

  deleteSessionById(session._id);

  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  return res.status(StatusCodes.OK).send("Successfully logged out.");
}
