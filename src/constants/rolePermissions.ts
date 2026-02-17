import { rolePermissions } from "../types/functions";

export const RolePermissionsMap: Record<string, rolePermissions[]> = {
  admin: [
    rolePermissions.VIEW,
    rolePermissions.READ,
    rolePermissions.CREATE,
    rolePermissions.UPDATE,
    rolePermissions.DELETE,
  ],
  super_admin: [
    rolePermissions.VIEW,
    rolePermissions.READ,
    rolePermissions.CREATE,
    rolePermissions.UPDATE,
    rolePermissions.DELETE,
  ],
  CUSTOMER: [
    rolePermissions.VIEW,
    rolePermissions.CREATE,
    rolePermissions.EDIT,
  ],
  INITIATOR: [
    rolePermissions.VIEW,
    rolePermissions.CREATE,
    rolePermissions.EDIT,
  ],
  APPROVER: [
    rolePermissions.VIEW,
    rolePermissions.CREATE,
    rolePermissions.EDIT,
  ],
  ADMIN: [
    rolePermissions.VIEW,
    rolePermissions.READ,
    rolePermissions.CREATE,
    rolePermissions.UPDATE,
    rolePermissions.DELETE,
  ],
  SUPERADMIN: [
    rolePermissions.VIEW,
    rolePermissions.READ,
    rolePermissions.CREATE,
    rolePermissions.UPDATE,
    rolePermissions.DELETE,
  ],
  GOV: [
    rolePermissions.VIEW,
    rolePermissions.READ,
    rolePermissions.CREATE,
    rolePermissions.EDIT,
  ],
};
