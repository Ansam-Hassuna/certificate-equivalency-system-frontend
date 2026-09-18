import {
  QUALIFICATION_TYPES,
} from "../../data/documentRequirements";

import {
  PREREQUISITE_MODES,
  PREREQUISITE_RULE_STATUS,
  getQualificationPrerequisite,
} from "./qualificationRules";

const APPROVED_STATUS = "APPROVED";

const REASONS = Object.freeze({
  NO_PREREQUISITE: "NO_PREREQUISITE",
  ELIGIBLE: "ELIGIBLE",
  NO_ELIGIBLE_PREVIOUS_QUALIFICATION:
    "NO_ELIGIBLE_PREVIOUS_QUALIFICATION",
  PREREQUISITE_RULE_PENDING_APPROVAL:
    "PREREQUISITE_RULE_PENDING_APPROVAL",
  PREREQUISITE_RULE_MANUAL_REVIEW:
    "PREREQUISITE_RULE_MANUAL_REVIEW",
  MAJOR_RULE_NOT_CONFIGURED:
    "MAJOR_RULE_NOT_CONFIGURED",
  MAJOR_MISMATCH:
    "MAJOR_MISMATCH",
  CIRCULAR_PREREQUISITE:
    "CIRCULAR_PREREQUISITE",
  UNKNOWN_QUALIFICATION:
    "UNKNOWN_QUALIFICATION",
});

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isApproved(application) {
  return (
    String(application?.statusKey || "")
      .trim()
      .toUpperCase() === APPROVED_STATUS
  );
}

function getApplicantQualifications(
  applications,
  ownerUserId
) {
  if (!Array.isArray(applications)) {
    return [];
  }

  return applications.filter(
    (application) =>
      application?.ownerUserId === ownerUserId
  );
}

function getRequiredLevels(rule) {
  if (
    Array.isArray(rule?.requiredLevels) &&
    rule.requiredLevels.length > 0
  ) {
    return rule.requiredLevels;
  }

  if (rule?.requiredLevel) {
    return [rule.requiredLevel];
  }

  return [];
}

function getCandidatesForLevel(
  applicantQualifications,
  qualificationLevel
) {
  return applicantQualifications.filter(
    (qualification) =>
      qualification?.qualificationKey === qualificationLevel &&
      (
        qualification?.statusKey?.toUpperCase() === APPROVED_STATUS ||
        qualification?.status === "verified" ||
        qualification?.verificationStatus === "verified"
      )
  );
}

function applyMajorRule(
  candidates,
  rule
) {
  if (!Array.isArray(candidates)) {
    return {
      eligible: [],
      majorRuleConfigured: false,
      majorRuleNeedsReview: false,
      majorMismatch: false,
    };
  }

  /*
   * null means that the major rule has not
   * been configured yet.
   *
   * We do NOT reject the qualification here.
   * Instead we preserve the candidate and mark
   * the result for review.
   */
  if (rule?.acceptedPreviousMajors === null) {
    return {
      eligible: candidates.map(
        (application) => ({
          ...application,
          majorRuleConfigured: false,
        })
      ),
      majorRuleConfigured: false,
      majorRuleNeedsReview: true,
      majorMismatch: false,
    };
  }

  const allowedMajors =
    Array.isArray(rule.acceptedPreviousMajors)
      ? rule.acceptedPreviousMajors.map(
          normalizeValue
        )
      : [];

  const eligible = candidates.filter(
    (application) =>
      allowedMajors.includes(
        normalizeValue(
          application?.specialization
        )
      )
  );

  return {
    eligible,
    majorRuleConfigured: true,
    majorRuleNeedsReview: false,
    majorMismatch:
      candidates.length > 0 &&
      eligible.length === 0,
  };
}

function resolvePrerequisiteLevel({
  applicantApplications,
  qualificationLevel,
  visited,
}) {
  if (visited.has(qualificationLevel)) {
    return {
      allowed: false,
      reason:
        REASONS.CIRCULAR_PREREQUISITE,
      qualificationLevel,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [],
      majorRuleConfigured: false,
      majorRuleNeedsReview: true,
    };
  }

  const rule =
    getQualificationPrerequisite(
      qualificationLevel
    );

  if (
    rule.ruleStatus ===
    PREREQUISITE_RULE_STATUS.PENDING_APPROVAL
  ) {
    return {
      allowed: false,
      reason:
        REASONS.PREREQUISITE_RULE_PENDING_APPROVAL,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        qualificationLevel,
      ],
      majorRuleConfigured:
        rule.acceptedPreviousMajors !== null,
      majorRuleNeedsReview: true,
    };
  }

  if (
    rule.ruleStatus ===
    PREREQUISITE_RULE_STATUS.MANUAL_REVIEW
  ) {
    return {
      allowed: false,
      reason:
        REASONS.PREREQUISITE_RULE_MANUAL_REVIEW,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        qualificationLevel,
      ],
      majorRuleConfigured:
        rule.acceptedPreviousMajors !== null,
      majorRuleNeedsReview: true,
    };
  }

  if (
    !rule.requiresPreviousQualification
  ) {
    return {
      allowed: true,
      reason: REASONS.NO_PREREQUISITE,
      qualificationLevel,
      requiredLevel: null,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        qualificationLevel,
      ],
      majorRuleConfigured:
        rule.acceptedPreviousMajors !== null,
      majorRuleNeedsReview: false,
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(qualificationLevel);

  const requiredLevels =
    getRequiredLevels(rule);

  if (requiredLevels.length === 0) {
    return {
      allowed: false,
      reason:
        REASONS.UNKNOWN_QUALIFICATION,
      qualificationLevel,
      requiredLevel: null,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        qualificationLevel,
      ],
      majorRuleConfigured:
        rule.acceptedPreviousMajors !== null,
      majorRuleNeedsReview: true,
    };
  }

  const allCandidates = [];

  let majorRuleConfigured = true;
  let majorRuleNeedsReview = false;

  for (const requiredLevel of requiredLevels) {
    const candidates =
      getCandidatesForLevel(
        applicantApplications,
        requiredLevel
      );

    const majorResult = applyMajorRule(
      candidates,
      rule
    );

    if (!majorResult.majorRuleConfigured) {
      majorRuleConfigured = false;
    }

    if (majorResult.majorRuleNeedsReview) {
      majorRuleNeedsReview = true;
    }

    allCandidates.push(
      ...majorResult.eligible
    );
  }

  const uniqueCandidates = Array.from(
    new Map(
      allCandidates.map(
        (application, index) => [
          application?.id ||
            application?.applicationId ||
            `${application?.qualificationKey}-${index}`,
          application,
        ]
      )
    ).values()
  );

  if (uniqueCandidates.length === 0) {
    return {
      allowed: false,
      reason:
        REASONS.NO_ELIGIBLE_PREVIOUS_QUALIFICATION,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      requiredLevels,
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        qualificationLevel,
        ...requiredLevels,
      ],
      majorRuleConfigured,
      majorRuleNeedsReview,
      majorMismatch:
        applicantApplications.some(
          (application) =>
            requiredLevels.includes(
              application?.qualificationKey
            ) && isApproved(application)
        ),
    };
  }

  /*
   * For SINGLE_LEVEL the direct prerequisite
   * is enough.
   */
  if (
    rule.prerequisiteMode ===
    PREREQUISITE_MODES.SINGLE_LEVEL
  ) {
    return {
      allowed: true,
      reason: REASONS.ELIGIBLE,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      requiredLevels,
      eligiblePreviousQualifications:
        uniqueCandidates,
      prerequisiteChain: [
        qualificationLevel,
        ...requiredLevels,
      ],
      majorRuleConfigured,
      majorRuleNeedsReview,
    };
  }

  /*
   * For CHAIN we continue recursively through
   * the prerequisite levels.
   */
  if (
    rule.prerequisiteMode ===
      PREREQUISITE_MODES.CHAIN &&
    rule.inheritPreviousRequirements
  ) {
    const inheritedResults = [];

    for (const candidate of uniqueCandidates) {
      const candidateLevel =
        candidate?.qualificationKey;

      if (!candidateLevel) {
        continue;
      }

      const inheritedResult =
        resolvePrerequisiteLevel({
          applicantApplications,
          qualificationLevel:
            candidateLevel,
          visited: nextVisited,
        });

      inheritedResults.push({
        qualification: candidate,
        prerequisiteResult:
          inheritedResult,
      });
    }

    const failedInherited =
      inheritedResults.find(
        (result) =>
          result.prerequisiteResult
            ?.allowed === false &&
          result.prerequisiteResult
            ?.reason !==
            REASONS.NO_PREREQUISITE
      );

    /*
     * If an inherited prerequisite rule is
     * pending/manual review, we do not falsely
     * approve the chain.
     */
    if (failedInherited) {
      return {
        allowed: false,
        reason:
          failedInherited.prerequisiteResult
            .reason,
        qualificationLevel,
        requiredLevel:
          rule.requiredLevel || null,
        requiredLevels,
        eligiblePreviousQualifications:
          uniqueCandidates,
        prerequisiteChain: [
          qualificationLevel,
          ...requiredLevels,
          ...(
            failedInherited
              .prerequisiteResult
              .prerequisiteChain || []
          ),
        ],
        majorRuleConfigured,
        majorRuleNeedsReview: true,
        inheritedResults,
      };
    }

    return {
      allowed: true,
      reason: REASONS.ELIGIBLE,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      requiredLevels,
      eligiblePreviousQualifications:
        uniqueCandidates,
      prerequisiteChain: [
        qualificationLevel,
        ...requiredLevels,
      ],
      majorRuleConfigured,
      majorRuleNeedsReview,
      inheritedResults,
    };
  }

  /*
   * MULTIPLE_PATHS is intentionally not
   * automatically approved while its legal
   * rules are still pending.
   */
  if (
    rule.prerequisiteMode ===
    PREREQUISITE_MODES.MULTIPLE_PATHS
  ) {
    return {
      allowed: false,
      reason:
        REASONS.PREREQUISITE_RULE_PENDING_APPROVAL,
      qualificationLevel,
      requiredLevel:
        rule.requiredLevel || null,
      requiredLevels,
      eligiblePreviousQualifications:
        uniqueCandidates,
      prerequisiteChain: [
        qualificationLevel,
        ...requiredLevels,
      ],
      majorRuleConfigured,
      majorRuleNeedsReview: true,
    };
  }

  return {
    allowed: true,
    reason: REASONS.ELIGIBLE,
    qualificationLevel,
    requiredLevel:
      rule.requiredLevel || null,
    requiredLevels,
    eligiblePreviousQualifications:
      uniqueCandidates,
    prerequisiteChain: [
      qualificationLevel,
      ...requiredLevels,
    ],
    majorRuleConfigured,
    majorRuleNeedsReview,
  };
}

export function getEligiblePreviousQualifications({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  const applicantApplications =
    getApplicantQualifications(
      applications,
      ownerUserId
    );

  const result =
    resolvePrerequisiteLevel({
      applicantApplications,
      qualificationLevel:
        targetQualificationType,
      visited: new Set(),
    });

  return result
    .eligiblePreviousQualifications || [];
}

export function checkQualificationEligibility({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  if (!targetQualificationType) {
    return {
      allowed: false,
      reason: REASONS.UNKNOWN_QUALIFICATION,
      requiredLevel: null,
      requiredLevels: [],
      eligiblePreviousQualifications: [],
      prerequisiteChain: [],
      majorRuleConfigured: false,
      majorRuleNeedsReview: true,
    };
  }

  const rule =
    getQualificationPrerequisite(
      targetQualificationType
    );

  /*
   * Secondary has no prerequisite.
   */
  if (
    targetQualificationType ===
    QUALIFICATION_TYPES.SECONDARY
  ) {
    return {
      allowed: true,
      reason: REASONS.NO_PREREQUISITE,
      requiredLevel: null,
      requiredLevels: [],
      eligiblePreviousQualifications: [],
      prerequisiteChain: [
        targetQualificationType,
      ],
      majorRuleConfigured: true,
      majorRuleNeedsReview: false,
    };
  }

  const applicantApplications =
    getApplicantQualifications(
      applications,
      ownerUserId
    );

  const result =
    resolvePrerequisiteLevel({
      applicantApplications,
      qualificationLevel:
        targetQualificationType,
      visited: new Set(),
    });

  return {
    allowed: Boolean(result.allowed),
    reason: result.reason,
    requiredLevel:
      result.requiredLevel ||
      rule.requiredLevel ||
      null,
    requiredLevels:
      result.requiredLevels ||
      getRequiredLevels(rule),
    eligiblePreviousQualifications:
      result.eligiblePreviousQualifications ||
      [],
    prerequisiteChain:
      result.prerequisiteChain || [
        targetQualificationType,
      ],
    majorRuleConfigured:
      Boolean(
        result.majorRuleConfigured
      ),
    majorRuleNeedsReview:
      Boolean(
        result.majorRuleNeedsReview
      ),
    inheritedResults:
      result.inheritedResults || [],
  };
}

export function getPrerequisiteLabel(
  qualificationType
) {
  const rule =
    getQualificationPrerequisite(
      qualificationType
    );

  return rule.requiredLevel || null;
}

export function resolveQualificationPrerequisites({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  const applicantApplications =
    getApplicantQualifications(
      applications,
      ownerUserId
    );

  return resolvePrerequisiteLevel({
    applicantApplications,
    qualificationLevel:
      targetQualificationType,
    visited: new Set(),
  });
}

