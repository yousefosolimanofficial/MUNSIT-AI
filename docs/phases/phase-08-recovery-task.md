# Phase 08 — Recovery UI task (Forgot Password, Reset Password) for Eng. Mariam

- **Status: READY TO SEND. Not assigned.** The task is assigned only after Eng. Mariam confirms she
  accepts it (D-08-8). Until then, nobody may treat it as accepted.
- **Owner decision (2026-11-26):** Yousef + Claude Code build Login (done) and Register; Eng.
  Mariam builds Forgot Password and Reset Password.
- **Branch:** Yousef integrates her deliveries on `feature/auth-recovery`, then opens a separate
  pull request to `main` (never mixed with Register). Mariam has no repository access: she works
  offline from a starter package ([TEAM_COLLABORATION.md](../TEAM_COLLABORATION.md) §4–§6).
- **Baseline:** `main` after PR #81 (the shared status banner, result tones, primary link,
  per-family panel and toggle description) is approved and merges. The starter package is cut from
  that commit and recorded in the delivery log; the handoff is prepared then (owner, 2026-11-26).
- **Backend:** the backend API pack is **provisional**. There is no API integration in this task.
  Authentication stays disabled in production (`AUTHENTICATION_AVAILABLE = false`).

## 1. Goal

Replace the Phase 04 placeholders at `/forgot-password` and `/reset-password` with the Figma screens.
The result is **"UI-complete, not functional"**, exactly like Login and Register:

- the forms validate on the client and call the fail-closed placeholder adapter;
- a valid submit ends with the "unavailable" message;
- every other state (Email sent, Failed, Error, Invalid link, Expired link, Updated) is reachable
  only on a development preview with a preview-only adapter fixture.

## 2. Figma (read-only; file `Avyn9kL0drXepQyTXTLXXb`, page `5:5`)

### 2.1 Forgot Password: 6 states × 3 = 18 frames

| State         | 1440         | 768          | 390          | Card height | Reached by                                |
| ------------- | ------------ | ------------ | ------------ | ----------- | ----------------------------------------- |
| Default       | `67:25`      | `67:73`      | `67:51`      | 334         | Opening the page                          |
| Empty         | `2480:2741`  | `2480:3709`  | `2480:4672`  | 360         | Blur or submit with an empty email        |
| Invalid email | `2480:2785`  | `2480:3752`  | `2480:4715`  | 360         | Blur or submit with an invalid email      |
| Loading       | `2480:2829`  | `2480:3795`  | `2480:4758`  | 334         | Valid submit while the adapter is pending |
| Failed        | `2480:2869`  | `2480:3834`  | `2480:4797`  | 410         | Adapter `rejected`: **preview only**      |
| Email sent    | `2467:75582` | `2467:75675` | `2467:75766` | 225         | Adapter `ok`: **preview only**            |

### 2.2 Reset Password: 11 states × 3 = 33 frames

| State               | 1440        | 768         | 390         | Card height | Reached by                                |
| ------------------- | ----------- | ----------- | ----------- | ----------- | ----------------------------------------- |
| Default             | `2480:345`  | `2480:860`  | `2480:1366` | 434         | Opening the page                          |
| Shown: both         | `2480:403`  | `2480:917`  | `2480:1423` | 434         | Both toggles                              |
| Shown: new only     | `2550:2872` | `2553:2916` | `2553:3033` | 434         | New-password toggle                       |
| Shown: confirm only | `2550:2927` | `2553:2970` | `2553:3087` | 434         | Confirm toggle                            |
| Required            | `2480:461`  | `2480:974`  | `2480:1480` | 486         | Blur or submit with empty fields          |
| Mismatch            | `2480:535`  | `2480:1047` | `2480:1553` | 460         | Confirm blur or submit with another value |
| Loading             | `2480:601`  | `2480:1112` | `2480:1618` | 434         | Valid submit while the adapter is pending |
| Error               | `2480:659`  | `2480:1169` | `2480:1675` | 510         | Adapter `rejected`: **preview only**      |
| Invalid link        | `2480:724`  | `2480:1233` | `2480:1739` | 290         | Adapter `invalid-link`: **preview only**  |
| Expired link        | `2480:770`  | `2480:1278` | `2480:1784` | 290         | Adapter `expired-link`: **preview only**  |
| Updated             | `2480:816`  | `2480:1323` | `2480:1829` | 237         | Adapter `ok`: **preview only**            |

### 2.3 Structure and copy (every string already exists in `authentication.json`)

| Screen       | Card (gap 28)                                                                                                                                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forgot       | Header "نسيت كلمة المرور؟" / "متقلقش، اكتب بريدك الإلكتروني وهنبعتلك رابط لإعادة تعيين كلمة المرور." (two lines); [status banner]; email field (placeholder "name@example.com"); button "إرسال رابط إعادة التعيين" (Loading "جاري الإرسال..."; Failed "إعادة المحاولة"); text link "العودة لتسجيل الدخول" |
| Email sent   | No icon. Header "اتبعت الرابط!" / "بعتنا رابط إعادة التعيين على بريدك الإلكتروني. شوف صندوق الوارد، وراجع الرسائل غير المرغوبة لو ما لقيتوش."; primary link "العودة لتسجيل الدخول"; text link "إعادة إرسال الرابط" (see RC-3). The prototype demo link is excluded (D-08-7)                               |
| Reset        | Header "إعادة تعيين كلمة المرور" / "اكتب كلمة المرور الجديدة وأكدها علشان تكمّل."; [status banner]; Fields (gap 16): "كلمة المرور الجديدة", the rules row, "تأكيد كلمة المرور الجديدة"; button "تغيير كلمة المرور" (Loading "جاري التحديث..."; Error "إعادة المحاولة"); text link "العودة لتسجيل الدخول"   |
| Invalid link | Danger icon (`alert`, Coral Pulse); "رابط إعادة التعيين غير صالح" / "الرابط ده مش صحيح أو اتستخدم قبل كده. اطلب رابط جديد وكمّل."; primary link "طلب رابط جديد" (`/forgot-password`); text link "العودة لتسجيل الدخول"                                                                                     |
| Expired link | Warning icon (`alert`, Semantic Warning); "انتهت صلاحية الرابط" / "الرابط ده انتهت مدته. اطلب رابط جديد علشان تعيّن كلمة المرور."; primary link "طلب رابط جديد"; text link "العودة لتسجيل الدخول"                                                                                                          |
| Updated      | Success icon (`check`); "تم تغيير كلمة المرور بنجاح" / "تقدر دلوقتي تسجّل دخولك باستخدام كلمة المرور الجديدة."; primary link "العودة لتسجيل الدخول"; no footer                                                                                                                                             |

**Status banners** (Forgot Failed, Reset Error): "تعذر إرسال رابط إعادة التعيين. جرّب تاني." and
"حصلت مشكلة أثناء تغيير كلمة المرور. جرّب تاني." (`errors.failed.forgot`, `errors.failed.reset`).
Unavailable copy: `errors.unavailable.forgot`, `errors.unavailable.reset`.

**Validation** (existing keys):

- **Forgot:**
  - email empty "اكتب بريدك الإلكتروني.";
  - email invalid "اكتب بريد إلكتروني صحيح.".
- **Reset:**
  - new password empty "اكتب كلمة المرور الجديدة.";
  - new password with unmet rules "كلمة المرور لا تحقق الشروط.";
  - confirm empty "أكّد كلمة المرور الجديدة.";
  - mismatch "كلمتا المرور غير متطابقتين.".

**Responsive** (shared `AuthLayout`, family `recovery`): the same order as Login and Register, a Tablet photo of 672 × 240,
and the panel body kept as one text with Figma's line breaks (both already provided by #81).

## 3. File ownership (no overlap with Register)

### 3.1 Eng. Mariam writes only these files

```
src/features/auth/schemas/forgot-password.ts
src/features/auth/schemas/forgot-password.test.ts
src/features/auth/schemas/reset-password.ts
src/features/auth/schemas/reset-password.test.ts
src/features/auth/components/ForgotPasswordForm.tsx
src/features/auth/components/ForgotPasswordForm.test.tsx
src/features/auth/components/ForgotPasswordScreen.tsx
src/features/auth/components/ResetPasswordForm.tsx
src/features/auth/components/ResetPasswordForm.test.tsx
src/features/auth/components/ResetPasswordScreen.tsx
src/app/[locale]/(auth)/forgot-password/page.tsx          (delegated route file, see §3.3)
src/app/[locale]/(auth)/reset-password/page.tsx           (delegated route file, see §3.3)
src/app/[locale]/dev/auth/forgot-password/page.tsx        (development preview)
src/app/[locale]/dev/auth/forgot-password/ForgotPreviewForm.tsx
src/app/[locale]/dev/auth/reset-password/page.tsx         (development preview)
src/app/[locale]/dev/auth/reset-password/ResetPreviewForm.tsx
tests/e2e/auth-recovery.spec.ts
```

While this task is active, Yousef and Claude Code do not edit these files.

### 3.2 Yousef + Claude Code own everything else, including

- **Register:** `RegisterForm.tsx`, `RegisterScreen.tsx`, `schemas/register.ts` and their tests;
  `(auth)/register`, `dev/auth/register`; `tests/e2e/auth-register.spec.ts`.
- **Shared Auth files** (read-only for Mariam):
  - `src/features/auth/index.ts`;
  - every other file under `src/features/auth/components`, `model` and `schemas/fields.ts`;
  - `auth-styles.ts`.
- **Shared app and data files:** `src/api`, `src/types`, `src/config`, `src/i18n` (including
  `authentication.json`), `src/shared`, `src/design-system`.
- **Shared tests:** `tests/e2e/auth-placeholders.spec.ts`, `routing.spec.ts`, `global-setup.ts`, the
  production specs.

Anything Mariam needs in these files (an export, a message key, a shared change, a test-list
update) is written as a request in `DELIVERY.md` and applied by Yousef.

### 3.3 Rules for the delegated route files

- Keep `assertAuthRouteAvailable()` in both `generateMetadata` and the page; keep
  `placeholderMetadata("auth.forgotPassword" | "auth.resetPassword")` (route title, `noindex`).
  Production must keep returning 404.
- Import the screens by path (`@/features/auth/components/ForgotPasswordScreen`). Do not edit
  `src/features/auth/index.ts`; Yousef adds the exports at integration.
- Preview pages: `notFound()` when `NODE_ENV === "production"`, the development banner (copy the
  pattern from `src/app/[locale]/dev/auth/register/page.tsx`), and the fixtures beside the page.

## 4. What to reuse (do not copy or change)

- **Patterns:** follow `LoginForm` / `RegisterForm` and their screens, previews and tests:
  - the adapter is an optional prop defaulting to `placeholderAuthAdapter` (the route passes none);
  - copy arrives as props from the server screen;
  - React Hook Form with `zodResolver`, `mode: "onTouched"`, `reValidateMode: "onChange"`;
  - fields registered in visual order (focus on the first invalid field);
  - an in-flight guard against a second submit;
  - fail closed on any thrown error;
  - nothing logged or stored.
- **Components:** `AuthLayout` (family `recovery`), `AuthFormCard`, `AuthTextField`, `AuthPasswordField`
  (each toggle is already described by its label), `AuthSubmitButton` (`loading`), `AuthStatusBanner`,
  `AuthResultView` (`tone`: `success`, `danger`, `warning`, or `null` for Email sent), `AuthButtonLink`,
  `AuthTextLink`, `AuthCardFooter`, `PasswordRuleList`.
- **Schemas and models:**
  - `emailSchema`, `newPasswordSchema("newPasswordRequired")` and
    `confirmPasswordSchema("confirmNewRequired")` (`schemas/fields.ts`);
  - `evaluatePasswordRules` (`model/password-rules.ts`);
  - the Register match check, with its `when` condition, as the model for Reset.
- **Adapter:** `placeholderAuthAdapter.requestPasswordReset({ email })` and
  `.resetPassword({ token, password })` (`src/api/adapters/auth.ts`).
- **Values:** `docs/design-values.md` §17.4–§17.6.

## 5. Behaviour

- **Validation:**
  - on blur, then on every change;
  - submitting with errors focuses the first invalid field, and the button stays enabled.
- **Rules (Reset):** as Register R-2.
  - All neutral while empty.
  - Met rules turn Valid while typing; unmet rules stay Neutral.
  - After the field has been checked with unmet rules, those rules turn Error.
  - Figma draws the length rule Valid even when empty; ignore that.
- **Confirm (Reset):** after confirm is touched, changing the new password re-checks the match (Register R-9).
- **Results on the real routes:** the placeholder only returns `unavailable`. Show the unavailable copy in the status banner, above the fields, with the button label unchanged (RC-1).
- **Preview results:**
  - **Forgot:** `rejected` → the Failed banner and "إعادة المحاولة"; `ok` → Email sent.
  - **Reset:** `rejected` → the Error banner and "إعادة المحاولة"; `invalid-link` / `expired-link` → the link views; `ok` → Updated.
  - Each result view moves focus to its heading.
- **Values:** the adapter receives only what it needs: the trimmed email for Forgot; for Reset, `{ token, password }` and never the confirmation (RC-4 for the token).

## 6. Decisions (RC-3 and RC-4 decided by the owner on 2026-11-26)

| ID   | Decision                                                                                                                                                                              | Interim for the task                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RC-1 | "Unavailable" on the real routes shown like Register R-3 (status banner, button unchanged)                                                                                            | Implement as R-3 (consistency); owner to confirm                                                                                                                                         |
| RC-2 | Email sent, Updated, Invalid and Expired views only on previews                                                                                                                       | Implement as preview only (as R-4)                                                                                                                                                       |
| RC-3 | **DECIDED (owner, 2026-11-26):** display "إعادة إرسال الرابط", but keep it inactive until the backend provides the functionality (no resend endpoint exists in the captured contract) | A text-styled `<button type="button">` with `aria-disabled="true"`, visibly present and focusable, that does nothing: no adapter call, no Loading, no message. A code comment cites RC-3 |
| RC-4 | **DECIDED (owner, 2026-11-26):** do not implement reset-token handling yet                                                                                                            | The route reads nothing from the URL; the form takes an optional `token` prop and passes `token ?? ""` to the adapter. No parsing, display, logging or storage of any token              |
| RC-5 | Typed values: Figma draws placeholders where values were typed, and the length rule as Valid while empty                                                                              | Follow the Login and Register patterns (I2-5, R-2)                                                                                                                                       |

## 7. Accessibility (WCAG 2.2 AA)

- **Fields:** visible labels. Autocomplete is `email` for Forgot and `new-password` on both Reset fields. Errors use `aria-invalid` and `aria-describedby`; the new-password field is also described by the rules list.
- **Banner and results:** the status banner is `role="alert"`, never takes focus, and does not mark fields invalid. Each result view's heading is the only `h1`, and focus moves to it.
- **Loading:** sets `aria-busy`.
- **Keyboard:** Tab follows reading order; Enter submits; toggles never submit.

## 8. Tests (all must pass before delivery)

| Level      | Required                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | Both schemas: every message, trimming of the email, passwords untouched, mismatch on confirm (also while the new password is invalid)                                                                                                                                  |
| Component  | Blur then change; rules states (Reset); confirm re-check; independent toggles; focus on the first invalid field; Loading blocks a second submit; adapter called once with the right values; unavailable banner; every preview result; no console output of values; axe |
| E2E (dev)  | Both routes at 390, 720, 768, 1024, 1280, 1440 (order, card width, card heights from §2); no overflow at 320; keyboard-only flow; axe ar and en at 3 widths with errors; every preview state; no request and no storage on submit                                      |
| Production | Unchanged: both routes return 404 (Yousef runs `test:e2e:prod`)                                                                                                                                                                                                        |

Locally, `tests/e2e/auth-placeholders.spec.ts` and `routing.spec.ts` will fail for these two routes
once they are no longer placeholders. That is expected: report it in `DELIVERY.md`. Yousef moves
them out of the placeholder lists at integration (as L-4 and R-11).

## 9. Delivery

Use the `DELIVERY.md` template (TEAM_COLLABORATION.md §5.2):

- the baseline commit;
- the changed files (only §3.1);
- requests for shared changes;
- real test output (`corepack pnpm check`, the new E2E spec);
- screenshots at 1440, 768 and 390 in Arabic;
- known limitations.

No `node_modules`, build output, caches or `.env` files, and no packages installed.

## 10. Acceptance

- The 17 states in §2 match their frames at 1440, 768 and 390, or differ in a documented way.
- Validation, rules and focus behave as §5; nothing is logged, stored or sent except the adapter call.
- Production is unchanged: both routes return 404, `AUTHENTICATION_AVAILABLE = false`.
- Yousef reviews and integrates on `feature/auth-recovery`. The pull request merges only after review and passing CI.
