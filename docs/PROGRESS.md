# MUNSIT AI — Development Progress

Single resume point. A new session starts by reading this file, the latest phase report, and
[docs/references/MUNSIT_AI_Development_Roadmap_v1.0.md](references/MUNSIT_AI_Development_Roadmap_v1.0.md).

- **Current phase:** 08 — Authentication UI — **IN PROGRESS** (plan approved 2026-11-23,
  decisions D-08-1 to D-08-10). **Increment 1 (Foundation): COMPLETE** (PR #75), under its approved
  contract ([phases/phase-08-increment-1-contract.md](phases/phase-08-increment-1-contract.md)).
  All Increment 1 scope is implemented on PR #75 and **owner-approved** (2026-11-23, contract
  §16.5). `PasswordRule` was offered to Eng. Mariam; she did not confirm, so it was built
  internally (I1-3 fallback; no starter package was issued). Plan and Figma audit:
  [phases/phase-08-plan.md](phases/phase-08-plan.md).
  **Increment 2 (Login UI): COMPLETE** (PR #78, merged as `d3e7c76` from the reviewed head
  `9d96421`; post-merge CI run 45484982422 `check` and `e2e` green). "UI-complete, not
  functional": `/login` always ends with "unavailable". Owner visual approval of all 12 Figma
  comparisons on 2026-11-24
  ([phases/phase-08-increment-2-contract.md](phases/phase-08-increment-2-contract.md) §10).
  **Increment 3 (Register): COMPLETE** (PR #82, merged as `9c803de` from the approved head
  `0b8ec4f`; post-merge CI run 45998782917 `check` and `e2e` green). Contract PR #80, shared
  states PR #81 (`c5a0290`). "UI-complete, not functional": `/register` always ends with
  "unavailable". Owner visual approval of all 33 Figma states on 2026-11-27
  ([phases/phase-08-increment-3-contract.md](phases/phase-08-increment-3-contract.md) §10); R-6
  stays provisional.
  **Increment 4 (Forgot and Reset Password): COMPLETE** (PR #86, merged as `3ea0122` from the
  approved head `f9f25fb`; post-merge CI run 46168746602 `check` and `e2e` green). Eng. Mariam's Recovery delivery v1,
  integrated by Yousef. "UI-complete, not functional": both forms always end with "unavailable".
  Owner visual approval on 2026-11-28
  ([phases/phase-08-increment-4-closure.md](phases/phase-08-increment-4-closure.md) §3).
  **Increment 5 (Verification): IMPLEMENTED — in owner review** (draft PR #89; plan PR #88,
  `46257fa`). Tests and docs only. Closure report:
  [phases/phase-08-closure-report.md](phases/phase-08-closure-report.md). Phase 08 closes only
  after the owner approves and #89 is merged.
  Production is unchanged (`AUTHENTICATION_AVAILABLE = false`).
- **DevOps handoff v1** (owner request 2026-11-23): initial testing package, not a release —
  [devops/HANDOFF.md](devops/HANDOFF.md), with `Dockerfile`, `.dockerignore` and `compose.yaml`.
  Any change to dependencies, versions, ports, variables or runtime configuration gets a new row
  in its change log (§9), and DevOps is notified.
- **Phase 07:** Landing Page — **CLOSED — IMPLEMENTATION COMPLETE — PRODUCTION RELEASE BLOCKED** (Product Owner approval
  2026-11-23; P07-D26). The application is **not** production-ready; release-readiness
  obligations stay open and NOT VERIFIED where untested. Closure report:
  [phases/phase-07-closure-report.md](phases/phase-07-closure-report.md).
  - **Increment 0 (planning): COMPLETE** (PR #49). Owner decisions P07-D1 to P07-D13 are
    recorded (2026-11-19).
    - Plan: [phases/phase-07-plan.md](phases/phase-07-plan.md).
    - Figma audit: [design-values.md §16](design-values.md).
    - Copy approval package: [phases/phase-07-landing-copy.md](phases/phase-07-landing-copy.md).
    - Hero video brief: [phases/phase-07-hero-video-brief.md](phases/phase-07-hero-video-brief.md).
  - **Approved:** D-P07-HERO-01, a product-focused Hero video.
  - **Pending:**
    - English copy (P07-D1, PENDING FINAL APPROVAL);
    - the Hero video asset;
    - approved commercial pricing content (P07-D4: placeholder pricing is development only and
      never shown to real visitors);
    - real legal pages (P07-D2).

    These are all public-launch blockers.

  - **Increment 1 (Landing foundation): COMPLETE** (PR #50, `60044cc`; approved and merged
    2026-11-19; post-merge CI green).
    - **Built:** header (Desktop, Tablet, Mobile), menu (shared `Sheet`), footer (legal items as
      non-interactive text), section boundaries in the approved order, metadata and Open Graph
      infrastructure (no image), static generation, Landing typography tokens, and the `landing`
      messages (Arabic verbatim; English PROPOSED and gated out of production).
    - **Navigation weight:** measured, 400 (design-values §16.5).
    - **Mariam:** card specifications **APPROVED** (2026-11-19) in
      [phases/phase-07-mariam-contract.md](phases/phase-07-mariam-contract.md). Starter
      `munsit-starter-01453f4.zip` is **SENT / AWAITING IMPLEMENTATION** (send confirmed by the
      owner on 2026-11-19, exact send time not recorded; plan §8c; delivery log v7).
  - **Increment 2 (Hero): COMPLETE** (PR #52, approved 2026-11-19). The contract is **APPROVED**
    ([phases/phase-07-hero-contract.md](phases/phase-07-hero-contract.md)), with P07-D14 to
    P07-D16: near-black temporary background, the 40 px Pause/Play control, the two-bar pause icon.
  - **Increment 3 (Showcase and Use Cases): COMPLETE** (PR #53, approved 2026-11-19). Static
    illustration and Figma copy only; four Figma images exported to WebP (design-values
    §16.4); outcome in plan §8d; differences in design-values §16.6.
  - **P07-D17 (APPROVED):** the Showcase recording waveform and indicator stay static (not an
    active recorder). A Landing Visual Refinement increment (ambient glows, gradients,
    transitions, scroll reveals, hover, Hero video integration, nav centring check) was approved
    as planning, then started on 2026-11-20.
  - **Visual Refinement and Hero media: COMPLETE** (PR #55, merged as `0826ab1`; owner accepted
    2026-11-20). The Hero video is a **provisional development asset**; production approval is
    DENIED (gate closed) until a product-accurate replacement and a portrait master exist.
    Report: [phases/phase-07-hero-media.md](phases/phase-07-hero-media.md).
  - **Showcase design revision (P07-D22): COMPLETE** (PR #61, merged as `715a4a7`; owner approved
    2026-11-21 after the combined visual review). The native Mobile live-transcription card replaces
    the Desktop and Tablet screenshot: Desktop 760 wide, 48 below the stage top; Tablet 520; Mobile
    pixel-identical; section heights and positions unchanged. It includes the Showcase → Features
    glow falloff and the Hero letterbox fix. Values: design-values §16.8.
  - **Compact Landing navbar (P07-D23): COMPLETE** (PR #64, merged as `f215a91`; owner approved
    2026-11-21; post-merge CI green). Details:
    [phases/phase-07-navbar-refinement.md](phases/phase-07-navbar-refinement.md).
  - **Increment 4 (Features and How It Works): COMPLETE** (PR #56, merged as `b364cd5`; owner
    approved 2026-11-20; post-merge CI green). Original implementation by **Mariam** (delivery
    v1, **ACCEPTED / INTEGRATED**, byte-identical); integration by Yousef (Figma visuals, page
    wiring, E2E). Typography differences accepted as known, non-blocking (plan §8f; ClickUp
    "Phase 07 — Investigate Arabic Typography and Font Fallback", fix not approved).
  - **Increment 5 (FAQ, Pricing, Final CTA): COMPLETE** (PR #58, merged as `5b17b27`; owner
    approved 2026-11-20; post-merge CI green). Decisions P07-D18 (FAQ accordion), P07-D19
    (Pricing development only; production gate unchanged), P07-D20 (Figma plan labels accepted
    for the development preview; commercial review before public pricing). Outcome: plan §8g;
    Figma values: design-values §16.7.
  - **Full Landing and Hero video review: PREPARED FOR OWNER REVIEW** (2026-11-20):
    [phases/phase-07-landing-review.md](phases/phase-07-landing-review.md). It covers local review
    access, the production gates, the Hero video assessment, production video requirements, the
    Visual Refinement and typography findings, and the remaining blockers. The provisional video
    is not production-approved.
  - **Static Figma Hero image (P07-D21): IMPLEMENTATION COMPLETE** (PR #60, merged as `c712bd7`;
    owner approved for merge 2026-11-20; post-merge CI green). The original Figma image replaces the
    Hero video, and the video plan is superseded. **Production activation is NOT approved**: the gate
    stays closed (`provisional: true`) until owner visual approval. Contrast
    corrections: Tablet and Mobile description, and the heading, meet WCAG at every pixel. Image softness
    (666 × 412 source) remains a known limitation:
    [phases/phase-07-static-hero.md](phases/phase-07-static-hero.md).
  - **Increment 6 (Verification and closure): COMPLETE** (technical QA plan approved by the owner
    2026-11-21: [phases/phase-07-increment-6-plan.md](phases/phase-07-increment-6-plan.md)). Evidence:
    [phases/phase-07-qa-report.md](phases/phase-07-qa-report.md). Release readiness stays separate.
    - **P07-D24 merged** (PR #66, `66df53c`, 2026-11-22): primary label "ابدأ الآن"; the
      Authentication gate hides every Landing authentication entry point and the Final CTA in
      production; development keeps them.
    - **P07-D25 merged** (PR #68, `620e26f`, 2026-11-22): the Auth placeholder routes return 404
      in production until Authentication is available; every Phase 04 placeholder is `noindex`.
    - **Production smoke suite** (owner-approved 2026-11-22): `corepack pnpm test:e2e:prod`. It
      runs in the CI `e2e` job (QA report A7). **`e2e` is a required check** since 2026-11-22
      (owner-approved; the `main-protection` ruleset requires `check` and `e2e`).
    - **Visual regression baselines approved** by the product owner on 2026-11-22 as references
      for the current approved development and production configurations (QA report A1). This
      does not authorize production activation of gated features.
  - **ClickUp:** set up 2026-11-19 (docs/project-management/clickup-workflow.md).
  - **Release readiness (open; closure report §11):**
    Hero image, English copy, pricing, legal pages, Open Graph image, Authentication, hands-on
    keyboard, real Firefox and Safari, devices and screen readers (NOT VERIFIED), and O-1. Favicon
    resolved (F-1, PR #70, `76954ed`).
  - **Maintenance (recommended, not done):** add `.playwright-mcp/` (local output of the
    Playwright MCP browser tool: page snapshots and console logs) to `.gitignore` in a
    separate change; untracked, it fails `prettier --check` and lint.
- **Phase 06:** Shared states & overlay/guard infrastructure — **CLOSED — Development Complete,
  Production QA Outstanding.**
  - **Closure:** approved by the product owner on 2026-11-19; final code `main` `6cda86c` (PR #47);
    post-merge CI green. Report:
    [phases/phase-06-closure-report.md](phases/phase-06-closure-report.md).
  - **Not production-ready:**
    - R-2 and R-3 stay OPEN; G-1 stays RISK ACCEPTED (conditional); W-1 is accepted under R-3;
      OV-1 is RESOLVED;
    - the production release gates are listed in the closure report §16.
  - **Plan:** [phases/phase-06-plan.md](phases/phase-06-plan.md), approved and merged through
    PR #37 (`70c821d`); Figma values in [design-values.md §15](design-values.md); D-U1 to D-U10
    approved.
  - **Increment 1 (guard slice): COMPLETE** (PR #38, 2026-11-18). **G-1** is RISK ACCEPTED —
    BROWSER LIMITATION (see Risks). It contains:
    - the danger Button (D-U2) and `ConfirmGuardDialog` (D-U1);
    - the navigation guard (D-U7): Navigation API in Chromium, sentinel fallback elsewhere,
      navigation-specific authorization after Leave, and a lint-enforced guarded router;
    - guard copy in Arabic (Figma) and English (D-U10, approved 2026-11-18).

    The dev-only `/dev/guard` route is removed before the Phase 06 closure. Browser limitations
    (R-3) and the fallback limitations are recorded in the plan §7.2.

  - **Increment 2 (loading and error states): COMPLETE** (PR #41, `f44dcda`):
    - `Skeleton`, `SkeletonText` and `SkeletonRegion`;
    - `ErrorCard` (`card` / `section`);
    - `SectionBoundary` (`catchError` + `status`, with focus restored after retry).

    Module guide: [shared-patterns.md](shared-patterns.md).

  - **Increment 4 (toast): COMPLETE** (PR #42, `83fce04`, 2026-11-18): `ToastProvider` and
    `useToast` (D-U6), with the approved close copy "إغلاق" / "Close". Merged on CI `check` and
    `e2e` green; 1133/1133 unit, 763/763 E2E.
  - **Stabilisation (2026-11-18):**
    - PR #44: retry focus survives a slow refresh, and the retry E2E waits on the real refresh;
    - PR #45: dialog stale-`close` race fixed, and the guard Back contract follows the spec with
      the explicit G-1 reproduction;
    - PR #46: a CI `e2e` job (full suite; flaky tests fail) and Linux visual baselines. It is not
      yet a **required** check: that is a ruleset setting.
  - **Increment 5 (final integration and closure readiness): COMPLETE** (PR #47, `6cda86c`):
    - Notifications / User Menu frame check (D-U8): User Menu desktop and tablet match; the other
      differences follow D-02 and D-PM5; OV-1 (mobile tops 74 / 72) is APPROVED as implemented;
    - `/dev/guard` removed (the guard E2E now runs on a dev-only fixture that is not built in
      production);
    - cross-browser guard spec (Chromium, Firefox, WebKit): W-1 found in WebKit, ACCEPTED AS A
      DEVELOPMENT-STAGE LIMITATION under R-3 (not production Safari approval);
    - `shared-patterns.md` completed;
    - [phases/phase-06-closure-report.md](phases/phase-06-closure-report.md) (CLOSED,
      2026-11-19).
  - **Mariam `EmptyState`: ACCEPTED / INTEGRATED.** Delivered on 2026-11-18 and integrated on
    2026-11-18 through PR #39 (rebase merge): her delivery commit `b7cf1d9` (two files, verbatim,
    no source changes), then the gallery, E2E and records in `abe2952`. `pnpm check` 1049/1049;
    E2E 653/653; CI green on `main`. The starter's send date was not recorded separately.
    Assignment: [phases/phase-06-empty-state-starter.md](phases/phase-06-empty-state-starter.md).
- **Phase 04:** Routing & navigation registry — **Done / CLOSED** (2026-11-16).
  Implementation PR #27 squash-merged into `main` as `9888e08`; post-merge CI green. Report:
  [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md) (CLOSED). Plan:
  [phases/phase-04-plan.md](phases/phase-04-plan.md); folder routes:
  [decisions/ADR-003-phase-04-folder-focus-routes.md](decisions/ADR-003-phase-04-folder-focus-routes.md)
  (Approved).
  - **Evidence:** `pnpm check` with 907/907 unit tests; E2E 382/382; production route checks 71/71
    (probe absent in production); CI green on the PR head and on `main`.
  - **Delivered:**
    - typed next-intl `pathnames` (Arabic unprefixed, English `/en`);
    - 30 placeholder routes in four route groups;
    - localized 404 and error handling;
    - the navigation registry (destinations, mobile bar and More, More-sheet extras, Settings nav);
    - the active-destination resolver and hook;
    - all copy approved (2026-11-16).
  - **Open risk R-2:** the blank no-JavaScript 404. Development-only acceptance; Phase 22 gate. See
    Risks.
  - **Deferred:** Tutor route (D-08); Quiz Results, Answer Review and quiz mode in the URL (D-09);
    reset-password link format (D-02); plan upgrade (D-18); Settings "إدارة الحساب" target.
- **Phase 05:** Shared App Shell — **Done / CLOSED** (2026-11-17; closure approved by the product
  owner, closure PR #36). Implementation was authorized by the user on 2026-11-16. Plan, O-8 contract and ADR-004 approved and merged through PR #29 (`d226a84`):
  [phases/phase-05-plan.md](phases/phase-05-plan.md),
  [phases/phase-05-navigation-icon-button-contract.md](phases/phase-05-navigation-icon-button-contract.md),
  [decisions/ADR-004-shell-breakpoints.md](decisions/ADR-004-shell-breakpoints.md).
  - **O-8 Navigation Icon Button: delivered.** PR #30 squash-merged as `0404c6e`; CI green on
    the PR head and on `main`.
  - **Shell increment 1: delivered.** PR #31 squash-merged as `330348e`. It covers:
    - the `rail` breakpoint and `viewportFit`;
    - `AppShell` and `SkipLink`;
    - the Desktop Sidebar, Sidebar Item and Upgrade Card;
    - the Tablet Rail and drawer.
  - **Shell increment 2: delivered.** PR #32 squash-merged as `9abe1c0`. It covers the Top Bar
    controls (search, notifications, appearance, language, user menu), the Desktop/Tablet Top Bar
    and the Mobile Top Bar. Review fixes: theme-trigger arrow keys and a query-preserving
    language switch.
  - **Mobile More sheet with language access (D-S10): delivered.** PR #33 squash-merged as
    `d57a809`.
  - **Mobile navigation integration: delivered.** PR #35 rebase-merged on 2026-11-17: Mariam's
    delivery `d364d58`, then `BottomNav` integration `6c47e35`; CI green on the PR head and on
    `main`. It covers:
    - `BottomNav` wired to the More sheet;
    - mobile bottom padding and scroll padding;
    - D-S13 (320 px fit) and D-S14 (dev indicator), both approved 2026-11-17;
    - removal of the Phase 04 probe;
    - the full ADR-004 matrix.
  - **Mariam `MobileNavItem`: ACCEPTED / INTEGRATED** (delivered and integrated 2026-11-17, PR
    #35). Integrated without source changes: both files are byte-identical to her delivery, in
    commit `d364d58`. Mariam wrote the code; Yousef, the integrator, is the Git author. Assignment:
    [phases/phase-05-mobile-nav-item-starter.md](phases/phase-05-mobile-nav-item-starter.md).
  - **Evidence on `main` `6c47e35`:** `pnpm check` with 1020/1020 unit tests; E2E 637/637,
    including the ADR-004 matrix; post-merge CI green. Chromium only.
  - **Closure report:** [phases/phase-05-closure-report.md](phases/phase-05-closure-report.md)
    (CLOSED). All eight Roadmap acceptance criteria pass.
  - **Pre-production QA requirements (not passed, carried forward):** real-device verification,
    screen-reader testing (VoiceOver, TalkBack, NVDA) and mobile performance of the blur 16 bars.
  - Risk **R-2** stays OPEN (Phase 22 gate). Cross-browser verification is tracked separately
    as **R-3** (pre-production QA).
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
- **Latest report:** [phases/phase-05-closure-report.md](phases/phase-05-closure-report.md) (CLOSED; Phase 04: [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md); Phase 03: [phases/phase-03-closure-report.md](phases/phase-03-closure-report.md); Phase 02: [phases/phase-02-report.md](phases/phase-02-report.md); Phase 01: [phases/phase-01-report.md](phases/phase-01-report.md))
- **Stack decision:** [decisions/ADR-001-frontend-stack.md](decisions/ADR-001-frontend-stack.md) (Approved by the user, 2026-11-12)
- **Phase 01 commit:** `acf48c9` `chore: initialize project (Phase 01)` on `main`.
- **Phase 02 commit:** `79685af` `docs(phase-02): design values, progress and phase report` on
  `main` (last of 7 Phase 02 commits, `c7455f2`..`79685af`; CI `check` green on PR #2 and on `main`).
- **Repository:** https://github.com/yousefosolimanofficial/MUNSIT-AI (public, default branch
  `main`). GitHub's auto-generated initial commit was merged without force-push. Collaboration
  setup: README §15 workflow, PR template, `CLAUDE.md`.

## Team and module assignments

| Developer | Role                                                         | Assigned modules                                                                                                                                      |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yousef    | Frontend Lead — architecture, shared foundation, integration | Shared foundation (by role); modules not assigned yet                                                                                                 |
| Mariam    | Frontend Developer — assigned feature modules                | Feature modules: not assigned yet. Delegated shared components, both integrated: Phase 05 `MobileNavItem` (PR #35) and Phase 06 `EmptyState` (PR #39) |

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

| #   | Phase                               | Status                                              |
| --- | ----------------------------------- | --------------------------------------------------- |
| 01  | Project initialization & tooling    | Done                                                |
| 02  | Design System implementation        | Done                                                |
| 03  | Core UI primitives                  | Done                                                |
| 04  | Routing & navigation registry       | Done                                                |
| 05  | Shared App Shell                    | Done                                                |
| 06  | Shared states & overlay/guard infra | Done (CLOSED 2026-11-19; production QA outstanding) |
| 07  | Landing Page                        | In progress (Increment 0 complete)                  |
| 08  | Authentication UI                   | Not started                                         |
| 09  | Dashboard                           | Not started                                         |
| 10  | Lecture Management                  | Not started                                         |
| 11  | Lecture Details                     | Not started                                         |
| 12  | Live Recording                      | Not started                                         |
| 13  | AI Virtual Tutor                    | Not started                                         |
| 14  | My Summaries                        | Not started                                         |
| 15  | AI Question Bank                    | Not started                                         |
| 16  | My Notes                            | Not started                                         |
| 17  | AI Flashcards                       | Not started                                         |
| 18  | Favorites                           | Not started                                         |
| 19  | My Folders                          | Not started                                         |
| 20  | Profile & Settings                  | Not started                                         |
| 21  | API integration                     | Not started                                         |
| 22  | Testing & hardening                 | Not started                                         |
| 23  | Deployment preparation              | Not started                                         |

## Open blockers

None.

## Outstanding obligations (deferred Phase 03 primitives)

Approved deferral: [ADR-002](decisions/ADR-002-phase-03-scope-deferral.md),
[phase-03-plan.md](phases/phase-03-plan.md) §2.1. These are deferred, not cancelled, and not
implemented. Each is built from an approved contract in `src/shared/ui`, with unit,
accessibility and browser validation, **before the first consuming feature is considered
complete**. No local substitutes.

| #   | Component              | Trigger and notes                                                                     | Status      |
| --- | ---------------------- | ------------------------------------------------------------------------------------- | ----------- |
| O-1 | Textarea               | First consuming feature                                                               | Outstanding |
| O-2 | Select                 | First consuming feature; Menu does not replace it                                     | Outstanding |
| O-3 | Checkbox               | First consuming feature                                                               | Outstanding |
| O-4 | Radio                  | First consuming feature; a Tabs filter group does not replace native Radio controls   | Outstanding |
| O-5 | Switch                 | First consuming feature                                                               | Outstanding |
| O-6 | Tooltip                | First consuming feature                                                               | Outstanding |
| O-7 | Generic Badge          | First consuming feature; StatusBadge does not replace it                              | Outstanding |
| O-8 | Navigation Icon Button | Delivered in Phase 05 (PR #30, `0404c6e`); this row was stale until Phase 07 planning | Delivered   |

Each phase checks at planning time whether its screens consume one of these, and if so adds it to
that phase's scope.

## Risks and tracked issues

| ID  | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Status / action                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-1 | Builds depended on Google Fonts at build time (`next/font/google`); failures observed on a slow network.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Resolved 2026-11-13** — fonts self-hosted with `next/font/local` (`src/design-system/fonts/`, OFL); build, dev server and E2E verified with the network blocked.                                                                                                                                     |
| I-1 | Phase 01 placeholder `/` heading used `text-2xl font-bold`, a class that no longer exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Resolved** — Phase 04 replaced the Phase 01 page with the `(public)` placeholder (PR #27); the Landing page itself comes in Phase 07.                                                                                                                                                                |
| I-3 | Development-only React hydration mismatch warning during `pnpm test:e2e` on `/dev/tokens` (likely `tests/e2e/icons.spec.ts` styling cells before hydration). Tests pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | **Resolved** — PR #5 (`4990281`); GitHub issue #3 closed. E2E now fails on browser console errors.                                                                                                                                                                                                     |
| I-2 | `UI/Navigation` (Cairo) has style name "ExtraBold" but weight 400 in Figma.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | NOT VERIFIED — confirm in Figma before any use.                                                                                                                                                                                                                                                        |
| R-2 | **404 rendering (Phase 04, accepted temporarily 2026-11-16):** unknown or deferred URLs return HTTP 404, but the first HTML is Next.js 16.4.6's empty error document. The localized 404 appears only after hydration, so without JavaScript (or if JS fails, or for non-JS crawlers) the page is **blank**: no message, no link back, no descriptive title. Low SEO impact (404 + `noindex`); accessibility dead end without JS. Framework behaviour for `notFound()`, reproduced in a minimal Next app; alternatives: proxy rewrite to a static 404 (amends D-R8) or experimental `global-not-found`. Details: [phases/phase-04-closure-report.md](phases/phase-04-closure-report.md) §7.1. | **Open — accepted only as a development-stage limitation, not production behaviour.** Re-test at the next Next.js upgrade. **Must be resolved or explicitly re-accepted by the product owner before production launch, no later than Phase 22.**                                                       |
| R-3 | **Cross-browser coverage (Phase 05, 2026-11-17):** the full suite runs in Chromium only. Since Phase 06 Increment 5, a focused guard spec also runs in Playwright Firefox and WebKit: W-1 was found in WebKit, and the engine differences are in the closure report §10. This is automation, not real devices. Real Firefox, Safari (macOS and iOS) and Edge are unverified, although D-12 requires the latest two majors of each. This is separate from R-2, which concerns the no-JavaScript 404 document in every browser.                                                                                                                                                                | **Open — pre-production QA requirement.** Run the E2E suite and a manual pass in Firefox, WebKit and Edge before production launch (Phase 22 at the latest).                                                                                                                                           |
| G-1 | **Navigation guard, browser Back (found 2026-11-18):** a second browser Back with no user interaction in between (for example Esc, then Back, or Back twice) leaves a guarded page without confirmation. This is the HTML Standard's anti back-trapping rule (history-action activation; Esc is not activation), not an application bug. Findings, evidence and the binding Notes/Recording data-protection criteria: [phases/phase-06-g1-findings.md](phases/phase-06-g1-findings.md).                                                                                                                                                                                                      | **RISK ACCEPTED — BROWSER LIMITATION** (product owner, 2026-11-18, option A). Conditional: not approval of unrecoverable data loss; the limitation is not fixed. Notes and Recording are not production-ready until findings §6 is implemented and tested. The G-1 reproduction stays in E2E (PR #45). |
| W-1 | **Navigation guard, WebKit (Playwright build, found 2026-11-19 in Phase 06 Increment 5):** Leave after a cancelled browser Back (`navigation.traverseTo`) fires a native `beforeunload` prompt; accepting it reloads the guarded page instead of going back. Reproduced as a visible `fixme` in `navigation-guard.cross-browser.spec.ts`.                                                                                                                                                                                                                                                                                                                                                    | **Accepted as a development-stage limitation under R-3** (product owner). Safari production support is unapproved until real Safari and iOS verification and any required fix.                                                                                                                         |

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

**2026-11-28:** Phase 08 Increment 5 (Verification) is implemented on draft PR #89.

- **Done:** 27 Arabic baselines; Auth flow navigation (ar, en); accessibility at 320 (ar, en);
  Firefox and WebKit smoke; route-protection contract review; production smoke; closure report.
- **Next:** owner review of #89 and its `-chromium-linux` baselines, then merge and Phase 08 sign-off.
  Phase 09 does not start before that.
- **Unresolved, not Phase 08:** `/verify-email` and OTP have no design (I-03). PR #84 stays a draft.
- **Unchanged:** `AUTHENTICATION_AVAILABLE = false`; every Auth route returns 404 in production.

**2026-11-28:** Phase 08 Increment 4 (Forgot and Reset Password) is COMPLETE through PR #86 (`3ea0122`).

- **Recorded:** owner visual approval (closure record §3); delivery, merge and post-merge CI evidence.
- **Next:** Increment 5 (Verification), its plan for owner approval first. Phase 08 stays IN
  PROGRESS until Increment 5 and the closure report. The backend contract (PR #84) stays a draft.
- **Unchanged:** `AUTHENTICATION_AVAILABLE = false`; every Auth route returns 404 in production.

**2026-11-27:** Phase 08 Increment 3 (Register UI) is COMPLETE through PR #82 (`9c803de`).

- **Recorded:** owner visual approval of all 33 states (contract §10); merge and post-merge CI evidence.
- **Next:** Recovery (Forgot, Reset) stays with Eng. Mariam's task (PR #83), not assigned until she
  confirms. The backend contract (PR #84) stays a draft until its implementation and security review.
- **Unchanged:** `AUTHENTICATION_AVAILABLE = false`; every Auth route returns 404 in production.

**2026-11-24:** Phase 08 Increment 2 (Login UI) is COMPLETE through PR #78 (`d3e7c76`).

- **Recorded:** owner visual approval (contract §10); merge and post-merge CI evidence.
- **Next:** the Increment 3 (Register) plan, for owner approval. No Register code before approval.
- **Unchanged:** `AUTHENTICATION_AVAILABLE = false`; every Auth route returns 404 in production.

**2026-11-19:** Phase 07 Increment 0 (planning) is COMPLETE through PR #49.

- **Recorded:** owner decisions P07-D1 to P07-D13; the final section order (FAQ before Pricing).
- **Pending:** English copy, the Hero video, pricing content and legal pages.
- **Next:** Increment 1 (Landing foundation), only on the owner's authorization. Production QA
  obligations (R-2, R-3, G-1 and W-1 conditions) are unchanged.

**2026-11-19:** Phase 06 is CLOSED (Development Complete — Production QA Outstanding). The product
owner approved the closure; the closure records went through a documentation-only PR. Final code:
`main` `6cda86c` (PR #47); CI green (798 passed, 1 skipped, the visible W-1 `fixme`).

- **Next:** Phase 07 (Landing Page). It is not started; its execution brief goes to the owner for
  review first.
- **Open:** R-2 and R-3 OPEN; G-1 RISK ACCEPTED; W-1 accepted under R-3; OV-1 RESOLVED.
- **Owner action:** make `e2e` a required check in the `main-protection` ruleset (it requires
  `check` only).

**2026-11-17:** Phase 06 kickoff. The planning PR (plan, Figma audit in design-values §15) awaits
approval. No implementation yet. Recommended first increment: the guard slice. Mariam candidate:
`EmptyState`, proposed only and not assigned.

**2026-11-17:** Phase 05 is CLOSED. The product owner approved the closure; closure PR #36 was
squash-merged. Final code: PR #35, with Mariam's `MobileNavItem` in `d364d58` and `BottomNav` in
`6c47e35`; CI green. Next: Phase 06, only on the user's authorization. Phase 06 and 07 are not
started. R-2 and R-3 stay open, together with the pre-production QA requirements (real devices,
screen readers, blur performance).

**2026-11-16:** Phase 04 is CLOSED (PR #27, `9888e08`; closure documentation PR). Next: Phase 05
(Shared App Shell), only on the user's authorization. O-8 (Navigation Icon Button) comes first.
Risk R-2 stays open until its Phase 22 gate.

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
