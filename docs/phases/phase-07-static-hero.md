# Phase 07 — Static Figma Hero image (P07-D21)

Status: **IMPLEMENTATION COMPLETE** (PR #60, merged as `c712bd7`, 2026-11-20). **Production
activation is not approved**: the gate stays **closed** until owner visual approval (§5b). Open
visual-quality review item: the 666 × 412 source resolution (§5a).

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
  **Final accessibility corrections (owner instruction 2026-11-20, before merge).** Two remaining
  failures were corrected the same way: a soft, localized radial scrim drawn as the text's own
  `::before` layer, with no change to the image, cropping, glows, dimensions, typography or positions.

- **Heading (large text, 3:1):** small clusters of bright hologram glints near the start of its
  first line failed. They covered 17–72 px (0.02–0.11%) on Desktop and upper Tablet, and 1–3 px at
  719–768.
  - Correction: `AMBIENT.heroHeadingScrim`, 20% with a wide flat core (75%, 120 px beyond the
    heading at each side), on every breakpoint.
  - Strength: 0.15 and a narrower core fail on Desktop; 0.25 only adds margin.
- **English Mobile description (16 px, 4.5:1):** at 320, the fifth line crossed a bright area
  (0.95% of the pixels).
  - Correction: `AMBIENT.heroTextScrimMobile`, 30%, under 720 px.
  - Strength: 0.25 leaves only 0.07.
  - Arabic Mobile layout is unchanged; its pixels are slightly darker behind the text.
- **Unchanged:** the Tablet description (40%) and the Desktop description (no scrim: 24 px is large
  text, already at or above 3:1).

Composited page, minimum pixel (before → after):

| Width | Heading ar  | Heading en  | Description ar (threshold) | Description en (threshold) |
| ----- | ----------- | ----------- | -------------------------- | -------------------------- |
| 320   | 3.71 → 5.30 | 4.07 → 5.73 | 4.98 → 7.64 (4.5)          | **3.41 → 4.89** (4.5)      |
| 390   | 3.01 → 4.40 | 3.87 → 5.52 | 4.91 → 7.58 (4.5)          | 5.13 → 7.22 (4.5)          |
| 719   | 3.00 → 4.43 | 3.76 → 5.41 | 5.49 → 8.15 (4.5)          | 4.93 → 7.58 (4.5)          |
| 720   | 3.19 → 4.64 | 2.96 → 4.31 | 5.85 (unchanged, 4.5)      | 4.68 (unchanged, 4.5)      |
| 768   | 3.24 → 4.72 | 2.93 → 4.30 | 6.22 (unchanged, 4.5)      | 6.54 (unchanged, 4.5)      |
| 1024  | 3.05 → 4.48 | 2.76 → 4.10 | 6.02 (unchanged, 4.5)      | 6.36 (unchanged, 4.5)      |
| 1279  | 2.75 → 4.07 | 2.72 → 4.03 | 4.86 (unchanged, 4.5)      | 5.53 (unchanged, 4.5)      |
| 1280  | 2.78 → 4.07 | 2.78 → 3.68 | 3.28 (unchanged, 3, large) | 3.27 (unchanged, 3, large) |
| 1440  | 2.72 → 3.36 | 2.72 → 3.81 | 3.35 (unchanged, 3, large) | 3.21 (unchanged, 3, large) |
| 1920  | 2.70 → 3.22 | 2.72 → 4.03 | 3.35 (unchanged, 3, large) | 3.24 (unchanged, 3, large) |

No pixel under any Hero text's line boxes is below its threshold, at any measured width, in either
language. Geometry is unchanged: heading and image boxes are the same, overflow 0, layout shift 0.

E2E asserts, on the composited page at every pixel:

- the Tablet description at 4.5:1 or more (720, 768, 1024, 1279);
- the Mobile description at 4.5:1 or more (ar and en, 320 and 390);
- the heading at 3:1 or more (ar 390, 768, 1279, 1440, 1920; en 768, 1024, 1440);
- the scrim scope (heading everywhere; description on Mobile and Tablet, not Desktop).

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
