import React from "react";
import { useLanguage } from "../context/LanguageContext";
export default function ApplicantRequestDetails(){ const {language}=useLanguage(); return <div className="page"><h1>{language === "ar" ? "تفاصيل طلب مقدم الطلب" : "Applicant request details"}</h1><section className="card">{language === "ar" ? "تفاصيل الطلب." : "Request details."}</section></div>; }
