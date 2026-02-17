import { logger } from "netwrap";
import { Helpers } from "../types/types";
import { successHandler } from "./successHandler";

export const verifyUserRole = (
  arrayRole: string[] | string,
  filters: Helpers.UserRoles | Helpers.UserRoles[],
) => {
  logger(arrayRole);

  // Ensure arrayRole is an array of separate roles
  const array = (Array.isArray(arrayRole) ? arrayRole : [arrayRole])
    .flatMap((r) => r.split(",").map((x) => x.trim()))
    .filter(Boolean); // Removes empty strings

  // Convert filters to an array if it's a single role
  const requiredRoles = Array.isArray(filters) ? filters : [filters];

  // Check if user has at least one of the required roles
  const hasRequiredRole = array.some((role) =>
    requiredRoles.includes(role as Helpers.UserRoles),
  );

  if (!hasRequiredRole) {
    console.log(` Required roles: ${requiredRoles.join(", ")}`);
    throw new Error("You do not have permission to perform this action.");
  }

  console.log(filters, "result------"); // Debugging output
  return successHandler({ role: filters }, "verified user role");
};
