function getApiBaseUrl() {
  return String(
    process.env.REACT_APP_API_BASE_URL || ""
  ).replace(/\/+$/, "");
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

async function postJson(path, body) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    const error = new Error(
      "Backend API URL is not configured."
    );

    error.code = "API_BASE_URL_MISSING";
    error.status = 0;

    throw error;
  }

  let response;

  try {
    response = await fetch(
      `${baseUrl}${path}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  } catch (cause) {
    const error = new Error(
      "Unable to connect to the server."
    );

    error.code = "NETWORK_ERROR";
    error.status = 0;
    error.cause = cause;

    throw error;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.title ||
      data?.detail ||
      `Request failed with status ${response.status}.`;

    const error = new Error(message);

    error.status = response.status;
    error.code = "API_REQUEST_FAILED";
    error.response = data;

    throw error;
  }

  return data;
}

export const authApi = Object.freeze({
  async sendOtp(email) {
    return postJson(
      "/api/Account/send-otp",
      {
        email: normalizeEmail(email),
      }
    );
  },

  async verifyOtp(email, otp) {
    return postJson(
      "/api/Account/verify-otp",
      {
        email: normalizeEmail(email),
        otp: String(otp || "").trim(),
      }
    );
  },

  async login(email, password) {
    return postJson(
      "/api/Account/login",
      {
        email: normalizeEmail(email),
        password,
      }
    );
  },

  async verifyLoginOtp(email, otp) {
    return postJson(
      "/api/Account/verify-login-otp",
      {
        email: normalizeEmail(email),
        otp: String(otp || "").trim(),
      }
    );
  },

  async forgotPassword(email) {
    return postJson(
      "/api/Account/forgot-password",
      {
        email: normalizeEmail(email),
      }
    );
  },

  async resetPassword(
    email,
    token,
    newPassword
  ) {
    return postJson(
      "/api/Account/reset-password",
      {
        email: normalizeEmail(email),
        token,
        newPassword,
      }
    );
  },
});

export default authApi;
