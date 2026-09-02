import React, { useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import OperationalScreen from "./workflow/OperationalScreen";
import DocumentRequirementsList from "../components/documents/DocumentRequirementsList";
import { QUALIFICATION_TYPES, getRequirementsForRequest } from "../data/documentRequirements";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";

function Content() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const initialQualification = location.state?.qualificationType || "";
  const [qualificationType, setQualificationType] = useState(initialQualification);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const fileInputRef = useRef(null);
  const [pendingRequirement, setPendingRequirement] = useState(null);

  const requirements = useMemo(() => getRequirementsForRequest({ qualificationType }), [qualificationType]);

  const qualificationOptions = [
    { value: QUALIFICATION_TYPES.SECONDARY, label: language === "ar" ? "الثانوية العامة" : "Secondary" },
    { value: QUALIFICATION_TYPES.BACHELOR, label: t("degrees.bachelor") },
    { value: QUALIFICATION_TYPES.MASTER, label: t("degrees.master") },
    { value: QUALIFICATION_TYPES.DOCTORATE, label: t("degrees.phd") },
  ];

  function requestUpload(requirement) {
    setPendingRequirement(requirement);
    fileInputRef.current?.click();
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file || !pendingRequirement) return;

    setUploadedDocuments((current) => [
      ...current.filter((document) => document.requirementId !== pendingRequirement.id),
      { requirementId: pendingRequirement.id, fileName: file.name, status: "uploaded" },
    ]);

    event.target.value = "";
  }

  return (
    <OperationalScreen
      title={t("documents.title")}
      description={t("documents.description")}
      icon="document"
      actionLabel={t("documents.upload")}
      stats={[
        { label: t("documents.stats.required"), value: requirements.filter((r) => r.required).length },
        { label: t("documents.stats.uploaded"), value: uploadedDocuments.length },
        { label: t("documents.stats.missing"), value: Math.max(requirements.filter((r) => r.required).length - uploadedDocuments.filter((d) => requirements.some((r) => r.required && r.id === d.requirementId)).length, 0) },
        { label: t("documents.stats.review"), value: uploadedDocuments.filter((d) => d.status === "under_review").length },
      ]}
    >
      <input ref={fileInputRef} type="file" hidden onChange={handleFile} />

      <Card title={language === "ar" ? "نوع المؤهل" : "Qualification Type"}>
        <Select label={language === "ar" ? "اختر نوع المؤهل" : "Select qualification type"} options={qualificationOptions} value={qualificationType} onChange={(event) => { setQualificationType(event.target.value); setUploadedDocuments([]); }} />
      </Card>

      <div style={{ marginTop: "1rem" }}>
        <DocumentRequirementsList qualificationType={qualificationType} uploadedDocuments={uploadedDocuments} onUpload={requestUpload} />
      </div>

      {uploadedDocuments.length > 0 && (
        <div className="workflow-note" style={{ marginTop: "1rem" }}>
          {language === "ar" ? "تم ربط الملفات المرفوعة بالمتطلبات المحددة لهذا الطلب." : "Uploaded files are linked to the requirements selected for this request."}
        </div>
      )}
    </OperationalScreen>
  );
}

export default function Documents() {
  return <RequirePermission permission={PERMISSIONS.DOCUMENT_UPLOAD_OWN}><Content /></RequirePermission>;
}



