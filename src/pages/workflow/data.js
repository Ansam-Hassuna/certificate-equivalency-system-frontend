export const REQUEST_ROWS = [
  { id:"EQ-2026-00124", ownerUserId:"mock-user-011", applicant:"مقدم الطلب", applicantEn:"Applicant", qualification:"ماجستير", qualificationEn:"Master", qualificationKey:"master", university:"جامعة خارجية", universityEn:"Foreign university", status:"قيد الدراسة", statusEn:"Under review", statusKey:"UNDER_REVIEW", date:"2026-08-20", archived:false },
  { id:"EQ-2026-00125", ownerUserId:"mock-user-002", applicant:"مقدم طلب 2", applicantEn:"Applicant 2", qualification:"بكالوريوس", qualificationEn:"Bachelor", qualificationKey:"bachelor", university:"جامعة خارجية", universityEn:"Foreign university", status:"بانتظار الاستفسار", statusEn:"Awaiting inquiry", statusKey:"AWAITING_INQUIRY", date:"2026-08-19", archived:false },
  { id:"EQ-2026-00126", ownerUserId:"mock-user-003", applicant:"مقدم طلب 3", applicantEn:"Applicant 3", qualification:"دكتوراه", qualificationEn:"PhD", qualificationKey:"phd", university:"جامعة خارجية", universityEn:"Foreign university", status:"لدى اللجنة", statusEn:"With committee", statusKey:"COMMITTEE", date:"2026-08-18", archived:false },
  { id:"EQ-2026-00127", ownerUserId:"mock-user-004", applicant:"مقدم طلب 4", applicantEn:"Applicant 4", qualification:"بكالوريوس", qualificationEn:"Bachelor", qualificationKey:"bachelor", university:"جامعة خارجية", universityEn:"Foreign university", status:"مسودة للمراجعة", statusEn:"Draft for review", statusKey:"DRAFT_REVIEW", date:"2026-08-17", archived:false },
];

// Demonstration archive records. They remain searchable but are hidden from active lists by default.
export const ARCHIVED_REQUEST_ROWS = [
  { id:"EQ-2024-00871", ownerUserId:"mock-user-005", applicant:"أحمد محمود", applicantEn:"Ahmad Mahmoud", qualification:"ماجستير", qualificationEn:"Master", qualificationKey:"master", university:"جامعة خارجية", universityEn:"Foreign university", status:"مكتمل", statusEn:"Completed", statusKey:"COMPLETED", date:"2024-11-14", archived:true },
  { id:"EQ-2023-00642", ownerUserId:"mock-user-006", applicant:"سارة علي", applicantEn:"Sara Ali", qualification:"بكالوريوس", qualificationEn:"Bachelor", qualificationKey:"bachelor", university:"جامعة خارجية", universityEn:"Foreign university", status:"مكتمل", statusEn:"Completed", statusKey:"COMPLETED", date:"2023-08-03", archived:true },
  { id:"EQ-2022-00419", ownerUserId:"mock-user-007", applicant:"محمد حسن", applicantEn:"Mohammad Hassan", qualification:"دكتوراه", qualificationEn:"PhD", qualificationKey:"phd", university:"جامعة خارجية", universityEn:"Foreign university", status:"مكتمل", statusEn:"Completed", statusKey:"COMPLETED", date:"2022-05-22", archived:true },
];

export const ALL_REQUEST_ROWS = [...REQUEST_ROWS, ...ARCHIVED_REQUEST_ROWS];

export const getLocalizedRequestRows = (language = "ar", rows = ALL_REQUEST_ROWS) =>
  rows.map((row) => ({
    ...row,
    applicant: language === "ar" ? row.applicant : row.applicantEn,
    qualification: language === "ar" ? row.qualification : row.qualificationEn,
    university: language === "ar" ? row.university : row.universityEn,
    status: language === "ar" ? row.status : row.statusEn,
  }));

export const WORKFLOW_STEPS = [
  "إنشاء الطلب وتعبئة البيانات",
  "رفع الوثائق الإلكترونية",
  "تأكيد الدفع",
  "تسليم وتدقيق الوثائق الورقية",
  "التحقق من المؤسسة وصحة الشهادة عند الحاجة",
  "دراسة الطلب واللجان عند الحاجة",
  "المسودة والمراجعة",
  "الوثيقة النهائية والتسليم",
];

