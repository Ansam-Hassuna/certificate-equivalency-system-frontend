import { PERMISSIONS } from "../auth/permissions";
import { ROLES, ROLE_PERMISSIONS } from "../auth/roles";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const REGISTERED_USERS_KEY = "ce_mock_registered_users";
const SESSION_KEY = "ce_auth_session";

const isBrowser =
  typeof window !== "undefined";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function readRegisteredUsers() {
  if (!isBrowser) return [];

  try {
    const value =
      window.sessionStorage.getItem(
        REGISTERED_USERS_KEY
      );

    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  if (!isBrowser) return;

  window.sessionStorage.setItem(
    REGISTERED_USERS_KEY,
    JSON.stringify(users)
  );
}

function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const parts = String(token).split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
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

  return (
    ROLE_PERMISSIONS[role] || [
      PERMISSIONS.AUTHENTICATED,
    ]
  );
}

function normalizeApiUser(payload) {
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

  const role =
    data.role ||
    data.roles?.[0] ||
    getRoleFromToken(token) ||
    ROLES.APPLICANT;

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

    emailVerified:
      data.emailVerified !== undefined
        ? Boolean(data.emailVerified)
        : true,

    active:
      data.active !== undefined
        ? Boolean(data.active)
        : true,

    permissions,

    token,
  };
}

function normalizeLoginResponse(payload) {
  const user =
    normalizeApiUser(payload);

  if (!user) return null;

  if (
    payload &&
    payload.user &&
    typeof payload.user === "object"
  ) {
    return {
      ...payload,
      user,
    };
  }

  return {
    ...payload,
    ...user,
  };
}

export const authApi = {
  async session() {
    if (!isBrowser) {
      return null;
    }

    try {
      const stored =
        window.sessionStorage.getItem(
          SESSION_KEY
        );

      return stored
        ? JSON.parse(stored)
        : null;
    } catch {
      return null;
    }
  },

  async login(email, password) {
    if (!API_BASE_URL) {
      const error = new Error(
        "API base URL is not configured."
      );

      error.code =
        "API_BASE_URL_MISSING";
      error.status = 500;

      throw error;
    }

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedEmail ||
      !String(password || "")
    ) {
      const error = new Error(
        "Invalid email or password."
      );

      error.code =
        "INVALID_CREDENTIALS";
      error.status = 400;

      throw error;
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/Account/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: String(password),
          }),
        }
      );
    } catch (networkError) {
      const error = new Error(
        networkError?.message ||
          "Unable to connect to the authentication server."
      );

      error.code = "NETWORK_ERROR";
      error.status = 0;
      error.details = networkError;

      throw error;
    }

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          data?.error ||
          "Invalid email or password."
      );

      error.code =
        data?.code ||
        "INVALID_CREDENTIALS";

      error.status =
        response.status;

      error.details = data;

      throw error;
    }

    const normalizedResponse =
      normalizeLoginResponse(data);

    if (!normalizedResponse) {
      const error = new Error(
        "The authentication server returned an invalid user response."
      );

      error.code =
        "INVALID_SERVER_RESPONSE";

      error.status = 502;
      error.details = data;

      throw error;
    }

    return normalizedResponse;
  },

  async register(data) {
    if (!API_BASE_URL) {
      const error = new Error(
        "API base URL is not configured."
      );

      error.code =
        "API_BASE_URL_MISSING";
      error.status = 500;

      throw error;
    }

    const email =
      normalizeEmail(data?.email);

    const displayName =
      String(
        data?.displayName ||
          data?.name ||
          ""
      ).trim();

    const password =
      String(
        data?.password ||
          ""
      );

    if (
      !email ||
      !displayName ||
      !password
    ) {
      const error = new Error(
        "Invalid registration data."
      );

      error.code =
        "INVALID_REGISTRATION_DATA";

      error.status = 400;

      throw error;
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/Account/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            displayName,
            email,
            password,
          }),
        }
      );
    } catch (networkError) {
      const error = new Error(
        networkError?.message ||
          "Unable to connect to the registration server."
      );

      error.code =
        "NETWORK_ERROR";

      error.status = 0;

      error.details =
        networkError;

      throw error;
    }

    let responseData = null;

    try {
      responseData =
        await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      const error = new Error(
        responseData?.message ||
          responseData?.error ||
          "Registration failed."
      );

      error.code =
        responseData?.code ||
        "REGISTER_FAILED";

      error.status =
        response.status;

      error.details =
        responseData;

      throw error;
    }

    return responseData;
  },

  async refresh() {
    return this.session();
  },
};

export function clearMockAuthData() {
  if (!isBrowser) return;

  window.sessionStorage.removeItem(
    SESSION_KEY
  );

  window.sessionStorage.removeItem(
    REGISTERED_USERS_KEY
  );
}

export default authApi;
