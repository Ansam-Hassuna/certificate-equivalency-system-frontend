import { QUALIFICATION_TYPES, REQUIREMENT_TYPES } from "./constants";

// The checklist images supplied for the project contain general items plus
// qualification-specific and case-dependent items. Conditional items are
// intentionally activated by explicit case data rather than inferred.
const general = [
  {
    id: "general-passport-or-id",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة مصدقة عن جواز السفر أو الوثيقة المعتمدة حسب الحالة",
    labelEn: "Certified copy of the passport or approved identification document, as applicable",
  },
  {
    id: "general-personal-photo",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة شخصية حديثة",
    labelEn: "Recent personal photograph",
  },
  {
    id: "general-passports-study-period",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "usedPassportsDuringStudy",
    labelAr: "صور جوازات السفر المستخدمة أثناء الدراسة",
    labelEn: "Copies of passports used during the study period",
  },
  {
    id: "general-study-entry-exit",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "studyEntryExitEvidenceRequired",
    labelAr: "وثائق تثبت الدخول والإقامة أثناء فترة الدراسة عند طلبها",
    labelEn: "Documents evidencing entry and residence during the study period when required",
  },
];

const secondary = [
  {
    id: "secondary-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة مصدقة عن شهادة الثانوية العامة الأجنبية",
    labelEn: "Certified copy of the foreign secondary school certificate",
  },
  {
    id: "secondary-transcripts",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "كشوف العلامات والوثائق الدراسية المطلوبة للصفوف ذات العلاقة",
    labelEn: "Required transcripts and academic records for the relevant school years",
  },
  {
    id: "secondary-school-document",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "وثيقة مصدقة من المدرسة حسب متطلبات القائمة",
    labelEn: "Certified school document as required by the checklist",
  },
  {
    id: "secondary-international-exams",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "hasInternationalExam",
    labelAr: "وثائق أو نتائج الاختبارات الدولية مثل SAT أو ACT أو AP أو IB حسب الحالة",
    labelEn: "International examination documents/results such as SAT, ACT, AP or IB, as applicable",
  },
];

const bachelor = [
  {
    id: "bachelor-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة مصدقة عن شهادة البكالوريوس أو ما يعادلها",
    labelEn: "Certified copy of the bachelor's degree or equivalent",
  },
  {
    id: "bachelor-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "كشف علامات مصدق للمواد والسنوات الدراسية المطلوبة",
    labelEn: "Certified transcript for the required courses and study years",
  },
  {
    id: "bachelor-prior-qualification",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "priorQualificationRequired",
    labelAr: "وثيقة المؤهل السابق المطلوبة حسب الحالة",
    labelEn: "Prior qualification document required according to the case",
  },
];

const master = [
  {
    id: "master-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة مصدقة عن شهادة الماجستير",
    labelEn: "Certified copy of the master's degree",
  },
  {
    id: "master-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "كشف علامات مصدق للماجستير",
    labelEn: "Certified master's transcript",
  },
  {
    id: "master-prior-degree",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "وثيقة الدرجة العلمية السابقة المطلوبة",
    labelEn: "Required previous degree document",
  },
];

const doctorate = [
  {
    id: "doctorate-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة مصدقة عن شهادة الدكتوراه",
    labelEn: "Certified copy of the doctoral degree",
  },
  {
    id: "doctorate-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "كشف علامات مصدق للدكتوراه",
    labelEn: "Certified doctoral transcript",
  },
  {
    id: "doctorate-prior-degrees",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "وثائق الدرجات العلمية السابقة المطلوبة",
    labelEn: "Required previous academic degree documents",
  },
];

export const DOCUMENT_REQUIREMENTS = [
  ...general,
  ...secondary,
  ...bachelor,
  ...master,
  ...doctorate,
];
