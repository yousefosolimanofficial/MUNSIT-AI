# Phase 07 — Unfinished Authentication placeholders in production (P07-D25)

Status: **IN REVIEW** (separate PR, branch `fix/auth-placeholders-production`). Owner-approved scope
(2026-11-22): a narrow investigation and correction; no Authentication is implemented.

## 1. Findings (production build, `NEXT_PUBLIC_APP_ENV=production`, `next start`, 2026-11-22)

| Route                                                        | Before                                      |
| ------------------------------------------------------------ | ------------------------------------------- |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | 200, Phase 04 placeholder, **no `noindex`** |
| The same under `/en/…`                                       | 200, although the English Landing is gated  |
| `/ar/login` (and the other `/ar/…`)                          | 307 to the unprefixed URL (locale proxy)    |
| Other Phase 04 placeholders (for example `/dashboard`)       | 200, no `noindex`                           |
| `robots.txt`, `sitemap.xml`                                  | 404 (none)                                  |

- **No form, input or working action exists** on any placeholder: the page shows only the screen
  title and "not implemented". Nothing functional was exposed, but the pages were public and
  indexable, and the English placeholders bypassed the English gate.
- **Hiding the Landing links (P07-D24) is not enough:** the URLs stayed reachable directly.

## 2. Contracts checked

- **Phase 04 plan, D-R12:** no auth redirects or route protection in Phase 04.
- **Phase 04 plan §17, D-02 risk:** "placeholders stay public until Phase 21". This is a risk
  note: there is no access control.
- **Phase 04 closure report:** "60 placeholder URLs → 200" was the evidence at closure, not a
  requirement for production.
- **Conclusion:** a production-only 404 for the Auth placeholders, removed when Authentication is
  available, is **availability gating**, as for the `/dev/*` routes. It is not route protection,
  a redirect or an auth flow, so it does not conflict with an approved contract. The Phase 08
  boundary is unchanged: Phase 08 replaces these pages, and the same gate decides when production
  shows them.

## 3. Change

- **Gate:** one source of truth, `src/config/availability.ts` (`AUTHENTICATION_AVAILABLE`,
  `isAuthenticationAvailable`). It moved from the Landing feature, which re-exports it unchanged.
  No new environment variable: `NEXT_PUBLIC_APP_ENV` as for every gate.
- **Auth routes:** `assertAuthRouteAvailable()`
  (`src/app/[locale]/(auth)/_lib/availability.ts`) is called by `generateMetadata` and the page of
  the four Auth routes.
  - **Production:** `notFound()`, a 404 with the localized not-found page (`noindex`).
  - **Development and preview:** the placeholders, unchanged.
- **Every Phase 04 placeholder** (`placeholderMetadata`) is `noindex, nofollow`, in every
  environment. Placeholders outside Auth stay reachable (no approved change), but are never
  indexed. The Landing is a real page and stays indexable.
- **Activation:** setting `AUTHENTICATION_AVAILABLE` to `true` (owner decision, after a working
  flow) restores the Landing entry points and the Auth routes together.

## 4. Verification

- **Unit:** `src/config/availability.test.ts`; the Landing gate tests use the same gate.
- **Development E2E** (`tests/e2e/auth-placeholders.spec.ts`): the four Auth routes, ar and en, are
  200 with their placeholder heading, `noindex, nofollow` and no form. The Landing has no robots
  restriction. `routing.spec.ts` (every placeholder, both locales) is unchanged and passes.
- **Production smoke** (`tests/e2e-production/auth-routes.prod.spec.ts`, real production build):
  - the four Auth routes, ar and en, return 404 with `noindex`, no form or input, no Auth link and
    no placeholder title;
  - `/ar/login` redirects to `/login`, which returns 404;
  - public placeholders are `noindex, nofollow`;
  - the Landing is 200 with no robots restriction.
- **Shared infrastructure:** the production test configuration, script and CI step are
  byte-identical to PR #67 (Increment 6 QA). Whichever PR merges first, the other rebases cleanly.
