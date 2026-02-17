// import { createHttpError } from "./createHttpError";

import CryptoJS from "crypto-js";



// Generate 16-byte IV in Base64
const generateIV = (): string => {
  const iv = CryptoJS.lib.WordArray.random(16);
  return CryptoJS.enc.Base64.stringify(iv);
};

const encrypt = (data: string, keyBase64: string, ivBase64?: any): string => {
  const key = CryptoJS.enc.Base64.parse(keyBase64);
  //const iv = CryptoJS.enc.Base64.parse(ivBase64);
  ivBase64 = generateIV();
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const cipherText = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  return `${cipherText};${ivBase64}`;
};

const decrypt = (
  encryptedPayload: string,
  keyBase64: string,
  ivBase64old?: any,
): string => {
  const [cipherText, ivBase64] = encryptedPayload.split(";");
  console.log(ivBase64old);
  if (!cipherText || !ivBase64) {
    throw new Error("Invalid encrypted payload format.");
  }

  const key = CryptoJS.enc.Base64.parse(keyBase64);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);

  const decryptedText = CryptoJS.AES.decrypt(cipherText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decryptedText.toString(CryptoJS.enc.Utf8);
};





export const costomencryDecryptInternalCRYPTOJS = async (requestType: string, data: string, keyBase64: string, ivBase64: string) => {
  let cypherData = "";
  try {
    if (requestType == "EN") {
      const encryptedData = encrypt(data, keyBase64, ivBase64);
      // logToConsole({ "Encryption data:": encryptedData });
      cypherData = encryptedData;
      return {
        status: cypherData.length > 0 ? true : false,
        payload: cypherData,
      };

    }
    else {
      const decryptedData = decrypt(data, keyBase64, ivBase64);
      // logToConsole({ "Decrypted data:": decryptedData });
      cypherData = decryptedData;
      return {
        status: cypherData.length > 0 ? true : false,
        payload: JSON.parse(cypherData),
      };
    }


  } catch (error) {
    console.error("Error:", (error as any).message);
    return {
      status: false,
      payload: "Error: " + (error as any).message,
    };
  }
};

