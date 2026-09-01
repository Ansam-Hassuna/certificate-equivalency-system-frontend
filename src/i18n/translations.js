import ar from "./ar";
import en from "./en";

const translations = Object.freeze({ ar, en });

export const getTranslation = (language, key) => {
  const dictionary = translations[language] || translations.ar;

  if (!key || typeof key !== "string") {
    return "";
  }

  const value = key.split(".").reduce((current, part) => {
    if (
      current &&
      Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return current[part];
    }

    return undefined;
  }, dictionary);

  return typeof value === "string" ? value : key;
};

export const getDictionary = (language) =>
  translations[language] || translations.ar;

export const hasTranslation = (language, key) =>
  getTranslation(language, key) !== key;

export default translations;
