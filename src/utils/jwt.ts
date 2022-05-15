import config from "config";
import jwt from "jsonwebtoken";

export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  // const signingKey = Buffer.from(
  //   config.get<string>(keyName),
  //   "base64"
  // ).toString("ascii");

  // return jwt.sign(object, signingKey, {
  //   ...(options && options),
  //   algorithm: "RS256",
  // });

  return jwt.sign(object, config.get<string>(keyName), {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  // const publicKey = Buffer.from(config.get<string>(keyName), "base64").toString(
  //   "ascii"
  // );

  try {
    // const decoded = jwt.verify(token, publicKey) as T;
    const decoded = jwt.verify(token, config.get<string>(keyName)) as T;
    return decoded;
  } catch (e: any) {
    return null;
  }
}
