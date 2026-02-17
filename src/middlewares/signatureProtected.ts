/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";

import { cache, getters } from "../config";
import {  createHttpError,  extractHeaders,  responseObject, SIGNATURE } from "../utils";
import { logger } from "netwrap";


export const signatureProtected: RequestHandler = async (req, res, next) => {
  let statusCode = 500;
  let message = "Fatal error occurred";
  let ttl=0;
  const appCode = getters.getAppSecrets().GETAPPCODE;
  const secret = getters.getAppSecrets().GETAPPSECRET;
  const { signature } = await extractHeaders(req.rawHeaders);

  try {
    const now = new Date();
    const minuteWindow = 1; // Acceptable range: current time ±2 minutes

    let valid = false;
    //  let usedTime: Date | null = null;
    const alreadyUsed = await cache.exists(signature);
    logger({ alreadyUsed });
    const [encryptedData, tags] = signature.split(";");
    logger({ encryptedData, tags });
    console.log({ appCode, secret });
    for (let offset = -minuteWindow; offset <= minuteWindow; offset++) {
      const checkTime = new Date(now.getTime() + offset * 60 * 1000);
      const expectedSignature = await SIGNATURE(
        appCode,
        secret,
        checkTime,
        tags,
      );
      const timestamp = Date.now();
      console.log(timestamp);
      //logToConsole({expectedSignature, signature});
      logger({ expectedSignature, signature, checkTime });
      if (expectedSignature === signature) {
        valid = true;
        //  usedTime = checkTime;
        if (alreadyUsed) {
          valid = false;
          statusCode = 401;
          message = "Request signature has already been used";
          throw createHttpError(message, statusCode);
        }
        ttl = Math.max(1, (minuteWindow - Math.abs(offset)) * 60); // at least 1 second
        console.log({ ttl });
        // Store signature in cache to prevent reuse
        await cache.set(signature, "used", ttl);
        break;
      }
    }


    if (!valid) {
      statusCode = 401;
      message =
        "Access denied. You are not welcome here. Unauthorized intrusion detected. 😡🔥👿";
      throw createHttpError(message, statusCode);
    }
   

    next();
  } catch (error) {
    logger(error);
    message = (error as any).message || message;
    return responseObject({ res, statusCode, message });
  }
};

// Add cleanup on process termination
process.on("SIGTERM", () => cache.destroy());
process.on("SIGINT", () => cache.destroy()); 