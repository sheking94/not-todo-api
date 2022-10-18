import config from "config";
import { DocumentType } from "@typegoose/typegoose";
import { omit } from "lodash";

import SessionModel from "../model/session.model";
import { privateFields, User } from "../model/user.model";
import { signJwt } from "../utils/jwt";

export function createSession(userId: string) {
  return SessionModel.create({ user: userId });
}

export function signAccessToken(user: DocumentType<User>) {
  const payload = omit(user.toJSON(), privateFields);

  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
    expiresIn: config.get<string>("accessTokenTtl"),
  });

  return accessToken;
}

export async function signRefreshToken(userId: string) {
  const session = await createSession(userId);

  const refreshToken = signJwt(
    { session: session._id },
    "refreshTokenPrivateKey",
    { expiresIn: config.get<string>("refreshTokenTtl") }
  );

  return refreshToken;
}

export function findSessionById(id: string) {
  return SessionModel.findById(id);
}

export function deleteSessionById(id: string) {
  return SessionModel.deleteOne({ id });
}
