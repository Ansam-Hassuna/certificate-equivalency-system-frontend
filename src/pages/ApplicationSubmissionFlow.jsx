import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  INITIAL_APPLICATION_FORM as initialForm,
  APPLICATION_STEPS as STEPS,
} from "../features/applications/form/applicationFormModel";
import { useApplicationForm } from "../features/applications/form/useApplicationForm";
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


import {
  createApplicationDraft,
  completeApplicationStep2,
  completeApplicationStep3,
  getRequiredDocuments,
  uploadApplicationDocument,
  completeApplicationStep4,
  getApplicationReview,
  submitApplication,
  getCountries,
  getInstitutions,
  getMajors,
} from "../api/applicationApi";


const STORAGE_KEY = "certificate-equivalency-application-draft";

export default function ApplicationSubmissionFlow() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const {
    form,
    setForm,
    register,
    setValue,
    clearErrors,
    formState: { errors },
  } = useApplicationForm(initialForm);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [pendingRequirement, setPendingRequirement] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [backendCountries, setBackendCountries] = useState([]);
  const [backendInstitutions, setBackendInstitutions] = useState([]);
  const [backendMajors, setBackendMajors] = useState([]);
  const [backendRequiredDocuments, setBackendRequiredDocuments] = useState([]);
  const [applicationReview, setApplicationReview] = useState(null);
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

      if (Number.isInteger(payload.applicationId)) {
        setApplicationId(payload.applicationId);
      }

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


  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        const data = await getCountries();

        if (!active) return;

        setBackendCountries(
          Array.isArray(data)
            ? data.map((item) => ({
                value: String(item.id),
                label:
                  language === "ar"
                    ? item.name
                    : item.nameEn || item.name,
              }))
            : []
        );
      } catch (error) {
        console.error("Failed to load countries:", error);

        if (active) {
          setBackendCountries([]);
        }
      }
    };

    loadCountries();

    return () => {
      active = false;
    };
  }, [language]);

  useEffect(() => {
    let active = true;

    if (!form.country || Number.isNaN(Number(form.country))) {
      setBackendInstitutions([]);
      return undefined;
    }

    const loadInstitutions = async () => {
      try {
        const data = await getInstitutions(
          Number(form.country),
          form.qualificationType
        );

        if (!active) return;

        setBackendInstitutions(
          Array.isArray(data)
            ? data
                .filter((item) => item.isActive !== false)
                .map((item) => ({
                  value: String(item.id),
                  label:
                    language === "ar"
                      ? item.name
                      : item.nameEn || item.name,
                }))
            : []
        );
      } catch (error) {
        console.error("Failed to load institutions:", error);

        if (active) {
          setBackendInstitutions([]);
        }
      }
    };

    loadInstitutions();

    return () => {
      active = false;
    };
  }, [form.country, form.qualificationType, language]);

  useEffect(() => {
    let active = true;

    if (!form.institution || Number.isNaN(Number(form.institution))) {
      setBackendMajors([]);
      return undefined;
    }

    const loadMajors = async () => {
      try {
        const data = await getMajors(
          Number(form.institution),
          form.qualificationType
        );

        if (!active) return;

        setBackendMajors(
          Array.isArray(data)
            ? data
                .filter((item) => item.isActive !== false)
                .map((item) => ({
                  value: String(item.id),
                  label:
                    language === "ar"
                      ? item.name
                      : item.nameEn || item.name,
                }))
            : []
        );
      } catch (error) {
        console.error("Failed to load majors:", error);

        if (active) {
          setBackendMajors([]);
        }
      }
    };

    loadMajors();

    return () => {
      active = false;
    };
  }, [form.institution, form.qualificationType, language]);


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

  const applicationCountryOptions = backendCountries;
  const applicationInstitutionOptions = backendInstitutions;
  const applicationMajorOptions = backendMajors;

  const backendDocumentLabelsAr = {
    1: "صورة شخصية حديثة",
    2: "جواز سفر أو وثيقة هوية معتمدة",
    3: "شهادة البكالوريوس أو ما يعادلها",
    4: "كشف العلامات للمواد والسنوات الدراسية",
  };

  const uploadedBackendDocumentTypes = new Set(
    uploadedDocuments
      .filter((item) => item?.status === "uploaded")
      .map((item) => Number(item.documentType))
  );

  const requiredBackendDocumentTypes = backendRequiredDocuments
    .filter((item) => item.required !== false)
    .map((item) => Number(item.documentType));

  const missingBackendDocuments = backendRequiredDocuments.filter(
    (item) =>
      item.required !== false &&
      !uploadedBackendDocumentTypes.has(Number(item.documentType))
  );

  const backendDocumentsValid =
    requiredBackendDocumentTypes.length > 0 &&
    missingBackendDocuments.length === 0;


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

  const getInstitutionLabel = (value) =>
    applicationInstitutionOptions.find(
      (item) => item.value === String(value)
    )?.label ||
    universityOptions.find((item) => item.value === value)?.label ||
    secondaryInstitutionOptions.find((item) => item.value === value)?.label ||
    value ||
    "—";

  const getCountryLabel = (value) =>
    applicationCountryOptions.find(
      (item) => item.value === String(value)
    )?.label ||
    countryOptions.find((item) => item.value === value)?.label ||
    value ||
    "—";

  const getSpecializationLabel = (value) =>
    applicationMajorOptions.find(
      (item) => item.value === String(value)
    )?.label ||
    getSpecializationOptions(form.institution, language).find(
      (item) => item.value === value
    )?.label ||
    value ||
    "—";
  const update = (key) => (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const saveDraft = (overrideApplicationId = applicationId) => {
    const payload = {
      form,
      applicationId: overrideApplicationId,
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

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !pendingRequirement || !applicationId) {
      event.target.value = "";
      return;
    }

    setSaved(false);
    setApiError("");
    setApiLoading(true);

    try {
      const result = await uploadApplicationDocument(
        applicationId,
        pendingRequirement.documentType,
        file
      );

      setUploadedDocuments((current) => [
        ...current.filter(
          (item) =>
            Number(item.documentType) !==
            Number(pendingRequirement.documentType)
        ),
        {
          requirementId: String(pendingRequirement.documentType),
          documentType: pendingRequirement.documentType,
          documentId: result.documentId,
          fileName: result.fileName || file.name,
          url: result.url,
          uploadedAt: result.uploadedAt,
          status: "uploaded",
        },
      ]);

      setPendingRequirement(null);
    } catch (error) {
      console.error("Document upload error:", error);

      setApiError(
        error.message ||
          (language === "ar"
            ? "تعذر رفع الوثيقة."
            : "Unable to upload the document.")
      );
    } finally {
      setApiLoading(false);
      event.target.value = "";
    }
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
        return Boolean(baseValid && form.secondaryBranch);
      }

      return Boolean(baseValid && form.specialization);
    }
    if (step === 3) return backendDocumentsValid;
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;

    setApiError("");
    setApiLoading(true);

    try {
      let workingApplicationId = applicationId;

      if (step === 0) {
        if (!workingApplicationId) {
          const result = await createApplicationDraft(
            form.qualificationType
          );

          workingApplicationId = result.id;
          setApplicationId(result.id);
        }
      }

      if (step === 1) {
        if (!workingApplicationId) {
          throw new Error(
            language === "ar"
              ? "لم يتم إنشاء الطلب بعد."
              : "The application has not been created yet."
          );
        }

        const result = await completeApplicationStep2(
          workingApplicationId
        );

        if (result?.isProfileComplete === false) {
          const missing =
            Array.isArray(result.missingFields) &&
            result.missingFields.length > 0
              ? `: ${result.missingFields.join(", ")}`
              : "";

          throw new Error(
            language === "ar"
              ? `بيانات الملف الشخصي غير مكتملة${missing}`
              : `Applicant profile is incomplete${missing}`
          );
        }
      }

      if (step === 2) {
        if (!workingApplicationId) {
          throw new Error(
            language === "ar"
              ? "لم يتم إنشاء الطلب بعد."
              : "The application has not been created yet."
          );
        }

        const selectedMajorId =
          form.qualificationType === QUALIFICATION_TYPES.SECONDARY
            ? form.secondaryBranch
            : form.specialization;

        if (
          !form.country ||
          !form.institution ||
          !selectedMajorId
        ) {
          throw new Error(
            language === "ar"
              ? form.qualificationType === QUALIFICATION_TYPES.SECONDARY
                ? "اختر الدولة والمدرسة وفرع الثانوية من البيانات القادمة من النظام."
                : "اختر الدولة والمؤسسة والتخصص من البيانات القادمة من النظام."
              : "Select the country, institution, and major from the system data."
          );
        }

        await completeApplicationStep3(
          workingApplicationId,
          {
            countryId: Number(form.country),
            institutionId: Number(form.institution),
            majorId: Number(selectedMajorId),
            graduationYear: Number(form.graduationYear),
            additionalNotes: form.notes || null,
          }
        );

        const requiredDocuments =
          await getRequiredDocuments(workingApplicationId);

        setBackendRequiredDocuments(
          Array.isArray(requiredDocuments)
            ? requiredDocuments
            : []
        );
      }

      if (step === 3) {
        if (!workingApplicationId) {
          throw new Error(
            language === "ar"
              ? "لم يتم إنشاء الطلب بعد."
              : "The application has not been created yet."
          );
        }

        await completeApplicationStep4(
          workingApplicationId
        );
      }

      if (step === 4) {
        if (!workingApplicationId) {
          throw new Error(
            language === "ar"
              ? "لم يتم إنشاء الطلب بعد."
              : "The application has not been created yet."
          );
        }

        const review =
          await getApplicationReview(
            workingApplicationId
          );

        setApplicationReview(review);
      }

      saveDraft(workingApplicationId);

      setStep((current) =>
        Math.min(
          current + 1,
          STEPS.length - 1
        )
      );
    } catch (error) {
      console.error(
        "Application API error:",
        error
      );

      setApiError(
        error.message ||
          (language === "ar"
            ? "تعذر متابعة الطلب."
            : "Unable to continue the application.")
      );
    } finally {
      setApiLoading(false);
    }
  };

  const previous = () => setStep((current) => Math.max(current - 1, 0));

  const submit = async () => {
    if (!validateStep() || !applicationId) return;

    setApiError("");
    setApiLoading(true);

    let submissionResult;

    try {
      submissionResult =
        await submitApplication(
          applicationId
        );
    } catch (error) {
      console.error(
        "Submit application error:",
        error
      );

      setApiError(
        error.message ||
          (language === "ar"
            ? "تعذر تقديم الطلب."
            : "Unable to submit the application.")
      );

      setApiLoading(false);
      return;
    }

    setApiLoading(false);

    const requestId =
      String(
        submissionResult?.applicationId ||
          applicationId
      );

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
        applicationId,
        requestId: newApplication.id,
        status:
          submissionResult?.status ||
          "Submitted",
        submittedAt:
          submissionResult?.submittedAt ||
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
        <Button variant="secondary" icon={<Icon name="save" size={18} />} onClick={() => saveDraft()}>{t("newApplication.saveDraft")}</Button>
      </header>

      {saved && (
        <div className="application-flow__saved" role="status">
          {t("newApplication.draftSaved")}
        </div>
      )}

      {apiError && (
        <div className="application-flow__notice" role="alert">
          <strong>
            {language === "ar" ? "تعذر إكمال العملية" : "Unable to complete the operation"}
          </strong>
          <span>{apiError}</span>
        </div>
      )}

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
            <Select {...register("requestType")} label={language === "ar" ? "نوع الطلب" : "Request type"} options={[{ value: "equivalency", label: language === "ar" ? "معادلة شهادة" : "Certificate equivalency" }]} required />
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

                setValue("qualificationType", nextQualification, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });

                [
                  "secondaryBranch",
                  "certificateName",
                  "institution",
                  "specialization",
                  "country",
                  "graduationYear",
                ].forEach((fieldName) => {
                  setValue(fieldName, "", {
                    shouldDirty: true,
                    shouldTouch: false,
                    shouldValidate: false,
                  });
                });

                clearErrors([
                  "secondaryBranch",
                  "certificateName",
                  "institution",
                  "specialization",
                  "country",
                  "graduationYear",
                ]);
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
            <Input {...register("fullName")} label={t("newApplication.fullName")} error={errors.fullName?.message} required />
            <Input {...register("nationalId")} label={language === "ar" ? "رقم الهوية" : "National ID"} error={errors.nationalId?.message} required />
            <Input {...register("phone")} label={t("newApplication.phone")} error={errors.phone?.message} required />
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
                  specialization: "",
                }));
              }}
              options={applicationCountryOptions}
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
              options={applicationInstitutionOptions}
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
                options={applicationMajorOptions}
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
options={applicationMajorOptions}
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
            <strong>
              {language === "ar"
                ? "الوثائق المطلوبة من الباك إند"
                : "Documents required by the backend"}
            </strong>
            <span>
              {language === "ar"
                ? "ارفع جميع الوثائق الإلزامية قبل الانتقال للخطوة التالية."
                : "Upload all required documents before continuing."}
            </span>
          </div>

          <section className="document-requirements">
            <header className="document-requirements__header">
              <div>
                <h2>
                  {language === "ar"
                    ? "الوثائق المطلوبة"
                    : "Required Documents"}
                </h2>
              </div>

              <strong>
                {uploadedBackendDocumentTypes.size}/
                {requiredBackendDocumentTypes.length}
              </strong>
            </header>

            <div className="document-requirements__list">
              {backendRequiredDocuments.map((requirement) => {
                const documentType =
                  Number(requirement.documentType);

                const uploaded =
                  uploadedBackendDocumentTypes.has(
                    documentType
                  );

                return (
                  <article
                    key={documentType}
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
                          ? backendDocumentLabelsAr[
                              documentType
                            ] || requirement.name
                          : requirement.name}
                      </h3>

                      <span>
                        {requirement.required !== false
                          ? language === "ar"
                            ? "إلزامية"
                            : "Required"
                          : language === "ar"
                            ? "اختيارية"
                            : "Optional"}
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

                      {!uploaded && (
                        <button
                          type="button"
                          className="document-requirement__upload"
                          disabled={apiLoading}
                          onClick={() =>
                            requestUpload(requirement)
                          }
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

            {missingBackendDocuments.length > 0 && (
              <p className="document-requirements__warning">
                {language === "ar"
                  ? `تبقى ${missingBackendDocuments.length} وثيقة إلزامية غير مرفوعة.`
                  : `${missingBackendDocuments.length} required document(s) are still missing.`}
              </p>
            )}
          </section>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFile}
          />

          <div className="application-flow__validation">
            <Badge
              tone={
                backendDocumentsValid
                  ? "success"
                  : "warning"
              }
            >
              {backendDocumentsValid
                ? t("newApplication.documentsComplete")
                : `${missingBackendDocuments.length} ${t(
                    "newApplication.documentsMissing"
                  )}`}
            </Badge>
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
              <div><span>{language === "ar" ? "الوثائق" : "Documents"}</span><strong>{uploadedBackendDocumentTypes.size}/{requiredBackendDocumentTypes.length}</strong></div>
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
          {applicationReview && (
            <div className="application-flow__notice">
              <strong>
                {language === "ar"
                  ? `رقم الطلب: ${applicationReview.applicationId}`
                  : `Application ID: ${applicationReview.applicationId}`}
              </strong>
              <span>
                {language === "ar"
                  ? `الحالة: ${applicationReview.status}`
                  : `Status: ${applicationReview.status}`}
              </span>
            </div>
          )}

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
      {applicationMajorOptions.find(
        (option) =>
          option.value === String(form.secondaryBranch)
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
                {uploadedBackendDocumentTypes.size}/{requiredBackendDocumentTypes.length}
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
        <Button
          variant="secondary"
          disabled={apiLoading}
          onClick={
            step === 0
              ? () => navigate("/my-applications")
              : previous
          }
        >
          {step === 0 ? t("common.cancel") : t("common.previous")}
        </Button>

        <div className="application-flow__footer-right">
          <Button
            variant="ghost"
            disabled={apiLoading}
            onClick={() => saveDraft()}
          >
            {t("newApplication.saveDraft")}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={next}
              disabled={
                apiLoading ||
                !validateStep()
              }
            >
              {apiLoading
                ? language === "ar"
                  ? "جارٍ الحفظ..."
                  : "Saving..."
                : t("common.next")}
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={
                apiLoading ||
                !validateStep()
              }
              icon={<Icon name="check" size={18} />}
            >
              {apiLoading
                ? language === "ar"
                  ? "جارٍ التقديم..."
                  : "Submitting..."
                : t("newApplication.submitApplication")}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}


