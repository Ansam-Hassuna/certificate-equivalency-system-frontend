import {
  DOCUMENT_REQUIREMENTS,
  LOCAL_DOCUMENT_REQUIREMENTS,
} from "./requirements";
import { REQUIREMENT_TYPES } from "./constants";
import { requiresEquivalencyForCountry } from "../legalRules/equivalencyRules";

const matchesQualification = (
  requirement,
  qualificationType
) =>
  requirement.qualificationTypes === "all" ||
  requirement.qualificationTypes.includes(
    qualificationType
  );

const conditionIsMet = (
  requirement,
  caseData = {}
) =>
  !requirement.condition ||
  Boolean(caseData[requirement.condition]);

export function getRequirementsForRequest({
  qualificationType,
  country = "",
  caseData = {},
} = {}) {
  if (!qualificationType) {
    return [];
  }

  const requiresEquivalency =
    requiresEquivalencyForCountry(country);

  const sourceRequirements =
    requiresEquivalency
      ? DOCUMENT_REQUIREMENTS
      : LOCAL_DOCUMENT_REQUIREMENTS;

  return sourceRequirements
    .filter((requirement) =>
      matchesQualification(
        requirement,
        qualificationType
      )
    )
    .filter((requirement) =>
      requirement.type ===
      REQUIREMENT_TYPES.CONDITIONAL
        ? conditionIsMet(
            requirement,
            caseData
          )
        : true
    );
}

export function getRequiredRequirements({
  qualificationType,
  country = "",
  caseData = {},
} = {}) {
  return getRequirementsForRequest({
    qualificationType,
    country,
    caseData,
  }).filter(
    (requirement) =>
      requirement.required
  );
}

export function validateDocuments({
  requirements = [],
  uploadedDocuments = [],
} = {}) {
  const uploadedIds = new Set(
    uploadedDocuments
      .filter(
        (document) =>
          document &&
          document.status !== "rejected"
      )
      .map(
        (document) =>
          document.requirementId
      )
  );

  const missing =
    requirements.filter(
      (requirement) =>
        requirement.required &&
        !uploadedIds.has(
          requirement.id
        )
    );

  return {
    valid:
      missing.length === 0,
    missing,
    uploadedCount:
      requirements.filter(
        (requirement) =>
          requirement.required &&
          uploadedIds.has(
            requirement.id
          )
      ).length,
    requiredCount:
      requirements.filter(
        (requirement) =>
          requirement.required
      ).length,
  };
}

export function addAdditionalRequirement({
  requirements = [],
  requirement,
} = {}) {
  if (!requirement?.id) {
    return requirements;
  }

  return [
    ...requirements,
    {
      ...requirement,
      type:
        REQUIREMENT_TYPES.ADDITIONAL,
      required:
        requirement.required !== false,
    },
  ];
}
