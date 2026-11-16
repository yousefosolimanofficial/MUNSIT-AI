# Phase 03 — Core UI primitives — Closure Report

- **Status:** **CLOSED**, effective when the closure documentation PR is merged. Closure approved
  by the user on 2026-11-16. The scope gap K-1 is an approved deferral, recorded in
  [ADR-002](../decisions/ADR-002-phase-03-scope-deferral.md).
- **Baseline verified:** `main` at `fff239e1198317f4951abd83a394f6a08ae4a4c3` (2026-11-16).
- **Sources:**
  - Roadmap v1.0, Phase 03 and §4 (read-only reference, unchanged; its Phase 03 scope is amended
    by [ADR-002](../decisions/ADR-002-phase-03-scope-deferral.md))
  - [phase-03-plan.md](phase-03-plan.md)
  - The nine component contracts in `docs/phases/phase-03-*-contract.md`
  - [design-values.md](../design-values.md) §8–§14
  - [FEATURE_DELIVERY_CHECKLIST.md](../FEATURE_DELIVERY_CHECKLIST.md)
  - [PROGRESS.md](../PROGRESS.md)
  - Merged PRs #5–#23 and the test results recorded on them
- **Evidence rule:** every result below comes from a run in this phase. No test was re-run to write
  this report.

## 1. Executive summary

- **Delivered:** nine shared UI components, each from an approved final contract. All are merged
  into `main` through pull requests with green CI:
  - Button, Input, Card, StatusBadge, Tabs, Dialog, Sheet, Popover/Menu, Avatar
- **Gallery:** the development-only `/dev/components` gallery shows every one of them in Arabic RTL
  and English LTR.
- **Browser QA:** done at 1440, 768, 390 and 320 (plus 360 for Tabs).
- **Quality gates:** `corepack pnpm check` passes on the final branch head, and the CI `check` job
  passes on every PR.
- **Approved scope deferral (ADR-002, 2026-11-16):** the Roadmap's Phase 03 scope also names
  **Textarea, Select, Checkbox, Radio, Switch, Tooltip**, a generic **Badge** and the **Navigation
  Icon Button** (Figma verification and implementation).
  - They are **not implemented**. They are deferred, not cancelled.
  - Each must be built from an approved contract before the first feature that consumes it is
    considered complete (§6).
- **Outcome:** closure **approved** by the user on 2026-11-16 (§9). The acceptance matrix has 14 PASS, 2
  DEFERRED — APPROVED and 0 BLOCKED.

## 2. Scope delivered

| Area                      | Delivered                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/ui`           | `Button`, `Input`, `Card`, `StatusBadge` (`Badge.tsx`), `Tabs`/`TabList`/`Tab`/`TabPanel`, `Dialog`, `Sheet`, `Popover`, `Menu` (with `MenuItem`, `MenuSeparator`, `MenuRadioGroup`, `MenuItemRadio`), `Avatar`; each with a co-located test |
| Shared internals          | `internal/useModalDialog.ts` (Dialog and Sheet), `internal/useAnchoredOverlay.ts` (Popover and Menu), `internal/useScrollableFocus.ts`                                                                                                       |
| Gallery                   | `src/app/[locale]/dev/components` with nine sections; returns 404 in production builds                                                                                                                                                       |
| Test infrastructure (P-1) | Testing Library, `jest-axe` and `@axe-core/playwright` (PR #7, `chore(deps)`, ADR-001 updated); a console and hydration guard in E2E (PR #5, closes issue #3)                                                                                |
| Documentation             | Plan, nine final contracts, design-values §8–§14, team delivery logs                                                                                                                                                                         |
| Team process              | Button and Input delivered offline by Mariam and integrated by Yousef. From 2026-11-16 (ownership change) the remaining components were implemented directly by Yousef and Claude                                                            |

## 3. Component completion matrix

All nine contracts are **Approved — final**. "Unit" means the co-located Vitest file (jsdom +
Testing Library + `jest-axe`); "E2E" means the Chromium spec on `/dev/components`, with test counts
from `playwright test --list` on the baseline.

| Component    | Contract (decisions)                            | Merged (PR)                              | Unit tests                                                                                  | E2E spec (tests)                                                                                                           | Accessibility                                                                | Gallery |
| ------------ | ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------- |
| Button       | D-B1–D-B6, Ember Hush rule                      | #8 (Mariam delivery v1)                  | `Button.test.tsx`: variants, states, disabled, keyboard, axe                                | `dev-components.spec.ts` (15): computed values, rendered contrast on 6 surfaces, focus ring, 44px at 4 widths, touch       | Focus ring D-B2; label contrast ≥ 4.5 (D-B6); axe                            | ✓       |
| Input        | D-I1–D-I4                                       | #11 (Mariam delivery v1)                 | `Input.test.tsx`: label, error, disabled, axe                                               | `dev-components-input.spec.ts` (22): contrast on 4 surfaces, error ARIA, keyboard, fonts, 46px at 4 widths                 | `aria-invalid` and `aria-describedby`; focus border and glow; axe with focus | ✓       |
| Card         | D-C1–D-C5                                       | #22                                      | `Card.test.tsx`: variants, pass-through, ref, 8 accepted and 20 rejected compile-time cases | `dev-components-card-badge-tabs.spec.ts`: computed values, §7 contrast, nested content at 4 widths                         | Static; no role or tabindex (enforced by the type); axe RTL and LTR          | ✓ (#23) |
| StatusBadge  | D-BG1, D-BG2                                    | #14                                      | `Badge.test.tsx`: statuses, classes, pass-through, compile-time, axe                        | Same spec: geometry, dot at the inline start, contrast on page / surface / inset                                           | Static label; contrast 5.29–9.28                                             | ✓ (#23) |
| Tabs         | D-T1–D-T6 + compact responsive fix (2026-11-16) | #16; fix `a7adcc3` (#23)                 | `Tabs.test.tsx`: roles, controlled and uncontrolled, keyboard RTL/LTR, disabled, axe        | Same spec: sizes per width, keyboard, disabled, contrast, reduced motion, 320/360/390 regression                           | Tablist and tabpanel roles, roving tabindex, ring D-T2, underline cue D-T6   | ✓ (#23) |
| Dialog       | D-DL1–D-DL6                                     | #17; keyboard-scroll fix `b2cfe15` (#18) | `Dialog.test.tsx`: focus trap, Esc, return focus, labelling                                 | `dev-components-dialog.spec.ts` (26): trap, dismissal, motion, reduced motion, scroll lock, axe, 4 widths                  | Native `<dialog>`, `aria-modal`, labelled, `alertdialog` layout A            | ✓       |
| Sheet        | D-SH1–D-SH6, N-1–N-5                            | #18                                      | `Sheet.test.tsx`                                                                            | `dev-components-sheet.spec.ts` (24): trap, dismissal, Sheet → Dialog, scroll lock, axe, 4 widths                           | Modal, labelled, close at the inline end                                     | ✓       |
| Popover/Menu | D-PM1–D-PM9                                     | #20                                      | `Popover.test.tsx`, `Menu.test.tsx`                                                         | `dev-components-popover-menu.spec.ts` (26): keyboard, dismissal, inside Dialog and Sheet, Menu → Dialog, flip, motion, axe | Menu roles, `aria-checked`, type-ahead; focus distinct from selection        | ✓       |
| Avatar       | D-AV1–D-AV6, N-1–N-4                            | Contract #19; implementation #21         | `Avatar.test.tsx`: initials, fallbacks, failure before hydration, compile-time, axe         | `dev-components-avatar.spec.ts` (18): values, rendered pixel contrast, image fallback, axe, 4 widths                       | Meaningful (`role="img"`, name) or decorative (hidden); never focusable      | ✓       |

**Limitations accepted in the contracts (not defects):**

- **Button:** no loading state (D-B3), no icons (D-B4), no icon-only variant.
- **Card:** TypeScript accepts any `HTMLElement` ref on `section` and `article`, because React types
  those elements as `HTMLElement` (contract §9).
- **Avatar:** a `div` ref is not rejected at compile time, because TypeScript typing is structural
  (contract §13).

## 4. Test and QA evidence

| Run                                       | Scope                                                           | Result                                                 | When                                                            |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `corepack pnpm check`                     | typecheck, ESLint + dependency-cruiser, Prettier, Vitest, build | **Pass**; unit tests 697/697 in 21 files               | Final head of `feature/03-final-gallery-qa`, after the Tabs fix |
| `corepack pnpm test:e2e` (complete suite) | All 15 specs, Chromium                                          | **241/241 passed**                                     | Gallery branch, **before** the Tabs responsive fix              |
| Gallery spec after the fix                | `dev-components-card-badge-tabs.spec.ts` only                   | **36/36 passed** (30 gallery + 6 new regression tests) | After the Tabs fix                                              |
| Regression proof                          | The 6 compact-Tabs tests run against the old fixed height       | 3 of 6 failed, as expected                             | During the fix                                                  |
| CI `check` job                            | GitHub Actions on each PR head                                  | **Pass** on PRs #21, #22 and #23 (and earlier PRs)     | Before each merge                                               |

- **Testing scope, stated exactly:** the complete E2E suite was **not** re-run after the Tabs
  responsive fix (`a7adcc3`). The fix changes one class (`h-[58px]` → `min-h-[58px]`) on compact
  tabs only. After it, the affected spec, `pnpm check` and CI were run.
- **Current suite size:** `playwright test --list` on the baseline gives 247 tests: the 241 that
  passed in the full run, plus the 6 responsive regression tests added afterwards. **The 247 have
  never been run together in one full-suite run.** The 6 new tests passed only as part of the
  targeted 36/36 run.
- **Browsers:** Chromium only. Phase 01 configured Chromium as the only Playwright project. The
  cross-browser pass (latest two majors of Chrome, Edge, Firefox and Safari) is planned for Phase
  22, as recorded in `playwright.config.ts`.
- **Visual baselines:** no new visual baselines were committed in Phase 03. Gallery screenshots were
  reviewed by the user instead (PROGRESS, 2026-11-15).

## 5. Accessibility and responsive verification

| Area                        | Verified result                                                                                                                                                                                                                           | Evidence                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| RTL and LTR                 | Every spec runs on `/dev/components` (ar, RTL) and `/en/dev/components` (en, LTR): Tabs arrow keys follow the direction, the badge dot sits at the inline start, the Sheet close button sits at the inline end, the email input stays LTR | All `dev-components-*` specs; `i18n.spec.ts`              |
| Responsive                  | 1440, 768, 390 and 320 (and 360 for Tabs): no horizontal overflow, components inside the viewport, Dialog width capped, Sheet height ≤ viewport − 64, menus 16 and popover 20 from the edges                                              | Viewport tests in each spec                               |
| Keyboard                    | Tab order skips disabled controls; Tabs arrows, Home and End; Menu arrows, Home, End, type-ahead and Enter; Tab closes menus                                                                                                              | Button, Input, Tabs and Menu specs                        |
| Focus management            | Visible focus ring on every interactive primitive; Dialog and Sheet trap focus and return it to the trigger; Menu returns focus on Esc and before an action opens a Dialog                                                                | Dialog, Sheet and Menu specs; Tabs and Button ring checks |
| Overlay interactions        | Sheet → Dialog; Menu → Dialog; Esc inside a menu that sits in a Dialog or Sheet closes only the menu; scroll lock without layout shift                                                                                                    | Sheet and Popover/Menu specs                              |
| Automated accessibility     | `jest-axe` per primitive in RTL and LTR; `@axe-core/playwright` (WCAG 2.0, 2.1 and 2.2 A/AA) per section, with overlays open and with keyboard focus; whole-page scans of `/dev/components` and `/en/dev/components`                      | Unit tests; all specs; `a11y.spec.ts`                     |
| Reduced motion              | Dialog and Sheet fade opacity only (no scale or slide); menus use opacity only; Avatar, Card and Badge have no motion; Tabs only cross-fade colours                                                                                       | Reduced-motion tests in each spec                         |
| Rendered contrast           | Button and Input on every allowed surface ≥ 4.5; Avatar white initials 5.69–5.85 over the gradient; Card text 19.04 / 6.94 / 5.75 (surface) and 17.94 (inset); badges 5.29–9.28; tabs 6.86–17.85                                          | Specs (measured in Chromium, never in jsdom)              |
| Touch targets               | Button 44, Input 46, Tabs 44 and ≥ 58, menu items 38–44 (above the WCAG 2.2 AA minimum of 24)                                                                                                                                             | Viewport and geometry tests                               |
| Production route protection | `next start` on the production build: `/` and `/en` return 200; `/dev/components`, `/en/dev/components`, `/dev/tokens` and `/en/dev/tokens` return 404; the `/ar/...` versions redirect (307) to them                                     | Manual check during the final gallery QA (2026-11-16)     |

## 6. Approved deferrals

| Item                                                            | Decision                                                           | Where it goes                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| Tabs `filter` rows (Favorites, Folders, Question Bank)          | Deferred to the modules (D-T1, Tabs §1.1); D-T5 applies when built | Modules 18, 19 and 15          |
| Tabs: Settings navigation, Summary Type Selector                | Excluded (D-T1)                                                    | Settings (20), Summaries (14)  |
| Dashboard chips (topic level, Count, Range, Progress, Duration) | Outside StatusBadge V1 (D-BG2)                                     | Dashboard (09)                 |
| Interactive Settings shortcut cards                             | Card stays static (D-C4, Q-1)                                      | Settings (20)                  |
| Button loading state and icons                                  | Out of scope for V1 (D-B3, D-B4)                                   | When a screen needs them       |
| `ConfirmGuardDialog`, navigation guard, `beforeunload`          | Dialog §8                                                          | Phase 06                       |
| More Sheet content; Sheet drag, swipe and snap                  | Sheet §10 (D-SH2)                                                  | Phase 05; not planned          |
| Notification and User Menu content and wiring; submenus         | Popover/Menu §10 (D-PM3)                                           | Phases 05 and 06               |
| Avatar upload states, Avatar Modal, AI Tutor portraits          | Avatar §10                                                         | Profile (20), AI Tutor (13)    |
| Project-wide Motion & Interaction Audit                         | Scheduled by the user after Phase 03 closure                       | After closure, before Phase 04 |
| Cross-browser E2E (Firefox, WebKit, Edge)                       | Phase 01 configuration note                                        | Phase 22                       |

**Deferred Roadmap Phase 03 primitives (ADR-002, approved 2026-11-16). Deferred, not cancelled,
and not implemented:**

| Component              | Trigger                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Textarea               | Before the first consuming feature is considered complete                                                                                               |
| Select                 | Before the first consuming feature is considered complete; Menu does not replace it                                                                     |
| Checkbox               | Before the first consuming feature is considered complete                                                                                               |
| Radio                  | Before the first consuming feature is considered complete; a Tabs filter group does not replace native Radio controls                                   |
| Switch                 | Before the first consuming feature is considered complete                                                                                               |
| Tooltip                | Before the first consuming feature is considered complete                                                                                               |
| Generic Badge          | Before the first consuming feature is considered complete; StatusBadge does not replace it                                                              |
| Navigation Icon Button | Figma verification and implementation before its first consuming screen, which may come before Phase 05 (e.g. the Landing mobile navbar, if it uses it) |

Rules for each (ADR-002):

- An approved contract comes before implementation.
- It lives in `src/shared/ui` when appropriate, follows the Design System and is reusable.
- It ships with unit, accessibility and browser validation.
- No local one-off substitutes.
- No phase number is fixed until the consuming feature is established.

These are deliberate, approved scope decisions, not defects.

## 7. Known issues and risks

| ID  | Item                                                                                                                                          | Type                                                 | Proposed handling                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| K-1 | Roadmap Phase 03 scope not delivered: Textarea, Select, Checkbox, Radio, Switch, Tooltip, generic Badge, Navigation Icon Button               | **Decided: approved deferral** (ADR-002, 2026-11-16) | Open obligations, tracked in §6; each feature phase that first consumes one includes its contract and implementation |
| K-2 | `docs/PROGRESS.md` is out of date: header still "Current phase: 02"; Avatar shown as "PR open"; Tabs, Card and the final gallery not recorded | Documentation                                        | Update together with closure, after approval of this report                                                          |
| K-3 | Complete E2E suite not re-run after the one-class Tabs fix                                                                                    | Evidence scope                                       | Accepted by the user; optional full run on `main` at closure                                                         |
| K-4 | Chromium-only browser evidence                                                                                                                | Risk (planned)                                       | Phase 22 cross-browser pass                                                                                          |
| K-5 | I-1 (placeholder `/` heading) and I-2 (`UI/Navigation` weight NOT VERIFIED) are carried over from Phase 02                                    | Carry-over, not Phase 03                             | Unchanged: Phase 07 / first use                                                                                      |

- **Resolved during the phase:** I-3, the hydration warning in E2E (issue #3), closed by PR #5.

## 8. Acceptance criteria matrix

Criteria from Roadmap Phase 03 and plan §7, without additions.

| #    | Criterion                                                                                                                                        | Status                                                                                        | Evidence                                                                                                             | Notes                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| A-1  | Button: height 44, padding-x 20, radius 12; hover Info Blue + shadow; disabled Slate fill, Muted label (Figma)                                   | PASS                                                                                          | Button contract (D-B1); `dev-components.spec.ts` computed styles; `Button.test.tsx`                                  | Hover shadow per D-B1                                                     |
| A-2  | Visible focus ring on every interactive primitive                                                                                                | PASS                                                                                          | D-B2 ring on Button, Tabs (D-T2), Menu items, Dialog and Sheet close buttons; Input focus border and glow (contract) | Card, Badge and Avatar are non-interactive by design                      |
| A-3  | Dialog and Sheet: focus trap, Esc closes, focus returns to the trigger, `aria-modal`, labelled                                                   | PASS                                                                                          | Dialog and Sheet unit tests; E2E "focus trap", "Esc, scrim click and the close button…"                              |                                                                           |
| A-4  | Every control works with the keyboard only                                                                                                       | PASS                                                                                          | Keyboard tests for Button, Input, Tabs, Menu, Popover, Dialog, Sheet                                                 |                                                                           |
| A-5  | Touch targets suitable for mobile                                                                                                                | PASS                                                                                          | 44 / 46 / ≥ 58 / 38–44px geometry tests; tap test at 390 with a coarse pointer                                       |                                                                           |
| A-6  | Component tests per primitive (states, disabled, keyboard)                                                                                       | PASS                                                                                          | 12 `src/shared/ui` test files; 697 unit tests pass                                                                   |                                                                           |
| A-7  | `jest-axe` per primitive                                                                                                                         | PASS                                                                                          | An axe block in each delivered primitive's test file, RTL and LTR                                                    |                                                                           |
| A-8  | Dialog focus-trap test                                                                                                                           | PASS                                                                                          | `Dialog.test.tsx`; E2E Tab / Shift+Tab never reach the page                                                          |                                                                           |
| A-9  | Universal checks: `tsc`, lint, import cycles, unit tests, axe on touched screens, keyboard pass, RTL and LTR, 1440/768/390 + 320                 | PASS                                                                                          | `pnpm check` (dependency-cruiser: no cycles or violations); §5                                                       | E2E scope as in §4                                                        |
| A-10 | Deliverable: `shared/ui/*` with typed props and tests                                                                                            | PASS                                                                                          | §3                                                                                                                   | For the nine delivered components                                         |
| A-11 | Deliverable: development-only `/dev/components` gallery                                                                                          | PASS                                                                                          | Nine sections (PR #23); 404 in production                                                                            |                                                                           |
| A-12 | DoD: every variant maps to props, not copies                                                                                                     | PASS                                                                                          | Contract APIs (`variant`, `size`, `padding`, `status`, `tone`, `decorative`)                                         |                                                                           |
| A-13 | DoD: no visual component used by features exists outside `shared/ui`                                                                             | PASS                                                                                          | No feature modules exist yet; the gallery uses only `shared/ui`                                                      | Re-checked in each feature phase                                          |
| A-14 | Roadmap scope: Textarea, Select, Checkbox, Radio, Switch (with label and inline error), Tooltip, generic Badge; Navigation Icon Button inspected | DEFERRED — APPROVED                                                                           | ADR-002; plan §2.1; §6                                                                                               | **Not implemented.** Built before the first consuming feature is complete |
| A-15 | DoD: phase report written; `PROGRESS.md` updated; nothing from later phases started                                                              | PASS for the report and "nothing started" (no Phase 04 work on `main`); `PROGRESS.md` pending | This report; git history                                                                                             | `PROGRESS.md` is updated on closure approval (K-2)                        |
| A-16 | Approved deferrals recorded                                                                                                                      | DEFERRED — APPROVED                                                                           | §6                                                                                                                   |                                                                           |

**Summary:** 14 PASS, 2 DEFERRED — APPROVED (A-14 and A-16), 0 BLOCKED.

- A-15 counts as PASS for the report and for "nothing from later phases started". The
  `PROGRESS.md` update is made at formal closure, by the user's instruction.
- **Consistency with the original criteria:** no criterion was removed, reworded or added. A-14 is
  the original Roadmap scope, now formally deferred, and is not counted as PASS.

## 9. Closure recommendation

**APPROVED — Phase 03 CLOSED** (user, 2026-11-16; effective when the closure PR is merged).

- Every delivered component meets its contract and the Roadmap acceptance criteria (A-1 to A-13,
  A-15).
- The undelivered Roadmap scope is explicitly deferred with the user's approval (A-14, ADR-002).
- The other approved deferrals are recorded (A-16).
- Nothing is BLOCKED.

The deferred components are **not implemented**. They stay required, with the triggers in §6.

The user approved this report on 2026-11-16. `PROGRESS.md` is updated in the same closure PR,
and Phase 03 is formally CLOSED when that PR is merged.

## 10. Next-phase readiness

- **Ready for Phase 04 (Routing & navigation registry)** once Phase 03 is closed.
- **Every later phase:** check at planning time whether its screens consume a deferred primitive
  (§6). If so, add the contract and implementation to that phase's scope.
- **Order agreed by the user:**
  1. Approval of this report (done, 2026-11-16).
  2. `PROGRESS.md` update and the closure PR (this PR).
  3. The project-wide Motion & Interaction Audit.
  4. Phase 04.
- **Team:** Mariam joins from Phase 04 (ownership change, 2026-11-16). Module assignments are
  recorded in `PROGRESS.md` when the user makes them.
