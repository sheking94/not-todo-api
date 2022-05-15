import { NextFunction, Request, Response } from "express";

import { verifyJwt } from "../utils/jwt";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const accessToken = (req.headers.authorization || "").replace(/^Bearer\s/, "");

  const accessToken = req.cookies.accessToken;

  const decoded = verifyJwt(accessToken, "accessTokenPublicKey");

  if (decoded) {
    res.locals.user = decoded;
  }

  return next();
};

export default deserializeUser;
