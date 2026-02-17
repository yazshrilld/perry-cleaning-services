import { constants } from "../constants";
import { env } from "./dynamicEnv";

const getCurrentLanguage = () => {
  if (!env.CURRENT_LANGUAGE) {
    return constants.defaults.currentLanguage as typeof env.CURRENT_LANGUAGE;
  }

  return env.CURRENT_LANGUAGE;
};

const geti18ns = () => {
  return constants.generalConstant[getCurrentLanguage()];
};

const getNodeEnv = () => {
  if (!env.NODE_ENV) {
    return constants.defaults.environment as typeof env.NODE_ENV;
  }

  return env.NODE_ENV;
};

const getAppPort = () => {
  if (!env.APP_PORT) {
    return constants.defaults.appPort;
  }

  return parseInt(env.APP_PORT);
};

const getDatabaseUri = () => {
  return env.DATABASE_URI;
};

const getAppSecrets = () => ({
  accessTokenSecret: env.jwtSecretKey,
  verificationTokenSecret: env.jwtVerificationTokenSecret,
  expireTime: env.expireTime,
  refreshExpiresIn: env.refreshExpireTime,
  aesSecertKey: env.appAESInSec,
  aesSecertIvKey: env.appAESInV,
  googleClientId: env.googleClientId,
  googleClientSecret: env.googleClientSecret,
  googleRedirectUrl: env.googleRedirectUrl,
  BASEPATH: env.BASEPATH,
  ASSETSBASEPATH: env.ASSETSBASEPATH, 
  bccEmail: env.bccEmail,
  ccEmail: env.ccEmail,
  operationEmail: env.operationEmail,
  REJECT_UNAUTHORIZED: env.REJECT_UNAUTHORIZED,
  GETAPPCODE: env.APPCODE,
  GETAPPSECRET: env.APPSECRET,
   APP_DESCRIPTION: env.APP_DESCRIPTION,
  SHOULDENCRYPTRESPONSE: env.SHOULDENCRYPTRESPONSE,
});

const getDatabaseUrl = () => ({
  HOST: env.postgressDBUrl,
  DIALECT: env.dialect,
  MAX: env.POOL_MAX,
  MIN: env.POOL_MIN,
  ACQUIRE: env.POOL_ACQUIRE,
  IDLE: env.POOL_IDLE,
  
});

const getAppMailers = () => ({
  mailSentFrom: env.snederEmail,
  mailSentName: env.mailSentName,
  server: env.mailHost,
  username: env.mailUsername,
  password: env.mailPassword,
});

const getOpenAiDefinitions = () => ({
  EDGE_RUNTIME: env.EDGE_RUNTIME,
  OPENAI_API_KEY: env.OPENAI_API_KEY,
  AI_TEMP: env.AI_TEMP,
  AI_MAX_TOKENS: env.AI_MAX_TOKENS,
  OPENAI_API_ORG: env.OPENAI_API_ORG,
});

const getAppUrls = () => ({
  ...env.appUrls,
});

export const getAppCurrentEnvironment = () => env.NODE_ENV;

 
export const getters = {
  geti18ns,
  getCurrentLanguage,
  getNodeEnv,
  getAppPort,
  getDatabaseUri,
  getAppSecrets,
  getDatabaseUrl,
  getAppUrls,
  getAppMailers,
  getOpenAiDefinitions, 
};
