export const SPECIALIZATIONS_BY_INSTITUTION = Object.freeze({
  birzeit: [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "software-engineering",
      labelAr: "هندسة البرمجيات",
      labelEn: "Software Engineering",
    },
    {
      value: "business-administration",
      labelAr: "إدارة الأعمال",
      labelEn: "Business Administration",
    },
  ],

  "an-najah": [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "software-engineering",
      labelAr: "هندسة البرمجيات",
      labelEn: "Software Engineering",
    },
    {
      value: "information-systems",
      labelAr: "نظم المعلومات",
      labelEn: "Information Systems",
    },
  ],

  ptuk: [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "information-technology",
      labelAr: "تكنولوجيا المعلومات",
      labelEn: "Information Technology",
    },
    {
      value: "software-engineering",
      labelAr: "هندسة البرمجيات",
      labelEn: "Software Engineering",
    },
  ],

  jordan: [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "information-systems",
      labelAr: "نظم المعلومات",
      labelEn: "Information Systems",
    },
    {
      value: "business-administration",
      labelAr: "إدارة الأعمال",
      labelEn: "Business Administration",
    },
  ],

  yarmouk: [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "software-engineering",
      labelAr: "هندسة البرمجيات",
      labelEn: "Software Engineering",
    },
    {
      value: "information-technology",
      labelAr: "تكنولوجيا المعلومات",
      labelEn: "Information Technology",
    },
  ],

  cairo: [
    {
      value: "computer-science",
      labelAr: "علوم الحاسوب",
      labelEn: "Computer Science",
    },
    {
      value: "information-systems",
      labelAr: "نظم المعلومات",
      labelEn: "Information Systems",
    },
  ],
});

export function getSpecializationOptions(
  institution,
  language = "ar"
) {
  return (
    SPECIALIZATIONS_BY_INSTITUTION[institution] || []
  ).map((specialization) => ({
    value: specialization.value,
    label:
      language === "ar"
        ? specialization.labelAr
        : specialization.labelEn,
  }));
}
