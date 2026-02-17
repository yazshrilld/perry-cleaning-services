import type { RequestHandler } from "express";
import { getters, HttpStatusCode } from "../config";
import { responseObject, CustomWinstonLogger } from "../utils";
import { generateAccessToken } from "../utils/generateAccessToken";
import { userService } from "../services/model";

const login: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload: unknown = null;

  try {
    const { emailOrUsername, password } = req.body;

    const user = await userService.findByEmailOrUsername(emailOrUsername);
    if (!user || user.isActive === false) {
      statusCode = HttpStatusCode.Unauthorized;
      message = "Invalid credentials";
      return responseObject({ res, statusCode, message, payload });
    }

    const isValid = await userService.verifyPassword(password, user.password);
    if (!isValid) {
      statusCode = HttpStatusCode.Unauthorized;
      message = "Invalid credentials";
      return responseObject({ res, statusCode, message, payload });
    }

    const resolvedRoles = Array.isArray((user as any).roles)
      ? (user as any).roles
      : [user.role];

    const tokenPayload = {
      userId: user._id,
      role: resolvedRoles,
    };

    const tokens = await generateAccessToken(tokenPayload);
    await userService.setLastLogin(String(user._id));

    statusCode = HttpStatusCode.OK;
    message = "Login successful";
    payload = {
      token: tokens.accessToken,
      user: userService.sanitize(user),
    };
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error during login: ${(err as Error).message}`,
      "Auth Login Request",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

const checkServiceHealth: RequestHandler = (...rest) => {
  const res = rest[1];

  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const register: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message =
    "A critical error occured. Kindly contact admin for details about a possible solution to this error";
  let payload: unknown = null;

  try {
    const newUser = await userService.createUser(req.body);

    statusCode = HttpStatusCode.Created;
    message = "User created successfully";
    payload = {
      user: userService.sanitize(newUser),
    };
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error during register: ${(err as Error).message}`,
      "Auth Register Request",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

export default {
  checkServiceHealth,
  login,
  register,
};
