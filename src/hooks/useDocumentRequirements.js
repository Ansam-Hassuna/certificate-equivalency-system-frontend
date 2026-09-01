import { useMemo } from "react";
import { getRequirementsForRequest, validateDocuments } from "../data/documentRequirements";

export function useDocumentRequirements({ qualificationType, caseData = {}, uploadedDocuments = [] } = {}) {
  const requirements = useMemo(
    () => getRequirementsForRequest({ qualificationType, caseData }),
    [qualificationType, caseData]
  );

  const validation = useMemo(
    () => validateDocuments({ requirements, uploadedDocuments }),
    [requirements, uploadedDocuments]
  );

  return { requirements, ...validation };
}
