import { logger } from "netwrap";
import { getters } from "../config";
import {
  costomencryDecryptInternalCRYPTOJS,
} from "../utils";
import { Request, Response, NextFunction } from "express";
 
 
/**
 * Middleware to encrypt outgoing responses
 */
const encryptResponseMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
 
    // Override res.json
    (res as any).json = async (body: any): Promise<void> => {
      try {
        if (getters.getAppSecrets().SHOULDENCRYPTRESPONSE == true && shouldEncryptResponse(req, res)) {
          // console.log("Response before encryption:", body);
          // console.log("Encrypting response...");
 
          const encryptedResponse = await encryptResponseBody(body);
          //  console.log("Encrypted response:", encryptedResponse);
 
          res.setHeader("X-Content-Encrypted", "true");
          res.setHeader("Content-Type", "application/json");
 
          // Send encrypted result
          originalJson({
            status:body.status,
            code:body.code,
            encrypted: true,
            textData: encryptedResponse,
            timestamp: new Date().toISOString(),
          });
        } else {
        //  console.log("Skipping encryption for this response.");
          res.setHeader("X-Content-Encrypted", "false");
          res.setHeader("Content-Type", "application/json");
 
          originalJson({
            ...body,
            encrypted: false,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error: any) {
        logger("Response encryption error:", error);
        res.setHeader("X-Content-Encrypted", "false");
        originalJson({
          ...body,
          encryptionError: true,
          errorMessage: error?.message || "Encryption failed",
          encrypted: false,
          timestamp: new Date().toISOString(),
        });
      }
    };
 
    next();
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
    /\/feeds(\/|$)/,
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
 
/**
 * Encrypt the response body
 */
const encryptResponseBody =async (body: any) => {
  try {
    // Convert body to string for encryption
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);
 
    // Use your existing encryption function
    const encryptionResult:any = await costomencryDecryptInternalCRYPTOJS(
      "EN", // Encrypt mode
      bodyString,
      getters.getAppSecrets().aesSecertKey,
      getters.getAppSecrets().aesSecertIvKey,
    );
    console.log("Encryption result:", encryptionResult);
    if (encryptionResult.status === false) {
      throw new Error(encryptionResult.payload as string);
    }
 
    return encryptionResult.payload as string;
  } catch (error:any) {
    logger("Encryption error:", error);
    throw new Error("Failed to encrypt response");
  }
};
 
/**
 * Utility function to manually encrypt any data (for use in controllers if needed)
 */
export const encryptData =async (data: any) => {
  return encryptResponseBody(data);
};
 
export { encryptResponseMiddleware };