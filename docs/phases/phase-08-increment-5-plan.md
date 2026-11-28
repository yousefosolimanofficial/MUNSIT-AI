# Phase 08 — Increment 5 (Verification) — plan

- **Status:** PLAN — direction **approved by the owner on 2026-11-28** (I5-1, I5-2, §5).
  Implementation starts only after this plan PR is reviewed and approved for merge.
- **Plan row:** [phase-08-plan.md](phase-08-plan.md) §8, Increment 5: route-protection contract
  review (no guard code); visual baselines; axe; keyboard; flow-navigation E2E; production 404
  still holds; closure report.
- **Baseline:** `main` at `7b20018` (Increments 1–4 complete; Increment 4 closure, PR #87).
- **Owner:** Claude Code (test coordination and final review, D-08-8). No task for Eng. Mariam.
- **Production:** unchanged. `AUTHENTICATION_AVAILABLE = false`; every Auth route returns 404.

## 1. What "Verification" means here

Increment 5 is the **quality verification** of the Auth UI built in Increments 1–4. It is **not** an
email-verification or OTP screen.

The Figma file was checked read-only on 2026-11-28:

- **Auth page `5:5`:** 108 frames — Login, Register, Forgot, Reset and 12 prototype references. There
  is no Verification, verify-email or OTP frame.
- **Design Documentation page `2451:20303`:** text `2472:22` says "(+) /reset-password and
  /verify-email need designs (I-03)". Reset was designed later; verify-email never was.
- **Profile & Settings page `2451:20302`:** the only verification UI in the file is
  `Profile / Edit Form / State=EmailVerify` (`2462:536`). It shows an email-change banner with
  "إعادة إرسال" (resend) and belongs to Phase 19 (Settings), not Phase 08.

Email verification and OTP stay out of Phase 08 (plan §2 "Not in the designs", D-08-10).

### 1.1 Unresolved design dependency: `/verify-email` and OTP

| Item     | Value                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Status   | **UNRESOLVED — no design.** Recorded by the owner on 2026-11-28                                           |
| Evidence | Figma `2472:22`: "/verify-email need designs (I-03)"; no verify-email or OTP frame on the Auth page `5:5` |
| Blocks   | Any `/verify-email` route, email-verification view or OTP entry screen                                    |
| Needs    | Figma designs (all states, 3 breakpoints), then the backend verification contract (Phase 21, D-02)        |
| Phase 08 | Nothing is built: no screen is invented, no route is added and no OTP flow is implemented                 |
| Tracking | ClickUp task "Phase 08 Inc 5" (comment); no separate task is opened                                       |

The email-change banner in Profile (`State=EmailVerify`, `2462:536`) is a Phase 19 screen and is not
covered by this dependency.

## 2. Existing coverage (reused, not rebuilt)

| Area                 | Already in place                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Per-screen states    | `auth-login`, `auth-register`, `auth-recovery` specs: every Figma state, ar and en, 3 widths |
| axe                  | Every Auth screen and the foundation preview                                                 |
| Keyboard             | Per-form keyboard completion, show/hide toggle, focus on errors                              |
| 320 overflow         | One check per Auth spec                                                                      |
| Production           | `test:e2e:prod`: Auth routes 404, not indexable, Landing entry points hidden                 |
| Contract             | `src/types/auth.ts`: route-protection contract as types and documentation only (D-08-6)      |
| Components and shell | `AuthLayout`, the 7 Auth components, shared `Button`, `Input`, status banner; nothing new    |

**Gaps this increment closes:**

- no screenshot baselines for any Auth view;
- almost no flow-navigation E2E (1–2 URL assertions per spec);
- Auth is tested in Chromium only.

## 3. Smallest scope

Tests and docs only. No `src/` change is planned. A defect found during verification is fixed in its
own `fix(auth)` commit and reported.

1. **Visual baselines** — new `tests/e2e/auth-visual.spec.ts`:
   - the **9 views** of plan §2, each in its Figma default state, at 1440, 768 and 390, Arabic:
     27 baselines per platform (`linux` for CI, `win32` for local runs, as for the Landing);
   - Register Success, Email sent and Updated through the development previews (D-08-4);
   - Chromium, reduced motion, fonts loaded. English and the other states stay covered by the
     existing state assertions, not by images.
2. **Flow navigation** — new `tests/e2e/auth-flows.spec.ts`, development build, ar and en:
   - Journey 1: Login → Forgot, Login → Register; Register → Login;
   - Journey 3: Forgot → Login; Email sent → Login;
   - Journey 4: Invalid link and Expired link → Forgot and Login; Updated → Login;
   - Journey 5: Register Success → Login;
   - each link: the destination URL, the destination screen heading, and focus starting at the top
     of the new page.
   - **Out:** Journey 2 (prototype test frame), Journey 6 (Dashboard, Phase 09), timeouts and the
     demo link (D-08-7), and anything that needs a real adapter result.
3. **Accessibility and keyboard audit:**
   - check the existing axe and keyboard tests against plan §6, item by item;
   - add only the missing checks. The expected gap is axe at 320 for each Auth route in both
     languages.
4. **Route-protection contract review:**
   - a written review of `src/types/auth.ts` against D-08-6, recorded in the closure report;
   - no guard code, no redirects.
5. **Production:** run `test:e2e:prod` once; the expected result is unchanged.
6. **Cross-browser (I5-2)** — new `tests/e2e/auth.cross-browser.spec.ts`:
   - picked up by the existing Firefox and WebKit projects (`*.cross-browser.spec.ts`); no config
     change;
   - one test per Auth route (Login, Register, Forgot, Reset), Arabic, 390 wide: the form renders,
     the show/hide toggle works, a keyboard-only submit reaches the "unavailable" result, and there
     is no horizontal overflow;
   - it does not repeat the Chromium state, axe or visual coverage. CI cost: about +2 minutes;
   - **Limitation:** Playwright WebKit is not Safari on a real device. Physical Safari (macOS and
     iOS) testing stays a recorded release-readiness item.
7. **Phase 08 closure report:**
   - a new `docs/phases/phase-08-report.md`, plus a `PROGRESS.md` update;
   - Phase 08 is reported as "UI-complete, not functional" (plan §12).

**Files:** three new spec files, the visual snapshot folder, and possibly one addition to
`tests/e2e/global-setup.ts`; then the report and `PROGRESS.md`. No dependency, config or route
change. Estimate: 2–3 days.

## 4. States, validation, responsive and accessibility checks

| Check      | Requirement                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| States     | The 32 Figma states stay asserted by the existing specs; the 9 views get image baselines                                         |
| Validation | Errors on blur and submit; cleared once valid; live password rules; submit disabled while loading (existing tests, audited)      |
| Responsive | 1440, 768, 390; no horizontal overflow at 320; the accepted wrapping (§17.7) stays as approved                                   |
| Direction  | `ar` RTL and `en` LTR; numerals and Latin terms isolated; logo not mirrored                                                      |
| a11y       | axe with no violations; visible focus; full keyboard operation; linked error text; correct autofill; accessible show/hide toggle |
| Security   | No form value logged or stored; the placeholder adapter fails closed (unit tests, unchanged)                                     |

## 5. Owner decisions (2026-11-28)

| #    | Decision                                                                                                                                                                                                            | Status       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| I5-1 | **Scope.** Increment 5 is the final Auth UI QA and closure increment (§3). No email-verification or OTP UI is built; `/verify-email` and OTP are an unresolved design dependency (§1.1)                             | **APPROVED** |
| I5-2 | **Cross-browser.** Focused Firefox and Playwright WebKit coverage of the existing Auth UI (§3 item 6), kept small and not duplicating Chromium coverage. Playwright WebKit does not replace physical Safari testing | **APPROVED** |

Everything else follows the approved Phase 08 plan and needs no new decision.

## 6. Not included

Real OTP delivery, email verification, backend verification, sessions, authentication, guard code
or redirects, enabling `AUTHENTICATION_AVAILABLE`, and the backend contract (PR #84, untouched).
