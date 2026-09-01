import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthPageShell from "../components/public/AuthPageShell";

export default function EmailVerified() {
  const [params] = useSearchParams();
  const { verifyEmail } = useAuth();
  const { language, t } = useLanguage();
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;
    verifyEmail(params.get("token")).then((result) => {
      if (active) setState(result.ok ? "success" : "error");
    });
    return () => { active = false; };
  }, [params, verifyEmail]);

  if (state === "checking") {
    return (
      <AuthPageShell icon="mail" showLogin={false}>
        <h1>{language === "ar" ? "جارٍ التحقق..." : "Verifying..."}</h1>
        <p>{language === "ar" ? "نقوم بالتحقق من رابط البريد الإلكتروني." : "We are verifying the email link."}</p>
      </AuthPageShell>
    );
  }

  if (state === "error") {
    return (
      <AuthPageShell icon="x" showLogin={false}>
        <h1>{language === "ar" ? "تعذر تأكيد البريد" : "Email verification failed"}</h1>
        <p>{language === "ar" ? "الرابط غير صالح أو انتهت صلاحية طلب التسجيل." : "The link is invalid or the registration request has expired."}</p>
        <Link className="btn btn-primary" to="/verify-email">
          {language === "ar" ? "العودة إلى التحقق" : "Back to verification"}
        </Link>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell icon="check" showLogin={false}>
      <h1>{t("auth.emailVerified")}</h1>
      <p>{language === "ar" ? "تم تأكيد البريد بنجاح. يمكنك الآن تسجيل الدخول." : "Your email has been verified. You can now sign in."}</p>
      <div className="security-note">
        {language === "ar"
          ? "تمت عملية التحقق على الخادم، وتُحدد الصلاحيات من الخادم عند تسجيل الدخول."
          : "Verification was completed by the server. Effective permissions are supplied by the server at sign-in."}
      </div>
      <Link className="btn btn-primary" to="/login">{t("auth.login")}</Link>
    </AuthPageShell>
  );
}
