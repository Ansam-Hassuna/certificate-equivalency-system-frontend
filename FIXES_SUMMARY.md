# Certificate Equivalency System — Modern Design Final Fixes

## Completed in this pass

- Fixed Hamburger Menu icon mapping so every navigation item uses its declared icon instead of falling back to Settings.
- Added missing shared icons used by the project: chevronDown, logout, save, documentCheck, graduation, help, shield, and x.
- Unified the primary visual palette around the Ministry-inspired green. Removed remaining primary blue literals from the shared UI layer and application stepper.
- Kept blue available only for semantic information states rather than primary actions.
- Localized the dashboard, role profile, settings, workflow stages, request data, committee/inquiry data, and standalone error/placeholder screens.
- Added translation interpolation support to LanguageContext.
- Made the dashboard role-aware and permission-aware, including scoped applicant requests and quick actions filtered by the current user's permissions.
- Protected internal routes with RequirePermission instead of relying only on menu hiding.
- Removed Role Profile from the main Hamburger navigation. It is now reached from the profile menu.
- Fixed Role Profile to display the real user id (`user.id`) and localized role labels.
- Added a functional Settings screen for language and theme preferences and wired it from the profile menu.
- Localized request/workflow/committee/inquiry display values for English mode.
- Preserved RTL/LTR and light/dark theme behavior.

## Verification performed in the available environment

- `node scripts/verify.mjs` — passed.
- `node scripts/verify-rbac.mjs` — passed.
- `node scripts/verify-auth.mjs` — passed.
- Static icon inventory check — passed.
- Navigation icon inventory check — passed.
- Primary-blue literal check in CSS — passed.

## Build note

A fresh `npm install` / `npm run build` could not be executed in the packaging environment because the npm registry/cache was unavailable. The source package is therefore delivered without a generated `build/` directory. Run `npm install` followed by `npm run build` in the project folder on the development machine.

## Final Login Screen Refinement
- Moved language and dark-mode controls from the login card area into the shared public header.
- Language control now displays `AR` for Arabic and `EN` for English.
- Kept the shared header consistent with the landing/public screens.
- Refined the login card spacing and visual hierarchy.
- Added email and password field icons and replaced the password text toggle with an eye icon.
- Preserved RTL/LTR, dark mode, validation, lockout, and authentication behavior.
