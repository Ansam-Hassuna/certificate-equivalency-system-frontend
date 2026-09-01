import fs from "node:fs";

const files = [
  "src/auth/roles.js",
  "src/auth/permissions.js",
  "src/auth/accessControl.js",
  "src/auth/guards.jsx",
  "src/auth/useAuthorization.js",
];

const missing = files.filter((file) => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing RBAC files:", missing);
  process.exit(1);
}

console.log("RBAC structure verification passed.");
