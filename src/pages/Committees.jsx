import React, { useCallback, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import { useAuthorization } from "../auth/useAuthorization";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Table from "../components/ui/Table";
import FilterBar from "../components/ui/FilterBar";
import { COMMITTEE_RESULTS, COMMITTEE_TYPES } from "../config/workflow";
import { COMMITTEE_ROWS } from "./workflow/operationalData";
import "./workflow/OperationalWorkflow.css";

const STORAGE_KEY = "certificate-equivalency-committee-state";

const readState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { rows: COMMITTEE_ROWS, sessions: [] };
  } catch {
    return { rows: COMMITTEE_ROWS, sessions: [] };
  }
};

const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function Content() {
  const { language } = useLanguage();
  const { can } = useAuthorization();
  const ar = language === "ar";
  const canCoordinate = can(PERMISSIONS.COMMITTEE_COORDINATE);
  const canRecord = can(PERMISSIONS.COMMITTEE_RECORD);
  const canReviewHigher = can(PERMISSIONS.HIGHER_COMMITTEE_REVIEW);
  const initial = useMemo(readState, []);
  const [rows, setRows] = useState(initial.rows || COMMITTEE_ROWS);
  const [sessions, setSessions] = useState(initial.sessions || []);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");
  const [showSession, setShowSession] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [sessionOrder, setSessionOrder] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const labels = ar ? {
    title: "اللجان", eyebrow: "مسار اللجان", description: "إدارة قوائم اللجان ودوراتها ومناقشة الطلبات وتوثيق التوصيات والنتائج.",
    technical: "اللجان الفنية", higher: "اللجان العليا", queue: "قائمة الطلبات", sessions: "دورات اللجان", session: "الدورة", date: "الموعد", code: "كود الدورة", order: "ترتيب الطلب", createSession: "إنشاء دورة", cancel: "إلغاء", save: "حفظ", open: "فتح الطلب", action: "الإجراء", applicant: "مقدم الطلب", qualification: "المؤهل", type: "اللجنة", status: "الحالة", notes: "ملاحظات اللجنة", result: "نتيجة اللجنة", equivalent: "يعادل", postponed: "أجل", notEquivalent: "مبدئياً لا يعادل", inquiry: "بحاجة إلى استفسار", additional: "بحاجة إلى وثائق جديدة", returnTechnical: "إعادة للجنة الفنية", higherDecision: "قرار اللجنة العليا", noEquivalent: "لا يعادل", transferToEquivalent: "تحول ليعادل", transferTechnical: "تحول للجنة الفنية للدراسة مرة أخرى", noRequests: "لا توجد طلبات في هذا المسار", queued: "ضمن القائمة", discussed: "قيد المناقشة", completed: "تمت مناقشته", higherRequired: "إحالة عليا", record: "تسجيل النتيجة", note: "الإحالة إلى اللجنة ليست تلقائية لكل الطلبات؛ المسار يحدد الحاجة إلى اللجنة ونوعها."
  } : {
    title: "Committees", eyebrow: "Committee route", description: "Manage committee queues and sessions, review requests, and document recommendations and results.",
    technical: "Technical committees", higher: "Higher committees", queue: "Request queue", sessions: "Committee sessions", session: "Session", date: "Date", code: "Session code", order: "Request order", createSession: "Create session", cancel: "Cancel", save: "Save", open: "Open request", action: "Action", applicant: "Applicant", qualification: "Qualification", type: "Committee", status: "Status", notes: "Committee notes", result: "Committee result", equivalent: "Equivalent", postponed: "Postponed", notEquivalent: "Preliminarily not equivalent", inquiry: "Needs inquiry", additional: "Needs new documents", returnTechnical: "Return to technical committee", higherDecision: "Higher committee decision", noEquivalent: "Not equivalent", transferToEquivalent: "Transfer to equivalent", transferTechnical: "Return to technical committee for further study", noRequests: "No requests in this route", queued: "Queued", discussed: "In session", completed: "Discussed", higherRequired: "Higher referral", record: "Record result", note: "Committee referral is not automatic for every request; the route determines whether and which committee is required."
  };

  const persist = (nextRows, nextSessions) => {
    setRows(nextRows);
    setSessions(nextSessions);
    saveState({ rows: nextRows, sessions: nextSessions });
  };

  const technicalRows = rows.filter((r) => r.committeeType !== COMMITTEE_TYPES.HIGHER && !r.higherDecision);
  const higherRows = rows.filter((r) => r.committeeType === COMMITTEE_TYPES.HIGHER || r.higherDecision);

  // These helpers must be declared before visibleRows' useMemo because the
  // memoized filter executes during render. Calling a const function before
  // its initialization causes the runtime error:
  // "Cannot access 'committeeLabel' before initialization".
  const committeeLabel = useCallback((type) => ({
    [COMMITTEE_TYPES.SECONDARY]: ar ? "اللجنة المختصة بالثانوي" : "Secondary committee",
    [COMMITTEE_TYPES.UNIVERSITY]: ar ? "اللجنة المختصة بالجامعة" : "University committee",
    [COMMITTEE_TYPES.SPECIALIZED]: ar ? "اللجنة المتخصصة" : "Specialized committee",
    [COMMITTEE_TYPES.HIGHER]: labels.higher,
  }[type] || labels.technical), [ar, labels.higher, labels.technical]);

  const stateLabel = useCallback((row) => row.state === "IN_SESSION"
    ? labels.discussed
    : row.state === "COMPLETED"
      ? labels.completed
      : row.committeeType === COMMITTEE_TYPES.HIGHER
        ? labels.higherRequired
        : labels.queued, [labels.discussed, labels.completed, labels.higherRequired, labels.queued]);

  const visibleRows = useMemo(() => {
    const base = activeTab === "higher" ? higherRows : technicalRows;
    const q = String(search ?? "").trim().toLowerCase();
    return base.filter((row) => {
      const text = [
        row.id,
        row.applicant,
        row.applicantEn,
        row.qualification,
        row.qualificationEn,
        committeeLabel(row.committeeType),
        stateLabel(row),
      ].filter((value) => value !== null && value !== undefined).join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (statusFilter !== "all" && row.state !== statusFilter) return false;
      return true;
    });
  }, [activeTab, higherRows, technicalRows, search, statusFilter, committeeLabel, stateLabel]);

  const counts = {
    queue: technicalRows.filter((r) => r.state === "QUEUED").length,
    discussed: technicalRows.filter((r) => r.state === "IN_SESSION").length,
    higher: higherRows.length,
    sessions: sessions.length,
  };

  const recordResult = (result) => {
    if (!selected) return;
    let next = rows.map((row) => row.id !== selected.id ? row : {
      ...row,
      result,
      notes,
      state: result === COMMITTEE_RESULTS.POSTPONED ? "QUEUED" : "COMPLETED",
      committeeType: result === COMMITTEE_RESULTS.NOT_EQUIVALENT && activeTab === "technical" ? COMMITTEE_TYPES.HIGHER : row.committeeType,
      higherDecision: activeTab === "higher" ? result : row.higherDecision,
      sessionCode: sessionCode || row.sessionCode,
      sessionDate: sessionDate || row.sessionDate,
      order: sessionOrder || row.order,
    });
    persist(next, sessions);
    setSelected(null);
    setNotes("");
  };

  const openRequest = (row) => {
    setSelected(row);
    setNotes(row.notes || "");
    setSessionCode(row.sessionCode || "");
    setSessionDate(row.sessionDate || "");
    setSessionOrder(row.order || "");
  };

  const createSession = () => {
    if (!sessionCode || !sessionDate) return;
    const nextSessions = [...sessions, { id: `SESSION-${Date.now()}`, code: sessionCode, date: sessionDate, type: activeTab }];
    const nextRows = rows.map((row) => row.id === selected?.id ? { ...row, state: "IN_SESSION", sessionCode, sessionDate, order: sessionOrder || "1" } : row);
    persist(nextRows, nextSessions);
    setShowSession(false);
    setSelected(null);
  };

  return <div className="page operational-workflow">
    <header className="operational-workflow__heading">
      <div><div className="operational-workflow__eyebrow">{labels.eyebrow}</div><h1>{labels.title}</h1><p>{labels.description}</p></div>
      {canCoordinate && <Button onClick={() => setShowSession(true)}>{labels.createSession}</Button>}
    </header>

    <div className="operational-stats">
      {[[labels.queue, counts.queue], [labels.discussed, counts.discussed], [labels.higher, counts.higher], [labels.sessions, counts.sessions]].map(([label, value]) => <Card key={label}><div className="operational-stat"><span>{label}</span><strong>{value}</strong></div></Card>)}
    </div>

    <Card><div className="workflow-note">{labels.note}</div></Card>

    <div className="workflow-tabs" role="tablist">
      <Button variant={activeTab === "technical" ? "primary" : "secondary"} onClick={() => setActiveTab("technical")}>{labels.technical}</Button>
      {canReviewHigher && <Button variant={activeTab === "higher" ? "primary" : "secondary"} onClick={() => setActiveTab("higher")}>{labels.higher}</Button>}
    </div>

    <Card title={activeTab === "higher" ? labels.higher : labels.technical}>
      <FilterBar
        search={search}
        onSearch={(value)=>setSearch(String(value??""))}
        searchPlaceholder={ar ? "ابحث في طلبات اللجنة..." : "Search committee requests..."}
        labels={{filters:ar?"الفلاتر":"Filters",reset:ar?"مسح الكل":"Clear all",apply:ar?"تطبيق":"Apply",active:ar?"الفلاتر النشطة":"Active filters"}}
        filters={[{key:"status",label:labels.status,value:statusFilter,defaultValue:"all",onChange:setStatusFilter,options:[{value:"all",label:ar?"كل الحالات":"All statuses"},{value:"QUEUED",label:labels.queued},{value:"IN_SESSION",label:labels.discussed},{value:"COMPLETED",label:labels.completed}]}]}
        onReset={()=>{setSearch("");setStatusFilter("all")}}
      />
      {visibleRows.length === 0 ? <div className="workflow-note">{labels.noRequests}</div> : <Table columns={[{key:"id",label:language === "ar" ? "رقم الطلب" : "Request ID"},{key:"applicant",label:labels.applicant},{key:"qualification",label:labels.qualification},{key:"type",label:labels.type},{key:"status",label:labels.status},{key:"action",label:labels.action}]} rows={visibleRows} renderCell={(row,col)=>col.key==="applicant"?(ar?row.applicant:row.applicantEn):col.key==="qualification"?(ar?row.qualification:row.qualificationEn):col.key==="type"?committeeLabel(row.committeeType):col.key==="status"?<Badge tone={row.state === "IN_SESSION" ? "neutral" : row.state === "COMPLETED" ? "success" : "warning"}>{stateLabel(row)}</Badge>:col.key==="action"?<Button variant="secondary" onClick={()=>openRequest(row)}>{labels.open}</Button>:row[col.key]} /> }
    </Card>

    <Card title={labels.sessions}>
      {sessions.length === 0 ? <div className="workflow-note">{labels.noRequests}</div> : <Table columns={[{key:"code",label:labels.code},{key:"date",label:labels.date},{key:"type",label:labels.type}]} rows={sessions} renderCell={(row,col)=>col.key==="type"?(row.type === "higher" ? labels.higher : labels.technical):row[col.key]}/>}
    </Card>

    {selected && <div className="workflow-modal" role="dialog" aria-modal="true"><div className="workflow-modal__panel"><div className="workflow-modal__header"><h2>{selected.id}</h2><Button variant="ghost" onClick={() => setSelected(null)}>×</Button></div>
      <div className="workflow-detail-grid"><div><span>{labels.applicant}</span><strong>{ar ? selected.applicant : selected.applicantEn}</strong></div><div><span>{labels.qualification}</span><strong>{ar ? selected.qualification : selected.qualificationEn}</strong></div><div><span>{labels.type}</span><strong>{committeeLabel(selected.committeeType)}</strong></div><div><span>{labels.status}</span><strong>{stateLabel(selected)}</strong></div></div>
      <label className="workflow-field"><span>{labels.notes}</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" /></label>
      <h3>{activeTab === "higher" ? labels.higherDecision : labels.result}</h3>
      {canRecord ? <div className="workflow-result-buttons">{activeTab === "technical" ? <>
        <Button onClick={() => recordResult(COMMITTEE_RESULTS.EQUIVALENT)}>{labels.equivalent}</Button>
        <Button variant="secondary" onClick={() => recordResult(COMMITTEE_RESULTS.POSTPONED)}>{labels.postponed}</Button>
        <Button variant="danger" onClick={() => recordResult(COMMITTEE_RESULTS.NOT_EQUIVALENT)}>{labels.notEquivalent}</Button>
        <Button variant="secondary" onClick={() => recordResult(COMMITTEE_RESULTS.NEW_INQUIRY)}>{labels.inquiry}</Button>
        <Button variant="secondary" onClick={() => recordResult(COMMITTEE_RESULTS.ADDITIONAL_DOCUMENT)}>{labels.additional}</Button>
      </> : <>
        <Button onClick={() => recordResult(COMMITTEE_RESULTS.EQUIVALENT)}>{labels.transferToEquivalent}</Button>
        <Button variant="secondary" onClick={() => recordResult(COMMITTEE_RESULTS.RETURN_TO_TECHNICAL)}>{labels.transferTechnical}</Button>
        <Button variant="danger" onClick={() => recordResult(COMMITTEE_RESULTS.NOT_EQUIVALENT)}>{labels.noEquivalent}</Button>
      </>}</div> : <div className="workflow-note">{ar ? "لديك صلاحية الاطلاع على اللجنة، لكن لا تملك صلاحية تسجيل النتيجة." : "You can view the committee, but you do not have permission to record results."}</div>}
    </div></div>}

    {showSession && <div className="workflow-modal" role="dialog" aria-modal="true"><div className="workflow-modal__panel"><div className="workflow-modal__header"><h2>{labels.createSession}</h2><Button variant="ghost" onClick={() => setShowSession(false)}>×</Button></div><label className="workflow-field"><span>{labels.code}</span><input value={sessionCode} onChange={(e) => setSessionCode(e.target.value)} /></label><label className="workflow-field"><span>{labels.date}</span><input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} /></label><label className="workflow-field"><span>{labels.order}</span><input value={sessionOrder} onChange={(e) => setSessionOrder(e.target.value)} /></label><div className="workflow-result-buttons"><Button onClick={createSession}>{labels.save}</Button><Button variant="secondary" onClick={() => setShowSession(false)}>{labels.cancel}</Button></div></div></div>}
  </div>;
}

export default function Committees() {
  return <RequirePermission permission={PERMISSIONS.COMMITTEE_VIEW}><Content /></RequirePermission>;
}
