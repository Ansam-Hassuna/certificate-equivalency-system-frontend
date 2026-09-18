import {
  QUALIFICATION_TYPES,
} from "../../data/documentRequirements";

import {
  getStoredPreviousQualifications,
} from "./previousQualificationStore";

import {
  PREREQUISITE_RULE_STATUS,
  getQualificationPrerequisite,
  getStandardQualificationChain,
} from "./qualificationRules";

const APPROVED_STATUS = "APPROVED";

export const QUALIFICATION_ELIGIBILITY_REASONS =
  Object.freeze({
    NO_PREREQUISITE:
      "NO_PREREQUISITE",

    ELIGIBLE:
      "ELIGIBLE",

    MISSING_PREVIOUS_QUALIFICATION:
      "MISSING_PREVIOUS_QUALIFICATION",

    PENDING_VERIFICATION:
      "PENDING_VERIFICATION",

    PREREQUISITE_RULE_PENDING_APPROVAL:
      "PREREQUISITE_RULE_PENDING_APPROVAL",

    PREREQUISITE_RULE_MANUAL_REVIEW:
      "PREREQUISITE_RULE_MANUAL_REVIEW",

    MULTIPLE_CANDIDATES:
      "MULTIPLE_CANDIDATES",

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

function isApprovedQualification(
  qualification
) {
  const statusKey =
    String(
      qualification?.statusKey || ""
    )
      .trim()
      .toUpperCase();

  const status =
    String(
      qualification?.status || ""
    )
      .trim()
      .toLowerCase();

  const verificationStatus =
    String(
      qualification?.verificationStatus || ""
    )
      .trim()
      .toLowerCase();

  return (
    statusKey === APPROVED_STATUS ||
    status === "verified" ||
    verificationStatus === "verified"
  );
}

function isPendingVerification(
  qualification
) {
  const status =
    normalizeValue(
      qualification?.status
    );

  const verificationStatus =
    normalizeValue(
      qualification?.verificationStatus
    );

  return (
    status ===
      "pending_verification" ||
    verificationStatus ===
      "pending_verification"
  );
}

function normalizeApplicationQualification(
  application
) {
  return {
    ...application,

    id:
      application?.id ||
      application?.applicationId ||
      null,

    qualificationKey:
      application?.qualificationKey ||
      application?.qualificationType ||
      null,

    qualificationType:
      application?.qualificationType ||
      application?.qualificationKey ||
      null,

    previousQualificationId:
      application?.previousQualificationId ||
      null,

    prerequisiteSource:
      application?.prerequisiteSource ||
      "application_record",
  };
}

function normalizeExternalQualification(
  qualification
) {
  const qualificationType =
    qualification?.qualificationKey ||
    qualification?.qualificationType ||
    null;

  return {
    ...qualification,

    id:
      qualification?.id || null,

    qualificationKey:
      qualificationType,

    qualificationType,

    qualification:
      qualification?.qualificationTitle ||
      qualificationType ||
      "",

    qualificationEn:
      qualification?.qualificationTitle ||
      qualificationType ||
      "",

    university:
      qualification?.institution ||
      "",

    universityEn:
      qualification?.institution ||
      "",

    prerequisiteSource:
      qualification?.prerequisiteSource ||
      "external_record",

    previousQualificationId:
      qualification?.previousQualificationId ||
      null,

    verificationStatus:
      qualification?.verificationStatus ||
      (
        qualification?.status ===
        "verified"
          ? "verified"
          : ""
      ),

    statusKey:
      qualification?.statusKey ||
      (
        qualification?.status ===
        "verified"
          ? APPROVED_STATUS
          : ""
      ),

    specialization:
      qualification?.specialization ||
      "",
  };
}

function getApplicantQualifications(
  applications,
  ownerUserId
) {
  const applicationQualifications =
    Array.isArray(applications)
      ? applications
          .filter(
            (application) =>
              application?.ownerUserId ===
              ownerUserId
          )
          .map(
            normalizeApplicationQualification
          )
      : [];

  const externalQualifications =
    getStoredPreviousQualifications(
      ownerUserId
    ).map(
      normalizeExternalQualification
    );

  return [
    ...applicationQualifications,
    ...externalQualifications,
  ];
}

function getCandidatesForLevel(
  applicantQualifications,
  qualificationType
) {
  return applicantQualifications.filter(
    (qualification) =>
      (
        qualification?.qualificationKey ===
          qualificationType ||
        qualification?.qualificationType ===
          qualificationType
      ) &&
      isApprovedQualification(
        qualification
      )
  );
}

function getPendingCandidatesForLevel(
  applicantQualifications,
  qualificationType
) {
  return applicantQualifications.filter(
    (qualification) =>
      (
        qualification?.qualificationKey ===
          qualificationType ||
        qualification?.qualificationType ===
          qualificationType
      ) &&
      isPendingVerification(
        qualification
      )
  );
}

function uniqueQualifications(
  qualifications
) {
  const map = new Map();

  qualifications.forEach(
    (qualification, index) => {
      const id =
        qualification?.id ||
        `${qualification?.qualificationKey || "unknown"}-${index}`;

      if (!map.has(id)) {
        map.set(id, {
          ...qualification,
          candidateId: id,
        });
      }
    }
  );

  return Array.from(
    map.values()
  );
}

function createChainNode({
  qualificationType,
  qualification = null,
  status,
  required = true,
  source = null,
  previousQualificationId = null,
}) {
  return {
    qualificationType,
    qualification,
    status,
    required,
    source,
    qualificationId:
      qualification?.id || null,
    previousQualificationId:
      previousQualificationId ||
      qualification?.previousQualificationId ||
      null,
  };
}

function resolveRuleState(
  qualificationType
) {
  const rule =
    getQualificationPrerequisite(
      qualificationType
    );

  if (
    rule.ruleStatus ===
    PREREQUISITE_RULE_STATUS.PENDING_APPROVAL
  ) {
    return {
      ok: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .PREREQUISITE_RULE_PENDING_APPROVAL,
      rule,
    };
  }

  if (
    rule.ruleStatus ===
    PREREQUISITE_RULE_STATUS.MANUAL_REVIEW
  ) {
    return {
      ok: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .PREREQUISITE_RULE_MANUAL_REVIEW,
      rule,
    };
  }

  return {
    ok: true,
    reason: null,
    rule,
  };
}

function buildPrerequisiteLevels(
  applicantQualifications,
  requiredLevels
) {
  if (!Array.isArray(requiredLevels)) {
    return [];
  }

  return requiredLevels.map(
    (qualificationType) => {
      const verifiedCandidates =
        uniqueQualifications(
          getCandidatesForLevel(
            applicantQualifications,
            qualificationType
          )
        );

      const pendingCandidates =
        uniqueQualifications(
          getPendingCandidatesForLevel(
            applicantQualifications,
            qualificationType
          )
        );

      let status = "missing";
      let candidates = [];

      if (verifiedCandidates.length > 0) {
        status =
          verifiedCandidates.length > 1
            ? "multiple_verified"
            : "verified";

        candidates =
          verifiedCandidates;
      } else if (
        pendingCandidates.length > 0
      ) {
        status =
          "pending_verification";

        candidates =
          pendingCandidates;
      }

      return {
        qualificationType,
        status,
        required: true,
        candidates,
        candidateCount:
          candidates.length,
      };
    }
  );
}
function resolveQualificationChain({
  applicantQualifications,
  qualificationType,
  visited = new Set(),
}) {
  if (
    !qualificationType
  ) {
    return {
      allowed: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .UNKNOWN_QUALIFICATION,
      chain: [],
      directCandidates: [],
      missingPrerequisites: [],
      pendingPrerequisites: [],
      requiresManualReview: true,
    };
  }

  if (
    visited.has(
      qualificationType
    )
  ) {
    return {
      allowed: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .CIRCULAR_PREREQUISITE,
      chain: [],
      directCandidates: [],
      missingPrerequisites: [],
      pendingPrerequisites: [],
      requiresManualReview: true,
    };
  }

  const ruleState =
    resolveRuleState(
      qualificationType
    );

  if (!ruleState.ok) {
    return {
      allowed: false,
      reason: ruleState.reason,
      chain: [
        createChainNode({
          qualificationType,
          status: "rule_needs_review",
          required: false,
        }),
      ],
      directCandidates: [],
      missingPrerequisites: [],
      pendingPrerequisites: [],
      requiresManualReview: true,
    };
  }

  const chainLevels =
    getStandardQualificationChain(
      qualificationType
    );

  /*
   * This is the root level:
   * no academic prerequisite exists.
   */
  if (
    chainLevels.length === 0
  ) {
    return {
      allowed: true,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .NO_PREREQUISITE,
      chain: [
        createChainNode({
          qualificationType,
          status: "root",
          required: false,
        }),
      ],
      directCandidates: [],
      missingPrerequisites: [],
      pendingPrerequisites: [],
      requiresManualReview: false,
    };
  }

  const directLevel =
    chainLevels[0];

  const approvedCandidates =
    uniqueQualifications(
      getCandidatesForLevel(
        applicantQualifications,
        directLevel
      )
    );

  const pendingCandidates =
    uniqueQualifications(
      getPendingCandidatesForLevel(
        applicantQualifications,
        directLevel
      )
    );

  if (
    approvedCandidates.length === 0 &&
    pendingCandidates.length === 0
  ) {
    return {
      allowed: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .MISSING_PREVIOUS_QUALIFICATION,

      chain: [
        createChainNode({
          qualificationType,
          status: "current",
          required: false,
        }),

        createChainNode({
          qualificationType:
            directLevel,
          status: "missing",
          required: true,
        }),
      ],

      directCandidates: [],
      missingPrerequisites: [
        directLevel,
      ],
      pendingPrerequisites: [],
      requiresManualReview: false,

      requiredLevel:
        directLevel,

      requiredLevels:
        chainLevels,
    };
  }

  if (
    approvedCandidates.length === 0 &&
    pendingCandidates.length > 0
  ) {
    return {
      allowed: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .PENDING_VERIFICATION,

      chain: [
        createChainNode({
          qualificationType,
          status: "current",
          required: false,
        }),

        ...pendingCandidates.map(
          (candidate) =>
            createChainNode({
              qualificationType:
                directLevel,
              qualification:
                candidate,
              status:
                "pending_verification",
              required: true,
              source:
                candidate?.prerequisiteSource,
              previousQualificationId:
                candidate?.previousQualificationId,
            })
        ),
      ],

      directCandidates:
        pendingCandidates,

      missingPrerequisites: [],

      pendingPrerequisites: [
        directLevel,
      ],

      requiresManualReview: false,

      requiredLevel:
        directLevel,

      requiredLevels:
        chainLevels,
    };
  }

  /*
   * More than one verified candidate exists.
   * The current UI already supports selection.
   */
  if (
    approvedCandidates.length > 1
  ) {
    return {
      allowed: true,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .MULTIPLE_CANDIDATES,

      chain: [
        createChainNode({
          qualificationType,
          status: "current",
          required: false,
        }),

        ...approvedCandidates.map(
          (candidate) =>
            createChainNode({
              qualificationType:
                directLevel,
              qualification:
                candidate,
              status: "verified",
              required: true,
              source:
                candidate?.prerequisiteSource,
              previousQualificationId:
                candidate?.previousQualificationId,
            })
        ),
      ],

      directCandidates:
        approvedCandidates,

      missingPrerequisites: [],

      pendingPrerequisites: [],

      requiresManualReview: false,

      requiredLevel:
        directLevel,

      requiredLevels:
        chainLevels,
    };
  }

  const directCandidate =
    approvedCandidates[0];

  const nextVisited =
    new Set(visited);

  nextVisited.add(
    qualificationType
  );

  /*
   * Resolve the chain of the direct
   * prerequisite.
   *
   * This does not require that the user
   * submit another application. It follows
   * the qualification's own previous link
   * when available.
   */
  const linkedPreviousId =
    directCandidate?.previousQualificationId ||
    null;

  let inheritedResult = null;

  if (
    linkedPreviousId
  ) {
    const linkedPrevious =
      applicantQualifications.find(
        (qualification) =>
          qualification?.id ===
          linkedPreviousId
      );

    if (
      linkedPrevious
    ) {
      inheritedResult =
        resolveQualificationChain({
          applicantQualifications,
          qualificationType:
            linkedPrevious.qualificationType ||
            linkedPrevious.qualificationKey,
          visited:
            nextVisited,
        });
    }
  } else {
    /*
     * A real academic chain must follow the
     * explicit previousQualificationId stored
     * on the prerequisite record.
     *
     * We must not attach an arbitrary Secondary
     * to an otherwise valid Bachelor.
     *
     * If the direct prerequisite has no link,
     * the chain is incomplete.
     */
    return {
      allowed: false,
      reason: "INCOMPLETE_CHAIN",

      chain: [
        createChainNode({
          qualificationType,
          status: "current",
          required: false,
        }),

        directNode,
      ],

      directCandidates:
        approvedCandidates,

      missingPrerequisites: [],
      pendingPrerequisites: [],

      requiresManualReview: false,

      incompletePrerequisites: [
        directLevel,
      ],

      requiredLevel:
        directLevel,

      requiredLevels:
        chainLevels,
    };
  }

  const directNode =
    createChainNode({
      qualificationType:
        directLevel,
      qualification:
        directCandidate,
      status: "verified",
      required: true,
      source:
        directCandidate?.prerequisiteSource,
      previousQualificationId:
        directCandidate?.previousQualificationId,
    });

  if (!inheritedResult) {
    return {
      allowed: true,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .ELIGIBLE,

      chain: [
        createChainNode({
          qualificationType,
          status: "current",
          required: false,
        }),
        directNode,
      ],

      directCandidates:
        approvedCandidates,

      missingPrerequisites: [],

      pendingPrerequisites: [],

      requiresManualReview: false,

      requiredLevel:
        directLevel,

      requiredLevels:
        chainLevels,
    };
  }

  return {
    allowed:
      inheritedResult.allowed,

    reason:
      inheritedResult.allowed
        ? QUALIFICATION_ELIGIBILITY_REASONS
            .ELIGIBLE
        : inheritedResult.reason,

    chain: [
      createChainNode({
        qualificationType,
        status: "current",
        required: false,
      }),

      directNode,

      ...(inheritedResult.chain || [])
        .filter(
          (node) =>
            node?.qualificationType !==
            qualificationType
        ),
    ],

    directCandidates:
      approvedCandidates,

    missingPrerequisites:
      inheritedResult.missingPrerequisites ||
      [],

    pendingPrerequisites:
      inheritedResult.pendingPrerequisites ||
      [],

    requiresManualReview:
      Boolean(
        inheritedResult.requiresManualReview
      ),

    requiredLevel:
      directLevel,

    requiredLevels:
      chainLevels,

    inheritedResult,
  };
}

export function checkQualificationEligibility({
  applications = [],
  ownerUserId,
  targetQualificationType,
  previousQualificationId = null,
  externalPreviousQualification = null,
  externalPreviousQualificationPrerequisite = null,
}) {
  if (
    !targetQualificationType
  ) {
    return {
      allowed: false,
      reason:
        QUALIFICATION_ELIGIBILITY_REASONS
          .UNKNOWN_QUALIFICATION,
      requiredLevel: null,
      requiredLevels: [],
      eligiblePreviousQualifications: [],
      prerequisiteChain: [],
      chain: [],
      missingPrerequisites: [],
      pendingPrerequisites: [],
      requiresManualReview: true,
    };
  }

  const applicantQualifications =
    getApplicantQualifications(
      applications,
      ownerUserId
    );

  const result =
    resolveQualificationChain({
      applicantQualifications,
      qualificationType:
        targetQualificationType,
      visited: new Set(),
    });

  const prerequisiteLevels =
    buildPrerequisiteLevels(
      applicantQualifications,
      result.requiredLevels || []
    );

  return {
    allowed:
      Boolean(result.allowed),

    reason:
      result.reason,

    requiredLevel:
      result.requiredLevel || null,

    requiredLevels:
      result.requiredLevels || [],

    prerequisiteLevels,

    eligiblePreviousQualifications:
      result.directCandidates || [],

    prerequisiteChain:
      result.chain || [],

    chain:
      result.chain || [],

    missingPrerequisites:
      result.missingPrerequisites || [],

    pendingPrerequisites:
      result.pendingPrerequisites || [],

    requiresManualReview:
      Boolean(
        result.requiresManualReview
      ),

    inheritedResults:
      result.inheritedResult
        ? [result.inheritedResult]
        : [],
  };
}

export function getEligiblePreviousQualifications({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  const result =
    checkQualificationEligibility({
      applications,
      ownerUserId,
      targetQualificationType,
    });

  return (
    result.eligiblePreviousQualifications ||
    []
  );
}

export function resolveQualificationPrerequisites({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  return checkQualificationEligibility({
    applications,
    ownerUserId,
    targetQualificationType,
  });
}

export function getPrerequisiteLabel(
  qualificationType
) {
  const rule =
    getQualificationPrerequisite(
      qualificationType
    );

  return (
    rule.requiredLevel || null
  );
}






