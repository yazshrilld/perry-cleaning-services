import { randomInt } from "crypto";

export const generateOtp = async (length = 4) => {
  const otpArray = [];
  for (let i = 0; i < length; i++) {
    otpArray.push(randomInt(10));
  }

  const otp = otpArray.join("");
  return await Promise.resolve(otp); // Simulated asynchronous return
};
