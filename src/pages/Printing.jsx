import React from "react";
import {useLanguage} from "../context/LanguageContext";
import {PERMISSIONS} from "../auth/permissions";
import {RequirePermission} from "../auth/guards";
import OperationalScreen from "./workflow/OperationalScreen";
function Content(){const {t}=useLanguage();return <OperationalScreen title={t("printing.title")} description={t("printing.description")} icon="print" actionLabel={t("printing.openDraft")} stats={[{label:t("printing.stats.drafts"),value:2},{label:t("printing.stats.awaitingApplicant"),value:1},{label:t("printing.stats.approved"),value:1},{label:t("printing.stats.final"),value:0}]}><div className="workflow-note">{t("printing.note")}</div></OperationalScreen>}
export default function Printing(){return <RequirePermission permission={PERMISSIONS.PRINT_DRAFT}><Content/></RequirePermission>}
