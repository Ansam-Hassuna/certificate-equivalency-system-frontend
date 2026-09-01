export const REQUEST_STATUS_KEYS = [
  { value: "all", ar: "كل الحالات", en: "All statuses" },
  { value: "DRAFT_REVIEW", ar: "مسودة للمراجعة", en: "Draft for review" },
  { value: "UNDER_REVIEW", ar: "قيد الدراسة", en: "Under review" },
  { value: "AWAITING_INQUIRY", ar: "بانتظار الاستفسار", en: "Awaiting inquiry" },
  { value: "COMMITTEE", ar: "لدى اللجنة", en: "With committee" },
  { value: "COMPLETED", ar: "مكتمل", en: "Completed" },
  { value: "NOT_EQUIVALENT", ar: "غير معادل", en: "Not equivalent" },
];

export const QUALIFICATION_KEYS = [
  { value: "all", ar: "كل المؤهلات", en: "All qualifications" },
  { value: "secondary", ar: "ثانوية", en: "Secondary" },
  { value: "bachelor", ar: "بكالوريوس", en: "Bachelor" },
  { value: "master", ar: "ماجستير", en: "Master" },
  { value: "phd", ar: "دكتوراه", en: "PhD" },
];

export const isArchivedRequest = (row) => Boolean(row.archived);

export function requestMatchesFilters(row, { search = "", status = "all", qualification = "all", from = "", to = "" } = {}) {
  const query = String(search ?? "").trim().toLowerCase();
  const haystack = Object.values(row).map((value) => String(value ?? "").toLowerCase()).join(" ");
  if (query && !haystack.includes(query)) return false;
  if (status !== "all" && row.statusKey !== status) return false;
  if (qualification !== "all" && row.qualificationKey !== qualification) return false;
  if (from && row.date < from) return false;
  if (to && row.date > to) return false;
  return true;
}
