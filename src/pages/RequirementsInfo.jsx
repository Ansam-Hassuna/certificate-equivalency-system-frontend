import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { DOCUMENT_REQUIREMENTS } from "../data/documentRequirements/requirements";
import PublicInfoPage from "./PublicInfoPage";

export default function RequirementsInfo(){
  const {t,isArabic}=useLanguage();
  const general=DOCUMENT_REQUIREMENTS.filter(x=>x.qualificationTypes==="all").filter(x=>x.required).map(x=>isArabic?x.labelAr:x.labelEn);
  const conditional=DOCUMENT_REQUIREMENTS.filter(x=>x.type==="conditional").map(x=>isArabic?x.labelAr:x.labelEn);
  return <PublicInfoPage icon="document" eyebrow={t("publicInfo.requirements.eyebrow")} title={t("publicInfo.requirements.title")} intro={t("publicInfo.requirements.intro")} backLabel={t("publicInfo.back")} sections={[
    {icon:"check",title:t("publicInfo.requirements.generalTitle"),items:general},
    {icon:"graduation",title:t("publicInfo.requirements.qualificationTitle"),items:[t("publicInfo.requirements.secondary"),t("publicInfo.requirements.bachelor"),t("publicInfo.requirements.master"),t("publicInfo.requirements.doctorate")]},
    {icon:"info",title:t("publicInfo.requirements.conditionalTitle"),items:conditional},
    {icon:"shield",title:t("publicInfo.requirements.reviewTitle"),text:t("publicInfo.requirements.reviewText")},
  ]} notice={{title:t("publicInfo.requirements.noticeTitle"),text:t("publicInfo.requirements.noticeText")}}/>;
}
