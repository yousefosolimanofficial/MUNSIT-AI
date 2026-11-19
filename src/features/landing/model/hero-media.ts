/*
 * Hero video media (Phase 07 Increment 2; D-P07-HERO-01, P07-D10, P07-D14). Production brief:
 * docs/phases/phase-07-hero-video-brief.md.
 *
 * Adding the approved asset: put the files under `public/landing/hero/` and set `HERO_VIDEO`
 * below. Nothing else changes: the Hero renders the video, the poster and the Pause/Play control
 * from this object.
 */

export interface HeroVideoSource {
  /** WebM (VP9 or AV1), tried first when present. */
  webm?: string;
  /** MP4 (H.264, `faststart`), always present. */
  mp4: string;
}

export interface HeroVideoAsset {
  /** 16:10 master (2560 × 1600, minimum 1920 × 1200): Desktop and Tablet (cover crop to 6:5). */
  landscape: HeroVideoSource;
  /** Portrait master (1080 × 1490, ≈ 0.725): Mobile (< 720). */
  portrait: HeroVideoSource;
  /** First frame in the final grade: shown before playback, if autoplay is blocked, and under
   *  reduced motion. Landscape 1920 × 1200, portrait 1080 × 1490. */
  poster: { landscape: string; portrait: string };
  /** `object-position` per orientation, tuned on the real asset (default "center"). */
  position?: { landscape?: string; portrait?: string };
}

/**
 * The approved Hero video. `null` until the asset is approved (P07-D14): the Hero shows the
 * Near Black background (`#040506`), and neither a video nor a Pause/Play control is rendered.
 * The temporary background is not the final Hero visual.
 */
export const HERO_VIDEO: HeroVideoAsset | null = null;

/** Portrait sources apply below the `rail` breakpoint (45rem = 720px, ADR-004). */
export const HERO_PORTRAIT_MEDIA = "(max-width: 44.99rem)";
