import * as crypto from "crypto";
import { logToConsole } from "./logToConsole";
import CryptoJS from "crypto-js";

/**
 * Generates a 32-byte secure random hex string.
 */
const generateSecret = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Generates a 16-byte secure random hex string for salt.
 */
const generateSalt = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Generates a collection of secrets for staging environments.
 */
export const generateSecrets = (): Record<string, string> => {
  return {
    STAGING_LOGIN_TOKEN_SECRET: generateSecret(),
    STAGING_PASSWORD_ENCRYPTION_SALT: generateSalt(),
    STAGING_VERIFICATION_TOKEN_SECRET: generateSecret(),
    STAGING_ACCESS_TOKEN_SECRET: generateSecret(),
  };
};

/**
 * Generates a secure Base64-encoded secret key and IV (for AES encryption).
 */
export const generateCryptoKeys = (): { secretKey: string; ivKey: string } => {
  const key = CryptoJS.lib.WordArray.random(16); // 128-bit
  const iv = CryptoJS.lib.WordArray.random(16); // 128-bit

  return {
    secretKey: CryptoJS.enc.Base64.stringify(key),
    ivKey: CryptoJS.enc.Base64.stringify(iv),
  };
};

/**
 * Generates Node.js Buffer versions of AES key/IV using UTF-8 encoding.
 */
export const generateNodeCryptoBuffers = (): {
  secretKeyBuffer: Buffer;
  ivKeyBuffer: Buffer;
} => {
  const secretKey = crypto.randomBytes(16).toString("base64");
  const ivKey = crypto.randomBytes(16).toString("base64");

  return {
    secretKeyBuffer: Buffer.from(secretKey, "utf8"),
    ivKeyBuffer: Buffer.from(ivKey, "utf8"),
  };
};

/**
 * Logs example output for demonstration/debugging.
 */
export const debugSecurityOutput = (): void => {
  const nodeCrypto = generateNodeCryptoBuffers();
  const jsCrypto = generateCryptoKeys();
  const secrets = generateSecrets();

  console.log(
    "Node.js Secret Key:",
    nodeCrypto.secretKeyBuffer.toString("base64"),
  );
  console.log("Node.js IV Key:", nodeCrypto.ivKeyBuffer.toString("base64"));

  console.log("CryptoJS Secret Key:", jsCrypto.secretKey);
  console.log("CryptoJS IV Key:", jsCrypto.ivKey);

  logToConsole(secrets);
};
