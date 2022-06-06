import config from "config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { get } from "lodash";

import { CreateSessionInput } from "../schema/auth.schema";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import { findUserByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";

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

  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken({ userId: user._id });

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

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const message = "Could not refresh access token.";

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

  const accessToken = signAccessToken(user);

  res.cookie("accessToken", accessToken, {
    maxAge: config.get<number>("accessTokenCookieTtl"),
    httpOnly: true,
    domain: config.get<string>("domain"),
    path: "/",
    sameSite: "strict",
    secure: false,
  });

  return res
    .status(StatusCodes.OK)
    .send("Access token refreshed successfully.");
}
