import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import { Ltr } from "@/shared/ui/Ltr";

import { AMBIENT, CTA_GLOW, FOCUS_RING, INTERACTIVE_TRANSITION } from "./landing-styles";

/*
 * Pricing section (Phase 07 Increment 5; Figma component set `131:177`, Tablet `200:640`, Mobile
 * `200:789`; decisions P07-D3, P07-D4, P07-D5, P07-D19).
 *
 * DEVELOPMENT AND PREVIEW ONLY (P07-D4, P07-D19): LandingPage renders this section only where
 * `isPlaceholderPricingVisible` allows it; production never renders it, it is not in the
 * navigation, and no metadata describes it. Content is the approved Figma placeholder only: plan
 * names and descriptions from the Figma instances (Starter, Plus, Pro), price "—", the price note
 * "to be decided", four placeholder feature rows. No prices, periods, entitlements or limits. Every
 * action goes to the Register route with no plan parameter and no checkout (P07-D3).
 *
 * Layout:
 * - Intro (P07-D5: the Tablet intro, reused on Desktop at the Desktop section scale): eyebrow
 *   Medium 14 / 1.5 Electric Sky; heading; description Text/Secondary; information note below the
 *   plans (Body/Small 14; Mobile 13 / 1.5), Muted Readable.
 * - Plans in reading order Starter → Plus → Pro (Figma Tablet/Mobile instance order; Starter at the
 *   inline start on Desktop). Desktop 3 × 384, gap 24; Tablet one column 520 wide, gap 32; Mobile
 *   one column, gap 28. The grid has 14 px of top padding for the Featured badge.
 * - Card (Figma 384 × 520): radius 20, padding 32, gap 24. Standard and Secondary: Ink, Slate
 *   border. Featured: Obsidian with a Cobalt Edge radial (28% → 0), Electric Sky border and label,
 *   and the "الخطة المميزة" badge (Cobalt Edge, radius 999, padding 6 / 8) centred on the top edge.
 *   Button 48 high, radius 8: Mist with an Iron label (Standard, Featured) or Obsidian with a Slate
 *   border and a white label (Secondary).
 */

export type PlanStyle = "standard" | "featured" | "secondary";

export interface PricingPlan {
  style: PlanStyle;
  label: string;
  name: string;
  text: string;
  cta: string;
}

export interface LandingPricingCopy {
  eyebrow: string;
  heading: string;
  description: string;
  note: string;
  price: string;
  priceNote: string;
  feature: string;
  badge: string;
  plans: readonly PricingPlan[];
}

/** Figma draws four placeholder feature rows per card. */
const FEATURE_ROWS = 4;

const BUTTON = [
  "inline-flex h-[48px] w-full items-center justify-center rounded-lg px-[28px] text-landing-button-default",
  INTERACTIVE_TRANSITION,
  FOCUS_RING,
].join(" ");

const BUTTON_STYLE: Record<PlanStyle, string> = {
  standard: `bg-neutral-mist text-neutral-iron hover:bg-text-primary ${CTA_GLOW}`,
  featured: `bg-neutral-mist text-neutral-iron hover:bg-text-primary ${CTA_GLOW}`,
  secondary:
    "border border-neutral-slate bg-surface-obsidian text-text-primary hover:border-accent-electric-sky hover:bg-accent-electric-sky/10",
};

function PlanCard({ plan, copy }: { plan: PricingPlan; copy: LandingPricingCopy }) {
  const featured = plan.style === "featured";
  return (
    <article
      data-plan={plan.style}
      aria-labelledby={`landing-plan-${plan.style}`}
      className={[
        "relative flex h-full min-h-[520px] w-full flex-col gap-[24px] rounded-[20px] border p-[32px]",
        featured
          ? "border-accent-electric-sky bg-surface-obsidian"
          : "border-neutral-slate bg-surface-ink",
      ].join(" ")}
      style={featured ? AMBIENT.featuredPlan : undefined}
    >
      {featured ? (
        <span
          data-plan-badge=""
          className="absolute -top-[14px] start-1/2 rounded-full bg-accent-cobalt-edge px-[8px] py-[6px] text-landing-badge-label whitespace-nowrap text-text-primary ltr:-translate-x-1/2 rtl:translate-x-1/2"
        >
          {copy.badge}
        </span>
      ) : null}
      <div className="flex flex-col gap-[8px] text-start">
        <p
          className={`text-landing-pricing-plan-label ${featured ? "text-accent-electric-sky" : "text-text-muted-readable"}`}
        >
          <Ltr>{plan.label}</Ltr>
        </p>
        <h3
          id={`landing-plan-${plan.style}`}
          className="text-landing-pricing-plan-title text-text-primary"
        >
          {plan.name}
        </h3>
        <p className="text-landing-body-base text-text-secondary">{plan.text}</p>
      </div>
      <div className="flex flex-col gap-[8px] text-start">
        <p className="text-landing-pricing-price text-text-primary">{copy.price}</p>
        <p className="text-landing-body-small text-text-muted-readable">{copy.priceNote}</p>
      </div>
      <hr className="h-px border-0 bg-neutral-slate" />
      <ul className="flex flex-col gap-[14px]">
        {Array.from({ length: FEATURE_ROWS }, (_, index) => (
          <li key={index} className="flex items-center gap-[12px]">
            <span
              aria-hidden="true"
              className="size-[8px] shrink-0 rounded-full border-[1.5px] border-accent-electric-sky"
            />
            <span className="min-w-0 flex-1 text-start text-landing-body-base text-text-secondary">
              {copy.feature}
            </span>
          </li>
        ))}
      </ul>
      {/* Registration only (P07-D3): no plan parameter, no checkout. */}
      <Link
        href={ROUTES["auth.register"]}
        className={`mt-auto ${BUTTON} ${BUTTON_STYLE[plan.style]}`}
        data-plan-cta=""
      >
        {plan.cta}
      </Link>
    </article>
  );
}

export function LandingPricing({ copy }: { copy: LandingPricingCopy }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[32px] px-[20px] pt-[48px] pb-[56px] rail:gap-[40px] rail:px-[32px] rail:py-[64px] xl:px-0">
      <div className="flex w-full max-w-[350px] flex-col gap-[12px] text-center rail:max-w-[704px] rail:gap-[16px] xl:max-w-[900px]">
        <p className="text-[14px] leading-[1.5] font-medium text-accent-electric-sky">
          {copy.eyebrow}
        </p>
        <h2
          id="landing-pricing-heading"
          className="text-landing-heading-section-mobile leading-[1.25] text-text-primary rail:text-landing-heading-section-tablet rail:leading-[1.2] xl:text-landing-heading-section-desktop"
        >
          {copy.heading}
        </h2>
        <p className="text-landing-body-base-mobile text-text-secondary rail:text-landing-body-large xl:text-landing-body-lead">
          {copy.description}
        </p>
      </div>
      <ul
        className="grid w-full max-w-[350px] grid-cols-1 gap-[28px] pt-[14px] rail:max-w-[520px] rail:gap-[32px] xl:max-w-none xl:grid-cols-3 xl:gap-[24px]"
        data-pricing-plans=""
      >
        {copy.plans.map((plan) => (
          <li key={plan.style} className="flex min-w-0">
            <PlanCard plan={plan} copy={copy} />
          </li>
        ))}
      </ul>
      <p className="w-full max-w-[350px] text-center text-[13px] leading-[1.5] text-text-muted-readable rail:max-w-[704px] rail:text-landing-body-small">
        {copy.note}
      </p>
    </div>
  );
}
