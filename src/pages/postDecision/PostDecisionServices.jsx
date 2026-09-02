import React, { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../auth/AuthContext";
import { PERMISSIONS } from "../../auth/permissions";
import { RequirePermission } from "../../auth/guards";
import { useAuthorization } from "../../auth/useAuthorization";
import ScreenShell from "../workflow/ScreenShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import "./PostDecisionServices.css";

const SERVICE_KEYS = [
  { id:"lost", icon:"document", titleKey:"postDecision.lost.title", descKey:"postDecision.lost.description", permission:PERMISSIONS.POST_DECISION_SERVICE_MANAGE },
  { id:"appeal", icon:"arrowRight", titleKey:"postDecision.appeal.title", descKey:"postDecision.appeal.description", permission:PERMISSIONS.APPEAL_CREATE_OWN },
  { id:"recognition", icon:"check", titleKey:"postDecision.recognition.title", descKey:"postDecision.recognition.description", permission:PERMISSIONS.POST_DECISION_SERVICE_MANAGE },
  { id:"grievance", icon:"mail", titleKey:"postDecision.grievance.title", descKey:"postDecision.grievance.description", permission:PERMISSIONS.POST_DECISION_SERVICE_MANAGE },
  { id:"legal", icon:"search", titleKey:"postDecision.legal.title", descKey:"postDecision.legal.description", permission:PERMISSIONS.POST_DECISION_SERVICE_MANAGE },
  { id:"withdrawal", icon:"warning", titleKey:"postDecision.withdrawal.title", descKey:"postDecision.withdrawal.description", permission:PERMISSIONS.POST_DECISION_SERVICE_MANAGE },
];

const EVENTS = [
  ["lost", "2026-08-20", "REQ-2026-00124", "قيد التدقيق"],
  ["appeal", "2026-08-19", "REQ-2026-00117", "محال إلى اللجنة"],
  ["recognition", "2026-08-18", "REQ-2026-00098", "بانتظار الدراسة"],
];

function Content(){
  const {t}=useLanguage();
  const {user}=useAuth();
  const { can } = useAuthorization();
  const isApplicant = user?.role === "APPLICANT";
  const canManage = can(PERMISSIONS.POST_DECISION_SERVICE_MANAGE);
  const [active,setActive]=useState("all");
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);

  const services = useMemo(() => {
    if (isApplicant) {
      return SERVICE_KEYS.filter(
        (s) =>
          s.permission ===
          PERMISSIONS.APPEAL_CREATE_OWN
      );
    }

    return SERVICE_KEYS;
  }, [isApplicant]);
  const visible=active==="all"?services:services.filter(s=>s.id===active);

  const submit=(e)=>{e.preventDefault();setSubmitted(true);};

  return <ScreenShell title={t("postDecision.title")} description={t("postDecision.description")} icon="archive" stats={[
    {label:t("postDecision.stats.active"),value:6},{label:t("postDecision.stats.appeals"),value:2},{label:t("postDecision.stats.lost"),value:1},{label:t("postDecision.stats.legal"),value:3}
  ]}>
    <div className="post-decision">
      <div className="post-decision__hero">
        <div><div className="post-decision__eyebrow">{t("postDecision.eyebrow")}</div><h1>{t("postDecision.title")}</h1><p>{t("postDecision.description")}</p></div>
        <Badge variant="info">{isApplicant?t("postDecision.applicantMode"):t("postDecision.staffMode")}</Badge>
      </div>

      <div className="post-decision__tabs" role="tablist">
        <button className={`post-decision__tab ${active==="all"?"active":""}`} onClick={()=>setActive("all")}>{t("postDecision.all")}</button>
        {services.map(s=><button key={s.id} className={`post-decision__tab ${active===s.id?"active":""}`} onClick={()=>setActive(s.id)}>{t(s.titleKey)}</button>)}
      </div>

      {!isApplicant && !canManage && <Card><div className="workflow-note">{t("postDecision.viewOnly")}</div></Card>}

      <div className="post-decision__grid">
        {visible.map(s=><div className="post-decision__service" key={s.id}>
          <div className="post-decision__service-head"><div className="post-decision__service-icon"><Icon name={s.icon} size={21}/></div><div><h3>{t(s.titleKey)}</h3><p>{t(s.descKey)}</p></div></div>
          <div className="post-decision__meta"><Badge variant="neutral">{t("postDecision.available")}</Badge><Badge variant="info">{t(`postDecision.status.${s.id}`)}</Badge></div>
          <div className="post-decision__actions">
  {isApplicant ? (
    <Button
      onClick={() => {
        setSelected(s.id);
        setSubmitted(false);
      }}
      icon={<Icon name="arrowRight" size={17} />}
    >
      {t("postDecision.start")}
    </Button>
  ) : canManage ? (
    <Button
      onClick={() => {
        setSelected(s.id);
        setSubmitted(false);
      }}
      icon={<Icon name="arrowRight" size={17} />}
    >
      {t("postDecision.manage")}
    </Button>
  ) : null}
</div>
        </div>)}
      </div>

      {selected && <Card>
        <div className="post-decision__form">
          <div><h2>{t(SERVICE_KEYS.find(s=>s.id===selected)?.titleKey)}</h2><p>{t(SERVICE_KEYS.find(s=>s.id===selected)?.descKey)}</p></div>
          {submitted ? <div className="post-decision__empty"><Badge variant="success">{t("postDecision.submitted")}</Badge><p>{t("postDecision.submittedText")}</p><Button variant="ghost" onClick={()=>setSelected(null)}>{t("postDecision.close")}</Button></div> : <form onSubmit={submit} className="post-decision__form-grid">
            <Input label={t("postDecision.form.requestId")} placeholder="REQ-2026-00124" required />
            <Select label={t("postDecision.form.action")} options={[{value:"new",label:t("postDecision.form.new")},{value:"follow",label:t("postDecision.form.follow")},{value:"review",label:t("postDecision.form.review")}]} />
            <Textarea className="full" label={t("postDecision.form.reason")} placeholder={t("postDecision.form.reasonPlaceholder")} required />
            <div className="full post-decision__actions"><Button type="submit" icon={<Icon name="check" size={17}/>}>{t("postDecision.form.submit")}</Button><Button type="button" variant="ghost" onClick={()=>setSelected(null)}>{t("postDecision.close")}</Button></div>
          </form>}
        </div>
      </Card>}

      <Card>
        <h2>{t("postDecision.timelineTitle")}</h2>
        <div className="post-decision__timeline">
          {EVENTS.map(([service,date,id,status])=><div className="post-decision__event" key={id}><div className="post-decision__dot"/><div><strong>{t(`postDecision.status.${service}`)} — {id}</strong><span>{date} · {status}</span></div></div>)}
        </div>
      </Card>
    </div>
  </ScreenShell>
}

export default function PostDecisionServices(){return <RequirePermission permission={PERMISSIONS.POST_DECISION_SERVICE_VIEW}><Content/></RequirePermission>}


