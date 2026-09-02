import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { QUALIFICATION_TYPES, getRequirementsForRequest, validateDocuments } from "../data/documentRequirements";
import "./ApplicationSubmissionFlow.css";

const STORAGE_KEY = "certificate-equivalency-application-draft";

const initialForm = {
  requestType: "equivalency",
  qualificationType: "",
  fullName: "",
  nationalId: "",
  phone: "",
  email: "",
  residence: "",
  certificateName: "",
  institution: "",
  country: "",
  specialization: "",
  graduationYear: "",
  notes: "",
};

const STEPS = ["request", "applicant", "certificate", "documents", "draft", "submit"];

export default function ApplicationSubmissionFlow() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [pendingRequirement, setPendingRequirement] = useState(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const requirements = useMemo(
    () => getRequirementsForRequest({ qualificationType: form.qualificationType }),
    [form.qualificationType]
  );

  const validation = useMemo(
    () => validateDocuments({ requirements, uploadedDocuments }),
    [requirements, uploadedDocuments]
  );

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

  const universityOptions = [
    {
      value: "birzeit",
      label:
        language === "ar"
          ? "جامعة بيرزيت"
          : "Birzeit University",
      country: "palestine",
    },
    {
      value: "an-najah",
      label:
        language === "ar"
          ? "جامعة النجاح الوطنية"
          : "An-Najah National University",
      country: "palestine",
    },
    {
      value: "ptuk",
      label:
        language === "ar"
          ? "جامعة فلسطين التقنية – خضوري"
          : "Palestine Technical University – Kadoorie",
      country: "palestine",
    },
    {
      value: "jordan",
      label:
        language === "ar"
          ? "الجامعة الأردنية"
          : "University of Jordan",
      country: "jordan",
    },
    {
      value: "yarmouk",
      label:
        language === "ar"
          ? "جامعة اليرموك"
          : "Yarmouk University",
      country: "jordan",
    },
    {
      value: "cairo",
      label:
        language === "ar"
          ? "جامعة القاهرة"
          : "Cairo University",
      country: "egypt",
    },
  ];

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

  const filteredInstitutionOptions = (
    form.qualificationType === QUALIFICATION_TYPES.SECONDARY
      ? secondaryInstitutionOptions
      : universityOptions
  ).filter(
    (institution) =>
      !form.country ||
      institution.country === form.country
  );
  const specializationsByInstitution = {
    birzeit: [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "software-engineering",
        label: language === "ar" ? "هندسة البرمجيات" : "Software Engineering",
      },
      {
        value: "business-administration",
        label: language === "ar" ? "إدارة الأعمال" : "Business Administration",
      },
    ],

    "an-najah": [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "software-engineering",
        label: language === "ar" ? "هندسة البرمجيات" : "Software Engineering",
      },
      {
        value: "information-systems",
        label: language === "ar" ? "نظم المعلومات" : "Information Systems",
      },
    ],

    ptuk: [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "information-technology",
        label: language === "ar" ? "تكنولوجيا المعلومات" : "Information Technology",
      },
      {
        value: "software-engineering",
        label: language === "ar" ? "هندسة البرمجيات" : "Software Engineering",
      },
    ],

    jordan: [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "information-systems",
        label: language === "ar" ? "نظم المعلومات" : "Information Systems",
      },
      {
        value: "business-administration",
        label: language === "ar" ? "إدارة الأعمال" : "Business Administration",
      },
    ],

    yarmouk: [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "software-engineering",
        label: language === "ar" ? "هندسة البرمجيات" : "Software Engineering",
      },
      {
        value: "information-technology",
        label: language === "ar" ? "تكنولوجيا المعلومات" : "Information Technology",
      },
    ],

    cairo: [
      {
        value: "computer-science",
        label: language === "ar" ? "علوم الحاسوب" : "Computer Science",
      },
      {
        value: "information-systems",
        label: language === "ar" ? "نظم المعلومات" : "Information Systems",
      },
    ],
  };

  const filteredSpecializationOptions =
    specializationsByInstitution[form.institution] || [];
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
  const qualificationOptions = [
    { value: QUALIFICATION_TYPES.SECONDARY, label: language === "ar" ? "الثانوية العامة" : "Secondary" },
    { value: QUALIFICATION_TYPES.BACHELOR, label: t("degrees.bachelor") },
    { value: QUALIFICATION_TYPES.MASTER, label: t("degrees.master") },
    { value: QUALIFICATION_TYPES.DOCTORATE, label: t("degrees.phd") },
  ];

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
      uploadedDocuments,
      savedAt: new Date().toISOString(),
      status: "draft",
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

  const validateStep = () => {
    if (step === 0) return Boolean(form.requestType && form.qualificationType);
    if (step === 1) return Boolean(form.fullName && form.nationalId && form.phone && form.email && form.residence);
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
    const requestId = `REQ-${Date.now().toString().slice(-6)}`;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      form,
      uploadedDocuments,
      requestId,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    }));
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
          <DocumentRequirementsList qualificationType={form.qualificationType} uploadedDocuments={uploadedDocuments} onUpload={requestUpload} />
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












