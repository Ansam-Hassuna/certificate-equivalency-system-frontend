import React from "react";
import { useLanguage } from "../context/LanguageContext";
export default function ApplicantRequestSubpage(){ const {language}=useLanguage(); return <div className="page"><h1>{language === "ar" ? "صفحة فرعية لمقدم الطلب" : "Applicant request subpage"}</h1><section className="card">{language === "ar" ? "صفحة فرعية." : "Request subpage."}</section></div>; }
