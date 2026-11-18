# Phase 07 — Hero video: production brief (Google Flow)

- **Status:** **DRAFT for owner review** (Phase 07 Increment 0, 2026-11-19).
- **Decision:** D-P07-HERO-01, a product-focused Hero video (owner, approved). The asset is
  **not produced yet.**
- **Rules:**
  - the Figma Hero is not redesigned;
  - the heading, description and buttons stay real HTML **above** the video;
  - the video is decorative.

Figma values are in [design-values.md §16](../design-values.md). Copy is in
[phase-07-landing-copy.md](phase-07-landing-copy.md).

## 1. What the video must fit (from Figma, read-only)

| Breakpoint | Hero frame          | Aspect                | Video container      | Figma image treatment                                       |
| ---------- | ------------------- | --------------------- | -------------------- | ----------------------------------------------------------- |
| Desktop    | `28:3` 1440 × 900   | **16:10** (1.6)       | full bleed, radius 0 | placeholder `FIT` (contain)                                 |
| Tablet     | `200:559` 768 × 640 | **6:5** (1.2)         | full bleed, radius 0 | placeholder `FILL` (cover)                                  |
| Mobile     | `200:713` 390 × 538 | **≈ 0.725** (195:269) | full bleed, radius 0 | placeholder `FILL` (cover) over a Void Black `#040506` base |

- **Placeholder:** the Figma video container (`Hero Vedio.mp4 — asset pending`) holds a 666 × 412
  still.
- **No overlay layer** is drawn. Legibility comes from **image filters** applied to the still in
  all three frames: exposure −0.27, saturation 0.79 (−21%), highlights −1.0, shadows −0.12.
  **The video must carry an equivalent darker, desaturated grade itself** (§6).

## 2. Content and sequence

Show only features the approved Figma copy names (Features cards 01–03, How It Works steps 01–03).
No invented features, numbers or results.

| #   | Beat                                                        | Figma basis                                  | Indicative time |
| --- | ----------------------------------------------------------- | -------------------------------------------- | --------------- |
| 1   | Live lecture transcription: waveform → lines of text appear | Feature 01 "تفريغ المحاضرات مباشرة"; Step 01 | 0–3 s           |
| 2   | Smart Highlights: key lines are marked                      | Feature 02 "تمييز المعلومات الذكي"; Step 02  | 3–6 s           |
| 3   | AI summary: highlighted lines collapse into a summary card  | Feature 03 "ملخصات ذكية ومنظمة"; Step 03     | 6–9 s           |
| 4   | Final composition: calm, premium product interface at rest  | Showcase app window (`38:6`)                 | 9–12 s → loop   |

## 3. Technical requirements

| Item              | Requirement                                                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duration          | **10–12 s** seamless loop (PROPOSED). Long enough for 4 beats without fast cuts, short enough for a small file                                                                                                                           |
| Masters           | **A. Landscape 16:10**, 2560 × 1600 (minimum 1920 × 1200), for Desktop and Tablet (Tablet crops to 6:5). **B. Portrait ≈ 0.725**, 1080 × 1490, for Mobile, composed separately: a centre crop of A would keep only ~45% of its width     |
| Frame rate        | 24 or 30 fps, constant                                                                                                                                                                                                                   |
| Audio             | **None** (no audio track; it plays muted)                                                                                                                                                                                                |
| Loop              | **First frame = last frame** (same composition, camera at rest), so the loop point is invisible                                                                                                                                          |
| Camera            | Slow, continuous movement only: gentle push-in or parallax drift, no cuts, whip pans, shakes or fast zooms. It returns to the start position for the loop                                                                                |
| Motion style      | Premium cinematic UI motion: soft depth of field, eased transitions, light bloom on accents. **No random decorative effects** (particles, lens flares, glitch)                                                                           |
| Colour            | Base Near Black `#040506` (= Void Black token); Deep Blue `#143CA3` (= Cobalt Edge token); Electric Blue `#63A1FF` (= Electric Sky token); Cyan `#06B6D4` (**not one of the 19 design tokens**: owner decision P07-D9)                   |
| Text in the video | **No readable text.** Represent text as abstract lines and blocks (as the Skeleton pattern does), a waveform, and highlight bars. Real readable UI text, if wanted, must be **composited** from real screens in an editor, not generated |
| Delivery files    | MP4 (H.264, `faststart`) and WebM (VP9 or AV1) per master; **budget PROPOSED:** ≤ 3 MB landscape, ≤ 1.5 MB portrait (measured, not a D-12 target)                                                                                        |

## 4. Safe areas (keep calm and dark: real HTML sits here)

The **text safe area** must stay low-detail and dark enough for white text. Put active UI motion
outside it, or behind it, defocused and dimmed.

| Breakpoint       | Heading block (Figma) | Actions (Figma)               | Text safe area to keep calm                                          |
| ---------------- | --------------------- | ----------------------------- | -------------------------------------------------------------------- |
| Desktop 1440×900 | x 340–1100, y 344–556 | x 495–945, y 688–774          | central column x 24%–76%, y 36%–88%                                  |
| Tablet 768×640   | x 32–736, y 200–398   | x 159–609, y 454–540          | x 4%–96%, y 29%–86% (almost the full width)                          |
| Mobile 390×538   | x 20–370, y 150–328   | x 20–370, y 368–474 (stacked) | x 5%–95%, y 26%–90%: the portrait master keeps motion top and bottom |

**Tablet crop:** a 6:5 cover crop of the 16:10 master keeps the centre **75%** of its width. Keep
key motion inside it.

## 5. First and last frame, poster

- **First frame = last frame:** a dark, composed interface at rest (beat 4 state, desaturated),
  with the text safe area calm.
- **Poster image:** that same frame, in the final grade.
  - Desktop 1920 × 1200 and Mobile 1080 × 1490.
  - AVIF or WebP, with a JPEG fallback.
- **Poster uses:**
  - the HTML `poster`;
  - shown before playback, when autoplay is blocked, or when the user prefers reduced motion or
    data saving.

## 6. Grade and legibility

- **Grade:** the Figma placeholder is darkened and desaturated with image filters. The video must
  have that grade **baked in**. No CSS overlay is invented.
- **Contrast check:** white text contrast over the video is **measured on real frames** before
  merge, at each breakpoint:
  - heading 56 / 44 / 32 and description 24 / 20 / 16 (SemiBold): ≥ 3:1, large text;
  - the outline button label (Medium 20, not large text): **≥ 4.5:1** behind the button.
- **If a frame fails:** fix the grade first. An overlay would need an owner decision (P07-D8).

## 7. Playback and accessibility (implementation requirements)

- **Element:** `autoplay muted loop playsinline`, `preload="metadata"`, no controls overlaying the
  design. Decorative: `aria-hidden="true"`, no captions needed (no speech, no information).
- **Reduced motion:** with `prefers-reduced-motion: reduce`, the video does **not** play, and the
  poster is shown.
- **WCAG 2.2.2 (Pause, Stop, Hide):** moving content that plays for more than 5 s beside other
  content needs a way to pause it. **Figma draws no pause control.** Owner decision P07-D7:
  - add a small, accessible pause/play button (not designed, needs approval); or
  - limit playback so it stops within 5 s and rests on the last frame.
- **Mobile:** serve the portrait master through `<source media>`. Cover cropping follows Figma
  (`FILL`).
- **Desktop fit:** Figma's desktop placeholder uses `FIT`. With a 16:10 master, `cover` and
  `contain` give the same result at 1440 × 900. At other desktop aspect ratios, `cover` is
  recommended (P07-D10).

## 8. Honest limits of Google Flow

- **Text:** generative video **does not render exact UI text reliably**, and Arabic glyphs in
  particular come out distorted. Hence §3: no readable text, or composite real screens.
- **Formats:** output lengths, aspect ratios (commonly 16:9 and 9:16) and resolutions are set by
  the tool and change over time. **Check them at production time.**
  - **Landscape:** produce at 16:9, then crop and extend to 16:10.
  - **Portrait:** produce at 9:16, then crop to ≈ 0.725.
  - **Longer than one clip:** join or extend clips so the loop point stays invisible.
- **Review:** every frame is reviewed for invented UI, wrong colours and artefacts before
  approval.

## 9. Acceptance for the asset

- **Approval:** the owner approves the motion and the first and last frames.
- **Technical:** both masters and both posters are delivered; the loop is seamless; there is no
  audio track.
- **Measured:** file sizes, and text contrast on real frames (§6).
- **Content:** no invented features and no readable generated text.
