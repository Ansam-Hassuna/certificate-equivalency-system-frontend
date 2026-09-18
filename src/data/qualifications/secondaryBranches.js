export const SECONDARY_BRANCHES = Object.freeze([
  {
    value: "scientific",
    labelAr: "الفرع العلمي",
    labelEn: "Scientific",
  },
  {
    value: "literary",
    labelAr: "الفرع الأدبي",
    labelEn: "Literary",
  },
  {
    value: "commercial",
    labelAr: "الفرع التجاري",
    labelEn: "Commercial",
  },
  {
    value: "industrial",
    labelAr: "الفرع الصناعي",
    labelEn: "Industrial",
  },
  {
    value: "agricultural",
    labelAr: "الفرع الزراعي",
    labelEn: "Agricultural",
  },
  {
    value: "religious",
    labelAr: "الفرع الشرعي",
    labelEn: "Religious",
  },
]);

export function getSecondaryBranchOptions(language = "ar") {
  return SECONDARY_BRANCHES.map((branch) => ({
    value: branch.value,
    label:
      language === "ar"
        ? branch.labelAr
        : branch.labelEn,
  }));
}
