export const EQUIVALENCY_RULES = Object.freeze({
  LOCAL_COUNTRY: "palestine",

  /*
   * Frontend demo rule:
   * Palestinian qualifications do not enter
   * the external-equivalency workflow.
   *
   * Non-Palestinian qualifications do.
   *
   * This is a configurable application rule,
   * not a statement of official MOHE legal policy.
   */
  requiresEquivalency(country) {
    const normalized = String(country || "")
      .trim()
      .toLowerCase();

    if (!normalized) {
      return false;
    }

    return normalized !== this.LOCAL_COUNTRY;
  },
});

export function requiresEquivalencyForCountry(
  country
) {
  return EQUIVALENCY_RULES.requiresEquivalency(
    country
  );
}

export default EQUIVALENCY_RULES;
