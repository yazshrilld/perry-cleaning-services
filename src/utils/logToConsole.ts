import { getAppCurrentEnvironment } from "../config";

export const logToConsole = (
  payload: any,
  title = "Log",
  shouldLog = false
) => {
  const currentEnvironment = getAppCurrentEnvironment();

  if (currentEnvironment !== "production" || shouldLog) {
    if (title) {
      return console.log(title, payload, shouldLog);
    } else {
      return console.log(payload);
    }
  }

  return console.log("All console logs are hidden in production mode");
};
