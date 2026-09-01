import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLES, ROLE_LABELS } from "../auth/roles";
import { PERMISSIONS } from "../auth/permissions";
import { hasPermission } from "../auth/accessControl";
import { useLanguage } from "../context/LanguageContext";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import ScreenShell from "./workflow/ScreenShell";
import { getLocalizedRequestRows } from "./workflow/data";
import { REQUEST_STATUS_KEYS, QUALIFICATION_KEYS, requestMatchesFilters } from "../utils/requestFilters";


export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const role = user?.role || ROLES.APPLICANT;
  const roleLabel = ROLE_LABELS[role]?.[language] || role;
  const isApplicant = role === ROLES.APPLICANT;
  const isAdmin = role === ROLES.ADMIN;

  const roleMeta = {
    [ROLES.ADMIN]: {
      title: t("dashboard.title"),
      description:
        language === "ar"
          ? "إدارة النظام ومتابعة جميع عمليات معادلة الشهادات."
          : "Manage the system and monitor all certificate equivalency operations.",
      hint:
        language === "ar"
          ? "لديك صلاحية إدارية شاملة، وتظهر لك العمليات المتاحة وفق الصلاحيات الممنوحة لك."
          : "You have broad administrative access to the operations allowed by your permissions."
    },

    [ROLES.MANAGER]: {
      title:
        language === "ar"
          ? "لوحة مدير دائرة المعادلة"
          : "Equivalency Manager Dashboard",
      description:
        language === "ar"
          ? "متابعة الطلبات والمراجعات والتحقق ومسارات اللجان."
          : "Monitor applications, reviews, verification and committee workflows.",
      hint:
        language === "ar"
          ? "تظهر هنا العمليات الخاصة بإدارة ومراجعة طلبات المعادلة."
          : "This dashboard focuses on equivalency management and review operations."
    },

    [ROLES.EQUIVALENCY]: {
      title:
        language === "ar"
          ? "لوحة موظف المعادلات"
          : "Equivalency Officer Dashboard",
      description:
        language === "ar"
          ? "مراجعة الطلبات والتحقق من المؤهلات والجامعات."
          : "Review applications and verify credentials and universities.",
      hint:
        language === "ar"
          ? "تظهر هنا الطلبات والعمليات التي تدخل ضمن مهام المعادلات."
          : "Only equivalency review operations are shown here."
    },

    [ROLES.RECEIVING]: {
      title:
        language === "ar"
          ? "لوحة موظف الاستقبال"
          : "Receiving Officer Dashboard",
      description:
        language === "ar"
          ? "استلام الوثائق الورقية ومتابعة الطلبات الواردة."
          : "Receive paper documents and track incoming applications.",
      hint:
        language === "ar"
          ? "تظهر لك عمليات الاستلام والمراجعة الورقية المسموح بها."
          : "Receiving and paper-review operations are shown here."
    },

    [ROLES.INQUIRY]: {
      title:
        language === "ar"
          ? "لوحة موظف الاستعلامات"
          : "Inquiry Officer Dashboard",
      description:
        language === "ar"
          ? "متابعة الاستعلامات والطلبات التي يمكن خدمتها."
          : "Handle inquiries and accessible application information.",
      hint:
        language === "ar"
          ? "تظهر لك الاستعلامات والعمليات المرتبطة بها فقط."
          : "Only inquiry-related operations are shown here."
    },

    [ROLES.ARCHIVE]: {
      title:
        language === "ar"
          ? "لوحة موظف الأرشيف"
          : "Archive Officer Dashboard",
      description:
        language === "ar"
          ? "أرشفة الوثائق ومتابعة السجلات التي تقع ضمن صلاحياتك."
          : "Archive documents and manage records within your permissions.",
      hint:
        language === "ar"
          ? "تظهر هنا عمليات الأرشفة والخدمات المسموح بها."
          : "Archive operations and permitted services are shown here."
    },

    [ROLES.COMMITTEE_COORDINATOR]: {
      title:
        language === "ar"
          ? "لوحة منسق اللجان"
          : "Committee Coordinator Dashboard",
      description:
        language === "ar"
          ? "تنسيق أعمال اللجان ومتابعة الطلبات المحالة."
          : "Coordinate committees and monitor referred applications.",
      hint:
        language === "ar"
          ? "تظهر عمليات تنسيق اللجان ومراجعة الطلبات المحالة."
          : "Committee coordination and referred-application operations are shown here."
    },

    [ROLES.COMMITTEE_MEMBER]: {
      title:
        language === "ar"
          ? "لوحة عضو اللجنة"
          : "Committee Member Dashboard",
      description:
        language === "ar"
          ? "مراجعة الطلبات والملفات المحالة إلى اللجنة."
          : "Review applications and files assigned to the committee.",
      hint:
        language === "ar"
          ? "تظهر لك الطلبات التي تدخل ضمن نطاق مراجعة اللجنة."
          : "Only committee-review items within your scope are shown."
    },

    [ROLES.OFFICE]: {
      title:
        language === "ar"
          ? "لوحة موظف مكتب التعليم العالي"
          : "Higher Education Office Dashboard",
      description:
        language === "ar"
          ? "متابعة عمليات التسليم ضمن الصلاحيات المحددة."
          : "Track delivery operations within your assigned permissions.",
      hint:
        language === "ar"
          ? "تظهر لك عمليات التسليم المسموح بها."
          : "Permitted delivery operations are shown here."
    },

    [ROLES.PRINTING]: {
      title:
        language === "ar"
          ? "لوحة موظف الطباعة"
          : "Printing Officer Dashboard",
      description:
        language === "ar"
          ? "إدارة مسودات الطباعة والطباعة النهائية والأرشفة."
          : "Manage printing drafts, final printing and archiving.",
      hint:
        language === "ar"
          ? "تظهر لك عمليات الطباعة والأرشفة المسموح بها."
          : "Printing and permitted archive operations are shown here."
    },

    [ROLES.APPLICANT]: {
      title:
        language === "ar"
          ? "لوحتي"
          : "My Dashboard",
      description:
        language === "ar"
          ? "متابعة طلبات المعادلة والوثائق والإجراءات الخاصة بك."
          : "Track your equivalency applications, documents and actions.",
      hint:
        language === "ar"
          ? "تظهر لك بيانات طلباتك وإجراءاتك الشخصية فقط."
          : "Only your applications and personal actions are shown here."
    }
  };
  const currentMeta = roleMeta[role] || roleMeta[ROLES.APPLICANT];

  const [view, setView] = useState("active");
  const [filters, setFilters] = useState({ status: "all", qualification: "all", from: "", to: "" });
  const localizedRows = useMemo(() => getLocalizedRequestRows(language), [language]);
const scopedRows = useMemo(() => {
    if (!isApplicant) {
      return localizedRows;
    }

    return localizedRows.filter(
      (row) => row.ownerUserId === user?.id
    );
  }, [isApplicant, localizedRows, user?.id]);
  const visibleSource = useMemo(() => {
    const active = scopedRows.filter((item) => !item.archived);
    const archived = scopedRows.filter((item) => item.archived);
    if (view === "archive") return archived;
    // Archived records stay out of the normal list, but a search can still find them.
    return search.trim() ? [...active, ...archived] : active;
  }, [scopedRows, view, search]);
  const filtered = useMemo(() => visibleSource.filter((item) => requestMatchesFilters(item, { ...filters, search })), [visibleSource, filters, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const activeCount = scopedRows.filter((row) => !row.archived).length;
  const archivedCount = scopedRows.filter((row) => row.archived).length;

  const setFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const resetFilters = () => { setFilters({ status: "all", qualification: "all", from: "", to: "" }); setSearch(""); setPage(1); };
  const statusOptions = REQUEST_STATUS_KEYS.map((item) => ({ value: item.value, label: language === "ar" ? item.ar : item.en }));
  const qualificationOptions = QUALIFICATION_KEYS.map((item) => ({ value: item.value, label: language === "ar" ? item.ar : item.en }));
  const statusTone = (row) => {
    if (row.statusKey === "COMPLETED") return "success";
    if (row.statusKey === "AWAITING_INQUIRY" || row.statusKey === "DRAFT_REVIEW") return "warning";
    if (row.statusKey === "COMMITTEE") return "neutral";
    return "neutral";
  };

  const columns = [
    { key: "id", label: t("dashboard.requestId") },
    { key: "applicant", label: t("dashboard.applicant") },
    { key: "qualification", label: t("dashboard.qualification") },
    { key: "status", label: t("common.status") },
    { key: "date", label: t("dashboard.date") },
    { key: "actions", label: t("common.actions") },
  ];

  const stats = isApplicant
    ? [
        { label: t("dashboard.stats.myRequests"), value: filtered.length, icon: "document" },
        { label: t("dashboard.stats.inReview"), value: 1, icon: "search" },
        { label: t("dashboard.stats.completed"), value: 1, icon: "check" },
      ]
    : [
        { label: t("dashboard.stats.total"), value: activeCount, icon: "document" },
        { label: t("dashboard.stats.inReview"), value: 2, icon: "search" },
        { label: t("dashboard.stats.committee"), value: 1, icon: "users" },
        { label: t("dashboard.stats.completed"), value: 1, icon: "check" },
      ];

  const quickActionCandidates = isApplicant
    ? [
        { label: t("navigation.newApplication"), icon: "plus", path: "/applications/new", permission: PERMISSIONS.APPLICATION_CREATE },
        { label: t("navigation.myApplications"), icon: "document", path: "/my-applications", permission: PERMISSIONS.APPLICATION_VIEW_OWN },
        { label: t("navigation.documents"), icon: "document", path: "/documents", permission: PERMISSIONS.DOCUMENT_UPLOAD_OWN },
        { label: t("navigation.payments"), icon: "payment", path: "/payments", permission: PERMISSIONS.PAYMENT_VIEW_OWN },
      ]
    : [
        { label: t("navigation.applications"), icon: "document", path: "/applications", permission: PERMISSIONS.VIEW_APPLICATIONS },
        { label: t("navigation.receiving"), icon: "archive", path: "/receiving", permission: PERMISSIONS.RECEIVE_PAPER },
        { label: t("navigation.inquiries"), icon: "search", path: "/inquiries", permission: PERMISSIONS.MANAGE_INQUIRIES },
        { label: t("navigation.committees"), icon: "users", path: "/committees", permission: PERMISSIONS.COMMITTEE_VIEW },
        { label: t("navigation.printing"), icon: "print", path: "/printing", permission: PERMISSIONS.PRINT_DRAFT },
        { label: t("navigation.archive"), icon: "archive", path: "/archive", permission: PERMISSIONS.ARCHIVE_DOCUMENT },
        { label: t("navigation.delivery"), icon: "check", path: "/delivery", permission: PERMISSIONS.DELIVERY },
        { label: t("navigation.reports"), icon: "reports", path: "/reports", permission: PERMISSIONS.REPORTS_VIEW },
        { label: t("navigation.users"), icon: "users", path: "/users", permission: PERMISSIONS.MANAGE_USERS },
        { label: t("navigation.postDecision"), icon: "check", path: "/post-decision", permission: PERMISSIONS.POST_DECISION_SERVICE_VIEW },
      ];
  const quickActions = quickActionCandidates.filter((action) => hasPermission(user, action.permission)).slice(0, isAdmin ? 6 : 4);

  return (
    <ScreenShell
      title={currentMeta.title}
      description={currentMeta.description}
      icon="dashboard"
      actions={<span className="dashboard-role"><Icon name="user" size={17} />{roleLabel}</span>}
      stats={stats}
    >
      <Card className="dashboard-welcome-card">
        <div className="dashboard-welcome-icon"><Icon name="shield" size={24} /></div>
        <div>
          <strong>{t("dashboard.welcome", { role: roleLabel })}</strong>
          <p>{currentMeta.hint}</p>
        </div>
      </Card>

      <div className="dashboard-quick-grid">
        {quickActions.map((action) => (
          <button key={action.path} type="button" className="dashboard-quick-card" onClick={() => navigate(action.path)}>
            <span><Icon name={action.icon} size={21} /></span>
            <strong>{action.label}</strong>
            <Icon name="arrowRight" size={17} className="dashboard-quick-arrow" />
          </button>
        ))}
      </div>

      <Card>
        <div
          className="request-list-tabs"
          role="tablist"
          aria-label={
            language === "ar"
              ? "نطاق الطلبات"
              : "Request scope"
          }
        >
          <button
            type="button"
            className={
              view === "active"
                ? "request-list-tab active"
                : "request-list-tab"
            }
            onClick={() => {
              setView("active");
              setPage(1);
            }}
          >
            {language === "ar"
              ? "الطلبات النشطة"
              : "Active requests"}
            <span>{activeCount}</span>
          </button>

          <button
            type="button"
            className={
              view === "archive"
                ? "request-list-tab active"
                : "request-list-tab"
            }
            onClick={() => {
              setView("archive");
              setPage(1);
            }}
          >
            {language === "ar"
              ? "الأرشيف"
              : "Archive"}
            <span>{archivedCount}</span>
          </button>
        </div>

        <div className="dashboard-table-heading">
          <div>
            <h2>
              {view === "archive"
                ? language === "ar"
                  ? "الطلبات المؤرشفة"
                  : "Archived requests"
                : isApplicant
                  ? t("dashboard.myRequests")
                  : t("dashboard.operations")}
            </h2>

            <p>
              {language === "ar"
                ? `عرض ${filtered.length} من ${visibleSource.length} طلب`
                : `Showing ${filtered.length} of ${visibleSource.length} requests`}
            </p>
          </div>
        </div>

        <FilterBar
          search={search}
          onSearch={(value) => {
            setSearch(String(value ?? ""));
            setPage(1);
          }}
          searchPlaceholder={
            language === "ar"
              ? "ابحث برقم الطلب أو الاسم أو الحالة..."
              : "Search by request, name or status..."
          }
          labels={{
            filters:
              language === "ar"
                ? "الفلاتر"
                : "Filters",
            reset:
              language === "ar"
                ? "مسح الكل"
                : "Clear all",
            apply:
              language === "ar"
                ? "تطبيق"
                : "Apply",
            active:
              language === "ar"
                ? "الفلاتر النشطة"
                : "Active filters"
          }}
          filters={[
            {
              key: "status",
              label:
                language === "ar"
                  ? "الحالة"
                  : "Status",
              value: filters.status,
              defaultValue: "all",
              onChange: (v) =>
                setFilter("status", v),
              options: statusOptions
            },
            {
              key: "qualification",
              label:
                language === "ar"
                  ? "المؤهل"
                  : "Qualification",
              value: filters.qualification,
              defaultValue: "all",
              onChange: (v) =>
                setFilter("qualification", v),
              options: qualificationOptions
            },
            {
              key: "from",
              label:
                language === "ar"
                  ? "من تاريخ"
                  : "From date",
              value: filters.from,
              defaultValue: "",
              onChange: (v) =>
                setFilter("from", v),
              type: "date"
            },
            {
              key: "to",
              label:
                language === "ar"
                  ? "إلى تاريخ"
                  : "To date",
              value: filters.to,
              defaultValue: "",
              onChange: (v) =>
                setFilter("to", v),
              type: "date"
            }
          ]}
          onReset={resetFilters}
        />
        <Table
          columns={columns}
          rows={rows}
          renderCell={(row, column) => {
            if (column.key === "status") return <Badge tone={statusTone(row)}>{row.status}</Badge>;
            if (column.key === "actions") return <Button variant="ghost" size="sm" onClick={() => navigate(`/applications/${row.id}`)}>{t("common.view")} →</Button>;
            return row[column.key];
          }}
        />
        <Pagination page={safePage} pageCount={totalPages} onPageChange={setPage} />
      </Card>
    </ScreenShell>
  );
}






