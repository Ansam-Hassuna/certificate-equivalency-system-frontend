import React from "react";
import { useLanguage } from "../context/LanguageContext";
export default function ScreenPage(){ const {language}=useLanguage(); return <div className="page"><h1>{language === "ar" ? "الشاشة" : "Screen"}</h1><section className="card">{language === "ar" ? "صفحة عامة قابلة لإعادة الاستخدام." : "Reusable generic screen."}</section></div>; }
