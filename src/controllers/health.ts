import { costomencryDecryptInternalCRYPTOJS } from "../utils/costomencryDecryptInternalCRYPTOJS";
import { HttpStatusCode, getters } from "../config";
import {
   createHttpError,
  CustomWinstonLogger,
  errorHandler,
  responseObject,
  SIGNATURE,
} from "../utils";
import type { RequestHandler } from "express";
import moment from "moment"; 



const checkServiceHealth: RequestHandler = (...rest) => {
  
  const res = rest[1];

  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const internopayEncryption: RequestHandler = async (req, res) => {
  const stringData = req.body ? req.body : req;

  let statusCode = 503;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  const cypherMessage = JSON.stringify(stringData);

  try {
    const resPon = await costomencryDecryptInternalCRYPTOJS(
      "EN",
      cypherMessage,
      getters.getAppSecrets().aesSecertKey,
      getters.getAppSecrets().aesSecertIvKey,
    );

    if (resPon.status == false) throw createHttpError(resPon.payload, 422);
    let LogPayloadvalues = {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
      reqIp: req.ip,
      reqHeaders: req.headers,
      reqUrl: req.url ? req.url : req.originalUrl,
      reqHostname: req.hostname,
      reqMethod: req.method,
      reqStatusCode: req.statusCode,
      RequestType: "encryption",
      Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
      logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      payload: cypherMessage,
      response: resPon.payload,
    };
    statusCode = 200;
    message = "Successfully encrypted data.. ";
    payload = resPon;
    // Usage
    CustomWinstonLogger("info", LogPayloadvalues, "encryption Request");
    return responseObject({ res, statusCode, message, payload });
  } catch (error) {
     
    statusCode =
      (error as any).status ||
      (error as any).response.data.status ||
      statusCode;
     
    message =
      errorHandler(error, null).message || (error as any).response?.data.error;
     
    payload = (error as any).response?.data || payload;

    let LogPayloadvalues = {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
      reqIp: req.ip,
      reqHeaders: req.headers,
      reqUrl: req.url ? req.url : req.originalUrl,
      reqHostname: req.hostname,
      reqMethod: req.method,
      reqStatusCode: req.statusCode,
      RequestType: "encryption",
      Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
      logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      payload: payload,
      response: message,
    };

    // Usage
    CustomWinstonLogger("error", LogPayloadvalues, "encryption Request");

    return responseObject({ res, statusCode, message, payload });
  }
};

const internopayDEcryption: RequestHandler = async (req, res) => {
  const stringData = req.body.textData ? req.body.textData : req.body;
  let statusCode = 503;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  const cypherMessage = stringData;

  try {
    const resPon = await costomencryDecryptInternalCRYPTOJS(
      "DE",
      cypherMessage,
      getters.getAppSecrets().aesSecertKey,
      getters.getAppSecrets().aesSecertIvKey,
    );
    console.log(resPon,"hello see me here ................");
    if (resPon.status == false) throw createHttpError(resPon.payload, 422);
    let LogPayloadvalues = {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
      reqIp: req.ip,
      reqHeaders: req.headers,
      reqUrl: req.url ? req.url : req.originalUrl,
      reqHostname: req.hostname,
      reqMethod: req.method,
      reqStatusCode: req.statusCode,
      RequestType: "decryption",
      Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
      logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      payload: cypherMessage,
      response: resPon,
    };

    // Usage
    CustomWinstonLogger("info", LogPayloadvalues, "decryption Request");
    statusCode = 200;
    message = "Successfully decrypted data" + cypherMessage;
    payload = resPon;
    return responseObject({ res, statusCode, message, payload });
  } catch (error) {
     
    statusCode =
      (error as any).status ||
      (error as any).response.data.status ||
      statusCode;
     
    message =
      errorHandler(error, null).message || (error as any).response?.data.error;
     
    payload = (error as any).response?.data || payload;
    let LogPayloadvalues = {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
      reqIp: req.ip,
      reqHeaders: req.headers,
      reqUrl: req.url ? req.url : req.originalUrl,
      reqHostname: req.hostname,
      reqMethod: req.method,
      reqStatusCode: req.statusCode,
      RequestType: "decryption",
      Url: req.headers ? req.headers.host : getters.getAppUrls().backendUrl,
      logged_in_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      payload: payload,
      response: message,
    };

    // Usage
    CustomWinstonLogger("error", LogPayloadvalues, "decryption Request");
    return responseObject({ res, statusCode, message, payload });
  }
};

const generateRequestSignature: RequestHandler = async (_req, res) => {
  let statusCode = 500;
  let message = "Unable to generate request signature";
  let payload: any = null;

  try {
    const env = (getters.getNodeEnv() || "").toLowerCase();
    const allowed = ["development", "dev", "staging", "test"];
    if (!allowed.includes(env)) {
      return responseObject({
        res,
        statusCode: 403,
        message: "Signature helper is disabled in production",
      });
    }

    const { GETAPPCODE: appCode, GETAPPSECRET: secret } = getters.getAppSecrets();
    const tags = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const signature = await SIGNATURE(appCode, secret, new Date(), tags);

    statusCode = 200;
    message = "Signature generated successfully";
    payload = {
      signature,
      format: "<sha512_hex>;<tags>",
      utcMinuteWindow: 1,
    };

    return responseObject({ res, statusCode, message, payload });
  } catch (error) {
    statusCode = (error as any)?.status || statusCode;
    message = errorHandler(error, null).message || message;
    return responseObject({ res, statusCode, message, payload });
  }
};


export default {
  checkServiceHealth,
  internopayEncryption,
  internopayDEcryption,
  generateRequestSignature,
};


