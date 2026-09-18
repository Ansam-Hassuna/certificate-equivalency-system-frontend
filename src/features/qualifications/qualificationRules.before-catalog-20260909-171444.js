import { QUALIFICATION_TYPES } from "../../data/documentRequirements";

export const QUALIFICATION_PREREQUISITES = {
  [QUALIFICATION_TYPES.SECONDARY]: {
    requiredLevel: null,
    requiresPreviousQualification: false,
    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.BACHELOR]: {
    requiredLevel: QUALIFICATION_TYPES.SECONDARY,
    requiresPreviousQualification: true,
    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.MASTER]: {
    requiredLevel: QUALIFICATION_TYPES.BACHELOR,
    requiresPreviousQualification: true,

    // سيتم تعبئتها بعد اعتماد قواعد التخصصات.
    // null = القاعدة تحتاج اعتمادًا من المشرف.
    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.DOCTORATE]: {
    requiredLevel: QUALIFICATION_TYPES.MASTER,
    requiresPreviousQualification: true,

    // سيتم تعبئتها بعد اعتماد قواعد التخصصات.
    acceptedPreviousMajors: null,
  },
};

export function getQualificationPrerequisite(
  qualificationType
) {
  return (
    QUALIFICATION_PREREQUISITES[qualificationType] || {
      requiredLevel: null,
      requiresPreviousQualification: false,
      acceptedPreviousMajors: null,
    }
  );
}

export function requiresPreviousQualification(
  qualificationType
) {
  return Boolean(
    getQualificationPrerequisite(
      qualificationType
    ).requiresPreviousQualification
  );
}

export function getRequiredPreviousLevel(
  qualificationType
) {
  return getQualificationPrerequisite(
    qualificationType
  ).requiredLevel;
}

export function areMajorRulesConfigured(
  qualificationType
) {
  const rule =
    getQualificationPrerequisite(
      qualificationType
    );

  return (
    rule.acceptedPreviousMajors !== null
  );
}
