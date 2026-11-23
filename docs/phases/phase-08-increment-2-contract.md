# Phase 08 — Increment 2 (Login UI) — Execution contract

> **Status: PROPOSED, for owner approval.** No implementation starts before approval. Base: `main`
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

## 6. Decisions requested

| ID  | Decision                                                                                                                                                            | Recommendation                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| L-1 | Approve this contract                                                                                                                                               | Approve                                                                                                             |
| L-2 | Submit button while the form is invalid: stay enabled (submit shows the errors and focuses the first) or disabled until valid                                       | **Stay enabled.** Disabled-until-valid hides why the button is inactive; Figma's Disabled state is kept for Loading |
| L-3 | Loading and Error reviewed only on `/dev/auth/login` with a preview-only fixture (the real route can only show "unavailable")                                       | Approve (as D-08-4)                                                                                                 |
| L-4 | `/login` leaves the "placeholder page, no form" E2E list; its noindex and production-404 checks stay and move to the new spec. The other three routes are unchanged | Approve. This replaces an assertion, it does not weaken it                                                          |
| L-5 | Mariam: no isolated component is left in Login (it is integration work, D-08-8)                                                                                     | No delegation in Increment 2                                                                                        |

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
