import React from "react";
import { useLanguage } from "../context/LanguageContext";
import PublicInfoPage from "./PublicInfoPage";

export default function ApplicationSteps(){
  const {t}=useLanguage();
  return <PublicInfoPage icon="route" eyebrow={t("publicInfo.steps.eyebrow")} title={t("publicInfo.steps.title")} intro={t("publicInfo.steps.intro")} backLabel={t("publicInfo.back")} sections={[
    {icon:"user",title:t("publicInfo.steps.step1Title"),text:t("publicInfo.steps.step1Text")},
    {icon:"document",title:t("publicInfo.steps.step2Title"),text:t("publicInfo.steps.step2Text")},
    {icon:"payment",title:t("publicInfo.steps.step3Title"),text:t("publicInfo.steps.step3Text")},
    {icon:"shield",title:t("publicInfo.steps.step4Title"),text:t("publicInfo.steps.step4Text")},
    {icon:"route",title:t("publicInfo.steps.step5Title"),text:t("publicInfo.steps.step5Text")},
    {icon:"documentCheck",title:t("publicInfo.steps.step6Title"),text:t("publicInfo.steps.step6Text")},
  ]} notice={{title:t("publicInfo.steps.noticeTitle"),text:t("publicInfo.steps.noticeText")}}/>;
}
