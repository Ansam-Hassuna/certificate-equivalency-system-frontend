import React from "react";
import {useLanguage} from "../context/LanguageContext";
import {PERMISSIONS} from "../auth/permissions";
import {RequirePermission} from "../auth/guards";
import OperationalScreen from "./workflow/OperationalScreen";
function Content(){const {t}=useLanguage();return <OperationalScreen title={t("users.title")} description={t("users.description")} icon="users" actionLabel={t("users.manage")} stats={[{label:t("users.stats.total"),value:11},{label:t("users.stats.active"),value:10},{label:t("users.stats.pending"),value:1},{label:t("users.stats.roles"),value:11}]}><div className="workflow-note">{t("users.note")}</div></OperationalScreen>}
export default function Users(){return <RequirePermission permission={PERMISSIONS.MANAGE_USERS}><Content/></RequirePermission>}
