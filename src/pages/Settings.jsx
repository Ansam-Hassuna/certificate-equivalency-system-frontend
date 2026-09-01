import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

export default function Settings() {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  return (
    <ScreenShell title={t("settings.title")} description={t("settings.description")} icon="settings">
      <div className="settings-grid">
        <Card>
          <div className="settings-item">
            <span className="settings-icon"><Icon name="globe" size={20} /></span>
            <div><strong>{t("settings.language")}</strong><p>{language === "ar" ? "العربية" : "English"}</p></div>
            <Button variant="secondary" onClick={toggleLanguage}>{language === "ar" ? "EN" : "عربي"}</Button>
          </div>
        </Card>
        <Card>
          <div className="settings-item">
            <span className="settings-icon"><Icon name={isDark ? "sun" : "moon"} size={20} /></span>
            <div><strong>{t("settings.theme")}</strong><p>{isDark ? t("theme.dark") : t("theme.light")}</p></div>
            <Button variant="secondary" onClick={toggleTheme}>{isDark ? t("settings.light") : t("settings.dark")}</Button>
          </div>
        </Card>
      </div>
    </ScreenShell>
  );
}
