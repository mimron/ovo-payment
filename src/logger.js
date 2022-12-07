import log4js from "log4js";

log4js.configure({
  appenders: {
    ovo: {
      type: "dateFile",
      filename: "logs/ovo.log",
      maxLogSize: 1024 * 1024 * 1024,
      numBackups: 30,
    },
    console: {
      type: "stdout",
    },
  },
  categories: {
    default: {
      appenders: ["ovo", "console"],
      level: "trace",
    },
  },
  pm2: true,
});

export const ovo_log = log4js.getLogger();
