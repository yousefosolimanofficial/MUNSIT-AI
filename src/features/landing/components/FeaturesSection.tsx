import { FeatureCard, type FeatureCardProps } from "./FeatureCard";

/*
 * Features section content (Phase 07; Figma Desktop `114:6`, Tablet `200:591`, Mobile `200:745`).
 * Server Component; holds no copy. Specification: docs/phases/phase-07-mariam-contract.md §4.3.
 *
 * Rendered inside the page's `<section id="features">` (LandingPage), so it sets no `id` and is
 * not a `<section>` itself.
 *
 * | Breakpoint    | Padding (block / inline) | Gap | Intro                    | Grid                |
 * | ------------- | ------------------------ | --- | ------------------------ | ------------------- |
 * | Desktop (xl)  | 64 / — (content 1200)    | 40  | 900, heading 40, desc 24 | 3 × 2, gap 24       |
 * | Tablet (rail) | 64 / 32                  | 32  | 704, heading 32, desc 18 | 2 per row, gap 20   |
 * | Mobile        | 48 / 20                  | 28  | 350, heading 26, desc 15 | 1 column, gap 16    |
 *
 * Columns are equal fractions, so at the Figma frames the cards are 384 / 342 / 350 wide, and the
 * grid follows the viewport between them (no overflow at 320). Card 01 sits at the inline start
 * (right in RTL); the grid mirrors in LTR.
 *
 * Line breaking only (no copy or size change): the heading is `text-wrap: balance`; the intro
 * description is `text-wrap: pretty` (no one-word line) and `balance` on Desktop, where the 900
 * centred box reads best as even lines. Unsupported browsers fall back to normal wrapping.
 */

export interface FeaturesSectionProps {
  heading: string;
  /** Contains "\n" (Figma line break): rendered with `white-space: pre-line`. */
  description: string;
  /** 6 cards, in Figma order. */
  items: readonly FeatureCardProps[];
}

export function FeaturesSection({ heading, description, items }: FeaturesSectionProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[28px] px-[20px] py-[48px] rail:gap-[32px] rail:px-[32px] rail:py-[64px] xl:gap-[40px] xl:px-0">
      <div className="mx-auto flex w-full flex-col gap-[16px] text-center text-text-primary rail:max-w-[704px] xl:max-w-[900px]">
        <h2 className="text-landing-heading-section-mobile text-balance rail:text-landing-heading-section-tablet xl:text-landing-heading-section-desktop">
          {heading}
        </h2>
        <p className="text-landing-body-base-mobile text-pretty whitespace-pre-line rail:text-landing-body-large xl:text-landing-body-intro xl:text-balance">
          {description}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-[16px] rail:grid-cols-2 rail:gap-[20px] xl:grid-cols-3 xl:gap-[24px]">
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0">
            <FeatureCard {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
