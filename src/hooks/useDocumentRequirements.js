import { useMemo } from "react";
import { getRequirementsForRequest, validateDocuments } from "../data/documentRequirements";

export function useDocumentRequirements({
  qualificationType,
  country = "",
  caseData = {},
  uploadedDocuments = [],
} = {}) {
  const requirements = useMemo(
    () =>
      getRequirementsForRequest({
        qualificationType,
        country,
        caseData,
      }),
    [qualificationType, country, caseData]
  );

  const validation = useMemo(
    () => validateDocuments({ requirements, uploadedDocuments }),
    [requirements, uploadedDocuments]
  );

  return { requirements, ...validation };
}


