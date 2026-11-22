# Phase 07 — Primary CTA correction and Authentication gate (P07-D24)

Status: **IN REVIEW** (PR #66, branch `fix/landing-cta-label`). Owner decisions are final
(2026-11-22). Linked to the commercial release blocker (ClickUp "Release blocker: approved
commercial pricing content").

## 1. Finding (production build audit, 2026-11-21)

- "ابدأ مجانًا" ("start for free") was the primary label of the Hero CTA and the Final CTA in a
  `NEXT_PUBLIC_APP_ENV=production` build. A free offering has not been commercially approved.
- Every public authentication entry point leads to a non-operational page:
  - `/register` and `/login` are **Phase 04 route placeholders**: they show the screen title and
    say the feature is not implemented;
  - Phase 08 (Authentication UI) has not started, and no backend or auth flow is verified.
- No form was submitted and no account was created during the audit.

## 2. Owner decisions (final, 2026-11-22)

1. Replace "ابدأ مجانًا" with "ابدأ الآن".
2. Hide the registration CTA in production until Authentication is operational.
3. Hide the navbar login in production until Authentication is operational.
4. Keep both in development.
5. Hide the Final CTA in production if it has no meaningful functional action.
6. Keep the approved Landing design and all responsive layouts.

## 3. Implementation

- **Label:** Hero and Final CTA primary "ابدأ الآن"; English (gated) "Get started". The Pricing
  Starter label (development only, hidden in production) is left to the pricing review.
- **Gate:** `AUTHENTICATION_AVAILABLE = false` and `isAuthenticationAvailable(appEnv)` in
  `src/features/landing/model/gates.ts` (production → hidden; development and test → shown).
  `landingAuthEntryPoints(appEnv)` gives the page one flag per entry point.
- **Public authentication entry points, and what production does:**

| Entry point                             | Production                                                                    | Development |
| --------------------------------------- | ----------------------------------------------------------------------------- | ----------- |
| Navbar login, Desktop bar               | hidden                                                                        | shown       |
| Navbar login, Tablet bar                | hidden                                                                        | shown       |
| Login in the Mobile menu sheet          | hidden (the empty actions row is not rendered)                                | shown       |
| Hero primary "ابدأ الآن" → Register     | hidden; the in-page "اكتشف كيف يعمل" stays                                    | shown       |
| Footer "حسابك" column (login, register) | hidden; brand and section links stay                                          | shown       |
| Final CTA section                       | **hidden**: without Register its only action would be a link back to Features | shown       |
| Pricing plan buttons → Register         | already hidden (Pricing is development only, P07-D4)                          | shown       |

- **Activation:** set `AUTHENTICATION_AVAILABLE` to `true` in a separate change once the owner
  confirms a working sign-in and registration flow (Phase 08).

## 4. Verification

- **Unit (`auth-gate.test.tsx`):**
  - the gate in production, development and test;
  - the entry-point map in production and development;
  - every entry-point component with the production flags (no login or register link anywhere,
    including the opened Mobile menu sheet) and the development flags (all present).
- **E2E (`landing-auth-entry.spec.ts`, development server):** all entry points present and linked
  at 1440, 768 and 390 (menu sheet), ar and en.
- **Production build** (`NEXT_PUBLIC_APP_ENV=production`): screenshots and HTML checks are in the PR
  report; no `/login` or `/register` link in the page, no Final CTA section, Hero with the in-page
  action only.
