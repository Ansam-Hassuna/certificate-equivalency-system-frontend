import React from "react";
import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";
import PublicHeader from "../components/public/PublicHeader";
import { useLanguage } from "../context/LanguageContext";
import "./PublicInfoPage.css";

export default function PublicInfoPage({ icon = "info", eyebrow, title, intro, sections = [], notice, backLabel }) {
  const { isArabic } = useLanguage();
  const Arrow = isArabic ? "arrowRight" : "arrowLeft";

  return (
    <main className="public-info-page">
      <div className="public-info-shell">
        <PublicHeader />
        <div className="public-info-content">
          <Link className="public-info-back" to="/">
            <Icon name={Arrow} size={17} />
            {backLabel}
          </Link>

          <header className="public-info-hero">
            <span className="public-info-icon"><Icon name={icon} size={30} /></span>
            <div>
              <span className="public-info-eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{intro}</p>
            </div>
          </header>

          <section className="public-info-sections">
            {sections.map((section) => (
              <article className="public-info-section" key={section.title}>
                <div className="public-info-section-title">
                  <span><Icon name={section.icon || "info"} size={19} /></span>
                  <h2>{section.title}</h2>
                </div>
                {section.text && <p>{section.text}</p>}
                {section.items && (
                  <ul>
                    {section.items.map((item, index) => (
                      <li key={`${section.title}-${index}`}>
                        <Icon name="check" size={17} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>

          {notice && (
            <aside className="public-info-notice">
              <Icon name="info" size={20} />
              <div><strong>{notice.title}</strong><p>{notice.text}</p></div>
            </aside>
          )}

          <footer className="public-info-footer">
            <Link to="/register" className="public-info-primary">{isArabic ? "إنشاء حساب" : "Create account"}</Link>
            <Link to="/login" className="public-info-secondary">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
