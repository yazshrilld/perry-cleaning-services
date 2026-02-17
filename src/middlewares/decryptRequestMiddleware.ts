import { getters } from "../config";
import {
  costomencryDecryptInternalCRYPTOJS,
  createHttpError,
  CustomWinstonLogger,
  errorHandler,
  responseObject,
} from "../utils";
import { Request, Response, NextFunction } from "express";
import moment from "moment";

/**
 * Middleware to decrypt incoming requests.
 * @returns Middleware function for Express.
 */
// const decryptRequestMiddleware = () => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     if (req.body.textData) {
//       console.log("222222222222222222222222222")
//       const stringData = req.body.textData ? req.body.textData : req.body;

//        console.log(stringData, "stringData request body");
//       const cypherMessage = stringData;
//       let LogPayloadvalues = null,
//         statusCode = 503,
//         message = "Fatal error occurred";
//       let payload = null;

//       try {
//         // Validation check for textData
//         if (
//           typeof req.body.textData !== "string" ||
//           req.body.textData.trim() === ""
//         ) {
//           throw createHttpError(
//             "Invalid 'textData': must be a non-empty string.",
//             400,
//           );
//         }

//         // Decrypt the data
//         const resPon = await costomencryDecryptInternalCRYPTOJS(
//           "DE",
//           cypherMessage,
//           getters.getAppSecrets().aesSecertKey,
//           getters.getAppSecrets().aesSecertIvKey,
//         );
// console.log(resPon,"return value for decrypt");

//         if (resPon.status === false) {
//           throw createHttpError(resPon.payload, 422);
//         }

//         // Log the decryption request
//         LogPayloadvalues = {
//           reqBody: req.body,
//           reqParams: req.params,
//           reqQuery: req.query,
//           reqIp: req.ip,
//           reqHeaders: req.headers,
//           reqUrl: req.url ? req.url : req.originalUrl,
//           reqHostname: req.hostname,
//           reqMethod: req.method,
//           reqStatusCode: req.statusCode,
//           RequestType: "decryption",
//           Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
//           logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
//           payload: cypherMessage,
//           response: resPon,
//         };

//         CustomWinstonLogger("info", LogPayloadvalues, "decryption Request");

//         // Update the request body with the decrypted data
//         req.body = { ...resPon.payload }; // textData: req.body.textData
//  console.log(req.body,"new request body");
//         statusCode = 200;
//         next();
//       } catch (error) {
//         statusCode =
//           (error as any).status ||
//           (error as any).response?.data?.status ||
//           statusCode;
//         message =
//           errorHandler(error, null).message ||
//           (error as any).response?.data?.error;
//         payload = (error as any).response?.data || payload;

//         // Log the error
//         LogPayloadvalues = {
//           reqBody: req.body,
//           reqParams: req.params,
//           reqQuery: req.query,
//           reqIp: req.ip,
//           reqHeaders: req.headers,
//           reqUrl: req.url ? req.url : req.originalUrl,
//           reqHostname: req.hostname,
//           reqMethod: req.method,
//           reqStatusCode: req.statusCode,
//           RequestType: "decryption",
//           Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
//           logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
//           payload: payload,
//           response: message,
//         };

//         CustomWinstonLogger("error", LogPayloadvalues, "decryption Request");

//         // Send error response

//         return responseObject({ res, statusCode, message, payload});
//       }
//     } else {
//       next();
//     }
//   };
// };

const decryptRequestMiddleware = () => {
  let statusCode = 503;
  return async (req: Request, res: Response, next: NextFunction) => {
    const shouldDecrypt = shouldEncryptResponse(req, res); // Reuse the route filter

    const requiresEncryptedBody = isEncryptedBodyRequired(req.path);

    // Skip if route excluded or no encrypted data
    if (!shouldDecrypt || !req.body?.textData) {
      if (requiresEncryptedBody) {
        return responseObject({
          res,
          statusCode: 400,
          message: "Encrypted request body (textData) is required.",
          payload: null,
        });
      }
      res.locals.shouldEncrypt = false;
      return next();
    }
    console.log("Processing encrypted request...");

    const stringData = req.body.textData;
    console.log(stringData, "Encrypted stringData");

    let logPayload = null;
    const defaultErrorMessage = "Fatal error occurred during decryption";

    try {
      // Validation check for textData
      if (typeof stringData !== "string" || stringData.trim() === "") {
        throw createHttpError(
          "Invalid 'textData': must be a non-empty string.",
          400,
        );
      }

      // Decrypt the data
      const decryptResult = await costomencryDecryptInternalCRYPTOJS(
        "DE",
        stringData,
        getters.getAppSecrets().aesSecertKey,
        getters.getAppSecrets().aesSecertIvKey,
      );

      console.log(decryptResult, "Decryption result");

      if (!decryptResult.status) {
        throw createHttpError(
          decryptResult.payload || "Decryption failed",
          422,
        );
      }

      // Validate decrypted payload
      if (!decryptResult.payload || typeof decryptResult.payload !== "object") {
        throw createHttpError("Invalid decrypted payload format", 422);
      }

      // Log the decryption request (without sensitive data)
      logPayload = {
        reqParams: req.params,
        reqQuery: req.query,
        reqIp: req.ip,
        reqUrl: req.url || req.originalUrl,
        reqHostname: req.hostname,
        reqMethod: req.method,
        requestType: "decryption",
        url: req.headers?.host || getters.getAppUrls().backendUrl,
        logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        payloadLength: stringData.length,
        decryptionSuccess: true,
      };

      CustomWinstonLogger("info", logPayload, "Decryption Request Success");

      // Update the request body with the decrypted data
      req.body = { ...decryptResult.payload };
      console.log(req.body, "Decrypted request body");
      next();
    } catch (error) {
      const httpError = errorHandler(error, null);

      const message = httpError.message || defaultErrorMessage;

      // Log the error (without sensitive data)
      logPayload = {
        reqParams: req.params,
        reqQuery: req.query,
        reqIp: req.ip,
        reqUrl: req.url || req.originalUrl,
        reqHostname: req.hostname,
        reqMethod: req.method,
        requestType: "decryption",
        url: req.headers?.host || getters.getAppUrls().backendUrl,
        logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        payloadLength: stringData?.length || 0,
        decryptionSuccess: false,
        error: message,
      };

      CustomWinstonLogger("error", logPayload, "Decryption Request Failed");

      // Send error response
      return responseObject({
        res,
        statusCode,
        message,
        payload: null,
      });
    }
  };
};

/**
 * Determine if response should be encrypted
 */
const shouldEncryptResponse = (req: Request, res: Response): boolean => {
  // Don't encrypt if there's an error status
  if (res.statusCode >= 400) {
    return false;
  }

  // Don't encrypt if it's a health check or specific excluded routes
  const excludedPatterns = [
    /\/health(\/|$)/, // Matches /health, /health/, /health/anything
    /\/metrics(\/|$)/, // Matches /metrics, /metrics/, /metrics/anything
    /\/docs(\/|$)/,
    /\/api-docs(\/|$)/,
    /\/health\/decrypt$/,
    /\/health\/encrypt$/,
  ];

  console.log(req.path, "path.... start");

  if (excludedPatterns.some((pattern) => pattern.test(req.path))) {
    console.log("Path excluded from decryption");
    return false; // or return false depending on your middleware flow
  }

  // Check if client expects encrypted response (based on headers or request pattern)
  const expectsEncryption = true;
  // req.get("X-Expect-Encrypted") === "true" ||
  //req.body?.textData !== undefined; // If request was encrypted, response should be too

  return expectsEncryption;
};

const isEncryptedBodyRequired = (path: string): boolean => {
  const requiredPatterns = [
    /\/auth\/login$/, // /auth/login
    /\/auth\/register$/, // /auth/register
  ];

  return requiredPatterns.some((pattern) => pattern.test(path));
};

// const key = CryptoJS.lib.WordArray.random(32); // 16 bytes for AES-128 or 32 bytes for AES-256
// const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes for AES-128 or 32 bytes for AES-256

// const Securitykey = CryptoJS.enc.Base64.stringify(key);
// // crypto.randomBytes(16).toString("base64");
// //
// // Defining iv
// const initVector = CryptoJS.enc.Base64.stringify(iv);
// logger({ "Securitykey":Securitykey});
// logger({"initVector":initVector});

export { decryptRequestMiddleware };
