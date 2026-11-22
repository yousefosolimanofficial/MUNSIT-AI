# Phase 07 — Increment 6 technical QA report (in progress)

Status: **IN PROGRESS** (owner approved the technical QA plan on 2026-11-21:
[phase-07-increment-6-plan.md](phase-07-increment-6-plan.md)). Technical QA evidence is separate
from production release readiness. Phase 07 stays **IN PROGRESS** until the owner reviews this
evidence and explicitly approves closure.

Branch `phase/07-increment-6-qa`, rebased onto `main` `66df53c` after the CTA correction and
Authentication gate (PR #66, P07-D24) merged on 2026-11-22. The baselines show the corrected
primary label "ابدأ الآن".

## Evidence summary (preliminary technical evidence, accepted by the owner 2026-11-22)

| Evidence                                        | Result                                         | Where                                  |
| ----------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| `pnpm check` (types, lint, format, unit, build) | Pass; unit 1305/1305                           | Local and CI `check`                   |
| Development E2E (`pnpm test:e2e`)               | 1061 passed, 1 skipped (W-1 `fixme`)           | CI run 45031190475 on `c866504`, `e2e` |
| Production smoke (`pnpm test:e2e:prod`)         | 17 passed                                      | Same CI run, `e2e` job (A7)            |
| Landing visual baselines (Linux in CI)          | Pass (part of the development E2E)             | A1                                     |
| Automated accessibility (axe, keyboard)         | Pass                                           | A3                                     |
| Lighthouse (lab, localhost)                     | Recorded only                                  | A4                                     |
| Browser engines (Chromium, Firefox, WebKit)     | 15 passed (automation, not real browsers)      | A5                                     |
| Owner review of the baselines                   | **NOT VERIFIED** (pending; PR #67 stays draft) | §7                                     |
| Real browsers and devices                       | **NOT VERIFIED**                               | §7                                     |
| Screen readers                                  | **NOT VERIFIED**                               | §7                                     |

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
- **Owner approval of the baselines is required** (Roadmap §8); they are not auto-accepted.

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

- **Config:** `playwright.production.config.ts`, kept separate from the development suite:
  - its own folder `tests/e2e-production` (the development config never lists it), port 3200, and
    report and output folders;
  - it never reuses a running server.
- **Server:** the config builds with `NEXT_PUBLIC_APP_ENV=production` and serves with
  `next start`.
- **Self-check:** the suite first proves that it runs against a production build (`/dev/tokens`
  returns 404).
- **Run:** `corepack pnpm test:e2e:prod`. In CI it is a step of the required `e2e` job, after the
  development suite.
- **Spec:** `tests/e2e-production/landing.prod.spec.ts`, 17 tests. At 1440, 768 and 390 it checks:
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

## 7. Manual QA checklist (all NOT VERIFIED until evidence exists)

| Check                                              | Status       | Evidence required                         |
| -------------------------------------------------- | ------------ | ----------------------------------------- |
| Real Chrome (latest two majors), Windows and macOS | NOT VERIFIED | Version, screenshots, notes               |
| Real Firefox (latest two majors)                   | NOT VERIFIED | Version, screenshots, notes               |
| Real Edge (latest two majors)                      | NOT VERIFIED | Version, screenshots, notes               |
| Real Safari macOS (latest two majors)              | NOT VERIFIED | Version, screenshots, notes (W-1 context) |
| iOS Safari on a physical iPhone                    | NOT VERIFIED | Device, iOS version, screenshots          |
| Android Chrome on a physical device                | NOT VERIFIED | Device, Android version, screenshots      |
| NVDA (Windows) full-page pass                      | NOT VERIFIED | Reading order, landmarks, FAQ, menu       |
| VoiceOver (macOS and iOS)                          | NOT VERIFIED | As above                                  |
| TalkBack (Android)                                 | NOT VERIFIED | As above                                  |
| Hero image sharpness (666 × 412 source)            | NOT VERIFIED | Owner visual decision                     |
| Final owner visual review of the baselines         | NOT VERIFIED | Owner approval                            |

## 8. Production release blockers (separate from technical QA)

1. **Resolved for the Landing (PR #66, `66df53c`):** production hides every authentication entry
   point until Authentication is operational (P07-D24). **Still open:**
   - the Phase 04 placeholder routes (`/login`, `/register`, `/forgot-password`,
     `/reset-password` and their `/en` forms) return 200 in production and have no `noindex`;
   - the English placeholders are served even though the English Landing is gated.
   - A separate route-indexing PR is proposed; it is not part of this QA branch.
2. Legal pages (P07-D2).
3. Real-browser, device and screen-reader evidence (§7; R-3).
4. Hero image production approval and sharpness (P07-D21).
5. English marketing approval (P07-D1).
6. Commercial pricing approval (P07-D4, P07-D19, P07-D20).
7. Social-share image and favicon.
8. Accepted technical risks (register in PROGRESS.md):
   - **W-1:** WebKit (Playwright) navigation guard, Leave after a cancelled Back reloads; `fixme`
     kept.
   - **G-1:** a second browser Back without interaction leaves a guarded page (browser rule; risk
     accepted, conditional).
   - **R-2:** the 404's first HTML is empty until hydration (no message without JavaScript).
   - **R-3:** cross-browser coverage is engine automation, not real browsers or devices.
   - **Typography:** font-stack line-wrap differences (plan §8f).

No production gate is enabled; no legal page, price or commercial promise was added.
