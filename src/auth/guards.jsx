import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { canAccessRoute } from "./accessControl";

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RequirePermission({ permission, permissions = [], mode = "all", children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const required = permission ? [permission, ...permissions] : permissions;

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessRoute(user, required, mode)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

export function RequireRole({ roles = [], children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
