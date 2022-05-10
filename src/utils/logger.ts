import config from "config";
import dayjs from "dayjs";
import pino from "pino";

const level = config.get<string>("logLevel");

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  level,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default logger;
