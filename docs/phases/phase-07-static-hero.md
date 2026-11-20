# Phase 07 — Static Figma Hero image (P07-D21)

Status: **IN REVIEW** (branch `feat/phase-07-static-hero-image`). The production gate stays
**closed** until the owner verifies the implementation.

## 1. Decision

**P07-D21 (owner, 2026-11-20): Static Figma Hero Image Approved.** The Hero uses the original
approved Figma image instead of a background video. This replaces the Hero video production plan
(the brief, the provisional asset review and the replacement requirements in
[phase-07-landing-review.md](phase-07-landing-review.md) §4–§5 are superseded).

## 2. Source (Figma, read-only)

| Item          | Value                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer         | "Hero / Video Container (Hero Vedio.mp4 — asset pending)" in Desktop `28:3`, Tablet `200:559`, Mobile `200:713` (nodes `2481:3465`, `2481:3470`, `2481:3475`) |
| Image         | one image fill, hash `0c56986f38980fa0b0a789a58f2909124affd790` (verified: the SHA-1 of the downloaded original)                                              |
| Original size | **666 × 412** PNG (aspect 1.6165)                                                                                                                             |
| Filters       | exposure −0.27, saturation 0.79, highlights −1.0, shadows −0.12 (identical in all three frames)                                                               |
| Framing       | Desktop **FIT** (contain) in 1440 × 900; Tablet **FILL** (cover) in 768 × 640; Mobile **FILL** in 390 × 538 over Void Black; centred, no transform            |
| Variants      | none: the same image in every frame                                                                                                                           |

The provisional video poster was **not** used.

## 3. Delivered file

`public/landing/hero/hero-figma-2880x1782.webp`: 166,094 B, SHA-256 starts `0ec8aebe00aed878`.

- Figma's own export of the Desktop container at 2×, which bakes in the filters exactly (P07-D8:
  no CSS grade or overlay).
- Figma fills the FIT letterbox with dark rows. Rows 0–8 and 1791–1799 were cropped, leaving the
  image area (2880 × 1782, aspect 1.6162).
- Encoded as WebP q90.
- `next/image` serves resized variants (measured: 640 w on Mobile, 828 w on Tablet, 1080 w at
  1024, 1920 w on Desktop) and preloads it as the LCP image.

**Quality limit:** the Figma original is only 666 × 412. Every Hero size enlarges it (×2.16 on
Desktop, by the browser and Figma alike), so it looks soft, exactly as in Figma. A sharper image
needs a higher-resolution original from the designer; none was generated.

## 4. Implementation

- `LandingHero`: the media layer is Near Black, then the ambient glow, then the image
  (`object-cover`, `xl:object-contain`, centred, `alt=""` inside the `aria-hidden` layer). The top
  and bottom fades are kept (Visual Refinement). The image is never animated.
- **Removed from rendering:** the `<video>`, the poster and the Pause/Play control. Nothing
  requests `.mp4`, `.webm` or the poster.
- **Kept, unreferenced, as history:** `HeroVideo.tsx` and its unit tests, the video model in
  `hero-media.ts`, `isHeroVideoVisible`, the files `public/landing/hero/hero-ambient-*`, and the
  `hero.videoPause` / `hero.videoPlay` messages.
- **Gate:** `HERO_IMAGE.provisional = true` with `isHeroImageVisible` (same rule as before). The
  image renders in development and preview, and production keeps the Near Black Hero. After owner
  verification, set `provisional: false` in a separate change.

## 5. Verification (2026-11-20, Chromium, production build in development mode)

| Width | Framing            | Image box = Hero box | Video / control / video requests | CLS | Overflow |
| ----- | ------------------ | -------------------- | -------------------------------- | --- | -------- |
| 1440  | contain 1440 × 891 | 1440 × 900           | 0 / 0 / 0                        | 0   | none     |
| 1280  | contain 1280 × 792 | 1280 × 900           | 0 / 0 / 0                        | 0   | none     |
| 1024  | cover (Tablet)     | 1024 × 640           | 0 / 0 / 0                        | 0   | none     |
| 768   | cover              | 768 × 640            | 0 / 0 / 0                        | 0   | none     |
| 390   | cover              | 390 × 540            | 0 / 0 / 0                        | 0   | none     |
| 320   | cover              | 320 × 578            | 0 / 0 / 0                        | 0   | none     |

The same holds in English (1440, 768, 390) and under reduced motion (the same static image).

**Figma comparison** (same-size renders, mean absolute RGB difference): Desktop 5.6, Tablet 7.9,
Mobile 14.1, out of 255. The differences come from:

- the approved Visual Refinement bottom and top fades;
- the Mobile Hero being 540 instead of 538 high (an existing, earlier layout difference);
- text antialiasing.

Heading and CTA positions are unchanged: Desktop h1 at x 395, y 344.

**Contrast over the image** (every pixel under the text's line boxes; the 1st percentile is
reported):

| Text              | 1440                | 768              | 390          | Requirement              |
| ----------------- | ------------------- | ---------------- | ------------ | ------------------------ |
| Heading (large)   | 3.74                | 4.62             | 3.79         | 3:1, passes              |
| Description       | 3.58 (24 px, large) | **3.57** (20 px) | 6.89 (16 px) | 3:1 large / 4.5:1 normal |
| Outline CTA label | 7.14                | 7.09             | 7.05         | 4.5:1, passes            |

**Open finding (owner decision):** on Tablet (768 to 1279, including 1024), part of the 20 px
description crosses the laptop-screen glow in the image. There, 5% of the background pixels give
less than 4.0:1 and the lowest 1% 3.57:1, below the 4.5:1 required for normal text. Figma has the
same text over the same filtered image, so this is inherited from the design, not introduced by
the implementation. Options, none implemented:

- (a) a subtle text shadow on the Hero description;
- (b) a stronger image grade on Tablet;
- (c) accept as designed.

Until decided, the production gate stays closed.

E2E asserts the passing cases (heading everywhere; description on Desktop and Mobile).

## 6. Evidence

Local captures (git-ignored) in `assets/review/static-hero-2026-11-20/`:

- `after-*`: the Hero at 1440, 1280, 1024, 768, 390 and 320, ar and en, including reduced motion;
- `before-*`: the provisional video;
- `figma-*`: Figma renders;
- `compare-figma-vs-after-*`: side by side with Figma;
- `report-static-hero.json`: the measurements.
