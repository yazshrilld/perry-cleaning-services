import  { TokenIndexer } from "morgan";
import { IncomingMessage, ServerResponse } from "http";
import { CustomWinstonLogger } from "./CustomWinstonLogger";

const winstonStream = {
  write: (message: any) => {
    // Log the message as 'info' level to Winston
    CustomWinstonLogger("debug", message.trim(), "all inComming http request");
  },
};

// Logging function
export const customMorganLogger = (
  tokens: TokenIndexer<IncomingMessage, ServerResponse>,
  req: IncomingMessage,
  res: ServerResponse,
): string | null => {
  const logMessage = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
    "Request Body:",
    JSON.stringify((req as any).body || {}),
    "Response Body:",
    JSON.stringify((res as any).locals?.body || {}),
  ].join(" ");

  winstonStream.write(logMessage);
  return null; // Returning null because logging is handled manually
};
