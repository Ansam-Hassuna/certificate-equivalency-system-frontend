import {
  QUALIFICATION_TYPES,
} from "../../data/documentRequirements";

import {
  getQualificationPrerequisite,
} from "./qualificationRules";

const APPROVED_STATUS = "APPROVED";

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

export function getEligiblePreviousQualifications({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  const rule =
    getQualificationPrerequisite(
      targetQualificationType
    );

  if (!rule.requiresPreviousQualification) {
    return [];
  }

  const applicantApplications =
    getApplicantQualifications(
      applications,
      ownerUserId
    );

  const candidates =
    applicantApplications.filter(
      (application) =>
        application?.qualificationKey ===
          rule.requiredLevel &&
        isApproved(application)
    );

  // تخصصات المؤهل السابق لم يتم اعتماد قواعدها بعد.
  // في هذه المرحلة نرجع كل المؤهلات المعتمدة
  // من المستوى المطلوب، ونحتفظ بمعلومة أن
  // مطابقة التخصص لم تعتمد بعد.
  if (
    rule.acceptedPreviousMajors === null
  ) {
    return candidates.map(
      (application) => ({
        ...application,
        majorRuleConfigured: false,
      })
    );
  }

  const allowedMajors =
    rule.acceptedPreviousMajors.map(
      normalizeValue
    );

  return candidates.filter(
    (application) =>
      allowedMajors.includes(
        normalizeValue(
          application.specialization
        )
      )
  );
}

export function checkQualificationEligibility({
  applications = [],
  ownerUserId,
  targetQualificationType,
}) {
  if (
    targetQualificationType ===
    QUALIFICATION_TYPES.SECONDARY
  ) {
    return {
      allowed: true,
      reason: "NO_PREREQUISITE",
      requiredLevel: null,
      eligiblePreviousQualifications: [],
      majorRuleConfigured: true,
    };
  }

  const rule =
    getQualificationPrerequisite(
      targetQualificationType
    );

  const eligiblePreviousQualifications =
    getEligiblePreviousQualifications({
      applications,
      ownerUserId,
      targetQualificationType,
    });

  if (
    eligiblePreviousQualifications.length === 0
  ) {
    return {
      allowed: false,
      reason: "NO_ELIGIBLE_PREVIOUS_QUALIFICATION",
      requiredLevel: rule.requiredLevel,
      eligiblePreviousQualifications: [],
      majorRuleConfigured:
        rule.acceptedPreviousMajors !== null,
    };
  }

  return {
    allowed: true,
    reason: "ELIGIBLE",
    requiredLevel: rule.requiredLevel,
    eligiblePreviousQualifications,
    majorRuleConfigured:
      rule.acceptedPreviousMajors !== null,
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
