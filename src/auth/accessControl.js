import { ALL_PERMISSIONS, PERMISSIONS } from "./permissions";
import { ROLES, isKnownRole } from "./roles";

export const getUserRole = (user) => user?.role || null;

export const getUserPermissions = (user) => {
  if (!user || !isKnownRole(user.role)) return [];

  return Array.isArray(user.permissions) ? user.permissions : [];
};

export const hasPermission = (user, permission) => {
  if (!user || !permission) return false;
  return getUserPermissions(user).includes(permission);
};

export const hasAnyPermission = (user, permissions = []) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.some((permission) => hasPermission(user, permission));
};

export const hasAllPermissions = (user, permissions = []) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.every((permission) => hasPermission(user, permission));
};

export const hasRole = (user, role) => Boolean(user && role && user.role === role);

export const hasAnyRole = (user, roles = []) =>
  Boolean(user && Array.isArray(roles) && roles.includes(user.role));

export const canAccessMenuItem = (user, permission) => {
  if (!permission) return Boolean(user);
  return hasPermission(user, permission);
};

export const filterByPermission = (user, items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => canAccessMenuItem(user, item.permission))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterByPermission(user, item.children)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0 || item.path);
};

export const canAccessRoute = (user, requiredPermissions = [], mode = "all") => {
  if (!user) return false;
  if (!requiredPermissions.length) return true;

  return mode === "any"
    ? hasAnyPermission(user, requiredPermissions)
    : hasAllPermissions(user, requiredPermissions);
};

export const assertPermission = (user, permission) => {
  if (!hasPermission(user, permission)) throw new Error("Access denied");
  return true;
};

export { ALL_PERMISSIONS, PERMISSIONS, ROLES, isKnownRole };

export default {
  getUserRole,
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  canAccessMenuItem,
  filterByPermission,
  canAccessRoute,
  assertPermission,
};
