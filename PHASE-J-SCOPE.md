# Certificate Equivalency System — Phase J

## Scope
Phase J implements the post-decision services described in the approved equivalency workflow notes:

1. Lost-document replacement (بدل فاقد).
2. Appeal against an equivalency result or document content (اعتراض).
3. Recognition request after a non-equivalency result where applicable (طلب اعتراف).
4. Grievance addressed to the minister and linked to the equivalency file (تظلم).
5. Legal/judicial inquiries, outgoing documents, court decisions, and related file records.
6. Withdrawal or suspension of an issued equivalency/recognition document, with status reactivation when authorized.

## UI
- New route: `/post-decision`.
- Applicant view exposes the applicant-facing appeal entry point.
- Authorized staff view exposes the full post-decision service catalog.
- Arabic/English translations are included.
- Existing light/dark theme, RTL/LTR, responsive layout, and shared UI components are reused.
- New permissions are `POST_DECISION_SERVICE_VIEW` and `POST_DECISION_SERVICE_MANAGE`.

## Important
This phase is a frontend workflow prototype. Backend authorization, persistence, document generation, payment integration, and external legal/judicial integrations remain backend responsibilities.
