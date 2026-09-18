export const LEGAL_RULE_TRIGGERS = Object.freeze({
  ENROLLMENT: "enrollment",
  REGISTRATION: "registration",
  ACTUAL_ATTENDANCE: "actual_attendance",
  COMPLETION: "completion",
  GRADUATION: "graduation",
  APPLICATION_DATE: "application_date",
});

export const LEGAL_RULE_STATUS = Object.freeze({
  NOT_EVALUATED: "not_evaluated",
  DETERMINED: "determined",
  NO_APPLICABLE_RULE: "no_applicable_rule",
  CONFLICT: "conflict",
  MANUAL_REVIEW: "manual_review",
});

export const RULE_SCOPE = Object.freeze({
  EQUIVALENCY: "equivalency",
  ADMISSION: "admission",
  BRIDGING: "bridging",
  DOCUMENTS: "documents",
  FEES: "fees",
});
