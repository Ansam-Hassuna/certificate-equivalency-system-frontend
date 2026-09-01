import React from "react";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABELS } from "../config/roles";
import { PERMISSIONS } from "../auth/permissions";
import { useAuthorization } from "../auth/useAuthorization";
import { useLanguage } from "../context/LanguageContext";

export default function Roles() {
  const { user } = useAuth();
  const { can } = useAuthorization();
  const { language, t } = useLanguage();

  if (!can(PERMISSIONS.VIEW_ROLE_PROFILE)) return null;

  const label = ROLE_LABELS[user?.role] || { ar: "مستخدم النظام", en: "System User" };

  return (
    <main className="roles-page page">
      <section className="role-hero card">
        <div>
          <span className="role-kicker">{t("navigation.roleProfile")}</span>
          <h1>{t("roles.title")}</h1>
          <p>{t("roles.description")}</p>
        </div>
        <div className="role-badge">{label[language]}</div>
      </section>

      <section className="security-card card">
        <h2>{t("roles.session")}</h2>
        <dl className="role-details">
          <div><dt>{t("roles.user")}</dt><dd>{user?.name || "—"}</dd></div>
          <div><dt>{t("roles.roleCode")}</dt><dd>{user?.role || "—"}</dd></div>
          <div><dt>{t("roles.userId")}</dt><dd>{user?.id || "—"}</dd></div>
          <div><dt>{t("roles.email")}</dt><dd>{user?.email || "—"}</dd></div>
        </dl>
        <div className="security-note">{t("roles.note")}</div>
      </section>
    </main>
  );
}
