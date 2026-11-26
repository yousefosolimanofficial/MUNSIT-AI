# Phase 08 — Increment 2 (Login UI) — Execution contract

> **Status: COMPLETE.** Contract approved on 2026-11-23 (L-1 to L-5, §6.1); implementation merged
> through PR #78 (`d3e7c76`) after the owner's visual approval on 2026-11-24 (§10). Base: `main`
> at `581fc19` (Increment 1 merged through PR #75). Plan:
> [phase-08-plan.md](phase-08-plan.md) §8 row 2. ClickUp: Increment 2 task `123ru7v2z28`.

## 1. Goal

Replace the Phase 04 placeholder at `/login` with the Login UI from Figma, built from the
Increment 1 foundation. The result is **"UI-complete, not functional"**: the form validates on the
client, calls the fail-closed placeholder adapter, and shows "تسجيل الدخول غير متاح حاليًا."

## 2. Production restrictions (unchanged)

- `AUTHENTICATION_AVAILABLE` stays `false`. `/login` keeps `assertAuthRouteAvailable()` in
  `generateMetadata` and the page, so production still returns 404.
- No real authentication, session, cookie, token, credential storage, endpoint, redirect after
  sign-in, or route guard (D-08-4, D-08-6).
- No password or form value is logged, persisted or sent anywhere except the adapter call.
- The Landing entry points stay hidden in production (P07-D24).
- The existing production smoke tests (`/login` 404) must keep passing unchanged.

## 3. Scope

**In:**

- **Route:** `src/app/[locale]/(auth)/login/page.tsx` composes `AuthLayout` (family `login`) and
  the Login form. Metadata keeps the existing title (`pages.auth_login`) and `noindex`.
- **Form:** email and password, with "نسيت كلمة المرور؟", the submit button and the footer link
  "لسه معندكش حساب؟ إنشاء حساب".
- **Schema:** `loginSchema` = `emailSchema` + `currentPasswordSchema` (Increment 1
  `schemas/fields.ts`). Empty-field and invalid-email messages reuse the approved Register and
  Forgot wording (D-08-5).
- **Behaviour:**
  - React Hook Form, validation on blur, re-validation on change, so an error clears as soon as
    the value is valid;
  - on submit with errors, focus moves to the first invalid field;
  - on a valid submit: Loading (`aria-busy`, disabled, no double submit), then the adapter result;
  - adapter failure → the form-level banner (`role="alert"`) with `failureMessageKey("login", …)`.
    The placeholder always gives "unavailable", never "invalid credentials" (R08-1);
  - the password show/hide toggle (Increment 1 `AuthPasswordField`).
- **Adapter injection:** the form receives an `AuthAdapter` prop. The route passes
  `placeholderAuthAdapter`. Nothing else can be passed in production code.
- **Figma states (§3.1 of the plan):** Default `67:3` / `67:59` / `67:37`, Password shown
  `2541:2980` / `3029` / `3077`, Loading `2480:2916` / `3880` / `4843`, Error `2467:75609` /
  `75701` / `75792`.
- **Development preview:** `/dev/auth/login?state=loading|error` uses a **preview-only adapter
  fixture** (a never-settling adapter for Loading, one answering `invalid-credentials` for Error).
  The page is labelled as a preview, returns 404 in production and is not evidence of working
  sign-in (D-08-4). The fixture lives beside the preview, not in `src/api`.
- **Figma values:** any Login-only value not yet recorded is read from Figma (read-only) and added
  to design-values §17 before use; for example the banner position in the Error frame or the
  Loading frame.

**Out:**

- Register, Forgot and Reset (Increments 3 and 4).
- Navigation after a successful sign-in. The placeholder never succeeds; the destination is
  Phase 21.
- Google sign-in, "remember me", a language toggle and other undesigned features (D-08-10).
- Any change to the shared shell, the Landing, `src/config` or the production gates.

## 4. Files

| File                                                       | Change                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/[locale]/(auth)/login/page.tsx`                   | Placeholder → `AuthLayout` + `LoginForm`; gate calls kept          |
| `src/features/auth/components/LoginForm.tsx` (client)      | The form (RHF + Zod resolver), states and adapter call             |
| `src/features/auth/components/LoginForm.test.tsx`          | Component tests (§7)                                               |
| `src/features/auth/schemas/login.ts` (+ test)              | `loginSchema`                                                      |
| `src/features/auth/index.ts`                               | Export `LoginForm`                                                 |
| `src/app/[locale]/dev/auth/login/page.tsx` + fixture       | Preview of Loading and Error (development only, 404 in production) |
| `src/i18n/messages/{ar,en}/authentication.json`            | Only if a Figma Login string is still missing (verbatim; en DRAFT) |
| `tests/e2e/auth-login.spec.ts`                             | New E2E (§7)                                                       |
| `tests/e2e/auth-placeholders.spec.ts`                      | `/login` leaves the placeholder list (§6 L-4)                      |
| `tests/e2e/global-setup.ts`                                | Warm `/login` and `/dev/auth/login`                                |
| `docs/design-values.md`, this contract, `docs/PROGRESS.md` | Values and records                                                 |

No new dependency. No change to `src/api`, `src/types`, `src/config` or the shared code.

## 5. Accessibility (WCAG 2.2 AA)

- Visible labels; `type="email"` with `autocomplete="email"`, and `autocomplete="current-password"`
  on the password field.
- Field errors: `aria-invalid` and `aria-describedby` (Increment 1 fields).
- The banner is announced once (`role="alert"`) and does not move focus. A Loading state is
  announced through `aria-busy` and the loading label.
- One `h1` ("أهلًا بيك في منصت"); the marketing heading is not a heading; landmarks; visible focus.
- Full keyboard operation: Tab order follows reading order, Enter submits, and the toggle never
  submits.
- No timed transitions (the prototype's `AFTER_TIMEOUT` is not reproduced).

## 6. Decisions

| ID  | Decision                                                                                                                                                            | Recommendation                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| L-1 | Approve this contract                                                                                                                                               | Approve                                                                                                             |
| L-2 | Submit button while the form is invalid: stay enabled (submit shows the errors and focuses the first) or disabled until valid                                       | **Stay enabled.** Disabled-until-valid hides why the button is inactive; Figma's Disabled state is kept for Loading |
| L-3 | Loading and Error reviewed only on `/dev/auth/login` with a preview-only fixture (the real route can only show "unavailable")                                       | Approve (as D-08-4)                                                                                                 |
| L-4 | `/login` leaves the "placeholder page, no form" E2E list; its noindex and production-404 checks stay and move to the new spec. The other three routes are unchanged | Approve. This replaces an assertion, it does not weaken it                                                          |
| L-5 | Mariam: no isolated component is left in Login (it is integration work, D-08-8)                                                                                     | No delegation in Increment 2                                                                                        |

### 6.1 Owner approval (2026-11-23)

The owner approved all five decisions as recommended:

| ID  | Approved outcome                                                                                 |
| --- | ------------------------------------------------------------------------------------------------ |
| L-1 | This contract is approved                                                                        |
| L-2 | The submit button stays enabled while the form is invalid; submit shows errors and focuses first |
| L-3 | Loading and Error are reviewed only on `/dev/auth/login` with a preview-only fixture             |
| L-4 | `/login` leaves the placeholder E2E list; its noindex and production-404 checks move to the spec |
| L-5 | No delegation to Eng. Mariam in Increment 2                                                      |

Conditions restated by the owner: authentication stays disabled in production; no real
authentication or backend integration; the submit keeps the "unavailable" behaviour; no existing
production gate changes. Implementation does not start until this contract is merged.

## 7. Tests

| Level      | Tests                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | `loginSchema`: empty email, invalid email, valid email with surrounding spaces, empty password, valid input                                                                                                                 |
| Component  | Blur errors, then clearing on change; submit focuses the first invalid field; Loading blocks a second submit; the adapter is called once with the trimmed email; banner per failure; no `console` output of values; axe     |
| E2E (dev)  | `/login` at 390, 720, 768, 1024, 1280, 1440 (layout, order, no overflow at 320); keyboard-only fill and submit → the unavailable banner; links to Forgot and Register; axe ar and en at 3 widths; preview Loading and Error |
| Production | Unchanged: `/login` 404 and no Landing entry points (`test:e2e:prod`)                                                                                                                                                       |

Gate: `corepack pnpm check`, `corepack pnpm test:e2e`, `corepack pnpm test:e2e:prod`, then CI
`check` and `e2e` on the exact PR head.

## 8. Acceptance criteria

- The Login Default, Password shown, Loading and Error states match their Figma frames at 1440,
  768 and 390, or a documented and approved difference.
- Validation on blur, clearing on change and focus on the first invalid field.
- A valid submit shows Loading, then "تسجيل الدخول غير متاح حاليًا.". Nothing says the credentials
  are wrong, and nothing suggests the user is signed in.
- No value is logged or stored; the adapter is the only consumer of the values.
- Production is unchanged: `/login` 404, `AUTHENTICATION_AVAILABLE = false`, gates untouched.
- All §7 tests pass, with CI green on the exact PR head. PR merged only with owner approval.

## 9. Implementation record (2026-11-23)

Contract merged through PR #77 (`cfc61de`); implementation on `phase/08-increment-2-login`.
Figma was read only (frames in §3), and every value below was read from the 12 Login frames.

| ID   | Finding or decision                                                                                                                                                                                                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I2-1 | **Adapter injection.** A Server Component cannot pass an adapter object (functions) to a Client Component. `LoginForm` therefore takes `adapter` as an optional prop that **defaults to `placeholderAuthAdapter`**; the route passes none. Only the development preview passes a fixture, through a client wrapper beside it (`src/app/[locale]/dev/auth/login/LoginPreviewForm.tsx`).           |
| I2-2 | **Placeholders.** Figma shows "name@example.com" (email), "••••••••" (password hidden) and "اكتب كلمة المرور" (password shown, `2541:2980`). The last two were missing and were added verbatim as `placeholders.password` and `placeholders.passwordShown` (English DRAFT).                                                                                                                      |
| I2-3 | **Error frame fields.** In `2467:75609` / `75701` / `75792` both fields carry a Coral Pulse 70% border and no helper. Implemented for `invalid-credentials` only (seen in the preview): `aria-invalid` plus `aria-describedby` pointing to the banner. "unavailable", the only result on the real route, is not the user's mistake, so the fields stay Default.                                  |
| I2-4 | **Loading button.** The Figma `Auth / Primary Button` State=Loading variant (`2542:2824`, as L-2 clarified at the final review): label plus the 18 px spinner, gap 8, with the spinner at the inline start (the right in RTL). The Disabled variant is not used in Login. In the Figma Loading frames the fields stay Default, so they are not disabled; the button is disabled and `aria-busy`. |
| I2-5 | **Typed email alignment.** The Loading frames align the typed "ahmed@example.com" LEFT, while the placeholder stays RIGHT (Default, Error). LTR fields now align a typed value to its own start (left) and the placeholder to the page start (right). This applies to the email and the password fields.                                                                                         |
| I2-6 | **Marketing panel body.** Figma breaks each Login body paragraph into two lines with an explicit line break at every breakpoint. The Arabic Login copy keeps the breaks (`whitespace-pre-line`). Register and Recovery are checked in their own increments.                                                                                                                                      |
| I2-7 | **Failures without Login copy.** Login copy exists for `unavailable` and `invalid-credentials` only. `rejected` (which `failureMessageKey` maps to a missing `errors.failed.login`), `invalid-link` and `expired-link` fail closed with the "unavailable" wording. No message is invented.                                                                                                       |

Production is unchanged: `AUTHENTICATION_AVAILABLE = false`, `/login` keeps both
`assertAuthRouteAvailable()` calls and returns 404 in production, and no gate, redirect, request or
storage was added. No dependency, port, environment variable or runtime setting changed, so the
DevOps handoff is unaffected.

## 10. Owner visual approval and merge (2026-11-24)

The owner reviewed the side-by-side comparison of all 12 Figma frames with the implementation
(Default, Password shown, Loading and Error at 1440, 768 and 390; captured at each frame's size)
and approved the Login UI visually. No further visual change was requested.

**Accepted differences:**

- the emoji is drawn by the operating system's emoji font;
- minor Arabic font rendering differences between the browser and Figma (sizes and weights match);
- Loading and Error keep the values the user typed, where Figma draws placeholders;
- the Loading spinner is captured mid-turn, where Figma shows it static.

**Merge evidence:**

| Item                   | Value                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| Reviewed head          | `9d96421` (PR #78); CI run 45279103845: `check` and `e2e` green           |
| Merge                  | Squash, pinned to the reviewed head: `main` at `d3e7c76`                  |
| Tree                   | Identical to `9d96421`                                                    |
| Post-merge CI          | Run 45484982422 on `d3e7c76`: `check` and `e2e` green                     |
| Production after merge | `AUTHENTICATION_AVAILABLE = false`; `/login` returns 404; no gate changed |

Increment 2 is complete. Increment 3 (Register) starts with its own plan and owner approval.
