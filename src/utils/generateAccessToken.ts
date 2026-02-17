import jwt, { SignOptions } from "jsonwebtoken";
import { getters } from "../config";
import { ObjectId } from "mongodb";

export const generateAccessToken = async (
  payload: any,
  _provider?: string,
  customAccessExpireTime?: any,
) => {
  const secrets = getters.getAppSecrets();

  const accessOptions: SignOptions = {
    expiresIn: customAccessExpireTime || secrets.expireTime,
  };

  const refreshOptions: SignOptions = {
    expiresIn: secrets.refreshExpiresIn,
  };

  const accessToken = await signJwtAsync(
    payload,
    secrets.accessTokenSecret,
    accessOptions,
  );

  const refreshToken = await signJwtAsync(
    payload,
    secrets.verificationTokenSecret,
    refreshOptions,
  );

  // Optional: custom expiry logic (1 day)
  const currentDate = new Date();
  const oneDayLater = new Date(currentDate);
  const threeDayLater = new Date(currentDate);
  oneDayLater.setDate(currentDate.getDate() + 1);
  threeDayLater.setDate(currentDate.getDate() + 3);

  // Save refresh token to MongoDB (like NestJS does)
  const tokensToSave = [
    {
      token: refreshToken,
      identifier: "REFRESH_TOKEN",
      expires: threeDayLater,
    },
    {
      token: accessToken,
      identifier: "LOGIN_TOKEN",
      expires: oneDayLater,
    },
  ];

  const filteredTokensToSave = _provider
    ? [
        {
          token: accessToken, // Assuming refreshToken is used for _provider
          identifier: _provider,
          expires: oneDayLater,
        },
      ]
    : tokensToSave;

  // await Promise.all(
  //   filteredTokensToSave.map(({ token, identifier, expires }) =>
  //     verificationTokenModel.saveVerificationToken({
  //       userId: ObjectId.isValid(payload.userId)
  //         ? new ObjectId(payload.userId)
  //         : payload.userId,
  //       token,
  //       identifier,
  //       expires,
  //     }),
  //   ),
  // );

  return {
    accessToken: `Bearer ${accessToken}`,
    refreshToken: `Bearer ${refreshToken}`,
  };
};

export const verifyAccessToken = (token: string) => {
  const secrets = getters.getAppSecrets();
  return jwt.verify(token, secrets.accessTokenSecret);
};

export const decodeAccessToken = (token: string) => {
  return jwt.decode(token);
};

// helper to promisify jwt.sign
function signJwtAsync(
  payload: object,
  secret: string,
  options: SignOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err || !token) return reject(err);
      resolve(token);
    });
  });
}
