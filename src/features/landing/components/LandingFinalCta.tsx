import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";

import { AMBIENT, CTA_GLOW, FOCUS_RING, INTERACTIVE_TRANSITION } from "./landing-styles";

/*
 * Final CTA (Phase 07 Increment 5; Figma Desktop panel `126:104`, Tablet `200:651`, Mobile `200:800`).
 *
 * Panel: Obsidian, 1px Slate, radius 24; Desktop 1200 wide, padding 80 / 64, gap 24; Tablet padding
 * 56 / 32, gap 24; Mobile padding 40 / 20, gap 20. Glow: Figma's Cobalt Edge 20% ellipse (blurred
 * 120) as a radial gradient (no blur filter). Heading `Landing/Heading/Section` 40 / 32 / 26;
 * description `Body/Lead` 20 (560 wide) / `Body/Large` 18 / `Base Mobile` 15, Text/Secondary.
 *
 * Actions (Figma order): "ابدأ الآن" first (P07-D24; Figma "ابدأ مجانًا"), "اكتشف المميزات" second; a row with gap
 * 16 on Desktop and Tablet, a full-width column with gap 12 on Mobile. Both 48 high, radius 8,
 * padding 28: the primary is Mist with an Iron label → the Register route (P07-D3); the outline
 * has a Slate border and a white label → `#features`. Hover: the approved CTA transitions.
 */

export interface LandingFinalCtaCopy {
  heading: string;
  description: string;
  primary: string;
  secondary: string;
}

const BUTTON = [
  "inline-flex h-[48px] w-full items-center justify-center rounded-lg px-[28px] whitespace-nowrap text-landing-button-default rail:w-auto",
  INTERACTIVE_TRANSITION,
  FOCUS_RING,
].join(" ");

export function LandingFinalCta({ copy }: { copy: LandingFinalCtaCopy }) {
  return (
    <div
      className="relative isolate mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[20px] overflow-hidden rounded-[24px] border border-neutral-slate bg-surface-obsidian px-[20px] py-[40px] text-center rail:gap-[24px] rail:px-[32px] rail:py-[56px] xl:px-[64px] xl:py-[80px]"
      data-cta-panel=""
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={AMBIENT.ctaGlow}
        data-cta-glow=""
      />
      <h2
        id="landing-cta-heading"
        className="text-landing-heading-section-mobile text-text-primary rail:text-landing-heading-section-tablet xl:text-landing-heading-section-desktop"
      >
        {copy.heading}
      </h2>
      <p className="text-landing-body-base-mobile xl:max-w-[560px] text-text-secondary rail:text-landing-body-large xl:text-landing-body-lead">
        {copy.description}
      </p>
      <div className="flex w-full flex-col gap-[12px] rail:w-auto rail:flex-row rail:gap-[16px]">
        <Link
          href={ROUTES["auth.register"]}
          data-cta-action="primary"
          className={`${BUTTON} bg-neutral-mist text-neutral-iron hover:bg-text-primary ${CTA_GLOW}`}
        >
          {copy.primary}
        </Link>
        <a
          href="#features"
          data-cta-action="secondary"
          className={`${BUTTON} border border-neutral-slate text-text-primary hover:border-accent-electric-sky hover:bg-accent-electric-sky/10`}
        >
          {copy.secondary}
        </a>
      </div>
    </div>
  );
}
