import React from "react";
import { useLanguage } from "../context/LanguageContext";
import PublicInfoPage from "./PublicInfoPage";

export default function EquivalencyTypes(){
  const {t}=useLanguage();
  return <PublicInfoPage icon="graduation" eyebrow={t("publicInfo.types.eyebrow")} title={t("publicInfo.types.title")} intro={t("publicInfo.types.intro")} backLabel={t("publicInfo.back")} sections={[
    {icon:"document",title:t("publicInfo.types.secondaryTitle"),text:t("publicInfo.types.secondaryText")},
    {icon:"graduation",title:t("publicInfo.types.bachelorTitle"),text:t("publicInfo.types.bachelorText")},
    {icon:"graduation",title:t("publicInfo.types.masterTitle"),text:t("publicInfo.types.masterText")},
    {icon:"graduation",title:t("publicInfo.types.doctorateTitle"),text:t("publicInfo.types.doctorateText")},
  ]} notice={{title:t("publicInfo.types.noticeTitle"),text:t("publicInfo.types.noticeText")}}/>;
}
