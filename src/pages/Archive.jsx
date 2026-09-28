import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";

import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";

import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import FilterBar from "../components/ui/FilterBar";

import ScreenShell from "./workflow/ScreenShell";

import {
  QUALIFICATION_KEYS
} from "../utils/requestFilters";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:5001";


// ============================================================
// Helpers
// ============================================================

// نجيب الـ JWT من sessionStorage
function getAuthToken() {
  try {
    const session = JSON.parse(
      sessionStorage.getItem(
        "ce_auth_session"
      ) || "null"
    );

    return session?.token || null;
  } catch {
    return null;
  }
}


// تحويل qualification من قيمة الفرونت
// إلى QualificationType الموجود بالباك
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


// ترجمة المؤهل
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


// ترجمة الحالة
function getStatusLabel(
  status,
  language
) {
  const labels = {
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


  // ==========================================================
  // State
  // ==========================================================

  const [
    archiveRows,
    setArchiveRows
  ] = useState([]);


  // نسخة كاملة بدون فلاتر
  // نستخدمها لمعرفة أقدم طلب
  const [
    allArchiveRows,
    setAllArchiveRows
  ] = useState([]);


  const [
    archivedTotal,
    setArchivedTotal
  ] = useState(0);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    filters,
    setFilters
  ] = useState({
    qualification: "all",
    from: "",
    to: ""
  });


  const [
    page,
    setPage
  ] = useState(1);


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
  // Load Dashboard Stats
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


          setArchivedTotal(
            data.archived ?? 0
          );

        } catch (err) {
          console.error(
            "Archive stats error:",
            err
          );
        }
      };


    loadStats();

  }, []);


  // ==========================================================
  // Load Full Archive
  // ==========================================================

  useEffect(() => {
    const loadFullArchive =
      async () => {
        try {
          const token =
            getAuthToken();

          const response =
            await fetch(
              `${API_BASE_URL}/api/Admin/applications/archive`,
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
              `Archive request failed: ${response.status}`
            );
          }


          const data =
            await response.json();


          const mapped =
            data.map(
              (application) => ({
                id:
                  application.requestNumber,

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
                  ),

                rawDate:
                  application.date
              })
            );


          setAllArchiveRows(
            mapped
          );

        } catch (err) {
          console.error(
            "Full archive error:",
            err
          );
        }
      };


    loadFullArchive();

  }, [language]);


  // ==========================================================
  // Load Filtered Archive
  // ==========================================================

  useEffect(() => {
    const loadArchive =
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


          const query =
            params.toString();


          const url =
            `${API_BASE_URL}/api/Admin/applications/archive` +
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
              `Archive request failed: ${response.status}`
            );
          }


          const data =
            await response.json();


          const mapped =
            data.map(
              (application) => ({
                // رقم الطلب المعروض
                id:
                  application.requestNumber,

                // Id الحقيقي
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
                  ),

                rawDate:
                  application.date
              })
            );


          setArchiveRows(
            mapped
          );

        } catch (err) {
          console.error(
            "Archive API error:",
            err
          );


          setArchiveRows([]);


          setError(
            language === "ar"
              ? "حدث خطأ أثناء تحميل الأرشيف."
              : "Failed to load archive."
          );

        } finally {
          setLoading(false);
        }
      };


    loadArchive();

  }, [
    search,
    filters.qualification,
    filters.from,
    filters.to,
    language
  ]);


  // ==========================================================
  // Oldest Request
  // ==========================================================

  const oldestRequest =
    useMemo(() => {
      if (
        allArchiveRows.length === 0
      ) {
        return "—";
      }


      const validRows =
        allArchiveRows.filter(
          (row) =>
            row.rawDate &&
            !Number.isNaN(
              new Date(
                row.rawDate
              ).getTime()
            )
        );


      if (
        validRows.length === 0
      ) {
        return "—";
      }


      const oldest =
        validRows.reduce(
          (oldestRow, row) => {
            return (
              new Date(
                row.rawDate
              ) <
              new Date(
                oldestRow.rawDate
              )
            )
              ? row
              : oldestRow;
          }
        );


      return oldest.date;

    }, [
      allArchiveRows
    ]);


  // ==========================================================
  // Pagination
  // ==========================================================

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        archiveRows.length /
        pageSize
      )
    );


  const safePage =
    Math.min(
      page,
      pageCount
    );


  const rows =
    archiveRows.slice(
      (safePage - 1) *
        pageSize,

      safePage *
        pageSize
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


  const reset =
    () => {
      setFilters({
        qualification: "all",
        from: "",
        to: ""
      });

      setSearch("");

      setPage(1);
    };


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
  // Badge Tone
  // ==========================================================

  function statusTone(
    statusKey
  ) {
    if (
      statusKey === "Completed"
    ) {
      return "success";
    }


    if (
      statusKey === "Rejected"
    ) {
      return "danger";
    }


    if (
      statusKey === "Cancelled"
    ) {
      return "warning";
    }


    return "neutral";
  }


  // ==========================================================
  // Columns
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


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <ScreenShell
      title={
        t("archive.title")
      }

      description={
        language === "ar"
          ? "الطلبات القديمة لا تظهر في القوائم النشطة، لكنها محفوظة ويمكن الوصول إليها من خلال البحث أو الأرشيف."
          : "Old requests are kept out of active lists but remain available through search and the archive."
      }

      icon="archive"

      stats={[
        {
          label:
            language === "ar"
              ? "إجمالي المؤرشفة"
              : "Archived",

          value:
            archivedTotal
        },

        {
          label:
            language === "ar"
              ? "النتائج الحالية"
              : "Current results",

          value:
            archiveRows.length
        },

        {
          label:
            language === "ar"
              ? "أقدم طلب"
              : "Oldest request",

          value:
            oldestRequest
        }
      ]}
    >

      {/* ================================================ */}
      {/* Search / Filters */}
      {/* ================================================ */}

      <Card>

        <div
          className="archive-info-banner"
        >
          <strong>
            {language === "ar"
              ? "الأرشيف لا يعني الحذف"
              : "Archive does not mean deletion"}
          </strong>

          <span>
            {language === "ar"
              ? "تبقى السجلات محفوظة ويمكن استرجاعها والبحث عنها عند الحاجة."
              : "Records remain preserved and can be found whenever needed."}
          </span>
        </div>


        {error && (
          <div
            className="form-error"
            role="alert"
          >
            {error}
          </div>
        )}


        <FilterBar
          search={
            search
          }

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
              ? "ابحث في الأرشيف برقم الطلب أو الاسم..."
              : "Search archive by request ID or name..."
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
            reset
          }
        />


        <p
          className="table-result-count"
        >
          {loading
            ? (
                language === "ar"
                  ? "جاري تحميل الأرشيف..."
                  : "Loading archive..."
              )
            : (
                language === "ar"
                  ? `عرض ${archiveRows.length} من ${archivedTotal} طلب مؤرشف`
                  : `Showing ${archiveRows.length} of ${archivedTotal} archived requests`
              )}
        </p>

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
            rows
          }

          renderCell={(
            row,
            col
          ) => {

            // حالة الطلب
            if (
              col.key ===
              "status"
            ) {
              return (
                <Badge
                  tone={
                    statusTone(
                      row.statusKey
                    )
                  }
                >
                  {row.status}
                </Badge>
              );
            }


            // زر عرض
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

export default function Archive() {
  return (
    <RequirePermission
      permission={
        PERMISSIONS.ARCHIVE_DOCUMENT
      }
    >
      <Content />
    </RequirePermission>
  );
}