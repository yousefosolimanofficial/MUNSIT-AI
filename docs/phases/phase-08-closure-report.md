# Phase 08 — Authentication UI — Closure report

- **Status:** **IMPLEMENTATION COMPLETE — "UI-complete, not functional" — CLOSURE PENDING OWNER
  APPROVAL** of the Increment 5 PR (#89). Phase 08 is closed only after that approval and the merge.
- **Plan:** [phase-08-plan.md](phase-08-plan.md) (approved 2026-11-23, D-08-1 to D-08-10).
- **Increment 5 plan:** [phase-08-increment-5-plan.md](phase-08-increment-5-plan.md) (PR #88,
  `46257fa`).
- **Production:** unchanged. `AUTHENTICATION_AVAILABLE = false`; every Auth route and every
  `/dev/*` preview returns 404 in production.

## 1. Summary

Phase 08 delivers the four Authentication screens — Login, Register, Forgot Password and Reset
Password — with all 32 Figma states at 1440, 768 and 390, in Arabic (RTL) and English (LTR).

**Not functional yet:**

- Every form uses the fail-closed placeholder adapter and ends with "unavailable".
- There is no provider, session, token, endpoint or guard (gate D-02, Phase 21).

Phase 08 is reported as **"UI-complete, not functional"** (plan §12).

## 2. Increments and merged pull requests

| #   | Increment                 | Pull requests                                                    | Merge on `main`        |
| --- | ------------------------- | ---------------------------------------------------------------- | ---------------------- |
| 1   | Auth foundation           | #74 contract, #75 implementation                                 | `581fc19`              |
| 2   | Login                     | #77 contract, #78 implementation, #79 closure                    | `d3e7c76`              |
| 3   | Register                  | #80 contract, #81 shared states, #82 implementation, #85 closure | `c5a0290`, `9c803de`   |
| 4   | Forgot and Reset password | #86 implementation (Eng. Mariam's delivery v1), #87 closure      | `3ea0122`              |
| 5   | Verification              | #88 plan, #89 tests and this report                              | pending owner approval |

**Owner visual approvals:**

| Increment | Date       | Approved              |
| --------- | ---------- | --------------------- |
| 1         | 2026-11-23 | Foundation            |
| 2         | 2026-11-24 | Login, 12 comparisons |
| 3         | 2026-11-27 | Register, 33 states   |
| 4         | 2026-11-28 | Recovery              |

## 3. Increment 5 evidence

### 3.1 Visual baselines (`tests/e2e/auth-visual.spec.ts`)

**Coverage:** 27 Arabic baselines — the 9 views of plan §2, in their default states, at 1440, 768 and 390. The views are:

- Login, Register, Register Success;
- Forgot, Email sent;
- Reset, Invalid link, Expired link, Updated.

**Capture:**

- Chromium, `next dev`, reduced motion, tolerance 0.1% of pixels.
- The result views come from the development previews, so their images include the
  development-preview banner.
- These are **not production renderings**.

**Platform sets:**

- `-chromium-win32`: generated locally; stable over 3 runs (81 of 81 passed).
- `-chromium-linux`: from the CI runner (run 46178222922), compared with the win32 set before
  commit.

**Windows and Linux differences (platform fonts only):**

- 21 of 27 images have the same size on both platforms.
- The 6 Recovery views at 390 (Forgot, Email sent, Reset, Invalid link, Expired link, Updated)
  are 37 px shorter on Linux.
- Cause: the marketing heading "ولا يهمك، هنرجّعك تاني! 🔐" fits on one line on Linux. On
  Windows, the wider emoji font moves the 🔐 to a second line.
- Layout, copy and every other line are identical. Each platform compares only against its own
  set, as for the Landing.
- The Windows wrap is accepted natural wrapping under the 2026-11-28 decision; no code change.

**Not imaged:** English and the other states. They stay covered by the state and geometry assertions
in `auth-login`, `auth-register` and `auth-recovery`.

### 3.2 Flow navigation (`tests/e2e/auth-flows.spec.ts`)

**Coverage:** 11 links in Arabic and English (22 tests), each followed by a real click. Each test
checks:

- the destination URL and its `h1`;
- the `lang` attribute;
- that the page scroll is at the top.

**Links covered:**

- Login → Forgot, Login → Register, Register → Login;
- Forgot → Login, Email sent → Login;
- Register Success → Login;
- Invalid link and Expired link → Forgot and Login;
- Updated → Login.

**Out of scope:** journey 2 (prototype frame), journey 6 (Dashboard, Phase 09), and the timed
transitions and demo link (D-08-7).

### 3.3 Accessibility audit (plan §6)

| Requirement                                          | Evidence                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Visible labels; linked errors; `aria-invalid`        | Component tests (each form) and axe in every per-screen spec      |
| Form-level errors in an alert region                 | Component tests (`AuthStatusBanner`, each form)                   |
| Autofill and input types                             | Component tests (each form, `Input`)                              |
| Show/hide toggle (`button`, `aria-pressed`, name)    | Component tests; E2E Login, Reset; cross-browser smoke            |
| Loading `aria-busy`, no double submit                | Component tests; E2E Login, Register, Recovery                    |
| Focus: first invalid field; result-view heading      | E2E per-screen specs (`toBeFocused`)                              |
| One `h1`, landmarks, decorative photo, visible focus | **New:** `auth-flows.spec.ts`, every Auth route at 320, ar and en |
| axe (WCAG 2.2 AA)                                    | Per-screen specs at 1440, 768, 390; **new:** 320, ar and en       |
| Overflow at 320                                      | Per-screen specs (ar); **new:** ar and en                         |

**Finding:** the Auth fields draw their keyboard focus ring on the field wrapper (`focus-within`
border and a 3 px ring), not on the `<input>`. This is the approved design, and the new check
accepts it. No accessibility defect was found.

### 3.4 Cross-browser (`tests/e2e/auth.cross-browser.spec.ts`, I5-2)

**Coverage:** one test per Auth route, Arabic, 390 wide. It runs in Chromium, Firefox and WebKit, and
checks:

- the page renders RTL;
- the show/hide toggle;
- a keyboard-only submit reaches "unavailable";
- no horizontal overflow.

**Result:** 12 of 12 passed locally.

**Limitation:** Playwright WebKit is not Safari on a real device. Physical Safari testing (macOS and
iOS) stays a release-readiness item.

### 3.5 Route-protection contract review (D-08-6)

| Check                                | Result                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Contract present                     | `src/types/auth.ts`: `RouteAccess` and `ROUTE_ACCESS` — public (Landing), guest-only (`(auth)`), protected (`(app)`, `(focus)`) |
| Matches the route groups             | Yes: `src/app/[locale]/` has `(public)`, `(auth)`, `(app)` and `(focus)`                                                        |
| Enforced anywhere                    | No. Only a unit test reads it; `src/proxy.ts` handles only locale redirects (no session, cookie or guard)                       |
| Redirects from simulated state       | None                                                                                                                            |
| Note for the future guard (Phase 21) | `dev` (development previews, 404 in production) and `[...rest]` (not found) are outside the contract and must stay unguarded    |

**Result:** the contract is consistent with D-08-6, and nothing needs to change in Phase 08.

### 3.6 Production smoke

`corepack pnpm test:e2e:prod`: 29 of 29 passed on 2026-11-28. The Auth routes return 404, are not
indexable and show no Auth UI, and the Landing shows no Login entry point.

## 4. Accepted differences (owner-approved)

| Screen   | Difference                                                                                                    | Record                    |
| -------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Register | R-6 (provisional)                                                                                             | Increment 3 contract §6.1 |
| Recovery | Natural wrapping at 390 and English 480; RC-5 Neutral rules when empty; RC-3 inactive resend; 14 px Reset gap | `design-values.md` §17.7  |

## 5. Unresolved dependencies (not Phase 08)

| Item                             | Status                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `/verify-email` and OTP          | **No design** (Figma `2472:22`, I-03). Needs Figma designs, then the verification contract |
| Provider, session, tokens, guard | Gate D-02; functional integration in Phase 21. Backend contract PR #84 stays a draft       |
| Physical Safari (macOS, iOS)     | Release readiness                                                                          |
| Production release               | Blocked (P07-D26); Auth stays disabled                                                     |

## 6. Definition of Done (plan §12)

| Item                                                                                | Status                     |
| ----------------------------------------------------------------------------------- | -------------------------- |
| Every Figma screen and flow reachable by route or adapter result                    | Done (Increments 2–4)      |
| Field-level errors, disabled and loading submit, linked errors, autofill, show/hide | Done; audited in §3.3      |
| No secrets logged                                                                   | Done (unit and E2E checks) |
| Tests (§10) and universal checks (Roadmap §4)                                       | Done; §3                   |
| All Auth copy in `authentication.json`                                              | Done                       |
| Reported as "UI-complete, not functional"                                           | Done                       |
| Production unchanged (Auth routes 404)                                              | Done; §3.6                 |
| Closure report and `PROGRESS.md`                                                    | This report                |
| Phase 09 not started                                                                | Confirmed                  |

## 7. Owner sign-off

Pending:

- owner approval of PR #89;
- review of the `-chromium-linux` baselines;
- the merge.

Phase 09 does not start before this sign-off.
