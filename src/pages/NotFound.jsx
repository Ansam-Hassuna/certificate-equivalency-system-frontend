import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
export default function NotFound(){ const {t}=useLanguage(); return <div className="page"><h1>404</h1><p>{t("errors.notFound")}</p><Link className="btn btn-primary" to="/dashboard">{t("common.back")}</Link></div>; }
