# Phase 08 — Increment 3 (Register UI) — Execution contract

> **Status: PROPOSED, for owner approval.** No Register code is written before approval. Base: `main`
> at `d3e7c76` (Increment 2 merged through PR #78). Plan:
> [phase-08-plan.md](phase-08-plan.md) §8 row 3. ClickUp: Increment 3 task `123ru7v2z29`.

## 1. Goal

Replace the Phase 04 placeholder at `/register` with the Register UI from Figma, built on the
Increment 1 foundation and the Increment 2 patterns. The result is **"UI-complete, not
functional"**: the form validates on the client and calls the fail-closed placeholder adapter. A
valid submit always ends with "إنشاء الحساب غير متاح حاليًا.".

## 2. Production restrictions (unchanged)

- `AUTHENTICATION_AVAILABLE` stays `false`. `/register` keeps `assertAuthRouteAvailable()` in
  `generateMetadata` and in the page, so production still returns 404.
- No real registration, account, session, cookie, token, credential storage, endpoint, email
  verification, redirect after registration, or route guard (D-08-4, D-08-6).
- No form value is logged, persisted or sent anywhere except the adapter call.
- The production smoke tests (`/register` 404) keep passing unchanged.
- No dependency, port, environment variable or runtime setting changes (DevOps handoff unaffected).

## 3. Figma audit (read-only, 2026-11-24)

Page `5:5`, 11 states × 3 breakpoints = **33 frames**. All copy below was read from the frames, and
every string already exists in `authentication.json` except the one in §6 R-6.

### 3.1 Frames and how each state is reached

| State               | 1440        | 768         | 390         | Reached by                                       |
| ------------------- | ----------- | ----------- | ----------- | ------------------------------------------------ |
| Default             | `67:14`     | `67:66`     | `67:44`     | Opening `/register`                              |
| Shown: new only     | `2555:3004` | `2555:3212` | `2555:3417` | Password toggle                                  |
| Shown: confirm only | `2555:3068` | `2555:3275` | `2555:3480` | Confirm toggle                                   |
| Shown: both         | `2555:3132` | `2555:3338` | `2555:3543` | Both toggles (independent)                       |
| Required            | `2480:2004` | `2480:2979` | `2480:3942` | Submit, or blur, with empty fields               |
| Invalid email       | `2480:2124` | `2480:3098` | `2480:4061` | Email blur or submit with an invalid email       |
| Password rules      | `2480:2226` | `2480:3199` | `2480:4162` | Password blur or submit with unmet rules         |
| Mismatch            | `2480:2331` | `2480:3303` | `2480:4266` | Confirm blur or submit with a different value    |
| Loading             | `2480:2436` | `2480:3407` | `2480:4370` | Valid submit, while the adapter is pending       |
| Success             | `2480:2534` | `2480:3504` | `2480:4467` | Adapter `ok`: **preview only** (§6 R-4)          |
| Failed              | `2480:2636` | `2480:3605` | `2480:4568` | Adapter `rejected`: **preview only**; see §6 R-3 |

### 3.2 Screen structure (card 480 wide; 350 on Mobile)

| Part         | Values                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Card         | Gap 28: header 65 ("ابدأ رحلتك مع منصت" / "أنشئ حسابك وابدأ تجربة تعليمية أذكى وأسهل."), [status banner], Fields, button, footer |
| Fields       | **Gap 16** (Login: 20): name, email, password, the rules row, confirm                                                            |
| Field labels | "الاسم الكامل", "البريد الإلكتروني", "كلمة المرور", "تأكيد كلمة المرور"                                                          |
| Placeholders | Name "الاسم الكامل"; email "name@example.com"; passwords "••••••••" hidden, "اكتب كلمة المرور" shown                             |
| Rules row    | Between password and confirm; order length, case, digit; Increment 1 `PasswordRule`                                              |
| Button       | "إنشاء حساب"; Loading "جاري إنشاء الحساب..." (State=Loading); Failed "إعادة المحاولة"                                            |
| Footer       | "عندك حساب بالفعل؟" + link "تسجيل الدخول" (`/login`)                                                                             |
| Card heights | Default, Shown, Loading 632 · one helper (Invalid email, Rules, Mismatch) 658 · Required 736 · Failed 708 · Success 290          |

### 3.3 Validation messages (Figma, all existing keys)

| Field    | Empty                    | Invalid                                     |
| -------- | ------------------------ | ------------------------------------------- |
| Name     | "اكتب اسمك الكامل."      | —                                           |
| Email    | "اكتب بريدك الإلكتروني." | "اكتب بريد إلكتروني صحيح."                  |
| Password | "اكتب كلمة المرور."      | "كلمة المرور لا تحقق الشروط." (unmet rules) |
| Confirm  | "أكّد كلمة المرور."       | "كلمتا المرور غير متطابقتين."               |

Rules (Increment 1): at least 8 characters, an upper- and a lower-case letter, at least one digit.
In the Password rules frame the helper sits under the field and the rules row under the helper;
met rules are Valid (Success Green), unmet rules Error (Coral Pulse).

### 3.4 Failed status banner (new pattern, `Status Banner` in `2480:2636`)

The banner is **not** the Login banner. It sits **above the fields**, directly under the header,
and is 48 high: Coral Pulse 8% fill, Coral Pulse 35% border, **radius 14**, padding 12 / 14, gap 10.
It holds the official `alert` icon at 18 px in Coral Pulse at the inline start, then the message in
`Dashboard/Body Medium` Coral Pulse: "تعذر إنشاء الحساب. جرّب تاني.". The button label becomes
"إعادة المحاولة". (The Login banner sits between the fields and the button, has radius 12, padding
10 / 14 and no icon.)

### 3.5 Success view (`2480:2534`)

The Increment 1 `AuthResultView` covers it:

- the status icon (64 × 64, `check`);
- "تم إنشاء حسابك بنجاح" / "تقدر دلوقتي تسجّل دخولك وتبدأ أول محاضرة.";
- the primary action "تسجيل الدخول";
- the footer "عندك حساب بالفعل؟ تسجيل الدخول". It repeats the action, and is kept verbatim.

### 3.6 Responsive behaviour

| Breakpoint | Observations                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1440       | Same row as Login: form column 480 (Logo above the card), panel 520 with a 520 × 350 photo; the card is centred vertically (900 high frame) |
| 768        | Logo, panel, card (480 centred). **The panel photo is 672 × 240**; Login's is 672 × 350. Frame height grows with the card (1338 to 1442)    |
| 390        | Logo, card (350), panel (photo 350 × 200). Rules row: Figma content is 354 px in a 350 px row and is clipped by 4 px (§6 R-8)               |

Panel copy (Register): "رحلتك الأذكى بتبدأ هنا! 🚀" with "هنا!" highlighted, "كل محاضرة فرصة تفهم أكتر.", and a body with explicit
line breaks: three lines, a blank line, then "ابدأ النهارده، وخلي كل معلومة ليها قيمة." (as I2-6 for Login).

### 3.7 Figma inconsistencies found

- The length rule is drawn **Valid** in every frame, even with an empty password (Default, Required).
- Typed values are drawn **left-aligned** for the Arabic name ("أحمد محمد") as well as for the email.
- Password fields show placeholder dots in states where a password was typed (Rules, Mismatch,
  Loading, Failed).
- The Success status icon sits at the physical left (the inline end in RTL), while its text is right-aligned.

## 4. Scope

**In:**

- **Route:** `src/app/[locale]/(auth)/register/page.tsx` renders the Register screen (`AuthLayout`
  family `register`). The metadata keeps the existing title (`pages.auth_register`) and `noindex`.
- **Form:** name, email, password with the live rules row, confirm, the submit button, the footer
  link to `/login`. Two independent show/hide toggles.
- **Schema:** `registerSchema` = `fullNameSchema` + `emailSchema` +
  `newPasswordSchema("passwordRequired")` + `confirmPasswordSchema("confirmRequired")`, plus the
  match check on `confirm` ("validation.mismatch"). The name and email are trimmed; the passwords
  are not.
- **Behaviour:** as Login.
  - React Hook Form, validation on blur, then on every change.
  - The confirm field is re-checked when the password changes, once confirm has been touched.
  - Submitting with errors focuses the first invalid field; the button stays enabled.
  - A valid submit shows Loading (`aria-busy`, disabled, no double submit), then the adapter result.
  - The adapter receives `{ name, email, password }`; the confirmation is never sent.
- **Adapter injection:** as Login I2-1. The form defaults to `placeholderAuthAdapter`; only the
  preview passes fixtures.
- **Results:** `unavailable` follows §6 R-3, `rejected` shows the Failed state, and `ok` shows the
  Success view (§6 R-4). Every other failure fails closed with the "unavailable" wording (as I2-7).
- **New shared-in-feature piece:** `AuthStatusBanner` (§3.4), with its own unit tests.
- **Panel:** the Register body line breaks, and the family-specific Tablet photo height (§6 R-10).
- **Development preview:** `/dev/auth/register?state=loading|failed|success` with preview-only
  adapter fixtures beside the preview (as L-3). It shows the development banner and returns 404 in
  production.
- **Figma values:** recorded in `docs/design-values.md` §17.5 before use.

**Out:**

- Login, Forgot and Reset changes (except shared fixes that Register needs and that Login's tests keep green).
- Terms or consent, email verification, social sign-up, "remember me", a language toggle (D-08-10).
- Navigation after registration (Phase 21). The Success action is a plain link to `/login`.
- Any change to the shared shell, the Landing, `src/config` or the production gates.

## 5. Files (planned)

| File                                                                    | Change                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/app/[locale]/(auth)/register/page.tsx`                             | Placeholder → `RegisterScreen`; both gate calls kept         |
| `src/features/auth/schemas/register.ts` (+ test)                        | `registerSchema`                                             |
| `src/features/auth/components/RegisterForm.tsx` (+ test)                | The client form, states and adapter call                     |
| `src/features/auth/components/RegisterScreen.tsx`                       | Layout, card, footer, result switching; copy for the form    |
| `src/features/auth/components/AuthStatusBanner.tsx` (+ test)            | Failed status banner (§3.4)                                  |
| `src/features/auth/components/AuthMarketingPanel.tsx`, `auth-styles.ts` | Tablet photo height per family (R-10)                        |
| `src/features/auth/components/AuthResultView.tsx`                       | Only if R-5 changes the icon position                        |
| `src/features/auth/index.ts`                                            | Exports                                                      |
| `src/app/[locale]/dev/auth/register/{page,RegisterPreviewForm}.tsx`     | Preview and fixtures (development only)                      |
| `src/i18n/messages/{ar,en}/authentication.json`                         | R-6 toggle name; Register body line breaks (Arabic verbatim) |
| `tests/e2e/auth-register.spec.ts`                                       | New E2E (§8)                                                 |
| `tests/e2e/auth-placeholders.spec.ts`, `tests/e2e/routing.spec.ts`      | `/register` leaves the placeholder lists (R-11)              |
| `tests/e2e/global-setup.ts`                                             | Warm `/dev/auth/register`                                    |
| `docs/design-values.md` §17.5, this contract, `docs/PROGRESS.md`        | Values and records                                           |

No new dependency. No change to `src/api`, `src/types`, `src/config` or `src/shared`.

## 6. Decisions requested

| ID   | Decision                                                                                                                                                                                                                                                                                                                     | Recommendation                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| R-1  | Approve this contract                                                                                                                                                                                                                                                                                                        | Approve                                                                                    |
| R-2  | **Live password rules.** Figma draws the length rule Valid even when empty. Proposed: empty → all Neutral; while typing, met rules Valid and unmet rules Neutral (Default frame); once the password has been checked (blur or submit) with unmet rules, unmet rules turn Error (Password rules frame)                        | Approve. It matches both frames and never shows a rule as met before it is                 |
| R-3  | **"Unavailable" on the real route.** Figma has only the Failed layout for a server-side result. Proposed: "إنشاء الحساب غير متاح حاليًا." in the Failed status banner (above the fields, alert icon), with the button kept as "إنشاء حساب". "تعذر إنشاء الحساب. جرّب تاني." and "إعادة المحاولة" only for `rejected` (preview) | Approve. "Retry" would suggest that trying again can work                                  |
| R-4  | **Success view.** Shown only on the preview (`?state=success`); the real route can never reach it. Its primary action "تسجيل الدخول" is a link to `/login` styled as the primary button; focus moves to the success heading. The footer that repeats the link is kept verbatim                                               | Approve (as D-08-4)                                                                        |
| R-5  | **Success icon position.** Figma: physical left (the inline end) while the text is right-aligned. Option A: inline start (right), aligned with the heading, as `AuthResultView` does now. Option B: match Figma                                                                                                              | **Option A.** It follows the reading start; tell me if Figma is intended                   |
| R-6  | **Confirm toggle name.** Two toggles both named "إظهار كلمة المرور" would be ambiguous for screen readers. Proposed new accessibility string for the confirm toggle: "إظهار تأكيد كلمة المرور" (English DRAFT "Show password confirmation"). Each toggle is independent and uses `aria-pressed`                              | Approve the wording (it is not in Figma; accessibility copy like I2's "إظهار كلمة المرور") |
| R-7  | **Typed name alignment.** Figma draws "أحمد محمد" left-aligned, like the email. Proposed: the Arabic name aligns to the start (right), like any Arabic text. Email and password keep I2-5 (LTR values left)                                                                                                                  | Approve. A left-aligned Arabic value reads as a mistake                                    |
| R-8  | **Rules row at narrow widths.** Figma clips the row by 4 px at 390. Proposed: the row wraps when it does not fit and is never clipped. The rule gap stays 16; wrapped rows add one line                                                                                                                                      | Approve                                                                                    |
| R-9  | **Confirm re-validation.** After confirm has been touched, changing the password re-checks the match, so "كلمتا المرور غير متطابقتين." appears or clears without leaving the field                                                                                                                                           | Approve                                                                                    |
| R-10 | **Panel per family.** Tablet photo 672 × 240 for Register (Login 350, unchanged); the Register body keeps Figma's line breaks and blank line                                                                                                                                                                                 | Approve (Figma values)                                                                     |
| R-11 | `/register` leaves the "placeholder page" E2E lists (`auth-placeholders`, `routing`); its title, direction, noindex and production-404 checks move to the new spec                                                                                                                                                           | Approve (as L-4)                                                                           |
| R-12 | **Delegation.** `AuthStatusBanner` is the only isolated new piece, but it is small and tightly linked to the form                                                                                                                                                                                                            | No delegation to Eng. Mariam in Increment 3                                                |

## 7. Accessibility (WCAG 2.2 AA)

- Visible labels. Autocomplete: `name`, `email`, `new-password` on both password fields. `type="email"` for the email.
- Field errors use `aria-invalid` and `aria-describedby` (Increment 1 fields). The password field is
  also described by the rules list, which announces status changes politely (`aria-live="polite"`,
  one atomic item per rule). Each rule has a shape cue as well as colour (F-5).
- **Status banner:** `role="alert"`, announced once, never takes focus. On `rejected`, the fields are not marked
  invalid (it is not a field error).
- **Loading:** `aria-busy` plus the loading label.
- **Success:** the result heading becomes the page's only `h1`, and focus moves to it.
- One `h1` per view; the marketing heading is not a heading; landmarks; visible focus.
- **Keyboard:**
  - Tab follows reading order: name, email, password, toggle, confirm, toggle, submit, login link.
  - Enter submits; the toggles never submit.
- No timed transitions (the prototype's "after timeout" to Success is not reproduced).

## 8. Tests

| Level      | Tests                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | `registerSchema`: each empty field; invalid email; each unmet rule → "rules"; mismatch on `confirm`; trimming of name and email; passwords untouched; valid input. `AuthStatusBanner`: role, icon, copy, absent when empty                                                                                                                                                                                                      |
| Component  | Blur then change; rule states (R-2) for empty, typing and checked; confirm re-check (R-9); the two toggles independent with distinct names (R-6); submit focuses the first invalid field; Loading blocks a second submit; adapter called once with `{ name, email, password }`; R-3 banner and label; `rejected` → Failed and "إعادة المحاولة"; `ok` → Success view with focus on its heading; no console output of values; axe |
| E2E (dev)  | `/register` at 390, 720, 768, 1024, 1280, 1440 (order, card width and Figma geometry: fields gap 16, card heights from §3.2); no overflow at 320 (rules wrap, R-8); keyboard-only fill and submit → the unavailable banner; footer link; axe ar and en at 3 widths in Default and with errors; preview Loading, Failed and Success                                                                                              |
| Production | Unchanged: `/register` 404, no form (`test:e2e:prod`)                                                                                                                                                                                                                                                                                                                                                                           |

**Gates:**

- `corepack pnpm check`, `test:e2e`, `test:e2e:prod`;
- CI `check` and `e2e` on the exact PR head;
- then a visual review package like Increment 2's: all 33 Register frames side by side with the implementation at each frame's size, before the merge.

## 9. Acceptance criteria

- **Figma states:** the Register states in §3.1 match their frames at 1440, 768 and 390, or have a documented and approved difference (§6).
- **Validation:** on blur, cleared on change, focus on the first invalid field, live rules per R-2.
- **Valid submit:** shows Loading, then "إنشاء الحساب غير متاح حاليًا." (R-3). Nothing creates an account or suggests one was created on the real route.
- **Values:** nothing is logged or stored; the adapter is the only consumer of the values; the confirmation is never sent.
- **Production unchanged:** `/register` returns 404, `AUTHENTICATION_AVAILABLE = false`, no gate touched.
- **Merge:** all §8 tests pass with CI green on the exact PR head; the PR is merged only with owner approval after the visual review.
