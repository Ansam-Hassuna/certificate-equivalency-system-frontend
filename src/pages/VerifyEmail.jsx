import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthPageShell from "../components/public/AuthPageShell";

export default function VerifyEmail() {
  const {
    getPendingRegistration,
    resendVerification,
    verifyEmail,
  } = useAuth();

  const { language, t } = useLanguage();

  const navigate = useNavigate();

  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ---------------------------------------------------
     Load Pending Registration
  --------------------------------------------------- */

  useEffect(() => {
    const registration = getPendingRegistration();

    setPending(registration);
  }, [getPendingRegistration]);

  /* ---------------------------------------------------
     Verify
  --------------------------------------------------- */

  async function handleVerify() {
    setMessage("");
    setError("");
    setProcessing(true);

    try {
      const result = await verifyEmail();

      if (!result.ok) {
        if (result.reason === "NO_PENDING_REGISTRATION") {
          setError(
            language === "ar"
              ? "لا يوجد طلب تسجيل قيد التحقق."
              : "There is no pending registration to verify."
          );
        } else if (result.reason === "USER_NOT_FOUND") {
          setError(
            language === "ar"
              ? "تعذر العثور على حساب المستخدم."
              : "The user account could not be found."
          );
        } else {
          setError(
            language === "ar"
              ? "تعذر إتمام عملية التحقق."
              : "Unable to complete email verification."
          );
        }

        return;
      }

      setVerified(true);

      setMessage(
        language === "ar"
          ? "تم تأكيد البريد الإلكتروني بنجاح. سيتم تحويلك إلى لوحة التحكم."
          : "Your email has been verified successfully. You will be redirected to the dashboard."
      );

      /*
       * Give the success message a moment to appear.
       */
      window.setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 900);
    } finally {
      setProcessing(false);
    }
  }

  /* ---------------------------------------------------
     Resend
  --------------------------------------------------- */

  async function resend() {
    setMessage("");
    setError("");

    const result = await resendVerification();

    if (!result.ok) {
      setError(
        language === "ar"
          ? "لا يوجد بريد إلكتروني قيد التحقق."
          : "There is no email awaiting verification."
      );

      return;
    }

    setMessage(
      language === "ar"
        ? "تمت محاكاة إعادة إرسال رسالة التأكيد بنجاح."
        : "The verification message was simulated successfully."
    );
  }

  return (
    <AuthPageShell
      icon="mail"
      cardClassName="verification-card"
    >
      <h1>
        {language === "ar"
          ? "تحقق من بريدك الإلكتروني"
          : "Verify your email"}
      </h1>

      <p>
        {language === "ar"
          ? "أرسلنا رسالة تأكيد إلى:"
          : "A verification message was sent to:"}
      </p>

      <strong className="verification-email">
        {pending?.email ||
          (language === "ar"
            ? "بريدك الإلكتروني"
            : "your email")}
      </strong>

      <p className="verification-help">
        {t("auth.verificationMessage")}
      </p>

      {message && (
        <div
          className="success-message"
          role="status"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className="form-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="verification-actions">
        {!verified && (
          <>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleVerify}
              disabled={processing}
            >
              {processing
                ? language === "ar"
                  ? "جارٍ التحقق..."
                  : "Verifying..."
                : language === "ar"
                ? "تأكيد البريد الإلكتروني"
                : "Confirm Email"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={resend}
              disabled={processing}
            >
              {t("auth.resendVerification")}
            </button>
          </>
        )}

        {verified && (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() =>
              navigate("/dashboard", {
                replace: true,
              })
            }
          >
            {language === "ar"
              ? "الانتقال إلى لوحة التحكم"
              : "Go to Dashboard"}
          </button>
        )}

        {!verified && (
          <Link
            className="btn btn-secondary"
            to="/login"
          >
            {t("common.back")}
          </Link>
        )}
      </div>

      <div className="security-note">
        {language === "ar"
          ? "هذه نسخة Frontend تجريبية. تتم محاكاة تأكيد البريد الإلكتروني محليًا لأن النظام لا يحتوي حاليًا على Backend لإرسال رسائل البريد أو التحقق منها."
          : "This is a frontend-only demo. Email verification is simulated locally because the system does not currently include a backend email service."}
      </div>
    </AuthPageShell>
  );
}