# Phase 04 — Routing & navigation registry — Closure Report

- **Status:** **CLOSED** (2026-11-16). The product owner authorized the merge; PR #27 was
  squash-merged into `main` as `9888e088470e7d6a0c59f3ae6df18953bc2e29f2`, and post-merge CI on
  `main` completed successfully. All product copy is approved (§8). **Risk R-2 stays OPEN**
  (§7.1): accepted for development only, with a mandatory gate before production launch, no
  later than Phase 22.
- **Merge:** PR #27 (`feat: implement Phase 04 routing and navigation registry`), squash commit
  `9888e08` on `main` (68 files; no dependency changes; Roadmap, Phase 03 records and ADRs
  unchanged).
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

**Experiment cleanup:** the throw-away folder `.tmp-next-probe/` (three minimal Next.js apps,
logs and build output, used only to reproduce the 404 behaviour, §7.1) was verified as untracked,
unreferenced and free of project files, then removed on 2026-11-16. Before that, local ESLint and
Prettier runs excluded it on the command line; after the removal, the unmodified
`corepack pnpm check` passes. The working tree has no untracked experiment files.

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

**Can it be fixed within the approved architecture?** Only the title could be, and it was. No
stable, non-experimental change keeps D-R8, because `notFound()` itself produces the empty first
response in Next.js 16.4.6.

#### Risk R-2 — accepted temporarily (product owner, 2026-11-16)

The current D-R8 architecture is retained for Phase 04. The blank initial HTML and the blank
no-JavaScript 404 are accepted as a **temporary development-stage limitation, not as acceptable
production behaviour**. The application does **not** support server-rendered or no-JavaScript 404
pages today.

- **Observed behaviour:**
  - Unknown and deferred URLs answer **HTTP 404** in both locales.
  - The first HTML is Next's error document (`<html id="__next_error__">`) with an **empty body**.
  - With JavaScript, the localized not-found page renders on hydration, with correct `lang`/`dir`,
    copy, link back and title.
  - Without JavaScript, the page stays **blank**: no message, no link, no descriptive title.
- **Affected users and scenarios:**
  - Visitors with JavaScript disabled or blocked.
  - Visitors whose JavaScript fails to load (network errors, content blockers, old browsers).
  - Crawlers and link previews that do not execute JavaScript.
  - It applies to every unknown or deferred URL. In future phases it also applies to `notFound()`
    calls from pages (for example an unknown lecture id).
  - Every other route is fully server-rendered.
- **Accessibility:**
  - With JavaScript (the supported case): axe passes, keyboard works, and the title is descriptive
    (WCAG 2.4.2).
  - Without JavaScript or when hydration fails: no content, no explanation and no way back. This is
    a functional dead end.
- **SEO:** low impact. The status is a correct 404, and Next.js adds `noindex`. Crawlers that do not
  run JavaScript see an empty document, but there is nothing to index on a 404.
- **Test evidence:**
  - `tests/e2e/routing.spec.ts` asserts HTTP 404, the hydrated `lang`/`dir`, heading, title, keyboard
    reach, axe and 4 viewports for 6 unknown or deferred URLs per locale.
  - Production `next start` checks confirm the 404 status and the hydrated content.
  - The minimal Next.js 16.4.6 reproduction (above) shows that the cause is the framework.
- **Architectural alternatives** (not implemented, each needs a decision):
  1. **Proxy rewrite to a static localized 404 page (stable APIs):** full HTML and metadata for
     unknown paths.
     - It amends D-R8.
     - It adds route matching to `proxy.ts` (against `ROUTES`).
     - It does not cover `notFound()` calls from pages.
  2. **`global-not-found.js` (experimental):** bypasses the layout and needs the locale from request
     headers. Excluded by D-R8 unless approved.
  3. **Upstream fix:** a later Next.js version may render `notFound()` server-side under this layout.
- **Review trigger:** re-test at the **next Next.js upgrade** (minor or major). Use the 404 checks in
  `routing.spec.ts` and a `curl` of a production 404 (the body must contain the localized heading).
- **Mandatory gate:** before production launch, and **no later than Phase 22**, the risk must be
  either **resolved** (one of the alternatives, or an upstream fix) or **explicitly re-accepted by
  the product owner** as a production risk. It must not be closed silently.

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

**Approval (product owner, 2026-11-16):** all 30 previously pending items are approved as listed,
with one modification: `/summaries/[summaryId]` is **الملخص / Summary** (instead of the earlier
proposal "قراءة الملخص / Read summary", which was a Figma action label, not a title).

Status meanings:

- **Verified (Figma/Handoff):** copied verbatim.
- **Approved:** product-owner-approved copy.

| Route                        | Arabic title            | Arabic status                                     | English title           | English status      |
| ---------------------------- | ----------------------- | ------------------------------------------------- | ----------------------- | ------------------- |
| `/`                          | MUNSIT AI               | Approved (brand, Phase 02)                        | MUNSIT AI               | Approved (brand)    |
| `/dashboard`                 | الرئيسية                | Verified (Handoff registry)                       | Dashboard               | Approved (D-R7)     |
| `/lectures`                  | محاضراتي                | Verified (Handoff registry)                       | My Lectures             | Approved (D-R7)     |
| `/summaries`                 | الملخصات                | Verified (Handoff registry)                       | Summaries               | Approved (D-R7)     |
| `/questions`                 | الأسئلة                 | Verified (Handoff registry)                       | Questions               | Approved (D-R7)     |
| `/flashcards`                | البطاقات التعليمية      | Verified (Handoff registry)                       | Flashcards              | Approved (D-R7)     |
| `/notes`                     | الملاحظات               | Verified (Handoff registry)                       | Notes                   | Approved (D-R7)     |
| `/favorites`                 | المفضلة                 | Verified (Handoff registry)                       | Favorites               | Approved (D-R7)     |
| `/folders`                   | المجلدات                | Verified (Handoff registry)                       | Folders                 | Approved (D-R7)     |
| `/lectures/record`           | تسجيل محاضرة جديدة      | Verified (Figma page 06 title)                    | Record a new lecture    | Approved 2026-11-16 |
| `/questions/new`             | أنشئ اختبارك الذكي      | Verified (Figma page 09 heading)                  | Create your smart quiz  | Approved 2026-11-16 |
| `/flashcards/new`            | إنشاء بطاقات تعليمية    | Verified (Figma page 11 heading)                  | Create flashcards       | Approved 2026-11-16 |
| `/flashcards/[deckId]`       | تفاصيل البطاقات         | Verified (Figma page 11 heading)                  | Deck details            | Approved 2026-11-16 |
| `/settings`                  | حسابي وإعداداتي         | Verified (Figma page 14 heading)                  | My account and settings | Approved 2026-11-16 |
| `/settings/profile`          | تعديل الملف الشخصي      | Verified (Figma page 14 heading)                  | Edit profile            | Approved 2026-11-16 |
| `/settings/preferences`      | تفضيلات الدراسة         | Verified (Figma page 14 heading)                  | Study preferences       | Approved 2026-11-16 |
| `/settings/notifications`    | الإشعارات               | Verified (Figma page 14 heading)                  | Notifications           | Approved 2026-11-16 |
| `/settings/security`         | الأمان والخصوصية        | Verified (Figma page 14 heading)                  | Security & privacy      | Approved 2026-11-16 |
| `/settings/subscription`     | اشتراكي                 | Verified (Figma page 14 heading)                  | My subscription         | Approved 2026-11-16 |
| `/summaries/[summaryId]`     | الملخص                  | Approved 2026-11-16 (modified)                    | Summary                 | Approved 2026-11-16 |
| `/lectures/[lectureId]`      | تفاصيل المحاضرة         | Approved 2026-11-16                               | Lecture details         | Approved 2026-11-16 |
| `/questions/[setId]/quiz`    | الاختبار                | Approved 2026-11-16                               | Quiz                    | Approved 2026-11-16 |
| `/flashcards/[deckId]/study` | وضع المذاكرة            | Approved 2026-11-16                               | Study mode              | Approved 2026-11-16 |
| `/notes/new`                 | ملاحظة جديدة            | Approved 2026-11-16                               | New note                | Approved 2026-11-16 |
| `/notes/[noteId]`            | تعديل الملاحظة          | Approved 2026-11-16                               | Edit note               | Approved 2026-11-16 |
| `/folders/[folderId]`        | تفاصيل المجلد           | Approved 2026-11-16                               | Folder details          | Approved 2026-11-16 |
| `/login`                     | تسجيل الدخول            | Approved 2026-11-16 (Figma heading is a greeting) | Log in                  | Approved 2026-11-16 |
| `/register`                  | إنشاء حساب              | Approved 2026-11-16 (Figma heading is a greeting) | Create account          | Approved 2026-11-16 |
| `/forgot-password`           | نسيت كلمة المرور        | Approved 2026-11-16 (Figma heading is a greeting) | Forgot password         | Approved 2026-11-16 |
| `/reset-password`            | إعادة تعيين كلمة المرور | Approved 2026-11-16 (Figma heading is a greeting) | Reset password          | Approved 2026-11-16 |

### 8.3 Other navigation copy

| Key                              | Arabic                                                                                  | Arabic status                        | English                                                                                              | English status      |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------- |
| `nav.more`                       | المزيد                                                                                  | Verified (Figma Mobile More Menu)    | More                                                                                                 | Approved 2026-11-16 |
| `nav.moreExtras.accountSettings` | إعدادات الحساب                                                                          | Verified (Figma Mobile More Menu)    | Account settings                                                                                     | Approved 2026-11-16 |
| `nav.moreExtras.upgradePlan`     | ترقية الخطة                                                                             | Verified (Figma Mobile More Menu)    | Upgrade plan                                                                                         | Approved 2026-11-16 |
| `nav.settingsNav.*`              | الملف الشخصي · تفضيلات الدراسة · الإشعارات · الأمان والخصوصية · الاشتراك · إدارة الحساب | Verified (Figma Settings Navigation) | Profile · Study preferences · Notifications · Security & privacy · Subscription · Account management | Approved 2026-11-16 |

No copy item is pending. Every visible string is verified from Figma or the Handoff, or approved
by the product owner.

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

Phase 04 closes only after CI on the PR, the product owner's merge authorization and the merge.
Risk R-2 (§7.1) stays open after closure until its Phase 22 gate.

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

## 12. Final closure evidence (2026-11-16)

Verified on the PR head `02a1057` immediately before the merge, then on `main`:

| Check                                                                                  | Result                                                              |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `corepack pnpm check` (typecheck, ESLint, dependency-cruiser, Prettier, Vitest, build) | **Pass**; unit tests **907/907**                                    |
| `corepack pnpm test:e2e` (full suite)                                                  | **382/382** passed                                                  |
| Production (`next start`)                                                              | **71/71** route-status checks; test probe on **0** production pages |
| CI `check` on the PR head `02a1057`                                                    | **Success**                                                         |
| Merge                                                                                  | Squash, head pinned to `02a1057`; PR #27 **MERGED** as `9888e08`    |
| Post-merge CI on `main` (`9888e08`)                                                    | **Completed: success**                                              |

**Delivered and approved:**

- Routing architecture: D-R1 to D-R12 and ADR-003.
- Typed next-intl `pathnames`: Arabic unprefixed, English `/en`.
- 30 placeholder routes in `(public)`, `(auth)`, `(app)` and `(focus)`.
- A localized 404 (catch-all) and a localized error boundary, plus a global fallback and the
  development-only error-test route.
- The navigation registry: 8 destinations, mobile bar and More control, More-sheet extras,
  Settings navigation.
- `resolveActiveDestination`, `mobileBarIndicator` and `useActiveDestination`.
- Every visible string verified from Figma or the Handoff, or approved by the product owner.

**Carried forward (not closed by Phase 04):**

- **R-2:** the blank no-JavaScript 404. OPEN, with a Phase 22 gate (§7.1).
- **Deferred decisions:**
  - D-08: Tutor route and lecture context.
  - D-09: Quiz Results persistence, Answer Review deep links, quiz mode in the URL.
  - D-02: reset-password link format.
  - D-18: plan-upgrade behaviour.
  - Settings "إدارة الحساب" target.
- **O-8:** Navigation Icon Button Figma check and contract, required before Phase 05.
- **Temporary instrumentation:** `ActiveDestinationProbe` (non-production only) is removed when
  the Phase 05 shell consumes `useActiveDestination`.
