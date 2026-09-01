import React, { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table from "../components/ui/Table";
import FilterBar from "../components/ui/FilterBar";
import { INQUIRY_STATES } from "../config/workflow";
import { INQUIRY_ROWS } from "./workflow/operationalData";
import "./workflow/OperationalWorkflow.css";

function Content() {
  const { language } = useLanguage();
  const [rows, setRows] = useState(INQUIRY_ROWS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = useMemo(() => ({
    sent: rows.length,
    waiting: rows.filter((row) => row.state === INQUIRY_STATES.WAITING_RESPONSE).length,
    replied: rows.filter((row) => row.state === INQUIRY_STATES.RESPONSE_RECEIVED).length,
    followUp: rows.filter((row) => row.state === INQUIRY_STATES.FOLLOW_UP).length,
  }), [rows]);

  const followUp = (id) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, state: INQUIRY_STATES.FOLLOW_UP } : row));
    setSelected(null);
  };

  const recordResponse = (id, resultOk) => {
    setRows((current) => current.map((row) => row.id === id ? {
      ...row,
      state: INQUIRY_STATES.RESPONSE_RECEIVED,
      resultOk,
      response: resultOk ? "نتيجة الاستفسار سليمة." : "نتيجة الاستفسار غير سليمة وتحتاج الإجراء النظامي المناسب.",
      responseEn: resultOk ? "The inquiry result is valid." : "The inquiry result is not valid and requires the appropriate procedure.",
    } : row));
    setSelected(null);
  };

  const labels = language === "ar" ? {
    title: "الاستفسارات",
    description: "إدارة الاستفسار عن المؤسسة التعليمية أو صحة الشهادة وفق تسلسل الرد والمتابعة.",
    sent: "مرسلة", waiting: "بانتظار الرد", replied: "ورد عليها", followUp: "للمتابعة",
    request: "رقم الطلب", institution: "المؤسسة", subject: "الموضوع", status: "الحالة", action: "الإجراء",
    open: "فتح", noResponse: "لا يوجد رد — متابعة", response: "تسجيل الرد", result: "نتيجة الرد",
    ok: "النتيجة سليمة", notOk: "النتيجة غير سليمة", responseNote: "استلام الرد وتوثيقه ثم تحديد نتيجة الاستفسار.",
  } : {
    title: "Inquiries",
    description: "Manage institution or credential verification using the response-and-follow-up workflow.",
    sent: "Sent", waiting: "Awaiting response", replied: "Replied", followUp: "Follow-up",
    request: "Request", institution: "Institution", subject: "Subject", status: "Status", action: "Action",
    open: "Open", noResponse: "No response — follow up", response: "Record response", result: "Response result",
    ok: "Result is valid", notOk: "Result is not valid", responseNote: "Record the response, then determine the inquiry result.",
  };

  const visibleRows = useMemo(() => {
    const q = String(search ?? "").trim().toLowerCase();
    return rows.filter((row) => {
      const text = [row.requestId, row.institution, row.institutionEn, row.subject, row.subjectEn].join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (statusFilter !== "all" && row.state !== statusFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const status = (state) => {
    const map = {
      [INQUIRY_STATES.WAITING_RESPONSE]: { label: labels.waiting, tone: "warning" },
      [INQUIRY_STATES.FOLLOW_UP]: { label: labels.followUp, tone: "neutral" },
      [INQUIRY_STATES.RESPONSE_RECEIVED]: { label: labels.replied, tone: "success" },
    };
    return map[state] || { label: state, tone: "neutral" };
  };

  return <div className="page operational-workflow">
    <header className="operational-workflow__heading"><div><div className="operational-workflow__eyebrow">{language === "ar" ? "دورة التحقق" : "Verification cycle"}</div><h1>{labels.title}</h1><p>{labels.description}</p></div></header>
    <div className="operational-stats">
      {[ [labels.sent, counts.sent], [labels.waiting, counts.waiting], [labels.replied, counts.replied], [labels.followUp, counts.followUp] ].map(([label, value]) => <Card key={label}><div className="operational-stat"><span>{label}</span><strong>{value}</strong></div></Card>)}
    </div>
    <Card title={language === "ar" ? "قائمة الاستفسارات" : "Inquiry list"}>
      <FilterBar
        search={search}
        onSearch={(value)=>setSearch(String(value??""))}
        searchPlaceholder={language === "ar" ? "ابحث في الاستفسارات..." : "Search inquiries..."}
        labels={{filters:language==="ar"?"الفلاتر":"Filters",reset:language==="ar"?"مسح الكل":"Clear all",apply:language==="ar"?"تطبيق":"Apply",active:language==="ar"?"الفلاتر النشطة":"Active filters"}}
        filters={[{key:"status",label:labels.status,value:statusFilter,defaultValue:"all",onChange:setStatusFilter,options:[{value:"all",label:language==="ar"?"كل الحالات":"All statuses"},{value:INQUIRY_STATES.WAITING_RESPONSE,label:labels.waiting},{value:INQUIRY_STATES.FOLLOW_UP,label:labels.followUp},{value:INQUIRY_STATES.RESPONSE_RECEIVED,label:labels.replied}]}]}
        onReset={()=>{setSearch("");setStatusFilter("all")}}
      />
      <p className="table-result-count">{language === "ar" ? `عرض ${visibleRows.length} من ${rows.length} استفسار` : `Showing ${visibleRows.length} of ${rows.length} inquiries`}</p>
      <Table columns={[{key:"request",label:labels.request},{key:"institution",label:labels.institution},{key:"subject",label:labels.subject},{key:"status",label:labels.status},{key:"action",label:labels.action}]} rows={visibleRows} renderCell={(row,col)=>{const s=status(row.state); if(col.key==="request")return row.requestId; if(col.key==="institution")return language === "ar" ? row.institution : row.institutionEn; if(col.key==="subject")return language === "ar" ? row.subject : row.subjectEn; if(col.key==="status")return <Badge tone={s.tone}>{s.label}</Badge>; return <Button variant="secondary" onClick={()=>setSelected(row)}>{labels.open}</Button>;}}/>
    </Card>
    {selected && <div className="workflow-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-dialog-title"><div className="workflow-modal__panel"><div className="workflow-modal__header"><h2 id="inquiry-dialog-title">{selected.id}</h2><Button variant="ghost" onClick={() => setSelected(null)}>×</Button></div><p>{labels.responseNote}</p><div className="workflow-detail-grid"><div><span>{labels.request}</span><strong>{selected.requestId}</strong></div><div><span>{labels.institution}</span><strong>{language === "ar" ? selected.institution : selected.institutionEn}</strong></div><div><span>{labels.subject}</span><strong>{language === "ar" ? selected.subject : selected.subjectEn}</strong></div><div><span>{labels.status}</span><strong>{status(selected.state).label}</strong></div></div>{selected.response && <div className="workflow-result">{language === "ar" ? selected.response : selected.responseEn}</div>}<div className="workflow-modal__actions">
      {(selected.state === INQUIRY_STATES.WAITING_RESPONSE || selected.state === INQUIRY_STATES.FOLLOW_UP) && <><Button variant="secondary" onClick={() => followUp(selected.id)}>{labels.noResponse}</Button><Button onClick={() => recordResponse(selected.id, true)}>{labels.ok}</Button><Button variant="danger" onClick={() => recordResponse(selected.id, false)}>{labels.notOk}</Button></>}
      {selected.state === INQUIRY_STATES.RESPONSE_RECEIVED && <Button onClick={() => setSelected(null)}>{language === "ar" ? "إغلاق" : "Close"}</Button>}
    </div></div></div>}
  </div>;
}

export default function Inquiries() { return <RequirePermission permission={PERMISSIONS.MANAGE_INQUIRIES}><Content /></RequirePermission>; }
