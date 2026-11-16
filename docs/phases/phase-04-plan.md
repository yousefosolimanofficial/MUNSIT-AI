# Phase 04 — Routing & navigation registry — Plan

- **Status:** **Architecture approved (user, 2026-11-16). Implementation in progress** on
  `feat/phase-04-routing-navigation` (authorized 2026-11-16); evidence in the draft
  [Phase 04 closure report](phase-04-closure-report.md). **Approved** means approved by the user.
  **Deferred** and **Unresolved** items are not routed in Phase 04 (§17). The folder-route
  interpretation (§7.3) is recorded in
  [ADR-003](../decisions/ADR-003-phase-04-folder-focus-routes.md), **Approved** on 2026-11-16.
- **Baseline:** `main` at `cf96d97` (Phase 03 closed in PR #24; Tabs M-1 fix in PR #25).
- **Implementation branch:** `feat/phase-04-routing-navigation` (name set by the user's
  authorization, 2026-11-16)

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
   └─ dev/                       # development only; adds the error-test route (D-R10)
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
  - **Error-test route (D-R10, approved):**
    - A route under `dev/` that throws, so the boundary can be tested in E2E.
    - It uses the existing development-only guard, `process.env.NODE_ENV === "production"` →
      `notFound()`, the same as `/dev/components` and `/dev/tokens`, so production returns 404.
    - The production 404 is verified with `next start`.
    - The Next 16.4 `error.md` docs confirm that `error.tsx` wraps `page.tsx` in an error
      boundary, so an error thrown during the page render reaches `[locale]/error.tsx`.
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

| #   | Path                                                                                                                    | Group      | Screen                                         | Route key             | Active destination | Status                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- | --------------------- | ------------------ | --------------------------------------------------------------------- |
| 1   | `/`                                                                                                                     | `(public)` | Landing (placeholder)                          | `landing`             | —                  | **Approved**                                                          |
| 2   | `/login`                                                                                                                | `(auth)`   | Login (placeholder)                            | `auth.login`          | —                  | **Approved**                                                          |
| 3   | `/register`                                                                                                             | `(auth)`   | Register (placeholder)                         | `auth.register`       | —                  | **Approved**                                                          |
| 4   | `/forgot-password`                                                                                                      | `(auth)`   | Forgot Password (placeholder)                  | `auth.forgotPassword` | —                  | **Approved**                                                          |
| 5   | `/reset-password`                                                                                                       | `(auth)`   | Reset Password (placeholder)                   | `auth.resetPassword`  | —                  | **Approved** (link token format: D-02, Phase 08)                      |
| 6   | `/dashboard`                                                                                                            | `(app)`    | Dashboard                                      | `dashboard`           | `dashboard`        | **Approved**                                                          |
| 7   | `/lectures`                                                                                                             | `(app)`    | My Lectures                                    | `lectures`            | `lectures`         | **Approved**                                                          |
| 8   | `/lectures/[lectureId]`                                                                                                 | `(app)`    | Lecture Details                                | `lectures.detail`     | `lectures`         | **Approved**                                                          |
| 9   | `/lectures/[lectureId]/tutor`                                                                                           | `(app)`    | AI Tutor                                       | `lectures.tutor`      | `lectures`         | **Deferred** — depends on tutor lecture-context initialization (D-08) |
| 10  | `/lectures/record`                                                                                                      | `(app)`    | Live Recording (new lecture)                   | `lectures.record`     | `lectures`         | **Approved** (D-R11)                                                  |
| 11  | `/summaries`                                                                                                            | `(app)`    | My Summaries                                   | `summaries`           | `summaries`        | **Approved**                                                          |
| 12  | `/summaries/[summaryId]`                                                                                                | `(app)`    | Summary Reader                                 | `summaries.reader`    | `summaries`        | **Approved**                                                          |
| 13  | `/questions`                                                                                                            | `(app)`    | Question Bank library                          | `questions`           | `questions`        | **Approved**                                                          |
| 14  | `/questions/new`                                                                                                        | `(app)`    | Generator (its mobile steps are in-page)       | `questions.new`       | `questions`        | **Approved**                                                          |
| 15  | `/questions/[setId]/quiz`                                                                                               | `(app)`    | Quiz Taking (Practice / Exam)                  | `questions.quiz`      | `questions`        | **Approved** — base path; quiz mode in the URL unresolved (D-09)      |
| 16  | Results, Answer Review                                                                                                  | `(app)`    | Quiz Results, Answer Review                    | —                     | `questions`        | **Unresolved** — not routed in Phase 04 (D-09)                        |
| 17  | `/flashcards`                                                                                                           | `(app)`    | Flashcards library                             | `flashcards`          | `flashcards`       | **Approved**                                                          |
| 18  | `/flashcards/new`                                                                                                       | `(app)`    | Create deck                                    | `flashcards.new`      | `flashcards`       | **Approved**                                                          |
| 19  | `/flashcards/[deckId]`                                                                                                  | `(app)`    | Deck Details                                   | `flashcards.deck`     | `flashcards`       | **Approved**                                                          |
| 20  | `/flashcards/[deckId]/study`                                                                                            | `(focus)`  | Study Mode (+ Session Complete state)          | `flashcards.study`    | `flashcards`       | **Approved** (no shell)                                               |
| 21  | `/notes`                                                                                                                | `(app)`    | My Notes                                       | `notes`               | `notes`            | **Approved**                                                          |
| 22  | `/notes/new`                                                                                                            | `(app)`    | New Note editor                                | `notes.new`           | `notes`            | **Approved**                                                          |
| 23  | `/notes/[noteId]`                                                                                                       | `(app)`    | Note Editor                                    | `notes.editor`        | `notes`            | **Approved**                                                          |
| 24  | `/favorites`                                                                                                            | `(app)`    | Favorites (Management, Organization in-page)   | `favorites`           | `favorites`        | **Approved**                                                          |
| 25  | `/folders`                                                                                                              | `(app)`    | My Folders (Create Folder = dialog)            | `folders`             | `folders`          | **Approved**                                                          |
| 26  | `/folders/[folderId]`                                                                                                   | `(app)`    | Folder Details (Add Content dialog, selection) | `folders.detail`      | `folders`          | **Approved** (D-R4, §7.3)                                             |
| 27  | `/settings`                                                                                                             | `(app)`    | 01 Profile Overview                            | `settings`            | **none**           | **Approved**                                                          |
| 28  | `/settings/profile`, `/settings/preferences`, `/settings/notifications`, `/settings/security`, `/settings/subscription` | `(app)`    | Settings 02–06                                 | `settings.*`          | **none**           | **Approved** (D-R3)                                                   |
| 29  | `/dev/components`, `/dev/tokens`                                                                                        | `dev/`     | Development only                               | `dev.*`               | —                  | Existing, 404 in production                                           |
| 30  | any unmatched path                                                                                                      | —          | Localized 404                                  | —                     | —                  | **Approved** (D-R8)                                                   |

Phase 04 creates placeholders only for **Approved** rows. Rows 9 (Tutor) and 16 (Results, Answer
Review) get no route until their decisions are made (§17). No other route may be added.

### 7.3 Roadmap discrepancy: focused folder routes (D-R4)

- **Affected Roadmap requirements** (read-only, unchanged):
  - Phase 04 Scope: "Flashcards Study Mode / focused folder routes in `(focus)`".
  - §3 folder layout: "`(focus)/` # study mode / focused folder workflows".
  - The Handoff (p.8) says: "Flashcards Study Mode and focused Folder workflows may hide global
    navigation".
- **Verified Figma evidence** (§7.1):
  - "Folder Management" is the Create Folder dialog.
  - "Add Content" is a dialog inside Folder Details.
  - "Content Organization" is Folder Details in selection mode.
  - No folder screen without the global navigation is drawn as a page.
- **Interpretation (approved for Phase 04 planning, 2026-11-16):**
  - The "focused folder workflows" are these modal dialogs and the selection state. They hide
    the navigation by being modal, not by being routes.
  - Phase 04 creates **no** folder routes in `(focus)`.
  - `(focus)` holds Flashcards Study Mode only.
  - The folder dialogs and selection mode are built with the Folders module (Phase 19), using the
    Phase 03 Dialog and Sheet.
- **Rationale:**
  - Routes must match screens that exist in the design (no invented routes).
  - A modal dialog is not deep-linkable state in the design.
  - An empty `(focus)` folder route would be unused URL surface to maintain.
- **Traceability:**
  - The Roadmap text stays unchanged.
  - The formal amendment is recorded in
    [ADR-003](../decisions/ADR-003-phase-04-folder-focus-routes.md) (**Approved** 2026-11-16), following
    the ADR-002 precedent for Roadmap scope amendments.
  - If a later Figma version draws a full-screen folder workflow, it gets a `(focus)` route
    through a contract and an update to this plan.

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
  - **`routeKey` is kept for future breadcrumbs**, for example `lectures.detail` → lectures /
    lecture details (and `lectures.tutor` once routed), so no second route map is needed.
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

1. **Approvals:** done (§17; ADR-003 approved 2026-11-16). Implementation still needs the D-R9
   copy approved before use and the user's separate authorization to start Phase 04.
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

| Area                        | Test (table-driven where possible)                                                                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registry                    | Order of the 8 ids; Arabic labels equal the approved text; English labels equal D-R7; ids unique; icons exist in `ICON_MANIFEST`; mobile bar = 3 destinations + More; More sheet = 5 + settings + upgrade      |
| Inventory                   | Every path unique; no two route groups resolve to the same URL; reserved words (`new`, `record`) never used as ids                                                                                             |
| Destination roots           | Each of the 8 roots resolves to its destination                                                                                                                                                                |
| Nested routes               | Lecture detail and record → `lectures` (tutor added when row 9 is decided); reader → `summaries`; new and quiz → `questions`; new and deck → `flashcards`; new and editor → `notes`; folder detail → `folders` |
| Focus routes                | `/flashcards/[deckId]/study` → `flashcards`                                                                                                                                                                    |
| Settings                    | `/settings` and all 5 sub-routes → `null`                                                                                                                                                                      |
| No shell and unknown        | Landing, auth, dev, unknown → `null`; trailing slash handled                                                                                                                                                   |
| Exactly one active          | Every `(app)` and `(focus)` route except Settings → exactly one destination                                                                                                                                    |
| More separation (D-R6)      | Pure helper: `more`-placement destinations → "More contains current"; Settings → none; More never `aria-current` (asserted in the Phase 05 component tests)                                                    |
| Route keys                  | Every inventory path returns its expected `routeKey`                                                                                                                                                           |
| Locale links                | `getPathname` for every key: `ar` unprefixed, `en` under `/en`, parameters filled; `Link` renders the locale-correct href                                                                                      |
| Deep link and refresh (E2E) | Direct load of each placeholder in `ar` and `en`: 200, title, `lang` and `dir`; reload is identical                                                                                                            |
| 404 (E2E)                   | Unknown paths in `ar` and `en`: HTTP 404, localized page inside the root layout, link back works                                                                                                               |
| Error (E2E)                 | Boundary renders localized text and recovers (D-R10)                                                                                                                                                           |
| Universal checks            | axe; 1440/768/390 plus 320 overflow; keyboard; a test that no file outside `src/shared/navigation` and messages contains a nav label or a hardcoded app path                                                   |

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

| ID    | Decision                                                                                                                      | Evidence                                                                                         | Status                              | Remaining dependency                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| D-R1  | Short English paths: `/`, the 8 destination roots, the 4 auth paths, `/settings`, and the Figma-supported nested paths (§7.2) | No source defines paths; screens and workflows verified in the Handoff and Figma (§7.1)          | **Approved** (except rows 9 and 16) | —                                                            |
| D-R2  | Arabic unprefixed, English `/en`, shared segments, next-intl typed `pathnames`, no second router                              | `routing.ts`, `navigation.ts`, `proxy.ts`                                                        | **Approved**                        | Dev routes declared in `pathnames` (§10)                     |
| D-R3  | Settings = Profile Overview + 5 secondary screens; secondary-nav data in the registry                                         | Figma page 14: 6 screens + "Settings Navigation"                                                 | **Approved**                        | Arabic nav copy read from Figma at implementation            |
| D-R4  | No folder focus routes; `/folders/[folderId]` in `(app)`; Create Folder and Add Content are dialogs; selection is local state | Figma page 13 frames and prototype links (§7.1); Roadmap discrepancy (§7.3)                      | **Approved** (ADR-003, 2026-11-16)  | Folder dialogs and selection state built in Phase 19         |
| D-R5  | Quiz Taking (and Results and Review, when routed) keep the shell → `(app)`                                                    | Figma page 09: Rail on all Tablet frames                                                         | **Approved**                        | —                                                            |
| D-R6  | Active destination, More open state and "More contains current" are separate; More never `aria-current`; Settings → none      | Handoff navigation rules; approved by the user                                                   | **Approved**                        | UI in Phase 05                                               |
| D-R7  | English labels: Dashboard, My Lectures, Summaries, Questions, Flashcards, Notes, Favorites, Folders                           | Product-owner-approved copy (Figma has no English nav copy)                                      | **Approved**                        | —                                                            |
| D-R8  | Localized catch-all + `[locale]/not-found.tsx`; no experimental `global-not-found`; errors separate                           | Next 16.4 docs: `notFound()` renders the nearest `not-found`; `global-not-found` is experimental | **Approved**                        | Error namespace passed to the client (§6)                    |
| D-R9  | Concise bilingual placeholder ("not implemented"), 404 and error messages; non-nav screen titles from Figma frame names       | No copy in the design                                                                            | **Approved** (approach)             | Exact strings reviewed before merge of the implementation PR |
| D-R10 | Development-only error-test route under `dev/`, 404 in production                                                             | Existing `/dev/*` production guard; Next 16.4 `error.md`                                         | **Approved**                        | Production 404 verified with `next start`                    |
| D-R11 | Live Recording starts a new lecture at `/lectures/record`; no lecture id; My Lectures active                                  | Figma pages 04 and 06 (§7.1)                                                                     | **Approved**                        | —                                                            |
| D-R12 | Landing `/` in `(public)`, Dashboard `/dashboard` in `(app)`; no auth redirects or route protection in Phase 04               | Next 16 route-group caveat; Roadmap Phase 04 has no auth requirement; gate D-02 unresolved       | **Approved**                        | Redirects decided with D-02 (Phase 08 / 21)                  |

**Unresolved (the design does not answer; not routed in Phase 04; no answer invented):**

| Item                                                                             | Future owner (Roadmap gate)                  | Phase | Dependency                                           |
| -------------------------------------------------------------------------------- | -------------------------------------------- | ----- | ---------------------------------------------------- |
| Question Bank Results persistence (persistent result id, refresh, direct access) | Product + Backend (D-09 "result storage")    | 15    | Backend contract (Phase 21)                          |
| Answer Review deep-link behaviour (needs a saved attempt?)                       | Product + Backend (D-09)                     | 15    | Results persistence                                  |
| Quiz mode (Practice / Exam) in the URL: query parameter or in-app state          | Frontend, after D-09                         | 15    | Mode Select dialog flow; whether attempts are stored |
| AI Tutor lecture-context initialization (and so `/lectures/[lectureId]/tutor`)   | Backend/AI (D-08 "lecture context")          | 13    | Tutor API contract (Phase 21)                        |
| Reset-password token / link format                                               | Product + Backend (D-02 "password recovery") | 08    | Auth provider choice (Phase 21)                      |

**Risks:**

- **Public URLs:** only Approved rows are built. Deferred rows need a decision before routing.
- **Next 16 build failure on duplicate group paths:** guarded by the inventory test.
- **Client translations:** `messages={null}` means the error boundary needs its namespace passed
  explicitly.
- **Phase 05 needs O-8 first:** schedule its Figma check before Phase 05 starts.
- **No auth (D-02):** placeholders stay public until Phase 21.

## 18. Team responsibilities (boundaries approved for planning, 2026-11-16)

Ownership rules (CLAUDE.md): `src/app`, `src/shared` and `src/i18n` are owned by Yousef.

| Role   | Responsibilities                                                                                                                                                                                                                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yousef | Product ownership; architecture approval; final integration and merge decisions                                                                                                                                                                                                                                                   |
| Claude | After authorization: routing implementation; navigation registry; internationalization integration (`pathnames`, messages); error and placeholder routing; automated unit and E2E tests                                                                                                                                           |
| Mariam | (1) Route-to-active-destination test tables (one delegated test file, written from §7.2 against a provided resolver signature; done when every Approved row is covered and passing). (2) English label consistency review (a written note). (3) Manual RTL/LTR verification (checklist pass at 1440/768/390/320 with screenshots) |

**Mariam's work is not started.** Her starter package and exact handoff (files, signature,
checklist) must be reviewed and approved by the user before any delegation, per
`TEAM_COLLABORATION.md`.

## 19. Implementation evidence (2026-11-16, draft)

Implemented as planned. Details, test counts, the copy table and known limitations are in the draft
[Phase 04 closure report](phase-04-closure-report.md). Deviations from the plan text:

- **Route constants location:** they live in `src/i18n/routes.ts`, a leaf module, so that both
  `src/i18n/routing.ts` (`pathnames`) and `src/shared/navigation` can import them without a cycle.
  The registry and resolver are in `src/shared/navigation/` as planned.
- **Error boundary prop:** Next.js 16.4 passes `retry` (not `reset`) to `error.tsx` and
  `global-error.tsx`; the implementation follows the installed docs.
- **Production 404 first response:** a Next.js behaviour under a top-level dynamic root layout
  (report §7.1). The localized page renders on hydration. The experimental `global-not-found` stays
  excluded (D-R8).
