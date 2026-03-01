import type { RequestHandler } from "express";
import { HttpStatusCode } from "../config";
import { responseObject, CustomWinstonLogger } from "../utils";
import { customerService } from "../services/model";

const parseRoles = (roles: unknown): string[] => {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === "string") {
    try {
      const parsed = JSON.parse(roles);
      return Array.isArray(parsed) ? parsed : [roles];
    } catch {
      return [roles];
    }
  }
  return [];
};

const isAdminOrSuperAdmin = (roles: string[]) =>
  roles.includes("admin") || roles.includes("super_admin");

const canAccessCustomer = (requesterId: string, targetId: string, roles: string[]) =>
  requesterId === targetId || isAdminOrSuperAdmin(roles);

const getCustomers: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = "A critical error occured. Kindly contact admin";
  let payload: unknown = null;

  try {
    const roles = parseRoles(req.USER_ROLES);
    if (!isAdminOrSuperAdmin(roles)) {
      statusCode = HttpStatusCode.Forbidden;
      message = "Access denied. Your role is not allowed here.";
      return responseObject({ res, statusCode, message, payload });
    }

    const result = await customerService.listCustomers(req.query as any);

    statusCode = HttpStatusCode.OK;
    message = "Customers fetched successfully";
    payload = result;
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error fetching customers: ${(err as Error).message}`,
      "Customers Get All",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

const getCustomerById: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = "A critical error occured. Kindly contact admin";
  let payload: unknown = null;

  try {
    const roles = parseRoles(req.USER_ROLES);
    const requesterId = String(req.USER_ID || "");
    const customerId = String(req.params.id || "");

    if (!canAccessCustomer(requesterId, customerId, roles)) {
      statusCode = HttpStatusCode.Forbidden;
      message = "Access denied.";
      return responseObject({ res, statusCode, message, payload });
    }

    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      statusCode = HttpStatusCode.NotFound;
      message = "Customer not found";
      return responseObject({ res, statusCode, message, payload });
    }

    statusCode = HttpStatusCode.OK;
    message = "Customer fetched successfully";
    payload = {
      customer: customerService.sanitizeCustomer(customer as any),
    };
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error fetching customer by id: ${(err as Error).message}`,
      "Customers Get One",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

const patchCustomer: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = "A critical error occured. Kindly contact admin";
  let payload: unknown = null;

  try {
    const roles = parseRoles(req.USER_ROLES);
    const requesterId = String(req.USER_ID || "");
    const customerId = String(req.params.id || "");

    if (!canAccessCustomer(requesterId, customerId, roles)) {
      statusCode = HttpStatusCode.Forbidden;
      message = "Access denied.";
      return responseObject({ res, statusCode, message, payload });
    }

    const updated = await customerService.updateCustomer(customerId, req.body);
    if (!updated) {
      statusCode = HttpStatusCode.NotFound;
      message = "Customer not found";
      return responseObject({ res, statusCode, message, payload });
    }

    statusCode = HttpStatusCode.OK;
    message = "Customer updated successfully";
    payload = {
      customer: customerService.sanitizeCustomer(updated as any),
    };
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error updating customer: ${(err as Error).message}`,
      "Customers Patch",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

const deleteCustomer: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = "A critical error occured. Kindly contact admin";
  let payload: unknown = null;

  try {
    const roles = parseRoles(req.USER_ROLES);
    if (!isAdminOrSuperAdmin(roles)) {
      statusCode = HttpStatusCode.Forbidden;
      message = "Access denied. Your role is not allowed here.";
      return responseObject({ res, statusCode, message, payload });
    }

    const customerId = String(req.params.id || "");
    const actorId = String(req.USER_ID || "");
    const deleted = await customerService.softDeleteCustomer(customerId, actorId);

    if (!deleted) {
      statusCode = HttpStatusCode.NotFound;
      message = "Customer not found";
      return responseObject({ res, statusCode, message, payload });
    }

    statusCode = HttpStatusCode.OK;
    message = "Customer deleted successfully";
    payload = {
      customer: customerService.sanitizeCustomer(deleted as any),
    };
  } catch (err) {
    CustomWinstonLogger(
      "error",
      `Error deleting customer: ${(err as Error).message}`,
      "Customers Delete",
    );
    message = (err as Error).message;
  }

  return responseObject({ res, statusCode, message, payload });
};

export default {
  getCustomers,
  getCustomerById,
  patchCustomer,
  deleteCustomer,
};
