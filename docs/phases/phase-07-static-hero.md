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

**Tablet contrast correction (owner instruction 2026-11-20; "accept as designed" was rejected).**
Before the correction, part of the 20 px Tablet description crossed the laptop-screen glow in the
image: the lowest 1% of background pixels gave 3.57:1, below the 4.5:1 required for normal text.

- **Treatment:** a soft, localized Void Black radial darkening behind the description only, as its
  own `::before` layer, from 720 to 1279 px (`AMBIENT.heroTextScrim`). It is 40% in its flat centre
  and fades to transparent at its edges, so there is no visible rectangle and no blur. The image,
  composition, cropping, text and CTA positions, fades and glows are unchanged.
- **Strength:** the smallest step with a margin: 0.30 fails (weakest pixel 4.37), 0.35 passes
  with only 0.03 to spare (4.53), and 0.40 passes with a margin (4.68).
- **Measured on the composited page** (text hidden, the real page screenshotted, every pixel under
  the description's line boxes compared with its colour):

| Width (Tablet) | Before: min / 1st percentile | After: min / 1st percentile |
| -------------- | ---------------------------- | --------------------------- |
| ar 720         | 3.41 / 3.55                  | **5.85 / 6.76**             |
| ar 768         | 3.47 / 3.58                  | **6.22 / 7.05**             |
| ar 900, 1024   | 3.39 / 3.56                  | **6.02 / 6.98**             |
| ar 1100        | 3.42 / 3.58                  | **6.02 / 6.75**             |
| ar 1279        | 3.39 / 3.56                  | **4.86 / 6.03**             |
| en 720         | 3.35 / 3.55                  | **4.68 / 5.22**             |
| en 768         | 3.35 / 3.58                  | **6.54 / 7.09**             |
| en 1279        | 3.12 / 3.55                  | **5.53 / 6.48**             |

- **Desktop and Mobile unaffected:** the values are identical before and after, and the Hero
  screenshots at 1440, 1280, 390 and 320 (ar and en, including reduced motion) are pixel-identical.
  On Tablet, only the band around the description changes.
- **Remaining pixel-level notes, not corrected (outside this scope):**
  - Heading (large text, 3:1): the 1st percentile is 3.6 or more everywhere, but single pixels
    under its line boxes reach 2.72 on Desktop and upper Tablet (bright glints).
  - English Mobile at 320: the description's 1st percentile is 4.58, with a minimum pixel of 3.41.
    English copy is unapproved and gated in production (P07-D1).

E2E asserts:

- the composited Tablet description at 4.5:1 or more at every pixel (720, 768, 1024, 1279);
- the scrim on Tablet only;
- the heading everywhere and the description on Desktop and Mobile over the image.

## 5a. Image quality (browser rendering, 2026-11-20)

The Figma source is **666 × 412**. The 2880 × 1782 export enlarges it and adds **no detail**.

- **Sharpness:** visibly soft at every size. Desktop enlarges the source about ×2.16 (and ×4.3 on
  2× screens): the hologram panels' small text is a blur and edges are soft. Mobile and Tablet
  crop to the centre and enlarge it more (Mobile ×1.31 of the source height, then cover-cropped).
  The softness matches Figma, which enlarges the same source. **Remaining visual-quality
  limitation:** a sharper image needs a higher-resolution original from the designer. No AI
  upscaling was done (owner approval would be required).
- **Cropping:** as Figma at every width (contain at 1280 and 1440; cover at 1024, 768, 390, 320).
- **Colour:** Figma's own filtered export (no CSS grade); the measured mean difference from Figma
  renders is 5.6–14.1 of 255, from the fades and antialiasing.
- **Glow integration:** the cobalt ambient sits behind the image and shows only in the contain
  margins. The top and bottom fades blend the edges into the page. No colour clash.
- **Seams:** at 1280 (contain, 1280 × 792 in 900) about 54 px of page shows under the image, and
  the original image's own rounded dark frame is visible along its edges. It comes from the
  source image (also visible, smaller, at 1440). It is not a rendering seam.

## 5b. Production gate (unchanged)

`HERO_IMAGE.provisional = true`: production renders the existing dark fallback (Near Black with
the ambient glow); development and preview show the image. To activate it in production, all of
these are needed:

1. owner visual approval of the merged implementation (this report, the screenshots and the Tablet
   correction);
2. a separate change setting `provisional: false` in `src/features/landing/model/hero-media.ts`,
   with CI green;
3. the release blocker "English copy approval (P07-D1) and Hero image verification (P07-D21)"
   updated.

## 6. Evidence

Local captures (git-ignored) in `assets/review/static-hero-2026-11-20/` (before the Tablet
correction) and `assets/review/static-hero-final-2026-11-20/` (final, with
`tablet-contrast-before-*`, `tablet-contrast-after-*`, `tablet-contrast-compare-*` and the 1:1
`quality-*` crops):

- `after-*`: the Hero at 1440, 1280, 1024, 768, 390 and 320, ar and en, including reduced motion;
- `before-*`: the provisional video;
- `figma-*`: Figma renders;
- `compare-figma-vs-after-*`: side by side with Figma;
- `report-static-hero.json`: the measurements.
