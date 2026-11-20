/*
 * Hero video media (Phase 07; D-P07-HERO-01, P07-D10, P07-D14). Production brief:
 * docs/phases/phase-07-hero-video-brief.md.
 *
 * Adding an asset: put the files under `public/landing/hero/` and set `HERO_VIDEO` below. The Hero
 * renders the video, the poster and the Pause/Play control from this object.
 */

export interface HeroVideoSource {
  /** WebM (VP9 or AV1), tried first when present. */
  webm?: string;
  /** MP4 (H.264, `faststart`), always present. */
  mp4: string;
}

export interface HeroVideoAsset {
  /** Landscape master: Desktop and Tablet (cover crop to 6:5 on Tablet). Brief: 16:10, 2560 × 1600
   *  (minimum 1920 × 1200). */
  landscape: HeroVideoSource;
  /** Portrait master (brief: 1080 × 1490, ≈ 0.725) for Mobile (< 720). Optional: without it,
   *  Mobile plays no video and downloads none (the Hero keeps its background there). */
  portrait?: HeroVideoSource;
  /** First frame of the loop in the final grade: shown before playback, if autoplay is blocked,
   *  and under reduced motion. Each applies where its master applies. */
  poster: { landscape: string; portrait?: string };
  /** `object-position` per orientation, tuned on the real asset (default "center"). */
  position?: { landscape?: string; portrait?: string };
  /** A development asset not approved for production (hidden in production, see gates.ts). */
  provisional?: boolean;
}

/**
 * PROVISIONAL development asset (owner instruction 2026-11-20; not production-approved).
 *
 * Derived from the owner's local file `assets/Create_AI_application_background…_c639c423.mp4`
 * (1280 × 720 H.264, 10 s, with an audio track): audio and padding removed; a highlight-compressing,
 * desaturating grade baked in (P07-D8: grade first, no CSS overlay); a seamless 9 s loop made by a
 * 1 s crossfade of the end into the start; native 1280 × 720 kept (no upscale). Inspection and
 * measurements: docs/phases/phase-07-hero-media.md.
 *
 * No portrait master exists, so Mobile shows no video.
 */
export const HERO_VIDEO: HeroVideoAsset | null = {
  landscape: {
    webm: "/landing/hero/hero-ambient-1280x720.webm",
    mp4: "/landing/hero/hero-ambient-1280x720.mp4",
  },
  poster: { landscape: "/landing/hero/hero-ambient-poster-1280x720.webp" },
  provisional: true,
};

/** Portrait sources apply below the `rail` breakpoint (45rem = 720px, ADR-004). */
export const HERO_PORTRAIT_MEDIA = "(max-width: 44.99rem)";
/** Landscape-only assets are restricted to `rail` and up, so Mobile downloads nothing. */
export const HERO_LANDSCAPE_MEDIA = "(min-width: 45rem)";
