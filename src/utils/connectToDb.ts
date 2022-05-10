import config from "config";
import logger from "./logger";
import mongoose from "mongoose";

async function connectToDb() {
  const dbUri = config.get<string>("dbUri");

  try {
    await mongoose.connect(dbUri);
    logger.info("Connected to DB.");
  } catch (e: any) {
    logger.error(e.message);
    process.exit(1);
  }
}

export default connectToDb;
