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

export const PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES =
  Object.freeze({
    NONE: "none",
    REQUIRED: "required",
    ONE_OF: "one_of",
    ALL_OF: "all_of",
    REVIEW_REQUIRED: "review_required",
  });

/*
 * A path describes the complete academic prerequisite
 * sequence below the target qualification.
 *
 * Example:
 * MASTER -> [BACHELOR, SECONDARY]
 * DOCTORATE -> [MASTER, BACHELOR, SECONDARY]
 *
 * The first item is always the direct prerequisite.
 */
export const QUALIFICATION_PREREQUISITE_PATHS =
  Object.freeze({
    [QUALIFICATION_TYPES.SECONDARY]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.SECONDARY,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.VERIFIED,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.NONE,

      mode: PREREQUISITE_MODES.NONE,

      paths: Object.freeze([]),

      notes: {
        ar: "لا يوجد مؤهل أكاديمي سابق مطلوب لهذا المستوى.",
        en: "No previous academic qualification is required for this level.",
      },
    }),

    [QUALIFICATION_TYPES.MEDIUM_DIPLOMA]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.MEDIUM_DIPLOMA,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

      mode: PREREQUISITE_MODES.MULTIPLE_PATHS,

      paths: Object.freeze([]),

      notes: {
        ar: "مسار الدبلوم المتوسط يحتاج تحديد المسار القانوني المعتمد قبل بناء السلسلة الأكاديمية.",
        en: "The medium-diploma pathway requires the approved legal path before its prerequisite chain can be resolved.",
      },
    }),

    [QUALIFICATION_TYPES.BACHELOR]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.BACHELOR,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.VERIFIED,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

      mode: PREREQUISITE_MODES.CHAIN,

      paths: Object.freeze([
        Object.freeze({
          id: "bachelor-standard",
          status:
            PREREQUISITE_RULE_STATUS.VERIFIED,

          directPreviousLevel:
            QUALIFICATION_TYPES.SECONDARY,

          chainLevels: Object.freeze([
            QUALIFICATION_TYPES.SECONDARY,
          ]),
        }),
      ]),

      notes: {
        ar: "المسار الأساسي للبكالوريوس يبدأ من مؤهل الثانوية المناسب.",
        en: "The standard bachelor pathway begins with the appropriate secondary qualification.",
      },
    }),

    [QUALIFICATION_TYPES.HIGHER_DIPLOMA]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.HIGHER_DIPLOMA,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

      mode: PREREQUISITE_MODES.MULTIPLE_PATHS,

      paths: Object.freeze([]),

      notes: {
        ar: "مسار الدبلوم العالي يحتاج تحديد القاعدة القانونية والمسار السابق المعتمد.",
        en: "The higher-diploma pathway requires the approved legal prerequisite path.",
      },
    }),

    [QUALIFICATION_TYPES.MASTER]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.MASTER,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.VERIFIED,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

      mode: PREREQUISITE_MODES.CHAIN,

      paths: Object.freeze([
        Object.freeze({
          id: "master-standard",
          status:
            PREREQUISITE_RULE_STATUS.VERIFIED,

          directPreviousLevel:
            QUALIFICATION_TYPES.BACHELOR,

          chainLevels: Object.freeze([
            QUALIFICATION_TYPES.BACHELOR,
            QUALIFICATION_TYPES.SECONDARY,
          ]),
        }),
      ]),

      notes: {
        ar: "المسار الأساسي للماجستير يتطلب سلسلة سابقة تبدأ بالبكالوريوس ثم الثانوية.",
        en: "The standard master's pathway requires a prior chain beginning with a bachelor qualification and continuing to the secondary level.",
      },
    }),

    [QUALIFICATION_TYPES.INTEGRATED_MASTER]:
      Object.freeze({
        qualificationType:
          QUALIFICATION_TYPES.INTEGRATED_MASTER,

        ruleStatus:
          PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

        prerequisiteType:
          PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

        mode:
          PREREQUISITE_MODES.MULTIPLE_PATHS,

        paths: Object.freeze([]),

        notes: {
          ar: "الماجستير المتكامل مسار خاص ويحتاج قاعدة البرنامج المعتمدة قبل بناء السلسلة.",
          en: "The integrated master's degree is a special pathway and requires the approved program-specific prerequisite rule.",
        },
      }),

    [QUALIFICATION_TYPES.DOCTORATE]: Object.freeze({
      qualificationType:
        QUALIFICATION_TYPES.DOCTORATE,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.VERIFIED,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

      mode: PREREQUISITE_MODES.CHAIN,

      paths: Object.freeze([
        Object.freeze({
          id: "doctorate-standard",
          status:
            PREREQUISITE_RULE_STATUS.VERIFIED,

          directPreviousLevel:
            QUALIFICATION_TYPES.MASTER,

          chainLevels: Object.freeze([
            QUALIFICATION_TYPES.MASTER,
            QUALIFICATION_TYPES.BACHELOR,
            QUALIFICATION_TYPES.SECONDARY,
          ]),
        }),
      ]),

      notes: {
        ar: "المسار الأساسي للدكتوراه يتتبع سلسلة الماجستير ثم البكالوريوس ثم الثانوية.",
        en: "The standard doctorate pathway follows the master's, bachelor, and secondary qualification chain.",
      },
    }),
  });

function buildLegacyRule(
  qualificationType,
  config
) {
  const firstPath =
    config.paths?.[0] || null;

  const chainLevels =
    firstPath?.chainLevels || [];

  return {
    qualificationType,

    prerequisiteType:
      config.prerequisiteType,

    requiredLevel:
      firstPath?.directPreviousLevel || null,

    requiredLevels:
      firstPath?.directPreviousLevel
        ? [firstPath.directPreviousLevel]
        : [],

    requiresPreviousQualification:
      chainLevels.length > 0,

    prerequisiteMode:
      config.mode,

    inheritPreviousRequirements:
      chainLevels.length > 1,

    ruleStatus:
      config.ruleStatus,

    acceptedPreviousMajors: null,

    paths: config.paths || [],

    chainLevels,

    notes: config.notes,
  };
}

export const QUALIFICATION_PREREQUISITES =
  Object.freeze(
    Object.fromEntries(
      Object.entries(
        QUALIFICATION_PREREQUISITE_PATHS
      ).map(
        ([
          qualificationType,
          config,
        ]) => [
          qualificationType,
          buildLegacyRule(
            qualificationType,
            config
          ),
        ]
      )
    )
  );

export function getQualificationPrerequisite(
  qualificationType
) {
  return (
    QUALIFICATION_PREREQUISITES[
      qualificationType
    ] || {
      qualificationType,

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

      requiredLevel: null,
      requiredLevels: [],

      requiresPreviousQualification: false,

      prerequisiteMode:
        PREREQUISITE_MODES.NONE,

      inheritPreviousRequirements: false,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.MANUAL_REVIEW,

      acceptedPreviousMajors: null,

      paths: [],

      chainLevels: [],

      notes: {
        ar: "نوع مؤهل غير معروف ويحتاج مراجعة.",
        en: "Unknown qualification type; manual review is required.",
      },
    }
  );
}

export function getQualificationPrerequisitePaths(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).paths || []
  );
}

export function getStandardQualificationChain(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).chainLevels || []
  );
}

export function requiresPreviousQualification(
  qualificationType
) {
  return getStandardQualificationChain(
    qualificationType
  ).length > 0;
}

export function getRequiredPreviousLevel(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).requiredLevel || null
  );
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
  return (
    getStandardQualificationChain(
      qualificationType
    ).length > 1
  );
}

export function areMajorRulesConfigured(
  qualificationType
) {
  return (
    getQualificationPrerequisite(
      qualificationType
    ).acceptedPreviousMajors !== null
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

export function getPrerequisiteRequirementType(
  qualificationType
) {
  return getQualificationPrerequisite(
    qualificationType
  ).prerequisiteType;
}
