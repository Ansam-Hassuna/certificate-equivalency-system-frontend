import { PERMISSIONS } from "../auth/permissions";
import { ROLES, ROLE_PERMISSIONS } from "../auth/roles";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

const SESSION_KEY = "ce_auth_session";

const isBrowser =
  typeof window !== "undefined";

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function getPermissions(role) {
  return (
    ROLE_PERMISSIONS[role] || [
      PERMISSIONS.AUTHENTICATED,
    ]
  );
}

function getStoredSession() {
  if (!isBrowser) return null;

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
}

function getStoredToken() {
  const session =
    getStoredSession();

  return (
    session?.token ||
    session?.accessToken ||
    session?.user?.token ||
    session?.user?.accessToken ||
    null
  );
}

function getAuthHeaders() {
  const token =
    getStoredToken();

  return {
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function parseResponse(response) {
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
        data?.title ||
        `Request failed with status ${response.status}.`
    );

    error.status =
      response.status;

    error.details = data;

    throw error;
  }

  return data;
}

function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const parts =
      String(token).split(".");

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

    const payload =
      JSON.parse(
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

function normalizePermissions(
  data,
  role
) {
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

  return getPermissions(role);
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
    (Array.isArray(data.roles)
      ? data.roles[0]
      : data.roles) ||
    getRoleFromToken(token) ||
    ROLES.APPLICANT;

  return {
    id:
      data.id ||
      data.userId ||
      data.Id ||
      null,

    email:
      data.email ||
      data.Email ||
      "",

    displayName:
      data.displayName ||
      data.DisplayName ||
      data.name ||
      data.Name ||
      data.email ||
      data.Email ||
      "",

    name:
      data.name ||
      data.Name ||
      data.displayName ||
      data.DisplayName ||
      "",

    role,

    roles:
      Array.isArray(data.roles)
        ? data.roles
        : role
          ? [role]
          : [],

    imageUrl:
      data.imageUrl ||
      data.avatarUrl ||
      null,

    emailVerified:
      data.emailVerified !==
        undefined
        ? Boolean(
            data.emailVerified
          )
        : true,

    active:
      data.active !== undefined
        ? Boolean(data.active)
        : data.isActive !==
            undefined
          ? Boolean(
              data.isActive
            )
          : true,

    permissions:
      normalizePermissions(
        data,
        role
      ),

    token,
  };
}

function normalizeLoginResponse(
  payload
) {
  const user =
    normalizeApiUser(payload);

  if (!user) return null;

  return {
    ...payload,
    user,
    ...(!payload.user
      ? user
      : {}),
  };
}

function normalizeUserList(payload) {
  const users =
    Array.isArray(payload)
      ? payload
      : Array.isArray(
            payload?.users
          )
        ? payload.users
        : Array.isArray(
              payload?.data
            )
          ? payload.data
          : [];

  return users
    .map((item) =>
      normalizeApiUser(item)
    )
    .filter(Boolean);
}

export const authApi = {
  async session() {
    return getStoredSession();
  },

  async login(
    email,
    password
  ) {
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
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            email:
              normalizedEmail,

            password:
              String(password),
          }),
        }
      );
    } catch (networkError) {
      const error = new Error(
        networkError?.message ||
          "Unable to connect to the authentication server."
      );

      error.code =
        "NETWORK_ERROR";

      error.status = 0;

      error.details =
        networkError;

      throw error;
    }

    const data =
      await parseResponse(
        response
      );

    const normalizedResponse =
      normalizeLoginResponse(
        data
      );

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
        data?.password || ""
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

    return parseResponse(
      response
    );
  },

  async listUsers() {
    if (!API_BASE_URL) {
      const error = new Error(
        "API base URL is not configured."
      );

      error.code =
        "API_BASE_URL_MISSING";

      error.status = 500;

      throw error;
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/Admin/users-with-roles`,
        {
          method: "GET",

          headers:
            getAuthHeaders(),
        }
      );
    } catch (networkError) {
      const error = new Error(
        networkError?.message ||
          "Unable to connect to the server."
      );

      error.code =
        "NETWORK_ERROR";

      error.status = 0;

      error.details =
        networkError;

      throw error;
    }

    const data =
      await parseResponse(
        response
      );

    return normalizeUserList(
      data
    );
  },

  async updateUserRole(
    userId,
    role
  ) {
    if (!API_BASE_URL) {
      const error = new Error(
        "API base URL is not configured."
      );

      error.code =
        "API_BASE_URL_MISSING";

      error.status = 500;

      throw error;
    }

    if (!userId) {
      const error = new Error(
        "User ID is required."
      );

      error.code =
        "USER_ID_REQUIRED";

      error.status = 400;

      throw error;
    }

    if (
      !Object.values(
        ROLES
      ).includes(role)
    ) {
      const error = new Error(
        "Invalid role."
      );

      error.code =
        "INVALID_ROLE";

      error.status = 400;

      throw error;
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/api/Admin/edit-roles/${encodeURIComponent(
          userId
        )}?roles=${encodeURIComponent(
          role
        )}`,
        {
          method: "POST",

          headers:
            getAuthHeaders(),
        }
      );
    } catch (networkError) {
      const error = new Error(
        networkError?.message ||
          "Unable to connect to the server."
      );

      error.code =
        "NETWORK_ERROR";

      error.status = 0;

      error.details =
        networkError;

      throw error;
    }

    return parseResponse(
      response
    );
  },

  async setUserActive(
    userId,
    active
  ) {
    const error = new Error(
      "Changing user account status is not supported by the current backend API."
    );

    error.code =
      "USER_STATUS_API_NOT_IMPLEMENTED";

    error.status = 501;

    throw error;
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
}

export default authApi;
