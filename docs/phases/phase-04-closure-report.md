# Phase 04 — Routing & navigation registry — Closure Report

- **Status:** **DRAFT — for review. Phase 04 is not closed.** The common copy is approved and
  applied (§8.1). Phase 04 closes only after review, a decision on the screen titles and English
  navigation copy still marked "Requires approval" (§8.2, §8.3), and the merge of the
  implementation PR.
- **Branch:** `feat/phase-04-routing-navigation`, from `main` at `de697cf` (PR #26).
- **Plan:** [phase-04-plan.md](phase-04-plan.md); decisions D-R1 to D-R12;
  [ADR-003](../decisions/ADR-003-phase-04-folder-focus-routes.md) (Approved).

## 1. Summary

Phase 04 delivers one centralized route map and one navigation registry, as the Roadmap asks:

- Every approved route is defined once in `src/i18n/routes.ts` and declared as typed next-intl
  `pathnames`. Arabic URLs have no prefix and English URLs are under `/en`.
- `src/shared/navigation/` holds:
  - the registry: 8 destinations, mobile bar, More sheet, Settings navigation;
  - the pure active-destination resolver and its client hook.
- 30 placeholder routes are built in the four route groups.
- Unknown and deferred URLs get a localized 404; route errors get a localized boundary; there is a
  global fallback.
- No visible navigation UI is built (that is Phase 05).

## 2. Scope delivered

| Area                    | Files                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route constants         | `src/i18n/routes.ts` (`ROUTES`, `RouteKey`, `PATHNAMES`); `src/i18n/routing.ts` (+ `pathnames`)                                                               |
| Messages                | `src/i18n/messages/{ar,en}/nav.json`, `pages.json`, `errors.json` (registered in `messages/index.ts`); `dev.json` + `errorTest` fixture                       |
| Registry and resolution | `src/shared/navigation/nav-registry.ts`, `resolve-active-destination.ts`, `use-active-destination.ts`, `route-titles.ts`                                      |
| Route tree              | `src/app/[locale]/(public)`, `(auth)`, `(app)`, `(focus)`; group layouts; reserved `(app)/settings/layout.tsx`; old `[locale]/page.tsx` → `(public)/page.tsx` |
| Boundaries              | `[locale]/[...rest]/page.tsx`, `[locale]/not-found.tsx`, `[locale]/error.tsx`, `src/app/global-error.tsx`, dev-only `[locale]/dev/error-test/`                |
| Placeholder             | `[locale]/_components/RoutePlaceholder.tsx`, `ActiveDestinationProbe.tsx` (temporary)                                                                         |
| Layout                  | `[locale]/layout.tsx`: title template `%s · MUNSIT AI`; only the `errors` namespace is passed to the client                                                   |
| Tests                   | `src/i18n/routes.test.ts`, `src/shared/navigation/*.test.ts`, `tests/e2e/routing.spec.ts`, `tests/e2e/global-setup.ts` (warm-up of all routes)                |
| Tooling                 | `vitest.config.ts`: `server.deps.inline: ["next-intl"]`, so next-intl navigation resolves in unit tests                                                       |

## 3. Implemented route inventory

All paths are the same in both locales; English adds `/en`.

| Group      | Routes                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(public)` | `/`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `(auth)`   | `/login`, `/register`, `/forgot-password`, `/reset-password`                                                                                                                                                                                                                                                                                                                                                              |
| `(app)`    | `/dashboard`; `/lectures`, `/lectures/[lectureId]`, `/lectures/record`; `/summaries`, `/summaries/[summaryId]`; `/questions`, `/questions/new`, `/questions/[setId]/quiz`; `/flashcards`, `/flashcards/new`, `/flashcards/[deckId]`; `/notes`, `/notes/new`, `/notes/[noteId]`; `/favorites`; `/folders`, `/folders/[folderId]`; `/settings` + `/profile`, `/preferences`, `/notifications`, `/security`, `/subscription` |
| `(focus)`  | `/flashcards/[deckId]/study`                                                                                                                                                                                                                                                                                                                                                                                              |
| `dev/`     | `/dev/components`, `/dev/tokens` (existing), `/dev/error-test` (new); all 404 in production                                                                                                                                                                                                                                                                                                                               |
| Other      | Any unmatched path → localized 404 (catch-all)                                                                                                                                                                                                                                                                                                                                                                            |

- **Not created (deferred or unresolved):**
  - AI Tutor (D-08);
  - Quiz Results and Answer Review (D-09);
  - focused-folder routes (ADR-003).
- These URLs return 404 today. The tests assert this.

## 4. Registry and active destination

- **Destinations:**
  - Order and Arabic labels are verbatim; English labels are approved (D-R7).
  - Icons are verified: `home`, `book`, `fileText`, `help`, `cards`, `note`, `star`, `folder`.
  - Each destination has its root route and its mobile placement.
- **Mobile bar:** Dashboard, My Lectures and Summaries, plus the **More** control (not a
  destination).
- **More sheet:** the 5 remaining destinations, plus "إعدادات الحساب" (`settings`) and "ترقية
  الخطة" (no route, gate D-18).
- **Settings navigation:** 6 items in Figma order.
  - "الملف الشخصي" is current on `/settings` and `/settings/profile`.
  - "إدارة الحساب" has no route: Figma shows no screen for it. Unresolved; nothing invented.
- **`resolveActiveDestination(pathname)`** returns `{ routeKey, destination }`.
  - The most specific route wins (static segments beat dynamic ones).
  - It ignores a locale prefix, query, hash and trailing slash, and accepts next-intl's internal
    templates.
  - Settings, Landing, Auth, dev and unknown routes give no destination.
  - `routeKey` is kept for breadcrumbs.
- **`mobileBarIndicator()`** (D-R6) gives:
  - a bar destination → its own tab;
  - a More-sheet destination → More, as a visual indication only;
  - no destination → nothing, so Settings never lights More.
- **`useActiveDestination()`** is a thin client hook over next-intl `usePathname()`.

## 5. Test and QA evidence (local, this branch)

| Run (quality review, 2026-11-16)      | Result                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript (`tsc --noEmit`)           | **Pass**                                                                                                                                                                                         |
| ESLint + dependency-cruiser           | **Pass**; no dependency violations (139 modules)                                                                                                                                                 |
| Prettier                              | **Pass**                                                                                                                                                                                         |
| Vitest                                | **907/907** (697 before Phase 04, **+210**)                                                                                                                                                      |
| Production build                      | **Pass**                                                                                                                                                                                         |
| `corepack pnpm test:e2e` (full suite) | **382/382** (250 before Phase 04, **+132** in `routing.spec.ts`), including axe, keyboard and 1440/768/390/320                                                                                   |
| Production (`next start`)             | 71/71 status checks (60 placeholder URLs → 200; 6 dev URLs → 404; 5 unknown or deferred → 404); probe markup on **0** production pages; the hydrated 404 has a localized title, `lang` and `dir` |
| CI                                    | See the implementation PR                                                                                                                                                                        |

**Local note:** a throw-away experiment folder from the 404 investigation (`.tmp-next-probe/`,
untracked, never committed) could not be deleted by the agent's safety check. Locally, ESLint and
Prettier were therefore run with that folder excluded on the command line, without changing any
configuration. CI runs on a clean checkout.

**What the tests cover:**

- **Route inventory:** equals the approved list exactly; every path unique; deferred routes
  absent; reserved segments; parameter naming; `pathnames` identical per locale.
- **Locale links:** `getPathname` for every static route and every dynamic route, in both locales,
  including Arabic id encoding.
- **Registry:** order, Arabic and English labels, icons in the manifest, mobile bar, More sheet,
  Settings navigation, every label key present in both locales.
- **Resolver:** one table row per approved route, in Arabic and English and as an internal
  template; exactly one destination for each of the 19 `(app)`/`(focus)` routes; Settings, Landing
  and Auth give none; static beats dynamic; unknown and deferred paths; query, hash, slash and
  encoding; locale stripping; the mobile bar indicator.
- **Placeholder titles:** every route has a title in both locales; destination roots reuse nav
  labels; no orphan copy.
- **DoD guard:** no source file outside the registry, routes and messages contains a nav label or
  an app path.
- **E2E, per placeholder route and locale:**
  - deep link → 200, `lang`/`dir`, heading, "not implemented", document title, route key;
  - client-side active destination through `useActiveDestination`;
  - refresh.
- **E2E, other:**
  - 6 unknown or deferred URLs per locale → HTTP 404 with the localized not-found page;
  - keyboard reach and focus ring of the 404 link, and Enter opens the home page;
  - the error boundary: localized, keyboard retry recovers;
  - axe;
  - 1440/768/390/320 with no overflow.

## 6. Accessibility

- **axe** (WCAG 2.0/2.1/2.2 A and AA): no violations on 6 placeholder routes and the 404, in both
  locales. The whole-page scans in `a11y.spec.ts` still pass.
- **Keyboard:**
  - Placeholders have no interactive elements.
  - The 404 link is reachable with Tab, shows the D-B2 focus ring and works with Enter.
  - The error page's retry `Button` is focusable and works with Enter.
- **Semantics:**
  - Each page has one `h1` inside a labelled `section` (Card).
  - The error text is in a `role="alert"` wrapper; the Card itself stays static by contract.
- **RTL/LTR:** `lang` and `dir` follow the URL on every route, the 404 and the error boundary.
- **Page titles (WCAG 2.4.2):**
  - Every placeholder has "‹screen› · MUNSIT AI".
  - The 404 sets "الصفحة غير موجودة · MUNSIT AI" / "Page not found · MUNSIT AI" itself (§7.1).
  - E2E asserts both.

## 7. Known limitations and the initial 404 rendering investigation

### 7.1 Initial 404 rendering (investigated 2026-11-16)

| Aspect                         | Finding                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HTTP status                    | **404** for every unknown or deferred path, in both locales (production and dev)                                                                                                                                                                                                                                                                                                                                         |
| Initial server HTML            | Next's error document, `<html id="__next_error__">`, with an **empty body**. The localized not-found page is in the streamed RSC payload                                                                                                                                                                                                                                                                                 |
| Client rendering               | On hydration the localized page renders inside the locale layout, with `lang`/`dir` correct, heading and copy correct (production browser check, both locales)                                                                                                                                                                                                                                                           |
| JavaScript disabled            | **Blank page** (HTTP 404, empty body)                                                                                                                                                                                                                                                                                                                                                                                    |
| Document title                 | Segment metadata is not applied on this path. **Fixed within the architecture:** the 404 now renders React's `<title>` ("الصفحة غير موجودة · MUNSIT AI" / "Page not found · MUNSIT AI"), which React hoists into `<head>` after hydration; E2E asserts it                                                                                                                                                                |
| Accessibility                  | With JavaScript (the supported case): axe passes on the hydrated 404, keyboard works, and the title is now descriptive (WCAG 2.4.2). Without JavaScript there is no content                                                                                                                                                                                                                                              |
| SEO                            | Negligible: the status is a correct 404 and Next adds `noindex` to 404 responses; the empty body does not matter for search engines                                                                                                                                                                                                                                                                                      |
| Next.js 16.4 route handling    | The error document is used when a not-found escapes server rendering of the HTML (`app-render.js`, "errorRecovery"). It is a **framework behaviour**, reproduced in a **minimal standard Next 16.4.6 app** (conventional `app/layout`, `app/[...rest]` calling `notFound()`): same empty `__next_error__` document. An unmatched URL **without** a catch-all is served from the prerendered `/_not-found` with full HTML |
| Interaction with locale layout | Not the cause. Experiments ruled out next-intl (static 404, explicit locale), `generateStaticParams`, the boundary position (a nested `not-found.tsx` behaves the same), the next-intl proxy (bypassed path behaves the same) and the layout content (a bare `<html><body>` layout behaves the same)                                                                                                                     |
| Compatibility with D-R8        | D-R8 (catch-all + localized `not-found.tsx`, no experimental API) is implemented as approved; the first-response behaviour is inherent to `notFound()` in Next 16.4.6, not to D-R8                                                                                                                                                                                                                                       |

**Can it be fixed within the approved architecture?** Only the title could be, and it was. Full
server-rendered 404 HTML needs an architectural change. These options need a decision and are
**not implemented**:

1. **Accept (current; recommended for Phase 04):** correct 404 status, localized content after
   hydration, descriptive title. Blank without JavaScript.
2. **Proxy rewrite to a static localized 404 route (stable APIs):**
   - `proxy.ts` checks the path against `ROUTES` (the resolver) and rewrites unknown paths, with
     status 404, to a prerendered `/[locale]/…` 404 page.
   - That gives full HTML, `lang`/`dir` and metadata.
   - Cost: it amends D-R8, adds route matching to the proxy, and only covers unknown _paths_:
     future `notFound()` calls from pages (for example an unknown lecture id) would still behave as
     today.
3. **`global-not-found.js` (experimental):** bypasses the layout, needs the locale from request
   headers (dynamic), and is excluded by D-R8 unless the user approves it.
4. **Track upstream:** re-check on Next.js upgrades.

### 7.2 Other limitations

1. **`ActiveDestinationProbe`:** test instrumentation, rendered **only outside production builds**
   and `hidden` (§7.4). It is removed with the placeholders in Phase 05.
2. **"إدارة الحساب"** (Settings navigation) has no route until its target is decided.
3. **Chromium only;** the cross-browser pass is Phase 22.

### 7.3 Test infrastructure review

| Change                                                  | Review                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vitest.config.ts`: `server.deps.inline: ["next-intl"]` | Module resolution only (next-intl imports `next/navigation` without an extension). No assertion, include or exclude rule changed; the full unit suite runs                                                                                                                                             |
| `tests/e2e/global-setup.ts`: warm-up of every route     | Requests each route once, sequentially, before the workers start, against the **dev server only**. It **fails the run** if a route does not answer as expected (200, or 404 for the two unknown paths), so it surfaces failures and hides nothing. Production is verified separately with `next start` |
| 404 suites (`notFoundTest`)                             | Plain Playwright with a strict console check: the **only** allowed message is the exact browser string "Failed to load resource: the server responded with a status of 404 (Not Found)", which any 404 document produces. Every other console error, page error or hydration warning fails             |
| Error-boundary suite                                    | Allows only console messages containing the intentional error text "MUNSIT dev error-test: intentional render error"; any other error fails                                                                                                                                                            |
| Existing tests                                          | No existing spec or unit test was modified, skipped or loosened (only `global-setup.ts` changed among existing E2E files); no `.only`, `.skip` or `fixme` anywhere                                                                                                                                     |
| Dev-only behaviour                                      | `/dev/error-test` and the probe are absent in production (`next start`: 404 and no probe markup)                                                                                                                                                                                                       |

### 7.4 Temporary instrumentation review

- **Accessibility tree:** none. The probe is `<span hidden>`; E2E asserts it is hidden.
- **Production markup:** none. It renders only when `NODE_ENV !== "production"` (verified with
  `next start`).
- **Coupling:** limited to one test-only component that reads the public hook
  `useActiveDestination`.
- **Why it is needed:** Phase 04 has no public, observable navigation yet. The probe is the only
  way to prove in a real browser that next-intl's client `usePathname()` output (an internal
  template under typed `pathnames`) resolves correctly on deep links and refreshes. The pure
  resolver is also unit-tested.
- **Lifetime:** it is removed when the Phase 05 shell consumes the hook. No Phase 05 UI was added
  for testing.

## 8. Bilingual copy

### 8.1 Approved common copy (product owner, 2026-11-16) — applied

| Key                                            | Arabic                                              | English                                                      |
| ---------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| `pages.notImplemented`                         | هذه الصفحة قيد التطوير.                             | This page is under development.                              |
| `errors.notFound.title`                        | الصفحة غير موجودة                                   | Page not found                                               |
| `errors.notFound.body`                         | عذرًا، لم نتمكن من العثور على الصفحة المطلوبة.       | Sorry, we couldn't find the page you're looking for.         |
| `errors.notFound.backHome`                     | العودة للرئيسية                                     | Back to home                                                 |
| `errors.error.title`                           | حدث خطأ غير متوقع                                   | Something went wrong                                         |
| `errors.error.body`                            | حدث خطأ أثناء تحميل الصفحة. يُرجى المحاولة مرة أخرى. | An error occurred while loading this page. Please try again. |
| `errors.error.retry`                           | إعادة المحاولة                                      | Try again                                                    |
| `global-error` (static, same approved strings) | حدث خطأ غير متوقع · إعادة المحاولة                  | Something went wrong · Try again                             |

### 8.2 Screen titles — complete table

Status meanings:

- **Verified (Figma/Handoff):** copied verbatim.
- **Approved:** product-owner-approved copy.
- **Requires approval:** proposed wording, used provisionally.

| Route                        | Arabic title            | Arabic status                                       | English title           | English status    |
| ---------------------------- | ----------------------- | --------------------------------------------------- | ----------------------- | ----------------- |
| `/`                          | MUNSIT AI               | Approved (brand, Phase 02)                          | MUNSIT AI               | Approved (brand)  |
| `/dashboard`                 | الرئيسية                | Verified (Handoff registry)                         | Dashboard               | Approved (D-R7)   |
| `/lectures`                  | محاضراتي                | Verified (Handoff registry)                         | My Lectures             | Approved (D-R7)   |
| `/summaries`                 | الملخصات                | Verified (Handoff registry)                         | Summaries               | Approved (D-R7)   |
| `/questions`                 | الأسئلة                 | Verified (Handoff registry)                         | Questions               | Approved (D-R7)   |
| `/flashcards`                | البطاقات التعليمية      | Verified (Handoff registry)                         | Flashcards              | Approved (D-R7)   |
| `/notes`                     | الملاحظات               | Verified (Handoff registry)                         | Notes                   | Approved (D-R7)   |
| `/favorites`                 | المفضلة                 | Verified (Handoff registry)                         | Favorites               | Approved (D-R7)   |
| `/folders`                   | المجلدات                | Verified (Handoff registry)                         | Folders                 | Approved (D-R7)   |
| `/lectures/record`           | تسجيل محاضرة جديدة      | Verified (Figma page 06 title)                      | Record a new lecture    | Requires approval |
| `/questions/new`             | أنشئ اختبارك الذكي      | Verified (Figma page 09 heading)                    | Create your smart quiz  | Requires approval |
| `/flashcards/new`            | إنشاء بطاقات تعليمية    | Verified (Figma page 11 heading)                    | Create flashcards       | Requires approval |
| `/flashcards/[deckId]`       | تفاصيل البطاقات         | Verified (Figma page 11 heading)                    | Deck details            | Requires approval |
| `/settings`                  | حسابي وإعداداتي         | Verified (Figma page 14 heading)                    | My account and settings | Requires approval |
| `/settings/profile`          | تعديل الملف الشخصي      | Verified (Figma page 14 heading)                    | Edit profile            | Requires approval |
| `/settings/preferences`      | تفضيلات الدراسة         | Verified (Figma page 14 heading)                    | Study preferences       | Requires approval |
| `/settings/notifications`    | الإشعارات               | Verified (Figma page 14 heading)                    | Notifications           | Requires approval |
| `/settings/security`         | الأمان والخصوصية        | Verified (Figma page 14 heading)                    | Security & privacy      | Requires approval |
| `/settings/subscription`     | اشتراكي                 | Verified (Figma page 14 heading)                    | My subscription         | Requires approval |
| `/summaries/[summaryId]`     | قراءة الملخص            | Requires approval (Figma action label, not a title) | Read summary            | Requires approval |
| `/lectures/[lectureId]`      | تفاصيل المحاضرة         | Requires approval                                   | Lecture details         | Requires approval |
| `/questions/[setId]/quiz`    | الاختبار                | Requires approval                                   | Quiz                    | Requires approval |
| `/flashcards/[deckId]/study` | وضع المذاكرة            | Requires approval                                   | Study mode              | Requires approval |
| `/notes/new`                 | ملاحظة جديدة            | Requires approval                                   | New note                | Requires approval |
| `/notes/[noteId]`            | تعديل الملاحظة          | Requires approval                                   | Edit note               | Requires approval |
| `/folders/[folderId]`        | تفاصيل المجلد           | Requires approval                                   | Folder details          | Requires approval |
| `/login`                     | تسجيل الدخول            | Requires approval (Figma heading is a greeting)     | Log in                  | Requires approval |
| `/register`                  | إنشاء حساب              | Requires approval (Figma heading is a greeting)     | Create account          | Requires approval |
| `/forgot-password`           | نسيت كلمة المرور        | Requires approval (Figma heading is a greeting)     | Forgot password         | Requires approval |
| `/reset-password`            | إعادة تعيين كلمة المرور | Requires approval (Figma heading is a greeting)     | Reset password          | Requires approval |

### 8.3 Other navigation copy

| Key                              | Arabic                                                                                  | Arabic status                        | English                                                                                              | English status    |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------- |
| `nav.more`                       | المزيد                                                                                  | Verified (Figma Mobile More Menu)    | More                                                                                                 | Requires approval |
| `nav.moreExtras.accountSettings` | إعدادات الحساب                                                                          | Verified (Figma Mobile More Menu)    | Account settings                                                                                     | Requires approval |
| `nav.moreExtras.upgradePlan`     | ترقية الخطة                                                                             | Verified (Figma Mobile More Menu)    | Upgrade plan                                                                                         | Requires approval |
| `nav.settingsNav.*`              | الملف الشخصي · تفضيلات الدراسة · الإشعارات · الأمان والخصوصية · الاشتراك · إدارة الحساب | Verified (Figma Settings Navigation) | Profile · Study preferences · Notifications · Security & privacy · Subscription · Account management | Requires approval |

The rows marked "Requires approval" are used provisionally. They are listed for the product
owner's decision and are not treated as approved.

## 9. Deferred dependencies (unchanged, nothing invented)

- **Tutor lecture context:** D-08, Phase 13. This is why there is no Tutor route.
- **Quiz Results persistence and Answer Review deep links:** D-09, Phase 15.
- **Quiz mode in the URL:** frontend, after D-09.
- **Reset-password link format:** D-02, Phase 08.
- **Settings "إدارة الحساب" target:** open, with Settings (Phase 20).
- **Deferred primitives (ADR-002):** none used.
- **O-8 Navigation Icon Button:** Figma check and contract needed **before Phase 05 starts**.

## 10. Acceptance (Roadmap Phase 04)

| #   | Criterion                                                                                               | Status       | Evidence                                                                     |
| --- | ------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------- |
| 1   | Registry order: الرئيسية، محاضراتي، الملخصات، الأسئلة، البطاقات التعليمية، الملاحظات، المفضلة، المجلدات | PASS (local) | `nav-registry.test.ts`                                                       |
| 2   | Exactly one Active item per route, except Settings (none)                                               | PASS (local) | `resolve-active-destination.test.ts` (19 routes; Settings → none); E2E probe |
| 3   | Mobile bar: الرئيسية، محاضراتي، الملخصات، المزيد                                                        | PASS (local) | `nav-registry.test.ts`                                                       |
| 4   | Deep link and refresh preserve the Active state                                                         | PASS (local) | E2E: direct load + reload on every placeholder route, both locales           |
| 5   | Table-driven route → active tests (nested, focus); link-locale tests                                    | PASS (local) | Resolver table; `routes.test.ts` (`getPathname`)                             |
| 6   | Deliverables: registry, hook, route constants, typed link helper, placeholders saying "not implemented" | PASS (local) | §2                                                                           |
| DoD | No component hardcodes a nav label or path                                                              | PASS (local) | DoD guard test                                                               |

Phase 04 closes only after CI on the PR, review, the remaining title and copy decisions (§8.2, §8.3) and merge.

## 11. Proposed Mariam delegation (not started; needs approval of the starter and handoff)

Each task can be done offline from a starter package and checked independently:

1. **Resolver test table extension:** add cases (extra ids, Arabic ids, edge paths) to
   `src/shared/navigation/resolve-active-destination.test.ts` against the merged resolver.
   - Done means `corepack pnpm test` passes and every approved route stays covered.
   - Delegated file: that test file only.
2. **English copy consistency review:** check the English labels and the titles marked "Requires
   approval" (§8.2, §8.3) for tone and consistency. Output: a written note, with no code.
3. **Manual RTL/LTR verification:** a checklist pass over all placeholder routes and the 404 in
   both locales at 1440/768/390/320, with screenshots. Output: a checklist and images.
