/*
 * Landing images (Phase 07 Increment 3). Exported from the Figma originals (read-only; matched by
 * the image hash, the SHA-1 of the bytes) and converted to WebP at the source size. Sources and
 * hashes: docs/design-values.md §16.4.
 */

export interface LandingImage {
  src: string;
  width: number;
  height: number;
}

const SOURCE = { width: 1376, height: 768 } as const;

/** Showcase screen, Figma `App / Main Content` (`39:14`). */
export const SHOWCASE_SCREEN: LandingImage = {
  src: "/landing/showcase/app-live-transcript.webp",
  ...SOURCE,
};

/**
 * Feature visuals, Figma Feature Card instances `114:12`, `114:16`, `114:20`, `114:25`, `114:29`,
 * `114:33` (matched to `landing.features.items` 1–6 by their Figma titles), in card order.
 */
export const FEATURE_IMAGES: readonly LandingImage[] = [
  { src: "/landing/features/live-transcription.webp", ...SOURCE },
  { src: "/landing/features/smart-highlights.webp", ...SOURCE },
  { src: "/landing/features/smart-summaries.webp", ...SOURCE },
  { src: "/landing/features/question-bank.webp", ...SOURCE },
  { src: "/landing/features/ai-tutor.webp", ...SOURCE },
  { src: "/landing/features/lecture-slides.webp", ...SOURCE },
];

/** Step visuals, Figma `HOW_IT_WORKS_01_RECORD` … `HOW_IT_WORKS_04_PRACTICE`, in step order. */
export const STEP_IMAGES: readonly LandingImage[] = [
  { src: "/landing/how-it-works/record.webp", ...SOURCE },
  { src: "/landing/how-it-works/processing.webp", ...SOURCE },
  { src: "/landing/how-it-works/review.webp", ...SOURCE },
  { src: "/landing/how-it-works/practice.webp", ...SOURCE },
];

/** Use Case images, Figma `USE_CASE_01…03` (`123:69`, `123:75`, `123:81`), in row order. */
export const USE_CASE_IMAGES: readonly LandingImage[] = [
  { src: "/landing/use-cases/during-lecture.webp", ...SOURCE },
  { src: "/landing/use-cases/studying.webp", ...SOURCE },
  { src: "/landing/use-cases/exam-preparation.webp", ...SOURCE },
];
