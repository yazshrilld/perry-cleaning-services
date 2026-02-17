import { NextFunction, RequestHandler, Response } from "express";
import { createHttpError, errorHandler, responseObject } from "../utils";
import { logger } from "netwrap";
import { Helpers } from "../types/types";
import {
  ValidateviewAllValidation,
  inputRequestShouldBeEncrypted,
  loginInputValidationSchema,
  registerInputValidationSchema,
  sessionInputValidation,
} from "../utils/validate";

const createValidationMiddleware = (
  validationFn: (data: object) => {
    error?: { details: { message: string }[] };
  },
  targets: Helpers.ValidationTarget[] = ["body"],
): RequestHandler => {
  return (req: Helpers.ExtendedRequest, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Fatal error occurred";

    try {
      ////// console.log("Targets for validation req------:", req);
      // Combine multiple targets into a single object
      const dataToValidate: Record<string, any> = {};
      if (targets.includes("body")) dataToValidate.body = req.body;
      if (targets.includes("query")) dataToValidate.query = req.query;
      if (targets.includes("params")) dataToValidate.params = req.params;
      if (targets.includes("files")) dataToValidate.files = req.files;
      // let dataToValidate;

      // if (target === "body") {
      //   dataToValidate = req.body;
      // } else if (target === "query") {
      //   dataToValidate = req.query;
      // } else {
      //   dataToValidate = req.params;
      // }

      const { error } = validationFn(dataToValidate);
      if (error) {
        statusCode = 400;
        message = error.details[0].message;
        throw createHttpError(message, statusCode);
      }
      next();
    } catch (err) {
      logger(err, { shouldLog: true, isError: true });

      message = (err as Error).message;
      return responseObject({
        res,
        statusCode: statusCode,
        message: errorHandler(err as Error, null)?.message || message,
      });
    }
  };
};

const validateEncrtptedInput = createValidationMiddleware(
  inputRequestShouldBeEncrypted,
  ["body"],
);

const validateVeiwAllInput = createValidationMiddleware(
  ValidateviewAllValidation,
  ["query"],
);

const addSessionInput = createValidationMiddleware(sessionInputValidation, [
  "body",
]);

const loginInput = createValidationMiddleware(
  (data: any) => loginInputValidationSchema().validate(data.body),
  ["body"],
);

const registerInput = createValidationMiddleware(
  (data: any) => registerInputValidationSchema().validate(data.body),
  ["body"],
);

// const validateLoginAuthRequest = createValidationMiddleware(
//   loginAuthInputValidation,
//   ["body"],
// );

// const validateCreateUsersRequest = createValidationMiddleware(
//   addusersInputValidation,
//   ["body"],
// );

const verifyMiddleware = {
  validateEncrtptedInput,
  validateVeiwAllInput,
  addSessionInput,
  loginInput,
  registerInput,
};

export { verifyMiddleware };
