import React from "react";
import { useLanguage } from "../context/LanguageContext";
import PublicInfoPage from "./PublicInfoPage";

export default function AboutEquivalency(){
  const {t}=useLanguage();
  return <PublicInfoPage icon="documentCheck" eyebrow={t("publicInfo.about.eyebrow")} title={t("publicInfo.about.title")} intro={t("publicInfo.about.intro")} backLabel={t("publicInfo.back")} sections={[
    {icon:"graduation",title:t("publicInfo.about.meaningTitle"),text:t("publicInfo.about.meaningText")},
    {icon:"users",title:t("publicInfo.about.whoTitle"),text:t("publicInfo.about.whoText")},
    {icon:"shield",title:t("publicInfo.about.purposeTitle"),text:t("publicInfo.about.purposeText")},
    {icon:"route",title:t("publicInfo.about.resultTitle"),text:t("publicInfo.about.resultText")},
  ]} notice={{title:t("publicInfo.about.noticeTitle"),text:t("publicInfo.about.noticeText")}}/>;
}
