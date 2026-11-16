# Phase 04 — Routing & navigation registry — Closure Report

- **Status:** **DRAFT — for review. Phase 04 is not closed.** It closes only after review, the
  product owner's approval of the PROPOSED copy (§8), and the merge of the implementation PR.
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

| Run                                   | Result                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `corepack pnpm check`                 | **Pass** (typecheck, ESLint + dependency-cruiser, Prettier, Vitest, build). Unit tests **907/907** (697 before Phase 04, **+210** new)                             |
| `corepack pnpm test:e2e` (full suite) | **382/382 passed** (250 before Phase 04, **+132** in `routing.spec.ts`)                                                                                            |
| Production (`next start`)             | 71/71: 60 placeholder URLs (30 × 2 locales) → 200; 6 dev URLs incl. `/dev/error-test` → 404; 5 unknown or deferred paths → 404; `/ar/dashboard` → 307 `/dashboard` |
| CI                                    | See the implementation PR                                                                                                                                          |

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

## 7. Known limitations

1. **Production 404 first response (Next.js behaviour):**
   - `notFound()` under the `[locale]` root layout returns HTTP 404 with Next's error document and
     an empty body. The localized not-found page then renders on hydration with the correct
     `lang`/`dir` and copy (verified in a production browser).
   - The 404 page's own `<title>` is not applied.
   - This predates Phase 04: the dev routes' production 404s behave the same.
   - The Next 16 docs' alternative for a top-level dynamic root layout is the experimental
     `global-not-found`, which is excluded by D-R8.
   - The E2E 404 checks wait for hydration.
2. **`ActiveDestinationProbe`:** a hidden, temporary verification element on placeholders that
   proves the client hook in a real browser. It is removed when the Phase 05 shell consumes
   `useActiveDestination`.
3. **"إدارة الحساب"** (Settings navigation) has no route until its target is decided.
4. **Console guard exceptions, scoped and documented:**
   - The 404 suites allow only the browser's own "Failed to load resource: … 404" message.
   - The error-boundary suite allows only the intentional error text.
   - Every other console error still fails.
5. **Chromium only;** the cross-browser pass is Phase 22.

## 8. Bilingual copy — PROPOSED (needs the product owner's approval before merge, D-R9)

**Verbatim** means copied from Figma or the Handoff. **Proposed** means new wording to approve.
English nav destination labels are already approved (D-R7).

| Key                                                                            | Arabic                                                                                   | English                                                                                              | Source (Arabic)                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `nav.more`                                                                     | المزيد                                                                                   | More                                                                                                 | Verbatim (Mobile More Menu); EN proposed                |
| `nav.moreExtras.accountSettings`                                               | إعدادات الحساب                                                                           | Account settings                                                                                     | Verbatim; EN proposed                                   |
| `nav.moreExtras.upgradePlan`                                                   | ترقية الخطة                                                                              | Upgrade plan                                                                                         | Verbatim; EN proposed                                   |
| `nav.settingsNav.*`                                                            | الملف الشخصي · تفضيلات الدراسة · الإشعارات · الأمان والخصوصية · الاشتراك · إدارة الحساب  | Profile · Study preferences · Notifications · Security & privacy · Subscription · Account management | Verbatim (Settings Navigation); EN proposed             |
| `pages.notImplemented`                                                         | هذه الصفحة لم تُنفَّذ بعد.                                                                  | This page is not implemented yet.                                                                    | **Proposed**                                            |
| `pages.titles.lectures_record`                                                 | تسجيل محاضرة جديدة                                                                       | Record a new lecture                                                                                 | Verbatim (page 06)                                      |
| `pages.titles.questions_new`                                                   | أنشئ اختبارك الذكي                                                                       | Create your smart quiz                                                                               | Verbatim (page 09)                                      |
| `pages.titles.flashcards_new`                                                  | إنشاء بطاقات تعليمية                                                                     | Create flashcards                                                                                    | Verbatim (page 11)                                      |
| `pages.titles.flashcards_deck`                                                 | تفاصيل البطاقات                                                                          | Deck details                                                                                         | Verbatim (page 11)                                      |
| `pages.titles.summaries_reader`                                                | قراءة الملخص                                                                             | Read summary                                                                                         | Verbatim action label (page 13); as a title proposed    |
| `pages.titles.settings`                                                        | حسابي وإعداداتي                                                                          | My account and settings                                                                              | Verbatim (page 14)                                      |
| `pages.titles.settings_profile`                                                | تعديل الملف الشخصي                                                                       | Edit profile                                                                                         | Verbatim (page 14)                                      |
| `pages.titles.settings_preferences` / `_notifications` / `_security`           | تفضيلات الدراسة · الإشعارات · الأمان والخصوصية                                           | Study preferences · Notifications · Security & privacy                                               | Verbatim (page 14)                                      |
| `pages.titles.settings_subscription`                                           | اشتراكي                                                                                  | My subscription                                                                                      | Verbatim (page 14)                                      |
| `pages.titles.auth_login` / `_register` / `_forgotPassword` / `_resetPassword` | تسجيل الدخول · إنشاء حساب · نسيت كلمة المرور · إعادة تعيين كلمة المرور                   | Log in · Create account · Forgot password · Reset password                                           | **Proposed** (Figma headings are greetings, not titles) |
| `pages.titles.lectures_detail`                                                 | تفاصيل المحاضرة                                                                          | Lecture details                                                                                      | **Proposed**                                            |
| `pages.titles.questions_quiz`                                                  | الاختبار                                                                                 | Quiz                                                                                                 | **Proposed**                                            |
| `pages.titles.flashcards_study`                                                | وضع المذاكرة                                                                             | Study mode                                                                                           | **Proposed**                                            |
| `pages.titles.notes_new` / `notes_editor`                                      | ملاحظة جديدة · تعديل الملاحظة                                                            | New note · Edit note                                                                                 | **Proposed**                                            |
| `pages.titles.folders_detail`                                                  | تفاصيل المجلد                                                                            | Folder details                                                                                       | **Proposed**                                            |
| `errors.notFound.title` / `body` / `backHome`                                  | الصفحة غير موجودة · الرابط الذي فتحته غير موجود أو تم نقله. · العودة إلى الصفحة الرئيسية | Page not found · The link you opened doesn't exist or has moved. · Back to the home page             | **Proposed**                                            |
| `errors.error.title` / `body` / `retry`                                        | حدث خطأ غير متوقع · تعذّر عرض هذه الصفحة. حاول مرة أخرى. · إعادة المحاولة                 | Something went wrong · This page couldn't be displayed. Please try again. · Try again                | **Proposed**                                            |
| `global-error` (static)                                                        | حدث خطأ غير متوقع · إعادة المحاولة                                                       | Something went wrong. · Try again                                                                    | **Proposed**                                            |

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

Phase 04 closes only after CI on the PR, review, copy approval (§8) and merge.

## 11. Proposed Mariam delegation (not started; needs approval of the starter and handoff)

Each task can be done offline from a starter package and checked independently:

1. **Resolver test table extension:** add cases (extra ids, Arabic ids, edge paths) to
   `src/shared/navigation/resolve-active-destination.test.ts` against the merged resolver.
   - Done means `corepack pnpm test` passes and every approved route stays covered.
   - Delegated file: that test file only.
2. **English copy consistency review:** check the English labels and PROPOSED copy (§8) for tone
   and consistency. Output: a written note, with no code.
3. **Manual RTL/LTR verification:** a checklist pass over all placeholder routes and the 404 in
   both locales at 1440/768/390/320, with screenshots. Output: a checklist and images.
