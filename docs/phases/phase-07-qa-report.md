# Phase 07 — Increment 6 technical QA report (in progress)

Status: **IN PROGRESS** (owner approved the technical QA plan on 2026-11-21:
[phase-07-increment-6-plan.md](phase-07-increment-6-plan.md)). Technical QA evidence is separate
from production release readiness. Phase 07 stays **IN PROGRESS** until the owner reviews this
evidence and explicitly approves closure.

Branch `phase/07-increment-6-qa`, built on the CTA correction branch (`fix/landing-cta-label`, PR
#66), so the baselines show the corrected primary label. Base `main`: `a2d002a`.

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

No full-frame pixel overlay against the Figma frames was made in this pass. The visual baselines
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

Production configuration (`NEXT_PUBLIC_APP_ENV=production` build, `next start`, localhost),
Lighthouse 12.8.2, Chromium 157 headless, simulated throttling. Reports:
`assets/review/lighthouse-2026-11-21/` (local, git-ignored).

| Form factor | Performance | Accessibility | Best Practices | SEO | LCP   | CLS | TBT   | FCP   |
| ----------- | ----------- | ------------- | -------------- | --- | ----- | --- | ----- | ----- |
| Desktop     | 100         | 100           | 96             | 100 | 0.7 s | 0   | 0 ms  | 0.3 s |
| Mobile      | 89          | 100           | 96             | 100 | 3.8 s | 0   | 60 ms | 1.1 s |

- **INP: not measured.** No field data exists (localhost); a lab navigation run cannot produce
  INP.
- Best Practices 96: the only console error is **`/favicon.ico` 404** (no favicon). Adding one is a
  technical item that needs an approved icon.
- Mobile LCP element: the Showcase heading text (simulated slow 4G). Recorded only; not a target.
- Limits: one run per form factor on localhost; lab values vary between runs; the production Hero
  image is gated off, so the measured page has no Hero image.

## A5. Cross-browser (Playwright engines)

New `tests/e2e/landing.cross-browser.spec.ts`, run in Chromium, Firefox and WebKit (desktop
emulation). It checks: section order, the navbar (58 high), the Hero image, no video, the Showcase
card (760 Desktop, 520 Tablet), CTA and login destinations, in-page section navigation, the FAQ
accordion by keyboard, the Mobile menu (open, Esc) and English LTR. **15 passed** (5 × 3 engines).

This is engine automation, **not real Safari, Edge, Firefox or device verification**. W-1 (WebKit
guard) stays accepted; its `fixme` remains.

## A6. Flaky-test monitoring

- Last 40 CI runs: 2 flaky results, both fixed by test-only PRs: navigation guard (#62) and the
  animation settle helper (#63).
- The language-switch test never failed in CI; its single local failure is unexplained (ClickUp
  task "intermittent Landing language-switch E2E failure"). CI keeps a trace on the first retry.

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

1. "ابدأ الآن" / Register destination: registration is a placeholder (PR #66; P07-D24 destination
   open).
2. Legal pages (P07-D2).
3. Real-browser, device and screen-reader evidence (§7; R-3).
4. Hero image production approval and sharpness (P07-D21).
5. English marketing approval (P07-D1).
6. Commercial pricing approval (P07-D4, P07-D19, P07-D20).
7. Social-share image and favicon.
8. Accepted technical risks: W-1, G-1, R-2, typography differences.

No production gate is enabled; no legal page, price or commercial promise was added.
