/* eslint-disable camelcase */
// import Joi, { ObjectSchema } from "joi";
//import { constants } from "../constants";

import Joi from "joi";

export const multipartRoutes: Record<string, boolean> = {
  validateDocumentUploadRequest: true, // your docUpload endpoint
};

const ValidateviewAllValidation = (data: any) => {
  const schema = Joi.object({
    status: Joi.string()
      .optional()
      .allow("")
      .valid("pending", "active", "disabled"),
    orderBy: Joi.string().optional().allow(""),
    sort: Joi.string().optional().allow("").valid("ASC", "DESC"),
    size: Joi.string().optional().allow(""),
    page: Joi.string().optional().allow(""),
    gSearch: Joi.any().optional().allow(""),
    option: Joi.any().optional().allow(""),
    requestType: Joi.string()
      .optional()
      .allow("")
      .valid("DOMI", "EXPORT", "IEMARKET", "rollOver", "liquidate"),
    startDate: Joi.string()
      .optional()
      .allow("")
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .message("startDate must be in the format YYYY-MM-DD"),

    endDate: Joi.string()
      .optional()
      .allow("")
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .message("endDate must be in the format YYYY-MM-DD"),
    swapType: Joi.string().optional().allow(""),
  });
  return schema.validate(data.body);
};

const ValidateEncrtptedValidation = (data: any) => {
  const schema = Joi.object({
    textData: Joi.string().required(),
  });
  return schema.validate(data.body);
};

const inputRequestShouldBeEncrypted = (data: any) => {
  const schema = Joi.object({
    textData: Joi.string().required(),
  });
  return schema.validate(data.body);
};

const loginAuthInputValidation = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().trim().required().messages({
      "any.required": "Password is required",
    }),
  });
  return schema.validate(data.body);
};

const loginInputValidationSchema = () =>
  Joi.object({
    emailOrUsername: Joi.string().trim().required().messages({
      "any.required": "Email or username is required",
      "string.empty": "Email or username is required",
    }),
    password: Joi.string().trim().required().messages({
      "any.required": "Password is required",
      "string.empty": "Password is required",
    }),
  });

const registerInputValidationSchema = () =>
  Joi.object({
    username: Joi.string().trim().required().messages({
      "any.required": "Username is required",
      "string.empty": "Username is required",
    }),
    firstName: Joi.string().trim().required().messages({
      "any.required": "First name is required",
      "string.empty": "First name is required",
    }),
    lastName: Joi.string().trim().required().messages({
      "any.required": "Last name is required",
      "string.empty": "Last name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    phone: Joi.string().trim().required().messages({
      "any.required": "Phone number is required",
      "string.empty": "Phone number is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
    role: Joi.string().trim().optional(),
  });

const signupAuthInputValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
    tradingName: Joi.string().trim().required().messages({
      "any.required": "Trading name is required",
    }),
    address: Joi.string().trim().required().messages({
      "any.required": "Address is required",
    }),
    regNumber: Joi.string().alphanum().trim().required().messages({
      "any.required": "Registration number is required",
    }),
    country: Joi.string().trim().required().messages({
      "any.required": "Country is required",
    }),
    entityType: Joi.string().valid("LTD", "PLC", "LLP").required().messages({
      "any.only":
        "Entity type must be one of: 'Private Company Limited by Shares (LTD)', 'Public Company Limited by Share (PLC)', or 'Limited Liability Partnership (LLP)'",
      "any.required": "Entity type is required",
    }),
    licenceNumber: Joi.string().trim().optional().allow("", null),
    // password: Joi.string()
    //   .pattern(
    //     new RegExp(
    //       "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,20}$",
    //     ),
    //   )
    //   .required()
    //   .messages({
    //     "string.pattern.base":
    //       "Password must be 8-19 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
    //     "any.required": "Password is required",
    //   }),
    // confirmPassword: Joi.string()
    //   .valid(Joi.ref("password"))
    //   .required()
    //   .messages({
    //     "any.only": "Passwords do not match",
    //     "any.required": "Please confirm your password",
    //   }),
  });
  return schema.validate(data.body);
};

const updateusersInputValidation = (data: any) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    name: Joi.string().trim().min(2).max(50).optional().messages({
      "string.base": "Name must be a string",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must not exceed 50 characters",
    }),
    address: Joi.string().trim().optional().messages({
      "string.base": "Address must be a string",
    }),
    phone: Joi.string().trim().optional().messages({
      "string.base": "Phone must be a string",
    }),
    country: Joi.string().trim().optional().messages({
      "string.base": "Country must be a string",
    }),
    bio: Joi.string().trim().optional().messages({
      "string.base": "Bio must be a string",
    }),
    role: Joi.string().allow("", null).optional(),
    status: Joi.string()
      .optional()
      .allow("")
      .valid("pending", "rejected", "active", "disabled"),
    action: Joi.string().valid("add", "remove").optional(),
  });
  return schema.validate(data.body);
};

const addusersInputValidation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

    address: Joi.string().trim().required().messages({
      "any.required": "Address is required",
    }),

    country: Joi.string().trim().required().messages({
      "any.required": "Country is required",
    }),
    companyId: Joi.string().required(),
    role: Joi.string().allow("", null).optional(),
  });
  return schema.validate(data.body);
};

const sessionInputValidation = (data: any) =>
  sessionInputValidationSchema().validate(data.body, {
    abortEarly: false,
  });

const sessionInputValidationSchema = (): Joi.ObjectSchema =>
  Joi.object({
    attachmentId: Joi.string().trim().optional().messages({
      "string.base": "attachmentId must be a string",
    }),
    conversationId: Joi.string().trim().required().messages({
      "string.base": "conversationId must be a string",
      "string.empty": "conversationId is required",
      "any.required": "conversationId is required",
    }),
    businessId: Joi.string().trim().required().messages({
      "string.base": "businessId must be a string",
      "string.empty": "businessId is required",
      "any.required": "businessId is required",
    }),
    messageId: Joi.string().trim().optional().messages({
      "string.base": "messageId must be a string",
    }),
    fileName: Joi.string().trim().optional().messages({
      "string.base": "fileName must be a string",
    }),
    fileType: Joi.string().trim().optional().messages({
      "string.base": "fileType must be a string",
    }),
    fileSize: Joi.number().optional().messages({
      "number.base": "fileSize must be a number",
    }),
    mimeType: Joi.string().trim().optional().messages({
      "string.base": "mimeType must be a string",
    }),
    storageProvider: Joi.string()
      .trim()
      .valid("s3", "cloudflare_r2")
      .optional()
      .messages({
        "string.base": "storageProvider must be a string",
        "any.only": "storageProvider must be either 's3' or 'cloudflare_r2'",
      }),
    storagePath: Joi.string().trim().optional().messages({
      "string.base": "storagePath must be a string",
    }),
    publicUrl: Joi.string().trim().uri().optional().allow(null, "").messages({
      "string.base": "publicUrl must be a string",
      "string.uri": "publicUrl must be a valid URL",
    }),
    uploadedBy: Joi.string().trim().optional().messages({
      "string.base": "uploadedBy must be a string",
    }),
    uploadedByType: Joi.string()
      .trim()
      .valid("customer", "agent")
      .optional()
      .messages({
        "string.base": "uploadedByType must be a string",
        "any.only": "uploadedByType must be either 'customer' or 'agent'",
      }),
    scanStatus: Joi.string()
      .trim()
      .valid("pending", "clean", "infected")
      .optional()
      .messages({
        "string.base": "scanStatus must be a string",
        "any.only": "scanStatus must be 'pending', 'clean', or 'infected'",
      }),
  });

export {
  ValidateviewAllValidation,
  ValidateEncrtptedValidation,
  loginAuthInputValidation,
  loginInputValidationSchema,
  registerInputValidationSchema,
  signupAuthInputValidation,
  addusersInputValidation,
  updateusersInputValidation,
  inputRequestShouldBeEncrypted,
  sessionInputValidation,
  sessionInputValidationSchema,
};
