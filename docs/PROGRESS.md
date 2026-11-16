# MUNSIT AI — Development Progress

Single resume point. A new session starts by reading this file, the latest phase report, and
[docs/references/MUNSIT_AI_Development_Roadmap_v1.0.md](references/MUNSIT_AI_Development_Roadmap_v1.0.md).

- **Current phase:** 04 — Routing & navigation registry — **In progress** (implementation
  authorized by the user on 2026-11-16; branch `feat/phase-04-routing-navigation`). Plan:
  [phases/phase-04-plan.md](phases/phase-04-plan.md); folder-route interpretation:
  [decisions/ADR-003-phase-04-folder-focus-routes.md](decisions/ADR-003-phase-04-folder-focus-routes.md)
  (Approved). Draft report: [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md).
  All Phase 04 product copy approved (2026-11-16). Open risk **R-2** (blank no-JavaScript 404,
  accepted temporarily; Phase 22 gate) — see Risks.
- **Phase 03:** **CLOSED** — closure PR #24 merged (`4a2f3f4`). Report:
  [phases/phase-03-closure-report.md](phases/phase-03-closure-report.md): 14 PASS, 2 DEFERRED —
  APPROVED, 0 BLOCKED. Final Phase 03 code commit: `fff239e`.
- **Between Phase 03 and Phase 04 (2026-11-16):**
  - Motion & Interaction Audit of the nine Phase 03 components: **completed**. Finding M-1 (Tabs
    hover not limited to fine pointers) fixed in PR #25 (`cf96d97`). M-2 to M-6 are design-spec
    gaps (close-button and menu pressed states, Input hover, Button loading), not defects.
  - Phase 04 plan approved (D-R1 to D-R12) and merged through PR #26 (`de697cf`), including
    ADR-003.
- **Phase 03 deliveries (all merged through PRs, rebase, CI green):**
  - Button V1: #8 (Mariam delivery)
  - Input V1: #11 (Mariam delivery)
  - StatusBadge V1: #14
  - Tabs V1: #16
  - Dialog V1: #17
  - Sheet V1: #18 (includes the Dialog keyboard-scroll fix)
  - Popover/Menu V1: #20
  - Avatar V1: #21 (`27873c6`)
  - Card V1: #22 (`cc56b26`)
  - Final gallery integration and browser QA, plus the approved Tabs compact responsive fix:
    #23 (`a7adcc3`, `fff239e`)
- **Phase 03 evidence:**
  - `pnpm check`: pass, 697/697 unit tests.
  - Full E2E: 241/241, before the Tabs fix.
  - Targeted gallery spec: 36/36 after the fix, including 6 new responsive regression tests.
  - CI `check`: green on every PR.
  - Chromium only; cross-browser E2E is in Phase 22.
- **Ownership change (user, 2026-11-16):** Yousef and Claude finished Phase 03. Mariam joins
  from Phase 04.
- **Latest report:** [phases/phase-03-closure-report.md](phases/phase-03-closure-report.md) (Phase 04 draft: [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md); Phase 02: [phases/phase-02-report.md](phases/phase-02-report.md); Phase 01: [phases/phase-01-report.md](phases/phase-01-report.md))
- **Stack decision:** [decisions/ADR-001-frontend-stack.md](decisions/ADR-001-frontend-stack.md) (Approved by the user, 2026-11-12)
- **Phase 01 commit:** `acf48c9` `chore: initialize project (Phase 01)` on `main`.
- **Phase 02 commit:** `79685af` `docs(phase-02): design values, progress and phase report` on
  `main` (last of 7 Phase 02 commits, `c7455f2`..`79685af`; CI `check` green on PR #2 and on `main`).
- **Repository:** https://github.com/yousefosolimanofficial/MUNSIT-AI (public, default branch
  `main`). GitHub's auto-generated initial commit was merged without force-push. Collaboration
  setup: README §15 workflow, PR template, `CLAUDE.md`.

## Team and module assignments

| Developer | Role                                                         | Assigned modules                                      |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| Yousef    | Frontend Lead — architecture, shared foundation, integration | Shared foundation (by role); modules not assigned yet |
| Mariam    | Frontend Developer — assigned feature modules                | Not assigned yet                                      |

**Phase 03 assignment (agreed by the user, 2026-11-13).** Yousef: component requirements and
architecture review, contracts, integration, quality assurance, GitHub management. Mariam:
shared components **Button** (first delivery), **Input**, **Card**, **Badge**, and other shared
components in later deliveries as assigned. `src/shared` stays Yousef-owned; Mariam is
delegated only the files named in each component contract (e.g. `src/shared/ui/Button.tsx` and
its test). **Feature-module ownership is unchanged** — modules remain unassigned until the user
decides. Details: [phases/phase-03-plan.md](phases/phase-03-plan.md) §3.

Yousef is the sole GitHub integrator and publisher. Mariam is not a repository collaborator; she
works offline and delivers packages per [TEAM_COLLABORATION.md](TEAM_COLLABORATION.md).

## Phase status

| #   | Phase                               | Status      |
| --- | ----------------------------------- | ----------- |
| 01  | Project initialization & tooling    | Done        |
| 02  | Design System implementation        | Done        |
| 03  | Core UI primitives                  | Done        |
| 04  | Routing & navigation registry       | In progress |
| 05  | Shared App Shell                    | Not started |
| 06  | Shared states & overlay/guard infra | Not started |
| 07  | Landing Page                        | Not started |
| 08  | Authentication UI                   | Not started |
| 09  | Dashboard                           | Not started |
| 10  | Lecture Management                  | Not started |
| 11  | Lecture Details                     | Not started |
| 12  | Live Recording                      | Not started |
| 13  | AI Virtual Tutor                    | Not started |
| 14  | My Summaries                        | Not started |
| 15  | AI Question Bank                    | Not started |
| 16  | My Notes                            | Not started |
| 17  | AI Flashcards                       | Not started |
| 18  | Favorites                           | Not started |
| 19  | My Folders                          | Not started |
| 20  | Profile & Settings                  | Not started |
| 21  | API integration                     | Not started |
| 22  | Testing & hardening                 | Not started |
| 23  | Deployment preparation              | Not started |

## Open blockers

None.

## Outstanding obligations (deferred Phase 03 primitives)

Approved deferral: [ADR-002](decisions/ADR-002-phase-03-scope-deferral.md),
[phase-03-plan.md](phases/phase-03-plan.md) §2.1. These are deferred, not cancelled, and not
implemented. Each is built from an approved contract in `src/shared/ui`, with unit,
accessibility and browser validation, **before the first consuming feature is considered
complete**. No local substitutes.

| #   | Component              | Trigger and notes                                                                                                                  | Status      |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| O-1 | Textarea               | First consuming feature                                                                                                            | Outstanding |
| O-2 | Select                 | First consuming feature; Menu does not replace it                                                                                  | Outstanding |
| O-3 | Checkbox               | First consuming feature                                                                                                            | Outstanding |
| O-4 | Radio                  | First consuming feature; a Tabs filter group does not replace native Radio controls                                                | Outstanding |
| O-5 | Switch                 | First consuming feature                                                                                                            | Outstanding |
| O-6 | Tooltip                | First consuming feature                                                                                                            | Outstanding |
| O-7 | Generic Badge          | First consuming feature; StatusBadge does not replace it                                                                           | Outstanding |
| O-8 | Navigation Icon Button | Figma verification and implementation before its first consuming screen (may come before Phase 05, e.g. the Landing mobile navbar) | Outstanding |

Each phase checks at planning time whether its screens consume one of these, and if so adds it to
that phase's scope.

## Risks and tracked issues

| ID  | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Status / action                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-1 | Builds depended on Google Fonts at build time (`next/font/google`); failures observed on a slow network.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Resolved 2026-11-13** — fonts self-hosted with `next/font/local` (`src/design-system/fonts/`, OFL); build, dev server and E2E verified with the network blocked.                                                                               |
| I-1 | Phase 01 placeholder `/` heading uses `text-2xl font-bold`; `text-2xl` no longer exists (Tailwind scale removed in step 3), so the heading has no size. Not part of the final design.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Open — placeholder is replaced by the Landing page in Phase 07.                                                                                                                                                                                  |
| I-3 | Development-only React hydration mismatch warning during `pnpm test:e2e` on `/dev/tokens` (likely `tests/e2e/icons.spec.ts` styling cells before hydration). Tests pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Resolved** — PR #5 (`4990281`); GitHub issue #3 closed. E2E now fails on browser console errors.                                                                                                                                               |
| I-2 | `UI/Navigation` (Cairo) has style name "ExtraBold" but weight 400 in Figma.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | NOT VERIFIED — confirm in Figma before any use.                                                                                                                                                                                                  |
| R-2 | **404 rendering (Phase 04, accepted temporarily 2026-11-16):** unknown or deferred URLs return HTTP 404, but the first HTML is Next.js 16.4.6's empty error document. The localized 404 appears only after hydration, so without JavaScript (or if JS fails, or for non-JS crawlers) the page is **blank**: no message, no link back, no descriptive title. Low SEO impact (404 + `noindex`); accessibility dead end without JS. Framework behaviour for `notFound()`, reproduced in a minimal Next app; alternatives: proxy rewrite to a static 404 (amends D-R8) or experimental `global-not-found`. Details: [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md) §7.1. | **Open — accepted only as a development-stage limitation, not production behaviour.** Re-test at the next Next.js upgrade. **Must be resolved or explicitly re-accepted by the product owner before production launch, no later than Phase 22.** |

## Environment notes

- Node.js v24.22.3, pnpm 12.18.0 (Corepack), Git 2.55.0.windows.3, Windows 11.
- `corepack enable` needs an elevated terminal on this machine; until then use `corepack pnpm …`.
- Network to the npm registry is slow (~30–90 KiB/s); a cold install took ~40 minutes.
- Original logo exports stay in the local `assets/` folder (repository root, git-ignored, never
  read by code or tests); committed byte-identical copies live in `public/brand/`.

## Phase 02 steps

Approved by the user 2026-11-13: CSS-first motion (no animation library), motion tokens
120/200/320/400ms + `cubic-bezier(0.4, 0, 0.2, 1)`, motion folded into Phases 02–20, white inset
highlight rejected (Electric Sky 8% instead). No new dependency without the user's approval.

Step 3 decisions (user, 2026-11-13): Landing / Auth / Foundation typography tokens are built in
their Roadmap phases (07 / 08 / first consuming screen), not now. Components must isolate
numerals and English runs inside Arabic text (direction isolation). See R-1, I-1, I-2.

| #   | Step                                                         | Status                         |
| --- | ------------------------------------------------------------ | ------------------------------ |
| 1   | Read-only Figma check (motion, Stat Card Intro, layout vars) | Done — `docs/design-values.md` |
| 2   | Design tokens + motion foundation                            | Done — accepted (2026-11-13)   |
| 3   | Typography (Cairo, Inter, Geist Mono; `Dashboard/*` scale)   | Done — accepted (2026-11-13)   |
| 4   | Official logo assets + `Logo` component                      | Done — accepted (2026-11-13)   |
| 5   | Icon component + mirror whitelist                            | Done — accepted (2026-11-13)   |
| 6   | i18n / RTL base (`next-intl` 4.15.1)                         | Done — accepted (2026-11-13)   |
| 7   | Final audit + phase report; G-1, G-2 implemented             | Done — approved (2026-11-13)   |

## Next action

**2026-11-16:** Phase 04 implementation in progress on `feat/phase-04-routing-navigation`:
routes, registry, active-destination resolver, placeholders, localized 404 and error handling,
tests. The implementation PR merges only after review and the product owner's approval of the
PROPOSED bilingual copy (D-R9). Mariam's Phase 04 tasks are not delegated yet.

**2026-11-16:** Phase 03 closure approved by the user. Once the closure documentation PR is
merged, the next step is the project-wide Motion & Interaction Audit, then Phase 04 (Routing &
navigation registry), each started only on the user's instruction.

### History

Phase 02 is **completed** (2026-11-13): all acceptance criteria passed, the six visual baselines
were approved by the user, PR #2 was merged into `main` (final commit `79685af`) with CI `check`
green, and `pnpm check` + `pnpm test:e2e` (74/74) passed on the merged commit. The hydration
warning stays open in issue #3 (I-3).

Phase 03 plan, role split, Button contract (final: D-B1–D-B6, Ember Hush rule) and the P-1
dev-dependency list approved by the user (2026-11-13). Order: (1) issue #3 fix PR, (2) Phase 03
docs PR, (3) `chore(deps)` PR, each with `pnpm check`, E2E and CI; merges only with the user's
approval. Then starter v2 from the newest merge commit, verified in an empty folder, and the
delivery package for Mariam.

**2026-11-14:** Button V1 completed (PR #8, `9eebeba` on `main`, CI green). Input contract final (D-I1–D-I4 approved, D-I3 = Text / Muted default border). Next:
merge the contract PR, then starter v3 from the newest `main` and the Input package for Mariam.

**2026-11-15:** Input V1 completed (PR #11, rebase, `0f77aeb` on `main`, CI green). Delivery
`shared-ui-input` v1 applied verbatim (SHA-256 verified); `/dev/components` Input section and
22 integration tests added; `pnpm check` (530 tests, build) and `pnpm test:e2e` (117) passed on
the PR head; dev routes 404 in production; gallery screenshots approved by the user (no visual
baselines committed). Card contract final (D-C1–D-C5 approved; responsive Figma check, type-level
static API verified with `tsc`, Recent Lecture Row confirmed non-interactive). Merged through
PR #12 (rebase, `eb8185e`, CI green on PR and `main`).

**2026-11-15:** Starter v4 built from `main` at `eb8185e` with `git archive` and verified (TEAM_COLLABORATION
§8): 196 tracked files byte-identical + `BASELINE_COMMIT.txt` + setup-only `START_HERE.md` (no task
assigned); in an empty folder `pnpm install --frozen-lockfile` and `pnpm check` passed (530/530,
build 8/8). Next: the user's approval of starter v4, then the Card V1 assignment for Mariam.

**2026-11-15:** StatusBadge V1 merged (PR #14, `caac393`): four statuses (ready, processing,
pending, failed), static, tokens only; 22 tests, `pnpm check` 552/552, CI green. Dashboard chips
stay with the Dashboard features (D-BG2). `/dev/components` Badge section and browser QA follow the
Card V1 integration.

## Starter package gate (Mariam)

**Prepared and verified 2026-11-13** from `main` at `79685af` with `git archive`
(`munsit-starter-79685af.zip`, plus `BASELINE_COMMIT.txt` and a `START_HERE.md` setup guide).
Verified on the zip itself: contents equal the 180 tracked files, fonts/logos/baselines
byte-identical to Git, no `node_modules`/`.next`/`.git`/`assets`/secrets (only `.env.example`);
extracted to an empty folder, `pnpm install --frozen-lockfile` and `pnpm check` passed (388 tests,
build). Logged in [TEAM_COLLABORATION.md §8](TEAM_COLLABORATION.md#8-delivery-log). A new starter
is issued only when `main` changes in a way Mariam needs.
