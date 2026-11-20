# Phase 07 — Hero media and Visual Refinement (provisional)

Status: **COMPLETE** (PR #55, merged as `0826ab1`, post-merge CI green; owner accepted
2026-11-20). The video stays a **provisional development asset**: production approval is DENIED
(gate closed) until a product-accurate replacement exists. Owner instruction
2026-11-20: integrate the owner's existing Hero video as a **provisional development asset** and
start the approved Visual Refinement (P07-D17, plan §8e). Nothing here is production-approved.

## 1. Source asset (owner-supplied, not committed)

`assets/Create_AI_application_background…_c639c423.mp4` (the "…" is one U+2026 character;
`assets/` is git-ignored). The original is kept unchanged.

| Property  | Measured (ffmpeg 7.1 probe, full decode, MP4 box parse)                                                |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Size      | 3,564,027 B; SHA-256 `12462666c0c54325bc0f72571557a6405de290126c0c203c48b647968b2f76c4`                |
| Integrity | Full decode, 240 frames, no errors; `moov` before `mdat` (faststart)                                   |
| Video     | H.264 High @ L3.1, 1280 × 720 (16:9), 24 fps, 10.0 s (container 10.03 s), ~1.9 Mbps                    |
| Audio     | AAC-LC stereo, 48 kHz, 128 kbps                                                                        |
| Container | ~0.99 MB `free` padding; C2PA content-credentials `uuid` box; "ISO Media file produced by Google Inc." |

**Decoded-frame assessment (frames 0, 60, 120, 180, 239 and per-frame metrics):**

- Content: a generic **English, left-to-right** "AI lecture" dashboard with AI-generated
  pseudo-text (for example "Add coents") and small photographic faces. It does **not** show the
  MUNSIT Arabic interface. Owner content review is required (brief §3: no invented features).
- Motion: one continuous slow push-in with UI highlight animations; no cuts (largest
  frame-to-frame mean difference 2.66, mean 1.08).
- Loop: **not seamless** as delivered. Last-to-first difference 15.3, about 14× a normal frame
  step: a visible jump on every loop.
- Quality: clean at 1280 × 720; soft when covered to 1440 × 900 (scaled ×1.25). No upscale was
  made.
- Contrast behind the Hero text (ungraded): median background luminance 0.0125 (white ≈ 16:1),
  but bright UI glints under the text boxes reach luminance 1.0 (white ≈ 1:1) at the worst frame.
- Cropping: Desktop (16:10 viewport) crops ~5% each side; Tablet 6:5 crops ~21% each side (the
  window edges leave the frame). Mobile: no portrait master exists (a 0.725 crop would be
  ~522 × 720, below the brief's 1080 × 1490), so **Mobile shows no video**.

## 2. Derivatives (committed, `public/landing/hero/`)

Processing (ffmpeg 7.1 from imageio-ffmpeg; no project dependency):

1. **Seamless loop:** frames 24–239, with the last second crossfaded into frames 0–23 (`xfade`,
   1 s): a 9.0 s, 216-frame loop. Seam after: last-to-first difference 1.49 (normal step 0.72).
   Trade-off: a one-second dissolve between the zoomed-in end and the zoomed-out start.
2. **Grade baked in (P07-D8: grade first, no CSS overlay):** saturation 0.85 and a
   highlight-compressing curve `0/0 0.3/0.24 0.6/0.33 1/0.36` (shadows kept; whites to 36%).
3. **Audio removed, metadata and padding dropped** (`-an -map_metadata -1`, new container).
4. **Native 1280 × 720**, 24 fps, keyframe every 2 s.

| File                                   | Codec                                          | Size      | SHA-256 (first 16) |
| -------------------------------------- | ---------------------------------------------- | --------- | ------------------ |
| `hero-ambient-1280x720.webm` (first)   | VP9, CRF 36, no audio                          | 406,607 B | `0292cbb9c99df52c` |
| `hero-ambient-1280x720.mp4` (fallback) | H.264 High @ L3.1, CRF 23, faststart, no audio | 884,238 B | `601abcc2179ccf20` |
| `hero-ambient-poster-1280x720.webp`    | WebP q82 (first frame of the loop)             | 20,726 B  | `45d00b08b6aeca65` |

Both videos decode fully with no errors and contain no audio stream. Quality against the
lossless graded master: SSIM 0.9900 (MP4) and 0.9896 (WebM).

## 3. Contrast on real frames (Hero contract §6)

Brightest background luminance under each element's live box (measured at 1440 and 768 in
Chromium), over **all 216 frames**; white text contrast at that maximum:

| Element (requirement)                | Ungraded | Graded MP4 | Graded WebM |
| ------------------------------------ | -------- | ---------- | ----------- |
| Heading, Desktop (≥ 3:1)             | 1.01     | 5.62       | 5.55        |
| Description 24, Desktop (≥ 3:1)      | 1.11     | 5.66       | 5.75        |
| Outline CTA label, Desktop (≥ 4.5:1) | 1.00     | 5.59       | 5.19        |
| Heading, Tablet (≥ 3:1)              | 1.01     | 5.03       | 4.90        |
| Description 20, Tablet (≥ 4.5:1)     | 1.09     | 5.66       | 5.46        |
| Outline CTA label, Tablet (≥ 4.5:1)  | 1.00     | 5.55       | 5.19        |

Every element passes at the single brightest pixel of every frame, so **no overlay is added**.
The bottom and top fades are decorative edge blends outside the text boxes (they only darken).
The Pause/Play control keeps its own dark fill and border (≥ 3:1 non-text).

## 4. Integration

- `HERO_VIDEO` (`model/hero-media.ts`) is set, `provisional: true`. **Production hides it**
  (`isHeroVideoVisible`, gates.ts): production keeps the Near Black Hero until the owner approves
  a production video.
- Landscape-only asset: `<source media="(min-width: 45rem)">` (WebM first, then MP4). Mobile
  matches no source and **downloads nothing**; the poster is a CSS background declared from
  720 px up, so Mobile never fetches it either.
- Reduced motion (and the server render): **no `<video>` element at all**, so no video download;
  the poster shows. No `autoplay` attribute; playback starts with `play()` when motion is allowed.
- Muted, `loop`, `playsInline`, `preload="metadata"`, `aria-hidden`, not focusable; it fades in
  (opacity, 400 ms) once playing. Pause/Play: unchanged (P07-D15), remembered for the session.
- Copy, typography, CTA positions and destinations: unchanged.

## 5. Visual Refinement implemented (P07-D17)

- **Ambient:** radial gradients from the Cobalt Edge and Electric Sky tokens only (no cyan, no
  blur filters) behind the Hero (visible on Mobile, before playback and under reduced motion),
  the Showcase (light diffusing around the app window, a soft bloom behind the intro) and Use
  Cases (washes in the margins). Glow centres are placed so every gradient reaches transparent
  before its section edge: no seams. Layers sit inside their sections (no overflow).
- **Hero edges:** top and bottom fades into the Near Black base.
- **Scroll reveal:** content below the fold fades up 12 px once (400 ms, approved curve). Content
  on screen at load is never hidden; nothing happens under reduced motion or without JavaScript;
  focusing content reveals it; no layout shift (measured CLS 0 at 1440 and 390, load + full
  scroll). Glows fade in with their section. No continuous decorative animation (motion
  foundation).
- **Hover** (hover-capable pointers only): primary CTA lighter fill and a soft Electric Sky glow;
  outline CTA, login and language: Electric Sky border and 10% tint; navigation links: Electric
  Sky text. Colour, border and shadow only (no movement).
- **P07-D17 kept:** the Showcase waveform and recording dot have no animation (tested).

## 6. Navigation centring (measured, Chromium)

| Viewport | Bar      | Left / right margin | Bar centre vs viewport centre | Links-group centre offset    |
| -------- | -------- | ------------------- | ----------------------------- | ---------------------------- |
| 1440     | floating | 39.0 / 39.2         | −0.1 px                       | 21.6 px (toward the actions) |
| 1280     | floating | 39.0 / 39.2         | −0.1 px                       | 21.6 px                      |
| 1024     | compact  | 0 / 0 (full width)  | 0                             | — (links in the menu)        |
| 768      | compact  | 0 / 0               | 0                             | —                            |
| 390      | compact  | 0 / 0               | 0                             | —                            |

(Measured in a browser with a 15 px classic scrollbar; margins are relative to the client width.)

- **Geometric centring: correct** (within 0.1 px); unchanged.
- **Optical balance:** the link group is centred in the space between the actions and the logo,
  as drawn in Figma ("centred in the remaining width", Increment 1), so its centre sits 21.6 px
  from the page centre. This is the approved composition, not a defect; it is **not changed**.
  Centring the links on the bar instead is a one-line change, proposed for owner decision.
- RTL and LTR mirror through logical properties; the compact bars are full width.

## 7. Open owner decisions

1. **Video content:** English pseudo-UI and faces, not the MUNSIT Arabic interface. Approve as a
   placeholder, or commission a product-accurate video (brief §3).
2. **Resolution:** 1280 × 720, below the brief minimum (1920 × 1200, 16:10). Accept or regenerate.
3. **Loop treatment:** the 1 s crossfade dissolve. Accept, or regenerate with a true
   first-frame = last-frame loop.
4. **Portrait master** for Mobile (none exists; nothing invented).
5. **Navigation links:** keep Figma's placement (default) or centre the links on the bar.
6. Production approval of the video (then set `provisional: false`).

## 8. Next: dedicated Hero Video Review (owner request 2026-11-20)

Scheduled after the Landing sections are complete; not part of Increment 5. The production gate
stays closed throughout. Tracked in the existing ClickUp Hero tasks (production approval and
release blocker `123ru7v2pnv`, Mobile portrait `123ru7v2pm8`).

1. Review the completed Landing page visually (all sections, 1440 / 768 / 390, ar and en).
2. Inspect the current provisional Hero video in the page.
3. Evaluate the 9 s loop and its 1 s crossfade in a real browser (not only frame metrics).
4. Compare the video with the authentic MUNSIT AI interface (Arabic, RTL, real screens).
5. Prepare a high-quality landscape replacement (16:10, preferably ≥ 1920 × 1200; no upscaling).
6. Prepare a dedicated portrait version for Mobile.
7. Evaluate the poster images (landscape and portrait, first frame of the final cut).
8. Check text contrast and CTA readability on real frames (Hero contract §6).
9. Check media performance (sizes, loading, Mobile and reduced-motion behaviour).
10. Request explicit owner approval before enabling production playback (`provisional: false`).
