/*
 * Hero media (Phase 07).
 *
 * P07-D21 (owner decision 2026-11-20): the Hero uses the ORIGINAL static Figma image
 * (`HERO_IMAGE`). The video plan is superseded: the Hero no longer renders a video, a poster or the
 * Pause/Play control. The video model, `HeroVideo` and the provisional files under
 * `public/landing/hero/` are kept unreferenced, as history (docs/phases/phase-07-hero-media.md).
 */

export interface HeroImage {
  src: string;
  width: number;
  height: number;
  /** Not yet verified by the owner for production (hidden in production, see gates.ts). */
  provisional?: boolean;
}

/**
 * The original Hero background from Figma (P07-D21). It is the image fill of
 * "Hero / Video Container" in Desktop `28:3`, Tablet `200:559` and Mobile `200:713`, image hash
 * `0c56986f38980fa0b0a789a58f2909124affd790` (the SHA-1 of the 666 × 412 original). Exported by
 * Figma at 2× with its image filters baked in (exposure −0.27, saturation 0.79, highlights −1,
 * shadows −0.12), so no CSS grade or overlay is added (P07-D8). Figma's FIT letterbox rows were
 * cropped, leaving the image's own 1.6165 aspect, and the result was encoded as WebP q90.
 * `next/image` serves resized variants.
 *
 * Framing, as Figma: Desktop FIT (contain), Tablet and Mobile FILL (cover), centred.
 * `provisional` keeps the existing production gate closed until the owner verifies the
 * implementation; then set it to `false`.
 */
export const HERO_IMAGE: HeroImage = {
  src: "/landing/hero/hero-figma-2880x1782.webp",
  width: 2880,
  height: 1782,
  provisional: true,
};

/*
 * Hero video media (superseded by P07-D21; not rendered). Former production brief:
 * docs/phases/phase-07-hero-video-brief.md.
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
