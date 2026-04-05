import type { AppRole, Permission } from "@/lib/types";

const allPermissions: Permission[] = [
  "dashboard.view",
  "crm.view",
  "crm.manage",
  "documents.view",
  "documents.manage",
  "calendar.view",
  "calendar.manage",
  "company.manage",
  "security.manage",
  "users.manage",
  "audit.view",
];

export const rolePermissions: Record<AppRole, Permission[]> = {
  admin: allPermissions,
  sales: [
    "dashboard.view",
    "crm.view",
    "crm.manage",
    "documents.view",
    "documents.manage",
    "calendar.view",
    "calendar.manage",
    "security.manage",
  ],
  viewer: [
    "dashboard.view",
    "crm.view",
    "documents.view",
    "calendar.view",
    "security.manage",
  ],
};

export function getPermissionsForRole(role: AppRole) {
  return rolePermissions[role];
}

export function hasPermission(role: AppRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
