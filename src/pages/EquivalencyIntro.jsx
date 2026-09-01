import React from "react";
import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";
import PublicHeader from "../components/public/PublicHeader";
import { useLanguage } from "../context/LanguageContext";
import "./EquivalencyIntro.css";

export default function EquivalencyIntro() {
  const { t, isArabic } = useLanguage();
  const Arrow = isArabic ? "arrowLeft" : "arrowRight";

  return (
    <main className="intro-page">
      <div className="intro-shell">
        <PublicHeader />

        <section className="intro-hero">
          <div className="intro-copy">
            <span className="intro-eyebrow"><Icon name="info" size={17} /> {t("intro.eyebrow")}</span>
            <h1>{t("intro.title")}</h1>
            <p className="intro-lead">{t("intro.description")}</p>
            <div className="intro-actions">
              <Link className="intro-primary" to="/register">
                {t("intro.start")} <Icon name={Arrow} size={18} />
              </Link>
              <Link className="intro-secondary" to="/login">{t("intro.login")}</Link>
            </div>
          </div>

          <div className="intro-visual" aria-hidden="true">
            <div className="intro-visual-card">
              <div className="intro-visual-icon"><Icon name="documentCheck" size={42} strokeWidth={1.6} /></div>
              <span>{t("intro.visualTitle")}</span>
              <strong>{t("intro.visualSubtitle")}</strong>
              <div className="intro-steps">
                <span><Icon name="check" size={15} /> {t("intro.step1")}</span>
                <span><Icon name="check" size={15} /> {t("intro.step2")}</span>
                <span><Icon name="check" size={15} /> {t("intro.step3")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-cards">
          <Link className="intro-card-link" to="/about-equivalency"><article><span><Icon name="document" /></span><h2>{t("intro.card1Title")}</h2><p>{t("intro.card1Text")}</p><strong>{t("intro.learnMore")} <Icon name={Arrow} size={15} /></strong></article></Link>
          <Link className="intro-card-link" to="/requirements"><article><span><Icon name="shield" /></span><h2>{t("intro.card2Title")}</h2><p>{t("intro.card2Text")}</p><strong>{t("intro.learnMore")} <Icon name={Arrow} size={15} /></strong></article></Link>
          <Link className="intro-card-link" to="/faq"><article><span><Icon name="help" /></span><h2>{t("intro.card3Title")}</h2><p>{t("intro.card3Text")}</p><strong>{t("intro.learnMore")} <Icon name={Arrow} size={15} /></strong></article></Link>
        </section>

        <section className="intro-info-links">
          <Link to="/equivalency-types"><Icon name="graduation" size={20} /><span>{t("intro.typesLink")}</span><Icon name={Arrow} size={16} /></Link>
          <Link to="/application-steps"><Icon name="route" size={20} /><span>{t("intro.stepsLink")}</span><Icon name={Arrow} size={16} /></Link>
          <Link to="/requirements"><Icon name="document" size={20} /><span>{t("intro.requirementsLink")}</span><Icon name={Arrow} size={16} /></Link>
          <Link to="/faq"><Icon name="help" size={20} /><span>{t("intro.faqLink")}</span><Icon name={Arrow} size={16} /></Link>
        </section>

        <section className="intro-information">
          <div className="intro-information-heading">
            <span className="intro-eyebrow"><Icon name="fileText" size={17} /> {t("intro.eyebrow")}</span>
            <h2>{t("intro.whatItMeansTitle")}</h2>
          </div>
          <div className="intro-info-grid">
            <article><span><Icon name="graduation" /></span><h3>{t("intro.whatItMeansTitle")}</h3><p>{t("intro.whatItMeansText")}</p></article>
            <article><span><Icon name="users" /></span><h3>{t("intro.whoNeedsTitle")}</h3><p>{t("intro.whoNeedsText")}</p></article>
            <article><span><Icon name="route" /></span><h3>{t("intro.howItWorksTitle")}</h3><p>{t("intro.howItWorksText")}</p></article>
          </div>
          <div className="intro-important">
            <Icon name="info" size={19} />
            <div><strong>{t("intro.noteTitle")}</strong><p>{t("intro.noteText")}</p></div>
          </div>
        </section>

        <footer className="intro-footer">{t("footer.rights")}</footer>
      </div>
    </main>
  );
}
