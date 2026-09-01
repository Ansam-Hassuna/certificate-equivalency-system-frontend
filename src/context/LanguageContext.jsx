import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTranslation } from "../i18n/translations";

const LanguageContext = createContext(null);

export const STORAGE_KEY = "certificate-equivalency-language";

export const LANGUAGES = Object.freeze({
  AR: "ar",
  EN: "en",
});

export const DIRECTIONS = Object.freeze({
  AR: "rtl",
  EN: "ltr",
});

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return LANGUAGES.AR;
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

  if (savedLanguage === LANGUAGES.AR || savedLanguage === LANGUAGES.EN) {
    return savedLanguage;
  }

  return LANGUAGES.AR;
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  const isArabic = language === LANGUAGES.AR;
  const isEnglish = language === LANGUAGES.EN;
  const direction = isArabic ? DIRECTIONS.AR : DIRECTIONS.EN;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", language);
    root.setAttribute("dir", direction);
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, direction]);

  const setLanguageMode = useCallback((newLanguage) => {
    if (newLanguage !== LANGUAGES.AR && newLanguage !== LANGUAGES.EN) {
      return;
    }

    setLanguage(newLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) =>
      currentLanguage === LANGUAGES.AR ? LANGUAGES.EN : LANGUAGES.AR
    );
  }, []);

  const t = useCallback(
    (key, variables = {}) => {
      const value = getTranslation(language, key);
      if (typeof value !== "string") return value;
      return Object.entries(variables).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
        value
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      direction,
      isArabic,
      isEnglish,
      setLanguage: setLanguageMode,
      toggleLanguage,
      t,
      LANGUAGES,
      DIRECTIONS,
    }),
    [
      language,
      direction,
      isArabic,
      isEnglish,
      setLanguageMode,
      toggleLanguage,
      t,
    ]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
};

export default LanguageContext;
