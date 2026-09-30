import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

import FilterBar from "../components/ui/FilterBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";

import ScreenShell from "./workflow/ScreenShell";

import {
  REQUEST_STATUS_KEYS,
  QUALIFICATION_KEYS
} from "../utils/requestFilters";

import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import { useAuthorization } from "../auth/useAuthorization";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:5001";


// ============================================================
// Helpers
// ============================================================

// نجيب JWT المخزن بعد تسجيل الدخول
function getAuthToken() {
  try {
    const session = JSON.parse(
      sessionStorage.getItem("ce_auth_session") ||
      "null"
    );

    return session?.token || null;
  } catch {
    return null;
  }
}


// نحول status من قيمة الفرونت
// إلى القيمة التي يتوقعها الباك
function mapStatusToApi(status) {
  if (!status || status === "all") {
    return null;
  }

  const value =
    String(status).toUpperCase();

  const map = {
    DRAFT: "Draft",

    SUBMITTED: "Submitted",

    UNDER_REVIEW: "UnderReview",
    IN_REVIEW: "UnderReview",
    DRAFT_REVIEW: "UnderReview",

    AWAITING_INQUIRY:
      "WaitingForInquiry",

    WAITING_FOR_INQUIRY:
      "WaitingForInquiry",

    COMMITTEE: "Committee",

    COMPLETED: "Completed",

    REJECTED: "Rejected",

    CANCELLED: "Cancelled",
    CANCELED: "Cancelled"
  };

  return map[value] || status;
}


// نحول qualification من قيم الفرونت
// إلى QualificationType بالباك
function mapQualificationToApi(
  qualification
) {
  if (
    !qualification ||
    qualification === "all"
  ) {
    return null;
  }

  const value =
    String(
      qualification
    ).toUpperCase();

  const map = {
    SECONDARY: "Secondary",

    DIPLOMA: "Diploma",

    BACHELOR: "Bachelor",

    MASTER: "Master",

    PHD: "PhD",
    DOCTORATE: "PhD",

    MEDIUM_DIPLOMA:
      "MediumDiploma",

    HIGHER_DIPLOMA:
      "HigherDiploma"
  };

  return map[value] || qualification;
}


// ترجمة حالة الطلب
function getStatusLabel(
  status,
  language
) {
  const labels = {
    Draft: {
      ar: "مسودة",
      en: "Draft"
    },

    Submitted: {
      ar: "تم التقديم",
      en: "Submitted"
    },

    UnderReview: {
      ar: "قيد الدراسة",
      en: "Under review"
    },

    WaitingForInquiry: {
      ar: "بانتظار الاستفسار",
      en: "Awaiting inquiry"
    },

    Committee: {
      ar: "لدى اللجنة",
      en: "Committee"
    },

    Completed: {
      ar: "مكتمل",
      en: "Completed"
    },

    Rejected: {
      ar: "مرفوض",
      en: "Rejected"
    },

    Cancelled: {
      ar: "ملغي",
      en: "Cancelled"
    }
  };

  return (
    labels[status]?.[language] ||
    status
  );
}


// ترجمة نوع المؤهل
function getQualificationLabel(
  qualification,
  language
) {
  const labels = {
    Secondary: {
      ar: "الثانوية",
      en: "Secondary"
    },

    Diploma: {
      ar: "دبلوم",
      en: "Diploma"
    },

    Bachelor: {
      ar: "بكالوريوس",
      en: "Bachelor"
    },

    Master: {
      ar: "ماجستير",
      en: "Master"
    },

    PhD: {
      ar: "دكتوراه",
      en: "PhD"
    },

    MediumDiploma: {
      ar: "دبلوم متوسط",
      en: "Medium Diploma"
    },

    HigherDiploma: {
      ar: "دبلوم عالي",
      en: "Higher Diploma"
    }
  };

  return (
    labels[qualification]?.[
      language
    ] || qualification
  );
}


// تنسيق التاريخ
function formatDate(
  date,
  language
) {
  if (!date) {
    return "";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    language === "ar"
      ? "ar"
      : "en",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(parsedDate);
}


// ============================================================
// Content
// ============================================================

function Content() {
  const {
    t,
    language
  } = useLanguage();

  const navigate =
    useNavigate();

  const { can } =
    useAuthorization();


  // ==========================================================
  // State
  // ==========================================================

  const [
    applications,
    setApplications
  ] = useState([]);

  const [
    stats,
    setStats
  ] = useState({
    totalApplications: 0,
    active: 0,
    archived: 0,
    underReview: 0,
    waitingForInquiry: 0,
    committee: 0,
    completed: 0
  });


  const [
    search,
    setSearch
  ] = useState("");

  const [
    page,
    setPage
  ] = useState(1);

  const [
    view,
    setView
  ] = useState("active");

  const [
    filters,
    setFilters
  ] = useState({
    status: "all",
    qualification: "all",
    from: "",
    to: ""
  });


  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");


  const pageSize = 8;


  // ==========================================================
  // Load Statistics
  // ==========================================================

  useEffect(() => {
    const loadStats =
      async () => {
        try {
          const token =
            getAuthToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/Admin/dashboard-stats`,
              {
                credentials:
                  "include",

                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );


          if (!response.ok) {
            throw new Error(
              `Stats request failed: ${response.status}`
            );
          }


          const data =
            await response.json();


          setStats({
            totalApplications:
              data.totalApplications ??
              0,

            active:
              data.active ??
              0,

            archived:
              data.archived ??
              0,

            underReview:
              data.underReview ??
              0,

            waitingForInquiry:
              data.waitingForInquiry ??
              0,

            committee:
              data.committee ??
              0,

            completed:
              data.completed ??
              0
          });

        } catch (err) {
          console.error(
            "Applications stats error:",
            err
          );
        }
      };


    loadStats();

  }, []);


  // ==========================================================
  // Load Applications
  // ==========================================================

  useEffect(() => {
    const loadApplications =
      async () => {
        try {
          setLoading(true);
          setError("");


          const token =
            getAuthToken();


          const params =
            new URLSearchParams();


          // --------------------------
          // Search
          // --------------------------

          if (search.trim()) {
            params.append(
              "search",
              search.trim()
            );
          }


          // --------------------------
          // Status
          // --------------------------

          const apiStatus =
            mapStatusToApi(
              filters.status
            );


          if (apiStatus) {
            params.append(
              "status",
              apiStatus
            );
          }


          // --------------------------
          // Qualification
          // --------------------------

          const apiQualification =
            mapQualificationToApi(
              filters.qualification
            );


          if (apiQualification) {
            params.append(
              "qualification",
              apiQualification
            );
          }


          // --------------------------
          // From Date
          // --------------------------

          if (filters.from) {
            params.append(
              "from",
              filters.from
            );
          }


          // --------------------------
          // To Date
          // --------------------------

          if (filters.to) {
            params.append(
              "to",
              filters.to
            );
          }


          // --------------------------
          // Active / Archive
          // --------------------------

          const endpoint =
            view === "archive"
              ? "archive"
              : "active";


          const query =
            params.toString();


          const url =
            `${API_BASE_URL}/api/Admin/applications/${endpoint}` +
            (
              query
                ? `?${query}`
                : ""
            );


          const response =
            await fetch(
              url,
              {
                credentials:
                  "include",

                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );


          if (!response.ok) {
            const text =
              await response.text();

            throw new Error(
              text ||
              `Request failed: ${response.status}`
            );
          }


          const data =
            await response.json();


          // نحول DTO القادم من الباك
          // للشكل المطلوب بالجدول
          const mapped =
            data.map(
              (application) => ({
                // الرقم المعروض
                id:
                  application.requestNumber,

                // الـ Id الحقيقي
                applicationId:
                  application.id,

                applicant:
                  application.applicantName,

                qualification:
                  getQualificationLabel(
                    application.qualificationType,
                    language
                  ),

                qualificationKey:
                  application.qualificationType,

                // الجامعة غير موجودة
                // بالـ backend الحالي
                // إذا انضافت لاحقاً ستظهر تلقائياً
                university:
                  application.universityName ||
                  "-",

                status:
                  getStatusLabel(
                    application.status,
                    language
                  ),

                statusKey:
                  application.status,

                date:
                  formatDate(
                    application.date,
                    language
                  )
              })
            );


          setApplications(
            mapped
          );

        } catch (err) {
          console.error(
            "Applications API error:",
            err
          );

          setApplications([]);

          setError(
            language === "ar"
              ? "حدث خطأ أثناء تحميل طلبات المعادلة."
              : "Failed to load equivalency applications."
          );

        } finally {
          setLoading(false);
        }
      };


    loadApplications();

  }, [
    view,
    search,
    filters.status,
    filters.qualification,
    filters.from,
    filters.to,
    language
  ]);


  // ==========================================================
  // Pagination
  // ==========================================================

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        applications.length /
        pageSize
      )
    );


  const safePage =
    Math.min(
      page,
      pageCount
    );


  const pageRows =
    useMemo(
      () =>
        applications.slice(
          (safePage - 1) *
            pageSize,

          safePage *
            pageSize
        ),
      [
        applications,
        safePage
      ]
    );


  // ==========================================================
  // Filters
  // ==========================================================

  const setFilter =
    (key, value) => {
      setFilters(
        (current) => ({
          ...current,
          [key]: value
        })
      );

      setPage(1);
    };


  const resetFilters =
    () => {
      setFilters({
        status: "all",
        qualification: "all",
        from: "",
        to: ""
      });

      setSearch("");

      setPage(1);
    };


  const statusOptions =
    REQUEST_STATUS_KEYS.map(
      (item) => ({
        value:
          item.value,

        label:
          language === "ar"
            ? item.ar
            : item.en
      })
    );


  const qualificationOptions =
    QUALIFICATION_KEYS.map(
      (item) => ({
        value:
          item.value,

        label:
          language === "ar"
            ? item.ar
            : item.en
      })
    );


  // ==========================================================
  // Badge tone
  // ==========================================================

  const statusTone =
    (row) => {
      switch (
        row.statusKey
      ) {
        case "Completed":
          return "success";

        case "WaitingForInquiry":
          return "warning";

        case "Rejected":
        case "Cancelled":
          return "danger";

        case "Committee":
          return "neutral";

        default:
          return "neutral";
      }
    };


  // ==========================================================
  // Table Columns
  // ==========================================================

  const columns = [
    {
      key: "id",
      label:
        t("applications.id")
    },

    {
      key: "applicant",
      label:
        t(
          "applications.applicant"
        )
    },

    {
      key: "qualification",
      label:
        t(
          "applications.qualification"
        )
    },

    {
      key: "university",
      label:
        t(
          "applications.university"
        )
    },

    {
      key: "status",
      label:
        t("common.status")
    },

    {
      key: "date",
      label:
        t("applications.date")
    },

    {
      key: "actions",
      label:
        t("common.actions")
    }
  ];


  const canCreate =
    can(
      PERMISSIONS.APPLICATION_CREATE
    );


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <ScreenShell
      title={
        t("applications.title")
      }

      description={
        t(
          "applications.description"
        )
      }

      icon="document"

      stats={[
        {
          label:
            t(
              "applications.stats.total"
            ),

          value:
            stats.totalApplications
        },

        {
          label:
            t(
              "applications.stats.review"
            ),

          value:
            stats.underReview
        },

        {
          label:
            t(
              "applications.stats.inquiry"
            ),

          value:
            stats.waitingForInquiry
        },

        {
          label:
            t(
              "applications.stats.committee"
            ),

          value:
            stats.committee
        }
      ]}

      actions={
        canCreate
          ? (
              <Button
                onClick={() =>
                  navigate(
                    "/applications/new"
                  )
                }

                icon={
                  <Icon
                    name="plus"
                    size={18}
                  />
                }
              >
                {t(
                  "applications.new"
                )}
              </Button>
            )
          : null
      }
    >

      {/* ================================================ */}
      {/* Search / Filters */}
      {/* ================================================ */}

      <Card>

        <div
          className="request-list-tabs"
          role="tablist"
        >

          {/* Active */}

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

            <span>
              {stats.active}
            </span>
          </button>


          {/* Archive */}

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

            <span>
              {stats.archived}
            </span>
          </button>

        </div>


        {/* Heading */}

        <div className="dashboard-table-heading">

          <div>

            <h2>
              {view === "archive"
                ? (
                    language === "ar"
                      ? "الطلبات المؤرشفة"
                      : "Archived requests"
                  )
                : t(
                    "applications.title"
                  )}
            </h2>


            <p>
              {loading
                ? (
                    language === "ar"
                      ? "جاري تحميل الطلبات..."
                      : "Loading applications..."
                  )
                : (
                    language === "ar"
                      ? `عرض ${applications.length} طلب`
                      : `Showing ${applications.length} requests`
                  )}
            </p>

          </div>

        </div>


        {/* Error */}

        {error && (
          <div
            className="form-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* Filters */}

        <FilterBar
          search={search}

          onSearch={
            (value) => {
              setSearch(
                String(
                  value ?? ""
                )
              );

              setPage(1);
            }
          }

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
              key:
                "status",

              label:
                language === "ar"
                  ? "الحالة"
                  : "Status",

              value:
                filters.status,

              defaultValue:
                "all",

              onChange:
                (value) =>
                  setFilter(
                    "status",
                    value
                  ),

              options:
                statusOptions
            },

            {
              key:
                "qualification",

              label:
                language === "ar"
                  ? "المؤهل"
                  : "Qualification",

              value:
                filters.qualification,

              defaultValue:
                "all",

              onChange:
                (value) =>
                  setFilter(
                    "qualification",
                    value
                  ),

              options:
                qualificationOptions
            },

            {
              key:
                "from",

              label:
                language === "ar"
                  ? "من تاريخ"
                  : "From date",

              value:
                filters.from,

              defaultValue:
                "",

              onChange:
                (value) =>
                  setFilter(
                    "from",
                    value
                  ),

              type:
                "date"
            },

            {
              key:
                "to",

              label:
                language === "ar"
                  ? "إلى تاريخ"
                  : "To date",

              value:
                filters.to,

              defaultValue:
                "",

              onChange:
                (value) =>
                  setFilter(
                    "to",
                    value
                  ),

              type:
                "date"
            }
          ]}

          onReset={
            resetFilters
          }
        />

      </Card>


      {/* ================================================ */}
      {/* Table */}
      {/* ================================================ */}

      <Card>

        <Table
          columns={
            columns
          }

          rows={
            pageRows
          }

          renderCell={(
            row,
            col
          ) => {

            // Status
            if (
              col.key ===
              "status"
            ) {
              return (
                <Badge
                  tone={
                    statusTone(
                      row
                    )
                  }
                >
                  {row.status}
                </Badge>
              );
            }


            // Action
            if (
              col.key ===
              "actions"
            ) {
              return (
                <Button
                  variant="ghost"

                  size="sm"

                  onClick={() =>
                    navigate(
                      `/applications/${row.applicationId}`
                    )
                  }
                >
                  {t(
                    "common.view"
                  )}{" "}
                  →
                </Button>
              );
            }


            return row[
              col.key
            ];
          }}
        />


        <Pagination
          page={
            safePage
          }

          pageCount={
            pageCount
          }

          onPageChange={
            setPage
          }
        />

      </Card>

    </ScreenShell>
  );
}


// ============================================================
// Page
// ============================================================

export default function Applications() {
  return (
    <RequirePermission
      permission={
        PERMISSIONS.VIEW_APPLICATIONS
      }
    >
      <Content />
    </RequirePermission>
  );
}