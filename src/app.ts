require("dotenv").config();

import express from "express";
import config from "config";

import logger from "./utils/logger";
import router from "./routes";
import connectToDb from "./utils/connectToDb";
import createServer from "./utils/server";

const app = createServer();

const port = config.get<number>("port");

app.listen(port, async () => {
  logger.info(`Server running at http://localhost:${port}/`);
  await connectToDb();
});
