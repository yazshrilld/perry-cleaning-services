import {
  ValidateviewAllValidation,
  inputRequestShouldBeEncrypted,
  loginInputValidationSchema,
  registerInputValidationSchema,
  sessionInputValidationSchema,
  customerGetAllInputValidationSchema,
  customerIdParamInputValidationSchema,
  updateCustomerInputValidationSchema,  
} from "./validate";

/**
 * Map middleware validator keys to their respective Joi validator functions
 */
export const joiSchemasMap: Record<string, Function> = {
  validateVeiwAllInput: ValidateviewAllValidation,
  validateEncrtptedInput: inputRequestShouldBeEncrypted,
  addSessionInput: sessionInputValidationSchema,
  loginInput: loginInputValidationSchema,
  registerInput: registerInputValidationSchema,
  customerGetAllInput: customerGetAllInputValidationSchema,
  customerIdParamInput: customerIdParamInputValidationSchema,
  updateCustomerInput: updateCustomerInputValidationSchema,
};
