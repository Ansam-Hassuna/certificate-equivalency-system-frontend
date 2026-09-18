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

export const QUALIFICATION_PREREQUISITES = Object.freeze({
  [QUALIFICATION_TYPES.SECONDARY]: {
    qualificationType: QUALIFICATION_TYPES.SECONDARY,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.NONE,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.NONE,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,

    notes: {
      ar: "لا يوجد مؤهل أكاديمي سابق مطلوب لهذا المستوى.",
      en: "No previous academic qualification is required for this level.",
    },
  },

  [QUALIFICATION_TYPES.MEDIUM_DIPLOMA]: {
    qualificationType:
      QUALIFICATION_TYPES.MEDIUM_DIPLOMA,

    /*
     * The exact admission/bridging paths must be resolved
     * from the applicable legal rule and applicant context.
     * Do not invent a single prerequisite here.
     */
    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.MULTIPLE_PATHS,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

    acceptedPreviousMajors: null,

    notes: {
      ar: "مسار الدبلوم المتوسط يحتاج تحديد مسار القبول أو الحالة وفق القاعدة القانونية المطبقة.",
      en: "The medium-diploma path requires resolution of the applicable admission or case-specific rule.",
    },
  },

  [QUALIFICATION_TYPES.BACHELOR]: {
    qualificationType:
      QUALIFICATION_TYPES.BACHELOR,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

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

    /*
     * The system must determine the applicable
     * secondary-school pathway separately:
     * Palestinian / Arab / Foreign / GCE / IB / etc.
     */
    acceptedPreviousMajors: null,

    notes: {
      ar: "يتطلب البكالوريوس مؤهل الثانوية المناسب، وتحديد المتطلبات التفصيلية يعتمد على مسار الثانوية والأسس القانونية السارية.",
      en: "Bachelor admission requires the appropriate secondary qualification; detailed requirements depend on the secondary pathway and applicable legal rules.",
    },
  },

  [QUALIFICATION_TYPES.HIGHER_DIPLOMA]: {
    qualificationType:
      QUALIFICATION_TYPES.HIGHER_DIPLOMA,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.MULTIPLE_PATHS,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

    acceptedPreviousMajors: null,

    notes: {
      ar: "الدبلوم العالي يحتاج تحديد المؤهل السابق والمسار وفق القاعدة القانونية الخاصة بالحالة.",
      en: "Higher-diploma admission requires resolution of the applicable prior qualification and pathway.",
    },
  },

  [QUALIFICATION_TYPES.MASTER]: {
    qualificationType:
      QUALIFICATION_TYPES.MASTER,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

    requiredLevel:
      QUALIFICATION_TYPES.BACHELOR,

    requiredLevels: [
      QUALIFICATION_TYPES.BACHELOR,
    ],

    requiresPreviousQualification: true,

    prerequisiteMode:
      PREREQUISITE_MODES.CHAIN,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    /*
     * null means specialization compatibility is not
     * hard-coded. A verified bachelor may come from:
     * - an existing approved record
     * - an external qualification
     * - the same application
     *
     * Final specialty determination can require review.
     */
    acceptedPreviousMajors: null,

    notes: {
      ar: "يتطلب الماجستير مؤهل بكالوريوس أو ما يعادله وفق القواعد السارية، ولا يشترط أن يكون المؤهل السابق طلب معادلة سابقًا في هذا النظام.",
      en: "A master's application requires a bachelor's qualification or its recognized equivalent under the applicable rules; the prerequisite does not have to be a previously approved application in this system.",
    },
  },

  [QUALIFICATION_TYPES.INTEGRATED_MASTER]: {
    qualificationType:
      QUALIFICATION_TYPES.INTEGRATED_MASTER,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

    requiredLevel: null,
    requiredLevels: [],

    requiresPreviousQualification: false,

    prerequisiteMode:
      PREREQUISITE_MODES.MULTIPLE_PATHS,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

    acceptedPreviousMajors: null,

    notes: {
      ar: "الماجستير المدمج مسار خاص ويجب تحديد شروطه من القاعدة القانونية الخاصة بالبرنامج.",
      en: "An integrated master's degree is a special pathway and must be resolved from the legal rule applicable to the program.",
    },
  },

  [QUALIFICATION_TYPES.DOCTORATE]: {
    qualificationType:
      QUALIFICATION_TYPES.DOCTORATE,

    prerequisiteType:
      PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REQUIRED,

    /*
     * The default verified path is through a master's
     * qualification, while the legal engine must be able
     * to resolve special/direct-doctorate paths separately.
     */
    requiredLevel:
      QUALIFICATION_TYPES.MASTER,

    requiredLevels: [
      QUALIFICATION_TYPES.MASTER,
    ],

    requiresPreviousQualification: true,

    prerequisiteMode:
      PREREQUISITE_MODES.CHAIN,

    inheritPreviousRequirements: false,

    ruleStatus:
      PREREQUISITE_RULE_STATUS.VERIFIED,

    acceptedPreviousMajors: null,

    notes: {
      ar: "المسار الأساسي للدكتوراه يعتمد على مؤهل الماجستير السابق الصالح، مع إبقاء المسارات الخاصة مثل الدكتوراه المباشرة للمعالجة وفق قاعدة مستقلة.",
      en: "The standard doctorate path uses the required prior qualification, while special paths such as direct doctorate must be resolved by a separate rule.",
    },
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

      prerequisiteType:
        PREVIOUS_QUALIFICATION_REQUIREMENT_TYPES.REVIEW_REQUIRED,

      requiredLevel: null,
      requiredLevels: [],

      requiresPreviousQualification: false,

      prerequisiteMode:
        PREREQUISITE_MODES.NONE,

      inheritPreviousRequirements: false,

      ruleStatus:
        PREREQUISITE_RULE_STATUS.PENDING_APPROVAL,

      acceptedPreviousMajors: null,

      notes: {
        ar: "نوع مؤهل غير معروف ويحتاج مراجعة.",
        en: "Unknown qualification type; manual review is required.",
      },
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

export function getPrerequisiteRequirementType(
  qualificationType
) {
  return getQualificationPrerequisite(
    qualificationType
  ).prerequisiteType;
}

