# Phase 04 — Routing & navigation registry — Plan

- **Status:** **Plan for approval. Phase 04 has not started.** Nothing in this plan is
  implemented. Decisions approved by the user on 2026-11-16 are marked **Approved**. Items that
  still need approval are **Proposed**. Questions the design does not answer are **Unresolved**.
- **Baseline:** `main` at `cf96d97` (Phase 03 closed in PR #24; Tabs M-1 fix in PR #25).
- **Branch for the implementation (after authorization):** `phase/04-routing-navigation`

## 1. Objective

One centralized route map and one navigation registry (Roadmap Phase 04):

- every route is defined once;
- every navigation label, icon and path comes from the registry and the i18n messages;
- the active destination is computed from the URL alone, so deep links and page refreshes show
  the right active item.

The visible navigation UI (Sidebar, Rail, Drawer, bottom bar, More sheet) is **Phase 05**, not
this phase.

## 2. Authoritative references

| Source                                                          | Used for                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Roadmap v1.0, Phase 04 and §3 (read-only)                       | Scope, deliverables, acceptance, tests, DoD; route groups `(public)`, `(auth)`, `(app)`, `(focus)` under `[locale]`; `src/shared/navigation/` |
| Frontend Handoff Specification (read-only), pages 3–4 and 8     | Screen and module list, registry order and mobile placement, active rules, More sheet contents, focused workflows                             |
| Figma file `Avyn9kL0drXepQyTXTLXXb`, read-only on 2026-11-16    | Screen inventory per page, shell presence (Tablet Rail), prototype links between screens, breadcrumbs (§7.1). Figma is not modified           |
| `docs/design-values.md` §2b.1                                   | Verified nav icons (`home`, `book`, `fileText`, `help`, `cards`, `note`, `star`, `folder`, `more`, `crown`)                                   |
| ADR-001; ADR-002                                                | Approved stack (next-intl, Next.js 16); deferred Phase 03 primitives                                                                          |
| `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/proxy.ts` | Existing locale routing; locale-aware `Link`, `redirect`, `usePathname`, `getPathname`                                                        |
| `node_modules/next/dist/docs/` (Next.js 16.4)                   | Route groups (caveats), `not-found`, `error`, `global-error`, `global-not-found` (AGENTS.md)                                                  |

## 3. Current repository state

- `src/app/[locale]/layout.tsx` is the only root layout. It sets `<html lang dir>`, validates the
  locale and wraps the app in `NextIntlClientProvider messages={null}`, so client components get
  no translations today. There is no top-level `src/app/layout.tsx`.
- Routes today:
  - `src/app/[locale]/page.tsx`: the Phase 01 placeholder home (issue I-1).
  - `dev/components` and `dev/tokens`: development only, 404 in production.
- There are no route groups, no `not-found.tsx`, no `error.tsx` and no `global-error.tsx`.
- `src/shared/navigation/` does not exist yet.
- i18n: next-intl 4.15.1 with namespaces `common` and `dev`.
- Icons: `IconName` includes every nav icon.
- **No Phase 04 code exists.**

## 4. Scope (Roadmap Phase 04)

1. A route tree with the four route groups under `[locale]`.
2. **Route constants**, declared as next-intl `pathnames`.
3. **`nav-registry.ts`**: the 8 destinations, plus the mobile bar, More sheet extras and Settings
   navigation as data.
4. **`resolveActiveDestination()` and `useActiveDestination()`**, with a route-key mapping.
5. **A typed, locale-aware link helper** built on the existing next-intl navigation.
6. **Localized 404 and error boundaries.**
7. **Placeholder pages** with titles only, clearly saying "not implemented".
8. **Tests**: table-driven route → active destination; link-locale tests.

## 5. Explicit exclusions

- Sidebar, Rail, Drawer, bottom bar, More sheet, Top Bar, Settings navigation UI and the app shell
  layout (Phase 05; Settings UI in Phase 20).
- Module screen content, data or mock data (Phases 07–20).
- **Route protection and auth redirects:** gate D-02 is unresolved, and the Roadmap does not require
  them in Phase 04.
- Leave and unsaved-changes guards (Phase 06).
- Localized URL slugs (D-R2).
- New dependencies.
- The deferred primitives (§12).
- Routes whose workflows are unresolved (§17).

## 6. Routing architecture

```
src/app/
├─ global-error.tsx              # last resort for root-layout failures; own <html>/<body>
└─ [locale]/
   ├─ layout.tsx                 # existing root layout (lang, dir, fonts, provider)
   ├─ not-found.tsx              # localized 404 inside the root layout (D-R8)
   ├─ error.tsx                  # "use client"; localized route-error boundary
   ├─ [...rest]/page.tsx         # unmatched paths → notFound() (D-R8)
   ├─ (public)/page.tsx          # `/` landing placeholder (Phase 07 content)
   ├─ (auth)/…                   # /login, /register, /forgot-password, /reset-password placeholders
   ├─ (app)/layout.tsx           # minimal now; the shell replaces it in Phase 05
   │  ├─ dashboard/ … folders/   # module routes (§7)
   │  └─ settings/layout.tsx     # reserved for the Settings secondary navigation (§8.3)
   ├─ (focus)/layout.tsx         # no global navigation
   │  └─ flashcards/[deckId]/study/
   └─ dev/                       # unchanged; development only
```

- **Collision prevention:**
  - Next 16 forbids routes in different groups resolving to the same path.
  - Landing `/` lives only in `(public)`; the Dashboard is `/dashboard` in `(app)`.
  - `/flashcards/[deckId]/study` lives only in `(focus)`; `/flashcards` and `/flashcards/[deckId]`
    live in `(app)`.
  - A unit test checks that every inventory path is unique.
  - Static segments (`new`, `record`) win over dynamic ones. These words are therefore reserved and
    can never be ids.
- **One root layout:** group layouts are nested, so navigating between groups never triggers the
  full page reload that multiple root layouts cause.
- **404 (D-R8, approved):**
  - The `[locale]/[...rest]` catch-all calls `notFound()`, which renders the nearest
    `[locale]/not-found.tsx` inside the locale layout with the right `lang` and `dir` and an HTTP 404.
  - An unprefixed unknown path is rewritten by `proxy.ts` to `ar` and gets the Arabic 404;
    `/en/...` gets the English one.
  - The experimental `global-not-found` is **not** used.
- **Errors, separate from unknown routes:**
  - `[locale]/error.tsx` handles thrown errors. It is a Client Component, per the Next docs.
  - Because the layout passes `messages={null}`, the provider must pass the error and 404
    namespaces to the client (next-intl `pick`), or the boundary receives server-translated
    strings.
  - `global-error.tsx` replaces the root layout and cannot rely on the locale, so it shows short
    static Arabic and English text.
- **Locale handling stays in next-intl:**
  - `proxy.ts` is unchanged.
  - `routing.ts` gains only the `pathnames` declaration.

## 7. Route inventory

English URLs are the same paths under `/en`. Arabic URLs have no prefix, and `/ar/...` redirects.

### 7.1 Figma workflow evidence (read-only, 2026-11-16)

"Shell" means the Tablet frame shows the Rail. "Link" means a Figma prototype reaction.

| Area                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Conclusion                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Folders (D-R4)         | "Folder Management" = **Create Folder dialog** (title "إنشاء مجلد جديد", scrim/close/cancel → CLOSE), linked from Library "Create Folder". "Add Content" = **dialog** ("إضافة محتوى للمجلد", scrim/cancel → CLOSE), linked from Folder Details "Add Content". "Content Organization" = Folder Details **in selection mode** (reached by a checkbox; "Clear Selection" and "Undo" → Folder Details). Folder Details has the shell and the breadcrumb "المجلدات / ‹folder›" → Library | Library-level create dialog; folder-level add dialog; selection is local state. **No folder screen is drawn as a focus route**                                                     |
| Live Recording (D-R11) | Breadcrumb "محاضراتي / تسجيل محاضرة جديدة", title "تسجيل محاضرة جديدة", editable course and lecture-name fields; entry "بدء تسجيل جديد" in the My Lectures upload dialog; "Saved" overlay → "الانتقال إلى المحاضرة"; shell present                                                                                                                                                                                                                                                  | Recording **creates a new lecture**; no lecture id in the route; nothing shows recording from an existing lecture; My Lectures active                                              |
| Question Bank          | Library cards with statuses Ready / Completed / Unfinished and "متابعة آخر اختبار" (resume last quiz) → Quiz Taking; "Create Quiz" → Generator; Quiz → Results (via the submit dialog); Results → "Review Answers", "Retry", "Back to Question Bank"; Review → "Back to Results". All have the shell                                                                                                                                                                                | Question sets persist and quizzes can be resumed. **No evidence** of a persistent Results id or of Review needing a saved attempt; the Handoff lists results storage as unresolved |
| Flashcards             | Library → Deck Details (CTA); Create → loading; Deck Details → "Start Study" → Study; Study "Back" → Deck Details; Session Complete → Library. Study and Session Complete have **no shell**                                                                                                                                                                                                                                                                                         | Study is per deck and a focus route; Session Complete is the end state of Study                                                                                                    |
| Summaries              | Library card action → Reader; Reader breadcrumb "ملخصاتي / ‹title›", "Back to Summaries"; Create Summary is a dialog                                                                                                                                                                                                                                                                                                                                                                | Reader per summary                                                                                                                                                                 |
| Notes                  | Library "Create Note" → full **New Note** editor screen; "Open Note" → Editor; Editor "Back to My Notes"; "Organization" and "AI Assistant" are reached from inside library and editor                                                                                                                                                                                                                                                                                              | New-note route + editor per note; Organization and AI Assistant are in-page states                                                                                                 |
| Lecture → Tutor        | Lecture Details has no prototype link to the Tutor; the Handoff gives the Tutor breadcrumb "lectures / lecture details / tutor"; the Handoff lists "how a lecture is chosen as context" as unresolved                                                                                                                                                                                                                                                                               | Tutor nested under a lecture (Handoff); how the context is chosen stays unresolved                                                                                                 |
| Settings (D-R3)        | Page 14 has 6 screens: 01 Profile Overview, 02 Edit Profile, 03 Learning Preferences, 04 Notifications, 05 Security & Privacy, 06 Subscription & Account; Desktop "Settings Navigation"; Tablet shell; dialogs are overlays                                                                                                                                                                                                                                                         | Settings root + 5 sub-screens with a secondary nav                                                                                                                                 |
| Auth                   | Page 02 has Login, Register, Forgot Password (+ Email Sent state), Reset Password (+ invalid/expired link states)                                                                                                                                                                                                                                                                                                                                                                   | Four auth routes                                                                                                                                                                   |
| Landing                | Page 01 has its own menu ("Menu / Button" frame; items الرئيسية، المميزات، كيف يعمل؟); no Navigation Icon Button instance                                                                                                                                                                                                                                                                                                                                                           | Landing nav is separate from the app registry                                                                                                                                      |

### 7.2 URL inventory

| #   | Path                                                                                                                    | Group      | Screen                                         | Route key             | Active destination | Status                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- | --------------------- | ------------------ | ------------------------------------------------------- |
| 1   | `/`                                                                                                                     | `(public)` | Landing (placeholder)                          | `landing`             | —                  | **Approved**                                            |
| 2   | `/login`                                                                                                                | `(auth)`   | Login (placeholder)                            | `auth.login`          | —                  | **Approved**                                            |
| 3   | `/register`                                                                                                             | `(auth)`   | Register (placeholder)                         | `auth.register`       | —                  | **Approved**                                            |
| 4   | `/forgot-password`                                                                                                      | `(auth)`   | Forgot Password (placeholder)                  | `auth.forgotPassword` | —                  | **Approved**                                            |
| 5   | `/reset-password`                                                                                                       | `(auth)`   | Reset Password (placeholder)                   | `auth.resetPassword`  | —                  | **Approved** (link token format: D-02, Phase 08)        |
| 6   | `/dashboard`                                                                                                            | `(app)`    | Dashboard                                      | `dashboard`           | `dashboard`        | **Approved**                                            |
| 7   | `/lectures`                                                                                                             | `(app)`    | My Lectures                                    | `lectures`            | `lectures`         | **Approved**                                            |
| 8   | `/lectures/[lectureId]`                                                                                                 | `(app)`    | Lecture Details                                | `lectures.detail`     | `lectures`         | Proposed — workflow verified                            |
| 9   | `/lectures/[lectureId]/tutor`                                                                                           | `(app)`    | AI Tutor                                       | `lectures.tutor`      | `lectures`         | Proposed — Handoff breadcrumb; tutor context unresolved |
| 10  | `/lectures/record`                                                                                                      | `(app)`    | Live Recording (new lecture)                   | `lectures.record`     | `lectures`         | Proposed — workflow verified (D-R11)                    |
| 11  | `/summaries`                                                                                                            | `(app)`    | My Summaries                                   | `summaries`           | `summaries`        | **Approved**                                            |
| 12  | `/summaries/[summaryId]`                                                                                                | `(app)`    | Summary Reader                                 | `summaries.reader`    | `summaries`        | Proposed — workflow verified                            |
| 13  | `/questions`                                                                                                            | `(app)`    | Question Bank library                          | `questions`           | `questions`        | **Approved**                                            |
| 14  | `/questions/new`                                                                                                        | `(app)`    | Generator (its mobile steps are in-page)       | `questions.new`       | `questions`        | Proposed — workflow verified                            |
| 15  | `/questions/[setId]/quiz`                                                                                               | `(app)`    | Quiz Taking (Practice / Exam)                  | `questions.quiz`      | `questions`        | Proposed — set persists; mode in URL unresolved         |
| 16  | Results, Answer Review                                                                                                  | `(app)`    | Quiz Results, Answer Review                    | —                     | `questions`        | **Unresolved** — not routed in Phase 04                 |
| 17  | `/flashcards`                                                                                                           | `(app)`    | Flashcards library                             | `flashcards`          | `flashcards`       | **Approved**                                            |
| 18  | `/flashcards/new`                                                                                                       | `(app)`    | Create deck                                    | `flashcards.new`      | `flashcards`       | Proposed — workflow verified                            |
| 19  | `/flashcards/[deckId]`                                                                                                  | `(app)`    | Deck Details                                   | `flashcards.deck`     | `flashcards`       | Proposed — workflow verified                            |
| 20  | `/flashcards/[deckId]/study`                                                                                            | `(focus)`  | Study Mode (+ Session Complete state)          | `flashcards.study`    | `flashcards`       | Proposed — workflow verified (no shell)                 |
| 21  | `/notes`                                                                                                                | `(app)`    | My Notes                                       | `notes`               | `notes`            | **Approved**                                            |
| 22  | `/notes/new`                                                                                                            | `(app)`    | New Note editor                                | `notes.new`           | `notes`            | Proposed — workflow verified                            |
| 23  | `/notes/[noteId]`                                                                                                       | `(app)`    | Note Editor                                    | `notes.editor`        | `notes`            | Proposed — workflow verified                            |
| 24  | `/favorites`                                                                                                            | `(app)`    | Favorites (Management, Organization in-page)   | `favorites`           | `favorites`        | **Approved**                                            |
| 25  | `/folders`                                                                                                              | `(app)`    | My Folders (Create Folder = dialog)            | `folders`             | `folders`          | **Approved**                                            |
| 26  | `/folders/[folderId]`                                                                                                   | `(app)`    | Folder Details (Add Content dialog, selection) | `folders.detail`      | `folders`          | Proposed — workflow verified (D-R4)                     |
| 27  | `/settings`                                                                                                             | `(app)`    | 01 Profile Overview                            | `settings`            | **none**           | **Approved**                                            |
| 28  | `/settings/profile`, `/settings/preferences`, `/settings/notifications`, `/settings/security`, `/settings/subscription` | `(app)`    | Settings 02–06                                 | `settings.*`          | **none**           | Proposed — screens verified (D-R3)                      |
| 29  | `/dev/components`, `/dev/tokens`                                                                                        | `dev/`     | Development only                               | `dev.*`               | —                  | Existing, 404 in production                             |
| 30  | any unmatched path                                                                                                      | —          | Localized 404                                  | —                     | —                  | **Approved** (D-R8)                                     |

Phase 04 creates placeholders only for rows whose status is Approved, or Proposed and then
approved. Row 16 gets no route until it is resolved.

## 8. Navigation registry design

Location: `src/shared/navigation/`. It is the single source for every navigation surface in
Phase 05 and later.

### 8.1 Canonical destinations

| Order | id           | Arabic label (verbatim) | English label (D-R7, **approved**) | Icon       | Route key    | Mobile |
| ----- | ------------ | ----------------------- | ---------------------------------- | ---------- | ------------ | ------ |
| 1     | `dashboard`  | الرئيسية                | Dashboard                          | `home`     | `dashboard`  | bar    |
| 2     | `lectures`   | محاضراتي                | My Lectures                        | `book`     | `lectures`   | bar    |
| 3     | `summaries`  | الملخصات                | Summaries                          | `fileText` | `summaries`  | bar    |
| 4     | `questions`  | الأسئلة                 | Questions                          | `help`     | `questions`  | more   |
| 5     | `flashcards` | البطاقات التعليمية      | Flashcards                         | `cards`    | `flashcards` | more   |
| 6     | `notes`      | الملاحظات               | Notes                              | `note`     | `notes`      | more   |
| 7     | `favorites`  | المفضلة                 | Favorites                          | `star`     | `favorites`  | more   |
| 8     | `folders`    | المجلدات                | Folders                            | `folder`   | `folders`    | more   |

Labels live only in messages (`nav.<id>`); components never contain them.

### 8.2 Mobile bar and More sheet (D-R6, approved)

- **Mobile bar:** `dashboard`, `lectures`, `summaries` and the **More** control (المزيد, icon
  `more`). More is **not** a destination.
- **More sheet** (Handoff): the five `more` destinations, then two **extra entries**: account
  settings (route key `settings`) and plan upgrade (icon `crown`; action only, no route until the
  plan behaviour is defined).
  - The extra entries are registry data with message keys, so Phase 05 adds no list of its own.
  - Their Arabic copy is read from Figma (Mobile More Menu) at implementation time.

### 8.3 Settings secondary navigation

- `settingsNav` lists the 6 Settings screens (§7.2 rows 27–28) in Figma order, with message keys.
  The Arabic copy is read from the Figma "Settings Navigation" at implementation time.
- Phase 04 provides only the data and the reserved `settings/layout.tsx`. The UI is Phase 05 or 20.

## 9. Active destination behaviour

- **`resolveActiveDestination(pathname)`**
  - Returns `{ routeKey, destination }`, where `destination` is a `DestinationId` or `null`.
  - Input: the locale-stripped pathname from next-intl `usePathname()`, or the request pathname on
    the server.
  - Matches segments against the inventory patterns; the most specific match wins; trailing
    slashes are ignored.
  - **`routeKey` is kept for future breadcrumbs**, for example `lectures.tutor` → lectures /
    lecture details / tutor, so no second route map is needed.
- **`useActiveDestination()`:** a thin client hook.
- **Rules (D-R6, approved):**
  - Every `(app)` and `(focus)` route resolves to exactly **one** destination, except Settings.
  - **Settings returns `null`.**
  - Landing, auth, dev and unknown routes return `null`.
- **Three separate states** (implemented in Phase 05, decided now):
  1. **Active canonical destination:** the resolver result, which depends only on the URL.
  2. **More sheet open or closed:** UI state, exposed as `aria-expanded` on the More control.
     Opening it never changes (1).
  3. **"More contains the current destination":** a visual indication on the More control when
     (1) is one of the five `more` destinations. The More control **never** gets
     `aria-current="page"`. Settings (`null`) never lights it.
- Inside the More sheet, only the active destination's item gets `aria-current="page"`; the
  settings entry never does. Keyboard and screen-reader behaviour follow the Phase 03 Sheet
  (focus trap, Esc, return focus).
- **Deep link and refresh:** the result depends only on the URL, so the server render, a direct
  load and a refresh give the same state.
- **Query parameters are filter state, not routes:** for example My Lectures filters, which
  "survive refresh and back/forward" in Roadmap Phase 10. They never affect the active
  destination, and routes never encode filters as path segments.

## 10. Internationalization requirements (D-R2, approved)

- Arabic has no prefix and English uses `/en`, with **shared path segments**.
- `/ar/...` redirects. There is no detection and no cookie.
- **Typed pathnames:**
  - Every route key in §7.2 is declared in next-intl `pathnames` in `routing.ts`, with the same
    value for both locales.
  - The existing `Link`, `redirect`, `getPathname` and `useRouter` then type-check paths and
    parameters, e.g. `{ pathname: "/lectures/[lectureId]", params: { lectureId } }`.
  - There is no second routing system.
- **Development routes:** with `pathnames` enabled, typed `Link` accepts only declared paths. So
  `/dev/components` and `/dev/tokens` are declared too (still 404 in production), and the dev
  pages keep working.
- All visible strings come from messages in both locales:
  - nav labels;
  - More extras;
  - Settings nav;
  - placeholder titles;
  - "not implemented";
  - 404 and error text.
- Arabic copy is verbatim from Figma or the Handoff. Copy neither contains needs approval (D-R9).
- **Locale-aware errors:**
  - `[locale]/error.tsx` and `not-found.tsx` render in the active locale (§6).
  - `global-error.tsx` is bilingual static text.

## 11. Dependencies

- **Done:** Phase 02 (i18n, tokens, typography) and Phase 03 (primitives for placeholders and the
  404 and error pages).
- **No new packages.**
- **Phase 05** consumes the registry, the resolver, the More and Settings data and the
  `(app)`/`(focus)` layouts.
- **Phase 07** links to the auth paths fixed here.

## 12. Deferred component obligations (ADR-002)

- **Phase 04 needs none of the eight deferred primitives.**
- **O-8 Navigation Icon Button:**
  - Figma evidence: the Landing menu is its own "Menu / Button" frame, not a Navigation Icon Button
    instance. So the first known consumer is the **Phase 05 Top Bar** (notifications and other
    icon actions).
  - O-8's Figma verification and contract must be complete **before Phase 05 implementation
    starts**.
  - Phase 07 confirms whether the Landing menu button needs a component of its own.
- O-1 to O-7 remain tied to their first consuming feature.

## 13. Implementation sequence (after authorization)

1. **Approvals:** confirm the Proposed rows in §7.2 and D-R3/D-R9/D-R10 (§17).
2. **`pathnames` and route constants:** in `routing.ts`, plus unit tests for `getPathname` in both
   locales and for path uniqueness.
3. **Registry and messages:** the `nav` namespace in `ar` and `en`, with Arabic copy for the More
   extras and Settings nav read from Figma. Tests.
4. **Resolver and hook:** `resolveActiveDestination`, `useActiveDestination`, and table-driven
   tests.
5. **Route tree:**
   - route groups;
   - placeholder pages for Approved rows;
   - minimal `(app)` and `(focus)` layouts;
   - reserved `settings/layout.tsx`;
   - the existing home moved to `(public)/page.tsx` (I-1 stays open until Phase 07).
6. **Boundaries:**
   - `[locale]/not-found.tsx` and the catch-all;
   - `[locale]/error.tsx` with the namespaces it needs passed to the client;
   - `global-error.tsx`.
7. **E2E:**
   - deep links and refresh;
   - 404 in both locales;
   - the error boundary (D-R10);
   - RTL/LTR at 1440/768/390 plus 320.
8. **Checks and close:** `pnpm check`, `test:e2e`, axe, phase report, `PROGRESS.md`, PR, CI.

## 14. Testing strategy

| Area                        | Test (table-driven where possible)                                                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registry                    | Order of the 8 ids; Arabic labels equal the approved text; English labels equal D-R7; ids unique; icons exist in `ICON_MANIFEST`; mobile bar = 3 destinations + More; More sheet = 5 + settings + upgrade |
| Inventory                   | Every path unique; no two route groups resolve to the same URL; reserved words (`new`, `record`) never used as ids                                                                                        |
| Destination roots           | Each of the 8 roots resolves to its destination                                                                                                                                                           |
| Nested routes               | Lecture detail, record and tutor → `lectures`; reader → `summaries`; new and quiz → `questions`; new and deck → `flashcards`; new and editor → `notes`; folder detail → `folders`                         |
| Focus routes                | `/flashcards/[deckId]/study` → `flashcards`                                                                                                                                                               |
| Settings                    | `/settings` and all 5 sub-routes → `null`                                                                                                                                                                 |
| No shell and unknown        | Landing, auth, dev, unknown → `null`; trailing slash handled                                                                                                                                              |
| Exactly one active          | Every `(app)` and `(focus)` route except Settings → exactly one destination                                                                                                                               |
| More separation (D-R6)      | Pure helper: `more`-placement destinations → "More contains current"; Settings → none; More never `aria-current` (asserted in the Phase 05 component tests)                                               |
| Route keys                  | Every inventory path returns its expected `routeKey`                                                                                                                                                      |
| Locale links                | `getPathname` for every key: `ar` unprefixed, `en` under `/en`, parameters filled; `Link` renders the locale-correct href                                                                                 |
| Deep link and refresh (E2E) | Direct load of each placeholder in `ar` and `en`: 200, title, `lang` and `dir`; reload is identical                                                                                                       |
| 404 (E2E)                   | Unknown paths in `ar` and `en`: HTTP 404, localized page inside the root layout, link back works                                                                                                          |
| Error (E2E)                 | Boundary renders localized text and recovers (D-R10)                                                                                                                                                      |
| Universal checks            | axe; 1440/768/390 plus 320 overflow; keyboard; a test that no file outside `src/shared/navigation` and messages contains a nav label or a hardcoded app path                                              |

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
- Universal checks pass (Roadmap §4).
- Phase report written; `PROGRESS.md` updated; nothing from later phases started.

## 17. Decisions, risks and open items

| ID    | Decision                                                                                                                         | Evidence                                                                                         | Status                                                         | Remaining dependency                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| D-R1  | Short English paths: `/`, the 8 destination roots, the 4 auth paths, `/settings`; nested paths per the verified inventory (§7.2) | No source defines paths; screens verified in the Handoff and Figma (§7.1)                        | **Approved** (roots, auth, settings); nested rows **Proposed** | Approval of the Proposed rows in §7.2                                                                      |
| D-R2  | Arabic unprefixed, English `/en`, shared segments, next-intl typed `pathnames`, no second router                                 | `routing.ts`, `navigation.ts`, `proxy.ts`                                                        | **Approved**                                                   | Dev routes declared in `pathnames` (§10)                                                                   |
| D-R3  | Settings root = Profile Overview; 5 sub-routes; secondary nav data in the registry                                               | Figma page 14: 6 screens + "Settings Navigation"                                                 | Screens **Verified**; sub-paths **Proposed**                   | Approval of the sub-paths; Arabic nav copy read from Figma                                                 |
| D-R4  | No folder focus routes; `/folders/[folderId]` in `(app)`; Create Folder and Add Content are dialogs; selection is local state    | Figma page 13 frames and prototype links (§7.1)                                                  | Evidence **Verified**; decision **Proposed**                   | Acknowledge that the Roadmap's "focused folder routes" are not drawn as routes; dialogs belong to Phase 19 |
| D-R5  | Quiz, Results and Review keep the shell → `(app)`                                                                                | Figma page 09: Rail on all Tablet frames                                                         | **Verified**                                                   | —                                                                                                          |
| D-R6  | Active destination, More open state and "More contains current" are separate; More never `aria-current`; Settings → none         | Handoff navigation rules; approved by the user                                                   | **Approved**                                                   | UI in Phase 05                                                                                             |
| D-R7  | English labels: Dashboard, My Lectures, Summaries, Questions, Flashcards, Notes, Favorites, Folders                              | Product-owner-approved copy (Figma has no English nav copy)                                      | **Approved**                                                   | —                                                                                                          |
| D-R8  | Localized catch-all + `[locale]/not-found.tsx`; no experimental `global-not-found`; errors separate                              | Next 16.4 docs: `notFound()` renders the nearest `not-found`; `global-not-found` is experimental | **Approved**                                                   | Error namespace passed to the client (§6)                                                                  |
| D-R9  | Placeholder "not implemented", 404 and error copy; titles of non-nav screens from Figma frames                                   | No copy in the design                                                                            | **Proposed**                                                   | Copy approval before use                                                                                   |
| D-R10 | Error boundary tested through a development-only route that throws (404 in production)                                           | Same pattern as `/dev/*`                                                                         | **Proposed**                                                   | Approval                                                                                                   |
| D-R11 | Live Recording = new lecture at `/lectures/record`; no lecture id; My Lectures active                                            | Figma pages 04 and 06 (§7.1)                                                                     | Evidence **Verified**; path **Proposed**                       | Approval of the path                                                                                       |
| D-R12 | Landing `/` in `(public)`, Dashboard `/dashboard` in `(app)`; no auth redirects or route protection in Phase 04                  | Next 16 route-group caveat; Roadmap Phase 04 has no auth requirement; gate D-02 unresolved       | **Approved**                                                   | Redirects decided with D-02 (Phase 08 / 21)                                                                |

**Unresolved (the design does not answer; not routed in Phase 04):**

- **Quiz Results and Answer Review addressability:** no persistent result id is shown, and results
  storage is unresolved in the Handoff. It is unknown whether refresh or direct access must work.
  To be decided with Phase 15 and the backend.
- **Quiz mode in the URL:** Practice or Exam is chosen in the Mode Select dialog; whether it is a
  query parameter or in-app state is open.
- **Tutor lecture context:** how a lecture is chosen as context is unresolved in the Handoff. The
  nesting under `/lectures/[lectureId]` follows the breadcrumb.
- **Reset-password link format:** token and expiry are part of gate D-02 (Phase 08).

**Risks:**

- **Public URLs:** approve the Proposed rows before coding.
- **Next 16 build failure on duplicate group paths:** guarded by the inventory test.
- **Client translations:** `messages={null}` means the error boundary needs its namespace passed
  explicitly.
- **Phase 05 needs O-8 first:** schedule its Figma check before Phase 05 starts.
- **No auth (D-02):** placeholders stay public until Phase 21.

## 18. Team responsibilities (PROPOSED — not approved)

Ownership rules (CLAUDE.md): `src/app`, `src/shared` and `src/i18n` are owned by Yousef. No task is
assigned to Mariam and no starter package is created until the user approves the delegation.

| Role              | Responsibilities                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yousef            | Architecture ownership; final approvals (§17); integration review; PR merges                                                                                                                                                                                                                                                                                                                                                                               |
| Claude            | After authorization: routing implementation (groups, placeholders, layouts); navigation registry and resolver; next-intl `pathnames` and messages; 404, error and placeholder routes; unit and E2E tests; phase report                                                                                                                                                                                                                                     |
| Mariam — PROPOSED | (1) **Route → active-destination test table**: one delegated test file, written from the approved §7.2 inventory against a provided resolver signature. Done means: every row covered and passing against the merged resolver. (2) **English navigation copy consistency review**: a written note for the labels, More extras and Settings nav. (3) **RTL/LTR manual verification**: a checklist pass in both locales at 1440/768/390/320 with screenshots |
