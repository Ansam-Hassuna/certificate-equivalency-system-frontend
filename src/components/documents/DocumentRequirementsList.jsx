import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useDocumentRequirements } from "../../hooks/useDocumentRequirements";
import "./DocumentRequirementsList.css";

export default function DocumentRequirementsList({
  qualificationType,
  caseData = {},
  uploadedDocuments = [],
  onUpload,
}) {
  const { language } = useLanguage();

  const {
    requirements,
    missing,
    requiredCount,
    uploadedCount,
  } = useDocumentRequirements({
    qualificationType,
    caseData,
    uploadedDocuments,
  });

  const uploadedIds = new Set(
    uploadedDocuments
      .filter(
        (document) =>
          document && document.status !== "rejected"
      )
      .map((document) => document.requirementId)
  );

  const percentage = requiredCount
    ? Math.round((uploadedCount / requiredCount) * 100)
    : 0;

  if (!qualificationType) {
    return (
      <section className="document-requirements">
        {language === "ar"
          ? "اختر نوع المؤهل لعرض الوثائق المطلوبة."
          : "Select a qualification type to view the required documents."}
      </section>
    );
  }

  return (
    <section className="document-requirements">
      <header className="document-requirements__header">
        <div>
          <h2>
            {language === "ar"
              ? "الوثائق المطلوبة"
              : "Required Documents"}
          </h2>

          <p>
            {language === "ar"
              ? "تتغير القائمة حسب نوع المؤهل والحالة."
              : "The list changes according to qualification type and case."}
          </p>
        </div>

        <strong>
          {uploadedCount}/{requiredCount}
        </strong>
      </header>

      <div className="document-requirements__progress">
        <span style={{ width: `${percentage}%` }} />
      </div>

      <div className="document-requirements__list">
        {requirements.map((requirement) => {
          const uploaded = uploadedIds.has(requirement.id);

          return (
            <article
              key={requirement.id}
              className={`document-requirement ${
                uploaded
                  ? "document-requirement--uploaded"
                  : "document-requirement--missing"
              }`}
            >
              <div
                className="document-requirement__icon"
                aria-hidden="true"
              >
                {uploaded ? "✓" : "○"}
              </div>

              <div className="document-requirement__content">
                <h3>
                  {language === "ar"
                    ? requirement.labelAr
                    : requirement.labelEn}
                </h3>

                <span>
                  {requirement.required
                    ? language === "ar"
                      ? "إلزامية"
                      : "Required"
                    : language === "ar"
                      ? "حسب الحالة"
                      : "Conditional"}
                </span>
              </div>

              <div className="document-requirement__actions">
                <span className="document-requirement__status">
                  {uploaded
                    ? language === "ar"
                      ? "مرفوعة"
                      : "Uploaded"
                    : language === "ar"
                      ? "غير مرفوعة"
                      : "Missing"}
                </span>

                {!uploaded && onUpload && (
                  <button
                    type="button"
                    className="document-requirement__upload"
                    onClick={() => onUpload(requirement)}
                  >
                    {language === "ar"
                      ? "رفع"
                      : "Upload"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {missing.length > 0 && (
        <p className="document-requirements__warning">
          {language === "ar"
            ? `تبقى ${missing.length} وثيقة إلزامية غير مرفوعة.`
            : `${missing.length} required document(s) are still missing.`}
        </p>
      )}
    </section>
  );
}
