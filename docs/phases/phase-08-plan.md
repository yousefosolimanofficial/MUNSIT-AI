# Phase 08 — Authentication UI — Plan

- **Status:** **PLAN APPROVED (owner, 2026-11-23)** with decisions D-08-1 to D-08-10 (§13).
  Implementation has **not** started. Increment 1 starts only after the owner approves its
  execution contract.
- **Baseline:** `main` `2f6d328`. Phase 07 is CLOSED — IMPLEMENTATION COMPLETE — PRODUCTION
  RELEASE BLOCKED. CI `check` and `e2e` pass.
- **Roadmap:** Phase 08, "UI-complete, not functional"; gate D-02.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, page `5:5` "02 — Authentication". The audit (§3) was
  read-only, 2026-11-23.
- **Production:** unchanged. `AUTHENTICATION_AVAILABLE` stays `false` and the Auth routes keep
  returning 404 in production (P07-D24, P07-D25). Phase 08 UI is visible in development and
  preview only.

## 1. Scope

**In scope (Roadmap Phase 08):**

- **Screens:** every Authentication screen and state on Figma page 02 (§2, §3), as UI.
- **Forms:** validation on blur; errors clear as soon as the value is valid.
- **States:** loading, error and success, from Figma.
- **Adapter:** a provider-agnostic `AuthAdapter` interface, with a **placeholder adapter that fails
  closed**.
- **Route protection contract:** the future integration boundary and the route protection
  contract are defined (types and documentation). **No guard is implemented or activated**, and no
  user is redirected based on simulated authentication state (D-08-6).
- **Flow map:** this document (§3).

**Out of scope, Phase 21 and gate D-02:**

- a real provider, sessions, tokens or cookies;
- password-recovery mechanics (link token, expiry, resend limits);
- email delivery;
- route protection with real sessions;
- Google sign-in, which is not in page 02 (§3.6).

**Boundary with Phase 21:**

| Area             | Phase 08 (this phase)                                                 | Phase 21 (functional)                                  |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| Forms and states | All Figma screens and states, client validation, accessible errors    | Unchanged UI; server error mapping                     |
| Adapter          | `AuthAdapter` interface; placeholder adapter that always fails closed | Real adapter against the backend contract (D-02)       |
| Session          | `getSession()` returns no session                                     | Real session model, storage and lifetime               |
| Guard            | Contract only (D-08-6); no guard code runs, no redirects              | Guard implemented and enabled with the real adapter    |
| Reset link       | Renders the Invalid and Expired views from an adapter result          | Token verification, expiry rules                       |
| Production       | Routes 404 (`AUTHENTICATION_AVAILABLE = false`)                       | Owner sets `AUTHENTICATION_AVAILABLE = true` (release) |

**Never in Phase 08:**

- a real backend, real sessions, stored credentials or invented endpoints;
- changing `AUTHENTICATION_AVAILABLE`;
- copy that claims working sign-in;
- logging or persisting passwords, tokens or form values;
- simulating a successful sign-in or account creation outside an explicit development-only
  visual preview (D-08-4).

**UI-only behaviour (D-08-4):**

- Forms validate on the client only.
- Submitting creates no account, no session and no stored credential, and calls no endpoint.
- The placeholder adapter returns "unavailable" without any network request, and the form shows
  a clear unavailable-state message.
- Success views appear only in explicit development-only previews. Those previews are labelled
  as previews and are not evidence of backend functionality.

## 2. Screen inventory

**What the frames contain:**

- 108 frames: **32 unique designs × 3 breakpoints = 96 Auth frames**, plus **12 prototype frames**
  (§3.5) that are not Phase 08 screens.
- The designs map onto the **4 existing routes** (Phase 04) and **9 distinct views**.

| Route              | View                 | States (Figma)                                                                                                             |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/login`           | Login form           | Default · Password shown · Loading · Error (invalid credentials)                                                           |
| `/register`        | Register form        | Default · Shown (new only / confirm only / both) · Required · Invalid email · Password rules · Mismatch · Loading · Failed |
| `/register`        | Register success     | Success → Login                                                                                                            |
| `/forgot-password` | Forgot password form | Default · Empty · Invalid email · Loading · Failed                                                                         |
| `/forgot-password` | Email sent           | Email sent → Login, Reset (prototype link), resend                                                                         |
| `/reset-password`  | Reset password form  | Default · Shown (both / new only / confirm only) · Required · Mismatch · Loading · Error                                   |
| `/reset-password`  | Invalid link         | → Forgot password, Login                                                                                                   |
| `/reset-password`  | Expired link         | → Forgot password, Login                                                                                                   |
| `/reset-password`  | Password updated     | → Login                                                                                                                    |

**Not in the designs:**

- email verification or OTP;
- terms or consent checkbox;
- "remember me";
- Google or any social sign-in;
- a language toggle or a link back to the Landing.

None of these is added (§13).

## 3. Figma references (page `5:5`)

Columns are the frame IDs for Desktop 1440 / Tablet 768 / Mobile 390. Tablet and Mobile heights
vary with content.

### 3.1 Login

| State          | Desktop      | Tablet       | Mobile       |
| -------------- | ------------ | ------------ | ------------ |
| Default        | `67:3`       | `67:59`      | `67:37`      |
| Password shown | `2541:2980`  | `2541:3029`  | `2541:3077`  |
| Error          | `2467:75609` | `2467:75701` | `2467:75792` |
| Loading        | `2480:2916`  | `2480:3880`  | `2480:4843`  |

### 3.2 Register

| State               | Desktop     | Tablet      | Mobile      |
| ------------------- | ----------- | ----------- | ----------- |
| Default             | `67:14`     | `67:66`     | `67:44`     |
| Shown: new only     | `2555:3004` | `2555:3212` | `2555:3417` |
| Shown: confirm only | `2555:3068` | `2555:3275` | `2555:3480` |
| Shown: both         | `2555:3132` | `2555:3338` | `2555:3543` |
| Required            | `2480:2004` | `2480:2979` | `2480:3942` |
| Invalid email       | `2480:2124` | `2480:3098` | `2480:4061` |
| Password rules      | `2480:2226` | `2480:3199` | `2480:4162` |
| Mismatch            | `2480:2331` | `2480:3303` | `2480:4266` |
| Loading             | `2480:2436` | `2480:3407` | `2480:4370` |
| Success             | `2480:2534` | `2480:3504` | `2480:4467` |
| Failed              | `2480:2636` | `2480:3605` | `2480:4568` |

### 3.3 Forgot password

| State         | Desktop      | Tablet       | Mobile       |
| ------------- | ------------ | ------------ | ------------ |
| Default       | `67:25`      | `67:73`      | `67:51`      |
| Empty         | `2480:2741`  | `2480:3709`  | `2480:4672`  |
| Invalid email | `2480:2785`  | `2480:3752`  | `2480:4715`  |
| Loading       | `2480:2829`  | `2480:3795`  | `2480:4758`  |
| Failed        | `2480:2869`  | `2480:3834`  | `2480:4797`  |
| Email sent    | `2467:75582` | `2467:75675` | `2467:75766` |

### 3.4 Reset password

| State               | Desktop     | Tablet      | Mobile      |
| ------------------- | ----------- | ----------- | ----------- |
| Default             | `2480:345`  | `2480:860`  | `2480:1366` |
| Shown: both         | `2480:403`  | `2480:917`  | `2480:1423` |
| Shown: new only     | `2550:2872` | `2553:2916` | `2553:3033` |
| Shown: confirm only | `2550:2927` | `2553:2970` | `2553:3087` |
| Required            | `2480:461`  | `2480:974`  | `2480:1480` |
| Mismatch            | `2480:535`  | `2480:1047` | `2480:1553` |
| Loading             | `2480:601`  | `2480:1112` | `2480:1618` |
| Error               | `2480:659`  | `2480:1169` | `2480:1675` |
| Invalid link        | `2480:724`  | `2480:1233` | `2480:1739` |
| Expired link        | `2480:770`  | `2480:1278` | `2480:1784` |
| Updated             | `2480:816`  | `2480:1323` | `2480:1829` |

### 3.5 Prototype frames (not Phase 08 screens)

| Frames                                                                             | Purpose                                                                |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Dashboard reference `2481:1398` / `2481:1922` / `2481:2406`                        | Login Loading → Dashboard after a timeout (destination only; Phase 09) |
| User Menu overlay `2490:3703` / `2490:3935` / `2490:4104`                          | Dashboard → User Menu (Phase 05 shell)                                 |
| Settings Overview `2490:3487` / `2490:3733` / `2490:3965`                          | User Menu → Settings (Phase 19)                                        |
| Prototype test "invalid credentials entry" `2490:2372` / `2490:2414` / `2490:2455` | Entry point that leads to Login Error                                  |

### 3.6 Flows (16 prototype starting points)

There are 16 starting points: 6 on Desktop, 5 on Tablet and 5 on Mobile. They are named "Flow 1"
(Desktop), "Flow 2" (Tablet) and "Flow 3" (Mobile). Three Settings starts are misnamed "My
Lectures — Desktop / Tablet / Mobile". They form **6 journeys**:

1. **Sign in:**
   - from Login (`67:3` / `67:59` / `67:37`): Show password, Forgot, Register and Loading;
   - Loading leads to the Dashboard reference after a timeout;
   - Login Loading (`2480:2916` / `3880` / `4843`) and Login Shown (`2541:2980` / `3029` / `3077`)
     are also starting points.
2. **Invalid credentials:** Prototype test (`2490:2372` / `2414` / `2455`) → Login Error.
3. **Recover access:** Forgot → Empty → Invalid email → Loading → Email sent (after a timeout) →
   Reset password (through the demo link) or Login. Failed retries to Loading.
4. **Reset password:** Default ↔ Shown variants → Required → Mismatch → Loading → Updated (after a
   timeout) → Login. Error retries. Invalid and Expired link → Forgot or Login.
5. **Register:** Default ↔ Shown variants → Required → Invalid email → Password rules → Mismatch →
   Loading → Success (after a timeout) → Login. Failed retries.
6. **After sign-in (reference, outside Phase 08):** Dashboard reference (`2481:1398`, Desktop only)
   → User Menu → Settings (`2490:3487` / `3733` / `3965`).

**Notes:**

- **Inbound links:** Failed, Error, Invalid link and Expired link have none in the prototype. The
  UI reaches them through adapter results (§8, D-08-4).
- **Hover links:** the prototype links to Dashboard chart variants on hover (`2222:*`); these are
  outside Phase 08.

### 3.7 Layout (read from `67:3`, `67:59`, `67:37`)

| Breakpoint   | Structure                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop 1440 | Background glow (3 ellipses). Form column 480 on the inline-start side (right in RTL), with Logo 188 × 49 above the Form Container. Marketing panel 520 (image 520 × 350 plus copy) on the inline-end side |
| Tablet 768   | Logo centred at the top; marketing panel 672 wide; Form Container 480 centred **below** the panel                                                                                                          |
| Mobile 390   | Logo; Form Container 350 **first**; marketing panel 350 (image 350 × 200) **below** the form                                                                                                               |

The order changes between breakpoints: on Tablet the form comes after the panel, on Mobile before
it. The source order must follow reading order on every breakpoint (D-08-9).

### 3.8 Copy

- The Arabic copy is colloquial Egyptian; it is used verbatim, from the Figma texts read during the
  audit.
- The brand appears as both "مُنصت AI" and "منصت"; kept as in Figma.
- **There are no English frames.** English copy is a proposal pending approval, as for P07-D1
  (D-08-3).
- **Login has no Required or Invalid email frames.** Register and Forgot have them ("اكتب بريدك
  الإلكتروني.", "اكتب بريد إلكتروني صحيح.", "اكتب كلمة المرور."). Reusing these messages on Login
  is D-08-5.
- **The Email sent view contains a prototype-only link:** "عرض تجريبي: افتح رابط إعادة التعيين من
  البريد" (D-08-7).

### 3.9 Assets

| Asset           | Use                     | Source (Figma image fill)                                             |
| --------------- | ----------------------- | --------------------------------------------------------------------- |
| Login photo     | Login marketing panel   | `10ec5a97e7…`, 1200 × 896 (`2175:285`)                                |
| Recovery photo  | Forgot and Reset panels | `f246a9bb43…`, 1264 × 848 (`2175:408`)                                |
| Register photo  | Register panel          | `53cf19a01a…`, 1200 × 896 (`2175:400`)                                |
| Horizontal logo | Form column             | Existing approved `Munsit_Logo_Horizontal.png` (same hash, 908 × 236) |

Exporting the three photos from Figma at their source size needs owner approval (D-08-2).

## 4. Components

Figma component sets on page 02 are local to the file. Each one becomes one component, with
variants and states as props or interaction states, never copies (CLAUDE.md). They are
Auth-specific, so they live in `src/features/auth/components`.

| Figma set                | Variants                                               | Component           | Notes                                                       |
| ------------------------ | ------------------------------------------------------ | ------------------- | ----------------------------------------------------------- |
| `Auth / Form Container`  | Screen = Login, Register, Forgot Password              | `AuthFormCard`      | Header, fields, primary action, footer link. 480 / 350 wide |
| `Auth / Input`           | State = Default, Focus, Error, Disabled                | `AuthTextField`     | Not the shared `Input` (a different Figma set)              |
| `Auth / Password Input`  | State × Visibility (Hidden, Visible): 8 variants       | `AuthPasswordField` | Show/hide toggle is a real button with a state label        |
| `Auth / Primary Button`  | State = Default, Focus, Disabled, Loading              | `AuthSubmitButton`  | 52 high; Loading keeps the width and announces busy state   |
| `Auth / Text Link`       | State = Default, Hover                                 | `AuthTextLink`      | Route links only (Login, Register, Forgot)                  |
| `Auth / Validation Rule` | State = Neutral, Valid, Error                          | `PasswordRule`      | Live password-rule list (Register, Reset)                   |
| Layout frames            | Background Glow, Marketing Panel, Form Column, Logo    | `AuthLayout`        | `(auth)` route-group layout; uses the shared `Logo`         |
| Result views             | Email sent, Success, Updated, Invalid and Expired link | `AuthResultView`    | One component with props (icon, title, text, actions)       |

**Shared code reused:** `Logo` (horizontal) and `Icon` (alert, check). `Button` and `Input` are not
reused, because the Auth sets differ (sizes 52 and 480 and a Loading state).

**Values:** typography `Auth/*` is partly extracted (design-values §0.4.5, 4 of 108 frames). The
remaining sizes, colours and glow values are read from Figma and recorded in design-values before
use; nothing is invented.

## 5. Responsive requirements

- Match 1440, 768 and 390 against §3 frames, with the reordering in §3.7.
- No horizontal overflow at 320. Tablet and Mobile scroll as a document.
- Form widths are 480 on Desktop and Tablet, 350 on Mobile, and fluid below 390.

## 6. Accessibility requirements (WCAG 2.2 AA)

- **Labels:** every field has a visible label.
- **Errors:**
  - field errors are linked through `aria-describedby`, with `aria-invalid` set;
  - form-level errors (Login Error, Failed, Reset Error) sit in an alert region that is announced
    once.
- **Autofill:** `autocomplete` is `email`, `current-password`, `new-password` or `name`; inputs
  use `type="email"` and `type="password"`.
- **Show/hide password:**
  - it is a keyboard-operable `button` with `aria-pressed` and a localised name;
  - it never submits the form, and the value is never logged.
- **Submit:**
  - Loading sets `aria-busy` and prevents double submit;
  - Disabled is native.
- **Focus:**
  - on a failed submit, focus moves to the first invalid field;
  - on a result view, focus moves to its heading.
- **Structure:**
  - one `h1` per view and a logical heading order;
  - landmarks (`main`) and a visible focus ring;
  - the marketing image is decorative (`alt=""`) unless it carries meaning (D-08-9).
- **Keyboard:** full keyboard operation. The prototype's timed transitions (`AFTER_TIMEOUT`) are
  never automatic in the product.

## 7. Localization requirements

- Arabic (`ar`) is the default and RTL; English (`en`) is LTR. The routes are unchanged.
- All copy lives in `src/i18n/messages/{ar,en}/auth.json`, with key-parity tests. Components hold
  no copy.
- **Isolate LTR content inside RTL:** email values, placeholders such as `name@example.com`,
  numerals in rules ("8 أحرف"), and "AI".
- Use logical properties only; mirror icons only from the whitelist.
- English copy is proposed, not approved (D-08-3).

## 8. Increment breakdown

Each increment is one PR, merged only after owner review. Tasks are no longer than 3 days.

| #   | Increment                 | Content                                                                                                                                                                                                                         | Depends on             |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0   | Planning                  | This plan (docs only)                                                                                                                                                                                                           | —                      |
| 1   | Auth foundation           | Dependencies (D-08-1); `features/auth` skeleton; `AuthAdapter` interface and fail-closed placeholder adapter; `AuthLayout` with assets; `auth.json` (ar, en proposed); the 7 components with unit tests; design values recorded | D-08-1, D-08-2, D-08-9 |
| 2   | Login                     | Zod schema; all Login states; adapter call; error mapping                                                                                                                                                                       | 1, D-08-4, D-08-5      |
| 3   | Register                  | Zod schema with password rules; all Register states; success view                                                                                                                                                               | 1, D-08-4              |
| 4   | Forgot and Reset password | Both forms; Email sent; Invalid, Expired and Updated views; resend button UI only                                                                                                                                               | 1, D-08-4, D-08-7      |
| 5   | Verification              | Route protection contract review (no guard code); visual baselines; axe; keyboard; flow navigation E2E; production 404 still holds; closure report                                                                              | 2–4, D-08-6, D-08-8    |

**How states are reviewed:**

- The placeholder adapter never succeeds, so Success, Email sent and Updated are not reachable by
  submitting.
- They are covered by component tests.
- For visual review, an explicit development-only preview renders them (D-08-4, approved). It is
  labelled as a preview, uses a preview-only adapter fixture, never reaches production and is not
  evidence of backend functionality.

## 9. Acceptance criteria

- **Coverage:** every view and state in §2 and §3 renders, at 1440, 768 and 390, ar and en,
  matching Figma or a documented, approved difference.
- **Form behaviour:**
  - field errors appear on blur and on submit, and clear as soon as the value is valid;
  - the password rules update live;
  - submit is disabled while loading.
- **Security:**
  - no password, token or form value is logged, persisted or sent anywhere except the adapter call;
  - the placeholder adapter fails closed.
- **Production:**
  - the Auth routes still return 404 and Landing entry points stay hidden;
  - `AUTHENTICATION_AVAILABLE` is unchanged.
- **Accessibility:** everything in §6.
- **Universal checks (Roadmap §4):** RTL and LTR, 320 overflow, keyboard pass, automated a11y.
- **Copy:** Arabic copy is verbatim from Figma; there are no product or functional claims beyond
  Figma.

## 10. Test strategy

| Level      | Tests                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | Zod schemas (boundary values: empty, 7 / 8 characters, case, digit, mismatch); placeholder adapter fails closed; message key parity |
| Component  | Each component's states; blur validation and error clearing; show/hide toggle; loading and double-submit guard; focus management    |
| E2E (dev)  | Flow navigation for the §3.6 journeys; keyboard-only completion of each form; axe at 1440, 768, 390 and 320, ar and en              |
| Visual     | Screenshot baselines per view at 1440, 768 and 390; success views through the development-only preview                              |
| Production | Existing smoke tests: Auth routes 404, Landing entry points hidden (unchanged)                                                      |
| Guard      | None in Phase 08 (D-08-6); the redirect test belongs to the later integration with a real adapter                                   |

## 11. Risks and dependencies

| ID           | Risk or dependency                                                                       | Mitigation                                                                   |
| ------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| D-02         | Provider, session, token storage, route protection and recovery rules are unresolved     | Adapter boundary; no wiring; no guard; "UI-complete, not functional"         |
| R08-1        | The fail-closed result has no matching Figma message on Login (only invalid credentials) | D-08-4: choose a non-misleading message; never say the credentials are wrong |
| R08-2        | Password rules in Figma may differ from the eventual backend policy                      | Rules as UI constants in one schema; Phase 21 aligns them                    |
| R08-3        | Reset link token handling is undefined                                                   | Views driven by an adapter result; no token parsing beyond passing it on     |
| R08-4        | A guard redirecting every `(app)` route would break development screens and tests        | No guard in Phase 08; contract only (D-08-6)                                 |
| R08-5        | Image weight on Mobile (three photos)                                                    | Export at source size, `next/image` sizing; measure, not a target (D-12)     |
| R08-6        | Typography fallback (Phase 07 §8f)                                                       | Same font stack; differences documented                                      |
| Dependencies | React Hook Form and Zod are not installed (ADR-001 defers them to this phase)            | D-08-1: `chore(deps)` commit, ADR-001 update                                 |

## 12. Definition of Done (Phase 08)

- **Roadmap acceptance:** every Figma screen and flow is reachable by route or by an adapter
  result, with field-level errors, disabled and loading submit, no secrets logged, linked error
  text, correct autofill and an accessible show/hide toggle.
- **Tests:** §10 passes, and the universal checks (Roadmap §4) pass.
- **Copy:** all Auth copy lives in `auth.json`.
- **Reporting:** Phase 08 is reported as **"UI-complete, not functional"** until Phase 21 and D-02
  are resolved.
- **Production:** unchanged (Auth routes 404).
- **Records:** the closure report is written and `PROGRESS.md` is updated. Phase 09 has not
  started.

## 13. Owner decisions (2026-11-23)

| ID      | Decision                                                                                                                                                                                                                                                                                                                                                                               | Status                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| D-08-1  | **Form libraries.** React Hook Form, Zod and `@hookform/resolvers`, with dependencies kept minimal. Installed in Increment 1 as a separate `chore(deps)` commit; ADR-001 records the decision                                                                                                                                                                                          | **APPROVED**                   |
| D-08-2  | **Marketing assets.** Export the three approved photos from Figma (§3.9), preserving the original composition, approved cropping, brand colours and responsive use. No generated replacements                                                                                                                                                                                          | **APPROVED**                   |
| D-08-3  | **English copy.** Draft translations for owner review only; not approved. English Authentication is never enabled in production                                                                                                                                                                                                                                                        | **DRAFT ONLY**                 |
| D-08-4  | **Form submission.** Client-side validation only. No account, session or stored credential, and no invented endpoint. A clear unavailable-state message where appropriate. Success views only in explicit development-only previews, never presented as backend evidence                                                                                                               | **APPROVED WITH RESTRICTIONS** |
| D-08-5  | **Validation messages.** Reuse approved wording where the meaning matches (Login empty fields reuse the Register and Forgot messages). All copy lives in message files; no inconsistent new messages                                                                                                                                                                                   | **APPROVED**                   |
| D-08-6  | **Route guard.** Define the future integration boundary and the route protection contract now. No guard is implemented or activated in Phase 08, and nothing redirects from simulated state. The functional guard is a later integration dependency                                                                                                                                    | **MODIFIED APPROVAL**          |
| D-08-7  | **Prototype demo link.** "عرض تجريبي: …" on Email sent is excluded                                                                                                                                                                                                                                                                                                                     | **APPROVED**                   |
| D-08-8  | **Ownership.** Claude Code owns architecture, integration, technical contracts, test coordination and final implementation review. Eng. Mariam may receive isolated UI component tasks, each with explicit file ownership, a clear component API, acceptance criteria, test requirements and no overlapping edits. No task is assigned or treated as accepted without her confirmation | **APPROVED**                   |
| D-08-9  | **Responsive behaviour.** Follow Figma per breakpoint and keep the Tablet and Mobile order (§3.7). DOM order matches visual order. Marketing images are decorative unless one carries essential information                                                                                                                                                                            | **APPROVED**                   |
| D-08-10 | **Undesigned features.** No Google sign-in, email verification, OTP, remember me, terms checkbox, language toggle or other undesigned Authentication feature. Future decisions are tracked separately                                                                                                                                                                                  | **APPROVED**                   |

**Still open:**

- the unavailable-state message wording (new copy, not in Figma);
- the English draft translations (D-08-3).

Both are presented for owner approval in Increment 1; neither blocks the foundation work.
