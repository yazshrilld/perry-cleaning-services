export const  generatePassword =async(passwordLength: number = 8)=> {
//   const chars =
//     "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Alternative with special characters:
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let password = "";

  // Browser and modern Node.js compatible random values
  const randomValues = new Uint32Array(passwordLength);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = randomValues[i] % chars.length;
    password += chars[randomIndex];
  }

  return password;
};
