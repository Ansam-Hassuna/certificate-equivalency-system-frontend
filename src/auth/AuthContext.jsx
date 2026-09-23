import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROLES, ROLE_PERMISSIONS } from "./roles";
import { PERMISSIONS } from "./permissions";
import {
  authApi as legacyAuthApi,
  AUTH_MODE,
} from "../api/mockAuthApi";
import { authApi as backendAuthApi } from "../features/auth/authApi";

const authApi = Object.freeze({
  session: (...args) =>
    legacyAuthApi.session(...args),

  login: (...args) =>
    backendAuthApi.login(...args),

  verifyLoginOtp: (...args) =>
    backendAuthApi.verifyLoginOtp(...args),

  register: (...args) =>
    legacyAuthApi.register(...args),
});

class ApiError extends Error {
  constructor(
    message,
    status,
    code = "API_ERROR",
    details = null
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const AuthContext = createContext(null);

const SESSION_KEY = "ce_auth_session";
const PENDING_KEY = "ce_pending_registration";
const PENDING_LOGIN_2FA_KEY =
  "ce_pending_login_2fa";

const isBrowser =
  typeof window !== "undefined";

function readSession() {
  if (!isBrowser) return null;

  try {
    const value =
      window.sessionStorage.getItem(
        SESSION_KEY
      );

    if (!value) return null;

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (!isBrowser) return;

  if (!user) {
    window.sessionStorage.removeItem(
      SESSION_KEY
    );
    return;
  }

  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );
}

function savePendingRegistration(data) {
  if (!isBrowser) return;

  if (!data) {
    window.sessionStorage.removeItem(
      PENDING_KEY
    );
    return;
  }

  window.sessionStorage.setItem(
    PENDING_KEY,
    JSON.stringify(data)
  );
}

function readPendingRegistration() {
  if (!isBrowser) return null;

  try {
    const value =
      window.sessionStorage.getItem(
        PENDING_KEY
      );

    if (!value) return null;

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function savePendingLoginTwoFactor(data) {
  if (!isBrowser) return;

  if (!data) {
    window.sessionStorage.removeItem(
      PENDING_LOGIN_2FA_KEY
    );
    return;
  }

  window.sessionStorage.setItem(
    PENDING_LOGIN_2FA_KEY,
    JSON.stringify(data)
  );
}

function readPendingLoginTwoFactor() {
  if (!isBrowser) return null;

  try {
    const value =
      window.sessionStorage.getItem(
        PENDING_LOGIN_2FA_KEY
      );

    if (!value) return null;

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const parts =
      String(token).split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 =
      parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
      base64 +
      "=".repeat(
        (4 - (base64.length % 4)) % 4
      );

    const payload = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map(
            (character) =>
              "%" +
              (
                "00" +
                character
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)
          )
          .join("")
      )
    );

    const role =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"
      ] ||
      payload.role ||
      payload.roles;

    if (Array.isArray(role)) {
      return role[0] || null;
    }

    return role || null;
  } catch {
    return null;
  }
}

function normalizePermissions(data, role) {
  if (ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS[role];
  }

  if (
    Array.isArray(data?.permissions) &&
    data.permissions.length > 0
  ) {
    return data.permissions;
  }

  if (
    Array.isArray(data?.permissionNames) &&
    data.permissionNames.length > 0
  ) {
    return data.permissionNames;
  }

  if (
    Array.isArray(data?.claims) &&
    data.claims.length > 0
  ) {
    return data.claims;
  }

  return [PERMISSIONS.AUTHENTICATED];
}

function normalizeUser(payload) {
  if (!payload) return null;

  const data =
    payload.user ||
    payload.data ||
    payload;

  if (!data) return null;

  const token =
    data.token ||
    data.accessToken ||
    data.jwt ||
    payload.token ||
    payload.accessToken ||
    null;

  const rawRole =
    data.role ||
    data.roles?.[0] ||
    getRoleFromToken(token) ||
    ROLES.APPLICANT;

  let role = String(rawRole)
    .trim()
    .toUpperCase();

  // Backend currently uses "Member".
  // Frontend maps that role to the applicant role.
  if (role === "MEMBER") {
    role = ROLES.APPLICANT;
  }

  const permissions =
    normalizePermissions(
      data,
      role
    );

  return {
    id:
      data.id ||
      data.userId ||
      null,

    email:
      data.email ||
      "",

    displayName:
      data.displayName ||
      data.name ||
      "",

    name:
      data.name ||
      data.displayName ||
      "",

    role,

    imageUrl:
      data.imageUrl ||
      data.avatarUrl ||
      null,

    token,

    emailVerified:
      data.emailVerified !== undefined
        ? Boolean(data.emailVerified)
        : true,

    active:
      data.active !== undefined
        ? Boolean(data.active)
        : true,

    permissions,
  };
}

function getAuthError(error) {
  if (
    error instanceof ApiError ||
    error?.code
  ) {
    return {
      ok: false,
      reason:
        error.code ||
        "API_ERROR",
      message:
        error.message,
      status:
        error.status,
      details:
        error.details,
    };
  }

  return {
    ok: false,
    reason: "NETWORK_ERROR",
    message:
      error?.message ||
      "Unable to connect to the server.",
  };
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(() => readSession());

  const [loading, setLoading] =
    useState(true);

  const restoreSession =
    useCallback(
      async () => {
        const storedUser =
          readSession();

        try {
          const payload =
            await authApi.session();

          const restoredUser =
            normalizeUser(payload);

          if (restoredUser) {
            setUser(restoredUser);

            saveSession(
              restoredUser
            );

            return restoredUser;
          }

          if (storedUser) {
            const normalizedStoredUser =
              normalizeUser(
                storedUser
              );

            if (normalizedStoredUser) {
              setUser(
                normalizedStoredUser
              );

              saveSession(
                normalizedStoredUser
              );

              return normalizedStoredUser;
            }
          }

          setUser(null);
          saveSession(null);

          return null;
        } catch {
          if (storedUser) {
            const normalizedStoredUser =
              normalizeUser(
                storedUser
              );

            if (normalizedStoredUser) {
              setUser(
                normalizedStoredUser
              );

              saveSession(
                normalizedStoredUser
              );

              return normalizedStoredUser;
            }
          }

          setUser(null);
          saveSession(null);

          return null;
        }
      },
      []
    );

  useEffect(() => {
    let mounted = true;

    const initialize =
      async () => {
        try {
          await restoreSession();
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    initialize();

    return () => {
      mounted = false;
    };
  }, [restoreSession]);

  const login =
    useCallback(
      async (
        email,
        password
      ) => {
        const normalizedEmail =
          normalizeEmail(email);

        if (
          !normalizedEmail ||
          !password
        ) {
          return {
            ok: false,
            reason:
              "INVALID_CREDENTIALS",
          };
        }

        try {
          const payload =
            await authApi.login(
              normalizedEmail,
              password
            );

          if (
            payload?.requiresTwoFactor === true
          ) {
            savePendingLoginTwoFactor({
              email: normalizedEmail,
            });

            return {
              ok: true,
              requiresTwoFactor: true,
              email: normalizedEmail,
              message:
                payload.message ||
                "A verification code has been sent to your email.",
            };
          }

          savePendingLoginTwoFactor(null);

          const authenticatedUser =
            normalizeUser(payload);

          if (!authenticatedUser) {
            return {
              ok: false,
              reason:
                "INVALID_SERVER_RESPONSE",
            };
          }

          setUser(
            authenticatedUser
          );

          saveSession(
            authenticatedUser
          );

          console.log(
            "Authenticated user:",
            authenticatedUser
          );

          console.log(
            "User role:",
            authenticatedUser.role
          );

          console.log(
            "User permissions:",
            authenticatedUser.permissions
          );

          return {
            ok: true,
            user:
              authenticatedUser,
          };
        } catch (error) {
          return getAuthError(error);
        }
      },
      []
    );

  const verifyLoginOtp =
    useCallback(
      async (
        email,
        otp
      ) => {
        const pending =
          readPendingLoginTwoFactor();

        const normalizedEmail =
          normalizeEmail(
            email ||
              pending?.email
          );

        const normalizedOtp =
          String(
            otp || ""
          ).trim();

        if (
          !normalizedEmail ||
          !normalizedOtp
        ) {
          return {
            ok: false,
            reason:
              "INVALID_TWO_FACTOR_DATA",
          };
        }

        try {
          const payload =
            await authApi.verifyLoginOtp(
              normalizedEmail,
              normalizedOtp
            );

          const authenticatedUser =
            normalizeUser(payload);

          if (!authenticatedUser) {
            return {
              ok: false,
              reason:
                "INVALID_SERVER_RESPONSE",
            };
          }

          setUser(
            authenticatedUser
          );

          saveSession(
            authenticatedUser
          );

          savePendingLoginTwoFactor(
            null
          );

          return {
            ok: true,
            user:
              authenticatedUser,
            email:
              normalizedEmail,
          };
        } catch (error) {
          return getAuthError(error);
        }
      },
      []
    );

  const register =
    useCallback(
      async (data) => {
        const registrationData =
          {
            displayName:
              String(
                data?.displayName ||
                data?.name ||
                ""
              ).trim(),

            email:
              normalizeEmail(
                data?.email
              ),

            password:
              String(
                data?.password ||
                ""
              ),
          };

        if (
          !registrationData.displayName ||
          !registrationData.email ||
          !registrationData.password
        ) {
          return {
            ok: false,
            reason:
              "INVALID_REGISTRATION_DATA",
          };
        }

        try {
          const payload =
            await authApi.register(
              registrationData
            );

          const registeredUser =
            normalizeUser(payload);

          if (!registeredUser) {
            return {
              ok: false,
              reason:
                "INVALID_SERVER_RESPONSE",
            };
          }

          setUser(
            registeredUser
          );

          saveSession(
            registeredUser
          );

          const pendingRegistration =
            {
              requestId:
                registeredUser.id ||
                `REQ-${Date.now()}`,

              userId:
                registeredUser.id ||
                null,

              name:
                registeredUser.displayName ||
                registrationData.displayName,

              email:
                registeredUser.email ||
                registrationData.email,

              role:
                registeredUser.role ||
                ROLES.APPLICANT,

              emailVerified:
                registeredUser.emailVerified !==
                undefined
                  ? registeredUser.emailVerified
                  : true,
            };

          savePendingRegistration(
            pendingRegistration
          );

          return {
            ok: true,
            user:
              registeredUser,

            requestId:
              pendingRegistration.requestId,

            userId:
              pendingRegistration.userId,

            email:
              pendingRegistration.email,

            role:
              pendingRegistration.role,

            emailVerified:
              pendingRegistration.emailVerified,
          };
        } catch (error) {
          return getAuthError(error);
        }
      },
      []
    );

  const getPendingRegistration =
    useCallback(
      () =>
        readPendingRegistration(),
      []
    );

  const resendVerification =
    useCallback(
      async () => {
        const pendingRegistration =
          readPendingRegistration();

        if (!pendingRegistration) {
          return {
            ok: false,
            reason:
              "NO_PENDING_REGISTRATION",
          };
        }

        return {
          ok: true,
          email:
            pendingRegistration.email ||
            null,

          requestId:
            pendingRegistration.requestId ||
            null,
        };
      },
      []
    );

  const verifyEmail =
    useCallback(
      async (token) => {
        const pendingRegistration =
          readPendingRegistration();

        if (!pendingRegistration) {
          return {
            ok: false,
            reason:
              "NO_PENDING_REGISTRATION",
          };
        }

        const verifiedRegistration =
          {
            ...pendingRegistration,
            emailVerified: true,
          };

        savePendingRegistration(
          verifiedRegistration
        );

        const storedUser =
          readSession();

        if (storedUser) {
          const verifiedUser =
            {
              ...storedUser,
              emailVerified: true,
            };

          setUser(
            verifiedUser
          );

          saveSession(
            verifiedUser
          );
        }

        return {
          ok: true,
          user:
            storedUser
              ? {
                  ...storedUser,
                  emailVerified: true,
                }
              : null,

          emailVerified: true,

          token:
            token || null,
        };
      },
      []
    );

  const updateUserProfile =
    useCallback(
      (patch = {}) => {
        if (!user) {
          return {
            ok: false,
            reason:
              "NOT_AUTHENTICATED",
          };
        }

        const nextUser = {
          ...user,
          ...patch,
        };

        setUser(nextUser);
        saveSession(nextUser);

        return {
          ok: true,
          user: nextUser,
        };
      },
      [user]
    );

  const logout =
    useCallback(() => {
      saveSession(null);

      savePendingRegistration(
        null
      );

      savePendingLoginTwoFactor(
        null
      );

      setUser(null);

      return {
        ok: true,
      };
    }, []);

  const resetMockAuthentication =
    useCallback(() => {
      saveSession(null);

      savePendingRegistration(
        null
      );

      savePendingLoginTwoFactor(
        null
      );

      setUser(null);

      return {
        ok: true,
      };
    }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      isAuthenticated:
        Boolean(user),

      login,
      verifyLoginOtp,
      register,
      logout,

      getPendingLoginTwoFactor:
        () =>
          readPendingLoginTwoFactor(),

      getPendingRegistration,
      resendVerification,
      verifyEmail,

      updateUserProfile,
      resetMockAuthentication,
    }),
    [
      user,
      loading,
      login,
      verifyLoginOtp,
      register,
      logout,
      getPendingRegistration,
      resendVerification,
      verifyEmail,
      updateUserProfile,
      resetMockAuthentication,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;
