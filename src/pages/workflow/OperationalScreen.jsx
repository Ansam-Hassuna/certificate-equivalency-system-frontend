import React, { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import ScreenShell from "./ScreenShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import FilterBar from "../../components/ui/FilterBar";
import { getLocalizedRequestRows } from "./data";
import {
  REQUEST_STATUS_KEYS,
  QUALIFICATION_KEYS,
  requestMatchesFilters,
} from "../../utils/requestFilters";

export default function OperationalScreen({
  title,
  description,
  icon = "document",
  columns,
  actionLabel,
  children,
  stats,
}) {
  const { t, language } = useLanguage();

  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");
  const [filters, setFilters] = useState({
    status: "all",
    qualification: "all",
    from: "",
    to: "",
  });

  const rows = useMemo(
    () => getLocalizedRequestRows(language),
    [language]
  );

  const active = rows.filter((row) => !row.archived);
  const archived = rows.filter((row) => row.archived);

  const source =
    view === "archive"
      ? archived
      : search.trim()
        ? [...active, ...archived]
        : active;

  const visible = source.filter((row) =>
    requestMatchesFilters(row, {
      ...filters,
      search,
    })
  );

  const setFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const reset = () => {
    setFilters({
      status: "all",
      qualification: "all",
      from: "",
      to: "",
    });
    setSearch("");
  };

  const defaultColumns =
    columns || [
      {
        key: "id",
        label: t("dashboard.requestId"),
      },
      {
        key: "applicant",
        label: t("dashboard.applicant"),
      },
      {
        key: "qualification",
        label: t("dashboard.qualification"),
      },
      {
        key: "status",
        label: t("common.status"),
      },
      {
        key: "date",
        label: t("dashboard.date"),
      },
      {
        key: "action",
        label: t("common.actions"),
      },
    ];

  const statusOptions = REQUEST_STATUS_KEYS.map((item) => ({
    value: item.value,
    label: language === "ar" ? item.ar : item.en,
  }));

  const qualificationOptions = QUALIFICATION_KEYS.map((item) => ({
    value: item.value,
    label: language === "ar" ? item.ar : item.en,
  }));

  const tone = (row) => {
    if (row.statusKey === "COMPLETED") return "success";

    if (
      row.statusKey === "AWAITING_INQUIRY" ||
      row.statusKey === "DRAFT_REVIEW"
    ) {
      return "warning";
    }

    return "neutral";
  };

  return (
    <ScreenShell
      title={title}
      description={description}
      icon={icon}
      stats={stats}
    >
      <Card>{children}</Card>

      <Card>
        <div className="request-list-tabs" role="tablist">
          <button
            type="button"
            className={
              view === "active"
                ? "request-list-tab active"
                : "request-list-tab"
            }
            onClick={() => setView("active")}
          >
            {language === "ar" ? "النشطة" : "Active"}
            <span>{active.length}</span>
          </button>

          <button
            type="button"
            className={
              view === "archive"
                ? "request-list-tab active"
                : "request-list-tab"
            }
            onClick={() => setView("archive")}
          >
            {language === "ar" ? "الأرشيف" : "Archive"}
            <span>{archived.length}</span>
          </button>
        </div>

        <FilterBar
          search={search}
          onSearch={(value) =>
            setSearch(String(value ?? ""))
          }
          searchPlaceholder={
            language === "ar"
              ? "ابحث في السجلات..."
              : "Search records..."
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
                : "Active filters",
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
              onChange: (value) =>
                setFilter("status", value),
              options: statusOptions,
            },
            {
              key: "qualification",
              label:
                language === "ar"
                  ? "المؤهل"
                  : "Qualification",
              value: filters.qualification,
              defaultValue: "all",
              onChange: (value) =>
                setFilter("qualification", value),
              options: qualificationOptions,
            },
            {
              key: "from",
              label:
                language === "ar"
                  ? "من تاريخ"
                  : "From date",
              value: filters.from,
              defaultValue: "",
              onChange: (value) =>
                setFilter("from", value),
              type: "date",
            },
            {
              key: "to",
              label:
                language === "ar"
                  ? "إلى تاريخ"
                  : "To date",
              value: filters.to,
              defaultValue: "",
              onChange: (value) =>
                setFilter("to", value),
              type: "date",
            },
          ]}
          onReset={reset}
        />

        <p className="table-result-count">
          {language === "ar"
            ? `عرض ${visible.length} سجل`
            : `Showing ${visible.length} records`}
        </p>

        <Table
          columns={defaultColumns}
          rows={visible}
          renderCell={(row, col) =>
            col.key === "status" ? (
              <Badge tone={tone(row)}>
                {row.status}
              </Badge>
            ) : col.key === "action" ? (
              <Button variant="ghost" size="sm">
                {actionLabel || t("common.view")} →
              </Button>
            ) : (
              row[col.key]
            )
          }
        />
      </Card>
    </ScreenShell>
  );
}
