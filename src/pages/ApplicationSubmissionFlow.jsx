import React, { useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_APPLICATION_FORM as initialForm, APPLICATION_STEPS as STEPS } from "../features/applications/form/applicationFormModel";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import SearchableSelect from "../components/ui/SearchableSelect";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import DocumentRequirementsList from "../components/documents/DocumentRequirementsList";
import {
  createMockApplication,
  getStoredApplications,
} from "../features/applications/mockApplicationStore";

import {
  checkQualificationEligibility,
  getEligiblePreviousQualifications,
} from "../features/qualifications/qualificationEligibility";
import {
  createPreviousQualification,
} from "../data/qualifications/previousQualification";
import {
  SECONDARY_SCHOOLS_BY_COUNTRY,
} from "../data/qualifications/schools";
import {
  addStoredPreviousQualification,
  updateStoredPreviousQualification,
} from "../features/qualifications/previousQualificationStore";
import { setWorkflowStage } from "../features/workflow/workflowStore";
import { getApplicantProfile } from "../features/profile/profileStore";
import {
  requiresEquivalencyForCountry,
} from "../data/legalRules/equivalencyRules";
import {
  QUALIFICATION_TYPES,
  getRequirementsForRequest,
  validateDocuments,
} from "../data/documentRequirements";
import { getQualificationOptions } from "../data/qualifications/catalog";
import { getUniversityOptions } from "../data/qualifications/universities";
import { getSecondaryBranchOptions } from "../data/qualifications/secondaryBranches";
import { getSpecializationOptions } from "../data/qualifications/specializations";
import "./ApplicationSubmissionFlow.css";

const STORAGE_KEY = "certificate-equivalency-application-draft";

export default function ApplicationSubmissionFlow() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [pendingRequirement, setPendingRequirement] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
    const [previousQualificationId, setPreviousQualificationId] = useState("");
  const [externalPreviousQualification, setExternalPreviousQualification] =
    useState({
      qualificationType: "",
      qualificationTitle: "",
      specialization: "",
      institution: "",
      country: "",
      graduationDate: "",
      previousQualificationId: null,
    });
  const [externalPreviousQualificationPrerequisite, setExternalPreviousQualificationPrerequisite] =
    useState({
      qualificationType: QUALIFICATION_TYPES.SECONDARY,
      qualificationTitle: "",
      specialization: "",
      institution: "",
      country: "",
      graduationDate: "",
      previousQualificationId: null,
    });
  const fileInputRef = useRef(null);

  const requirements = useMemo(
    () =>
      getRequirementsForRequest({
        qualificationType: form.qualificationType,
        country: form.country,
        caseData: {
          hasInternationalExam:
            form.hasInternationalExam,
        },
      }),
    [
      form.qualificationType,
      form.country,
      form.hasInternationalExam,
    ]
  );
const currentQualificationRequiresEquivalency =
    requiresEquivalencyForCountry(form.country);

  const validation = useMemo(
    () => validateDocuments({ requirements, uploadedDocuments }),
    [requirements, uploadedDocuments]
  );

    const prerequisiteCheck = useMemo(() => {
      if (!user?.id || !form.qualificationType) {
        return null;
      }

      const result = checkQualificationEligibility({
        applications: getStoredApplications(),
        ownerUserId: user.id,
        targetQualificationType:
          form.qualificationType,
        previousQualificationId,
        externalPreviousQualification,
        externalPreviousQualificationPrerequisite,
      });

      console.log(
        "[QUALIFICATION ELIGIBILITY]",
        {
          targetQualificationType:
            form.qualificationType,
          reason: result?.reason,
          allowed: result?.allowed,
          requiredLevel:
            result?.requiredLevel,
          requiredLevels:
            result?.requiredLevels,
          prerequisiteLevels:
            result?.prerequisiteLevels,
          prerequisiteChain:
            result?.prerequisiteChain,
          chain:
            result?.chain,
          missingPrerequisites:
            result?.missingPrerequisites,
          pendingPrerequisites:
            result?.pendingPrerequisites,
          eligiblePreviousQualifications:
            result?.eligiblePreviousQualifications,
        }
      );

      return result;

    }, [user?.id, form.qualificationType]);

  const eligiblePreviousQualifications = useMemo(
      () =>
        getEligiblePreviousQualifications({
          applications: getStoredApplications(),
          ownerUserId: user?.id,
          targetQualificationType: form.qualificationType,
        }),
      [user?.id, form.qualificationType]
    );

    const selectedPreviousQualification = useMemo(
      () =>
        eligiblePreviousQualifications.find(
          (item) => item.id === previousQualificationId
        ) || null,
      [eligiblePreviousQualifications, previousQualificationId]
    );

    useEffect(() => {
      const candidates =
        prerequisiteCheck?.eligiblePreviousQualifications ||
        [];

      setPreviousQualificationId((current) => {
        if (candidates.length === 1) {
          return candidates[0].id;
        }

        if (candidates.length === 0) {
          return "";
        }

        return candidates.some(
          (item) => item.id === current
        )
          ? current
          : "";
      });
    }, [prerequisiteCheck]);
  useEffect(() => {
    const savedDraft = sessionStorage.getItem(STORAGE_KEY);

    if (!savedDraft) {
      return;
    }

    try {
      const payload = JSON.parse(savedDraft);

      if (payload?.status !== "draft" || !payload?.form) {
        return;
      }

      setForm({
        ...initialForm,
        ...payload.form,
      });

      setUploadedDocuments(
        Array.isArray(payload.uploadedDocuments)
          ? payload.uploadedDocuments
          : []
      );

      setPreviousQualificationId(
        typeof payload.previousQualificationId === "string"
          ? payload.previousQualificationId
          : ""
      );

      if (Number.isInteger(payload.step)) {
        setStep(
          Math.min(
            Math.max(payload.step, 0),
            STEPS.length - 1
          )
        );
      }

      setSaved(true);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const profile =
      getApplicantProfile(user.id) || {};

    setForm((current) => ({
      ...current,

      fullName:
        current.fullName ||
        profile.fullName ||
        user.name ||
        user.displayName ||
        "",

      nationalId:
        current.nationalId ||
        profile.nationalId ||
        "",

      identityType:
        current.identityType ||
        profile.identityType ||
        "",

      gender:
        current.gender ||
        profile.gender ||
        "",

      dateOfBirth:
        current.dateOfBirth ||
        profile.dateOfBirth ||
        "",

      nationality:
        current.nationality ||
        profile.nationality ||
        "",

      phone:
        current.phone ||
        profile.phone ||
        "",

      whatsappPrefix:
        current.whatsappPrefix ||
        profile.whatsappPrefix ||
        "",

      whatsapp:
        current.whatsapp ||
        profile.whatsapp ||
        "",

      email:
        current.email ||
        profile.email ||
        user.email ||
        "",

      backupEmail:
        current.backupEmail ||
        profile.backupEmail ||
        "",

      residenceCountry:
        current.residenceCountry ||
        profile.country ||
        "palestine",

      city:
        current.city ||
        profile.city ||
        "",

      address:
        current.address ||
        profile.address ||
        "",

      residence:
        current.residence ||
        [
          profile.country,
          profile.city,
          profile.address,
        ]
          .filter(Boolean)
          .join(" - "),
    }));
  }, [user]);


const certificateOptions = [
    {
      value: QUALIFICATION_TYPES.SECONDARY,
      qualification: QUALIFICATION_TYPES.SECONDARY,
      label:
        language === "ar"
          ? "شهادة الثانوية العامة"
          : "Secondary School Certificate",
    },
    {
      value: QUALIFICATION_TYPES.BACHELOR,
      qualification: QUALIFICATION_TYPES.BACHELOR,
      label:
        language === "ar"
          ? "درجة البكالوريوس"
          : "Bachelor's Degree",
    },
    {
      value: QUALIFICATION_TYPES.MASTER,
      qualification: QUALIFICATION_TYPES.MASTER,
      label:
        language === "ar"
          ? "درجة الماجستير"
          : "Master's Degree",
    },
    {
      value: QUALIFICATION_TYPES.DOCTORATE,
      qualification: QUALIFICATION_TYPES.DOCTORATE,
      label:
        language === "ar"
          ? "درجة الدكتوراه"
          : "Doctorate",
    },
  ];

  const filteredCertificateOptions =
    certificateOptions.filter(
      (option) =>
        !form.qualificationType ||
        option.qualification === form.qualificationType
    );

  const universityOptions = getUniversityOptions(language);

  const secondaryInstitutionOptions = [
    {
      value: "ramallah-secondary",
      label:
        language === "ar"
          ? "مدرسة ثانوية نموذجية - رام الله"
          : "Model Secondary School - Ramallah",
      country: "palestine",
    },
    {
      value: "nablus-secondary",
      label:
        language === "ar"
          ? "مدرسة ثانوية نموذجية - نابلس"
          : "Model Secondary School - Nablus",
      country: "palestine",
    },
    {
      value: "amman-secondary",
      label:
        language === "ar"
          ? "مدرسة ثانوية نموذجية - عمّان"
          : "Model Secondary School - Amman",
      country: "jordan",
    },
    {
      value: "zarqa-secondary",
      label:
        language === "ar"
          ? "مدرسة ثانوية نموذجية - الزرقاء"
          : "Model Secondary School - Zarqa",
      country: "jordan",
    },
    {
      value: "cairo-secondary",
      label:
        language === "ar"
          ? "مدرسة ثانوية نموذجية - القاهرة"
          : "Model Secondary School - Cairo",
      country: "egypt",
    },
  ];
  const secondaryBranchOptions =
    getSecondaryBranchOptions(language);

  const filteredInstitutionOptions = (
    form.qualificationType === QUALIFICATION_TYPES.SECONDARY
      ? secondaryInstitutionOptions
      : universityOptions
  ).filter(
    (institution) =>
      !form.country ||
      institution.country === form.country
  );
  const filteredSpecializationOptions =
    getSpecializationOptions(
      form.institution,
      language
    );
  const countryOptions = [
    { value: "palestine", label: language === "ar" ? "فلسطين" : "Palestine" },
    { value: "jordan", label: language === "ar" ? "الأردن" : "Jordan" },
    { value: "egypt", label: language === "ar" ? "مصر" : "Egypt" },
    { value: "saudi-arabia", label: language === "ar" ? "السعودية" : "Saudi Arabia" },
    { value: "uae", label: language === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates" },
    { value: "turkey", label: language === "ar" ? "تركيا" : "Turkey" },
    { value: "malaysia", label: language === "ar" ? "ماليزيا" : "Malaysia" },
    { value: "other", label: language === "ar" ? "دولة أخرى" : "Other" },
  ];

  const currentYear = new Date().getFullYear();

  const graduationYearOptions = Array.from(
    { length: currentYear - 1970 + 1 },
    (_, index) => {
      const year = currentYear - index;

      return {
        value: String(year),
        label: String(year),
      };
    }
  );
  const qualificationOptions = getQualificationOptions(language);

  const getQualificationLabel = (value) =>
    qualificationOptions.find((item) => item.value === value)?.label || value || "—";

  const getCertificateLabel = (value) =>
    certificateOptions.find((item) => item.value === value)?.label || value || "—";

  const getInstitutionLabel = (value) => {
    const allInstitutionOptions = [
      ...universityOptions,
      ...secondaryInstitutionOptions,
    ];

    return (
      allInstitutionOptions.find((item) => item.value === value)?.label ||
      value ||
      "—"
    );
  };

  const getCountryLabel = (value) =>
    countryOptions.find((item) => item.value === value)?.label || value || "—";

  const getSpecializationLabel = (value) =>
    filteredSpecializationOptions.find((item) => item.value === value)?.label || value || "—";
  const update = (key) => (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const saveDraft = () => {
  const payload = {
    form,
    previousQualificationId,
    uploadedDocuments,
    step,
    savedAt: new Date().toISOString(),
    status: "draft",
  };

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(payload)
  );

  setSaved(true);
};

  const requestUpload = (requirement) => {
    setPendingRequirement(requirement);
    fileInputRef.current?.click();
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !pendingRequirement) return;
    setSaved(false);
    setUploadedDocuments((current) => [
      ...current.filter((item) => item.requirementId !== pendingRequirement.id),
      {
        requirementId: pendingRequirement.id,
        fileName: file.name,
        status: "uploaded",
      },
    ]);
    event.target.value = "";
  };

  const canProvideExternalPreviousQualification =
    prerequisiteCheck?.reason ===
    "MISSING_PREVIOUS_QUALIFICATION";

  const requiresPreviousQualificationForExternalRecord =
    externalPreviousQualification.qualificationType ===
    QUALIFICATION_TYPES.BACHELOR;

  const hasExternalPreviousQualificationPrerequisite =
    !requiresPreviousQualificationForExternalRecord ||
    Boolean(
      externalPreviousQualificationPrerequisite.qualificationType ===
        QUALIFICATION_TYPES.SECONDARY &&
      externalPreviousQualificationPrerequisite.qualificationTitle &&
      externalPreviousQualificationPrerequisite.institution &&
      externalPreviousQualificationPrerequisite.country
    );

  const hasExternalPreviousQualification =
    form.qualificationType !== QUALIFICATION_TYPES.SECONDARY &&
    canProvideExternalPreviousQualification &&
    hasExternalPreviousQualificationPrerequisite &&
    Boolean(
      externalPreviousQualification.qualificationType &&
      externalPreviousQualification.qualificationTitle &&
      externalPreviousQualification.institution &&
      externalPreviousQualification.country
    );
  const isPrerequisiteReviewRequired =
    prerequisiteCheck?.reason ===
      "PREREQUISITE_RULE_PENDING_APPROVAL" ||
    prerequisiteCheck?.reason ===
      "PREREQUISITE_RULE_MANUAL_REVIEW";

  const hasPrerequisiteRequirement =
    Boolean(prerequisiteCheck) &&
    prerequisiteCheck.reason !== "NO_PREREQUISITE" &&
    prerequisiteCheck.reason !==
      "PREREQUISITE_RULE_PENDING_APPROVAL" &&
    prerequisiteCheck.reason !==
      "PREREQUISITE_RULE_MANUAL_REVIEW";

  const validateStep = () => {
    if (step === 0) {
      const baseValid = Boolean(
        form.requestType &&
        form.qualificationType
      );

      if (!baseValid) {
        return false;
      }

      if (
        form.qualificationType ===
        QUALIFICATION_TYPES.SECONDARY
      ) {
        return true;
      }

      if (
        prerequisiteCheck?.reason ===
        "MISSING_PREVIOUS_QUALIFICATION"
      ) {
        return hasExternalPreviousQualification;
      }

      if (
        prerequisiteCheck?.allowed === false
      ) {
        return false;
      }

      const candidates =
        prerequisiteCheck.eligiblePreviousQualifications ||
        [];

      if (candidates.length > 1) {
        return Boolean(previousQualificationId);
      }

      return candidates.length === 1;
    }
    if (step === 1) {
      return Boolean(
        form.fullName &&
        form.nationalId &&
        form.phone &&
        form.email &&
        form.residence
      );
    }
    if (step === 2) {
      const baseValid = Boolean(
        form.certificateName &&
        form.country &&
        form.institution &&
        form.graduationYear
      );

      if (form.qualificationType === QUALIFICATION_TYPES.SECONDARY) {
        return baseValid;
      }

      return Boolean(baseValid && form.specialization);
    }
    if (step === 3) return validation.valid;
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    saveDraft();
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const previous = () => setStep((current) => Math.max(current - 1, 0));

  const submit = () => {
    if (!validateStep()) return;

    const requestId = `REQ-${Date.now()
      .toString()
      .slice(-6)}`;

    const qualificationLabel =
      getQualificationLabel(
        form.qualificationType
      );

    const institutionLabel =
      getInstitutionLabel(form.institution);

    let externalPreviousQualificationId = null;

    if (
      hasExternalPreviousQualification &&
      user?.id
    ) {
      externalPreviousQualificationId =
        `PREV-${Date.now()
          .toString()
          .slice(-8)}`;

      let nestedPreviousQualificationId =
        null;

      if (
        externalPreviousQualification.qualificationType ===
        QUALIFICATION_TYPES.BACHELOR
      ) {
        nestedPreviousQualificationId =
          `PREV-${(
            Date.now() + 1
          )
            .toString()
            .slice(-8)}`;

        addStoredPreviousQualification(
          user.id,
          createPreviousQualification({
            id:
              nestedPreviousQualificationId,
            source:
              "external_record",
            status:
              "pending_verification",
            qualificationType:
              QUALIFICATION_TYPES.SECONDARY,
            qualificationTitle:
              externalPreviousQualificationPrerequisite.qualificationTitle,
            specialization:
              externalPreviousQualificationPrerequisite.specialization,
            institution:
              externalPreviousQualificationPrerequisite.institution,
            country:
              externalPreviousQualificationPrerequisite.country,

            requiresEquivalency:
              requiresEquivalencyForCountry(
                externalPreviousQualificationPrerequisite.country
              ),

            graduationDate:
              externalPreviousQualificationPrerequisite.graduationDate,
            previousQualificationId:
              externalPreviousQualificationPrerequisite.previousQualificationId ||
              null,
            linkedApplicationId:
              requestId,
          })
        );
      }

      addStoredPreviousQualification(
        user.id,
        createPreviousQualification({
          id:
            externalPreviousQualificationId,
          source:
            "external_record",
          status:
            "pending_verification",
          qualificationType:
            externalPreviousQualification.qualificationType,
          qualificationTitle:
            externalPreviousQualification.qualificationTitle,
          specialization:
            externalPreviousQualification.specialization,
          institution:
            externalPreviousQualification.institution,
          country:
            externalPreviousQualification.country,

          requiresEquivalency:
            requiresEquivalencyForCountry(
              externalPreviousQualification.country
            ),

          graduationDate:
            externalPreviousQualification.graduationDate,
          previousQualificationId:
            nestedPreviousQualificationId ||
            externalPreviousQualification.previousQualificationId ||
            null,
          linkedApplicationId:
            requestId,
        })
      );
    }

    /*
     * Existing Bachelor selected from the applicant's
     * records + Secondary entered in the current request.
     */
    if (
      previousQualificationId &&
      user?.id &&
      form.qualificationType ===
        QUALIFICATION_TYPES.MASTER &&
      externalPreviousQualificationPrerequisite?.qualificationType ===
        QUALIFICATION_TYPES.SECONDARY &&
      externalPreviousQualificationPrerequisite?.qualificationTitle &&
      externalPreviousQualificationPrerequisite?.institution &&
      externalPreviousQualificationPrerequisite?.country &&
      externalPreviousQualificationPrerequisite?.graduationDate
    ) {
      const secondaryId =
        `PREV-${(
          Date.now() + 2
        )
          .toString()
          .slice(-8)}`;

      addStoredPreviousQualification(
        user.id,
        createPreviousQualification({
          id:
            secondaryId,
          source:
            "external_record",
          status:
            "pending_verification",
          qualificationType:
            QUALIFICATION_TYPES.SECONDARY,
          qualificationTitle:
            externalPreviousQualificationPrerequisite.qualificationTitle,
          specialization:
            externalPreviousQualificationPrerequisite.specialization,
          institution:
            externalPreviousQualificationPrerequisite.institution,
          country:
            externalPreviousQualificationPrerequisite.country,

            requiresEquivalency:
              requiresEquivalencyForCountry(
                externalPreviousQualificationPrerequisite.country
              ),

          graduationDate:
            externalPreviousQualificationPrerequisite.graduationDate,
          previousQualificationId:
            previousQualificationId,
          linkedApplicationId:
            requestId,
        })
      );
    }
    const newApplication = createMockApplication({
      id: requestId,
      ownerUserId: user?.id || "",
      applicant: form.fullName,
      applicantEn: form.fullName,
      qualification: qualificationLabel,
      qualificationEn: qualificationLabel,
      qualificationKey: form.qualificationType,

      requiresEquivalency:
        currentQualificationRequiresEquivalency,

      previousQualificationId:
        externalPreviousQualificationId ||
        previousQualificationId ||
        null,
      university: institutionLabel,
      universityEn: institutionLabel,
      status: "قيد الدراسة",
      statusEn: "Under review",
      statusKey: "UNDER_REVIEW",
      date: new Date()
        .toISOString()
        .slice(0, 10),
      archived: false,
      form,
      uploadedDocuments,
    });

    setWorkflowStage(
      newApplication.id,
      "PAYMENT"
    );
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        form,
        previousQualificationId:
          externalPreviousQualificationId ||
          previousQualificationId ||
        null,
        uploadedDocuments,
        requestId: newApplication.id,
        status: "submitted",
        submittedAt:
          new Date().toISOString(),
      })
    );

    setSubmitted(true);
  };

  const labels = {
    request: language === "ar" ? "نوع الطلب والمؤهل" : "Request & qualification",
    applicant: language === "ar" ? "بيانات مقدم الطلب" : "Applicant data",
    certificate: language === "ar" ? "بيانات الشهادة" : "Certificate data",
    documents: language === "ar" ? "الوثائق الإلكترونية" : "Electronic documents",
    draft: language === "ar" ? "المسودة الإلكترونية" : "Electronic draft",
    submit: language === "ar" ? "التقديم" : "Submission",
  };

  if (submitted) {
    return (
      <div className="page application-flow">
        <Card className="application-success">
          <div className="application-success__icon"><Icon name="check" size={32} /></div>
          <h1>{language === "ar" ? "تم تقديم الطلب" : "Application submitted"}</h1>
          <p>{language === "ar" ? "تم حفظ الطلب إلكترونيًا. سيتم متابعة مراحله من خلال حسابك." : "Your application has been saved electronically and can be followed from your account."}</p>
          <div className="application-success__notice">
            <strong>{language === "ar" ? "ملاحظة مهمة" : "Important note"}</strong>
            <span>{language === "ar" ? "يتم الدفع قبل تسليم الوثائق الورقية." : "Payment is required before paper documents are delivered."}</span>
          </div>
          <div className="application-flow__actions">
            <Button onClick={() => navigate("/my-applications")}>{t("newApplication.myApplications")}</Button>
            <Button variant="secondary" onClick={() => navigate("/payments")}>{t("newApplication.payment")}</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page application-flow">
      <header className="application-flow__heading">
        <div>
          <div className="application-flow__eyebrow">{language === "ar" ? "طلب جديد" : "New application"}</div>
          <h1>{t("newApplication.title")}</h1>
          <p>{t("newApplication.description")}</p>
        </div>
        <Button variant="secondary" icon={<Icon name="save" size={18} />} onClick={saveDraft}>{t("newApplication.saveDraft")}</Button>
      </header>

      {saved && <div className="application-flow__saved" role="status">{t("newApplication.draftSaved")}</div>}

      <nav className="application-stepper" aria-label={language === "ar" ? "مراحل الطلب" : "Application steps"}>
        {STEPS.map((key, index) => (
          <button key={key} type="button" className={`application-step ${index === step ? "is-active" : ""} ${index < step ? "is-complete" : ""}`} onClick={() => index < step && setStep(index)} disabled={index > step}>
            <span className="application-step__number">{index < step ? "✓" : index + 1}</span>
            <span>{labels[key]}</span>
          </button>
        ))}
      </nav>

      {step === 0 && (
        <Card title={language === "ar" ? "ابدأ الطلب" : "Start the application"}>
          <div className="application-flow__notice">
            <strong>{language === "ar" ? "المسار الحالي هو معادلة الشهادة." : "The current workflow is certificate equivalency."}</strong>
            <span>{language === "ar" ? "التصديق خدمة منفصلة ولا يتم دمجه مع طلب المعادلة." : "Certification is a separate service and is not combined with the equivalency request."}</span>
          </div>
          <div className="application-form-grid">
            <Select label={language === "ar" ? "نوع الطلب" : "Request type"} value={form.requestType} onChange={update("requestType")} options={[{ value: "equivalency", label: language === "ar" ? "معادلة شهادة" : "Certificate equivalency" }]} required />
<Select
              label={
                language === "ar"
                  ? "نوع المؤهل"
                  : "Qualification type"
              }
              value={form.qualificationType}
              onChange={(event) => {
                const nextQualification =
                  event.target.value;

                setSaved(false);
                setUploadedDocuments([]);

                setForm((current) => ({
                  ...current,
                  qualificationType:
                    nextQualification,
                secondaryBranch: "",
                  certificateName: "",
                  institution: "",
                  specialization: "",
                  country: "",
                  graduationYear: "",
                }));
              }}
              options={qualificationOptions}
              placeholder={
                language === "ar"
                  ? "اختر نوع المؤهل"
                  : "Select qualification"
              }
              required
            />
            {form.qualificationType !== QUALIFICATION_TYPES.SECONDARY &&
              prerequisiteCheck &&
              hasPrerequisiteRequirement && (
                <div className="application-prerequisite">
                  <div className="previous-qualification-form-heading">
                    <strong>
                      {language === "ar"
                        ? "المؤهلات السابقة المطلوبة"
                        : "Required previous qualifications"}
                    </strong>

                    <span>
                      {language === "ar"
                        ? "يجب استكمال جميع المؤهلات السابقة المطلوبة لهذا المؤهل قبل متابعة الطلب."
                        : "All required previous qualifications must be completed before continuing."}
                    </span>
                  </div>

                  {(prerequisiteCheck.prerequisiteLevels || []).map(
                    (level, index) => {
                      const candidates =
                        level?.candidates || [];

                      const isBachelor =
                        level?.qualificationType ===
                        QUALIFICATION_TYPES.BACHELOR;

                      const isSecondary =
                        level?.qualificationType ===
                        QUALIFICATION_TYPES.SECONDARY;

                      const levelLabel =
                        getQualificationLabel(
                          level?.qualificationType
                        );

                      const statusLabel =
                        language === "ar"
                          ? level?.status === "verified"
                            ? "تم التحقق"
                            : level?.status ===
                              "multiple_verified"
                              ? "يوجد أكثر من مؤهل صالح"
                              : level?.status ===
                                "pending_verification"
                                ? "قيد التحقق"
                                : "غير موجود"
                          : level?.status === "verified"
                            ? "Verified"
                            : level?.status ===
                              "multiple_verified"
                              ? "Multiple valid qualifications"
                              : level?.status ===
                                "pending_verification"
                                ? "Pending verification"
                                : "Missing";

                      return (
                        <div
                          key={`${level.qualificationType}-${index}`}
                          className="previous-qualification-section"
                        >
                          <div className="previous-qualification-form-heading">
                            <strong>
                              {index + 1}. {levelLabel}
                            </strong>

                            <span>
                              {statusLabel}
                            </span>
                          </div>

                          {candidates.length > 0 && (
                            <div className="previous-qualification-cards">
                              {candidates.map((item) => {
                                const isSelected =
                                  isBachelor &&
                                  previousQualificationId ===
                                    item.id;

                                const countryLabel =
                                  countryOptions.find(
                                    (option) =>
                                      option.value ===
                                      item.country
                                  )?.label ||
                                  item.country ||
                                  "—";

                                const qualificationTitle =
                                  language === "ar"
                                    ? item.qualificationTitle ||
                                      item.qualification ||
                                      levelLabel
                                    : item.qualificationEn ||
                                      item.qualification ||
                                      item.qualificationTitle ||
                                      levelLabel;

                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={`previous-qualification-card${
                                      isSelected
                                        ? " is-selected"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (isBachelor) {
                                        setPreviousQualificationId(
                                          item.id
                                        );
                                      }
                                    }}
                                    aria-pressed={
                                      isSelected
                                    }
                                  >
                                    <div className="previous-qualification-card__header">
                                      <strong>
                                        {qualificationTitle}
                                      </strong>

                                      <span
                                        className="previous-qualification-card__radio"
                                        aria-hidden="true"
                                      >
                                        {isSelected
                                          ? "●"
                                          : "○"}
                                      </span>
                                    </div>

                                    <div className="previous-qualification-card__details">
                                      <div>
                                        <span>
                                          {language === "ar"
                                            ? "التخصص"
                                            : "Specialization"}
                                        </span>
                                        <strong>
                                          {item.specialization ||
                                            "—"}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          {language === "ar"
                                            ? "الجامعة / المؤسسة"
                                            : "University / Institution"}
                                        </span>
                                        <strong>
                                          {item.university ||
                                            item.institution ||
                                            "—"}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          {language === "ar"
                                            ? "الدولة"
                                            : "Country"}
                                        </span>
                                        <strong>
                                          {countryLabel}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          {language === "ar"
                                            ? "تاريخ التخرج"
                                            : "Graduation date"}
                                        </span>
                                        <strong>
                                          {item.graduationDate ||
                                            "—"}
                                        </strong>
                                      </div>

                                      <div>
                                        <span>
                                          {language === "ar"
                                            ? "الحالة"
                                            : "Status"}
                                        </span>
                                        <strong>
                                          {statusLabel}
                                        </strong>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {candidates.length === 0 && (
                            <div className="application-flow__notice">
                              <strong>
                                {language === "ar"
                                  ? `لا يوجد مؤهل صالح من نوع ${levelLabel}`
                                  : `No valid ${levelLabel.toLowerCase()} was found`}
                              </strong>

                              <span>
                                {language === "ar"
                                  ? "أدخل بيانات هذا المؤهل ليتم التحقق منه قبل استخدامه في الطلب."
                                  : "Enter this qualification's details so it can be verified before it is used in the application."}
                              </span>
                            </div>
                          )}

                          {isSecondary &&
                            level?.status ===
                              "missing" && (
                              <div className="application-form-grid">
                                <Input
                                  label={
                                    language === "ar"
                                      ? "اسم مؤهل الثانوية"
                                      : "Secondary qualification title"
                                  }
                                  value={
                                    externalPreviousQualificationPrerequisite.qualificationTitle
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualificationPrerequisite(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.SECONDARY,
                                        qualificationTitle:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  required
                                />

                                <SearchableSelect
                                  label={
                                    language === "ar"
                                      ? "اسم المدرسة / المؤسسة"
                                      : "School / Institution"
                                  }
                                  value={
                                    externalPreviousQualificationPrerequisite.institution
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualificationPrerequisite(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.SECONDARY,
                                        institution:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  options={(
                                    SECONDARY_SCHOOLS_BY_COUNTRY[
                                      externalPreviousQualificationPrerequisite.country
                                    ] || []
                                  ).map((school) => ({
                                    value: school.value,
                                    label:
                                      language === "ar"
                                        ? school.labelAr
                                        : school.labelEn,
                                  }))}
                                  placeholder={
                                    language === "ar"
                                      ? externalPreviousQualificationPrerequisite.country
                                        ? "اختر المدرسة"
                                        : "اختر الدولة أولًا"
                                      : externalPreviousQualificationPrerequisite.country
                                        ? "Select school"
                                        : "Select country first"
                                  }
                                  required
                                />

                                <Select
                                  label={
                                    language === "ar"
                                      ? "دولة الثانوية"
                                      : "Secondary qualification country"
                                  }
                                  value={
                                    externalPreviousQualificationPrerequisite.country
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualificationPrerequisite(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.SECONDARY,
                                        country:
                                          event.target.value,
                                        institution: "",
                                      })
                                    )
                                  }
                                  options={countryOptions}
                                  placeholder={
                                    language === "ar"
                                      ? "اختر الدولة"
                                      : "Select country"
                                  }
                                  required
                                />

                                <Input
                                  label={
                                    language === "ar"
                                      ? "تاريخ التخرج"
                                      : "Graduation date"
                                  }
                                  type="date"
                                  value={
                                    externalPreviousQualificationPrerequisite.graduationDate
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualificationPrerequisite(
                                      (current) => ({
                                        ...current,
                                        graduationDate:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  required
                                />
                              </div>
                            )}

                          {isBachelor &&
                            candidates.length === 0 && (
                              <div className="application-form-grid">
                                <Input
                                  label={
                                    language === "ar"
                                      ? "اسم مؤهل البكالوريوس"
                                      : "Bachelor qualification title"
                                  }
                                  value={
                                    externalPreviousQualification.qualificationTitle
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualification(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.BACHELOR,
                                        qualificationTitle:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  required
                                />

                                <Select
                                  label={
                                    language === "ar"
                                      ? "التخصص"
                                      : "Specialization"
                                  }
                                  value={
                                    externalPreviousQualification.specialization
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualification(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.BACHELOR,
                                        specialization:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  options={getSpecializationOptions(
                                    externalPreviousQualification.institution,
                                    language
                                  )}
                                  placeholder={
                                    language === "ar"
                                      ? "اختر التخصص"
                                      : "Select specialization"
                                  }
                                  required
                                />

                                <Select
                                  label={
                                    language === "ar"
                                      ? "دولة المؤسسة"
                                      : "Institution country"
                                  }
                                  value={
                                    externalPreviousQualification.country
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualification(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.BACHELOR,
                                        country:
                                          event.target.value,
                                        institution: "",
                                      })
                                    )
                                  }
                                  options={countryOptions}
                                  placeholder={
                                    language === "ar"
                                      ? "اختر الدولة"
                                      : "Select country"
                                  }
                                  required
                                />

                                <SearchableSelect
                                  label={
                                    language === "ar"
                                      ? "الجامعة / المؤسسة التعليمية"
                                      : "University / Educational institution"
                                  }
                                  value={
                                    externalPreviousQualification.institution
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualification(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.BACHELOR,
                                        institution:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  options={universityOptions
                                    .filter(
                                      (institution) =>
                                        !externalPreviousQualification
                                          .country ||
                                        institution.country ===
                                          externalPreviousQualification
                                            .country
                                    )
                                    .map((institution) => ({
                                      value:
                                        institution.value,
                                      label:
                                        institution.label,
                                    }))}
                                  placeholder={
                                    language === "ar"
                                      ? "اختر الدولة أولًا ثم الجامعة"
                                      : "Select country first, then university"
                                  }
                                  required
                                />

                                <Input
                                  label={
                                    language === "ar"
                                      ? "تاريخ التخرج"
                                      : "Graduation date"
                                  }
                                  type="date"
                                  value={
                                    externalPreviousQualification.graduationDate
                                  }
                                  onChange={(event) =>
                                    setExternalPreviousQualification(
                                      (current) => ({
                                        ...current,
                                        qualificationType:
                                          QUALIFICATION_TYPES.BACHELOR,
                                        graduationDate:
                                          event.target.value,
                                      })
                                    )
                                  }
                                />
                              </div>
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        </Card>
      )}
      {step === 1 && (
        <Card title={language === "ar" ? "بيانات مقدم الطلب" : "Applicant data"}>
          <div className="application-form-grid">
            <Input label={t("newApplication.fullName")} value={form.fullName} onChange={update("fullName")} required />
            <Input label={language === "ar" ? "رقم الهوية" : "National ID"} value={form.nationalId} onChange={update("nationalId")} required />
            <Input label={t("newApplication.phone")} value={form.phone} onChange={update("phone")} required />
            <Input label={t("auth.email")} type="email" value={form.email} onChange={update("email")} required />
            <Input label={t("newApplication.residence")} value={form.residence} onChange={update("residence")} required />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card
          title={
            language === "ar"
              ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                ? "بيانات شهادة الثانوية العامة"
                : "بيانات الشهادة والجامعة"
              : form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                ? "Secondary School Certificate Data"
                : "Certificate and Institution Data"
          }
        >
          <div className="application-form-grid">

            <Select
              label={
                language === "ar"
                  ? "اسم الشهادة"
                  : "Certificate name"
              }
              value={form.certificateName}
              onChange={update("certificateName")}
              options={filteredCertificateOptions}
              placeholder={
                language === "ar"
                  ? "اختر اسم الشهادة"
                  : "Select certificate name"
              }
              required
            />

            <Select
              label={
                language === "ar"
                  ? "الدولة"
                  : "Country"
              }
              value={form.country}
              onChange={(event) => {
                const nextCountry =
                  event.target.value;

                setSaved(false);

                setForm((current) => ({
                  ...current,
                  country: nextCountry,
                  institution: "",
                }));
              }}
              options={countryOptions}
              placeholder={
                language === "ar"
                  ? "اختر الدولة"
                  : "Select country"
              }
              required
            />

            <SearchableSelect
              label={
                language === "ar"
                  ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "المدرسة / المؤسسة التعليمية"
                    : "الجامعة / المؤسسة التعليمية"
                  : form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "School / Educational Institution"
                    : "University / Educational Institution"
              }
              value={form.institution}
onChange={(event) => {
                setSaved(false);

                setForm((current) => ({
                  ...current,
                  institution: event.target.value,
                  specialization: "",
                }));
              }}
              options={filteredInstitutionOptions}
              disabled={!form.country}
              placeholder={
                language === "ar"
                  ? form.country
                    ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                      ? "اختر المدرسة أو ابحث عنها"
                      : "اختر الجامعة أو ابحث عنها"
                    : "اختر الدولة أولًا"
                  : form.country
                    ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                      ? "Select or search for a school"
                      : "Select or search for a university"
                    : "Select a country first"
              }
              searchPlaceholder={
                language === "ar"
                  ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "اكتب اسم المدرسة..."
                    : "اكتب اسم الجامعة..."
                  : form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "Type school name..."
                    : "Type university name..."
              }
              required
            />

            {form.qualificationType === QUALIFICATION_TYPES.SECONDARY && (
              <Select
                label={
                  language === "ar"
                    ? "فرع الثانوية"
                    : "Secondary branch"
                }
                value={form.secondaryBranch}
                onChange={(event) => {
                  setSaved(false);

                  setForm((current) => ({
                    ...current,
                    secondaryBranch:
                      event.target.value,
                  }));
                }}
                options={secondaryBranchOptions}
                placeholder={
                  language === "ar"
                    ? "اختر فرع الثانوية"
                    : "Select secondary branch"
                }
                required
              />
            )}

            {form.qualificationType !== QUALIFICATION_TYPES.SECONDARY && (
              <SearchableSelect
                label={
                  language === "ar"
                    ? "التخصص"
                    : "Specialization"
                }
                value={form.specialization}
                onChange={update("specialization")}
options={filteredSpecializationOptions}
                disabled={!form.institution}
                placeholder={
                  language === "ar"
                    ? form.institution
                      ? "اختر التخصص أو ابحث عنه"
                      : "اختر الجامعة أولًا"
                    : form.institution
                      ? "Select or search for a specialization"
                      : "Select a university first"
                }
                searchPlaceholder={
                  language === "ar"
                    ? "اكتب اسم التخصص..."
                    : "Type specialization..."
                }
                required
              />
            )}

            <Select
              label={
                language === "ar"
                  ? "سنة التخرج"
                  : "Graduation year"
              }
              value={form.graduationYear}
              onChange={update("graduationYear")}
              options={graduationYearOptions}
              placeholder={
                language === "ar"
                  ? "اختر سنة التخرج"
                  : "Select graduation year"
              }
              required
            />

          </div>

          <div className="application-form-single">
            <Textarea
              label={
                language === "ar"
                  ? "ملاحظات إضافية"
                  : "Additional notes"
              }
              value={form.notes}
              onChange={update("notes")}
              rows={4}
            />
          </div>
        </Card>
      )}
      {step === 3 && (
        <>
          <div className="application-flow__notice">
            <strong>{language === "ar" ? "قائمة الوثائق تعتمد على نوع المؤهل." : "The document list depends on the qualification type."}</strong>
            <span>{language === "ar" ? "لا تظهر وثائق ثابتة لكل الطلبات؛ يتم تحديد المتطلبات حسب الطلب والحالة." : "Requirements are determined by the request and case rather than using one fixed list for every application."}</span>
          </div>
          <DocumentRequirementsList
            qualificationType={form.qualificationType}
            country={form.country}
            caseData={{
              hasInternationalExam:
                form.hasInternationalExam,
            }}
            uploadedDocuments={uploadedDocuments}
            onUpload={requestUpload}
/>
          <input ref={fileInputRef} type="file" hidden accept="application/pdf,.pdf" onChange={handleFile} />
          <div className="application-flow__validation">
            <Badge tone={validation.valid ? "success" : "warning"}>{validation.valid ? t("newApplication.documentsComplete") : `${validation.missing.length} ${t("newApplication.documentsMissing")}`}</Badge>
          </div>
        </>
      )}

      {step === 4 && (
        <Card title={language === "ar" ? "المسودة الأولية الإلكترونية" : "Electronic initial draft"}>
          <div className="application-draft">
            <div className="application-draft__header">
              <div>
                <h2>{getCertificateLabel(form.certificateName)}</h2>
                <p>
  {getInstitutionLabel(form.institution)}{" "}
  {"\u2014"}{" "}
  {getCountryLabel(form.country)}
</p>
              </div>
              <Badge tone="neutral">{language === "ar" ? "مسودة إلكترونية" : "Electronic draft"}</Badge>
            </div>
            <div className="application-draft__grid">
              <div><span>{language === "ar" ? "مقدم الطلب" : "Applicant"}</span><strong>{form.fullName || "—"}</strong></div>
              <div>
                <span>
                  {language === "ar" ? "نوع المؤهل" : "Qualification"}
                </span>
                <strong>{getQualificationLabel(form.qualificationType)}</strong>
              </div>
{form.qualificationType !== QUALIFICATION_TYPES.SECONDARY && (
                <div>
                  <span>
                    {language === "ar" ? "التخصص" : "Specialization"}
                  </span>
                  <strong>{getSpecializationLabel(form.specialization)}</strong>
                </div>
              )}
              <div><span>{language === "ar" ? "سنة التخرج" : "Graduation year"}</span><strong>{form.graduationYear || "—"}</strong></div>
              <div><span>{language === "ar" ? "الوثائق" : "Documents"}</span><strong>{validation.uploadedCount}/{validation.requiredCount}</strong></div>
            </div>
            <div className="application-flow__notice">
              <strong>{language === "ar" ? "هذه المسودة للمراجعة فقط." : "This draft is for review only."}</strong>
              <span>{language === "ar" ? "يتمكن مقدم الطلب من تدقيق البيانات إلكترونيًا وإبداء الملاحظات، ولا يتم طباعة المسودة ورقيًا." : "The applicant reviews the data electronically and can raise comments; the draft is not printed on paper."}</span>
            </div>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card title={language === "ar" ? "مراجعة وتقديم الطلب" : "Review and submit"}>
          <div className="application-review-list">
            <div>
              <span>
                {language === "ar" ? "نوع الطلب" : "Request type"}
              </span>
              <strong>
                {language === "ar"
                  ? "معادلة شهادة"
                  : "Certificate equivalency"}
              </strong>
            </div>

            <div>
              <span>
                {language === "ar" ? "المؤهل" : "Qualification"}
              </span>
              <strong>
                {getQualificationLabel(form.qualificationType)}
              </strong>
            </div>

            <div>
              <span>
                {language === "ar" ? "اسم الشهادة" : "Certificate name"}
              </span>
              <strong>
                {getCertificateLabel(form.certificateName)}
              </strong>
            </div>

            <div>
              <span>
                {language === "ar" ? "الدولة" : "Country"}
              </span>
              <strong>
                {getCountryLabel(form.country)}
              </strong>
            </div>

            <div>
              <span>
                {language === "ar"
                  ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "المدرسة / المؤسسة التعليمية"
                    : "الجامعة / المؤسسة التعليمية"
                  : form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                    ? "School / Educational Institution"
                    : "University / Educational Institution"}
              </span>
              <strong>
                {getInstitutionLabel(form.institution)}
              </strong>
            </div>

            {form.qualificationType === QUALIFICATION_TYPES.SECONDARY && (
  <div>
    <span>
      {language === "ar"
        ? "فرع الثانوية"
        : "Secondary branch"}
    </span>
    <strong>
      {secondaryBranchOptions.find(
        (option) =>
          option.value === form.secondaryBranch
      )?.label || "—"}
    </strong>
  </div>
)}
            {form.qualificationType === QUALIFICATION_TYPES.SECONDARY && (
              <Select
                label={
                  language === "ar"
                    ? "هل لديك اختبار ثانوي دولي؟"
                    : "Do you have an international secondary exam?"
                }
                value={
                  form.hasInternationalExam
                    ? "yes"
                    : "no"
                }
                onChange={(event) => {
                  setSaved(false);

                  setForm((current) => ({
                    ...current,
                    hasInternationalExam:
                      event.target.value === "yes",
                  }));
                }}
                options={[
                  {
                    value: "no",
                    label:
                      language === "ar"
                        ? "لا"
                        : "No",
                  },
                  {
                    value: "yes",
                    label:
                      language === "ar"
                        ? "نعم"
                        : "Yes",
                  },
                ]}
                required
              />
            )}
            {form.qualificationType !== QUALIFICATION_TYPES.SECONDARY && (
              <div>
                <span>
                  {language === "ar"
                    ? "التخصص"
                    : "Specialization"}
                </span>
                <strong>
                  {getSpecializationLabel(form.specialization)}
                </strong>
              </div>
            )}

            <div>
              <span>
                {language === "ar"
                  ? "سنة التخرج"
                  : "Graduation year"}
              </span>
              <strong>
                {form.graduationYear || "—"}
              </strong>
            </div>

            <div>
              <span>
                {language === "ar"
                  ? "الوثائق الإلزامية"
                  : "Required documents"}
              </span>
              <strong>
                {validation.uploadedCount}/{validation.requiredCount}
              </strong>
            </div>
          </div>
          <div className="application-flow__notice">
            <strong>{language === "ar" ? "قبل تسليم الوثائق الورقية" : "Before paper document delivery"}</strong>
            <span>{language === "ar" ? "يجب تأكيد دفع الرسوم قبل تسليم الوثائق الورقية، بينما تبقى المسودة الأولية إلكترونية للمراجعة." : "Payment must be confirmed before paper documents are delivered, while the initial draft remains electronic for review."}</span>
          </div>
        </Card>
      )}

      <footer className="application-flow__footer">
        <Button variant="secondary" onClick={step === 0 ? () => navigate("/my-applications") : previous}>{step === 0 ? t("common.cancel") : t("common.previous")}</Button>
        <div className="application-flow__footer-right">
          <Button variant="ghost" onClick={saveDraft}>{t("newApplication.saveDraft")}</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!validateStep()}>{t("common.next")}</Button>
          ) : (
            <Button onClick={submit} disabled={!validateStep()} icon={<Icon name="check" size={18} />}>{t("newApplication.submitApplication")}</Button>
          )}
        </div>
      </footer>
    </div>
  );
}


