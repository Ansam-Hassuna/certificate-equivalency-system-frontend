import React, {
  useEffect,
  useState
} from "react";

import {
  useLanguage
} from "../context/LanguageContext";

import {
  PERMISSIONS
} from "../auth/permissions";

import {
  RequirePermission
} from "../auth/guards";

import OperationalScreen from "./workflow/OperationalScreen";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:5001";


// ============================================================
// Helpers
// ============================================================

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


// ============================================================
// Content
// ============================================================

function Content() {
  const {
    t,
    language
  } = useLanguage();


  const [
    printingData,
    setPrintingData
  ] = useState({
    total: 0,
    drafts: 0,
    awaitingApplicant: 0,
    approved: 0,
    final: 0,
    applications: []
  });


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  // ==========================================================
  // Load Printing Data
  // ==========================================================

  useEffect(() => {
    const loadPrintingData =
      async () => {
        try {
          setLoading(true);
          setError("");


          const token =
            getAuthToken();


          const response =
            await fetch(
              `${API_BASE_URL}/api/Admin/printing`,
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
              `Printing request failed: ${response.status}`
            );
          }


          const data =
            await response.json();


          setPrintingData({
            total:
              data.total ?? 0,

            drafts:
              data.drafts ?? 0,

            awaitingApplicant:
              data.awaitingApplicant ?? 0,

            approved:
              data.approved ?? 0,

            final:
              data.final ?? 0,

            applications:
              Array.isArray(
                data.applications
              )
                ? data.applications
                : []
          });

        } catch (err) {
          console.error(
            "Printing API error:",
            err
          );


          setError(
            language === "ar"
              ? "حدث خطأ أثناء تحميل بيانات الطباعة."
              : "Failed to load printing data."
          );

        } finally {
          setLoading(false);
        }
      };


    loadPrintingData();

  }, [language]);


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <OperationalScreen
      title={
        t("printing.title")
      }

      description={
        t("printing.description")
      }

      icon="print"

      actionLabel={
        t("printing.openDraft")
      }

      stats={[
        {
          label:
            t(
              "printing.stats.drafts"
            ),

          value:
            printingData.drafts
        },

        {
          label:
            t(
              "printing.stats.awaitingApplicant"
            ),

          value:
            printingData.awaitingApplicant
        },

        {
          label:
            t(
              "printing.stats.approved"
            ),

          value:
            printingData.approved
        },

        {
          label:
            t(
              "printing.stats.final"
            ),

          value:
            printingData.final
        }
      ]}
    >

      {loading && (
        <div className="workflow-note">
          {language === "ar"
            ? "جاري تحميل بيانات الطباعة..."
            : "Loading printing data..."}
        </div>
      )}


      {error && (
        <div className="workflow-note">
          {error}
        </div>
      )}


      {!loading &&
        !error && (
          <div className="workflow-note">
            {t("printing.note")}
          </div>
        )}

    </OperationalScreen>
  );
}


// ============================================================
// Page
// ============================================================

export default function Printing() {
  return (
    <RequirePermission
      permission={
        PERMISSIONS.PRINT_DRAFT
      }
    >
      <Content />
    </RequirePermission>
  );
}