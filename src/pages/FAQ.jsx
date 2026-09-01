import React from "react";
import { useLanguage } from "../context/LanguageContext";
import PublicInfoPage from "./PublicInfoPage";

export default function FAQ(){
  const {t}=useLanguage();
  return <PublicInfoPage icon="help" eyebrow={t("publicInfo.faq.eyebrow")} title={t("publicInfo.faq.title")} intro={t("publicInfo.faq.intro")} backLabel={t("publicInfo.back")} sections={[
    {icon:"user",title:t("publicInfo.faq.q1"),text:t("publicInfo.faq.a1")},
    {icon:"document",title:t("publicInfo.faq.q2"),text:t("publicInfo.faq.a2")},
    {icon:"route",title:t("publicInfo.faq.q3"),text:t("publicInfo.faq.a3")},
    {icon:"payment",title:t("publicInfo.faq.q4"),text:t("publicInfo.faq.a4")},
    {icon:"shield",title:t("publicInfo.faq.q5"),text:t("publicInfo.faq.a5")},
    {icon:"help",title:t("publicInfo.faq.q6"),text:t("publicInfo.faq.a6")},
  ]}/>;
}
