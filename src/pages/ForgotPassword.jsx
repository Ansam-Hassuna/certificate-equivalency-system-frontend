import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/ui/Icon";
import AuthPageShell from "../components/public/AuthPageShell";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function ForgotPassword() {

  const { forgotPassword } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function submit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError(
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني."
          : "Please enter your email address."
      );
      return;
    }

    setSubmitting(true);

    const result = await forgotPassword(normalizedEmail);

    setSubmitting(false);

    if (!result.ok) {
      setError(
        language === "ar"
          ? "تعذر تنفيذ طلب إعادة تعيين كلمة المرور."
          : "Unable to process the password reset request."
      );
      return;
    }

    setMessage(
      result.message ||
        (language === "ar"
          ? "إذا كان البريد الإلكتروني مسجلًا، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه."
          : "If the email exists, a password reset link has been sent.")
    );
  }

  return (
    <AuthPageShell
      icon="lock"
      showLogin={false}
      cardClassName="login-card"
    >
      <form onSubmit={submit} noValidate>
        <h1>
          {language === "ar"
            ? "نسيت كلمة المرور؟"
            : "Forgot your password?"}
        </h1>

        <p>{t("common.appName")}</p>

        <label>
          {t("auth.email")}
          <span className="auth-input-wrap">
            <Icon
              name="mail"
              size={19}
              className="auth-input-icon"
            />

            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              maxLength={254}
              required
            />
          </span>
        </label>

        {error && (
          <div
            className="form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="form-success"
            role="status"
          >
            {message}
          </div>
        )}

        <button
          className="btn btn-primary secure-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? language === "ar"
              ? "جارٍ الإرسال..."
              : "Sending..."
            : language === "ar"
              ? "إرسال رابط إعادة التعيين"
              : "Send reset link"}
        </button>

        <div className="auth-link">
          <Link to="/login">
            {language === "ar"
              ? "العودة إلى تسجيل الدخول"
              : "Back to login"}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
}
