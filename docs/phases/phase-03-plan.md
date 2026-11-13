# Phase 03 — Core UI primitives (Shared UI components) — Plan

- **Status:** Plan and role split approved in principle by the user (2026-11-13). Open items:
  P-1 (dependencies), D-B6 (contrast), P-4 (issue #3 PR). No Phase 03 component code exists.
- **Baseline:** `main` at `b62ab21`. Its code is identical to `79685af`, the Phase 02 merge and the
  starter v1 baseline; the newer commit changes docs only.
- **Branch:** `phase/03-shared-ui`
- **Sources:**
  - Development Roadmap v1.0 §7 (Phase 03), §4 and §8
  - Design System Reference v1.0 §2, §3 and §5
  - Frontend Handoff (Components, Accessibility, Guards)
  - `docs/design-values.md`
  - `docs/TEAM_COLLABORATION.md`
  - `CLAUDE.md`

## 1. Objective

Build reusable, accessible primitives that match verified Figma components, in `src/shared/ui`.
Each component has typed props and tests. Variants and states are props, never copies (Roadmap
Phase 03).

## 2. Scope

**In scope (Roadmap Phase 03):**

- Button
- Input, Textarea, Select, Checkbox, Radio and Switch, each with a label and an inline error (red
  border plus message)
- Badge, including the Status Badge: في الانتظار / قيد المعالجة / جاهزة
- Tabs, Tooltip and Avatar
- Card surfaces
- Dialog and Sheet (a bottom sheet with a grabber and a close button)
- Popover / Menu
- The development-only `/dev/components` gallery

**Out of scope:**

- Shell parts (Phase 05)
- Overlay and guard infrastructure (Phase 06)
- Any module screen
- Landing and Auth buttons, which use their own text styles (`Landing/Button/Default`,
  `Auth/Button/Primary`) and are verified in Phases 07 and 08
- Data fetching and mock data

**Rule from the Roadmap:** inspect Figma for every NOT VERIFIED property as each component is
built (Navigation Icon Button, inputs, dialogs, badges, tabs). A value that Figma does not define
is a decision for the user. It is never invented.

## 3. Roles and assignment for Phase 03 (agreed by the user, 2026-11-13)

| Person                      | Phase 03 responsibilities                                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yousef (Frontend Lead)      | Component requirements and architecture review; component contracts; Figma verification; prerequisites (below); integration of every delivery; quality assurance; GitHub management (branches, PRs, CI, merges, starter packages) |
| Mariam (Frontend Developer) | Implements the delegated shared components, offline, one delivery per component: **Button** (first), **Input**, **Card**, **Badge**; other shared components in later deliveries as Yousef assigns them                           |

**Ownership note.** `src/shared` stays owned by Yousef (CLAUDE.md). For Phase 03 only, Mariam is
**delegated** the files named in each component contract, for example `src/shared/ui/Button.tsx`
and its test. Yousef still integrates and approves every change.

**This delegation does not change ownership of feature modules.** Later feature modules
(`src/features/<module>`) are still unassigned. Each one is assigned only when the user decides,
and the assignment is recorded in `docs/PROGRESS.md`.

## 4. Prerequisites before Mariam's first delivery (Yousef)

Status 2026-11-13: plan and role split approved in principle by the user.

| ID  | Item                                                                                      | Status                                                                                |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| P-1 | Component-test dev dependencies (§4.1)                                                    | **Approved by the user 2026-11-13.** Installed in a separate `chore(deps)` PR         |
| P-2 | Focus ring (D-B2)                                                                         | **Decided:** `:focus-visible`, 2px Electric Sky, offset 2px                           |
| P-3 | Button decisions D-B1 to D-B6 and the Ember Hush rule                                     | **Decided**; contract final (Button contract §12)                                     |
| P-4 | Fix issue #3 (hydration warnings in E2E)                                                  | Separate PR from `fix/e2e-hydration-warning` (approved to open; merge needs approval) |
| P-5 | `/dev/components` gallery route (`src/app` is Yousef-owned)                               | Built by Yousef during integration                                                    |
| P-6 | Starter package **v2** from the newest `main` merge commit after P-1 (and P-4) are merged | After P-1; verified in an empty folder like v1                                        |

Mariam can read the contract now. **She starts coding only when the Button contract is final
(D-B6 approved) and starter v2 is issued** (P-1 and P-6). Otherwise she would write tests that
must be redone and styles that may change.

### 4.1 P-1: component-test dependencies (approved 2026-11-13; all `devDependencies`, exact pins)

Each version is the newest release that is **at least 14 days old** (cut-off 2026-10-30), so that
a just-published, possibly compromised release is never pulled. Checked against the npm registry
on 2026-11-13. Production code never imports these packages; dependency-cruiser already enforces
this.

| Package                       | Version  | Published  | Why                                                                                 | Notes                                                                                                                                                                                         |
| ----------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@testing-library/react`      | `16.3.3` | 2026-08-27 | Render components and query by role or name in component tests                      | Peers: React 18 or 19, `@types/react(-dom)` 19 (installed), `@testing-library/dom` 10                                                                                                         |
| `@testing-library/dom`        | `10.4.2` | 2026-09-13 | Required peer of `@testing-library/react` 16                                        | No dependencies of its own beyond DOM helpers                                                                                                                                                 |
| `@testing-library/user-event` | `14.6.8` | 2026-10-13 | Real keyboard and pointer interaction (Tab, Enter, Space, click)                    | **Correction:** the latest is `14.6.10` (published 2026-11-12, about 1 day old) and `14.6.9` (2026-11-10, 3 days old) also exists; both are younger than 14 days and skipped. No dependencies |
| `jsdom`                       | `30.1.3` | 2026-10-15 | DOM environment for component tests in Vitest                                       | The latest, 31.0.1, was released today, so it is skipped. Node `^24.15.0` is satisfied (24.22.3). `canvas` is an optional peer and is not installed                                           |
| `jest-axe`                    | `11.0.0` | 2026-07-26 | Automated accessibility check per primitive (named in Roadmap Phase 03 and ADR-001) | Brings `axe-core`, `jest-matcher-utils`, `chalk`, `lodash.merge`. Works with Vitest through `expect.extend`                                                                                   |

| `@axe-core/playwright` | `4.14.0` | 2026-10-15 | Accessibility scans of rendered pages in a real browser (E2E); closes G-3 | MPL-2.0; peer `playwright-core` ≥ 1 (installed 1.65 via `@playwright/test`); depends on `axe-core` |

**Use (decided by the user):** `jest-axe` for component tests (jsdom: structure, roles, names,
ARIA). `@axe-core/playwright` for real-browser accessibility tests. **Contrast is never measured
in jsdom.** It is measured from token values (unit test) and on the rendered page in Chromium.

`jest-axe` ships no TypeScript types, and `@types/jest-axe` would pull in `@types/jest` and an old
`axe-core` 3.x, so it is **not** added. A small local declaration file covers the two functions
used. `@testing-library/jest-dom` and `vitest-axe` are not added.

**How they are added:**

1. `corepack pnpm add -D --save-exact` with the versions above.
2. Component tests opt in to the DOM per file with `// @vitest-environment jsdom`. The global
   Vitest environment stays `node`, so existing tests are untouched. A small shared setup (axe
   matcher, cleanup) goes in `tests/unit/setup.ts`.
3. ADR-001 update: move the packages from "Deferred" to the approved list, with their reasons.
4. One separate `chore(deps)` commit, then `pnpm install --frozen-lockfile`, `pnpm check`,
   `pnpm test:e2e` and `pnpm audit --prod`, all with real results.
5. PR → CI → merge, only with the user's approval.

## 5. Component order and deliveries

| Order | Component                                                                                     | Owner                 | Delivery              | Notes                                                                          |
| ----- | --------------------------------------------------------------------------------------------- | --------------------- | --------------------- | ------------------------------------------------------------------------------ |
| 1     | Button                                                                                        | Mariam                | `shared-ui-button` v1 | Contract: [phase-03-button-contract.md](phase-03-button-contract.md)           |
| 2     | Input (plus label and inline error)                                                           | Mariam                | `shared-ui-input` v1  | Figma values NOT VERIFIED. Yousef reads Figma and writes the contract first    |
| 3     | Card surfaces                                                                                 | Mariam                | `shared-ui-card` v1   | Some values verified (doc cards, Statistic Card); the rest NOT VERIFIED        |
| 4     | Badge and Status Badge                                                                        | Mariam                | `shared-ui-badge` v1  | Labels per Handoff; style NOT VERIFIED                                         |
| 5+    | Textarea, Select, Checkbox, Radio, Switch, Tabs, Tooltip, Avatar, Dialog, Sheet, Popover/Menu | Assigned per delivery | —                     | Dialog and Sheet focus-trap work may stay with Yousef (architecture-sensitive) |

Each component goes through the same loop:

1. Yousef verifies Figma and writes the contract.
2. The user approves any open decision.
3. Mariam implements offline and sends a delivery.
4. Yousef runs intake and integration (`delivery/<component>-v<n>` branch, checks, PR, CI,
   merge).
5. Yousef adds the component to `/dev/components`, updates visual baselines (approved by the user)
   and logs the delivery.

## 6. Delivery requirements (every Mariam delivery)

Per `docs/TEAM_COLLABORATION.md` §5 and `docs/FEATURE_DELIVERY_CHECKLIST.md`. Each delivery
contains:

- The source files at their exact repo-relative paths, in `files/` and/or `delivery.patch`.
- `DELIVERY.md` with the **exact full baseline commit hash** from `BASELINE_COMMIT.txt`.
- The real results of `typecheck`, `lint`, `format:check`, `test` and `build`.
- Screenshots at 1440, 768 and 390, in RTL and LTR, for every variant and state.
- Known issues and anything NOT VERIFIED.
- **Integration instructions:** files to add, where Yousef should wire the component (gallery
  section), and the order of steps.

Yousef reviews, integrates and merges every delivery. Mariam never pushes.

## 7. Phase 03 acceptance (Roadmap)

- Button values: height 44, padding-x 20, radius 12. Hover is Info Blue plus a shadow. Disabled is
  a Slate fill with a Muted label. All values come from Figma.
- A visible focus ring on every interactive primitive.
- Dialog and Sheet: focus trap, Esc closes, focus returns to the trigger, `aria-modal`, and a
  label.
- Every control works with the keyboard only. Touch targets are suitable for mobile.
- Tests: component tests per primitive (states, disabled, keyboard), an axe check per primitive,
  and a dialog focus-trap test.
- Universal checks (Roadmap §4): `tsc`, lint, import cycles, unit and component tests, axe on
  touched screens, a keyboard pass, RTL and LTR, 1440/768/390 plus a 320 overflow check.
- DoD: no visual component used by features exists outside `shared/ui`, and every variant maps to
  props.

## 8. Risks

| Risk                                                            | Mitigation                                                                                                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Figma silent on focus, loading, icon slot and destructive style | Decisions D-B2 to D-B5 before coding; never invented                                                                                            |
| Hover shadow blur: the Reference halves Figma's blur (18 → 9)   | Decision D-B1; one local constant either way                                                                                                    |
| Secondary Pressed label contrast 4.29 on Graphite (below 4.5)   | User rejected 4.29 as AA. Minimal fixes proposed (contract §12.2; recommended: Pressed fill 24% → 20%); no color changes before approval (D-B6) |
| Offline drift: Mariam's starter is older than `main`            | One starter per prerequisite batch; delivery rebased on `main` by Yousef                                                                        |
| Test-tooling gap (no jsdom or axe yet)                          | P-1 before coding                                                                                                                               |
| Visual baselines are Windows/Chromium-only                      | Mariam's screenshots are review evidence; baselines are created by Yousef during integration                                                    |

## 9. Next steps

1. The user decides D-B6 and approves the P-1 dependency list (D-B1 to D-B5 decided 2026-11-13).
2. P-1: dependency approval, then a `chore(deps)` PR.
3. P-4: the issue #3 fix PR.
4. P-6: starter v2 and the Button contract handed to Mariam.
5. Mariam's Button delivery is integrated, then the next contract (Input) follows.
