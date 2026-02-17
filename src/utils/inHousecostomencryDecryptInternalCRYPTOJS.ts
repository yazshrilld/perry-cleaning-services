import { getters } from "../config";
import CryptoJS from "crypto-js";

const AES_KEY =
  getters.getAppSecrets().aesSecertKey || "OhnitjvZOZ0wyqFjS8MqSA=="; // Given AES key for testing


// Generate IV in Base64 format
const generateIV = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let iv = "";
  for (let i = 0; i < 16; i++) {
    iv += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return iv; // 16-character alphanumeric IV
};



const encrypt = (text: string): string => {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY); // Convert key to WordArray
  const ivStr = generateIV(); // Generate 16-char IV like C#
  const iv = CryptoJS.enc.Utf8.parse(ivStr); // Convert IV to WordArray

  // Encrypt using CryptoJS
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Convert encrypted data to Base64
  const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  const ivBase64 = CryptoJS.enc.Base64.stringify(iv); // Convert IV to Base64

  return `${cipherText};${ivBase64}`; // Encrypted data + IV in Base64
};


const decrypt = (encryptedPayload: string): string => {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY); // Convert key to WordArray

  // Extract encrypted data and IV
  const [encryptedData, ivBase64] = encryptedPayload.split(";");
  if (!encryptedData || !ivBase64) {
    throw new Error("Invalid encrypted payload format.");
  }

  const iv = CryptoJS.enc.Base64.parse(ivBase64); // Convert IV back to WordArray

  // Decrypt using CryptoJS
  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(encryptedData) }), // Convert Base64 encrypted text back to WordArray
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  if (!decryptedText) throw new Error("Decryption failed. Invalid data.");

  return decryptedText;
};


// Main function for encryption/decryption
export const customEncryptDecrypt = async (
  requestType: "EN" | "DE",
  data: string,
) => {
  try {
    let cypherData = requestType === "EN" ? encrypt(data) : decrypt(data);

    return {
      status: true,
      payload: requestType === "DE" ? safeJSONParse(cypherData) : cypherData,
    };
  } catch (error) {
    console.error("Error:", (error as any).message);
    return {
      status: false,
      payload: "Error: " + (error as any).message,
    };
  }
};

// Safe JSON parse helper
const safeJSONParse = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return data; // If not JSON, return raw string
  }
};
