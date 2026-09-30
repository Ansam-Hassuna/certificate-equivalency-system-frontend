import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OTPInput } from "input-otp";

import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthPageShell from "../components/public/AuthPageShell";

import "./VerifyLoginOtp.css";

export default function VerifyRegisterOtp() {
  const {
    register,
    verifyRegistrationOtp,
    getPendingRegisterOtp,
    clearPendingRegisterOtp,
  } = useAuth();

  const { language } = useLanguage();
  const navigate = useNavigate();

  const [pending] = useState(
    () => getPendingRegisterOtp()
  );

  const email = pending?.email || "";
  const displayName = pending?.displayName || "";
  const password = pending?.password || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const isArabic = language === "ar";

  useEffect(() => {
    if (!email || !displayName || !password) {
      navigate("/register", {
        replace: true,
      });
    }
  }, [
    email,
    displayName,
    password,
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
        isArabic
          ? "يرجى إدخال رمز التحقق المكوّن من 6 أرقام."
          : "Please enter the 6-digit verification code."
      );
      return;
    }

    setProcessing(true);

    try {
      const verificationResult =
        await verifyRegistrationOtp(
          email,
          normalizedOtp
        );

      if (!verificationResult.ok) {
        setError(
          verificationResult.message ||
            (
              isArabic
                ? "رمز التحقق غير صحيح أو انتهت صلاحيته."
                : "The verification code is invalid or has expired."
            )
        );

        return;
      }

      const registrationResult =
        await register({
          displayName,
          email,
          password,
        });

      if (!registrationResult.ok) {
        setError(
          registrationResult.message ||
            (
              isArabic
                ? "تم التحقق من البريد، لكن تعذر إنشاء الحساب."
                : "The email was verified, but the account could not be created."
            )
        );

        return;
      }

      clearPendingRegisterOtp();

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess: true,
        },
      });
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
        {isArabic
          ? "التحقق من البريد الإلكتروني"
          : "Verify your email"}
      </h1>

      <p>
        {isArabic
          ? "أرسلنا رمز تحقق إلى بريدك الإلكتروني."
          : "We sent a verification code to your email."}
      </p>

      <strong className="verification-email">
        {email}
      </strong>

      <p className="verification-help">
        {isArabic
          ? "أدخل رمز التحقق المكوّن من 6 أرقام لإكمال إنشاء الحساب."
          : "Enter the 6-digit verification code to complete account creation."}
      </p>

      <div className="login-otp">
        <label
          className="ui-label"
          htmlFor="register-email-otp"
        >
          {isArabic
            ? "رمز التحقق"
            : "Verification code"}
        </label>

        <OTPInput
          id="register-email-otp"
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
            isArabic
              ? "رمز التحقق المكون من ستة أرقام"
              : "Six-digit verification code"
          }
          containerClassName="login-otp__input"
          render={({ slots }) => (
            <div
              className="login-otp__slots"
              aria-hidden="true"
            >
              {slots.map((slot, index) => (
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
              ))}
            </div>
          )}
        />
      </div>

      {error && (
        <div
          className="form-error"
          role="alert"
          aria-live="polite"
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
            ? isArabic
              ? "جارٍ إنشاء الحساب..."
              : "Creating account..."
            : isArabic
            ? "تأكيد وإنشاء الحساب"
            : "Verify and create account"}
        </button>

        <Link
          className="btn btn-secondary"
          to="/register"
        >
          {isArabic
            ? "العودة للتسجيل"
            : "Back to registration"}
        </Link>
      </div>

      <div className="security-note">
        {isArabic
          ? "لا يتم إنشاء الحساب إلا بعد نجاح التحقق من البريد الإلكتروني."
          : "The account is created only after successful email verification."}
      </div>
    </AuthPageShell>
  );
}
