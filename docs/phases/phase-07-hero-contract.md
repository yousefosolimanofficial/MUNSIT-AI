# Phase 07 — Increment 2: Hero implementation contract

- **Status:** **APPROVED** (owner, 2026-11-19), with decisions P07-D14 to P07-D16 (§8).
  Implementation: Increment 2 (`feat/phase-07-landing-hero`). No video is generated.
- **Sources:**
  - Figma Hero Desktop `28:3`, Tablet `200:559`, Mobile `200:713` (read-only; values in
    [design-values §16.1](../design-values.md));
  - [video brief](phase-07-hero-video-brief.md);
  - plan §6 decisions D-P07-HERO-01 and P07-D7 to P07-D11.
- **Composition:** the approved Figma Hero composition is preserved. The heading, description and
  buttons are real HTML above the video.

## 1. Files (Yousef; not delegated)

```
src/features/landing/components/LandingHero.tsx        Server: text, CTAs, layout
src/features/landing/components/HeroVideo.tsx          Client: video, poster, reduced motion, Pause/Play
src/features/landing/components/LandingHero.test.tsx
src/features/landing/components/HeroVideo.test.tsx
tests/e2e/landing-hero.spec.ts
```

`LandingPage.tsx`: the Hero renders inside the existing `#top` boundary, which already reserves
the Figma box. The visually hidden `h1` becomes the visible heading.

## 2. Layout (Figma)

| Item          | Desktop (xl+)                                        | Tablet (rail–xl)                   | Mobile (< rail)                               |
| ------------- | ---------------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| Box           | 100% × 900, starts at y 0, under the floating header | 100% × 640, 32 below the 78 header | 100% × 538, 24 below the 70 header            |
| Video layer   | Full bleed, radius 0, clipped                        | Same                               | Same, on a Void Black base                    |
| Content       | Column, centred; padding 344 / 340 / 126; gap 132    | Padding 200 / 32 / 100; gap 56     | Padding 150 / 20 / 64; gap 40                 |
| Heading block | Max 760 wide; gap 36 (heading text box 651)          | 704 wide; gap 36                   | 350 wide; gap 36                              |
| Actions       | Row, centred, gap 37, padding inline 48              | Same                               | Column, full width 350, gap 12, primary first |

**Widths between breakpoints:**

- the text column keeps its maximum width and centres;
- the side padding never goes below 32 (Tablet) or 20 (Mobile);
- the box heights are as drawn per breakpoint (min-height, so text never clips at 320).

## 3. Typography and colour (tokens from Increment 1)

| Element        | Desktop                                                | Tablet                                                                              | Mobile                                                 |
| -------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Heading (`h1`) | `text-heading-display` (56 / 1.2, 600), white, centred | **44 / 1.2, 600**: Figma has **no style** here, so a Landing-local value (recorded) | `text-landing-heading-section-tablet` (32 / 1.2)       |
| Description    | `text-heading-medium` (24 / 1.4, 600), white 90%       | `text-landing-label-title` (20 / 1.4, 600), white 90%                               | `text-landing-label-strong` (16 / 1.4, 600), white 90% |
| Buttons        | `text-ui-button` (20 / 1.4, 500)                       | Same                                                                                | Same                                                   |

**Buttons:** these are not the shared `Button`, whose fixed height is 44 (contract §2). The Hero
buttons are 46 and 48 high with radius 16, as drawn, so they are Landing-local.

| Button                                     | Spec                                                                                    | Target                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Primary "ابدأ مجانًا" (inline start in RTL) | 131 × 46, Mist `#e6e6e6` fill, 1px Iron `#454647`, radius 16, padding 9 / 21, Ink label | `ROUTES["auth.register"]` (P07-D3: no plan, no purchase wording) |
| Outline "اكتشف كيف يعمل"                   | 186 × 48, no fill, 1px Mist, radius 16, padding 9 / 13, white label                     | `#how-it-works`                                                  |
| Mobile                                     | Both 350 wide; primary above outline                                                    | —                                                                |

Focus: the D-B2 ring. Hover is not designed: no change.

## 4. Video (D-P07-HERO-01, P07-D9, P07-D10)

- **Element:**

  ```html
  <video
    muted
    loop
    playsinline
    preload="metadata"
    poster="…"
    aria-hidden="true"
    tabindex="-1"
  ></video>
  ```

  - **Sources:** `<source media="(max-width: 44.99rem)">` for the **portrait** master (WebM, then
    MP4), then the **landscape** master (WebM, then MP4).
  - **Framing:** `object-fit: cover`, with `object-position` per breakpoint, tuned on the real
    asset (default `center`).

- **Playback:** started from the client after hydration (`play()`), and only when motion is
  allowed and the user has not paused it. No `autoplay` attribute, so reduced motion never shows a
  first moving frame.
- **No audio track.** Muted is still set, for autoplay policies.
- **Assets:** delivered per the brief and stored under `public/landing/hero/`. **Until they are
  approved, the Hero renders on Void Black with no video and no image** (no invented asset).
  Using the Figma placeholder still as an interim poster would need owner approval (§8, P07-D14).

## 5. Poster, reduced motion, Pause/Play (P07-D7, WCAG 2.2.2)

- **Poster:** the approved first frame, Desktop 1920 × 1200 and Mobile 1080 × 1490, AVIF or WebP
  with a JPEG fallback. It shows before playback, when autoplay is blocked, and under reduced
  motion.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, the video never plays, the poster
  stays, and the Pause/Play control is not rendered (nothing moves).
- **Pause/Play control:**
  - **Element:** a `<button>` with an `aria-label` that names the action, swapped with the state.
    It works by keyboard and has the D-B2 focus ring. Pausing stops on the current frame, and the
    choice is kept for the session (`sessionStorage`).
  - **Placement:** the bottom inline-end corner of the Hero, **outside** the text and CTA safe
    areas, at every breakpoint. Proposed inset 24 (Desktop, Tablet) and 12 (Mobile). At 390 the
    actions end at y 474 of 538, which leaves room for a 40 control.
  - **Look (P07-D15, approved):** 40 × 40 circle, Void Black 60% fill, 1px Mist 30% border,
    white pause or play icon 16. It meets WCAG 2.5.8 (≥ 24) and a 3:1 non-text contrast against
    the video.
  - **Copy (P07-D15, approved):**
    - "إيقاف الفيديو مؤقتًا" / "Pause background video";
    - "تشغيل الفيديو" / "Play background video".
  - **Icons:** `play` exists in the icon set (Figma `2205:83`, never mirrored). **`pause` does
    not.** It is exported from Figma if it exists there, otherwise owner approval is needed for a
    simple geometric icon (§8).

## 6. Contrast validation (P07-D8)

Measured on **real frames** before merge: the first, beat 1 to 3 peaks, the last, and the poster,
at 1440, 768 and 390. For each element, the luminance of the brightest background under its box is
compared with the white text:

| Element                                     | Requirement                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| Heading 56 / 44 / 32 SemiBold               | ≥ 3:1 (large text)                                                      |
| Description 24 (Desktop)                    | ≥ 3:1 (large text)                                                      |
| Description 20 / 16 (Tablet, Mobile)        | **≥ 4.5:1** (600 weight is not counted as bold; treated as normal text) |
| Outline button label (Medium 20) and border | **≥ 4.5:1** label, ≥ 3:1 border                                         |
| Primary button                              | Fixed colours (Ink on Mist), always passing                             |
| Pause/Play control                          | ≥ 3:1 non-text                                                          |

**If any element fails:**

1. fix the grade in the asset;
2. only then, a minimal overlay (P07-D8), documented with its value, breakpoint and the measured
   contrast before and after.

The measurements are recorded in the Increment 2 PR.

## 7. Tests

- **Unit:**
  - copy from props (no copy inside), `h1` level;
  - CTA targets (register route, `#how-it-works`);
  - mobile order (primary first);
  - video attributes (`muted`, `loop`, `playsinline`, `preload`, `aria-hidden`), sources in
    portrait-then-landscape order;
  - the reduced-motion branch (no `play()`, no control);
  - the Pause/Play label swap and session memory;
  - no video element while no asset is approved.
- **E2E (ar and en):**
  - Hero box sizes and offsets at 1440, 768 and 390; heading block and actions positions against
    §2; no overflow at 320;
  - keyboard: Tab reaches the CTAs then the control, and Enter or Space toggles it;
  - emulated reduced motion keeps the video paused, with no control;
  - the desktop header still floats over the Hero;
  - axe;
  - screenshot comparison per breakpoint (poster state).

## 8. Owner decisions (2026-11-19)

| ID      | Decision                                                                                                                                                                                                                                                                                                                                       | Status       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| P07-D14 | **Temporary background:** Near Black `#040506` (Void Black token) until the approved video asset exists. No replacement image is invented, and the temporary background is not presented as the final Hero visual                                                                                                                              | **APPROVED** |
| P07-D15 | **Pause/Play control:** 40 px circle with a dark background consistent with the Design System; labels "إيقاف الفيديو مؤقتًا" / "تشغيل الفيديو" (ar) and "Pause background video" / "Play background video" (en); placed in the approved Hero corner without obstructing the text or CTAs. **Not rendered while no playable video is available** | **APPROVED** |
| P07-D16 | **Pause icon:** a minimal geometric SVG of two vertical bars, in the existing icon styling and tokens. No icon dependency                                                                                                                                                                                                                      | **APPROVED** |

The Tablet heading's local value (44 / 1.2, 600) needs no decision: it is the Figma value, and it
has no text style.
