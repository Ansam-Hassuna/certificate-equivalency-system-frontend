import { useMemo } from "react";
import { useAuth } from "./AuthContext";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
} from "./accessControl";

export function useAuthorization() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      can: (permission) => hasPermission(user, permission),
      canAny: (permissions) => hasAnyPermission(user, permissions),
      canAll: (permissions) => hasAllPermissions(user, permissions),
      hasRole: (role) => hasRole(user, role),
      hasAnyRole: (roles) => hasAnyRole(user, roles),
    }),
    [user]
  );
}
