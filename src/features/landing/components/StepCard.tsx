import Image from "next/image";

import { Ltr } from "@/shared/ui/Ltr";

import type { LandingImage } from "./FeatureCard";

/*
 * Step Card (Phase 07, Figma master `121:32`; properties Number, Title, Description,
 * Show Connector). Server Component; holds no copy.
 * Specification: docs/phases/phase-07-mariam-contract.md §4.2.
 *
 * - Card (outer, border-box): Desktop 282 × 440 · Tablet 342 × 302 · Mobile 350 × 300. The width
 *   comes from the section grid; the Figma heights are minimums (the text sets the height).
 * - 1px Slate border + padding 20 gives the Figma inner width card − 42 (240 / 300 / 308), which
 *   is the width of the number row and the visual.
 * - Number row: number at the inline start (right in RTL), then the connector line filling the
 *   row and a 6 × 6 dot at the inline end. The number is an isolated LTR run (Geist Mono); the
 *   line and dot are decorative.
 * - Line breaking only (no copy, size or height change): the title is `text-wrap: balance`, the
 *   description `text-wrap: pretty` (no one-word last line). Browsers without support fall back
 *   to normal wrapping.
 */

export interface StepCardProps {
  /** "01"–"04"; rendered LTR in Geist Mono. */
  number: string;
  title: string;
  text: string;
  visual: LandingImage;
  /** Figma "Show Connector" (default true). */
  showConnector?: boolean;
}

/**
 * Visual width per breakpoint (contract §4.2). Tablet: two columns in 100vw − 2 × 32 padding −
 * 20 gap, minus 42 (= 300 at 768). Mobile: 100vw − 2 × 20 padding − 42 (= 308 at 390).
 */
const VISUAL_SIZES =
  "(min-width: 80rem) 240px, (min-width: 45rem) calc(50vw - 84px), calc(100vw - 82px)";

export function StepCard({ number, title, text, visual, showConnector = true }: StepCardProps) {
  return (
    <div
      data-landing-card="step"
      className="flex h-full min-h-[300px] w-full flex-col gap-[12px] rounded-lg border border-neutral-slate bg-surface-ink p-[20px] rail:min-h-[302px] xl:min-h-[440px]"
    >
      <div className="flex h-[14px] w-full shrink-0 items-center gap-[8px]">
        <span className="shrink-0 font-mono text-landing-mono-step text-accent-electric-sky">
          <Ltr>{number}</Ltr>
        </span>
        {showConnector ? (
          <>
            <span
              aria-hidden="true"
              data-step-connector="line"
              className="h-px min-w-0 flex-1 bg-accent-info-blue"
            />
            <span
              aria-hidden="true"
              data-step-connector="dot"
              className="size-[6px] shrink-0 rounded-full bg-accent-info-blue"
            />
          </>
        ) : null}
      </div>
      <div className="relative h-[136px] w-full shrink-0 overflow-hidden rounded-md bg-surface-obsidian">
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes={VISUAL_SIZES}
          className="object-cover"
        />
      </div>
      <h3 className="text-start text-landing-card-title text-balance text-text-primary">{title}</h3>
      <p className="text-start text-landing-body-base-mobile text-pretty text-text-secondary rail:text-landing-body-base xl:text-landing-body-large">
        {text}
      </p>
    </div>
  );
}
