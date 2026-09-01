export const INQUIRY_ROWS = [
  {
    id: "INQ-2026-001",
    requestId: "EQ-2026-00125",
    institution: "جامعة خارجية",
    institutionEn: "Foreign university",
    subject: "التحقق من صحة الشهادة",
    subjectEn: "Credential authenticity verification",
    state: "WAITING_RESPONSE",
    sentAt: "2026-08-20",
  },
  {
    id: "INQ-2026-002",
    requestId: "EQ-2026-00131",
    institution: "جامعة محلية",
    institutionEn: "Local university",
    subject: "التحقق من المؤسسة التعليمية",
    subjectEn: "Educational institution verification",
    state: "RESPONSE_RECEIVED",
    sentAt: "2026-08-18",
    response: "تم استلام الرد وتوثيقه.",
    responseEn: "The response was received and documented.",
  },
];

export const COMMITTEE_ROWS = [
  {
    id: "EQ-2026-00126",
    applicant: "مقدم طلب 3",
    applicantEn: "Applicant 3",
    qualification: "دكتوراه",
    qualificationEn: "PhD",
    committeeType: "SPECIALIZED",
    state: "QUEUED",
    priority: 1,
    sessionCode: "",
    sessionDate: "",
    order: "",
  },
  {
    id: "EQ-2026-00135",
    applicant: "مقدم طلب 8",
    applicantEn: "Applicant 8",
    qualification: "بكالوريوس",
    qualificationEn: "Bachelor",
    committeeType: "UNIVERSITY",
    state: "IN_SESSION",
    priority: 2,
    sessionCode: "SESSION-TECH-01",
    sessionDate: "2026-08-25",
    order: "1",
  },
];

export const STATUS_LABELS = {
  WAITING_RESPONSE: { ar: "بانتظار الرد", en: "Awaiting response" },
  FOLLOW_UP: { ar: "تحتاج متابعة", en: "Follow-up required" },
  RESPONSE_RECEIVED: { ar: "ورد الرد", en: "Response received" },
  QUEUED: { ar: "ضمن قائمة اللجنة", en: "Queued for committee" },
  IN_SESSION: { ar: "قيد المناقشة", en: "In session" },
};
