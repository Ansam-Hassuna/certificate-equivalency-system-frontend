import React from "react";
import {useLanguage} from "../context/LanguageContext";
import {PERMISSIONS} from "../auth/permissions";
import {RequirePermission} from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
function Content(){const {t}=useLanguage();return <ScreenShell title={t("draft.title")} description={t("draft.description")} icon="document"><Card><div className="workflow-note">{t("draft.note")}</div><div className="workflow-form-actions" style={{marginTop:16}}><Button variant="secondary">{t("draft.comment")}</Button><Button>{t("draft.approve")}</Button></div></Card></ScreenShell>}
export default function DraftReview(){return <RequirePermission permission={PERMISSIONS.DRAFT_REVIEW_OWN}><Content/></RequirePermission>}
