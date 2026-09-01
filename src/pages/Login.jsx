import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import AuthPageShell from "../components/public/AuthPageShell";
import { useAuth } from "../auth/AuthContext";
import { hasAnyPermission } from "../auth/accessControl";
import { PERMISSIONS } from "../auth/permissions";
import { useLanguage } from "../context/LanguageContext";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

function getSafePostLoginPath(user, from) {
  if (!from || typeof from !== "string") {
    return "/dashboard";
  }

  const pathname = from.split("?")[0];

  if (pathname === "/dashboard") {
    return "/dashboard";
  }

  const rules = [
    {
      match: "/applications/new",
      permissions: [PERMISSIONS.APPLICATION_CREATE],
    },
    {
      match: "/applications",
      permissions: [PERMISSIONS.VIEW_APPLICATIONS],
    },
    {
      match: "/my-applications",
      permissions: [PERMISSIONS.APPLICATION_VIEW_OWN],
    },
    {
      match: "/documents",
      permissions: [PERMISSIONS.DOCUMENT_UPLOAD_OWN],
    },
    {
      match: "/payments",
      permissions: [PERMISSIONS.PAYMENT_VIEW_OWN],
    },
    {
      match: "/receiving",
      permissions: [PERMISSIONS.RECEIVE_PAPER],
    },
    {
      match: "/inquiries",
      permissions: [PERMISSIONS.MANAGE_INQUIRIES],
    },
    {
      match: "/committees",
      permissions: [PERMISSIONS.COMMITTEE_VIEW],
    },
    {
      match: "/printing",
      permissions: [PERMISSIONS.PRINT_DRAFT],
    },
    {
      match: "/archive",
      permissions: [PERMISSIONS.ARCHIVE_DOCUMENT],
    },
    {
      match: "/delivery",
      permissions: [PERMISSIONS.DELIVERY],
    },
    {
      match: "/reports",
      permissions: [PERMISSIONS.REPORTS_VIEW],
    },
    {
      match: "/users",
      permissions: [PERMISSIONS.MANAGE_USERS],
    },
    {
      match: "/post-decision",
      permissions: [PERMISSIONS.POST_DECISION_SERVICE_VIEW],
    },
    {
      match: "/roles",
      permissions: [PERMISSIONS.VIEW_ROLE_PROFILE],
    },
    {
      match: "/settings",
      permissions: [PERMISSIONS.AUTHENTICATED],
    },
  ];

  const rule = rules.find(
    (item) =>
      pathname === item.match ||
      pathname.startsWith(`${item.match}/`)
  );

  if (!rule) {
    if (pathname.startsWith("/applications/")) {
      return hasAnyPermission(user, [
        PERMISSIONS.VIEW_APPLICATIONS,
        PERMISSIONS.APPLICATION_VIEW_OWN,
      ])
        ? from
        : "/dashboard";
    }

    return "/dashboard";
  }

  return hasAnyPermission(user, rule.permissions)
    ? from
    : "/dashboard";
}
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const locked = Date.now() < lockedUntil;

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (locked) {
      setError(
        language === "ar"
          ? "تم إيقاف محاولات الدخول مؤقتًا. حاول بعد قليل."
          : "Sign-in attempts are temporarily locked. Try again later."
      );
      return;
    }

    if (!email.trim() || !password) {
      setError(
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
          : "Please enter your email and password."
      );
      return;
    }

    const result = await login(email, password);

    if (!result.ok) {
      const next = attempts + 1;

      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setAttempts(0);
        setError(
          language === "ar"
            ? "تم إيقاف محاولات الدخول مؤقتًا للحماية من المحاولات المتكررة."
            : "Sign-in attempts have been temporarily locked for protection."
        );
      } else {
        setAttempts(next);
        setError(
          result.reason === "EMAIL_NOT_VERIFIED"
            ? t("auth.verificationRequired")
            : t("auth.loginError")
        );
      }
      return;
    }

    const destination = getSafePostLoginPath(
      result.user,
      location.state?.from
    );

    navigate(destination, { replace: true });
  }

  return (
    <AuthPageShell icon="lock" showLogin={false} cardClassName="login-card">
      <form onSubmit={submit} noValidate>
        <h1>{t("auth.login")}</h1>
        <p>{t("common.appName")}</p>

        <label>
          {t("auth.email")}
          <span className="auth-input-wrap">
            <Icon name="mail" size={19} className="auth-input-icon" />
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              maxLength={254}
              required
            />
          </span>
        </label>

        <label>
          {t("auth.password")}
          <span className="password-field">
            <Icon name="lock" size={19} className="auth-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              maxLength={128}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t("common.hide") : t("common.show")}
              title={showPassword ? t("common.hide") : t("common.show")}
            >
              <Icon name="eye" size={19} />
            </button>
          </span>
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}

        <button className="btn btn-primary secure-submit" type="submit" disabled={locked}>
          {locked ? t("auth.temporarilyLocked") : t("auth.login")}
        </button>

        <div className="auth-link">
          <span>{t("auth.noAccount")}</span>{" "}
          <Link to="/register">{t("auth.createAccount")}</Link>
        </div>
      </form>
    </AuthPageShell>
  );
}

