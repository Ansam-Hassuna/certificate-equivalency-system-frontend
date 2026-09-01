import React, { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { RequirePermission } from "../auth/guards";
import { PERMISSIONS } from "../auth/permissions";
import { getLocalizedRequestRows } from "./workflow/data";
import { REQUEST_STATUS_KEYS, QUALIFICATION_KEYS, requestMatchesFilters } from "../utils/requestFilters";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import FilterBar from "../components/ui/FilterBar";
import "./Reports.css";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function toneForStatus(statusKey) {
  if (statusKey === "COMPLETED") return "success";
  if (statusKey === "AWAITING_INQUIRY" || statusKey === "DRAFT_REVIEW") return "warning";
  if (statusKey === "NOT_EQUIVALENT") return "danger";
  return "info";
}

function Content() {
  const { t, language } = useLanguage();
  const isArabic = language === "ar";
  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");
  const [filters, setFilters] = useState({ status: "all", qualification: "all", from: "", to: "" });

  const rows = useMemo(() => getLocalizedRequestRows(language), [language]);
  const activeRows = rows.filter((row) => !row.archived);
  const archivedRows = rows.filter((row) => row.archived);
  const sourceRows = view === "archive" ? archivedRows : search.trim() ? rows : activeRows;
  const visibleRows = sourceRows.filter((row) => requestMatchesFilters(row, { ...filters, search }));

  const allStatusCounts = countBy(rows, "statusKey");
  const qualificationCounts = countBy(rows, "qualificationKey");

  const monthlyCounts = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      const month = row.date.slice(0, 7);
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [rows]);

  const statusItems = REQUEST_STATUS_KEYS.filter((item) => item.value !== "all").map((item) => ({
    ...item,
    count: allStatusCounts[item.value] || 0,
    label: isArabic ? item.ar : item.en,
  }));

  const qualificationItems = QUALIFICATION_KEYS.filter((item) => item.value !== "all").map((item) => ({
    ...item,
    count: qualificationCounts[item.value] || 0,
    label: isArabic ? item.ar : item.en,
  }));

  const maxStatus = Math.max(1, ...statusItems.map((item) => item.count));
  const maxQualification = Math.max(1, ...qualificationItems.map((item) => item.count));
  const maxMonth = Math.max(1, ...monthlyCounts.map(([, count]) => count));

  const resetFilters = () => {
    setFilters({ status: "all", qualification: "all", from: "", to: "" });
    setSearch("");
  };

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const exportCsv = () => {
    const headers = isArabic
      ? ["رقم الطلب", "مقدم الطلب", "المؤهل", "الجامعة", "الحالة", "التاريخ"]
      : ["Request ID", "Applicant", "Qualification", "University", "Status", "Date"];
    const keys = ["id", "applicant", "qualification", "university", "status", "date"];
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [headers, ...visibleRows.map((row) => keys.map((key) => row[key]))]
      .map((line) => line.map(escape).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isArabic ? "تقرير-طلبات-المعادلة.csv" : "equivalency-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div className="page reports-page">
      <header className="reports-hero">
        <div className="reports-hero__title">
          <span className="reports-hero__icon"><Icon name="reports" size={28} /></span>
          <div>
            <span className="reports-hero__eyebrow">{isArabic ? "مؤشرات النظام" : "System insights"}</span>
            <h1>{t("reports.title")}</h1>
            <p>{t("reports.description")}</p>
          </div>
        </div>
        <div className="reports-hero__actions">
          <Button variant="secondary" icon={<Icon name="print" size={17} />} onClick={printReport}>
            {isArabic ? "طباعة التقرير" : "Print report"}
          </Button>
          <Button icon={<Icon name="document" size={17} />} onClick={exportCsv}>
            {isArabic ? "تصدير CSV" : "Export CSV"}
          </Button>
        </div>
      </header>

      <section className="reports-kpis" aria-label={isArabic ? "المؤشرات الرئيسية" : "Key indicators"}>
        <Kpi icon="document" label={isArabic ? "إجمالي الطلبات" : "Total requests"} value={rows.length} note={isArabic ? "جميع السجلات" : "All records"} />
        <Kpi icon="route" label={isArabic ? "النشطة" : "Active"} value={activeRows.length} note={isArabic ? "تحتاج متابعة" : "Need follow-up"} tone="info" />
        <Kpi icon="archive" label={isArabic ? "الأرشيف" : "Archive"} value={archivedRows.length} note={isArabic ? "قديمة ومخفية افتراضيًا" : "Hidden by default"} tone="neutral" />
        <Kpi icon="check" label={isArabic ? "مكتملة" : "Completed"} value={allStatusCounts.COMPLETED || 0} note={isArabic ? "نتائج نهائية" : "Final results"} tone="success" />
        <Kpi icon="warning" label={isArabic ? "غير معادلة" : "Not equivalent"} value={allStatusCounts.NOT_EQUIVALENT || 0} note={isArabic ? "تحتاج إجراء" : "Require action"} tone="warning" />
      </section>

      <Card className="reports-filter-card">
        <div className="reports-section-heading">
          <div>
            <h2>{isArabic ? "تصفية التقرير" : "Report filters"}</h2>
            <p>{isArabic ? "حدّد نطاق البيانات التي تريد تحليلها أو تصديرها." : "Choose the data range you want to analyze or export."}</p>
          </div>
          <span className="reports-result-pill"><Icon name="search" size={15} /> {isArabic ? `${visibleRows.length} سجل` : `${visibleRows.length} records`}</span>
        </div>
        <FilterBar
          search={search}
          onSearch={(value) => setSearch(String(value ?? ""))}
          searchPlaceholder={isArabic ? "ابحث برقم الطلب أو الاسم أو الجامعة..." : "Search by request ID, name, or university..."}
          labels={{ filters: isArabic ? "الفلاتر" : "Filters", reset: isArabic ? "مسح الكل" : "Clear all", apply: isArabic ? "تطبيق" : "Apply", active: isArabic ? "الفلاتر النشطة" : "Active filters" }}
          filters={[
            { key: "status", label: isArabic ? "الحالة" : "Status", value: filters.status, defaultValue: "all", onChange: (v) => setFilter("status", v), options: REQUEST_STATUS_KEYS.map((item) => ({ value: item.value, label: isArabic ? item.ar : item.en })) },
            { key: "qualification", label: isArabic ? "المؤهل" : "Qualification", value: filters.qualification, defaultValue: "all", onChange: (v) => setFilter("qualification", v), options: QUALIFICATION_KEYS.map((item) => ({ value: item.value, label: isArabic ? item.ar : item.en })) },
            { key: "from", label: isArabic ? "من تاريخ" : "From date", value: filters.from, defaultValue: "", onChange: (v) => setFilter("from", v), type: "date" },
            { key: "to", label: isArabic ? "إلى تاريخ" : "To date", value: filters.to, defaultValue: "", onChange: (v) => setFilter("to", v), type: "date" },
          ]}
          onReset={resetFilters}
        />
      </Card>

      <div className="reports-view-switch" role="tablist" aria-label={isArabic ? "نطاق السجلات" : "Record scope"}>
        <button type="button" role="tab" aria-selected={view === "active"} className={view === "active" ? "is-active" : ""} onClick={() => setView("active")}>
          {isArabic ? "النشطة" : "Active"}<span>{activeRows.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={view === "archive"} className={view === "archive" ? "is-active" : ""} onClick={() => setView("archive")}>
          {isArabic ? "الأرشيف" : "Archive"}<span>{archivedRows.length}</span>
        </button>
      </div>

      <section className="reports-chart-grid">
        <Card className="report-chart-card">
          <div className="reports-section-heading">
            <div><h2>{isArabic ? "الطلبات حسب الحالة" : "Requests by status"}</h2><p>{isArabic ? "توزيع السجلات الحالية حسب مسارها." : "Distribution of records by workflow status."}</p></div>
          </div>
          <div className="status-bars">
            {statusItems.map((item) => (
              <div className="status-bar-row" key={item.value}>
                <div className="status-bar-label"><span>{item.label}</span><strong>{item.count}</strong></div>
                <div className="status-bar-track"><span style={{ width: `${(item.count / maxStatus) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="report-chart-card">
          <div className="reports-section-heading">
            <div><h2>{isArabic ? "الطلبات حسب المؤهل" : "Requests by qualification"}</h2><p>{isArabic ? "مقارنة سريعة بين أنواع المؤهلات." : "A quick comparison across qualification types."}</p></div>
          </div>
          <div className="qualification-bars">
            {qualificationItems.map((item) => (
              <div className="qualification-row" key={item.value}>
                <div className="qualification-value"><strong>{item.count}</strong><span>{item.label}</span></div>
                <div className="qualification-track"><span style={{ height: `${Math.max(10, (item.count / maxQualification) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="report-chart-card report-chart-card--wide">
          <div className="reports-section-heading">
            <div><h2>{isArabic ? "الاتجاه الزمني" : "Requests over time"}</h2><p>{isArabic ? "آخر الفترات المتوفرة في البيانات التجريبية." : "Recent periods available in the current dataset."}</p></div>
          </div>
          <div className="timeline-chart">
            <div className="timeline-chart__grid" />
            <div className="timeline-chart__bars">
              {monthlyCounts.map(([month, count]) => {
                const [year, monthNumber] = month.split("-");
                const label = isArabic ? `${MONTHS_AR[Number(monthNumber) - 1]} ${year}` : `${MONTHS_EN[Number(monthNumber) - 1]} ${year}`;
                return <div className="timeline-column" key={month}><div className="timeline-value">{count}</div><span style={{ height: `${Math.max(12, (count / maxMonth) * 100)}%` }} /><small>{label}</small></div>;
              })}
            </div>
          </div>
        </Card>
      </section>

      <Card className="reports-table-card">
        <div className="reports-section-heading">
          <div><h2>{isArabic ? "سجلات التقرير" : "Report records"}</h2><p>{isArabic ? "السجلات القديمة تبقى في الأرشيف ولا تظهر في العرض النشط إلا عند البحث أو فتح الأرشيف." : "Older records remain archived and are hidden from the active view unless searched or the archive is opened."}</p></div>
          <Badge tone="info">{isArabic ? `عرض ${visibleRows.length} من ${sourceRows.length}` : `Showing ${visibleRows.length} of ${sourceRows.length}`}</Badge>
        </div>
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead><tr>
              <th>{isArabic ? "رقم الطلب" : "Request ID"}</th>
              <th>{isArabic ? "مقدم الطلب" : "Applicant"}</th>
              <th>{isArabic ? "المؤهل" : "Qualification"}</th>
              <th>{isArabic ? "الحالة" : "Status"}</th>
              <th>{isArabic ? "التاريخ" : "Date"}</th>
            </tr></thead>
            <tbody>
              {visibleRows.length ? visibleRows.map((row) => <tr key={row.id}>
                <td><strong>{row.id}</strong></td><td>{row.applicant}</td><td>{row.qualification}</td><td><Badge tone={toneForStatus(row.statusKey)}>{row.status}</Badge></td><td>{row.date}</td>
              </tr>) : <tr><td colSpan="5" className="reports-empty">{isArabic ? "لا توجد سجلات مطابقة للفلاتر الحالية." : "No records match the current filters."}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, note, tone = "default" }) {
  return <Card className={`reports-kpi reports-kpi--${tone}`}><div className="reports-kpi__top"><span className="reports-kpi__icon"><Icon name={icon} size={20} /></span><span>{note}</span></div><strong>{value}</strong><p>{label}</p></Card>;
}

export default function ReportsPage() {
  return <RequirePermission permission={PERMISSIONS.REPORTS_VIEW}><Content /></RequirePermission>;
}
