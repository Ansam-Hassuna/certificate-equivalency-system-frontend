import { PERMISSIONS } from "../auth/permissions";
import { ROLES, ROLE_PERMISSIONS } from "../auth/roles";

const SESSION_KEY = "ce_auth_session";
const REGISTERED_USERS_KEY = "ce_mock_registered_users";
const USER_OVERRIDES_KEY = "ce_mock_user_overrides";

const isBrowser =
  typeof window !== "undefined";

const DEMO_USERS = [
  {
    id: "mock-user-admin",
    email: "admin@test.com",
    displayName: "System Administrator",
    role: ROLES.ADMIN,
    password: "Demo@12345",
  },
  {
    id: "mock-user-manager",
    email: "manager@test.com",
    displayName: "System Manager",
    role: ROLES.MANAGER,
    password: "Demo@12345",
  },
  {
    id: "mock-user-equivalency",
    email: "equivalency@test.com",
    displayName: "Equivalency Officer",
    role: ROLES.EQUIVALENCY,
    password: "Demo@12345",
  },
  {
    id: "mock-user-receiving",
    email: "receiving@test.com",
    displayName: "Receiving Officer",
    role: ROLES.RECEIVING,
    password: "Demo@12345",
  },
  {
    id: "mock-user-office",
    email: "office@test.com",
    displayName: "Higher Education Office Officer",
    role: ROLES.OFFICE,
    password: "Demo@12345",
  },
  {
    id: "mock-user-inquiry",
    email: "inquiry@test.com",
    displayName: "Inquiry Officer",
    role: ROLES.INQUIRY,
    password: "Demo@12345",
  },
  {
    id: "mock-user-committee",
    email: "committee@test.com",
    displayName: "Committee Member",
    role: ROLES.COMMITTEE_MEMBER,
    password: "Demo@12345",
  },
  {
    id: "mock-user-archive",
    email: "archive@test.com",
    displayName: "Archive Officer",
    role: ROLES.ARCHIVE,
    password: "Demo@12345",
  },
  {
    id: "mock-user-printing",
    email: "printing@test.com",
    displayName: "Printing Officer",
    role: ROLES.PRINTING,
    password: "Demo@12345",
  },
  {
    id: "mock-user-applicant",
    email: "applicant@test.com",
    displayName: "Applicant User",
    role: ROLES.APPLICANT,
    password: "Demo@12345",
  },
];

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

function readUserOverrides() {
  if (!isBrowser) return {};

  try {
    const value =
      window.sessionStorage.getItem(
        USER_OVERRIDES_KEY
      );

    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function saveUserOverrides(overrides) {
  if (!isBrowser) return;

  window.sessionStorage.setItem(
    USER_OVERRIDES_KEY,
    JSON.stringify(overrides)
  );
}

function getUsers() {
  const overrides = readUserOverrides();

  return [
    ...DEMO_USERS,
    ...readRegisteredUsers(),
  ].map((user) => ({
    ...user,
    ...(overrides[user.id] || {}),
  }));
}

function getPermissions(role) {
  return (
    ROLE_PERMISSIONS[role] || [
      PERMISSIONS.AUTHENTICATED,
    ]
  );
}

function toSafeUser(user) {
  const role =
    user.role || ROLES.APPLICANT;

  return {
    id: user.id,
    email: normalizeEmail(user.email),
    displayName:
      user.displayName ||
      user.name ||
      "",
    name:
      user.name ||
      user.displayName ||
      "",
    role,
    imageUrl:
      user.imageUrl || null,
    emailVerified:
      user.emailVerified !== undefined
        ? Boolean(user.emailVerified)
        : true,
    active:
      user.active !== undefined
        ? Boolean(user.active)
        : true,
    permissions:
      Array.isArray(user.permissions) &&
      user.permissions.length > 0
        ? user.permissions
        : getPermissions(role),
    token:
      user.token ||
      `mock-token-${user.id}`,
  };
}

export const authApi = {
  async session() {
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
  },

  async login(email, password) {
    const normalizedEmail =
      normalizeEmail(email);

    const user = getUsers().find(
      (item) =>
        normalizeEmail(item.email) ===
        normalizedEmail
    );

    if (
      !user ||
      String(user.password) !==
        String(password)
    ) {
      const error = new Error(
        "Invalid email or password."
      );

      error.code =
        "INVALID_CREDENTIALS";

      error.status = 401;

      throw error;
    }

    if (user.active === false) {
      const error = new Error(
        "This account is inactive."
      );

      error.code =
        "ACCOUNT_INACTIVE";

      error.status = 403;

      throw error;
    }

    return toSafeUser(user);
  },

  async register(data) {
    const email =
      normalizeEmail(data?.email);

    const displayName =
      String(
        data?.displayName ||
          data?.name ||
          ""
      ).trim();

    const password =
      String(data?.password || "");

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

    const exists = getUsers().some(
      (item) =>
        normalizeEmail(item.email) ===
        email
    );

    if (exists) {
      const error = new Error(
        "An account with this email already exists."
      );

      error.code =
        "EMAIL_ALREADY_EXISTS";

      error.status = 409;

      throw error;
    }

    const newUser = {
      id:
        `mock-user-${Date.now()}`,
      email,
      displayName,
      name: displayName,
      role: ROLES.APPLICANT,
      password,
      emailVerified: false,
      active: true,
    };

    const users =
      readRegisteredUsers();

    users.push(newUser);

    saveRegisteredUsers(users);

    return toSafeUser(newUser);
  },

  async listUsers() {
    return getUsers().map((user) => ({
      ...toSafeUser(user),
      permissions: getPermissions(
        user.role
      ),
    }));
  },

  async updateUserRole(
    userId,
    role
  ) {
    if (
      !userId ||
      !Object.values(ROLES).includes(role)
    ) {
      const error = new Error(
        "Invalid user or role."
      );

      error.code = "INVALID_USER_ROLE";
      error.status = 400;

      throw error;
    }

    const users = getUsers();
    const user = users.find(
      (item) => item.id === userId
    );

    if (!user) {
      const error = new Error(
        "User not found."
      );

      error.code = "USER_NOT_FOUND";
      error.status = 404;

      throw error;
    }

    const overrides = readUserOverrides();

    overrides[userId] = {
      ...(overrides[userId] || {}),
      role,
      permissions: getPermissions(role),
    };

    saveUserOverrides(overrides);

    return {
      ...toSafeUser({
        ...user,
        role,
        permissions: getPermissions(role),
      }),
      permissions: getPermissions(role),
    };
  },

  async setUserActive(
    userId,
    active
  ) {
    if (!userId) {
      const error = new Error(
        "User ID is required."
      );

      error.code = "USER_ID_REQUIRED";
      error.status = 400;

      throw error;
    }

    const users = getUsers();
    const user = users.find(
      (item) => item.id === userId
    );

    if (!user) {
      const error = new Error(
        "User not found."
      );

      error.code = "USER_NOT_FOUND";
      error.status = 404;

      throw error;
    }

    const overrides = readUserOverrides();

    overrides[userId] = {
      ...(overrides[userId] || {}),
      active: Boolean(active),
    };

    saveUserOverrides(overrides);

    return {
      ...toSafeUser({
        ...user,
        active: Boolean(active),
      }),
      permissions: getPermissions(
        user.role
      ),
    };
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

  window.sessionStorage.removeItem(
    USER_OVERRIDES_KEY
  );
}

export default authApi;


