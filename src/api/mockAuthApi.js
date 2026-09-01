import { PERMISSIONS } from "../auth/permissions";
import { ROLES, ROLE_PERMISSIONS } from "../auth/roles";

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

const DEMO_PASSWORDS = Object.freeze({
  "admin@test.com": "Pa$$w0rd",
  "manager@test.com": "Demo@12345",
  "equivalency@test.com": "Demo@12345",
  "receiving@test.com": "Demo@12345",
  "inquiry@test.com": "Demo@12345",
  "archive@test.com": "Demo@12345",
  "committee.coordinator@test.com": "Demo@12345",
  "committee.member@test.com": "Demo@12345",
  "office@test.com": "Demo@12345",
  "printing@test.com": "Demo@12345",
  "applicant@test.com": "Demo@12345",
});

const DEMO_USERS = [
  ["admin@test.com", "Admin", ROLES.ADMIN],
  ["manager@test.com", "Equivalency Manager", ROLES.MANAGER],
  ["equivalency@test.com", "Equivalency Officer", ROLES.EQUIVALENCY],
  ["receiving@test.com", "Receiving Officer", ROLES.RECEIVING],
  ["inquiry@test.com", "Inquiry Officer", ROLES.INQUIRY],
  ["archive@test.com", "Archive Officer", ROLES.ARCHIVE],
  ["committee.coordinator@test.com", "Committee Coordinator", ROLES.COMMITTEE_COORDINATOR],
  ["committee.member@test.com", "Committee Member", ROLES.COMMITTEE_MEMBER],
  ["office@test.com", "Higher Education Office Officer", ROLES.OFFICE],
  ["printing@test.com", "Printing Officer", ROLES.PRINTING],
  ["applicant@test.com", "Applicant", ROLES.APPLICANT],
].map((entry, index) => {
  const email = entry[0];
  const displayName = entry[1];
  const role = entry[2];

  return {
    id: `mock-user-${String(index + 1).padStart(3, "0")}`,
    email,
    displayName,
    name: displayName,
    role,
    imageUrl: null,
    emailVerified: true,
    active: true,
    permissions: ROLE_PERMISSIONS[role] || [PERMISSIONS.AUTHENTICATED],
  };
});

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

function findUser(email) {
  const normalizedEmail = normalizeEmail(email);

  return (
    DEMO_USERS.find((user) => user.email === normalizedEmail) ||
    readRegisteredUsers().find((user) => user.email === normalizedEmail) ||
    null
  );
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
    const normalizedEmail = normalizeEmail(email);
    const user = findUser(normalizedEmail);

    if (!user || DEMO_PASSWORDS[normalizedEmail] !== password) {
      const registered = readRegisteredUsers().find(
        (item) => item.email === normalizedEmail
      );

      const error = new Error("Invalid email or password.");
      error.code = "INVALID_CREDENTIALS";
      error.status = 401;
      throw error;
    }

    return toSafeUser(user);
  },

  async register(data) {
    const email = normalizeEmail(data?.email);
    const displayName = String(
      data?.displayName || data?.name || ""
    ).trim();
    const password = String(data?.password || "");

    if (!email || !displayName || !password) {
      const error = new Error("Invalid registration data.");
      error.code = "INVALID_REGISTRATION_DATA";
      error.status = 400;
      throw error;
    }

    if (findUser(email)) {
      const error = new Error("Email already exists.");
      error.code = "EMAIL_EXISTS";
      error.status = 409;
      throw error;
    }

    const user = {
      id: `mock-registered-${Date.now()}`,
      email,
      displayName,
      name: displayName,
      role: ROLES.APPLICANT,
      imageUrl: null,
      emailVerified: false,
      active: true,
      permissions: ROLE_PERMISSIONS[ROLES.APPLICANT],
    };

    saveRegisteredUsers([
      ...readRegisteredUsers(),
      user,
    ]);

    return toSafeUser(user);
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



