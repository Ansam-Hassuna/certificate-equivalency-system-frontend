import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OTPInput } from "input-otp";

import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthPageShell from "../components/public/AuthPageShell";

import "./VerifyLoginOtp.css";

export default function VerifyLoginOtp() {
  const {
    isAuthenticated,
    verifyLoginOtp,
    getPendingLoginTwoFactor,
  } = useAuth();

  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(
    () => getPendingLoginTwoFactor()?.email || ""
  );

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", {
        replace: true,
      });
      return;
    }

    if (!email) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [
    email,
    isAuthenticated,
    navigate,
  ]);

  async function handleVerify(value = otp) {
    if (processing) {
      return;
    }

    const normalizedOtp =
      String(value || "").trim();

    setError("");

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(
        language === "ar"
          ? "يرجى إدخال رمز التحقق المكوّن من 6 أرقام."
          : "Please enter the 6-digit verification code."
      );
      return;
    }

    setProcessing(true);

    try {
      const result =
        await verifyLoginOtp(
          email,
          normalizedOtp
        );

      if (!result.ok) {
        setError(
          result.message ||
            (
              language === "ar"
                ? "رمز التحقق غير صحيح أو انتهت صلاحيته."
                : "The verification code is invalid or has expired."
            )
        );

        return;
      }

      const from =
        location.state?.from;

      const safeFrom =
        typeof from === "string" &&
        from.startsWith("/") &&
        !from.startsWith("//")
          ? from
          : "/dashboard";

      navigate(
        safeFrom,
        {
          replace: true,
        }
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AuthPageShell
      icon="lock"
      cardClassName="verification-card"
    >
      <h1>
        {language === "ar"
          ? "التحقق بخطوتين"
          : "Two-factor verification"}
      </h1>

      <p>
        {language === "ar"
          ? "أرسلنا رمز تحقق إلى بريدك الإلكتروني."
          : "A verification code was sent to your email."}
      </p>

      <strong className="verification-email">
        {email}
      </strong>

      <p className="verification-help">
        {language === "ar"
          ? "أدخل رمز التحقق المكوّن من 6 أرقام لإكمال تسجيل الدخول."
          : "Enter the 6-digit verification code to complete sign-in."}
      </p>

      <div className="login-otp">
        <label
          className="ui-label"
          htmlFor="login-two-factor-otp"
        >
          {language === "ar"
            ? "رمز التحقق"
            : "Verification code"}
        </label>

        <OTPInput
          id="login-two-factor-otp"
          name="otp"
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setError("");
          }}
          onComplete={handleVerify}
          maxLength={6}
          pattern="[0-9]*"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          disabled={processing}
          aria-label={
            language === "ar"
              ? "رمز التحقق المكون من ستة أرقام"
              : "Six-digit verification code"
          }
          containerClassName="login-otp__input"
          render={({ slots }) => (
            <div
              className="login-otp__slots"
              aria-hidden="true"
            >
              {slots.map(
                (slot, index) => (
                  <span
                    key={index}
                    className={`login-otp__slot ${
                      slot.isActive
                        ? "is-active"
                        : ""
                    }`}
                  >
                    {slot.char || ""}
                  </span>
                )
              )}
            </div>
          )}
        />
      </div>

      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="verification-actions">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => handleVerify()}
          disabled={
            processing ||
            otp.length !== 6
          }
        >
          {processing
            ? language === "ar"
              ? "جاري التحقق..."
              : "Verifying..."
            : language === "ar"
            ? "تأكيد الرمز"
            : "Verify code"}
        </button>

        <Link
          className="btn btn-secondary"
          to="/login"
        >
          {language === "ar"
            ? "العودة لتسجيل الدخول"
            : "Back to login"}
        </Link>
      </div>

      <div className="security-note">
        {language === "ar"
          ? "لا يكتمل تسجيل الدخول إلا بعد نجاح التحقق من رمز المصادقة الثنائية."
          : "Sign-in is completed only after successful two-factor verification."}
      </div>
    </AuthPageShell>
  );
}
