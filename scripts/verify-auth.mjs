import fs from "node:fs";

const required = [
  "src/auth/AuthContext.jsx",
  "src/auth/useAuth.js",
  "src/auth/guards.jsx",
  "src/auth/accessControl.js",
  "src/auth/roles.js",
  "src/auth/permissions.js",
  "src/pages/Login.jsx",
  "src/pages/Register.jsx",
  "src/pages/VerifyEmail.jsx",
  "src/pages/EmailVerified.jsx",
  "src/api/mockAuthApi.js",
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) { console.error("Missing authentication files:", missing); process.exit(1); }
const source = fs.readFileSync("src/auth/AuthContext.jsx", "utf8");
const checks = [
  ["AuthProvider", source.includes("export function AuthProvider")],
  ["useAuth", source.includes("export function useAuth")],
  ["auth session adapter", source.includes("authApi.session")],
  ["login adapter", source.includes("authApi.login")],
  ["registration adapter", source.includes("authApi.register")],
  ["no password hashing in frontend", !source.includes("subtle.digest")],
  ["no local user database", !source.includes("ce_verified_users")],
];
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) { console.error("Authentication security checks failed:", failed.map(([name]) => name)); process.exit(1); }
console.log("Authentication security verification passed.");

