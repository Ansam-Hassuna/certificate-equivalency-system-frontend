import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "./LanguageContext";
import { useTheme } from "./ThemeContext";

const AppContext = createContext(null);

// Compatibility facade for legacy pages. New code should use useAuth,
// useLanguage, and useTheme directly.
export function AppProvider({ children }) {
  return children;
}

export function AppBridge({ children }) {
  const auth = useAuth();
  const language = useLanguage();
  const theme = useTheme();

  const value = useMemo(
    () => ({
      ...auth,
      ...language,
      ...theme,
    }),
    [auth, language, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppBridge");
  return context;
}

export default AppContext;
