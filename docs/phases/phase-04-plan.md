# Phase 04 — Routing & navigation registry — Plan

- **Status:** **Draft plan for approval. Phase 04 has not started.** Nothing in this plan is
  implemented. Items marked PROPOSED or listed as open decisions need the user's approval.
- **Baseline:** `main` at `4a2f3f4` (Phase 03 closed through PR #24).
- **Branch for the implementation (after approval):** `phase/04-routing-navigation`

## 1. Objective

One centralized route map and one navigation registry (Roadmap Phase 04):

- every route is defined once;
- every navigation label, icon and path comes from the registry and the i18n messages;
- the active destination is computed from the URL alone, so deep links and page refreshes show
  the right active item.

The visible navigation UI (Sidebar, Rail, Drawer, bottom bar, More sheet) is **Phase 05**, not
this phase.

## 2. Authoritative references

| Source                                                          | Used for                                                                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roadmap v1.0, Phase 04 and §3 (read-only)                       | Scope, deliverables, acceptance, tests, DoD; route groups `(public)`, `(auth)`, `(app)`, `(focus)` under `[locale]`; `src/shared/navigation/` location               |
| Frontend Handoff Specification (read-only), pages 3–4 and 8     | Screen and module list, registry order and mobile placement, active rules, More sheet contents, focused workflows                                                    |
| `docs/design-values.md` §2b.1                                   | Verified nav icons (`home`, `book`, `fileText`, `help`, `cards`, `note`, `star`, `folder`, `more`)                                                                   |
| ADR-001; ADR-002                                                | Approved stack (next-intl, Next.js 16); deferred Phase 03 primitives                                                                                                 |
| `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/proxy.ts` | Existing locale routing (`ar` default unprefixed, `en` under `/en`, `/ar/...` redirects, no detection, no cookie); locale-aware `Link`, `usePathname`, `getPathname` |
| `node_modules/next/dist/docs/` (Next.js 16.4)                   | Route groups, `not-found`, `error`, `global-error`, `global-not-found` (AGENTS.md)                                                                                   |

**What the sources do not define:** the URL path of any screen. The Handoff lists screens and
modules but no paths, and the Roadmap gives only the route groups. Every path in §7 is therefore
**PROPOSED** and needs approval (D-R1).

## 3. Current repository state

- `src/app/[locale]/layout.tsx` is the root layout. It sets `<html lang dir>` and validates the
  locale. There is no top-level `src/app/layout.tsx`.
- Routes today:
  - `src/app/[locale]/page.tsx`: the Phase 01 placeholder home (issue I-1).
  - `dev/components` and `dev/tokens`: development only, 404 in production.
- There are no route groups, no `not-found.tsx`, no `error.tsx` and no `global-error.tsx`.
- `src/shared/navigation/` does not exist yet.
- i18n:
  - next-intl 4.15.1 with namespaces `common` and `dev` in `src/i18n/messages/{ar,en}`.
  - `createNavigation(routing)` already exports `Link`, `redirect`, `usePathname`, `useRouter`
    and `getPathname`.
- Icons: `IconName` from `src/design-system/icons/manifest.ts` includes every nav icon above.

## 4. Scope (Roadmap Phase 04)

1. A route tree with the four route groups under `[locale]`.
2. **Route constants**: a single typed definition of every app path.
3. **`nav-registry.ts`**: the 8 destinations in approved order, each with a stable id, label key
   (Arabic and English in messages), icon key, route reference and mobile placement.
4. **`useActiveDestination()`**: the active destination from the pathname, through a route-context
   map.
5. **A typed, locale-aware link helper** built on the existing next-intl navigation.
6. **404 and error boundaries.**
7. **Placeholder pages** with titles only, clearly saying "not implemented".
8. **Tests**: table-driven route → active destination; link-locale tests (Roadmap).

## 5. Explicit exclusions

- Sidebar, Rail, Drawer, bottom bar, More sheet, Top Bar and the app shell layout (Phase 05).
- Any module screen content, data or mock data (Phases 07–20).
- Landing (Phase 07) and Auth screens (Phase 08). Only their route group placeholders may be
  created, if approved (D-R12).
- Route protection or auth guards: gate D-02 is unresolved, and the Handoff says the design defines
  no route guards.
- Leave and unsaved-changes guards (Phase 06).
- Localized URL slugs, unless D-R2 decides otherwise.
- New dependencies.
- The eight deferred primitives (none is needed, §12).

## 6. Routing architecture

```
src/app/
├─ global-error.tsx              # last-resort boundary; own <html>/<body> (Next 16 docs)
└─ [locale]/
   ├─ layout.tsx                 # existing root layout (lang, dir, fonts, provider)
   ├─ not-found.tsx              # localized 404 inside the root layout
   ├─ error.tsx                  # "use client" boundary for route errors
   ├─ [...rest]/page.tsx         # calls notFound() for unmatched paths (D-R8)
   ├─ (public)/                  # landing placeholder (Phase 07 content)
   ├─ (auth)/                    # auth placeholders (Phase 08 content), if D-R12 approved
   ├─ (app)/                     # placeholder layout now; shell layout in Phase 05
   │  └─ … module routes (§7)
   ├─ (focus)/                   # Study Mode / focused folder routes; no global navigation
   │  └─ … focus routes (§7)
   └─ dev/                       # unchanged; development only
```

- **Route groups do not change URLs.** Two groups must never resolve to the same path, according
  to the Next 16 route-groups caveat. Landing `/` and the Dashboard therefore cannot both be `/`
  (D-R12).
- **One root layout** (`[locale]/layout.tsx`), so moving between groups stays a client navigation
  without a full page reload. Group layouts are nested layouts, not root layouts.
- **Unmatched URLs (D-R8, recommended):** a `[locale]/[...rest]/page.tsx` catch-all calls
  `notFound()`, so the localized `[locale]/not-found.tsx` renders inside the root layout with the
  correct `lang` and `dir`. The alternative is Next's `global-not-found.js`, which is
  **experimental** (`experimental.globalNotFound`) and bypasses the layout.
- **Errors:** `[locale]/error.tsx` is a Client Component, per the docs; `global-error.tsx` catches
  root-layout failures and must render its own `<html>` and `<body>`.
- **Locale handling stays in next-intl:** `proxy.ts` and `routing.ts` are unchanged except for the
  `pathnames` option if D-R2 is decided that way. There is no competing router.
- **Thin route files:** `src/app` composes; registry and logic live in `src/shared/navigation/`.
  dependency-cruiser keeps `app → shared → i18n / design-system`.

## 7. Route inventory

The **screens** are confirmed by the Handoff and Roadmap. **Paths and parameter names are PROPOSED
(D-R1)** and are not implemented until approved.

| #   | Screen (source)                                           | Group       | Active destination            | Proposed path (D-R1)                                                            | Status                        |
| --- | --------------------------------------------------------- | ----------- | ----------------------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| 1   | Dashboard (Handoff p.3, page 03)                          | `(app)`     | `dashboard`                   | `/dashboard` (D-R12)                                                            | Screen confirmed              |
| 2   | My Lectures (page 04)                                     | `(app)`     | `lectures`                    | `/lectures`                                                                     | Screen confirmed              |
| 3   | Lecture Details / AI Workspace (page 05)                  | `(app)`     | `lectures` (Handoff, Roadmap) | `/lectures/[lectureId]`                                                         | Screen confirmed              |
| 4   | Live Recording (page 06)                                  | `(app)`     | `lectures`                    | `/lectures/record` or per lecture (D-R11)                                       | Screen confirmed; path open   |
| 5   | AI Virtual Tutor (page 07)                                | `(app)`     | `lectures`                    | `/lectures/[lectureId]/tutor` (breadcrumb "lectures / lecture details / tutor") | Screen confirmed              |
| 6   | My Summaries: library (page 08)                           | `(app)`     | `summaries`                   | `/summaries`                                                                    | Screen confirmed              |
| 7   | My Summaries: reader (page 08)                            | `(app)`     | `summaries`                   | `/summaries/[summaryId]`                                                        | Screen confirmed              |
| 8   | AI Question Bank: creation (page 09)                      | `(app)`     | `questions`                   | `/questions`                                                                    | Screen confirmed              |
| 9   | AI Question Bank: quiz flow (page 09)                     | open (D-R5) | `questions`                   | `/questions/[quizId]`                                                           | Group and path open           |
| 10  | My Notes: library (page 10)                               | `(app)`     | `notes`                       | `/notes`                                                                        | Screen confirmed              |
| 11  | My Notes: editor (page 10)                                | `(app)`     | `notes`                       | `/notes/[noteId]` (+ new note, D-R1)                                            | Screen confirmed              |
| 12  | AI Flashcards: library (page 11)                          | `(app)`     | `flashcards`                  | `/flashcards`                                                                   | Screen confirmed              |
| 13  | AI Flashcards: Study Mode (page 11; Roadmap `(focus)`)    | `(focus)`   | `flashcards` (D-R6)           | `/flashcards/[deckId]/study`                                                    | Screen confirmed              |
| 14  | Favorites (page 12)                                       | `(app)`     | `favorites`                   | `/favorites`                                                                    | Screen confirmed              |
| 15  | My Folders: list and folder contents (page 13)            | `(app)`     | `folders`                     | `/folders`, `/folders/[folderId]`                                               | Screen confirmed              |
| 16  | Focused folder workflows (Handoff p.8; Roadmap `(focus)`) | `(focus)`   | `folders` (D-R6)              | open (D-R4)                                                                     | **Which screens: open**       |
| 17  | Profile & Settings (page 14)                              | `(app)`     | **none** (Handoff, Roadmap)   | `/settings` + sub-routes (D-R3)                                                 | Sub-screens open              |
| 18  | Landing (Phase 07)                                        | `(public)`  | — (no app shell)              | `/`                                                                             | Placeholder only              |
| 19  | Auth: login, register, recovery (Phase 08; page 02)       | `(auth)`    | —                             | open (D-R12)                                                                    | Placeholder only, if approved |
| 20  | Dev gallery and tokens                                    | `dev/`      | —                             | unchanged                                                                       | Existing, 404 in production   |
| 21  | Unknown path                                              | —           | —                             | any unmatched                                                                   | 404 (D-R8)                    |

English URLs are the same paths under `/en`; Arabic URLs have no prefix, as today.

## 8. Navigation registry design

Location: `src/shared/navigation/nav-registry.ts`. It is the single source for every navigation
surface in Phase 05.

| Order | id           | Arabic label (Handoff / Roadmap, verbatim) | English label (D-R7, PROPOSED: Handoff module name) | Icon key (design-values §2b.1) | Route key    | Mobile placement |
| ----- | ------------ | ------------------------------------------ | --------------------------------------------------- | ------------------------------ | ------------ | ---------------- |
| 1     | `dashboard`  | الرئيسية                                   | Dashboard                                           | `home`                         | `dashboard`  | bar              |
| 2     | `lectures`   | محاضراتي                                   | My Lectures                                         | `book`                         | `lectures`   | bar              |
| 3     | `summaries`  | الملخصات                                   | My Summaries                                        | `fileText`                     | `summaries`  | bar              |
| 4     | `questions`  | الأسئلة                                    | AI Question Bank                                    | `help`                         | `questions`  | more             |
| 5     | `flashcards` | البطاقات التعليمية                         | AI Flashcards                                       | `cards`                        | `flashcards` | more             |
| 6     | `notes`      | الملاحظات                                  | My Notes                                            | `note`                         | `notes`      | more             |
| 7     | `favorites`  | المفضلة                                    | Favorites                                           | `star`                         | `favorites`  | more             |
| 8     | `folders`    | المجلدات                                   | My Folders                                          | `folder`                       | `folders`    | more             |

- **Mobile bar:** the three `bar` destinations plus the **المزيد** tab (icon `more`). Its label is
  a message key and its entry is part of the registry module, not a destination.
- **More sheet entries** (Handoff): the five `more` destinations, account settings and a plan
  upgrade entry. The settings and upgrade entries are listed in the registry as non-destination
  items; the upgrade entry is UI-only until the plan behaviour is defined.
- **Shape:**
  - `as const` data;
  - `id` is a literal union type;
  - labels are **message keys** (`nav.<id>`), never inline strings;
  - icons are typed as `IconName`;
  - routes are references to the route constants.
- **Labels in messages:** a new `nav` namespace in `src/i18n/messages/{ar,en}`. The Arabic text is
  copied verbatim.

## 9. Active destination behaviour

- **Pure resolver:** `resolveActiveDestination(pathname): DestinationId | null` in
  `src/shared/navigation/`. It takes the locale-stripped pathname that next-intl's `usePathname()`
  returns, and matches segments against a **route-context map**:
  - each route pattern maps to a destination or to `null`;
  - the most specific pattern wins;
  - it ignores a trailing slash.
- **`useActiveDestination()`:** a thin client hook: `resolveActiveDestination(usePathname())`.
  Server components can call the resolver with the request pathname.
- **Rules:**
  - Each of the 8 destination roots and their nested routes resolves to that destination.
  - Lecture Details, Live Recording and AI Tutor resolve to `lectures`.
  - Study Mode resolves to `flashcards`, and focused folder routes to `folders`, subject to D-R6.
  - Profile & Settings resolve to `null`.
  - Landing, auth, dev and unknown routes resolve to `null`; they have no app shell.
  - Every `(app)` and `(focus)` route other than Settings resolves to exactly one destination.
- **Mobile bar** (computed in Phase 05 from the same result):
  - a `bar` destination marks its own tab;
  - a `more` destination marks المزيد (Handoff, proposed);
  - Settings is decision D-R6.
- **Deep link and refresh:** the result depends only on the URL, so a server render, a direct
  load and a refresh all give the same active item.
- **Accessibility:** Phase 05 marks the active item with `aria-current="page"` (CLAUDE.md).

## 10. Internationalization requirements

- Locales stay as approved:
  - `ar` is the default, unprefixed and RTL;
  - `en` is under `/en` and LTR;
  - `/ar/...` redirects to the unprefixed URL;
  - there is no detection and no cookie.
- **Typed links (recommended, D-R2):** declare the route constants as next-intl `pathnames` in
  `routing.ts`, with the same path for both locales. This makes the existing `Link`, `redirect` and
  `getPathname` type-check hrefs and parameters, for example
  `{ pathname: "/lectures/[lectureId]", params: { lectureId } }`. There is one source of paths and
  no second routing system.
- Every visible string (nav labels, placeholder titles, 404 and error copy) comes from messages in
  both locales. Arabic copy is verbatim from Figma or the Handoff; copy they don't contain needs
  approval (D-R9).
- Placeholder and 404 pages inherit `lang` and `dir` from the root layout. A Latin run inside
  Arabic text uses `Ltr`.

## 11. Dependencies

- **Phase 02:** i18n, routing, tokens and typography. Done.
- **Phase 03:** primitives that placeholders and the 404 page may use, such as headings with the
  existing typography and `Card`. Done.
- **No new packages.** next-intl's `pathnames`, Next's file conventions and the existing test stack
  cover everything.
- **Phase 05** depends on this phase's registry and resolver.

## 12. Deferred component obligations (ADR-002)

- **Phase 04 needs none of the eight deferred primitives.** Its only UI is placeholder titles and
  the 404 and error pages: text, an optional `Card`, and a link back built with the existing
  `Link` and `Button` styles.
- **O-8 Navigation Icon Button** stays open. It needs Figma verification and implementation before
  its first consuming screen: the Phase 05 Top Bar, or earlier if the Phase 07 Landing mobile
  navbar uses it.
- O-1 to O-7 remain tied to their first consuming feature.

## 13. Implementation sequence (after approval)

1. **Decisions:** resolve D-R1 to D-R12, then record them in this plan.
2. **Route constants and `pathnames`:** typed path definitions, plus unit tests for `getPathname`
   in both locales.
3. **Registry and messages:** `nav-registry.ts`, the `nav` namespace in `ar` and `en`, and tests.
4. **Resolver and hook:** `resolveActiveDestination`, the route-context map, `useActiveDestination`,
   and table-driven tests.
5. **Route tree:**
   - route groups;
   - placeholder pages and group layouts (no shell yet);
   - the move of the existing home placeholder into `(public)` (I-1 stays open until Phase 07).
6. **Boundaries:** `[locale]/not-found.tsx`, the catch-all, `[locale]/error.tsx`, `global-error.tsx`.
7. **E2E:** deep links, refresh, 404, the error boundary (D-R10), and RTL/LTR at
   1440/768/390/320.
8. **Checks and close:** `pnpm check`, `test:e2e`, axe, the phase report, `PROGRESS.md`, PR, CI.

## 14. Testing strategy

| Area                        | Test (table-driven where possible)                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registry                    | Exact order of the 8 ids; Arabic labels in `ar/nav.json` equal the approved text; English labels exist; ids unique; icon keys exist in `ICON_MANIFEST`; mobile bar = `dashboard`, `lectures`, `summaries` + المزيد |
| Every destination root      | `resolveActiveDestination(path)` returns its destination                                                                                                                                                           |
| Nested routes               | Lecture Details, Recording and Tutor → `lectures`; summary reader → `summaries`; note editor → `notes`; folder contents → `folders`; quiz → `questions`                                                            |
| Focus routes                | Study Mode → `flashcards`; focused folder routes → `folders` (per D-R6)                                                                                                                                            |
| Profile & Settings          | Every settings route → `null`                                                                                                                                                                                      |
| No-shell and unknown        | Landing, auth, dev, unknown → `null`; trailing slash handled                                                                                                                                                       |
| Exactly one active          | For every inventory route (except Settings and no-shell routes), exactly one destination                                                                                                                           |
| Locale links                | `getPathname` for every route key: `ar` unprefixed, `en` under `/en`, parameters filled; `Link` renders the locale-correct href (component test)                                                                   |
| Deep link and refresh (E2E) | Direct load of each placeholder in `ar` and `en`: status 200, placeholder title, `lang` and `dir`; reload gives the same page and active id                                                                        |
| 404 (E2E)                   | Unknown paths in `ar` and `en`: status 404, localized not-found inside the root layout, link back works                                                                                                            |
| Error (E2E)                 | The error boundary renders and recovers (D-R10)                                                                                                                                                                    |
| Universal checks            | axe on the new pages; 1440/768/390 plus 320 overflow; keyboard pass; no hardcoded nav label or path (a grep-style unit test over `src/`)                                                                           |

## 15. Acceptance criteria (Roadmap Phase 04, unchanged)

1. Registry order equals: الرئيسية، محاضراتي، الملخصات، الأسئلة، البطاقات التعليمية، الملاحظات،
   المفضلة، المجلدات.
2. Exactly one Active item per route, except Settings (none).
3. Mobile bar items: الرئيسية، محاضراتي، الملخصات، المزيد.
4. Navigating directly by URL (deep link, refresh) preserves the Active state.
5. Tests: table-driven route → active destination (including nested and focus routes);
   link-locale tests.
6. Deliverables: registry, hook, route constants, typed link helper, and route placeholders that
   clearly say "not implemented".

## 16. Definition of Done

- No component hardcodes a nav label or path (Roadmap Phase 04 DoD).
- Universal checks pass (Roadmap §4): `tsc`, lint, no import cycles, unit tests, axe, keyboard,
  RTL/LTR, 1440/768/390 plus 320.
- Phase report written; `PROGRESS.md` updated; nothing from later phases started.

## 17. Risks and open decisions

| ID    | Decision needed                                                                                                                                                                                                                    | Recommendation                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-R1  | **URL paths and parameter names for every screen.** No source defines them                                                                                                                                                         | Approve or edit the table in §7 (short English segments, plural collections, `[xxxId]` parameters)                                                                         |
| D-R2  | Same paths in both locales, or localized Arabic slugs                                                                                                                                                                              | Same paths, declared as next-intl `pathnames` for typed links                                                                                                              |
| D-R3  | Profile & Settings sub-screens and their routes. Figma page 14 has six Settings screens (Card contract), not yet inventoried by route                                                                                              | Read-only Figma inventory of page 14, then sub-routes under `/settings`                                                                                                    |
| D-R4  | Which "focused Folder workflows" exist and their routes                                                                                                                                                                            | Read-only Figma check of page 13 before routing them                                                                                                                       |
| D-R5  | Question Bank quiz flow: `(app)` with the shell, or `(focus)`                                                                                                                                                                      | Figma check: does the quiz screen show the global navigation?                                                                                                              |
| D-R6  | Active state on focus routes, and the mobile المزيد tab: the Handoff proposes More active for screens inside it (e.g. Flashcards), but Profile & Settings must have no active item, and account settings are inside the More sheet | Destinations: Study Mode → `flashcards`, focused folders → `folders`. Mobile: More active for `more` destinations; **none** on Settings (follows the approved "none" rule) |
| D-R7  | English nav labels; Figma is Arabic-first                                                                                                                                                                                          | Use the Handoff module names (Dashboard, My Lectures, …)                                                                                                                   |
| D-R8  | 404 strategy for unmatched URLs                                                                                                                                                                                                    | `[locale]/[...rest]` catch-all + `[locale]/not-found.tsx` (stable, localized); not the experimental `global-not-found`                                                     |
| D-R9  | Placeholder copy ("not implemented") and titles of non-nav screens (Lecture Details, Study Mode, …); 404 and error copy                                                                                                            | Titles from Figma frame titles where they exist; short bilingual copy for "not implemented", 404 and error, approved before use                                            |
| D-R10 | How to test the error boundary                                                                                                                                                                                                     | A development-only route that throws (404 in production, like `/dev/*`), or a component test only                                                                          |
| D-R11 | Live Recording: a new recording (no lecture yet) or per lecture                                                                                                                                                                    | Figma check of page 06 entry points                                                                                                                                        |
| D-R12 | Landing `/` versus the Dashboard; auth paths; whether to create `(public)` and `(auth)` placeholders now. The Handoff page list is ambiguous on which screen is the "Home destination"                                             | Landing stays `/` (Phase 07); Dashboard `/dashboard`; auth paths decided with Phase 08 (placeholders now only if approved)                                                 |

**Risks:**

- **Paths chosen now become public URLs.** Changing them later breaks links. Approve D-R1 and
  D-R12 before coding.
- **Route groups resolving to the same path fail the build** (Next 16 caveat). The inventory test
  guards this.
- **`global-not-found` is experimental.** It is avoided by D-R8.
- **The More-tab rule (D-R6) affects Phase 05 behaviour.** Fix it now in the resolver tests.
- **Authentication is unresolved (D-02),** so no route protection. Placeholders are public until
  Phase 21.

## 18. Team responsibilities (PROPOSED — not approved)

Ownership rules (CLAUDE.md): `src/app`, `src/shared` and `src/i18n` are owned by Yousef. Mariam
joins from Phase 04, and her module assignments are recorded in `PROGRESS.md` only when the user
decides.

| Area                                           | Proposed owner            | Proposed support                                                                                                           |
| ---------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Routing architecture (`src/app`)               | Yousef                    | Claude (implementation and Next 16 doc checks)                                                                             |
| Navigation registry and resolver               | Yousef                    | Claude                                                                                                                     |
| i18n integration (`pathnames`, `nav` messages) | Yousef                    | Mariam: review of the English labels and of the RTL/LTR behaviour, if assigned                                             |
| Testing                                        | Yousef (integration, E2E) | Mariam: route → active-destination test tables as a delegated test file, if the user approves a delegation like Phase 03's |
| Documentation                                  | Yousef                    | Claude (plan, decisions, phase report)                                                                                     |
| Mariam onboarding                              | Yousef                    | New starter package from the Phase 04 baseline, per `TEAM_COLLABORATION.md`, only when approved                            |

None of these assignments is active until the user approves them.
