import React from "react";
import {useNavigate} from "react-router-dom";
import {useLanguage} from "../context/LanguageContext";
import {PERMISSIONS} from "../auth/permissions";
import {RequirePermission} from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import {getLocalizedRequestRows} from "./workflow/data";
import {useAuth} from "../auth/AuthContext";
function Content(){const {t, language}=useLanguage();const {user}=useAuth();const navigate=useNavigate();const rows=getLocalizedRequestRows(language).filter((row)=>row.ownerUserId===user?.id);return <ScreenShell title={t("myApplications.title")} description={t("myApplications.description")} icon="document" actions={<Button onClick={()=>navigate("/applications/new")} icon={<Icon name="plus" size={18}/>}>{t("applications.new")}</Button>}><div className="workflow-list">{rows.slice(0,3).map(r=><Card key={r.id} className="workflow-list-item"><div><strong>{r.id}</strong><span>{r.qualification} Â· {r.university}</span></div><div><Badge tone="neutral">{r.status}</Badge><Button variant="ghost" size="sm" onClick={()=>navigate(`/applications/${r.id}`)}>{t("common.details")}</Button></div></Card>)}</div></ScreenShell>}
export default function MyApplications(){return <RequirePermission permission={PERMISSIONS.APPLICATION_VIEW_OWN}><Content/></RequirePermission>}

