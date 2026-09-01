# Permission Audit

Audited the frontend RBAC for navigation, routes, and sensitive UI actions.

## Fixed
- Canonicalized `config/permissions.js` to re-export `auth/permissions.js` and prevent vocabulary drift.
- New Application action is now hidden unless `APPLICATION_CREATE` is granted.
- Post-decision management actions are now shown only to users with `POST_DECISION_SERVICE_MANAGE`; applicants retain `APPEAL_CREATE_OWN`.
- Committee session creation requires `COMMITTEE_COORDINATE`.
- Committee result recording requires `COMMITTEE_RECORD`.
- Higher-committee tab requires `HIGHER_COMMITTEE_REVIEW`.
- Applicant demo access to arbitrary application IDs is blocked at the UI layer.

## Role model
- ADMIN: all defined permissions.
- MANAGER: application review/verification/routing, committee coordination/higher review, reports, post-decision management.
- EQUIVALENCY: application review/verification/routing, post-decision management.
- RECEIVING: paper receipt/review.
- INQUIRY: inquiry management and post-decision management.
- ARCHIVE: archive management and post-decision management.
- COMMITTEE_COORDINATOR: committee view/coordination/recording/higher review.
- COMMITTEE_MEMBER: committee view/review/recording, without session creation or higher-committee tab.
- OFFICE: delivery.
- PRINTING: draft/final printing, draft management, archive, post-decision management.
- APPLICANT: own applications/documents/payment/draft review/appeal.

## Important
Frontend permissions only control UI and client-side routing. The backend must enforce the same permissions, record scopes, ownership, and object-level authorization.
