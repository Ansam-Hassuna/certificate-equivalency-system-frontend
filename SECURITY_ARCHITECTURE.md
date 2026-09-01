# Frontend Security Architecture

## Security boundary
The React application is a client. It is **not** a security boundary. Authentication, authorization, ownership checks, workflow transitions, payment confirmation, document access, audit logging, rate limiting and all sensitive validation must be enforced by the backend.

## Authentication contract
The frontend calls:

- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`
- `POST /api/auth/verification/resend`
- `POST /api/auth/verification/confirm`

The backend should use a Secure, HttpOnly, SameSite session cookie. The frontend never stores passwords, password hashes, verification tokens or access tokens.

The session response should contain a safe user object, including server-authoritative permissions:

```json
{
  "user": {
    "id": "USR-123",
    "name": "...",
    "email": "...",
    "role": "...",
    "permissions": ["VIEW_APPLICATIONS", "REPORTS_VIEW"]
  }
}
```

## Payment contract
Payment state and transitions are server-side. The frontend calls:

- `GET /api/me/payment` or `GET /api/applications/{id}/payment`
- `POST /api/me/payment/proof` or `POST /api/applications/{id}/payment/proof`
- `POST /api/me/payment/confirm` or `POST /api/applications/{id}/payment/confirm`

Only the backend may set `CONFIRMED`. The backend must check role, permission, application ownership/scope and workflow state before changing payment status.

## CSRF
For cookie-authenticated state-changing requests, the backend should use SameSite cookies plus an appropriate CSRF defense. If a double-submit token is used, expose only the CSRF token cookie (not the session cookie); the frontend sends it as `X-CSRF-Token`.

## Frontend rules
- No real credentials in source code.
- No password hashing in the browser.
- No user database in localStorage/sessionStorage.
- No payment database in localStorage/sessionStorage.
- No client-side role fallback as an authorization source.
- No verification token generated or displayed by React.
- No secrets, database credentials or private API keys in `REACT_APP_*` variables.
- UI permission checks are for presentation only; the backend must reject unauthorized requests.

## Environment
Set `REACT_APP_API_BASE_URL` to the backend origin in the deployment environment. Do not put secrets in it.
