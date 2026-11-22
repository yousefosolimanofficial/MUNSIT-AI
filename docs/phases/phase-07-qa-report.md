# Phase 07 — Increment 6 technical QA report (in progress)

Status: **IN PROGRESS** (owner approved the technical QA plan on 2026-11-21:
[phase-07-increment-6-plan.md](phase-07-increment-6-plan.md)). Technical QA evidence is separate
from production release readiness. Phase 07 stays **IN PROGRESS** until the owner reviews this
evidence and explicitly approves closure.

Branch `phase/07-increment-6-qa`, rebased onto `main` `620e26f` (2026-11-22) after the CTA
correction and Authentication gate (PR #66, P07-D24) and the Auth placeholder protection (PR #68,
P07-D25) merged. The baselines show the corrected
primary label "ابدأ الآن".

## Evidence summary (preliminary technical evidence, accepted by the owner 2026-11-22)

| Evidence                                        | Result                                                                                                            | Where                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `pnpm check` (types, lint, format, unit, build) | Pass; unit 1308/1308                                                                                              | Local on `main` `620e26f` + this branch; CI `check` |
| Development E2E (`pnpm test:e2e`)               | 1070 passed, 1 skipped (W-1 `fixme`) after the rebase onto `620e26f`; before it, 1061 passed (CI run 45031190475) | Local; CI `e2e` (required) on the PR head           |
| Production smoke (`pnpm test:e2e:prod`)         | 28 passed (Auth routes 11, from PR #68; Landing 17)                                                               | Local; CI `e2e` job (A7)                            |
| Landing visual baselines (Linux in CI)          | Pass (part of the development E2E)                                                                                | A1                                                  |
| Automated accessibility (axe, keyboard)         | Pass                                                                                                              | A3                                                  |
| Lighthouse (lab, localhost)                     | Recorded only                                                                                                     | A4                                                  |
| Browser engines (Chromium, Firefox, WebKit)     | 15 passed (automation, not real browsers)                                                                         | A5                                                  |
| Owner review of the baselines                   | **APPROVED** by the product owner on 2026-11-22 (A1)                                                              | A1                                                  |
| Real browsers and devices                       | **PARTIAL**: Chrome 157 and Edge 158 on Windows passed; other browsers and all devices NOT VERIFIED               | §7                                                  |
| Screen readers                                  | **NOT VERIFIED**                                                                                                  | §7                                                  |

## A1. Landing visual baselines

- Spec: `tests/e2e/landing-visual.spec.ts`. Full page plus 10 parts (navbar, 8 sections, footer).
  It covers 1440 × 900, 768 × 1024 and 390 × 844, for `ar` and `en`: **66 screenshots per
  platform**.
- **Environment:**
  - Playwright bundled Chromium; deviceScaleFactor 1; reduced motion (settled); all images loaded;
    dev overlay hidden; tolerance 0.1% of pixels.
  - Rendered by `next dev` with **development gates**: the static Hero image, the Pricing
    development preview and the English preview are visible. **Not a production rendering**;
    nothing in it is production-approved.
- **Baselines:** Windows (`-chromium-win32`) generated locally and stable (18/18 over 3 repeats).
  Linux (`-chromium-linux`) for CI come from the CI runner, as for `visual.spec.ts`; they are
  reviewed against the Windows set before commit.
- **Windows and Linux differ only in font rasterisation:** glyph edges and, for English at 390, a
  few line wraps (the Linux runner renders Inter slightly wider). Layout, sections and copy are the
  same. Each platform compares only against its own set.
- **After the Authentication gate (P07-D24):** the baselines are unchanged and still valid. They
  are development renderings, where every authentication entry point still shows; the gate
  changes production only. Production is covered by A7.
- **Owner approval (Roadmap §8):** visual regression baselines approved by the product owner on
  November 22, 2026, as references for the current approved development and production
  configurations. This does not authorize production activation of gated features.
  - Approved: Arabic 1440, 768 and 390; the English development layout only; the production Hero
    with only the secondary CTA; the production two-column Footer; the compact Navbar (P07-D23);
    the native Product Showcase (P07-D22).
  - Not authorized: the production Hero image, English copy publication, Pricing publication,
    commercial claims, legal-page publication and Phase 07 closure.
  - Accepted for the development baselines only: the development Hero image shows a visible
    horizontal transition near its lower edge and has a limited source resolution (666 × 412).
    The Hero production gate stays closed (P07-D21, §8 item 4).

## A2. Figma comparison

Parity is enforced by the per-section E2E geometry assertions against the Figma frame values
(design-values §16), with the documented differences:

| Part                          | Figma check                                                         | Approved differences                                           |
| ----------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Navbar                        | —                                                                   | **P07-D23** compact bar replaces the Figma 67-high bar (owner) |
| Hero                          | 1440 × 900 / 768 × 640 / 390 × 538; heading, text and CTA positions | **P07-D21** static image; contrast scrims; **P07-D24** label   |
| Showcase                      | intro heights and positions; section 942 / 786 / 673                | **P07-D22** native card (760 / 520 / Mobile Figma card)        |
| Features, How It Works        | card sizes, gaps, section positions                                 | Font-stack line wraps (plan §8f; typography investigation)     |
| Use Cases                     | rows 1200 × 340, images 500 × 276; Tablet and Mobile cards          | —                                                              |
| FAQ, Pricing (dev), Final CTA | positions ±1; panel 1200 × 366                                      | design-values §16.7 (7 documented items)                       |
| Footer                        | Increment 1 geometry                                                | Legal items are plain text (P07-D2)                            |

**Full-frame pixel overlay against the Figma frames: NOT VERIFIED** (not made in this pass). The visual baselines
(A1) now protect the approved rendering against regressions.

## A3. Accessibility (automated)

- New `tests/e2e/landing-qa.spec.ts`:
  - **axe WCAG 2.2 AA on the whole page at 1440, 1280, 1024, 768, 390 and 320, ar and en: no
    violations**;
  - heading outline: one `h1`, no skipped levels (ar and en);
  - **full keyboard pass at 1440 and 390**: every Tab stop is reachable, on screen and shows a
    visible focus indicator; the skip link comes first.
- Already covered by the suite: reduced motion (no animation, reveals off), RTL / LTR, composited
  text contrast (Hero heading ≥ 3:1, description ≥ 4.5:1 at every pixel), navbar link contrast
  (≥ 20:1, measured 2026-11-21).
- **Not screen-reader testing.** VoiceOver, TalkBack and NVDA: NOT VERIFIED (§7).

## A4. Lighthouse (measurements only, D-12)

Re-measured on 2026-11-22 after the Authentication gate (`main` `66df53c`). Production
configuration (`NEXT_PUBLIC_APP_ENV=production` build, `next start`, localhost, Windows 11),
Lighthouse 12.8.2 (`pnpm dlx`, not a project dependency), Playwright Chromium 157 headless.
Mobile: 412 × 823, RTT 150 ms, 1.6 Mbps, CPU × 4. Desktop: the `desktop` preset.

| Run                                   | Performance | Accessibility | Best Practices | SEO | LCP   | CLS   | TBT    | FCP   |
| ------------------------------------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ------ | ----- |
| Desktop, simulated                    | 100         | 100           | 96             | 100 | 0.8 s | 0     | 0 ms   | 0.3 s |
| Mobile, simulated (run 1)             | 92          | 100           | 96             | 100 | 3.4 s | 0     | 70 ms  | 1.1 s |
| Mobile, simulated (run 2)             | 90          | 100           | 96             | 100 | 3.6 s | 0     | —      | —     |
| Mobile, DevTools throttling (applied) | 74          | 100           | 96             | 100 | 2.5 s | 0.003 | 810 ms | 2.5 s |
| Before the gate, 2026-11-21 (Mobile)  | 89          | 100           | 96             | 100 | 3.8 s | 0     | 60 ms  | 1.1 s |
| Before the gate, 2026-11-21 (Desktop) | 100         | 100           | 96             | 100 | 0.7 s | 0     | 0 ms   | 0.3 s |

- **INP: not measured.** No field data exists (localhost); a lab navigation run cannot produce
  INP.
- Best Practices 96: the only console error is **`/favicon.ico` 404** (no favicon). Adding one is a
  technical item that needs an approved icon.
- **Mobile LCP findings** (recorded; no change made, not a design target):
  - The LCP text paints at **first paint**: the unthrottled trace shows FCP = LCP = 251 ms. The
    simulated LCP (3.4–3.6 s, Showcase heading) is Lantern's estimate: it charges the 12 script
    files (178 KB) requested before that paint to the LCP. Render delay is 86–87% of it; resource
    load time is 0.
  - With applied throttling, LCP = FCP = 2.5 s (Hero heading). The critical path is:
    1. the document (TTFB 566 ms);
    2. the render-blocking CSS (15 KB, ends at 1.6 s);
    3. an 834 ms main-thread task right after it (style and layout, unattributed);
    4. Cairo and Inter (30 + 47 KB, end at 1.8 and 2.1 s).
  - The **horizontal logo PNG (100 KB, served unoptimized by design, high priority)** downloads at
    the same time (0.7–3.0 s) and competes with the CSS and fonts on the slow link.
  - **Future investigation items** (not started; no speculative optimization; no image asset changes
    without owner approval):
    1. the 100 KB horizontal logo PNG: an optimized export with identical pixels is an owner asset
       decision;
    2. the 834 ms main-thread style and layout task: profile before any change;
    3. early script requests (30 KB unused, 13 KB legacy polyfills) and off-screen images (98 KB).
- Limits: one or two runs per configuration on localhost; lab values vary between runs; the
  production Hero image is gated off, so the measured page has no Hero image.

## A5. Cross-browser (Playwright engines)

New `tests/e2e/landing.cross-browser.spec.ts`, run in Chromium, Firefox and WebKit (desktop
emulation). It checks: section order, the navbar (58 high), the Hero image, no video, the Showcase
card (760 Desktop, 520 Tablet), CTA and login destinations, in-page section navigation, the FAQ
accordion by keyboard, the Mobile menu (open, Esc) and English LTR. **15 passed** (5 × 3 engines).
It runs on the development server, where the CTA and login links are expected; production is
covered by A7.

This is engine automation, **not real Safari, Edge, Firefox or device verification**. W-1 (WebKit
guard) stays accepted; its `fixme` remains.

## A6. Flaky-test monitoring

- Last 40 CI runs: 2 flaky results, both fixed by test-only PRs: navigation guard (#62) and the
  animation settle helper (#63).
- Increment 6 (2026-11-22): a one-off local hydration warning in the Landing visual capture (ar 768)
  came from changing `loading` on header and footer logos before they hydrated. Fixed in the test
  (wait for every image); stable 18/18 over 3 repeats, CI green.
- The language-switch test never failed in CI; its single local failure is unexplained (ClickUp
  task "intermittent Landing language-switch E2E failure"). CI keeps a trace on the first retry.

## A7. Production smoke suite (owner-approved 2026-11-22)

- **Config:** `playwright.production.config.ts` (on `main` since PR #68, which shared it), kept
  separate from the development suite:
  - its own folder `tests/e2e-production` (the development config never lists it), port 3200, and
    report and output folders;
  - it never reuses a running server.
- **Server:** the config builds with `NEXT_PUBLIC_APP_ENV=production` and serves with
  `next start`.
- **Self-check:** the suite first proves that it runs against a production build (`/dev/tokens`
  returns 404).
- **Run:** `corepack pnpm test:e2e:prod`. In CI it is a step of the `e2e` job, after the development
  suite. **`e2e` is a required status check** since 2026-11-22 (owner-approved; the
  `main-protection` ruleset requires `check` and `e2e`, verified through the repository rules), so
  a failing production smoke run blocks a merge into `main`.
- **Specs:** `tests/e2e-production/auth-routes.prod.spec.ts` (11 tests, from PR #68: the Auth
  routes return 404 in production, placeholders are `noindex`, the Landing is indexable) and
  `tests/e2e-production/landing.prod.spec.ts` (this PR), 17 tests. At 1440, 768 and 390 it checks:
  - no Login, Register, forgot-password or reset-password link in the DOM;
  - no navbar or menu login, no Hero primary, no footer account column, no Final CTA and no
    Pricing;
  - no language link; the approved section order;
  - the Hero secondary CTA scrolls to How it works;
  - navigation (Desktop links; Mobile and Tablet menu: open, 4 section links, Esc, a link closes
    it and navigates);
  - no horizontal overflow;
  - `lang="ar"`, `dir="rtl"`, the title and the Arabic description metadata;
  - no console error, page error or hydration warning (shared fixture).
- **English gate:** `/en` returns 404, checked over HTTP so the browser's 404 log is not mistaken
  for a page error.
- **Not covered:** visual baselines in production. The production page differs from the
  development baselines only by the gated parts.

## 7. Manual QA checklist

### 7.1 Status

| Check                                              | Status       | Evidence                                                                   |
| -------------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| Real Chrome (latest two majors), Windows and macOS | **PARTIAL**  | Chrome 157 on Windows passed (§7.3); macOS and a second major NOT VERIFIED |
| Real Firefox (latest two majors)                   | NOT VERIFIED | Not installed on the QA machine                                            |
| Real Edge (latest two majors)                      | **PARTIAL**  | Edge 158 on Windows passed (§7.3); a second major NOT VERIFIED             |
| Real Safari macOS (latest two majors)              | NOT VERIFIED | No macOS machine                                                           |
| iOS Safari on a physical iPhone                    | NOT VERIFIED | No physical iPhone available                                               |
| Android Chrome on a physical device                | NOT VERIFIED | No physical Android device available                                       |
| NVDA (Windows) full-page pass                      | NOT VERIFIED | NVDA not installed                                                         |
| VoiceOver (macOS and iOS)                          | NOT VERIFIED | No macOS or iOS device                                                     |
| TalkBack (Android)                                 | NOT VERIFIED | No physical Android device available                                       |
| Hero image sharpness (666 × 412 source)            | NOT VERIFIED | Owner visual decision (A1, §8 item 4)                                      |

### 7.2 Environment (2026-11-22)

- **Machine:** Windows 11 Pro 10.0.26300.
- **Installed browsers:** Google Chrome 157.0.8103.79 and Microsoft Edge 158.0.4370.33. Firefox,
  Safari and other browsers are not installed.
- **Screen readers:** Windows Narrator only (built in). NVDA and JAWS are not installed. Narrator
  was not used: no human listener, and it is not one of the target screen readers.
- **Physical devices:** none connected for testing. No adb; the "spacedesk Android" entries in
  Device Manager are a second-screen display driver, not a browser on a device.
- **Build under test:** `main` `6997d34`, `next build` and `next start --port 3200` with
  `NEXT_PUBLIC_APP_ENV=production`, in a clean worktree, served on `localhost`.

### 7.3 Real-browser run (installed Chrome and Edge)

**Method:** the installed Chrome and Edge binaries (Playwright `channel: chrome` and `msedge`,
headed windows, fresh profiles) drove the production smoke suite (A7) plus supplementary checks.
This is real-browser evidence for these two versions on Windows. It is automated, not a
hands-on human session, and resized desktop windows are **not** mobile-device evidence.

Result: **70 passed, 0 failed** (35 per browser), after one documented exemption (F-1).

| Check (expected result)                                                                | Chrome 157 | Edge 158 |
| -------------------------------------------------------------------------------------- | ---------- | -------- |
| Landing returns 200; `lang="ar"`, `dir="rtl"`, title and description (1440, 768, 390)  | Pass       | Pass     |
| Approved section order; no Login, Register, Final CTA, Pricing or language link        | Pass       | Pass     |
| Hero secondary CTA scrolls to How it works (`#how-it-works` in view)                   | Pass       | Pass     |
| Navigation: desktop bar link to FAQ; compact menu opens, Esc closes, link navigates    | Pass       | Pass     |
| FAQ: 6 questions; click, Enter and Space toggle `aria-expanded` and the panel          | Pass       | Pass     |
| Keyboard: first Tab lands on a nav control with a visible focus indicator              | Pass       | Pass     |
| No horizontal overflow at 1440, 768, 390 and 320                                       | Pass       | Pass     |
| Auth routes (ar and en) return 404, `noindex`, no form; `/ar/login` redirects to a 404 | Pass       | Pass     |
| `/en` and `/dev/tokens` return 404; public placeholders are `noindex, nofollow`        | Pass       | Pass     |
| Full-page screenshots at 1440, 768, 390 and 320: no layout or typography regression    | Pass       | Pass     |

- **Evidence:** `assets/review/phase-07-manual-qa-2026-11-22/` (local, git-ignored): full-page
  captures per browser and width, and the Playwright JSON results.
- **Visual review:** layouts match the owner-approved production configuration (A1). The 390 and
  320 windows render 375 and 305 px of content beside the desktop scrollbar.

### 7.4 Findings

- **Record:** the owner accepted the Chrome 157 and Edge 158 evidence and the documented limits
  on 2026-11-22. It is automated testing of installed real browsers, not a hands-on session.
  Firefox, Safari, physical devices and screen readers remain **NOT VERIFIED**.
- **Merge:** this section was merged in PR #69 (`51a562b`). Post-merge CI run 45073164532:
  `check` and `e2e` passed (1070 passed, 1 skipped; production smoke 28 passed).

#### F-1: missing favicon (RESOLVED, PR #70)

- **Finding:** real Chrome and Edge request `/favicon.ico` on every page; it returned 404 and
  logged a console error. The bundled Playwright Chromium used in CI does not request it, so CI
  did not see it. The §7.3 run exempted exactly this URL in a temporary copy of the console guard
  (not committed).
- **Fix (owner-approved, PR #70):**
  - `src/app/favicon.ico` is exported from the approved Symbol (`Munsit_Logo_Symbol.png`): the
    mark is centred on a transparent square, with no recolouring, cropping or redrawing. It holds
    16, 32 and 48 px images.
  - Next.js declares exactly one `<link rel="icon">`.
  - A production smoke test covers the status, the content type and the single declaration.
  - Provenance is recorded in design-values §2a.
- **Verified on a local production build:** `/favicon.ico` returns 200 `image/x-icon`. In the
  installed Chrome 157 and Edge 158 the icon shows in the tab and there is no console error on
  `/` or `/dashboard`.
- **Resolved:** PR #70 merged as `76954ed` (2026-11-23). Post-merge CI run 45078120391: `check`
  and `e2e` passed (1070 passed, 1 skipped; production smoke 29 passed, including the favicon
  test).
- **Apple touch icon:** deferred by the owner (2026-11-23).

#### O-1: redirect loop with `next start -H 127.0.0.1` (deployment configuration limitation)

- **Reproduce:**
  1. Run `NEXT_PUBLIC_APP_ENV=production next start --port 3201 -H 127.0.0.1`.
  2. Run `curl -I http://127.0.0.1:3201/`.
- **Result:** `307`, `location: /`, `x-middleware-rewrite: http://localhost:3201/ar`. Following
  the redirects loops on `/` (`curl -L --max-redirs 3` stops after 3 redirects, still 307).
  `/dashboard` loops the same way; `/en` (404) is not affected.
- **Comparison** (same build; `/` and `/dashboard`):

  | Binding           | Host `localhost`               | Host `127.0.0.1`               |
  | ----------------- | ------------------------------ | ------------------------------ |
  | default (no `-H`) | 200, rewrite `/ar` (relative)  | 200, rewrite `/ar`             |
  | `-H localhost`    | 200, rewrite `/ar`             | no connection (bound to `::1`) |
  | `-H 0.0.0.0`      | 200, rewrite `/ar`             | 200, rewrite `/ar`             |
  | `-H 127.0.0.1`    | **307 loop**, absolute rewrite | **307 loop**, absolute rewrite |

  The Host header makes no difference. `/ar` is always 307 to `/`, which is the expected
  next-intl redirect to the unprefixed URL.

- **Root cause** (Next.js 16.4.6 source):
  1. The router builds the request's base URL from the bound hostname, `http://127.0.0.1:3201`
     (`server/lib/router-utils/resolve-routes.js`, `initUrl`).
  2. `NextURL` normalises every loopback hostname (`127.x.x.x`, `[::1]`) to `localhost`
     (`server/web/next-url.js`). The next-intl rewrite of `/` to `/ar` therefore comes back as
     `http://localhost:3201/ar`.
  3. The router turns a rewrite into a relative (internal) one only when its origin equals the
     base URL (`getRelativeURL`). `localhost:3201` is not `127.0.0.1:3201`, so it is handled as
     an external rewrite.
  4. Next.js proxies that rewrite to `http://localhost:3201/ar`. That request is answered by the
     next-intl redirect `/ar` → `/` (307), which reaches the browser and loops.
  5. With the default binding, `-H localhost` or `-H 0.0.0.0`, the two origins match and the
     rewrite stays internal.
- **Normal deployment:**
  - Not affected when the server binds to the default host, `0.0.0.0` (for example a container's
    `HOSTNAME=0.0.0.0`) or `localhost`.
  - A self-hosted setup that binds `next start` to `127.0.0.1` behind a reverse proxy **would be
    affected**.
  - The deployment target is NOT VERIFIED.
- **Owner decision (2026-11-23):** documented as a deployment configuration limitation; no
  application routing change is authorized.
- **Correction:**
  - No code or routing change. The proxy and next-intl behave as designed.
  - Configuration rule for any self-hosted deployment: do not bind `next start` to `127.0.0.1`.
    Use the default, `0.0.0.0` (restricted by a firewall if needed) or `localhost`. Re-check this
    when the deployment target is chosen.

## 8. Production release blockers (separate from technical QA)

1. **Resolved:**
   - the Landing hides every authentication entry point in production (PR #66, `66df53c`,
     P07-D24);
   - the Auth placeholder routes (`/login`, `/register`, `/forgot-password`, `/reset-password`,
     ar and en) return 404 in production, and every Phase 04 placeholder is `noindex, nofollow`
     (PR #68, `620e26f`, P07-D25).
   - Both reopen together only when the owner sets `AUTHENTICATION_AVAILABLE`.
2. Legal pages (P07-D2).
3. Real-browser, device and screen-reader evidence (§7; R-3).
4. Hero image production approval (P07-D21): limited source resolution and a visible horizontal
   transition near the image's lower edge (owner review, 2026-11-22).
5. English marketing approval (P07-D1).
6. Commercial pricing approval (P07-D4, P07-D19, P07-D20).
7. Social-share image (open). The favicon is resolved (F-1, PR #70, `76954ed`).
8. Accepted technical risks (register in PROGRESS.md):
   - **W-1:** WebKit (Playwright) navigation guard, Leave after a cancelled Back reloads; `fixme`
     kept.
   - **G-1:** a second browser Back without interaction leaves a guarded page (browser rule; risk
     accepted, conditional).
   - **R-2:** the 404's first HTML is empty until hydration (no message without JavaScript).
   - **R-3:** cross-browser coverage is engine automation, not real browsers or devices.
   - **Typography:** font-stack line-wrap differences (plan §8f).

No production gate is enabled; no legal page, price or commercial promise was added.
