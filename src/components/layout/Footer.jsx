import React from "react";
import Icon from "../ui/Icon";
import { useLanguage } from "../../context/LanguageContext";
import "./Footer.css";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-brand-mark" aria-hidden="true"><img src={`${process.env.PUBLIC_URL}/ministry-logo.jpg`} alt="" /></div>
          <div className="footer-brand-content">
            <h2 className="footer-title">{t("common.appName")}</h2>
            <p className="footer-subtitle">{t("footer.ministry")}</p>
          </div>
        </div>
        <nav className="footer-links" aria-label={t("footer.navigation")}>
          <a href="#privacy" className="footer-link"><Icon name="settings" size={17} /><span>{t("footer.privacy")}</span></a>
          <a href="#terms" className="footer-link"><span>{t("footer.terms")}</span></a>
          <a href="#contact" className="footer-link"><Icon name="bell" size={17} /><span>{t("footer.contact")}</span></a>
          <a href="tel:" className="footer-link"><span>{t("common.phone")}</span></a>
        </nav>
        <div className="footer-bottom"><p>© {currentYear} {t("footer.ministry")}. {t("footer.rights")}</p></div>
      </div>
    </footer>
  );
};
export default Footer;
