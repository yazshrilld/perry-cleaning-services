import { getters } from "../config";
import { TokenPayload } from "../types";
import jwt from "jsonwebtoken";





export async function decodeVerifyToken(
  token: string,
): Promise<TokenPayload | Error> {
  const secret = getters.getAppSecrets().accessTokenSecret;

  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded) {
        console.error("Token verification failed:", err?.message); // Keep detailed logs internally
        resolve(new Error("Invalid or expired token")); // Return generic error to caller
      } else {
        resolve(decoded as TokenPayload);
      }
    });
  });
}


export async function decodeToken(
  token: string,
): Promise<TokenPayload | Error> {
  try {
    const decoded = jwt.decode(token);

    if (!decoded) {
      return new Error("Malformed token: Unable to decode");
    }

    return decoded as TokenPayload;
  } catch (err) {
    return err instanceof Error
      ? err
      : new Error("Unknown token decoding error");
  }
}
// export async function decodeToken(token: string): Promise<any> {
//   try {
//     const secret = getters.getAppSecrets().accessTokenSecret;
//     // If jwt.verify doesn't return a promise natively, we can wrap it in one
//     return await new Promise((resolve) => {
//       jwt.verify(token, secret, (err, decoded) => {
//         if (err) {
//            console.error("Error decoding token:", err);
//           resolve(err); // Resolve with null for invalid tokens
//         } else {
//           resolve(decoded as TokenPayload);
//         }
//       });
//     });
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return error;
//   }
// }