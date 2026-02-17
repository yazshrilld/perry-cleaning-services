import { rolePermissions } from "../types/functions";
import { RolePermissionsMap } from "../constants/rolePermissions";
import { responseObject } from "../utils";
import { RequestHandler } from "express";
import { logger } from "netwrap";

export const hasPermission = (
  allowedRoles: string[],
  requiredPermissions: rolePermissions | rolePermissions[],
): RequestHandler => {
  return (req, res, next) => {
    try {
      const userRoles: string[] =
        typeof req.USER_ROLES === "string"
          ? JSON.parse(req.USER_ROLES)
          : req.USER_ROLES || [];

      console.log("Auth roles check", { roles: userRoles, allowedRoles });

      if (!userRoles.length) {
        throw new Error("No roles found for user.");
      }

      const roleAuthorized = userRoles.some((role) =>
        allowedRoles.includes(role),
      );
      if (!roleAuthorized) {
        throw new Error("Access denied. Your role is not allowed here.");
      }

      const userPermissions = new Set<rolePermissions>();
      userRoles.forEach((role) => {
        const perms = RolePermissionsMap[role];
        perms?.forEach((perm) => userPermissions.add(perm));
      });

      // Normalize permissions to an array
      const permissionsToCheck = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];
      // Log what’s being checked
      console.log("🔍 Checking permissions:", {
        required: permissionsToCheck,
        userHas: Array.from(userPermissions),
      });
      // const isAllowed = permissionsToCheck.every((perm) =>
      //   userPermissions.has(perm),
      // );
      // ✅ Allow if user has at least one of the required permissions
      const isAllowed = permissionsToCheck.some((perm) =>
        userPermissions.has(perm),
      );
      // if (!isAllowed) {
      //   throw new Error(
      //     `You do not have permission to perform this action. Required: ${permissionsToCheck.join(
      //       ", ",
      //     )}, User has: ${Array.from(userPermissions).join(", ")}`,
      //   );
      // }

      if (!isAllowed) {
        throw new Error("You do not have permission to perform this action.");
      }

      return next();
    } catch (error) {
      logger(error);
      return responseObject({
        res,
        statusCode: 403,
        message: (error as any).message || "Access denied",
      });
    }
  };
};
