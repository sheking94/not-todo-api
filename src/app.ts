require("dotenv").config();

import config from "config";

import logger from "./utils/logger";
import connectToDb from "./utils/connectToDb";
import createServer from "./utils/server";

const app = createServer();

const port = config.get<number>("port");

export default app.listen(port, async () => {
  logger.info(`Server running at http://localhost:${port}/`);
  await connectToDb();
});
