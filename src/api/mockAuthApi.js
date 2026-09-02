import { PERMISSIONS } from "../auth/permissions";
import { ROLES, ROLE_PERMISSIONS } from "../auth/roles";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/*
 * Frontend-only authentication adapter.
 *
 * This exists because the production API is not ready yet.
 * It intentionally keeps the same authApi shape used by AuthContext
 * so the real backend can replace this adapter later without
 * rewriting the authentication UI.
 *
 * IMPORTANT:
 * These credentials are demo-only and must never be used in production.
 */

const REGISTERED_USERS_KEY = "ce_mock_registered_users";
const SESSION_KEY = "ce_auth_session";

const isBrowser = typeof window !== "undefined";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function readRegisteredUsers() {
  if (!isBrowser) return [];

  try {
    const value = window.sessionStorage.getItem(REGISTERED_USERS_KEY);
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



function toSafeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    name: user.name || user.displayName,
    role: user.role,
    imageUrl: user.imageUrl || null,
    emailVerified:
      user.emailVerified !== undefined ? user.emailVerified : true,
    active: user.active !== undefined ? user.active : true,
    permissions: Array.isArray(user.permissions)
      ? user.permissions
      : ROLE_PERMISSIONS[user.role] || [PERMISSIONS.AUTHENTICATED],
    token: user.token || `mock-token-${user.id}`,
  };
}

export const authApi = {
  async session() {
    if (!isBrowser) return null;

    try {
      const stored = window.sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  async login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/Account/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error("Invalid email or password.");
    error.code = "INVALID_CREDENTIALS";
    error.status = response.status;
    throw error;
  }

  return data;
},

async register(data) {
  const email = normalizeEmail(data?.email);

  const displayName = String(
    data?.displayName || data?.name || ""
  ).trim();

  const password = String(
    data?.password || ""
  );

  if (!email || !displayName || !password) {
    const error = new Error("Invalid registration data.");
    error.code = "INVALID_REGISTRATION_DATA";
    error.status = 400;
    throw error;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/Account/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName: displayName,
        email: email,
        password: password,
      }),
    }
  );

  const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(
        responseData?.message || "Registration failed."
      );

      error.code =
        responseData?.code || "REGISTER_FAILED";

      error.status = response.status;

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
  window.sessionStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(REGISTERED_USERS_KEY);
}

export default authApi;



