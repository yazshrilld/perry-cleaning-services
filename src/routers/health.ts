// import { constants } from "../constants";
// import { RouteHandler } from "../types/route";
// import { joinUrls } from "../utils";
// import controllers from "../controllers";
// const serviceLoader: RouteHandler[] = [

//   {
//     path: joinUrls([constants.urls.health.check().path]),
//     method: constants.urls.health.check().method,
//     handlers: [controllers.health.checkServiceHealth],
//   },
//   {
//     path: joinUrls([constants.urls.health.encrytData().path]),
//     method: constants.urls.health.encrytData().method,
//     handlers: [controllers.health.internopayEncryption],
//   },
//   {
//     path: joinUrls([constants.urls.health.decryptData().path]),
//     method: constants.urls.health.decryptData().method,
//     handlers: [controllers.health.internopayDEcryption],
//   },
//   {
//   path: joinUrls([constants.urls.health.generateSignature().path]),
//   method: constants.urls.health.generateSignature().method,
//   handlers: [controllers.health.generateRequestSignature],
// },
// ];

// export default serviceLoader;

import { RequestHandler } from "express";
import { constants } from "../constants";
import { getters } from "../config";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";

// 10 requests per minute per IP for signature helper
const signatureRateWindowMs = 60 * 1000;
const signatureRateMax = 10;
const signatureRateStore = new Map<
  string,
  { count: number; windowStart: number }
>();

const rateLimitSignatureHelper: RequestHandler = (req, res, next) => {
  const ip = (req.ip || req.socket.remoteAddress || "unknown").toString();
  const now = Date.now();

  const existing = signatureRateStore.get(ip);
  if (!existing || now - existing.windowStart > signatureRateWindowMs) {
    signatureRateStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (existing.count >= signatureRateMax) {
    const retryAfterSec = Math.ceil(
      (signatureRateWindowMs - (now - existing.windowStart)) / 1000,
    );
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      status: false,
      message: "Too many signature requests. Try again shortly.",
      payload: null,
    });
  }

  existing.count += 1;
  signatureRateStore.set(ip, existing);
  next();
};

const allowSignatureHelperInNonProd: RequestHandler = (_req, res, next) => {
  const env = (getters.getNodeEnv() || "").toLowerCase();
  const allowed = ["development", "dev", "staging", "test"];

  if (!allowed.includes(env)) {
    return res.status(404).json({
      status: false,
      message: "Not Found",
      payload: null,
    });
  }

  next();
};

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.health.check().path]),
    method: constants.urls.health.check().method,
    handlers: [controllers.health.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.health.encrytData().path]),
    method: constants.urls.health.encrytData().method,
    handlers: [controllers.health.internopayEncryption],
  },
  {
    path: joinUrls([constants.urls.health.decryptData().path]),
    method: constants.urls.health.decryptData().method,
    handlers: [controllers.health.internopayDEcryption],
  },
  {
    path: joinUrls([constants.urls.health.generateSignature().path]),
    method: constants.urls.health.generateSignature().method,
    handlers: [
      allowSignatureHelperInNonProd,
      rateLimitSignatureHelper,
      controllers.health.generateRequestSignature,
    ],
  },
];

export default serviceLoader;
