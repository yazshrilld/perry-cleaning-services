// import * as crypto from "crypto";
import * as cryptoJs from "crypto-js";



function getPool(type: string) {
  let pool;
  switch (type) {
  case "pasgenerate":
    pool = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    break;
  case "alnum":
    pool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    break;
  case "alpha":
    pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    break;
  case "hexdec":
    pool = "0123456789abcdef";
    break;
  case "numeric":
    pool = "0123456789";
    break;
  case "nozero":
    pool = "123456789";
    break;
  case "distinct":
    pool = "2345679ACDEFHJKLMNPRSTUVWXYZ";
    break;
  default:
    pool = type;
    break;
  }
  
  return pool;
}

function pad(number: number, length: number) {
  let str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  
  return str;
}

const YYYYMMDDHHMMSS = function (date: Date) {
  const yyyy = date.getFullYear().toString().substring(2);
  const MM = pad(date.getMonth() + 1, 2);
  const dd = pad(date.getDate(), 2);
  // const hh = pad(date.getHours(), 2);
  // const mm = pad(date.getMinutes(), 2);
  // const ss = pad(date.getSeconds(), 2);
  
  return yyyy+MM+dd ;
};

async function randomChar(length: number, type: string) {
  let result = "";
  const characters = getPool(type);
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
 



const getTimeBasedSignatureString = (
  date: Date,
  institutionCode: string,
  secret: string,
) => {
  const yyyy = date.getUTCFullYear().toString().substring(2); // Use UTC
  const MM = pad(date.getUTCMonth() + 1, 2); // Use UTC
  const dd = pad(date.getUTCDate(), 2); // Use UTC
  const HH = pad(date.getUTCHours(), 2); // Use UTC
  const mm = pad(date.getUTCMinutes(), 2); // Use UTC
  // const yyyy = date.getFullYear().toString().substring(2);
  // const MM = pad(date.getMonth() + 1, 2);
  // const dd = pad(date.getDate(), 2);
  // const HH = pad(date.getHours(), 2);
  // const mm = pad(date.getMinutes(), 2);
  //const ss = pad(date.getSeconds(), 2);
  return institutionCode + yyyy + MM + dd + HH + mm + secret;
};

const SIGNATURE = async (
  institutionCode: string,
  secret: string,
  date?: Date,
  tags?: string,
) => {
  const now = date ?? new Date();
  const concatenatedString = getTimeBasedSignatureString(
    now,
    institutionCode,
    secret,
  );
  const hash = `${cryptoJs
    .SHA512(concatenatedString)
    .toString(cryptoJs.enc.Hex)};${tags}`;
  return hash;
};

const  transactionId=async(clientID: string)=> {
  const  d = new Date();
  const raaa =await randomChar(12, "numeric");
  const requestID = clientID + YYYYMMDDHHMMSS(d) +raaa ;
  return requestID;
};

export {
  SIGNATURE,transactionId
};