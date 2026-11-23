# Phase 08 — Increment 1 — Authentication UI Foundation — Execution contract

- **Status:** **APPROVED** (owner, 2026-11-23; PR #74 merged as `f91c579`). Implementation in
  progress on `phase/08-increment-1-foundation` (§16).
- **Plan:** [phase-08-plan.md](phase-08-plan.md), approved 2026-11-23 with decisions D-08-1 to
  D-08-10.
- **Baseline:** `main` after the Phase 08 planning PR (#73).
- **Production:** unchanged throughout. `AUTHENTICATION_AVAILABLE` stays `false`, the Auth routes
  return 404 in production, and the English, Pricing and Hero image gates are untouched. Phase 07
  stays CLOSED — IMPLEMENTATION COMPLETE — PRODUCTION RELEASE BLOCKED.

## 1. Scope

**In Increment 1:**

1. Feature architecture (`src/features/auth`, `src/api/adapters`, `src/types`).
2. Shared Authentication layout (`(auth)` route-group layout).
3. Form component contracts and the seven components (§4).
4. Responsive rules (§5).
5. RTL and LTR strategy (§6).
6. Validation architecture (§7).
7. Message-file structure (§8).
8. Development-only preview strategy (§9).
9. Future Authentication adapter boundary and route protection contract (§10).
10. Test strategy (§11).

**Not in Increment 1:**

- the Login, Register, Forgot and Reset screens themselves (Increments 2–4);
- any guard or redirect (D-08-6);
- any network call;
- any production change.

The four Auth `page.tsx` files keep their Phase 04 placeholder content until their increment, with
`assertAuthRouteAvailable()` unchanged.

## 2. Feature architecture and file ownership

The architecture rules hold: `app → features → shared / api / state / i18n / types / config /
design-system`. A feature never imports another feature, and `src/api` imports only `src/types`.
Folders are created only because this increment needs them.

| Path                                                                 | Content                                                                               | Owner                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `package.json`, `pnpm-lock.yaml`                                     | `react-hook-form`, `zod`, `@hookform/resolvers` (separate `chore(deps)` commit)       | Claude Code (integration)                                                              |
| `docs/decisions/ADR-001-frontend-stack.md`                           | Installed versions                                                                    | Claude Code                                                                            |
| `src/types/auth.ts`                                                  | Domain types: `AuthFailure`, `AuthResult`, `AuthSession`, route access contract (§10) | Claude Code                                                                            |
| `src/api/adapters/auth.ts`                                           | `AuthAdapter` interface and `placeholderAuthAdapter` (fails closed, no network)       | Claude Code                                                                            |
| `src/features/auth/index.ts`                                         | Public exports                                                                        | Claude Code                                                                            |
| `src/features/auth/components/AuthLayout.tsx`                        | Background glow, marketing panel, form column, logo (§5)                              | Claude Code                                                                            |
| `src/features/auth/components/AuthMarketingPanel.tsx`                | Photo and copy per screen family                                                      | Claude Code                                                                            |
| `src/features/auth/components/AuthFormCard.tsx`                      | `Auth / Form Container`                                                               | Claude Code                                                                            |
| `src/features/auth/components/AuthTextField.tsx`                     | `Auth / Input`                                                                        | Claude Code                                                                            |
| `src/features/auth/components/AuthPasswordField.tsx`                 | `Auth / Password Input`, with the show/hide toggle                                    | Claude Code                                                                            |
| `src/features/auth/components/AuthSubmitButton.tsx`                  | `Auth / Primary Button`                                                               | Claude Code                                                                            |
| `src/features/auth/components/AuthTextLink.tsx`                      | `Auth / Text Link`                                                                    | Claude Code                                                                            |
| `src/features/auth/components/PasswordRule.tsx` and `.test.tsx`      | `Auth / Validation Rule`                                                              | **Proposed for Eng. Mariam** (§13; only after her confirmation, otherwise Claude Code) |
| `src/features/auth/components/AuthResultView.tsx`                    | Result views (Email sent, Success, Updated, Invalid and Expired link)                 | Claude Code                                                                            |
| `src/features/auth/model/password-rules.ts`                          | Single source of the password rules (§7)                                              | Claude Code                                                                            |
| `src/features/auth/model/messages.ts`                                | Maps `AuthFailure` and Zod issues to message keys                                     | Claude Code                                                                            |
| `src/features/auth/schemas/*.ts`                                     | Zod field schemas (email, password, name); form schemas arrive in Increments 2–4      | Claude Code                                                                            |
| `src/i18n/messages/ar/authentication.json`, `en/authentication.json` | Copy (§8); English marked DRAFT                                                       | Claude Code                                                                            |
| `src/app/[locale]/(auth)/layout.tsx`                                 | Thin route-group layout that renders `AuthLayout`                                     | Claude Code                                                                            |
| `src/app/[locale]/dev/auth/page.tsx`                                 | Development-only preview (§9)                                                         | Claude Code                                                                            |
| `public/auth/*`                                                      | The three marketing photos exported from Figma (D-08-2)                               | Claude Code                                                                            |
| `src/design-system/icons/*`                                          | Eye and eye-off geometry imported from Figma (`Icon / Eye` in `191:50`)               | Claude Code                                                                            |
| `docs/design-values.md`                                              | Auth values read from Figma (§12)                                                     | Claude Code                                                                            |
| Tests next to each file; `tests/e2e/auth-foundation.spec.ts`         | §11                                                                                   | Claude Code (coordination)                                                             |

## 3. Reuse of existing shared code

| Existing                  | Reused for                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `shared/ui/Logo`          | Horizontal logo in the form column (approved asset, same Figma image)                |
| `shared/ui/Icon`          | `alert` (field and form errors) and `check` (result views); eye icons added          |
| `shared/ui/Ltr`           | Isolating email values, placeholders, numerals and "AI" inside Arabic                |
| Design tokens, typography | Every colour and spacing value; the four Validation Rule colours are existing tokens |
| `availability.ts`         | Unchanged; Auth routes stay 404 in production                                        |

**Not reused, by design:** `shared/ui/Button` and `shared/ui/Input`. The Auth Figma sets are
different component sets (52 high, 480 wide, a Loading state), and the rule is one component per
Figma set. No shared component is copied or forked.

## 4. Component contracts

All components are presentational. They render the state they are given; validation and
submission live in the form (Increments 2–4). Copy arrives as props from `authentication.json`.

| Component           | Props (TypeScript, abridged)                                                                                           | States                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `AuthLayout`        | `family: "login" \| "register" \| "recovery"`, `marketing: { heading, lead, body }`, `children`                        | Desktop, Tablet and Mobile order (§5)             |
| `AuthFormCard`      | `heading`, `description`, `formError?: string`, `children`, `footer?: ReactNode`                                       | With and without the form-level alert             |
| `AuthTextField`     | `label`, `error?`, plus native input props (`type`, `autoComplete`, `name`, `value`, `onBlur`, …), `ref`               | Default, Focus (CSS), Error, Disabled             |
| `AuthPasswordField` | Same as `AuthTextField`, plus `visible: boolean`, `onVisibleChange(v)`, `toggleLabels: { show, hide }`, `describedBy?` | Default, Focus, Error, Disabled × Hidden, Visible |
| `AuthSubmitButton`  | `children`, `loading?: boolean`, `loadingLabel: string`, native button props                                           | Default, Focus, Disabled, Loading                 |
| `AuthTextLink`      | `href` (route key, localized), `children`                                                                              | Default, Hover (CSS)                              |
| `PasswordRule`      | `label: string`, `state: "neutral" \| "valid" \| "error"`                                                              | Neutral, Valid, Error                             |
| `AuthResultView`    | `icon: "check" \| "alert"`, `heading`, `body`, `actions: ReactNode`                                                    | One component for the five result views           |

## 5. Responsive rules (Figma §3.7)

| Width                | Layout                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Desktop (from 1024)  | Two columns: form column 480 on the inline-start side (Logo 188 × 49 above the card); marketing panel 520 on the inline-end side |
| Tablet (768 to 1023) | Logo centred; marketing panel (672 at 768) **first**; form card 480 centred below                                                |
| Mobile (below 768)   | Logo; form card (350 at 390) **first**; marketing panel below                                                                    |
| 320                  | Fluid card; no horizontal overflow                                                                                               |

- DOM order equals visual order at each breakpoint (D-08-9). The order is rearranged with layout,
  not with visual-only reordering that would break reading order.
- The breakpoints follow ADR-004.
- The marketing image is decorative (`alt=""`).

## 6. RTL and LTR strategy

- Logical properties only (`ms`, `me`, `ps`, `pe`, `start`, `end`); no `left` or `right`.
- The form column sits on the inline-start side, so it moves sides with the locale.
- Email inputs keep `dir="ltr"` for the value only, with labels following the document direction.
- Placeholders such as `name@example.com`, numerals in rules ("8 أحرف") and "AI" are isolated with
  `Ltr`.
- Only whitelisted icons mirror; the eye icon does not mirror and the logo never mirrors.

## 7. Validation architecture

- **Libraries (D-08-1):** React Hook Form with `zodResolver`, `mode: "onBlur"` and
  `reValidateMode: "onChange"`. Errors show on blur and on submit, and clear as soon as the value
  is valid.
- **Schemas:**
  - live in `features/auth/schemas`;
  - produce message **keys**, never strings;
  - `model/messages.ts` maps keys to `authentication.json` copy.
- **Password rules:**
  - defined once in `model/password-rules.ts`: at least 8 characters, upper and lower case, at
    least one digit (Figma);
  - the Zod schema and the `PasswordRule` list both read that list, so the two cannot drift;
  - Phase 21 aligns it with the backend policy (R08-2).
- **Messages (D-08-5):** Figma wording is reused where the meaning matches, and no new messages
  are invented. The only new copy is the unavailable-state message (§14).
- **No secrets:** no form value is logged, persisted or put in a URL.

## 8. Message-file structure (`authentication.json`, ar and en)

```text
auth.marketing.{login,register,recovery}.{heading,lead,body}
auth.login.{heading,description,email,password,forgot,submit,submitting,noAccount,register}
auth.register.{heading,description,name,email,password,confirm,submit,submitting,hasAccount,login,success.{heading,body}}
auth.forgot.{heading,description,email,submit,submitting,back,sent.{heading,body,resend}}
auth.reset.{heading,description,password,confirm,submit,submitting,back,updated.{heading,body},invalidLink.{heading,body,request},expiredLink.{heading,body,request}}
auth.rules.{length,case,digit}
auth.validation.{nameRequired,emailRequired,emailInvalid,passwordRequired,confirmRequired,newPasswordRequired,confirmNewRequired,passwordRules,mismatch}
auth.errors.{invalidCredentials,registerFailed,forgotFailed,resetFailed,unavailable}
auth.password.{show,hide}
auth.common.retry
```

- **Arabic:** verbatim from Figma.
- **English:** DRAFT translations (D-08-3), marked as drafts in the review table, not approved.
- **Tests:** a key-parity test covers both locales.
- **Production:** English Authentication stays disabled (`/en/*` Auth routes are 404 like `/en`).

## 9. Development-only preview strategy (D-08-4)

- **Route:** `/dev/auth`. Like the other `/dev/*` pages, it calls `notFound()` in production
  builds; a production smoke test asserts the 404.
- **Increment 1 content:** a component gallery (every component state) and the layout at each
  breakpoint, with no submit behaviour.
- **Later increments:** the preview adds full screen states, including Success, Email sent and
  Updated, through a preview-only fixture.
- **Labelling:** every preview page shows a visible "Development preview — not functional
  authentication" banner.
- **Never:** previews never call the adapter's real methods, never run in production and are
  never cited as backend evidence.

## 10. Adapter boundary and route protection contract (D-08-4, D-08-6)

```ts
// src/types/auth.ts (abridged)
export type AuthFailure =
  "unavailable" | "invalid-credentials" | "rejected" | "invalid-link" | "expired-link";
export type AuthResult = { ok: true } | { ok: false; failure: AuthFailure };
export type AuthSession = { readonly userId: string } | null; // shape owned by D-02
export type RouteAccess = "public" | "guest-only" | "protected"; // contract only

// src/api/adapters/auth.ts (abridged)
export interface AuthAdapter {
  signIn(input: { email: string; password: string }): Promise<AuthResult>;
  register(input: { name: string; email: string; password: string }): Promise<AuthResult>;
  requestPasswordReset(input: { email: string }): Promise<AuthResult>;
  resetPassword(input: { token: string; password: string }): Promise<AuthResult>;
  getSession(): Promise<AuthSession>;
}
export const placeholderAuthAdapter: AuthAdapter; // every method: { ok: false, failure: "unavailable" }; getSession: null; no network
```

- **Placeholder adapter:**
  - it fails closed and makes no `fetch`, storage or cookie access;
  - a unit test asserts this, including that no network call happens.
- **Route protection contract:**
  - `RouteAccess` assigns each route group an access level: Landing `public`; `(auth)`
    `guest-only`; `(app)` and `(focus)` `protected`;
  - this is documentation and types only;
  - **no guard code runs and nothing redirects** in Phase 08;
  - the functional guard is a later integration dependency, with the real adapter and D-02.

## 11. Test strategy (Increment 1)

| Level      | Tests                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | Password rules (7 / 8 characters, case, digit); field schemas; message-key mapping; placeholder adapter fails closed with no network; key parity ar and en |
| Component  | Every component state; `aria-invalid` and `aria-describedby`; toggle `aria-pressed` and name; Loading `aria-busy` and no double submit; result view focus  |
| E2E (dev)  | `/dev/auth` renders at 1440, 768, 390 and 320 with no overflow; axe with no violations, ar and en; DOM order equals visual order per breakpoint            |
| Production | `/dev/auth` returns 404; the existing Auth 404 and Landing smoke tests are unchanged                                                                       |
| Gates      | `corepack pnpm check`, `test:e2e`, `test:e2e:prod`; CI `check` and `e2e` on the PR head                                                                    |

## 12. Values to read from Figma before use (recorded in design-values, never invented)

- Background glow: three ellipses (colours, opacity, blur, positions per breakpoint).
- Marketing panel: radius, border, image crop per breakpoint (520 × 350, 672 × 350, 350 × 200).
- Form card: padding, gaps (header, fields, action, footer), widths 480 and 350.
- Input and password input: heights, radius, border colours per state, icon spacing.
- Primary button: 52 height, colours for Default, Focus, Disabled and Loading, spinner.
- Text link colours; result-view icon sizes.
- Remaining `Auth/*` text styles beyond design-values §0.4.5.
- Validation rule (read): dot 6 × 6, gap 6; Cairo Regular 12 / 150 %; colours Neutral
  `text-muted-readable` + `text-muted` dot, Valid `accent-success-green`, Error
  `accent-coral-pulse`; list gap 16 (`191:72`).

## 13. Proposed task for Eng. Mariam (not assigned; needs her confirmation)

| Item                  | Detail                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component             | `PasswordRule` (Figma `Auth / Validation Rule`, set `191:72`; variants Neutral `191:63`, Valid `191:66`, Error `191:69`)                                                                                                   |
| Allowed files         | `src/features/auth/components/PasswordRule.tsx` and `src/features/auth/components/PasswordRule.test.tsx` only                                                                                                              |
| Props                 | `label: string` (copy from the caller); `state: "neutral" \| "valid" \| "error"`                                                                                                                                           |
| Layout                | Inline row, gap 6: a 6 × 6 dot, then the label. Cairo Regular 12 / 150 %. RTL by document direction (logical properties)                                                                                                   |
| Colours (tokens only) | Neutral: label `text-muted-readable`, dot `text-muted`. Valid: both `accent-success-green`. Error: both `accent-coral-pulse`                                                                                               |
| Responsive            | Same at every breakpoint; the parent lays out the list (gap 16, wraps on narrow screens)                                                                                                                                   |
| Accessibility         | The dot is decorative (`aria-hidden`). The state is not conveyed by colour alone: a visually hidden status ("met", "not met") from a `statusLabel` prop. No live region inside the component (the form owns announcements) |
| Tests                 | Renders the label; each state applies its token classes; the dot is `aria-hidden`; the status text is present for valid and error; RTL and LTR render; axe has no violations                                               |
| Acceptance            | Matches the three Figma variants; tokens only, no hard-coded colours; no copy inside the component; `corepack pnpm typecheck`, `lint`, `format:check` and `test` pass                                                      |
| Not allowed           | Any other file, including `authentication.json`, schemas and `password-rules.ts`; new dependencies; changes to shared components                                                                                           |
| Delivery              | Offline workflow (TEAM_COLLABORATION.md): starter package from a pushed commit, delivery patch, integration branch `delivery/auth-password-rule-v1`                                                                        |

The final prop list adds `statusLabel: string`; the contract is fixed before the starter package is
made. If Mariam does not confirm, Claude Code builds it within Increment 1.

## 14. Acceptance criteria (Increment 1)

- Dependencies are installed in a separate `chore(deps)` commit, and ADR-001 records the versions.
- The architecture and file ownership match §2; dependency-cruiser passes with no new violation.
- The seven components and `AuthLayout` match their Figma sets at 1440, 768 and 390 (values from
  §12 recorded first), with tokens only.
- The placeholder adapter fails closed with no network. No guard exists and nothing redirects.
- `authentication.json` holds all copy: Arabic is verbatim and English is DRAFT; key parity passes.
- `/dev/auth` works in development, shows the preview banner, and returns 404 in production.
- Production is unchanged: Auth routes 404, `AUTHENTICATION_AVAILABLE = false`, and all other
  gates untouched.
- All §11 tests pass, with CI `check` and `e2e` green on the PR head.

## 15. Decisions requested with this contract

| ID   | Decision                                                                                         | Recommendation                                                                 |
| ---- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| I1-1 | Approve this execution contract                                                                  | Approve                                                                        |
| I1-2 | Unavailable-state message wording (no Figma source); proposed: "تسجيل الدخول غير متاح حاليًا."    | Owner to approve or reword; the form-specific variants follow the same wording |
| I1-3 | Offer `PasswordRule` to Eng. Mariam (§13)                                                        | Offer it; begin only after her confirmation                                    |
| I1-4 | Marketing photo format: export from Figma at source size as PNG, then serve through `next/image` | Approve (composition and crop preserved; no regeneration)                      |

## 16. Owner decisions and implementation record (2026-11-23)

### 16.1 Decisions

| ID   | Decision                                                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1-1 | Contract **APPROVED**                                                                                                                                                  |
| I1-2 | **APPROVED WITH COPY REFINEMENT**: one unavailable message per operation (see below). English stays DRAFT; nothing simulates success                                   |
| I1-3 | **APPROVED TO OFFER**: `PasswordRule` to Eng. Mariam, with the exact two-file boundary. Work waits for her explicit confirmation; otherwise it is built in Increment 1 |
| I1-4 | **APPROVED**: the three photos as PNG at source size, served through `next/image`; sources recorded (design-values §17.3)                                              |

The approved unavailable messages:

- Login: "تسجيل الدخول غير متاح حاليًا."
- Register: "إنشاء الحساب غير متاح حاليًا."
- Forgot Password: "استعادة كلمة المرور غير متاحة حاليًا."
- Reset Password: "إعادة تعيين كلمة المرور غير متاحة حاليًا."

### 16.2 Deviations from §2 to §10

Each deviation was recorded during implementation.

- **Message file name:** the namespace is `authentication` (`authentication.json`). The repository's
  secrets guard reserves the name of a credential file for the shorter name, so the file uses the
  longer one. The content and structure are as in §8.
- **No route-group layout:** each Auth screen uses a different marketing panel (Login, Register
  or Recovery), so one `(auth)/layout.tsx` cannot choose it. A group layout would also restyle the
  Phase 04 placeholders and break their tests. Each screen composes `AuthLayout` in its own
  increment; Increment 1 shows it only on `/dev/auth`.
- **Breakpoints:** ADR-004 (Tablet from 720, Desktop from 1280) instead of "Desktop from 1024".
  The 1096 px two-column layout fits from 1280.
- **Eye icon:** feature-local `AuthEyeIcon` (like the Landing `PauseIcon`). The Figma eye is a local
  frame inside `Auth / Password Input`, not one of the official 24 × 24 `Icon / *` components, so
  it is not added to the icon manifest.
- **Password toggle:** one constant accessible name ("إظهار كلمة المرور") with `aria-pressed` for the
  state, instead of two swapping labels (more robust for assistive technology).
- **Typography:** all 12 `Auth/*` Figma styles exist as tokens (`typography-auth.css`, design-values
  §0.4.5). There is no unstyled text.
- **New accessibility copy, not in Figma** (proposed, for owner review):
  - the toggle names "إظهار كلمة المرور" and "إخفاء كلمة المرور";
  - the rule status words "متحقق" and "غير متحقق";
  - the development preview banner (development fixture only).
- **E2E warm-up:** `/dev/auth` and `/en/dev/auth` were added to `tests/e2e/global-setup.ts`. A cold
  dev server failed under parallel workers with the known "Unexpected end of JSON input" compile
  race (2026-11-13).

### 16.3 Implemented (`phase/08-increment-1-foundation`)

- **Dependencies:** `react-hook-form` 7.91.0, `zod` 4.6.7 and `@hookform/resolvers` 7.0.5, as a
  separate `chore(deps)` commit with an ADR-001 update.
- **Types and adapter:**
  - `src/types/auth.ts`: failure, result and session types, plus the route protection contract
    (types only).
  - `src/api/adapters/auth.ts`: the interface and the fail-closed placeholder (no network, no
    storage, frozen).
- **Feature code:**
  - components: `AuthLayout`, `AuthMarketingPanel`, `AuthFormCard` (with `AuthCardHeader`,
    `AuthCardFooter` and `AuthErrorBanner`), `AuthTextField`, `AuthPasswordField`,
    `AuthSubmitButton`, `AuthTextLink`, `AuthResultView` and `AuthEyeIcon`;
  - model: `password-rules.ts`, `messages.ts` and `auth-images.ts`;
  - schemas: `schemas/fields.ts`.
- **Copy:** `authentication.json` (ar verbatim, en DRAFT), registered with key parity.
- **Preview:** `/dev/auth` (404 in production), with a banner and the query options `family` and
  `view`.
- **Tests:**
  - unit and component (jsdom, jest-axe);
  - `tests/e2e/auth-foundation.spec.ts`;
  - a production smoke check that `/dev/auth` returns 404.
- **`PasswordRule`:** added at finalization (§16.4).

### 16.4 Finalization (owner decisions, 2026-11-23)

| ID  | Decision                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-1 | **APPROVED** accessibility copy: "إظهار كلمة المرور", "إخفاء كلمة المرور", "متحقق", "غير متحقق"                                                                                  |
| F-2 | `PasswordRule` offered to Eng. Mariam; no explicit confirmation was received, so it was built internally (I1-3 fallback). No starter package was issued and nothing was assigned |
| F-3 | **ACCEPTED**: ADR-004 breakpoints (Mobile < 720, Tablet 720–1279, Desktop ≥ 1280), verified at 390, 720, 768, 1024, 1280 and 1440                                                |
| F-4 | PR #75 stays a draft until every Increment 1 criterion passes; merge only with explicit owner approval                                                                           |

**Implemented:**

- `src/features/auth/components/PasswordRule.tsx`: `PasswordRule` (one `li`) and
  `PasswordRuleList` (the `ul`, gap 16, wrapping, `aria-live="polite"`), with
  `PasswordRule.test.tsx`;
- `PasswordRulesDemo.tsx`: a preview-only client demo on `/dev/auth` (a password field linked to
  the list with `aria-describedby`), replacing the static rule line.

**Accessibility decisions:**

- **Toggle (toggle-button pattern):** the accessible name stays "إظهار كلمة المرور" and
  `aria-pressed` carries the state. A name that switches to "إخفاء كلمة المرور" while pressed would
  contradict the pressed state, so the approved hide label stays in the messages but is not the
  button's name. E2E checks that the name is constant across both states.
- **Rule announcements:** each row ends with a visually hidden status word and is `aria-atomic`;
  the list is a polite live region, so a change is read as the whole row ("حرف كبير وحرف صغير متحقق").
  Screen readers that do not announce live changes still read the status word when they reach it.
- **Not by colour alone (WCAG 1.4.1):** the Figma variants differ only by colour. The marker now
  also changes shape: Neutral keeps the Figma 6 × 6 dot, Valid shows the official `check` icon and
  Error the official `x` icon, both 12 px in the 12 px marker box. **Deviation from Figma**, for
  owner review.

**Responsive measurements (Chromium, `/dev/auth`, no horizontal overflow at any width, 320
included):**

| Width | Layout  | Visual and DOM order | Panel | Card | Notes                                               |
| ----- | ------- | -------------------- | ----- | ---- | --------------------------------------------------- |
| 390   | Mobile  | logo, form, panel    | 350   | 350  | Figma Mobile frame (20 side margins)                |
| 720   | Tablet  | logo, panel, form    | 624   | 480  | First Tablet width; fluid, 48 side margins          |
| 768   | Tablet  | logo, panel, form    | 672   | 480  | Figma Tablet frame                                  |
| 1024  | Tablet  | logo, panel, form    | 928   | 480  | Fluid between frames (no Figma frame at this width) |
| 1280  | Desktop | form, panel (row)    | 520   | 480  | Row 1096 centred (start 92); gap 96                 |
| 1440  | Desktop | form, panel (row)    | 520   | 480  | Figma Desktop frame (start 172); gap 96             |

Validation rule geometry at 1440 and 390: dot 6 × 6, marker–label gap 6, rule gap 16, type
12 / 18; the first rule (length) is on the inline start.

**Remaining deviations (for owner review):** the rule marker shapes above; the Tablet panel is fluid
between 720 and 1279 (Figma defines only 768); and the §16.2 items.
