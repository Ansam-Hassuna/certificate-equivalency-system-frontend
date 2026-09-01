# Certificate Equivalency System — Frontend

React frontend for the Certificate Equivalency System.

## Security model
This project is intentionally **backend-driven**. The browser does not contain user accounts, passwords, password hashes, verification tokens, payment state or authorization secrets.

The backend is the source of truth for:

- Authentication and session validation
- Password hashing and account activation
- Email verification and token expiry
- Roles and permissions
- Record ownership and scope checks
- Workflow transitions
- Payment confirmation
- Document access
- Audit logging and rate limiting

The frontend only uses server-provided user/permission data to render the appropriate interface. A hidden button is not a security control; every protected API endpoint must enforce authorization on the server.

## Backend API contract
Authentication:

- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`
- `POST /api/auth/verification/resend`
- `POST /api/auth/verification/confirm`

Payments:

- `GET /api/me/payment`
- `POST /api/me/payment/proof`
- `POST /api/me/payment/confirm`
- `GET /api/applications/{id}/payment`
- `POST /api/applications/{id}/payment/proof`
- `POST /api/applications/{id}/payment/confirm`

See `SECURITY_ARCHITECTURE.md` for the complete contract and security requirements.

## Configuration

Copy `.env.example` to `.env` and set the backend origin. Do not put database passwords, API secrets, JWT secrets or private keys in `REACT_APP_*` variables.

## Verification

```bash
npm install
npm run verify
npm run verify:rbac
npm run verify:auth
npm run verify:security
npm run build
```

The security verification checks the source tree for common mistakes such as embedded demo credentials, browser-side password hashing, local user/payment persistence, dangerous HTML injection and dynamic code execution.
