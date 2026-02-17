import { connect, connection, set } from "mongoose";
import { getters } from "./getters";
import { logger } from "netwrap";


const mongoDBConnectionString = getters.getDatabaseUrl().HOST;

const MAX_RETRIES = 50000;
const RETRY_DELAY_MS = 3000; // 3 seconds

const connectDB = async (
  DB_URI: string,
  retries = MAX_RETRIES,
): Promise<void> => {
  logger("Connecting to database...", {
    shouldLog: false,
    isError: false,
  });

  try {
    set("strictQuery", false);
    set("bufferCommands", false);
    set("autoIndex", true);
    set("debug", false);

    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };

    await connect(DB_URI, connectionOptions);
    // logger(`Mongoose connection options: ${JSON.stringify(connectionOptions)}`);
    // logger(`Mongoose connection string: ${DB_URI}`);
    logger("Database connection successful", {
      shouldLog: false,
      isError: false,
    });

    connection.on("connected", () => {
      logger("Mongoose connected to DB", {
        shouldLog: true,
        isError: false,
      });
    });

    connection.on("error", (error: Error) => {
      logger(`Mongoose connection error: ${error.message}`, {
        shouldLog: true,
        isError: true,
      });
    });

    connection.on("disconnected", () => {
      logger("Mongoose disconnected from DB", {
        shouldLog: true,
        isError: true,
      });
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    logger(`Database connection failed: ${errorMsg}`, {
      shouldLog: true,
      isError: true,
    });

    if (retries > 0) {
      logger(`Retrying to connect... attempts left: ${retries}`, {
        shouldLog: true,
        isError: false,
      });

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(DB_URI, retries - 1);
    } else {
      logger("Max retries reached. Exiting process.", {
        shouldLog: true,
        isError: true,
      });
      process.exit(1);
    }
  }
};

process.on("SIGINT", async () => {
  await connection.close();
  logger("Mongoose connection closed due to app termination", {
    shouldLog: true,
    isError: false,
  });
  process.exit(0);
});

export const mongooseLoader = async () =>
  await connectDB(mongoDBConnectionString);
