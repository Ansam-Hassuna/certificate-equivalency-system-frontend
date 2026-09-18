export const PREVIOUS_QUALIFICATION_SOURCES = Object.freeze({
  EXISTING_APPROVED_RECORD: "existing_approved_record",
  EXTERNAL_RECORD: "external_record",
  SAME_APPLICATION: "same_application",
});

export const PREVIOUS_QUALIFICATION_STATUSES = Object.freeze({
  UNKNOWN: "unknown",
  PENDING_VERIFICATION: "pending_verification",
  VERIFIED: "verified",
  REJECTED: "rejected",
});

export function createPreviousQualification(overrides = {}) {
  return {
    id: null,

    source:
      PREVIOUS_QUALIFICATION_SOURCES.EXTERNAL_RECORD,

    status:
      PREVIOUS_QUALIFICATION_STATUSES.UNKNOWN,

    qualificationType: "",
    qualificationTitle: "",

    origin: "",
    country: "",
    institution: "",
    institutionType: "",

    specialization: "",

    enrollmentDate: "",
    completionDate: "",
    graduationDate: "",

    studyMode: "",
    studyPath: "",

    previousQualificationId: null,

    linkedApplicationId: null,

    documents: [],

    verificationNotes: "",

    ...overrides,
  };
}

