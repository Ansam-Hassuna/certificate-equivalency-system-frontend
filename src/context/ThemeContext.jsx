import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

export const STORAGE_KEY = "certificate-equivalency-theme";

export const THEMES = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
});

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return THEMES.LIGHT;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return THEMES.LIGHT;
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK) {
    return savedTheme;
  }

  return getSystemTheme();
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setThemeMode = useCallback((newTheme) => {
    if (newTheme !== THEMES.LIGHT && newTheme !== THEMES.DARK) {
      return;
    }

    setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      isLight: theme === THEMES.LIGHT,
      setTheme: setThemeMode,
      toggleTheme,
      THEMES,
    }),
    [theme, setThemeMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};

export default ThemeContext;
