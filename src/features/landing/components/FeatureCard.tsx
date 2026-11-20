import Image from "next/image";

/*
 * Feature Card (Phase 07, Figma master `114:2`). Server Component; holds no copy.
 * Specification: docs/phases/phase-07-mariam-contract.md §4.1.
 *
 * - Card (outer, border-box): Desktop 384 × 300 · Tablet 342 × 288 · Mobile 350 × 286. The width
 *   comes from the section grid; the Figma heights are minimums (the text sets the height).
 * - Padding: Figma pads 24 from the outer edge and its stroke takes no layout space, so the
 *   visual is card − 48 (336 / 294 / 302). In CSS the 1px border is inside the box, so the
 *   padding is 23 to keep the same 24 offset and the same visual width.
 * - Border `#363739`: Landing-local value, approved (contract §4; design-values §16.5).
 * - Line breaking only (no copy, size or height change): the title is `text-wrap: balance`; the
 *   description is `text-wrap: pretty`, so a wrap never leaves one word alone before a Figma "\n"
 *   or at the end. Browsers without support fall back to normal wrapping.
 */

export interface LandingImage {
  src: string;
  alt: string;
}

export interface FeatureCardProps {
  title: string;
  /** May contain "\n" (Figma line breaks): rendered with `white-space: pre-line`. */
  text: string;
  visual: LandingImage;
}

/**
 * Visual width per breakpoint (contract §4.1). Tablet: two columns in 100vw − 2 × 32 padding −
 * 20 gap, minus 48 (= 294 at 768). Mobile: 100vw − 2 × 20 padding − 48 (= 302 at 390).
 */
const VISUAL_SIZES =
  "(min-width: 80rem) 336px, (min-width: 45rem) calc(50vw - 90px), calc(100vw - 88px)";

export function FeatureCard({ title, text, visual }: FeatureCardProps) {
  return (
    <div
      data-landing-card="feature"
      className="flex h-full min-h-[286px] w-full flex-col gap-[12px] rounded-lg border border-[#363739] bg-surface-ink p-[23px] rail:min-h-[288px] xl:min-h-[300px]"
    >
      <div className="relative h-[144px] w-full shrink-0 overflow-hidden rounded-md bg-surface-obsidian">
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes={VISUAL_SIZES}
          className="object-cover"
        />
      </div>
      <h3 className="text-start text-landing-card-title text-balance text-text-primary">{title}</h3>
      <p className="text-start text-landing-body-feature-mobile text-pretty whitespace-pre-line text-text-secondary rail:text-landing-body-feature-tablet xl:text-landing-body-feature-desktop">
        {text}
      </p>
    </div>
  );
}
