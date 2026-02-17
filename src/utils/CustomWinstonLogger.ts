import { createLogger, format, transports } from "winston";

// const { combine, timestamp, label, printf, json, colorize, simple } = format;

const logDate = new Date().toDateString();

export const CustomWinstonLogger = (
  type: "fatal" | "error" | "warn" | "info" | "debug",
  values: unknown,
  actionRequest: string,
): void => {
  const commonFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.label({ label: actionRequest }),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.label}] ${info.level}: ${JSON.stringify(info.message)}`,
    ),
  );
  const options = {
    file: {
      level: type,
      filename: `logs/${type}_logs/${actionRequest}_${logDate}.log`,
      handleExceptions: true,
      format: commonFormat,
    },
    console: {
      level: "debug",
      handleExceptions: true,
      format: format.combine(format.colorize(), commonFormat),
    },
  };
  const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  };

  const loggerW = createLogger({
    defaultMeta: {
      service: "interno-pay-service",
    },
    levels: logLevels,
    transports: [
      new transports.File(options.file),
      new transports.Console(options.console),
    ],
    exitOnError: false,
  });

  switch (type) {
  case "info":
    loggerW.info({ type: actionRequest, values });
    break;
  case "error":
    loggerW.error({ type: actionRequest, values });
    break;
  case "warn":
    loggerW.warn({ type: actionRequest, values });
    break;
  case "debug":
    loggerW.debug({ type: actionRequest, values });
    break;
  default:
    break;
  }
};
