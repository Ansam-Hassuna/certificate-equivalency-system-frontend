import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
export default function Forbidden(){ const {t}=useLanguage(); return <div className="page"><h1>403</h1><p>{t("errors.unauthorized")}</p><Link className="btn btn-primary" to="/dashboard">{t("common.back")}</Link></div>; }
