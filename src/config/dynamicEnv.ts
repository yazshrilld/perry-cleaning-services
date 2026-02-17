import { AppUrlsType, Env } from "../types";
import dotenv from "dotenv";
import { logger } from "netwrap";

const isStaging = process.env.NODE_ENV;
// Define the appropriate environment prefix
const envPrefix = isStaging == "staging" ? "STAGING_" : "PRODUCTION_";


// Load the appropriate .env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

//dotenv.config();
logger(`Loaded environment: ${process.env.NODE_ENV}`);

const frontendUrls = () => process.env[`${envPrefix}APP_FRONTEND_URL`]!;

const backendUrls = ( urlFilter = "") => `${process.env[`${envPrefix}APP_BACKEND_URL`]}/${urlFilter}`;

const appUrls: AppUrlsType = {
  backendPort: process.env.APP_PORT,
  frontendUrl: frontendUrls(),
  backendUrl: backendUrls(),
  apiDocsUrl: process.env.API_DOC_URL!,
  callBackUrl: process.env[`${envPrefix}APP_FRONTEND_URL`]!,
  WEBSOCKET_URL: process.env["SOCKET_APP_URL"]!,
};



export const env: Env & {
  appUrls: AppUrlsType;
} = {
  NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
  CURRENT_LANGUAGE: process.env.CURRENT_LANGUAGE as Env["CURRENT_LANGUAGE"],
  APP_PORT: process.env.APP_PORT!,
  DATABASE_URI: process.env.DATABASE_URI!,
  jwtSecretKey: process.env[`${envPrefix}JWT_SECRET_KEY`]!,
  jwtVerificationTokenSecret:
    process.env[`${envPrefix}JWT_VERIFICATION_TOKEN_SECRET`]!,
  expireTime: process.env.EXPIRES_IN as
    | `${number}ms`
    | `${number}s`
    | `${number}m`
    | `${number}h`
    | `${number}d`
    | `${number}w`
    | `${number}y`,
  refreshExpireTime: process.env.REFRESH_EXPIRES_IN as
    | `${number}ms`
    | `${number}s`
    | `${number}m`
    | `${number}h`
    | `${number}d`
    | `${number}w`
    | `${number}y`,
  appUrls,
  postgressDBUrl: process.env[`${envPrefix}DATABASE_URL`]!,
  dialect: process.env[`${envPrefix}dialect`]!,
  POOL_MAX: process.env["POOL_MAX"]!,
  POOL_MIN: process.env["POOL_MIN"]!,
  POOL_ACQUIRE: process.env["POOL_ACQUIRE"]!,
  POOL_IDLE: process.env["POOL_IDLE"]!,
  appAESInSec: process.env[`${envPrefix}APP_AES_IN_SEC`]!,
  appAESInV: process.env[`${envPrefix}APP_AES_IN_V`]!,
  snederEmail: process.env["EMAIL_SENDER"]!,
  mailSentName: process.env["EMAIL_SENDER_NAME"] || "InternoPay",
  mailHost: process.env["MAIL_HOST"]!,
  mailUsername: process.env["EMAIL_USER"]!,
  mailPassword: process.env["EMAIL_PASS"]!,
  EDGE_RUNTIME: process.env["EDGE_RUNTIME"]!,
  OPENAI_API_KEY: process.env["OPENAI_API_KEY"]!,
  AI_TEMP: process.env["AI_TEMP"]!,
  AI_MAX_TOKENS: process.env["AI_MAX_TOKENS"]!,
  OPENAI_API_ORG: process.env["OPENAI_API_ORG"]!,
  googleClientId: process.env["GOOGLE_CLIENT_ID"]!,
  googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
  googleRedirectUrl: process.env["GOOGLE_REDIRECT_URL"]!, 
   APP_DESCRIPTION: process.env["APP_DESCRIPTION"]!,
  SHOULDENCRYPTRESPONSE: process.env["SHOULD_ENCRYPT_RESPONSE"] === "true",
  BASEPATH: process.env["BASEPATH"]!,
  ASSETSBASEPATH: process.env["ASSETSBASEPATH"]!, 
  bccEmail: process.env["BCC_EMAIL"] || "",
  ccEmail: process.env["CC_EMAIL"] || "",
  operationEmail: process.env["OPERATION_EMAIL"] || "",
  REJECT_UNAUTHORIZED:
    process.env[`${envPrefix}REJECT_UNAUTHORIZED`] === "true",
  APPCODE: process.env["APPCODE"]!,
  APPSECRET: process.env["APPSECRET"]!,
};
