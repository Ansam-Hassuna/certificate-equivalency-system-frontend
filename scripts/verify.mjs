import fs from "node:fs";
import path from "node:path";

const required = [
  "src/index.js",
  "src/app/App.jsx",
  "src/app/AppRouter.jsx",
  "src/api/mockAuthApi.js",
  "src/auth/permissions.js",
  "src/auth/roles.js",
  "src/auth/accessControl.js",
  "src/auth/guards.jsx",
  "src/auth/useAuthorization.js",
  "src/context/AppContext.jsx",
  "src/context/ThemeContext.jsx",
  "src/context/LanguageContext.jsx",
  "src/components/layout/AppLayout.jsx",
  "src/components/layout/Header.jsx",
  "src/components/layout/Footer.jsx",
  "src/components/navigation/HamburgerMenu.jsx",
  "src/components/ui/Table.jsx",
  "src/components/ui/SearchBar.jsx",
  "src/components/ui/Pagination.jsx",
  "src/styles/tokens.css",
  "src/styles/themes.css",
  "src/styles/globals.css",
  "src/i18n/ar.js",
  "src/i18n/en.js",
  "src/i18n/translations.js",
  "src/pages/Login.jsx",
  "src/pages/Register.jsx",
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));

if (missing.length) {
  console.error("Missing files:", missing);
  process.exit(1);
}

console.log("Base structure verification passed.");

