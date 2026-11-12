# MUNSIT AI — Official Development Roadmap v1.0

Status: PLANNING ONLY. No code, repository, dependency installation, or Figma change has been made.
Figma file: `Avyn9kL0drXepQyTXTLXXb` · Design phase: closed.
Sources: Project Instructions, Official Frontend Handoff (Nov 12, 2026), Design System Reference v1.0, official logo assets.

**Label convention (same as the Handoff).**
- **APPROVED**: stated in the project documents or visible in final Figma. Build to it.
- **PROPOSED**: this roadmap's engineering recommendation. Needs confirmation at the named gate.
- **UNRESOLVED**: product/backend behavior not defined anywhere. Do not assume.

Nothing in the stack is installed or pre-selected. Every library below is PROPOSED until Phase 01 confirms it against the real environment.

---

## 1. Executive technical strategy

1. **Frontend first, integration second.** Phases 01–19 deliver every screen as a real, interactive frontend (routing, state, forms, validation, loading/empty/error states, guards, RTL/LTR, responsive, accessible). Phase 20 connects real data only where a backend decision exists.
2. **No fake completeness.** A screen that only renders static mock data is labelled **"UI-complete, not functional"**. It is never labelled "complete". Mock data is allowed only through an explicit adapter, only after the user authorizes it (Instructions §11), and is removed or replaced in Phase 20.
3. **Foundation before features.** Tokens, i18n/RTL, primitives, and the single navigation registry/app shell are built once, before any module. Modules never copy shell or layout code.
4. **Dependency-ordered, not Figma-ordered.** Shared overlay/guard/state infrastructure is built before the modules that need it (Recording, Notes, Tutor).
5. **One phase at a time.** Each phase is independently verifiable, ends with a report of actual results, and stops. The next phase starts only on explicit user instruction.
6. **Figma is the visual source of truth.** Values marked NOT VERIFIED in the Design System Reference are never invented. When a phase needs one, the Figma node is inspected, the value is recorded in `docs/design-values.md`, and no broad design audit is reopened.

**What the frontend can and cannot claim, by layer**

| Layer | Frontend can deliver | Needs backend / AI (UNRESOLVED) |
|---|---|---|
| Auth | Screens, form validation, route-guard mechanism | Providers, sessions, token storage, recovery rules |
| Lectures | Library, filters, upload UI, status badges | File types/sizes, processing, status delivery |
| Recording | Mic capture, waveform, timer, local buffering, leave guard | Live transcription engine, retention, max length |
| Tutor / Summaries / Questions / Flashcards | Full UI, forms, states, retry UX | Any generated content, latency, limits |
| Notes / Folders / Favorites | UI and editor, dirty-state guard | Persistence, sync, conflict rules |

---

## 2. Recommended technology stack (all PROPOSED)

### 2.1 Framework: Next.js (App Router) vs React + Vite

| Criterion | Next.js | React + Vite SPA |
|---|---|---|
| Landing page SEO / first paint | Static generation, metadata API, fonts and images optimized | Needs prerendering add-ons or a separate site |
| Route protection | Server middleware possible (cookie sessions) | Client-side guards only; flash of protected shell |
| Secret handling / BFF | Server route handlers can proxy a future API so secrets never reach the browser (Instructions §11) | Needs a separate proxy service |
| i18n (Arabic default, LTR support) | Mature route-segment locale support | Possible, more manual |
| Hosting | Needs a Node-capable host, or static export (loses middleware) | Any static host / CDN |
| Complexity | Server/client component boundary; most app screens will be client components anyway | Simplest mental model |
| Recording / WebAudio / live UI | Client-only in both | Client-only in both |

**Recommendation: Next.js App Router, TypeScript strict.** Reason: one public marketing site plus an authenticated app, auth still undefined, and a security rule that forbids exposing secrets. The server layer is cheap insurance for those. Authenticated screens are built as client-rendered feature modules, so the team does not need RSC-heavy patterns.
**Fallback:** if gate D-01 (hosting) says static-only hosting, use Vite SPA and move the landing page to static prerender. The folder architecture below is framework-neutral on purpose (features do not import from `app/`).

### 2.2 Stack table

| Concern | Proposed choice | Trade-off / reason |
|---|---|---|
| Language | TypeScript, `strict`, `noUncheckedIndexedAccess` | Required by Instructions |
| Styling | Tailwind CSS with design tokens as CSS custom properties; logical utilities (`ms-`, `ps-`, `start-`, `end-`) | Fast, token-driven, RTL-friendly. Risk: class sprawl, mitigated by shared components only. Alternative: CSS Modules (more boilerplate) |
| Component primitives | Radix UI primitives (Dialog, Dropdown, Tabs, Popover, Tooltip, Select) wrapped in our own components; owned in `shared/ui` | Gets focus trap, Esc, ARIA correct. Avoids building dialogs from scratch. No visual kit imposed on the Figma design |
| Variants | `class-variance-authority` + `tailwind-merge` | Maps Figma variant sets to props |
| Routing | Next.js App Router with route groups `(public)`, `(auth)`, `(app)`, `(focus)` | Layout nesting gives shell reuse; `(focus)` hides global nav |
| Client state | URL for filters/tabs/search; React state locally; Zustand only for cross-component sessions (Tutor session, Recording session, shell overlay state) | Avoid global store for everything |
| Server state | TanStack Query behind a thin `api/` layer; per-section queries so partial-error retry works | Gives loading/error/retry/polling (lecture status) natively |
| Forms | React Hook Form + Zod, validate on blur, clear on valid | Matches Handoff validation behavior; Zod schemas double as types |
| i18n | `next-intl` (or equivalent) with `ar` default and `en`; ICU messages; `dir` set on `<html>` | Arabic copy kept verbatim from Figma in message files |
| Fonts | Cairo, Inter, Geist Mono self-hosted via the framework font loader | APPROVED families; Arabic subset must be verified |
| Icons | Export from Figma as SVG into one `Icon` component with a mirror whitelist | Icon set is NOT VERIFIED in docs; inspect Figma in Phase 02 |
| Auth integration | Provider-agnostic `AuthAdapter` interface; no provider chosen | UNRESOLVED (gate D-02) |
| Unit/component tests | Vitest + Testing Library + `jest-axe` | Fast, TypeScript native |
| E2E / visual | Playwright (Chromium, plus WebKit/Firefox once supported browsers are defined) with `@axe-core/playwright` and screenshot checks at 1440/768/390 | Covers RTL, responsive, keyboard |
| API mocking | MSW, only when mock data is authorized | Keeps mocks out of production code |
| Quality | ESLint (+ jsx-a11y, import/no-cycle), Prettier, `tsc --noEmit`, `dependency-cruiser` (cycle and boundary rules) | Enforces "no circular dependencies" mechanically |
| Package manager | pnpm (decide in Phase 01 against environment) | Strict dependency resolution |
| Storybook | NOT in v1.0 scope. Revisit after Phase 05 only if the user wants it | Avoid overengineering |

Deliberately excluded: Redux, GraphQL clients, animation libraries, CSS-in-JS runtimes, a heavy component kit, a charting library (add only if a Figma chart requires it), any rich-text engine until the Notes editor's required features are read from Figma (gate D-10).

---

## 3. Proposed folder architecture

```
munsit-ai/
├─ docs/
│  ├─ PROGRESS.md                # single resume point (see §6)
│  ├─ decisions/                 # ADR-001-*.md
│  ├─ phases/                    # phase-01-report.md ...
│  ├─ design-values.md           # values verified from Figma on demand
│  └─ open-decisions.md
├─ public/
│  ├─ brand/                     # Munsit_Logo_Full/Horizontal/Symbol.png (as exported)
│  └─ images/                    # approved landing imagery
├─ src/
│  ├─ app/                       # routing ONLY: thin route files that compose features
│  │  ├─ [locale]/
│  │  │  ├─ (public)/            # landing
│  │  │  ├─ (auth)/              # login, register, recovery screens
│  │  │  ├─ (app)/               # shell layout + 10 modules + settings
│  │  │  └─ (focus)/             # study mode / focused folder workflows
│  │  └─ layout.tsx              # <html lang dir>, fonts, providers
│  ├─ features/                  # one folder per module, self-contained
│  │  ├─ landing/  auth/  dashboard/  lectures/  lecture-details/
│  │  ├─ recording/  tutor/  summaries/  question-bank/  notes/
│  │  ├─ flashcards/  favorites/  folders/  settings/
│  │  └─ <feature>/{components,hooks,api,model,schemas,index.ts}
│  ├─ shared/
│  │  ├─ ui/                     # primitives: Button, Input, Dialog, Sheet, Badge, Tabs, Skeleton, EmptyState, ErrorCard, Icon, Logo...
│  │  ├─ patterns/               # composed shared pieces: LectureCard, StatCard, ConfirmGuardDialog, SectionBoundary
│  │  ├─ layout/                 # AppShell, Sidebar, TabletRail, TabletDrawer, TopBar, BottomNav, MoreSheet, PublicHeader/Footer
│  │  ├─ navigation/             # nav-registry.ts, useActiveDestination, route-context map
│  │  ├─ a11y/                   # focus helpers, live region, skip link
│  │  └─ hooks/ lib/ utils/      # cross-cutting, no feature imports
│  ├─ design-system/
│  │  ├─ tokens.css              # 19 colors + 5 spacing + 5 radius as CSS variables
│  │  ├─ typography.css          # Dashboard/* scale as the application default
│  │  └─ tailwind-preset.ts
│  ├─ api/                       # transport + typed client; no feature logic
│  │  ├─ client.ts  errors.ts  query-client.ts
│  │  └─ adapters/               # AuthAdapter, LecturesAdapter...; real vs mock implementations
│  ├─ state/                     # cross-feature stores only (shell, session-level)
│  ├─ i18n/                      # config, routing, messages/{ar,en}/<namespace>.json
│  ├─ types/                     # domain types shared by 2+ features
│  └─ config/                    # env parsing (public vars only)
├─ tests/
│  ├─ unit/ (colocated preferred)  ├─ e2e/  └─ fixtures/
└─ (tooling configs at root)
```

**Dependency rules (enforced by dependency-cruiser in Phase 01):**
`app → features → shared/api/state/i18n/types`. `shared` never imports `features` or `app`. A feature never imports another feature's internals. If two features need the same component, it moves to `shared/patterns`. `design-system` imports nothing. `api` imports only `types`. Cross-feature communication goes through `shared`, the URL, or `state`.

---

## 4. Sequential development roadmap

Every phase is independently verifiable and ends with a report. Universal checks for all phases: `tsc --noEmit`, lint (including import cycles), unit/component tests, a11y automated scan on touched screens, manual keyboard pass, RTL and LTR check, viewport check at 1440 / 768 / 390 plus a 320px overflow check, and no horizontal overflow. Phase reports say Implemented / Tested / Verified / Assumed / Blocked separately.

| # | Phase | Type |
|---|---|---|
| 01 | Project initialization & tooling | Foundation |
| 02 | Design System implementation (tokens, type, fonts, logo, icons, i18n/RTL base) | Foundation |
| 03 | Core UI primitives | Foundation |
| 04 | Routing & navigation registry | Foundation |
| 05 | Shared App Shell | Foundation |
| 06 | Shared states & overlay/guard infrastructure | Foundation |
| 07 | Landing Page | Public |
| 08 | Authentication UI | Public |
| 09 | Dashboard | Module |
| 10 | Lecture Management (My Lectures + Upload) | Module |
| 11 | Lecture Details | Module |
| 12 | Live Recording | Module |
| 13 | AI Virtual Tutor | Module |
| 14 | My Summaries | Module |
| 15 | AI Question Bank | Module |
| 16 | My Notes | Module |
| 17 | AI Flashcards | Module |
| 18 | Favorites | Module |
| 19 | My Folders | Module |
| 20 | Profile & Settings | Module |
| 21 | API integration (per-resource, gated) | Integration |
| 22 | Testing & hardening | Quality |
| 23 | Deployment preparation | Release |

(The brief lists Profile & Settings before API integration. It is numbered 20 here so that the full UI exists before any backend wiring.)

---

## 5. Module dependency map

```
01 Init
 └─ 02 Design System (tokens, fonts, logo, icons, i18n/RTL)
     └─ 03 Primitives
         ├─ 04 Routing + Nav Registry
         │   └─ 05 App Shell ──┐
         ├─ 06 States + Overlays + Guards ──┐
         │                                  │
         ├─ 07 Landing (needs 02,03; public header/footer)
         └─ 08 Auth UI (needs 03,06 forms; public layout)

05 + 06 ─► 09 Dashboard ─► 10 Lectures ─► 11 Lecture Details
                                │               ├─► 12 Live Recording   (guard from 06)
                                │               └─► 13 AI Tutor         (breadcrumb: lectures / details / tutor)
                                ├─► 14 Summaries ─┐
                                ├─► 15 Question Bank (sources: summary or lecture ◄ 10, 14)
                                ├─► 16 Notes (dirty guard from 06)
                                ├─► 17 Flashcards (focus layout, exit control)
                                ├─► 18 Favorites (aggregates items of 10,14,16,17)
                                └─► 19 Folders (aggregates items; focus workflows)
05 ─► 20 Settings (language/theme controls reuse shell TopBar)
09–20 ─► 21 API integration ─► 22 Testing & hardening ─► 23 Deployment prep
```

Shared components created once and reused: `LectureCard` (Phase 10, reused by 09, 14, 18, 19), `StatCard` (09, 17), `StatusBadge` (10, 11, 17), `AudioPlayer` (11, 13?), `EmptyState`/`ErrorCard`/`SectionBoundary` (06), `ConfirmGuardDialog` (06; used by 12 and 16), `Sheet` (06; used by 05 More Sheet and 10 mobile upload).
Whether `AudioPlayer` appears in the Tutor is NOT VERIFIED; do not assume.

---

## 6. Development workflow, Git, and progress documentation

### 6.1 Per-phase loop (APPROVED in Instructions §12)
1. Inspect existing files and `docs/PROGRESS.md`.
2. Confirm the current phase with the user.
3. Write the scope (in/out) in `docs/phases/phase-XX-plan.md`; list reusable components first.
4. Implement only that scope.
5. Run checks (see §4 universal checks plus the phase's required tests).
6. Report actual results, with Implemented / Tested / Verified / Assumed / Blocked separated.
7. Update `docs/PROGRESS.md`, then **stop**.

### 6.2 Git strategy (PROPOSED)
- `main`: always deployable, protected, only via PR. Optional `develop` is not used (trunk-based, small team).
- Branch per phase: `phase/09-dashboard`; short fix branches `fix/<phase>-<topic>`.
- **Conventional Commits**: `feat(dashboard): ...`, `fix(shell): ...`, `test(notes): ...`, `docs(progress): ...`, `chore(deps): ...`. One logical change per commit. Dependency additions are separate `chore(deps)` commits with the reason in the body.
- PR per phase containing: scope, acceptance checklist, check results, screenshots at 3 widths (LTR and RTL), known gaps.
- Merge via squash or rebase after all acceptance criteria are green; tag `phase-XX-done`.
- No force-push to `main`. No unrelated refactors in a phase PR.

### 6.3 Progress documentation so future conversations can resume
- `docs/PROGRESS.md` (single source): current phase, status table of all phases (Not started / In progress / UI-complete / Integrated / Done), last commit/tag, open blockers, next action, links to latest phase report.
- `docs/decisions/ADR-NNN-*.md`: one per significant decision (stack, auth adapter, breakpoints...). Status `Proposed` or `Approved`, with date.
- `docs/open-decisions.md`: mirror of §9 with owner and status.
- `docs/design-values.md`: every NOT VERIFIED Figma value once verified (node ID, value, date).
- **Claude Project Context**: after each phase, write a short "MUNSIT AI — Development Progress Log" doc (phase result, decisions, next step). A new conversation starts by reading that doc, `docs/PROGRESS.md`, and this roadmap.
- Resume prompt template: "Read the Progress Log and Roadmap v1.0. Current phase: XX. Confirm scope, then proceed."

---

## 7. Phase-by-phase acceptance criteria

Format per phase: **Objective · Scope · Dependencies · Deliverables · Acceptance · Required tests · Definition of Done (DoD)**. Every DoD also includes: universal checks pass, no import cycles, phase report written, `PROGRESS.md` updated, nothing from later phases started.

### Phase 01 — Project initialization & tooling
- **Objective:** A clean, empty, buildable, lint-guarded project. The only phase that scaffolds.
- **Scope:** Confirm environment (Node, package manager, OS) and gates D-01/D-03; create repo; scaffold framework + strict TS; ESLint, Prettier, dependency-cruiser, Vitest, Playwright config; folder skeleton per §3 (empty `index.ts` placeholders only where required); env parsing with public-only vars; CI script (typecheck, lint, test, build); `docs/` files; `.gitignore`, `.env.example`.
- **Dependencies:** User authorization to begin; approved stack (ADR-001).
- **Deliverables:** Repo, ADR-001 (stack), `PROGRESS.md`, CI-equivalent npm scripts, README with run instructions.
- **Acceptance:** Fresh clone → install → `dev`, `build`, `typecheck`, `lint`, `test` all succeed. A deliberately introduced import cycle or a `shared → features` import fails lint (then removed). No secrets in the repo. Only dependencies listed in ADR-001 are installed, each justified.
- **Tests:** One smoke unit test, one Playwright smoke test that loads the root route.
- **DoD:** Commands above executed and outputs reported truthfully; ADR-001 marked Approved by the user.

### Phase 02 — Design System implementation
- **Objective:** Tokens, typography, fonts, brand assets, icon system, and direction (RTL/LTR) foundation — the only place visual constants live.
- **Scope:** 19 color variables with names as-is; 5 spacing + 5 radius tokens; page padding 24/24/20 as proposed tokens; Dashboard/* type scale as application default; Landing/Auth styles only when those phases need them (verify then); Cairo/Inter/Geist Mono; logo components (Full/Horizontal/Symbol, `object-fit: contain`, never mirrored); `Icon` component from Figma-exported SVGs with an explicit mirror whitelist; `<html lang dir>` switching and locale routing skeleton (`ar` default, `en`); message files structure. Dark-only theme.
- **Dependencies:** 01.
- **Deliverables:** `design-system/*`, `shared/ui/Logo`, `shared/ui/Icon`, `docs/design-values.md` entries, a temporary internal `/dev/tokens` route (removed before Phase 22) to inspect tokens, type, logo, and direction.
- **Acceptance:** Every token matches the Design System Reference hex values exactly. Translucent tints (8/12/16/24% etc.), radius 14/18 stay as local component constants, not tokens. Logo renders unmodified in AR and EN and is not flipped. Arabic glyphs render in Cairo, numerals in Inter, metadata in Geist Mono. Switching `ar`↔`en` flips `dir` with no layout code duplication.
- **Tests:** Unit test that token file keys/values equal the reference table; component tests for Logo (no transform in RTL) and Icon mirror whitelist; visual snapshot of the tokens route in both directions.
- **DoD:** Any NOT VERIFIED value that was needed has been read from Figma and recorded; none invented. Text contrast of Primary/Secondary/Muted Readable on the surfaces measured and logged (the reference says contrast is not measured).

### Phase 03 — Core UI primitives
- **Objective:** Reusable, accessible primitives matching verified Figma components.
- **Scope:** Button (Primary/Secondary × Default/Hover/Pressed/Disabled, 8 variants as props), Input/Textarea/Select/Checkbox/Radio/Switch with labels and inline error (red border + message), Badge (incl. Status Badge: في الانتظار / قيد المعالجة / جاهزة), Tabs, Tooltip, Avatar, Card surfaces, Dialog, Sheet (bottom sheet with grabber, close button), Popover/Menu. Inspect Figma for NOT VERIFIED props (Navigation Icon Button, inputs, dialogs, badges, tabs) as each is built.
- **Dependencies:** 02.
- **Deliverables:** `shared/ui/*` with typed props and tests; a dev-only `/dev/components` gallery.
- **Acceptance:** Button values: height 44, px 20, radius 12, hover Info Blue plus shadow `0 4px 9px rgba(99,161,255,.35)`, disabled Slate fill/Muted label (all FIGMA-verified). Visible focus ring on every interactive primitive. Dialog/Sheet: focus trap, Esc closes, focus returns to trigger, `aria-modal`, labelled. All controls work with keyboard only. Touch targets suitable for mobile.
- **Tests:** Component tests per primitive (states, disabled, keyboard); `jest-axe` per primitive; dialog focus-trap test.
- **DoD:** No visual component used by features exists outside `shared/ui`; every variant maps to props, not copies.

### Phase 04 — Routing & navigation registry
- **Objective:** One centralized route map and one nav registry.
- **Scope:** Route tree with route groups; `nav-registry.ts` holding the 8 canonical destinations in approved order with labels, icon keys, hrefs, mobile placement (bar/More); `useActiveDestination()` computing Active from the pathname; route-context map: Lecture Details, Live Recording, AI Tutor → My Lectures active; Profile & Settings → none; Flashcards Study Mode / focused folder routes in `(focus)`; locale-aware links; 404/error boundaries; placeholder route pages with titles only.
- **Dependencies:** 03 (for placeholders), 02 (i18n).
- **Deliverables:** Registry, hook, route constants, typed link helper, route placeholders that clearly say "not implemented".
- **Acceptance:** Registry order equals: الرئيسية، محاضراتي، الملخصات، الأسئلة، البطاقات التعليمية، الملاحظات، المفضلة، المجلدات. Exactly one Active item per route except Settings (none). Mobile bar items: الرئيسية، محاضراتي، الملخصات، المزيد. Navigating directly by URL (deep link, refresh) preserves Active state.
- **Tests:** Unit tests mapping every route → expected active destination (table-driven, including nested/focus routes); link-locale tests.
- **DoD:** No component hardcodes a nav label or path.

### Phase 05 — Shared App Shell
- **Objective:** Desktop Sidebar, Tablet Rail + Drawer, Mobile Top Bar + Bottom Nav + More Sheet, Desktop Top Bar, all driven by the registry.
- **Scope:** Shell layout in `(app)`; Sidebar 232 (Horizontal logo), Rail 72 (Symbol logo, menu button), Drawer (opens from menu button; closes on scrim, Esc, destination change), Mobile Top Bar + 84 bottom nav with More tab on **every** mobile screen; More Sheet: five remaining destinations, account settings, plan-upgrade entry (UI only); Top Bar: search, language toggle, theme (System/Light shown "coming soon", not functional), notifications and user menu triggers (overlay content in Phase 06/09); upgrade card pinned at the sidebar/rail bottom (24 / 20px); `aria-current="page"`; skip link; mobile safe-area insets and 84px + inset bottom padding. Shell hides in `(focus)` group.
- **Dependencies:** 03, 04, 06's Sheet/overlay primitives (from 03).
- **Deliverables:** `shared/layout/*`, shell tests, screenshots at the three reference widths.
- **Acceptance:** Same registry in all five navigation shells. Breakpoints are chosen by testing content space, recorded in an ADR, and not equal to artboard widths by assumption. Sidebar sticky to viewport height (PROPOSED) with upgrade card visible. No fixed artboard heights. More tab shows active for destinations inside it (APPROVED). RTL: shell on the right; LTR: on the left, and the logo is never flipped. 320px width has no horizontal overflow.
- **Tests:** Component tests for each shell part; Playwright at 1440/768/390 for navigation, drawer open/close (scrim, Esc, destination change), More Sheet focus trap; axe on shell; keyboard-only traversal test.
- **DoD:** Shell implemented exactly once; module phases only render content inside it.

### Phase 06 — Shared states & overlay/guard infrastructure
- **Objective:** Build once everything modules reuse for state feedback and overlays.
- **Scope:** `Skeleton` primitives and the pattern for geometry-matched skeletons; `EmptyState` (single reusable component); `ErrorCard` with retry; `SectionBoundary` (per-section loading/error/retry so one failed section does not break the page); viewport-based portal overlay with scrim (renders over the active screen); `ConfirmGuardDialog` implementing the guard pattern: safe action = primary (focused on open), leave = secondary with red text (follows Recording guard; resolves the Notes P2 inversion per Handoff guidance); `useNavigationGuard` that covers in-app navigation, `beforeunload`, and browser back; toast/inline success pattern if Figma shows one (verify); Notifications / User Menu overlay frames (shells only, content static until data exists).
- **Dependencies:** 03.
- **Deliverables:** `shared/patterns/*`, `shared/hooks/useNavigationGuard`, dev gallery entries.
- **Acceptance:** Guard blocks every exit path while its condition is true and never when false. Approved copy used verbatim (Notes: "لديك تغييرات غير محفوظة" / "إذا غادرت الآن، قد تفقد التعديلات التي لم تحفظها." / "متابعة التعديل" / "مغادرة بدون حفظ"; Recording: "هل تريد مغادرة التسجيل؟" / "قد تفقد أجزاء من التسجيل لم يتم حفظها بعد إذا غادرت الصفحة." / "البقاء في الصفحة" / "مغادرة على أي حال"). Overlays scrim against the viewport, ignoring artboard heights.
- **Tests:** Guard unit/integration tests per exit path (link click, programmatic navigation, back, tab close event); focus-on-safe-action test; error-isolation test (one section fails, others render).
- **DoD:** Documented in `docs/` so modules know which component to reuse.

### Phase 07 — Landing Page
- **Objective:** The public marketing page, faithful to Figma, in AR and EN.
- **Scope:** Header/footer (Horizontal logo), sections per Figma page 01, Landing type styles (verify from Figma; reference says NOT VERIFIED), approved imagery from project files, responsive layouts, metadata and OG tags, language switch, CTA links to Auth routes.
- **Dependencies:** 02, 03, 04.
- **Deliverables:** `features/landing`, static-generated route.
- **Acceptance:** Visual parity at 1440/768/390 judged against Figma screenshots. No product claims beyond Figma copy. No horizontal overflow. Headings in correct order, images with alt text, links keyboard reachable. Arabic copy not rewritten.
- **Tests:** Playwright screenshot comparison per breakpoint; axe; Lighthouse accessibility/SEO recorded (as measurements, not targets until D-12 is set).
- **DoD:** Landing text lives in message files, not in components.

### Phase 08 — Authentication UI
- **Objective:** All auth screens as UI with validation and a swappable adapter boundary. Not functional authentication.
- **Scope:** Review the 108 Figma frames / 16 prototype flows first and write the screen/flow list into the phase plan; forms with React Hook Form + Zod (validate on blur); loading/error/success states from Figma; `AuthAdapter` interface and a **placeholder adapter that fails closed**; route-guard mechanism wired to the adapter's `getSession()` (works end-to-end only with a real or authorized mock adapter). Google sign-in button asset exists in project files; whether Google is a provider is UNRESOLVED, so do not wire it.
- **Dependencies:** 03, 06, 07 (public layout); gates D-02.
- **Deliverables:** `features/auth`, adapter interface, guard scaffolding, flow map doc.
- **Acceptance:** Every screen/flow in Figma reachable by route. Field-level errors, disabled/loading submit states. No tokens, passwords, or secrets logged or stored by UI code. Labelled labels, error text linked via `aria-describedby`, autofill attributes correct, show/hide password is keyboard accessible.
- **Tests:** Form validation tests; flow navigation Playwright test; axe; test that unauthenticated access to `(app)` redirects once a session adapter is defined (with mock only if authorized).
- **DoD:** Reported as "UI-complete, not functional" until Phase 21 plus gate D-02 are resolved.

### Phase 09 — Dashboard
- **Objective:** Dashboard with all approved states.
- **Scope:** Stat cards, latest lectures, other sections per Figma page 03; default, loading skeleton (matching geometry, Desktop/Tablet/Mobile), full error, partial error (per-section retry, e.g. "could not load latest lectures"), first-time state with upload prompt; Notifications and User Menu overlay content (static structure; sources UNRESOLVED); upload-lecture entry point (modal built in Phase 10).
- **Dependencies:** 05, 06, `LectureCard` (build here if first consumer, placed in `shared/patterns`).
- **Deliverables:** `features/dashboard`, `LectureCard`, `StatCard`.
- **Acceptance:** Statistic card: 272 wide at desktop reference, radius 18, hover shadow as verified. Layout is content-driven, never 2316px. No layout shift between skeleton and loaded. Each section fails independently. Stats are not invented: values come only from an adapter (static fixtures labelled as such if authorized).
- **Tests:** State-switching component tests (loading/error/partial/first-time/default); Playwright screenshots in each state at 3 widths; axe.
- **DoD:** Delivered state labelled UI-complete (fixtures) or Integrated (real data).

### Phase 10 — Lecture Management (My Lectures + Upload)
- **Objective:** Library, filters, and upload flow.
- **Scope:** Library with Lecture Card variants (24 in Figma), status badges, filters/search stored in the URL, upload modal (Desktop) / bottom sheet (Mobile), file picker UI, per-item processing states; actions requiring a ready lecture disabled while pending/processing.
- **Dependencies:** 06, 09's `LectureCard`; gates D-03 (file types/sizes), D-04 (status delivery).
- **Deliverables:** `features/lectures`.
- **Acceptance:** Filter state survives refresh and back/forward. Upload dialog traps focus, Esc closes, progress/error states from Figma. **No file-type or size limits are enforced or displayed unless D-03 is answered.** Disabled actions expose a reason (`aria-disabled` plus text).
- **Tests:** Filter/URL tests; upload dialog a11y and keyboard tests; badge-state tests; Playwright at 3 widths.
- **DoD:** Upload reported as UI only until Phase 21.

### Phase 11 — Lecture Details
- **Objective:** AI Workspace page with tabs, audio player, transcript, AI panel.
- **Scope:** Tabs, `AudioPlayer` (verify Figma component), transcript view, AI panel UI, entry actions to Tutor and related modules, breadcrumb, My Lectures remains active.
- **Dependencies:** 10; gate D-05 (transcript data shape).
- **Acceptance:** Audio player is keyboard operable with accessible name/time/progress. Transcript scrolls without page overflow; long Arabic/English mixed text wraps correctly. Actions requiring AI results are disabled if the lecture is not ready. Tabs follow ARIA tabs behavior.
- **Tests:** Player component tests (play/pause, seek via keyboard), tabs tests, mixed-direction text rendering test, Playwright at 3 widths.
- **DoD:** The audio source is a real file only if one is available; otherwise report "player UI only".

### Phase 12 — Live Recording & Transcription
- **Objective:** Recording workspace with real client-side capture and zero silent data loss.
- **Scope:** Microphone permission and device selector, record/pause/stop, timer (Geist Mono), waveform from the audio stream, local buffering of captured audio (chosen storage per D-06), status and processing stepper, transcript panel (UI states; no engine), error states (permission denied, no device, device lost), leave guard on **every** exit path, safe stop-and-save flow. Recording state in a dedicated session store.
- **Dependencies:** 06 guard; gates D-06 (retention, resume, max length), D-07 (transcription transport).
- **Acceptance:** Permission denial is handled with a clear, recoverable state. Closing the tab, back, or in-app navigation while recording/unsaved shows the guard; confirmed leave is explicit. Captured audio is not discarded without that confirmation. Timer accuracy is not tied to render frames. Behavior documented for browsers tested (list per D-12). Real-time transcription is **not claimed** without a service.
- **Tests:** Unit tests for the session state machine; mocked `MediaRecorder`/`getUserMedia` tests for permission, device-lost, stop paths; guard-path tests; a manual real-microphone test on named browsers recorded in the report; Playwright with fake media device flags.
- **DoD:** Report separates "capture and buffering verified" from "transcription not integrated".

### Phase 13 — AI Virtual Tutor
- **Objective:** Tutor workspace with a single shared session state.
- **Scope:** Avatar choice (Munsit, Nour, Adam), explanation level/style/language selectors, whiteboard with step "n of 5", captions, speed (1×), previous/next/play/restart, interaction panel with quick actions (explain again, simplify, give an example, quiz me), suggested questions, text input; error card with retry (re-sends last request, keeps the user message); Tablet error overlay without Rail (APPROVED); Desktop error shows no ghost conversation behind it.
- **Dependencies:** 11 (entry and breadcrumb), 06; gate D-08 (latency, streaming, retry limits, context selection, persistence).
- **Acceptance:** Whiteboard and panel stay on the same current step (one store). Playback controls operable by keyboard with accessible labels; step change announced via live region. Retry preserves the thread. No answer is shown as verified educational fact: AI-generated content carries an appropriate label (Instructions §11). Avatar assets are used only if present in project files; no invented avatars.
- **Tests:** Session store unit tests (step sync, retry); component tests for controls; error-state tests per breakpoint; axe; Playwright with a mocked failing/succeeding adapter.
- **DoD:** "UI + session logic" delivered; AI answers not functional until D-08 and Phase 21.

### Phase 14 — My Summaries
- **Objective:** Summary library and reader.
- **Scope:** Library (filters/search), reader view, actions per Figma (favorite, add to folder, create questions/flashcards entry points as shown), loading/empty/error states.
- **Dependencies:** 05, 06, 10 (`LectureCard`/patterns).
- **Acceptance:** Reader has readable line length, headings semantic, mixed AR/EN runs isolated. Generation actions disabled until lecture ready. AI-generated label present.
- **Tests:** Component tests; reader a11y; Playwright 3 widths.
- **DoD:** UI-complete state declared; generation not implemented.

### Phase 15 — AI Question Bank
- **Objective:** Creation form and quiz flows.
- **Scope:** Source (summary/lecture) + content picker; type (MCQ, true/false, short answer, mixed); difficulty (easy/medium/hard/mixed); count (5/10/15/20/custom); mode (practice/exam); live settings summary; create button disabled until valid; custom count validated on blur ("write a number greater than zero"); quiz run UI per Figma; results screen if drawn.
- **Dependencies:** 10, 14 (sources); gate D-09 (max count, available content, storage of results).
- **Acceptance:** Validation messages exactly as approved; error clears when valid; summary updates live. No maximum count is enforced unless defined by D-09. Exam mode behavior beyond Figma (timers, scoring) is not invented.
- **Tests:** Zod schema unit tests (boundary values); form interaction tests (blur validation); keyboard test of the whole form; Playwright.
- **DoD:** Declared UI-complete; generation and scoring not integrated.

### Phase 16 — My Notes
- **Objective:** Library, editor, empty state, and unsaved guard.
- **Scope:** Library, create-first-note empty state, editor (feature scope read from Figma first, gate D-10), dirty-flag tracking, guard on all exit paths when dirty only, save UI with success/error state.
- **Dependencies:** 06 (guard).
- **Acceptance:** Guard appears only when dirty and uses the shared pattern (safe action primary and focused by default). Manual-vs-auto save is not assumed (D-11) — implement the UI shown in Figma and record the assumption. Editor is keyboard accessible, with accessible names for toolbar controls. RTL/LTR text input behaves correctly (`dir="auto"` per block).
- **Tests:** Dirty-state unit tests; guard tests on each exit path; editor keyboard tests; Playwright.
- **DoD:** Notes not persisted until Phase 21.

### Phase 17 — AI Flashcards
- **Objective:** Library and Study Mode.
- **Scope:** Library with stats (retention 74%, 4 groups, 92 cards, review 12/30 as design samples only), topic filters, search, deck cards with status badge and start-review action; Study Mode in `(focus)` layout with visible Exit/Back/Close; mobile More tab active on this screen.
- **Dependencies:** 05 (focus layout), 06; gate D-13 (how retention % and the 12/30 target are computed; "needs review" rules).
- **Acceptance:** Study Mode has a working exit that restores prior route and state. Numbers shown are explicitly sample data until D-13 is resolved; no calculation logic invented. Card flip/next controls keyboard accessible; flip state exposed to assistive tech.
- **Tests:** Study Mode navigation tests; keyboard flow test; Playwright.
- **DoD:** UI-complete only.

### Phase 18 — Favorites
- **Objective:** Saved-items view.
- **Scope:** Saved-items listing per Figma, filtering by type, remove-from-favorites action, empty state; favorite toggle shared component used across modules.
- **Dependencies:** 10, 14, 16, 17 (item types); D-14 (which item types can be favorited — read from Figma first).
- **Acceptance:** Favorite toggle has accessible pressed state (`aria-pressed`); removal does not need destructive confirmation unless Figma shows one; the toggle component is the same everywhere.
- **Tests:** Toggle tests; list tests; Playwright.
- **DoD:** Not persisted until Phase 21.

### Phase 19 — My Folders
- **Objective:** Folder contents and selection actions, including focused workflows.
- **Scope:** Folder list/contents, multi-select with action bar, move/remove actions per Figma, empty states, focused workflows in `(focus)` with Back/Close/Exit, destructive-action confirmation with explicit naming of the target.
- **Dependencies:** 10, 14, 16, 17, 18; D-15 (folder rules: nesting, naming limits).
- **Acceptance:** Selection state keyboard operable and announced; destructive actions require confirmation; focus restored after dialogs. No folder rules invented.
- **Tests:** Selection tests; confirm-dialog tests; Playwright.
- **DoD:** UI-complete only.

### Phase 20 — Profile & Settings
- **Objective:** Account/settings screens with correct shell behavior.
- **Scope:** Per Figma page 14: account navigation; language setting (functional: switches locale and direction); theme options shown as "coming soon" for System/Light (APPROVED); plan section as UI only.
- **Dependencies:** 05, 06; D-16 (where language/theme persist).
- **Acceptance:** No primary nav item active on these routes. Language switch is accessible, preserves current route, and updates `lang`/`dir`. Persistence is local (cookie/localStorage) only if confirmed; otherwise per-session and documented.
- **Tests:** Locale-switch tests; active-state test; Playwright for AR↔EN on a sample of routes.
- **DoD:** Plan/upgrade content claims nothing beyond Figma copy.

### Phase 21 — API integration (gated, per resource)
- **Objective:** Replace adapters with real implementations, one resource at a time, only where the backend contract exists.
- **Scope:** For each resource (auth, lectures, summaries, questions, notes, flashcards, favorites, folders, settings, notifications, search): obtain the real contract from the backend owner, write typed DTOs and Zod response validation, implement the real adapter, error mapping, retry rules, polling or subscription for lecture status (per D-04), and route-guard wiring.
- **Dependencies:** Backend contract for that resource; the UI phase for the same resource.
- **Acceptance:** No endpoint, field, or behavior is assumed; each integrated resource links to its contract document. API base URL via public env var; no secrets in the client bundle (verified by build-output search). Errors map to the existing ErrorCard/section retry. Optimistic updates only with rollback.
- **Tests:** Contract-shaped MSW tests; error/timeout/401/403/5xx paths; real end-to-end test against a staging backend where available.
- **DoD:** Each resource gets its own status in `PROGRESS.md`: **Integrated** only after a real round-trip test passes. Resources with no contract remain "UI-complete".

### Phase 22 — Testing & hardening
- **Objective:** Cross-cutting quality pass; no new features.
- **Scope:** Full Playwright suite (AR and EN, 3 widths, keyboard flows); axe across all routes; contrast measurement; reduced-motion check; performance measurement and fix of hot spots; bundle analysis; browser/device matrix once D-12 is decided; remove dev routes; dead-code removal; security checklist (headers, CSP plan, dependency audit, no secrets, XSS in rendered AI/notes content).
- **Acceptance:** Zero known axe violations at the chosen standard (D-12); no horizontal overflow at 320–1920; all P1/P2 defects closed or documented; Handoff nonblocking issues re-verified (Menu→Drawer driven by registry, More tab on every mobile screen, Open Link behavior tested in the built product).
- **DoD:** Test report with executed command output.

### Phase 23 — Deployment preparation
- **Objective:** Release readiness (not release).
- **Scope:** Environment configuration docs, build and start scripts, hosting target per D-01, caching/headers, error monitoring decision, health/robots/sitemap, `.env.example` review, deployment runbook, rollback notes.
- **Acceptance:** Production build runs locally and on the chosen target in a staging environment; env vars documented; no secrets committed.
- **DoD:** Runbook reviewed by the user.

---

## 8. Testing strategy

| Layer | Tooling | What it covers | When |
|---|---|---|---|
| Static | `tsc`, ESLint (+jsx-a11y, import cycles), dependency-cruiser | Types, a11y lint, layering | Every phase, every PR |
| Unit | Vitest | Registry/active-state mapping, Zod schemas, state machines (recording, tutor, guard), formatters | With the code |
| Component | Testing Library + jest-axe | Primitives, patterns, states, keyboard behavior | With the code |
| E2E | Playwright | Navigation, guards on every exit path, forms, drawers/sheets, locale switch | From Phase 05 |
| Visual | Playwright screenshots at 1440/768/390 in AR and EN | Parity with Figma frames, RTL regressions | From Phase 02; baselines approved by the user |
| Accessibility | axe (automated) + manual keyboard and screen-reader spot checks | WCAG-level target (D-12), focus order, dialogs | Every UI phase |
| Integration | MSW + (later) staging backend | Adapters, error mapping | Phase 21 |
| Manual device | Real microphone on named browsers; real mobile devices for safe areas | Recording, bottom nav, sheets | Phases 12, 22 |

Rules: tests are written with the feature, not after. A test result is reported only if it was executed. Visual baselines are never auto-updated without review. Mock data used in tests is labelled and kept in `tests/fixtures`, never imported by production code.

**Responsive method:** breakpoints are not fixed to 1440/768/390. In Phase 05 content-driven breakpoints are chosen from layout behavior and recorded in an ADR. Always verify at 320, 390, 768, 1024, 1280, 1440, 1920.

---

## 9. Technical risks

| # | Risk | Impact | Mitigation | Status |
|---|---|---|---|---|
| R1 | Arabic RTL / English LTR: LTR frames were not inspected (Design System ref §7) | Incorrect mirrored icons, dialog/form alignment in EN | Logical CSS only; icon mirror whitelist; inspect Figma LTR only when needed and record in `design-values.md`; RTL+LTR screenshots every phase; `dir="auto"` and isolation for mixed runs | Open |
| R2 | Responsive consistency; no breakpoint or grid tokens defined | Layout drift between phases | ADR for breakpoints in Phase 05; shared layout primitives; overflow checks at 320px | Open |
| R3 | Real-time transcription: service, protocol, and latency unknown | Cannot deliver functional live transcript | UI states only until D-07; abstract behind `TranscriptionAdapter` | UNRESOLVED |
| R4 | Audio capture/persistence: browser variance, permission handling, memory growth, tab close | Data loss, crashes on long recordings | Chunked buffering, guard on all exits, named-browser manual tests, retention rules from D-06 | UNRESOLVED |
| R5 | AI service integration: latency, streaming, failure, retry limits | Poor UX, misleading content | Request state machine with retry; AI-content labelling; adapters | UNRESOLVED |
| R6 | Data security: XSS from AI/notes content, secret leakage, PII in logs | Security incident | Sanitize rendered rich content; no secrets in client; BFF proxy (if Next.js); CSP; dependency audit | Open |
| R7 | Authentication: provider/session/storage unknown | Rework of guards | Adapter interface; httpOnly-cookie preference is PROPOSED only; no token logic in UI | UNRESOLVED |
| R8 | State synchronization: tutor whiteboard vs panel, notes across devices, lecture status | Inconsistent UI, conflicts | Single store for tutor session; query invalidation conventions; conflict rules from D-11 | Partly UNRESOLVED |
| R9 | Performance: long lists, waveform rendering, large transcripts, fonts (Arabic subsets) | Jank, slow load | Measure before optimizing; virtualize only if measured need; font subsetting; lazy-load heavy feature code | Open |
| R10 | Accessibility: target standard undefined; Figma silent on keyboard/focus | Non-compliant UI | Adopt WCAG 2.2 AA as the working target (PROPOSED, D-12); axe + manual checks every phase | Open |
| R11 | Prototype gaps in Figma (Menu→Drawer 7/66, More trigger missing on 25 mobile screens) | Inconsistent nav | Registry-driven shell; follow Handoff guidance, not prototype | Mitigated by design |
| R12 | Figma-vs-browser differences (fixed artboard heights, flat overlays) | Layout bugs | Viewport scrims; content-driven heights | Mitigated by design |
| R13 | Design-value gaps (contrast not measured; Landing/Auth styles; Navigation Icon Button, inputs, dialogs, badges, tabs props NOT VERIFIED; 17 vs 19 variable count wording) | Invented values | Inspect Figma per component on demand; record in `design-values.md` | Open |
| R14 | Scope creep and invented features | Product drift | One phase at a time; "UI-complete vs Integrated" labelling | Process |

**Confirmed requirements (APPROVED, enter the build as-is):** dark-only design system; Cairo/Inter/Geist Mono; 19 color variables and 10 layout tokens; the 8-item navigation registry and its order; shared shell parts; Active rules; Mobile bar composition; logo rules; Notes and Recording guards and their copy; Study Mode exit; the Tutor error overlay; validation copy for custom question count; loading/error/partial-error/first-time Dashboard states.

---

## 10. Open technical decisions

| ID | Decision | Needed by | Owner | Default if undecided |
|---|---|---|---|---|
| D-01 | Hosting model (Node runtime vs static) → confirms Next.js vs Vite | Phase 01 | User/DevOps | Next.js, deployable as Node |
| D-02 | Auth provider, session model, token storage, route protection, password recovery, whether Google sign-in exists | Phase 08 (UI), Phase 21 | Product + Backend | Adapter only; no wiring |
| D-03 | Upload: file types, sizes, limits | Phase 10 | Product + Backend | Do not display limits |
| D-04 | How lecture status reaches the client (polling vs push), retry rules | Phase 10/21 | Backend | Polling behind an adapter |
| D-05 | Transcript and AI-panel data shapes | Phase 11 | Backend | UI against typed placeholders |
| D-06 | Recording: local retention, resume, max length | Phase 12 | Product | Keep until user confirms or discards; no resume |
| D-07 | Transcription engine and transport | Phase 12/21 | Backend/AI | UI states only |
| D-08 | Tutor: latency/streaming, retry limit, lecture context, settings persistence | Phase 13/21 | Backend/AI | Single request/response mock if authorized |
| D-09 | Question Bank: max count, content-availability rules, result storage | Phase 15 | Product + Backend | No max enforced |
| D-10 | Notes editor feature set (formatting, attachments) | Phase 16 | Product (read Figma) | Plain text with only what Figma shows |
| D-11 | Notes saving: manual vs auto, cross-device conflicts | Phase 16/21 | Product | Manual save per Figma |
| D-12 | Accessibility standard, supported browsers/devices | Phase 05 (draft) / 22 | User | WCAG 2.2 AA; last 2 versions of Chrome, Edge, Safari, Firefox |
| D-13 | Flashcards: retention %, daily target 12/30, "needs review" rules | Phase 17 | Product | Display sample data, no logic |
| D-14 | Favorites: which item types | Phase 18 | Product | Only types shown in Figma |
| D-15 | Folders: nesting/naming rules | Phase 19 | Product | Only what Figma shows |
| D-16 | Settings persistence for language/theme; light/system theme timing | Phase 20 | Product | Local, dark only |
| D-17 | Notifications sources and global search scope | Phase 09/21 | Product + Backend | Static shell UI |
| D-18 | Plan/upgrade rules and free-plan limits | Phase 05/20 | Product | UI copy only; no limits |
| D-19 | Authorization to use explicit mock data/adapters in dev | Phase 08 on | User | No mocks; screens show states only |
| D-20 | Package manager, Node version, lint/format conventions | Phase 01 | Engineering | pnpm, current LTS |

---

## 11. Clear starting point for Development Phase 01

**Not started. Awaiting explicit user authorization.**

Preconditions the user must provide before Phase 01:
1. Written authorization: "Start Development Phase 01."
2. Confirmation (or revision) of the stack in §2 → recorded as ADR-001. Minimum answers needed: D-01 (hosting), D-20 (package manager/Node), D-12 (browser/accessibility target; may stay at defaults).
3. The folder on the user's computer (or repo location) where the project will live.

First actions of Phase 01, in order:
1. Inspect the actual environment (OS, Node, package manager, git); report findings. Do not assume anything is installed.
2. Write `docs/phases/phase-01-plan.md` with exact scope and the dependency list with justification for each package.
3. Create the repository and scaffold per §3 with tooling only (no UI, no tokens, no features).
4. Configure dependency-cruiser and ESLint boundary rules, then prove they fail on a deliberate violation.
5. Run `typecheck`, `lint`, `test`, `build`; report the actual output.
6. Write `docs/PROGRESS.md`, ADR-001, and the Phase 01 report; commit on `phase/01-init`.
7. Add a short "Development Progress Log" doc to Project Context. **Stop.** Phase 02 begins only on the next explicit instruction.

Phase 01 explicitly excludes: design tokens, fonts, logo usage, any screen, any mock data, any API code.

---

*End of MUNSIT AI — Official Development Roadmap v1.0.*
