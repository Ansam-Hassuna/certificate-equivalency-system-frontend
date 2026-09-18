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
    labelAr: "ØµÙˆØ±Ø© Ù…ØµØ¯Ù‚Ø© Ø¹Ù† Ø¬ÙˆØ§Ø² Ø§Ù„Ø³ÙØ± Ø£Ùˆ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©",
    labelEn: "Certified copy of the passport or approved identification document, as applicable",
  },
  {
    id: "general-personal-photo",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ØµÙˆØ±Ø© Ø´Ø®ØµÙŠØ© Ø­Ø¯ÙŠØ«Ø©",
    labelEn: "Recent personal photograph",
  },
  {
    id: "general-passports-study-period",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "usedPassportsDuringStudy",
    labelAr: "ØµÙˆØ± Ø¬ÙˆØ§Ø²Ø§Øª Ø§Ù„Ø³ÙØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø¯Ø±Ø§Ø³Ø©",
    labelEn: "Copies of passports used during the study period",
  },
  {
    id: "general-study-entry-exit",
    qualificationTypes: "all",
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "studyEntryExitEvidenceRequired",
    labelAr: "ÙˆØ«Ø§Ø¦Ù‚ ØªØ«Ø¨Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙˆØ§Ù„Ø¥Ù‚Ø§Ù…Ø© Ø£Ø«Ù†Ø§Ø¡ ÙØªØ±Ø© Ø§Ù„Ø¯Ø±Ø§Ø³Ø© Ø¹Ù†Ø¯ Ø·Ù„Ø¨Ù‡Ø§",
    labelEn: "Documents evidencing entry and residence during the study period when required",
  },
];

const localSecondary = [
  {
    id: "local-secondary-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "صورة عن شهادة الثانوية العامة الفلسطينية",
    labelEn: "Copy of the Palestinian secondary school certificate",
  },
  {
    id: "local-secondary-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "كشف علامات الثانوية العامة",
    labelEn: "Secondary school transcript",
  },
  {
    id: "local-secondary-school-document",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "وثيقة مدرسية أو إفادة تخرج",
    labelEn: "School document or graduation certificate",
  },
  {
    id: "local-secondary-international-exams",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "hasInternationalExam",
    labelAr: "وثائق أو نتائج الاختبارات الدولية مثل SAT أو ACT أو AP أو IB حسب الحالة",
    labelEn: "International examination documents or results such as SAT, ACT, AP or IB, as applicable",
  },
];
const secondary = [
  {
    id: "secondary-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ØµÙˆØ±Ø© Ù…ØµØ¯Ù‚Ø© Ø¹Ù† Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø«Ø§Ù†ÙˆÙŠØ© Ø§Ù„Ø¹Ø§Ù…Ø© Ø§Ù„Ø£Ø¬Ù†Ø¨ÙŠØ©",
    labelEn: "Certified copy of the foreign secondary school certificate",
  },
  {
    id: "secondary-transcripts",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙƒØ´ÙˆÙ Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù„Ù„ØµÙÙˆÙ Ø°Ø§Øª Ø§Ù„Ø¹Ù„Ø§Ù‚Ø©",
    labelEn: "Required transcripts and academic records for the relevant school years",
  },
  {
    id: "secondary-school-document",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙˆØ«ÙŠÙ‚Ø© Ù…ØµØ¯Ù‚Ø© Ù…Ù† Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø­Ø³Ø¨ Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©",
    labelEn: "Certified school document as required by the checklist",
  },
  {
    id: "secondary-international-exams",
    qualificationTypes: [QUALIFICATION_TYPES.SECONDARY],
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "hasInternationalExam",
    labelAr: "ÙˆØ«Ø§Ø¦Ù‚ Ø£Ùˆ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±Ø§Øª Ø§Ù„Ø¯ÙˆÙ„ÙŠØ© Ù…Ø«Ù„ SAT Ø£Ùˆ ACT Ø£Ùˆ AP Ø£Ùˆ IB Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©",
    labelEn: "International examination documents/results such as SAT, ACT, AP or IB, as applicable",
  },
];

const bachelor = [
  {
    id: "bachelor-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ØµÙˆØ±Ø© Ù…ØµØ¯Ù‚Ø© Ø¹Ù† Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠÙˆØ³ Ø£Ùˆ Ù…Ø§ ÙŠØ¹Ø§Ø¯Ù„Ù‡Ø§",
    labelEn: "Certified copy of the bachelor's degree or equivalent",
  },
  {
    id: "bachelor-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙƒØ´Ù Ø¹Ù„Ø§Ù…Ø§Øª Ù…ØµØ¯Ù‚ Ù„Ù„Ù…ÙˆØ§Ø¯ ÙˆØ§Ù„Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©",
    labelEn: "Certified transcript for the required courses and study years",
  },
  {
    id: "bachelor-prior-qualification",
    qualificationTypes: [QUALIFICATION_TYPES.BACHELOR],
    type: REQUIREMENT_TYPES.CONDITIONAL,
    required: false,
    condition: "priorQualificationRequired",
    labelAr: "ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ù…Ø¤Ù‡Ù„ Ø§Ù„Ø³Ø§Ø¨Ù‚ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©",
    labelEn: "Prior qualification document required according to the case",
  },
];

const master = [
  {
    id: "master-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ØµÙˆØ±Ø© Ù…ØµØ¯Ù‚Ø© Ø¹Ù† Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ±",
    labelEn: "Certified copy of the master's degree",
  },
  {
    id: "master-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙƒØ´Ù Ø¹Ù„Ø§Ù…Ø§Øª Ù…ØµØ¯Ù‚ Ù„Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ±",
    labelEn: "Certified master's transcript",
  },
  {
    id: "master-prior-degree",
    qualificationTypes: [QUALIFICATION_TYPES.MASTER],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©",
    labelEn: "Required previous degree document",
  },
];

const doctorate = [
  {
    id: "doctorate-certificate",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ØµÙˆØ±Ø© Ù…ØµØ¯Ù‚Ø© Ø¹Ù† Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¯ÙƒØªÙˆØ±Ø§Ù‡",
    labelEn: "Certified copy of the doctoral degree",
  },
  {
    id: "doctorate-transcript",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙƒØ´Ù Ø¹Ù„Ø§Ù…Ø§Øª Ù…ØµØ¯Ù‚ Ù„Ù„Ø¯ÙƒØªÙˆØ±Ø§Ù‡",
    labelEn: "Certified doctoral transcript",
  },
  {
    id: "doctorate-prior-degrees",
    qualificationTypes: [QUALIFICATION_TYPES.DOCTORATE],
    type: REQUIREMENT_TYPES.GENERAL,
    required: true,
    labelAr: "ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©",
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

export const LOCAL_DOCUMENT_REQUIREMENTS = [
  ...localSecondary,
];



