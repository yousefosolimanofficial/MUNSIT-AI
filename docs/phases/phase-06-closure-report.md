# Phase 06 — Closure report

**Phase:** 06 — Shared states & overlay/guard infrastructure.

- **Status:** **CLOSED** (2026-11-19).
- **Classification:** **Development Complete — Production QA Outstanding.** This is **not**
  production readiness.
- **Owner approval:** the product owner formally approved the closure on 2026-11-19 and accepted
  every Phase 06 implementation increment. It was recorded through a documentation-only closure
  PR.
- **Final code:** `main` `6cda86c` (PR #47, squash). Post-merge CI: `check` and `e2e` green, with
  798 passed and 1 skipped (the visible W-1 `fixme`).
- **Risks:** R-2 and R-3 stay OPEN; G-1 stays RISK ACCEPTED; W-1 is accepted under R-3; OV-1 is
  RESOLVED (§16).
- **Next phase:** Phase 07 (Landing Page) is NOT STARTED. Its execution brief awaits the owner's
  review.

This report separates four things:

- **Completed development work:** built, merged and tested.
- **Accepted limitations:** known, documented and accepted by the owner.
- **Deferred production-readiness work:** required before production, outside Phase 06.
- **Remaining blockers:** what still stands between this phase and closure.

## 1. Original scope (Roadmap Phase 06)

Build once everything modules reuse for state feedback and overlays:

- skeletons, `EmptyState`, `ErrorCard`, `SectionBoundary`;
- the viewport overlay (Phase 03 `Dialog` / `Sheet`);
- `ConfirmGuardDialog` with a red-text leave action, and `useNavigationGuard` (in-app navigation,
  `beforeunload`, browser Back);
- a toast if Figma shows one;
- verification of the Notifications / User Menu shells.

**Acceptance:**

- the guard blocks every exit path while true and never when false;
- approved copy is used verbatim;
- overlays scrim against the viewport.

The plan is [phase-06-plan.md](phase-06-plan.md), with decisions D-U1 to D-U10.

## 2. Completed development work

| Deliverable                                                                                            | Where                                                                  | Increment / PR |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------- |
| `Button variant="danger"` (D-U2, resolves D-B5)                                                        | `src/shared/ui/Button.tsx`                                             | 1 · #38        |
| `ConfirmGuardDialog` (D-U1)                                                                            | `src/shared/patterns/ConfirmGuardDialog.tsx`                           | 1 · #38        |
| Navigation guard: provider, `useNavigationGuard`, `useGuardedRouter`, ESLint ban on raw routers (D-U7) | `src/shared/patterns/NavigationGuardProvider.tsx`, `src/shared/hooks/` | 1 · #38        |
| `EmptyState` `default` / `compact` (D-U4), **by Mariam**                                               | `src/shared/patterns/EmptyState.tsx`                                   | 3 · #39, #40   |
| `Skeleton`, `SkeletonText`, `SkeletonRegion` (D-U3)                                                    | `src/shared/patterns/Skeleton.tsx`                                     | 2 · #41        |
| `ErrorCard` `card` / `section` (D-U5)                                                                  | `src/shared/patterns/ErrorCard.tsx`                                    | 2 · #41        |
| `SectionBoundary` (`catchError` + `status`, retry focus)                                               | `src/shared/patterns/SectionBoundary.tsx`                              | 2 · #41, #44   |
| Toast system (D-U6), approved close copy                                                               | `src/shared/patterns/Toast.tsx`                                        | 4 · #42        |
| Dialog stale-`close` race fix                                                                          | `src/shared/ui/internal/useModalDialog.ts`                             | #45            |
| Guard test contract per the HTML Standard; G-1 reproduction                                            | `tests/e2e/navigation-guard.spec.ts`                                   | #45            |
| CI `e2e` job (full suite; flaky tests fail); Linux visual baselines                                    | `.github/workflows/ci.yml`, `playwright.config.ts`                     | #46            |
| G-1 findings, decision and data-protection criteria                                                    | [phase-06-g1-findings.md](phase-06-g1-findings.md)                     | #43            |
| **Increment 5:** frame check, guard fixture, cross-browser spec, module guide, this report             | see §2.1                                                               | 5 · this PR    |

**Overlay:** the Phase 03 `Dialog` and `Sheet` already met the overlay scope (native modal
`<dialog>`, top layer, viewport scrim). Phase 06 verified them and rebuilt nothing.

### 2.1 Increment 5 (this PR)

- **Notifications / User Menu frame check (D-U8):** `tests/e2e/overlay-frames.spec.ts`, 12 tests
  (ar/en × 1440/768/390); results in §7.
- **Temporary route removed:** `/dev/guard` is gone.
  - The guard E2E moved to the dev-only fixture `/dev/fixtures/navigation-guard`.
  - The fixture file is `page.fixture.tsx`. `.fixture.tsx` is a page extension only outside
    production (`next.config.ts`), so the production build does not contain the route; this was
    verified in the build route list.
  - Guard coverage is unchanged: 48 Chromium guard tests.
- **Cross-browser guard spec (R-3):** `tests/e2e/navigation-guard.cross-browser.spec.ts`, 8 tests
  run in Chromium, Firefox and WebKit (§10).
  - **CI:** installs all three engines.
  - **Console guard:** the shared fixture now ignores `console.timeStamp` markers (React's
    `"Hydrated"` performance label, reported by Firefox only). Real warnings and errors are still
    caught.
- **Module guide:** [shared-patterns.md](../shared-patterns.md) is complete. For every pattern it
  covers purpose, API, an example, variants, accessibility, RTL/LTR, responsive behaviour and
  limitations, plus the rules for modules.

## 3. Merged PRs (Phase 06)

| PR  | Content                                                       | Merge                |
| --- | ------------------------------------------------------------- | -------------------- |
| #37 | Phase 06 plan and Figma audit                                 | `70c821d`            |
| #38 | Increment 1: guard slice                                      | `1403536` (squash)   |
| #39 | Mariam `EmptyState` delivery + gallery                        | `abe2952` (rebase)   |
| #40 | EmptyState records                                            | `da5a8e0`            |
| #41 | Increment 2: loading and error states                         | `f44dcda`            |
| #44 | Retry focus survives a slow refresh; deterministic retry E2E  | `b3ea385`            |
| #45 | Dialog stale-close fix; guard Back contract; G-1 reproduction | `99d389d`, `ee600ec` |
| #46 | CI `e2e` job; Linux visual baselines                          | `ebd4379`            |
| #42 | Increment 4: toast system                                     | `83fce04`            |
| #43 | G-1 risk acceptance and data-protection criteria (docs)       | `9b5f082`            |

Increment 5 is this PR, which is open and not merged.

## 4. Final test totals

| Check                                   | Result (Increment 5 head)                                                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm check` (unit tests)      | **1133 / 1133 passed**; typecheck, lint, boundaries, Prettier and build pass                                                                                      |
| `corepack pnpm test:e2e` (all projects) | **799 tests: 798 passed, 1 skipped** (the visible WebKit W-1 `fixme`). Chromium 783 (763 + 12 frame check + 8 cross-browser); Firefox 8; WebKit 8 (7 + 1 `fixme`) |
| CI `check` / `e2e` on the PR head       | Recorded in the PR (CI runs `check` and `e2e` on the exact head)                                                                                                  |

The baseline before Increment 5 was `main` `9b5f082`: 1133 unit and 763 E2E tests, with CI green.

## 5. Accessibility validation

- **axe (WCAG 2.2 AA, contrast on):** 0 violations on the dev gallery sections for every pattern
  (skeletons, error cards, empty states, toasts, guard dialog), in ar and en, and on the shell
  with Notifications open.
- **Keyboard:**
  - every guard exit path and dialog works by keyboard, with Stay focused on open and Esc acting
    as Stay;
  - retry focus is restored after recovery or a repeated failure, never stolen, with no scroll
    (#44);
  - the toast close and action buttons work by keyboard, and focus returns after a focused
    toast closes.
- **Announcements:**
  - a single read per skeleton region (`aria-busy`, no live region);
  - errors as a polite `status`;
  - toasts through persistent polite and assertive live regions, without duplicates.
- **Contrast:** rendered contrast is measured in E2E (danger Pressed 4.66:1; the toast text and
  retry are ≥ 4.5).
- **Reduced motion:** opacity only, or none, for the skeleton pulse, dialogs and toasts (tested).
- **Not done (production QA):** real screen readers (NVDA, JAWS, VoiceOver, TalkBack), and
  testing with users who rely on assistive technology.

## 6. Responsive validation

- **Widths:** gallery and shell E2E at 1440, 1024, 768, 720, 719 and 390, with a no-overflow
  check at 320.
  - **Section `ErrorCard`:** a container query, so it follows its card.
  - **Toast:** width `min(420, viewport − 40)`, 118 above the bottom on mobile (34 px clear of the
    bottom bar).
  - **Dialogs:** width is viewport − 40.
- **Shell:** the guard works through the Sidebar (Desktop), Rail and drawer (Tablet), and the
  bottom bar and More sheet (Mobile).
- **Not done:** real devices (touch, on-screen keyboard, safe areas on notched phones).

## 7. Figma compliance

- **Values:** every pattern uses the values recorded in
  [design-values.md §15](../design-values.md), read from Figma (read-only). Undesigned behaviour
  is covered by explicit decisions D-U3, D-U6 and their notes.
- **Notifications / User Menu (D-U8):** the shells are unchanged, with no sample data. Measured
  against the overlay frames:

| Panel / frame              | Figma (w · edge · top) | App           | Status                                                                                            |
| -------------------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| User Menu Desktop / Tablet | 256 · 24 · 88          | 256 · 24 · 88 | **Matches**                                                                                       |
| Notifications width        | 380 / 350 (Mobile)     | 380 / 350     | **Matches**                                                                                       |
| Notifications Desktop edge | 70                     | 20            | Approved: no name/role (D-02), so the trigger is compact; inline-start aligned, 20 margin (D-PM5) |
| Notifications Tablet edge  | 24                     | 20            | Approved: same clamp (D-PM5)                                                                      |
| User Menu Mobile edge      | 14                     | 16            | Approved: menu viewport margin 16 (D-PM5)                                                         |
| Mobile tops                | 80 (both panels)       | 74 / 72       | **OV-1, APPROVED (owner, 2026-11-18):** keep the D-PM5 offsets (16 / 9) below the trigger         |

**OV-1** (labelled O-1 in the PR #47 review; renamed because O-1 already names an open decision
in design-values) is **resolved**. The owner approved the existing mobile positions on 2026-11-18:
Notifications top 74 and User Menu top 72, following D-PM5. They are not changed to Figma's 80.
Heights are not compared: the frames show content that D-U8 excludes.

## 8. Known limitations (accepted or documented)

| ID      | Limitation                                                                                                                                 | Status                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **G-1** | Chromium: a second browser Back with no user interaction in between leaves without confirmation (browser rule)                             | **RISK ACCEPTED — BROWSER LIMITATION** (§11)                                                                           |
| **W-1** | WebKit (Playwright build): Leave after a cancelled Back triggers a native prompt; accepting reloads the guarded page instead of going back | **ACCEPTED AS A DEVELOPMENT-STAGE LIMITATION under R-3** (owner, 2026-11-18); not approval for production Safari (§10) |
| U-R2    | `beforeunload`: unstyled native prompt, shown only after user interaction                                                                  | Documented (browser behaviour)                                                                                         |
| —       | Fallback without the Navigation API: Forward entries are discarded; multi-step jumps are not stopped                                       | Documented (plan §7.2)                                                                                                 |
| —       | Toasts render behind an open modal (`z-50`, not the top layer); no exit animation                                                          | Documented (D-U6 notes)                                                                                                |
| OV-1    | Mobile panel tops 74 / 72 vs Figma 80                                                                                                      | **RESOLVED**: approved as implemented (D-PM5)                                                                          |

## 9. R-2: blank no-JavaScript 404

**OPEN**, unchanged since Phase 04. Phase 06 did not touch it; it is gated at Phase 22.

## 10. R-3: cross-browser coverage

**OPEN.** Increment 5 adds the first automated evidence outside Chromium. This is automation on
Playwright's engine builds (Firefox 159, WebKit 27.2 for Windows), **not** physical Safari or
real devices.

| Guard behaviour (cross-browser spec)              | Chromium | Firefox | WebKit                       |
| ------------------------------------------------- | -------- | ------- | ---------------------------- |
| Navigation API present                            | yes      | yes     | yes                          |
| Link: Stay / Esc / Leave                          | ✓        | ✓       | ✓                            |
| Guarded router: Stay / Leave                      | ✓        | ✓       | ✓                            |
| Browser Back asked; Stay keeps page and history   | ✓        | ✓       | ✓                            |
| Browser Back → Leave goes back                    | ✓        | ✓       | **✗ W-1** (`fixme`, visible) |
| Back again after Stay: asked again                | ✓        | ✓       | ✓                            |
| Refresh: native prompt; dismissing keeps the page | ✓        | ✓       | ✓                            |
| Guard off: history untouched, Back leaves at once | ✓        | ✓       | ✓                            |
| G-1: second Back after Esc                        | leaves   | asked   | asked                        |

**Engine notes** (findings §3a):

- **Firefox:** the second traversal stays cancelable, so G-1 does not occur in automation.
- **WebKit, previous entry is the document's initial load:** the second Back asks with the native
  prompt instead (4/4 probes).
- **W-1:** Leave via `navigation.traverseTo` fires `beforeunload` in WebKit. Accepting the prompt
  reloads the guarded page; dismissing it aborts, with an unhandled `AbortError` from the
  `committed` promise. The evidence is from the Windows WebKit port.

**W-1 decision (owner, 2026-11-18): ACCEPTED AS A DEVELOPMENT-STAGE LIMITATION under R-3.** This
is **not** approval of broken Safari navigation in production. Conditions:

1. **Preserve the reproduction:** the cross-browser test "browser Back: Leave goes back once"
   stays in the spec unchanged.
2. **Keep it visible:** it is reported on every run as an explicit `fixme` skip with the W-1
   reason. It is never deleted or silently skipped.
3. **Document it:** findings §3a and this report.
4. **Test on real Safari:** macOS and iOS devices are required (R-3).
5. **Fix before support:** if real Safari reproduces it, the guard is fixed before any claim of
   Safari production support.
6. **No compatibility claim:** complete cross-browser compatibility is not claimed.

**Still required for R-3:**

- Safari on macOS and iOS, Firefox and Edge on real machines;
- real toolbar Back/Forward and the history menu;
- touch devices;
- the other modules' screens, once they exist.

## 11. G-1: conditional risk acceptance

The product owner selected option A on 2026-11-18: **RISK ACCEPTED — BROWSER LIMITATION.**

- **Conditional:** this is **not** approval of unrecoverable user-data loss in production.
- **Not fixed:** the browser rule (history-action activation; Esc grants none) is not fixed and
  cannot be fixed at application level without history manipulation, which was rejected.
- **Tested:** the reproduction stays in E2E and fails if the behaviour changes.

Full record: [phase-06-g1-findings.md](phase-06-g1-findings.md).

## 12. Recording and Notes data-protection requirements (binding)

These are carried forward to those phases from findings §6:

- **General (G1–G3):**
  - the guard is not storage;
  - the guard stays on while work is unpersisted;
  - storage and privacy rules are decided per module, with no tokens or PII in logs.
- **Notes (N1–N7):**
  - automatic draft persistence;
  - recovery after navigation, after a refresh, and after a restart where the storage allows it;
  - visible save status;
  - failed saves handled;
  - no overwrite of a newer draft.
- **Recording (R1–R7):**
  - incremental persistence;
  - recovery of persisted segments;
  - status;
  - explicit failure handling;
  - a recovery workflow;
  - validated guarantees;
  - no promise for audio that was never persisted.
- **Release gate:** Notes and Recording are not production-ready until these criteria are
  implemented and tested.

## 13. Remaining production QA obligations

- **R-3 cross-browser and real-device QA,** including W-1 on Safari.
- **Real screen readers** and assistive-technology users.
- **Performance:** `backdrop-filter` blur on low-end devices (Phase 05 QA item).
- **R-2 no-JavaScript 404** (Phase 22).
- **Backend-dependent behaviour:** none is assumed. Notifications, account and logout stay
  shells (D-U8).
- **Repository setting:** make `e2e` a **required** check in the `main-protection` ruleset. It
  currently requires `check` only (verified through the API). This is an owner action, not code.

## 14. Mariam's contribution

`EmptyState` (`default` and `compact`, with its unit tests) was written by **Mariam** (Frontend
Developer) from the approved starter
([phase-06-empty-state-starter.md](phase-06-empty-state-starter.md)). She delivered it offline,
and Yousef, the Git author and integrator, integrated it verbatim through PR #39 (rebase merge;
delivery commit `b7cf1d9`). It is the cross-module empty state for Summaries, Notes and the
Dashboard first-time card.

## 15. Recommendation

**Recommended (2026-11-18):** PHASE 06 — DEVELOPMENT COMPLETE / READY FOR OWNER CLOSURE.
**Outcome (2026-11-19):** the owner approved the closure: **PHASE 06 — CLOSED / DEVELOPMENT
COMPLETE** (Development Complete — Production QA Outstanding).

**Development scope: complete.** Every Roadmap Phase 06 deliverable is built, merged and tested.
The guard per exit path, safe-action focus and error isolation are covered. The module guide is
complete.

**Recommendation:**

- **Approve closure** of Phase 06 **as development-complete with accepted limitations**, after
  this PR is merged with CI green.
- **Recorded owner decisions:** G-1 risk accepted; W-1 accepted as a development-stage
  limitation under R-3; OV-1 approved as implemented.
- **Owner action still open:** make `e2e` a required check.

**Not production-ready:** R-2 and R-3 stay open, real-device and screen-reader QA remain, and
the Notes and Recording data-protection gate applies.

## 16. Official closure record (2026-11-19)

**Decision:** the product owner approved the closure of Phase 06: **CLOSED / DEVELOPMENT
COMPLETE**. All implementation increments (1–5) are accepted. Completed implementation decisions
are not reopened. This approval does **not** mean production readiness.

**Risk decisions preserved:**

| ID   | Status                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-2  | **OPEN**, scheduled for Phase 22                                                                                                                                |
| R-3  | **OPEN**: real browser, device, accessibility and performance validation required                                                                               |
| G-1  | **RISK ACCEPTED — BROWSER LIMITATION**. It stays conditional on the Notes and Recording modules implementing reliable data persistence and recovery (§12)       |
| W-1  | **Accepted as a development-stage limitation under R-3.** Safari production support stays unapproved until real-device verification and any required correction |
| OV-1 | **RESOLVED**: the current mobile panel positions are approved                                                                                                   |

**Production release gates.** These are production-readiness requirements, not reasons to reopen
Phase 06:

1. Real Safari and iOS testing.
2. Firefox and Edge validation.
3. Real Back-button and history-menu testing.
4. Screen-reader and assistive-technology validation.
5. Low-end device blur-performance testing.
6. R-2 remediation.
7. Notes draft persistence and recovery.
8. Recording segment persistence and recovery.

**Repository quality gate:** the intended required checks are `check` and `e2e`. The
`main-protection` ruleset requires **`check` only** (verified through the API on 2026-11-19). Adding
`e2e` as a required check is an **outstanding owner action**.
