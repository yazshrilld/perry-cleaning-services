import { costomencryDecryptInternalCRYPTOJS } from "../utils/costomencryDecryptInternalCRYPTOJS";
import { HttpStatusCode, getters } from "../config";
import {
  createHttpError,
  CustomWinstonLogger,
  errorHandler,
  responseObject,
} from "../utils";
import type { RequestHandler } from "express";
import moment from "moment";
import { sessionService } from "../services/model";

const checkServiceHealth: RequestHandler = (...rest) => {
  const res = rest[1];

  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addSession: RequestHandler = async (req, res) => {
  let statusCode = 503;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  try {
    // Simulate session creation logic
    const savedFeedback = req.body;
    const response = await sessionService.createSession(savedFeedback);
    const sessionId = `sess_${Date.now()}`; // Example session ID
    payload = { sessionId, ...response };
    statusCode = 200;
    message = "Session created successfully.";
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error creating session: ${(err as Error).message}`,
      "Session Creation Request",
    );
    message = (err as Error).message;
  }
  return responseObject({
    res,
    message,
    statusCode,
    payload,
  });
};

const fectchSessions: RequestHandler = async (req, res) => {
  const { conversationId } = req.params;
  let statusCode = 503;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  try {
    // Simulate fetching sessions logic
    const sessions = [
      {
        sessionId: "sess_1",
        createdAt: moment().subtract(2, "days").toISOString(),
      },
      {
        sessionId: "sess_2",
        createdAt: moment().subtract(1, "days").toISOString(),
      },
    ];
    payload = { sessions, conversationId };
    statusCode = 200;
    message = "Sessions fetched successfully.";
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error fetching sessions: ${(err as Error).message}`,
      "Fetch Sessions Request",
    );
    message = (err as Error).message;
  }
  return responseObject({
    res,
    message,
    statusCode,
    payload,
  });
};

export default {
  checkServiceHealth,
  addSession,
  fectchSessions,
};
