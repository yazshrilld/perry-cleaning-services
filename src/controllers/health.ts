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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusCode =
      (error as any).status ||
      (error as any).response.data.status ||
      statusCode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message =
      errorHandler(error, null).message || (error as any).response?.data.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusCode =
      (error as any).status ||
      (error as any).response.data.status ||
      statusCode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message =
      errorHandler(error, null).message || (error as any).response?.data.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default {
  checkServiceHealth,
  internopayEncryption,
  internopayDEcryption,
};


