import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import AuthPageShell from "../components/public/AuthPageShell";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const passwordRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setEmail(
      String(params.get("email") || "")
        .trim()
        .toLowerCase()
    );

    setToken(
      String(params.get("token") || "").trim()
    );

    passwordRef.current?.focus();
  }, [location.search]);

  async function submit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !token) {
      setError(
        language === "ar"
          ? "رابط إعادة تعيين كلمة المرور غير صالح أو غير مكتمل."
          : "The password reset link is invalid or incomplete."
      );
      return;
    }

    if (!newPassword) {
      setError(
        language === "ar"
          ? "يرجى إدخال كلمة المرور الجديدة."
          : "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        language === "ar"
          ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
          : "The password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        language === "ar"
          ? "كلمتا المرور غير متطابقتين."
          : "The passwords do not match."
      );
      return;
    }

    setSubmitting(true);

    const result = await resetPassword(
      email,
      token,
      newPassword
    );

    setSubmitting(false);

    if (!result.ok) {
      setError(
        result.reason === "INVALID_RESET_DATA"
          ? (
              language === "ar"
                ? "بيانات إعادة تعيين كلمة المرور غير مكتملة."
                : "The password reset data is incomplete."
            )
          : (
              language === "ar"
                ? "تعذر إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية أو غير صالح."
                : "Unable to reset the password. The link may be invalid or expired."
            )
      );
      return;
    }

    setSuccess(
      result.message ||
        (
          language === "ar"
            ? "تمت إعادة تعيين كلمة المرور بنجاح."
            : "Your password has been reset successfully."
        )
    );

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);
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
            ? "إعادة تعيين كلمة المرور"
            : "Reset your password"}
        </h1>

        <p>{t("common.appName")}</p>

        <label>
          {language === "ar"
            ? "كلمة المرور الجديدة"
            : "New password"}

          <span className="password-field">
            <Icon
              name="lock"
              size={19}
              className="auth-input-icon"
            />

            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              autoComplete="new-password"
              maxLength={128}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((value) => !value)
              }
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

        <label>
          {language === "ar"
            ? "تأكيد كلمة المرور"
            : "Confirm password"}

          <span className="password-field">
            <Icon
              name="lock"
              size={19}
              className="auth-input-icon"
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
              maxLength={128}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }
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
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="form-success"
            role="status"
          >
            {success}
          </div>
        )}

        <button
          className="btn btn-primary secure-submit"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? language === "ar"
              ? "جارٍ الحفظ..."
              : "Saving..."
            : language === "ar"
              ? "تغيير كلمة المرور"
              : "Reset password"}
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
