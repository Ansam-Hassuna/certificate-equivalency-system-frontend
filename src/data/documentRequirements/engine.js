import { DOCUMENT_REQUIREMENTS } from "./requirements";
import { REQUIREMENT_TYPES } from "./constants";

const matchesQualification = (requirement, qualificationType) =>
  requirement.qualificationTypes === "all" ||
  requirement.qualificationTypes.includes(qualificationType);

const conditionIsMet = (requirement, caseData = {}) =>
  !requirement.condition || Boolean(caseData[requirement.condition]);

export function getRequirementsForRequest({ qualificationType, caseData = {} } = {}) {
  if (!qualificationType) return [];

  return DOCUMENT_REQUIREMENTS
    .filter((r) => matchesQualification(r, qualificationType))
    .filter((r) =>
      r.type === REQUIREMENT_TYPES.CONDITIONAL
        ? conditionIsMet(r, caseData)
        : true
    );
}

export function getRequiredRequirements({ qualificationType, caseData = {} } = {}) {
  return getRequirementsForRequest({ qualificationType, caseData }).filter((r) => r.required);
}

export function validateDocuments({ requirements = [], uploadedDocuments = [] } = {}) {
  const uploadedIds = new Set(
    uploadedDocuments
      .filter((d) => d && d.status !== "rejected")
      .map((d) => d.requirementId)
  );

  const missing = requirements.filter((r) => r.required && !uploadedIds.has(r.id));

  return {
    valid: missing.length === 0,
    missing,
    uploadedCount: requirements.filter((r) => r.required && uploadedIds.has(r.id)).length,
    requiredCount: requirements.filter((r) => r.required).length,
  };
}

export function addAdditionalRequirement({ requirements = [], requirement } = {}) {
  if (!requirement?.id) return requirements;
  return [
    ...requirements,
    {
      ...requirement,
      type: REQUIREMENT_TYPES.ADDITIONAL,
      required: requirement.required !== false,
    },
  ];
}
