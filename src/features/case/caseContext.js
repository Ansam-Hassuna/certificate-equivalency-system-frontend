import {
  SERVICE_TYPES,
  CASE_TYPES,
} from "../../data/case/serviceConstants";

export function createEmptyCaseContext() {
  return {
    service: {
      type: SERVICE_TYPES.EQUIVALENCY,
      caseType: CASE_TYPES.STANDARD,
    },

    targetQualification: {
      type: "",
      title: "",
      origin: "",
    },

    certificate: {
      title: "",
      origin: "",
      issuingCountry: "",
      institutionCountry: "",
      institutionType: "",
      educationSystem: "",
      specialization: "",
    },

    study: {
      studyCountry: "",
      studyMode: "",
      studyPath: "",

      enrollmentDate: "",
      registrationDate: "",
      actualAttendanceStartDate: "",
      actualAttendanceEndDate: "",
      completionDate: "",
      graduationDate: "",
    },

    previousQualifications: [],

    caseFlags: [],

    legal: {
      equivalencyRuleId: null,
      admissionRuleId: null,
      bridgingRuleId: null,
      transitionRuleId: null,

      status: "not_evaluated",
    },

    documents: {
      requirementsVersionId: null,
      missing: [],
      uploaded: [],
      rejected: [],
    },

    fees: {
      ruleId: null,
      amount: null,
      currency: null,
      status: "not_evaluated",
    },

    workflow: {
      currentStage: "draft",
      assignedEmployeeId: null,
      assignedTeamId: null,
      assignedCommitteeId: null,
    },
  };
}

export function mergeCaseContext(
  baseContext,
  overrides = {}
) {
  return {
    ...baseContext,
    ...overrides,

    service: {
      ...baseContext.service,
      ...overrides.service,
    },

    targetQualification: {
      ...baseContext.targetQualification,
      ...overrides.targetQualification,
    },

    certificate: {
      ...baseContext.certificate,
      ...overrides.certificate,
    },

    study: {
      ...baseContext.study,
      ...overrides.study,
    },

    legal: {
      ...baseContext.legal,
      ...overrides.legal,
    },

    documents: {
      ...baseContext.documents,
      ...overrides.documents,
    },

    fees: {
      ...baseContext.fees,
      ...overrides.fees,
    },

    workflow: {
      ...baseContext.workflow,
      ...overrides.workflow,
    },
  };
}
