import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROLES } from "./roles";
import { authApi } from "../api/mockAuthApi";

class ApiError extends Error {
  constructor(message, status, code = "API_ERROR", details = null) {
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

const isBrowser = typeof window !== "undefined";

/* -------------------------------------------------------
   Storage helpers
------------------------------------------------------- */

function readSession() {
  if (!isBrowser) return null;

  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);

    if (!value) return null;

    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (!isBrowser) return;

  if (!user) {
    window.sessionStorage.removeItem(SESSION_KEY);
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
    window.sessionStorage.removeItem(PENDING_KEY);
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
      window.sessionStorage.getItem(PENDING_KEY);

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


/* -------------------------------------------------------
   JWT helpers
------------------------------------------------------- */

function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const parts = String(token).split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((char) =>
            "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2)
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


/* -------------------------------------------------------
   Normalize backend user
------------------------------------------------------- */

function normalizeUser(payload) {
  if (!payload) return null;

  /*
   * The current API returns:
   *
   * {
   *   id,
   *   email,
   *   displayName,
   *   token,
   *   imageUrl
   * }
   *
   * The token is kept in memory/session because the
   * current backend uses JWT authentication.
   */

  const data = payload.user || payload;

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName:
      data.displayName ||
      data.name ||
      "",
    name:
      data.name ||
      data.displayName ||
      "",
    role:
      data.role ||
      getRoleFromToken(data.token) ||
      ROLES.APPLICANT,
    imageUrl:
      data.imageUrl || null,
    token:
      data.token || null,

    /*
     * These fields may not currently be returned
     * by the backend. They remain optional.
     */
    emailVerified:
      data.emailVerified !== undefined
        ? data.emailVerified
        : true,

    active:
      data.active !== undefined
        ? data.active
        : true,

    permissions:
      Array.isArray(data.permissions)
        ? data.permissions
        : [],
  };
}


/* -------------------------------------------------------
   Error helper
------------------------------------------------------- */

function getAuthError(error) {
  if (error instanceof ApiError || error?.code) {
    return {
      ok: false,
      reason: error.code || "API_ERROR",
      message: error.message,
      status: error.status,
      details: error.details,
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


/* -------------------------------------------------------
   Auth Provider
------------------------------------------------------- */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readSession()
  );

  const [loading, setLoading] = useState(true);


  /* ---------------------------------------------------
     Restore Session
     --------------------------------------------------- */

  const restoreSession = useCallback(async () => {
    const storedUser = readSession();

    /*
     * Frontend development mode: restore from the local
     * mock authentication adapter. The production API
     * adapter will replace this later without changing
     * the authentication UI or RBAC layer.
     */
    try {
      const payload = await authApi.session();

      const restoredUser = normalizeUser(payload);

      if (restoredUser) {
        setUser(restoredUser);
        saveSession(restoredUser);

        return restoredUser;
      }

      setUser(null);
      saveSession(null);

      return null;
    } catch {
      /*
       * If there is no valid refresh cookie, simply
       * fall back to the existing local session.
       *
       * This does NOT authenticate a new user.
       */
      if (storedUser?.token) {
        setUser(storedUser);
        return storedUser;
      }

      setUser(null);
      saveSession(null);

      return null;
    }
  }, []);


  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
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


  /* ---------------------------------------------------
     Login
     --------------------------------------------------- */

  const login = useCallback(
    async (email, password) => {
      const normalizedEmail =
        normalizeEmail(email);

      if (!normalizedEmail || !password) {
        return {
          ok: false,
          reason: "INVALID_CREDENTIALS",
        };
      }

      try {
        const payload = await authApi.login(
          normalizedEmail,
          password
        );

        const authenticatedUser =
          normalizeUser(payload);

        if (!authenticatedUser) {
          return {
            ok: false,
            reason: "INVALID_SERVER_RESPONSE",
          };
        }

        setUser(authenticatedUser);
        saveSession(authenticatedUser);

        console.log("Authenticated user:", authenticatedUser);
        console.log("User role:", authenticatedUser.role);

        return {
          ok: true,
          user: authenticatedUser,
        };
      } catch (error) {
        return getAuthError(error);
      }
    },
    []
  );


  /* ---------------------------------------------------
     Register
     --------------------------------------------------- */

  const register = useCallback(
    async (data) => {
      const registrationData = {
        displayName: String(
          data?.displayName ||
          data?.name ||
          ""
        ).trim(),

        email: normalizeEmail(data?.email),

        password: String(
          data?.password || ""
        ),
      };

      if (
        !registrationData.displayName ||
        !registrationData.email ||
        !registrationData.password
      ) {
        return {
          ok: false,
          reason: "INVALID_REGISTRATION_DATA",
        };
      }

      try {
        const payload = await authApi.register(
          registrationData
        );

        const registeredUser =
          normalizeUser(payload);

        if (!registeredUser) {
          return {
            ok: false,
            reason: "INVALID_SERVER_RESPONSE",
          };
        }

        setUser(registeredUser);
        saveSession(registeredUser);

        const pendingRegistration = {
          requestId:
            registeredUser.id ||
            `REQ-${Date.now()}`,

          userId:
            registeredUser.id || null,

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
            registeredUser.emailVerified !== undefined
              ? registeredUser.emailVerified
              : true,
        };

        savePendingRegistration(
          pendingRegistration
        );

        return {
          ok: true,
          user: registeredUser,
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


  /* ---------------------------------------------------
     Pending Registration
     --------------------------------------------------- */

  const getPendingRegistration = useCallback(() => {
    return readPendingRegistration();
  }, []);


  /* ---------------------------------------------------
     Resend Verification
     --------------------------------------------------- */

  const resendVerification = useCallback(async () => {
    const pendingRegistration =
      readPendingRegistration();

    if (!pendingRegistration) {
      return {
        ok: false,
        reason: "NO_PENDING_REGISTRATION",
      };
    }

    /*
     * Email verification is currently handled by the
     * frontend flow. The backend does not provide a
     * verification endpoint in the current API.
     */
    return {
      ok: true,
      email:
        pendingRegistration.email || null,
      requestId:
        pendingRegistration.requestId || null,
    };
  }, []);


  /* ---------------------------------------------------
     Verify Email
     --------------------------------------------------- */

  const verifyEmail = useCallback(
    async (token) => {
      const pendingRegistration =
        readPendingRegistration();

      if (!pendingRegistration) {
        return {
          ok: false,
          reason: "NO_PENDING_REGISTRATION",
        };
      }

      /*
       * The current backend does not expose an email
       * verification endpoint.
       *
       * Keep the existing frontend verification flow
       * for compatibility with the application UI.
       */
      const verifiedRegistration = {
        ...pendingRegistration,
        emailVerified: true,
      };

      savePendingRegistration(
        verifiedRegistration
      );

      const storedUser =
        readSession();

      if (storedUser) {
        const verifiedUser = {
          ...storedUser,
          emailVerified: true,
        };

        setUser(verifiedUser);
        saveSession(verifiedUser);
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
        token: token || null,
      };
    },
    []
  );


  /* ---------------------------------------------------
     Logout
     --------------------------------------------------- */

  const logout = useCallback(() => {
    saveSession(null);
    savePendingRegistration(null);
    setUser(null);

    return {
      ok: true,
    };
  }, []);

  /* ---------------------------------------------------
     Reset Authentication
     --------------------------------------------------- */

  const resetMockAuthentication =
    useCallback(() => {
      /*
       * Kept for backwards compatibility with existing
       * frontend components.
       *
       * It no longer resets a local user database.
       */
      saveSession(null);
      savePendingRegistration(null);
      setUser(null);

      return {
        ok: true,
      };
    }, []);


  /* ---------------------------------------------------
     Context Value
     --------------------------------------------------- */

  const value = useMemo(
    () => ({
      user,

      loading,

      isAuthenticated:
        Boolean(user),

      login,

      register,

      logout,

      getPendingRegistration,

      resendVerification,

      verifyEmail,

      resetMockAuthentication,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      getPendingRegistration,
      resendVerification,
      verifyEmail,
      resetMockAuthentication,
    ]
  );


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


/* -------------------------------------------------------
   useAuth
------------------------------------------------------- */

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











