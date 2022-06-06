import {
  ACCESS_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from "./rsaKey";

export default {
  domain: "localhost",
  origin: "http://localhost:3301",
  port: 3301,
  dbUri: "mongodb://127.0.0.1:27017/not-todo",
  logLevel: "info",
  accessTokenTtl: "15m",
  refreshTokenTtl: "1y",
  accessTokenCookieTtl: 900000, // 15 min
  refreshTokenCookieTtl: 31557600000, // 1 year
  accessTokenPrivateKey: ACCESS_TOKEN_PRIVATE_KEY,
  accessTokenPublicKey: ACCESS_TOKEN_PUBLIC_KEY,
  refreshTokenPrivateKey: REFRESH_TOKEN_PRIVATE_KEY,
  refreshTokenPublicKey: REFRESH_TOKEN_PUBLIC_KEY,
};
