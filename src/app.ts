require("dotenv").config();

import express from "express";
import config from "config";

import logger from "./utils/logger";
import router from "./routes";
import connectToDb from "./utils/connectToDb";

const app = express();

app.use(express.json());

app.use(router);

const port = config.get<number>("port");

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
  connectToDb();
});
