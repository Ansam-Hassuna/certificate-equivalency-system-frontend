import { QUALIFICATION_TYPES } from "./constants";

export const QUALIFICATION_CATALOG = Object.freeze({
  [QUALIFICATION_TYPES.SECONDARY]: {
    type: QUALIFICATION_TYPES.SECONDARY,
    level: "secondary",
    labelAr: "الثانوية العامة",
    labelEn: "Secondary School Certificate",
    category: "school",
    allowsMultiple: false,
  },

  [QUALIFICATION_TYPES.MEDIUM_DIPLOMA]: {
    type: QUALIFICATION_TYPES.MEDIUM_DIPLOMA,
    level: "medium_diploma",
    labelAr: "الدبلوم المتوسط",
    labelEn: "Medium Diploma",
    category: "post_secondary",
    allowsMultiple: true,
  },

  [QUALIFICATION_TYPES.BACHELOR]: {
    type: QUALIFICATION_TYPES.BACHELOR,
    level: "bachelor",
    labelAr: "البكالوريوس",
    labelEn: "Bachelor's Degree",
    category: "undergraduate",
    allowsMultiple: true,
  },

  [QUALIFICATION_TYPES.HIGHER_DIPLOMA]: {
    type: QUALIFICATION_TYPES.HIGHER_DIPLOMA,
    level: "higher_diploma",
    labelAr: "الدبلوم العالي",
    labelEn: "Higher Diploma",
    category: "postgraduate",
    allowsMultiple: true,
  },

  [QUALIFICATION_TYPES.MASTER]: {
    type: QUALIFICATION_TYPES.MASTER,
    level: "master",
    labelAr: "الماجستير",
    labelEn: "Master's Degree",
    category: "postgraduate",
    allowsMultiple: true,
  },

  [QUALIFICATION_TYPES.DOCTORATE]: {
    type: QUALIFICATION_TYPES.DOCTORATE,
    level: "doctorate",
    labelAr: "الدكتوراه",
    labelEn: "Doctorate",
    category: "doctoral",
    allowsMultiple: true,
  },
});

export function getQualificationDefinition(
  qualificationType
) {
  return (
    QUALIFICATION_CATALOG[qualificationType] ||
    null
  );
}

export function isKnownQualificationType(
  qualificationType
) {
  return Boolean(
    getQualificationDefinition(qualificationType)
  );
}

export function getQualificationOptions(
  language = "ar"
) {
  return Object.values(
    QUALIFICATION_CATALOG
  ).map((item) => ({
    value: item.type,
    label:
      language === "ar"
        ? item.labelAr
        : item.labelEn,
  }));
}
