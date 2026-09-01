import React from "react";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import "./PublicHeader.css";

export default function PublicHeader({ showLogin = true }) {
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link className="public-brand" to="/" aria-label={t("common.appName")}>
          <span className="public-brand-mark" aria-hidden="true"><img src={`${process.env.PUBLIC_URL}/ministry-logo.jpg`} alt="" /></span>
          <span className="public-brand-copy">
            <strong>{t("common.appName")}</strong>
            <small>{t("common.ministryName")}</small>
          </span>
        </Link>

        <div className="public-header-actions">
          {showLogin && (
            <Link className="public-login-button" to="/login">
              {t("intro.login")}
            </Link>
          )}

          <button
            type="button"
            className="public-header-button public-language-button"
            onClick={toggleLanguage}
            aria-label={t("header.language")}
            title={t("header.language")}
          >
            <span>{language === "ar" ? "AR" : "EN"}</span>
            <Icon name="globe" size={16} />
          </button>

          <button
            type="button"
            className="public-header-button public-header-icon-button"
            onClick={toggleTheme}
            aria-label={isDark ? t("header.lightMode") : t("header.darkMode")}
            title={isDark ? t("header.lightMode") : t("header.darkMode")}
          >
            <Icon name={isDark ? "sun" : "moon"} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
