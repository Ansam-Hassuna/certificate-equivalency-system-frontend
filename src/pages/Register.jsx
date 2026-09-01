import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthPageShell from "../components/public/AuthPageShell";

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language, t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isArabic = language === "ar";

  function validateForm() {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      return isArabic
        ? "يرجى تعبئة جميع الحقول المطلوبة."
        : "Please complete all required fields.";
    }

    if (trimmedName.length < 2) {
      return isArabic
        ? "يرجى إدخال اسم صحيح."
        : "Please enter a valid name.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return isArabic
        ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
        : "The password must contain at least 8 characters.";
    }

    if (password !== confirmPassword) {
      return t("errors.passwordMismatch");
    }

    return "";
  }

  async function submit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!result.ok) {
        if (result.reason === "EMAIL_EXISTS") {
          setError(
            isArabic
              ? "هذا البريد الإلكتروني مستخدم مسبقًا."
              : "This email address is already registered."
          );
        } else if (result.reason === "INVALID_REGISTRATION_DATA") {
          setError(
            isArabic
              ? "بيانات التسجيل غير صحيحة."
              : "The registration data is invalid."
          );
        } else {
          setError(
            result.message ||
              (isArabic
                ? "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى."
                : "Unable to create the account. Please try again.")
          );
        }

        return;
      }

      navigate("/verify-email", { replace: true });
    } catch {
      setError(
        isArabic
          ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      icon="user"
      cardClassName="register-card"
    >
      <form
        onSubmit={submit}
        noValidate
        className="auth-form"
        aria-label={isArabic ? "إنشاء حساب" : "Create account"}
      >
        <h1>{t("auth.register")}</h1>

        <p>{t("auth.registrationIntro")}</p>

        <label htmlFor="register-name">
          {isArabic ? "الاسم الكامل" : "Full name"}

          <span className="auth-input-wrap">
            <Icon
              name="user"
              size={19}
              className="auth-input-icon"
            />

            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
              required
              disabled={isSubmitting}
            />
          </span>
        </label>

        <label htmlFor="register-email">
          {t("auth.email")}

          <span className="auth-input-wrap">
            <Icon
              name="mail"
              size={19}
              className="auth-input-icon"
            />

            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={MAX_EMAIL_LENGTH}
              required
              disabled={isSubmitting}
              inputMode="email"
              spellCheck="false"
            />
          </span>
        </label>

        <label htmlFor="register-password">
          {t("auth.password")}

          <span className="password-field">
            <Icon
              name="lock"
              size={19}
              className="auth-input-icon"
            />

            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              maxLength={MAX_PASSWORD_LENGTH}
              minLength={MIN_PASSWORD_LENGTH}
              required
              disabled={isSubmitting}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              disabled={isSubmitting}
              aria-label={
                showPassword
                  ? t("common.hide")
                  : t("common.show")
              }
              title={
                showPassword
                  ? t("common.hide")
                  : t("common.show")
              }
            >
              <Icon name="eye" size={19} />
            </button>
          </span>
        </label>

        <label htmlFor="register-confirm-password">
          {t("auth.confirmPassword")}

          <span className="password-field">
            <Icon
              name="lock"
              size={19}
              className="auth-input-icon"
            />

            <input
              id="register-confirm-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              maxLength={MAX_PASSWORD_LENGTH}
              minLength={MIN_PASSWORD_LENGTH}
              required
              disabled={isSubmitting}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }
              disabled={isSubmitting}
              aria-label={
                showConfirmPassword
                  ? t("common.hide")
                  : t("common.show")
              }
              title={
                showConfirmPassword
                  ? t("common.hide")
                  : t("common.show")
              }
            >
              <Icon name="eye" size={19} />
            </button>
          </span>
        </label>

        {error && (
          <div
            className="form-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary secure-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isArabic
              ? "جارٍ إنشاء الحساب..."
              : "Creating account..."
            : t("auth.register")}
        </button>

        <div className="security-note">
          {t("auth.verificationMessage")}
        </div>

        <div className="auth-link">
          <span>
            {isArabic
              ? "لديك حساب؟"
              : "Already have an account?"}
          </span>{" "}
          <Link to="/login">
            {t("auth.login")}
          </Link>
        </div>
      </form>
    </AuthPageShell>
  );
}
