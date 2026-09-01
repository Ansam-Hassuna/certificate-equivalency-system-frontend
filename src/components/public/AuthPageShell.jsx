import React from "react";
import Icon from "../ui/Icon";
import PublicHeader from "./PublicHeader";

export default function AuthPageShell({ icon = "user", children, showLogin = true, cardClassName = "" }) {
  return (
    <main className="auth-page">
      <PublicHeader showLogin={showLogin} />
      <div className="auth-content">
        <div className="auth-intro" aria-hidden="true">
          <span className="auth-intro-segment auth-intro-black" />
          <span className="auth-intro-segment auth-intro-red" />
          <span className="auth-intro-mark"><Icon name={icon} size={24} /></span>
          <span className="auth-intro-segment auth-intro-green" />
          <span className="auth-intro-segment auth-intro-black auth-intro-black-end" />
        </div>
        <section className={`auth-card secure-login-card ${cardClassName}`.trim()}>
          {children}
        </section>
      </div>
    </main>
  );
}
