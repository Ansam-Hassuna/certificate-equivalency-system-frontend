import { QUALIFICATION_TYPES } from "../../data/qualifications/constants";

export const PREREQUISITE_RULE_STATUS = Object.freeze({
  VERIFIED: "verified",
  PENDING_APPROVAL: "pending_approval",
  MANUAL_REVIEW: "manual_review",
});

export const PREREQUISITE_MODES = Object.freeze({
  NONE: "none",
  SINGLE_LEVEL: "single_level",
  CHAIN: "chain",
  MULTIPLE_PATHS: "multiple_paths",
});

export const QUALIFICATION_PREREQUISITES = Object.freeze({
  [QUALIFICATION_TYPES.SECONDARY]: {
    qualificationType: QUALIFICATION_TYPES.SECONDARY,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.NONE,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.MEDIUM_DIPLOMA]: {
    qualificationType:
      QUALIFICATION_TYPES.MEDIUM_DIPLOMA,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.MULTIPLE_PATHS,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.BACHELOR]: {
    qualificationType:
      QUALIFICATION_TYPES.BACHELOR,

    requiredLevel:
      QUALIFICATION_TYPES.SECONDARY,

    requiredLevels: [
      QUALIFICATION_TYPES.SECONDARY,
    ],

    requiresPreviousQualification: true,

    prerequisiteMode:
      PREREQUISITE_MODES.SINGLE_LEVEL,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.HIGHER_DIPLOMA]: {
    qualificationType:
      QUALIFICATION_TYPES.HIGHER_DIPLOMA,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.MULTIPLE_PATHS,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.MASTER]: {
    qualificationType:
      QUALIFICATION_TYPES.MASTER,

    requiredLevel:
      QUALIFICATION_TYPES.BACHELOR,

    requiredLevels: [
      QUALIFICATION_TYPES.BACHELOR,
    ],

    requiresPreviousQualification: true,

    prerequisiteMode:
      PREREQUISITE_MODES.CHAIN,

    inheritPreviousRequirements: true,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,
  },

  [QUALIFICATION_TYPES.DOCTORATE]: {
    qualificationType:
      QUALIFICATION_TYPES.DOCTORATE,

    requiredLevel:
      QUALIFICATION_TYPES.MASTER,

    requiredLevels: [
      QUALIFICATION_TYPES.MASTER,
    ],

    requiresPreviousQualification: true,

    prerequisiteMode:
      PREREQUISITE_MODES.CHAIN,

    inheritPreviousRequirements: true,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,
  },
});

export function getQualificationPrerequisite(
  qualificationType
) {
  return (
    QUALIFICATION_PREREQUISITES[
      qualificationType
    ] || {
      qualificationType,
      requiredLevel: null,
      requiredLevels: [],
      requiresPreviousQualification: false,
      prerequisiteMode:
        PREREQUISITE_MODES.NONE,
      inheritPreviousRequirements: false,
      ruleStatus:
        PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,
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

export function getRequiredPreviousLevels(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).requiredLevels || []
  );
}

export function shouldInheritPreviousRequirements(
  qualificationType
) {
  return Boolean(
    getQualificationPrerequisite(
      qualificationType
    ).inheritPreviousRequirements
  );
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

export function isPrerequisiteRuleApproved(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).ruleStatus ===
    PREREQUISITE_RULE_STATUS.VERIFIED
  );
}
