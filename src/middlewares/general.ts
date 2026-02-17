import { logger } from "netwrap";
import { getters, HttpStatusCode } from "../config";
import { createHttpError, errorHandler, responseObject } from "../utils";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const general: RequestHandler = async (req, res, next) => {
  let statusCode = HttpStatusCode.InternalServerError;
  let message = "Fatal error occurred";

  try {
    // Extract token from various sources
    let token = "";

    // Check for Authorization header
    const bearerHeader =
      req.headers["authorization"] || req.headers["Authorization"] || "";

    if (
      typeof bearerHeader === "string" &&
      bearerHeader.startsWith("Bearer ")
    ) {
      token = bearerHeader.slice(7).trim();
    } else if (typeof bearerHeader === "string") {
      token = bearerHeader;
    }

    // Fallbacks
    if (!token && typeof req.headers["x-authorization"] === "string") {
      token = req.headers["x-authorization"];
    }

    if (!token && req.cookies?.__session) {
      token = req.cookies.__session;
    }

    const accessTokenIndex = req.rawHeaders.indexOf("ACCESS_TOKEN");
    if (
      !token &&
      accessTokenIndex !== -1 &&
      accessTokenIndex < req.rawHeaders.length - 1
    ) {
      token = req.rawHeaders[accessTokenIndex + 1];
    }

    if (!token) {
      statusCode = HttpStatusCode.Unauthorized;
      throw createHttpError(
        "Unauthorized Access - No Token Provided!",
        statusCode,
      );
    }

    // Format token as Bearer token if needed
    const rawToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    const tokenOnly = rawToken.split("Bearer ")[1];

    // Verify token
    let decodedData: any;
    let verified = false;
    let tokenError = null;
    try {
      decodedData = jwt.verify(
        tokenOnly,
        getters.getAppSecrets().accessTokenSecret,
      );
      verified = true;
    } catch (err) {
      tokenError = err;
      // Try verificationTokenSecret if first one fails
      try {
        decodedData = jwt.verify(
          tokenOnly,
          getters.getAppSecrets().verificationTokenSecret,
        );
        verified = true;
      } catch (innerErr) {
        tokenError = innerErr;
      }
    }
    logger(decodedData);
    if (!verified) {
      statusCode = HttpStatusCode.Unauthorized;
      message = `${tokenError} --- Invalid token structure`;
      throw createHttpError(message, statusCode);
    }

    req.ACCESS_TOKEN = rawToken;
    req.currentTokenDetails = decodedData;
    req.USER_ROLES = decodedData.role;
    req.USER_ID = decodedData.userId;

    return next();
  } catch (err) {
    let errorResponse = errorHandler(
      err,
      null,
      message,
      "Token verification error",
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: {
        ...(errorResponse.payload || {}), // Use existing payload or empty object
        verified: false,
      },
    });
  }
};
