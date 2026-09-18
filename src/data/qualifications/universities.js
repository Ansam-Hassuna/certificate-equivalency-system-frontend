export const UNIVERSITIES = Object.freeze([
  {
    value: "birzeit",
    labelAr: "جامعة بيرزيت",
    labelEn: "Birzeit University",
    country: "palestine",
  },
  {
    value: "an-najah",
    labelAr: "جامعة النجاح الوطنية",
    labelEn: "An-Najah National University",
    country: "palestine",
  },
  {
    value: "ptuk",
    labelAr: "جامعة فلسطين التقنية – خضوري",
    labelEn: "Palestine Technical University – Kadoorie",
    country: "palestine",
  },
  {
    value: "jordan",
    labelAr: "الجامعة الأردنية",
    labelEn: "University of Jordan",
    country: "jordan",
  },
  {
    value: "yarmouk",
    labelAr: "جامعة اليرموك",
    labelEn: "Yarmouk University",
    country: "jordan",
  },
  {
    value: "cairo",
    labelAr: "جامعة القاهرة",
    labelEn: "Cairo University",
    country: "egypt",
  },
]);

export function getUniversityOptions(language = "ar") {
  return UNIVERSITIES.map((university) => ({
    value: university.value,
    label:
      language === "ar"
        ? university.labelAr
        : university.labelEn,
    country: university.country,
  }));
}
