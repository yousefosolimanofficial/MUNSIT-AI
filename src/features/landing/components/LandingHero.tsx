import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";

import type { HeroImage } from "../model/hero-media";
import { AMBIENT, CTA_GLOW, FOCUS_RING, INTERACTIVE_TRANSITION } from "./landing-styles";

/*
 * Landing Hero (Phase 07 Increment 2). Approved contract: docs/phases/phase-07-hero-contract.md;
 * Figma Desktop `28:3`, Tablet `200:559`, Mobile `200:713` (design-values §16.1).
 *
 * Box (the `#top` section): Desktop 900 at y 0 under the floating header; Tablet 640 after a 32
 * gap; Mobile 538 after a 24 gap. Background: Near Black `#040506` (P07-D14) with a restrained
 * ambient glow (Visual Refinement), then the original static Figma image (P07-D21, hero-media.ts)
 * framed as Figma: Desktop FIT (contain), Tablet and Mobile FILL (cover), centred. It is never
 * animated and there is no video. Top and bottom fades blend the Hero into the page.
 *
 * Content, a centred column:
 * - padding 344 / 126 (Desktop), 200 / 100 (Tablet), 150 / 64 (Mobile); inline 20 / 32;
 * - gap to the actions 56 (Tablet) / 40 (Mobile). Desktop: Figma lays out a FIXED 760 × 33
 *   description box with a 132 gap, while the text renders on two lines (67.2) that overflow the
 *   box. The description stays in normal flow with a gap of 98 (33 + 132 = 67.2 + 97.8), so the
 *   actions sit at Figma's y 688 and enlarged text (text-only zoom, WCAG 1.4.4) pushes them down
 *   instead of overlapping them;
 * - heading block 760 / 704 / 350 wide, gap 36.
 *
 * - Heading (`h1`): `Heading/Display` 56 in Figma's fixed, top-aligned 651 × 143 text box (min-height,
 *   so text never clips), Tablet 44 / 1.2 / 600 (no Figma
 *   style: a Landing-local value), Mobile `Landing/Heading/Section Tablet` 32.
 * - Description: `Heading/Medium` 24, `Landing/Label/Title` 20, `Landing/Label/Strong` 16, all white
 *   at 90%.
 * - Actions:
 *   - Desktop and Tablet: a row 450 × 86, gap 37, padding inline 48, centred.
 *   - Mobile: a full-width column, gap 12.
 *   - The primary is at the inline start (first).
 *   - The buttons are Landing-local (46 / 48 high, radius 16), not the shared 44-high `Button`.
 * - Primary "ابدأ مجانًا" → the approved Register route (P07-D3: no plan, no purchase wording).
 *   Outline "اكتشف كيف يعمل" → `#how-it-works`. The primary CTA is never in the navigation.
 */

export interface LandingHeroProps {
  copy: {
    heading: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  /** The Hero image, or `null` (Near Black with the ambient glow). */
  image: HeroImage | null;
}

const PRIMARY = [
  "inline-flex h-[46px] items-center justify-center rounded-lg border border-neutral-iron bg-neutral-mist px-[20px]",
  "text-ui-button whitespace-nowrap text-surface-ink",
  // Hover (Visual Refinement): lighter fill and a soft Electric Sky glow; no movement.
  INTERACTIVE_TRANSITION,
  "hover:bg-text-primary",
  CTA_GLOW,
  // Figma widths with the Arabic labels (the label box is wider than the glyphs): minimums, so
  // longer labels are never clipped.
  "w-full rail:w-auto rail:min-w-[131px]",
  FOCUS_RING,
].join(" ");

const OUTLINE = [
  "inline-flex h-[48px] items-center justify-center rounded-lg border border-neutral-mist px-[13px]",
  "text-ui-button whitespace-nowrap text-text-primary",
  INTERACTIVE_TRANSITION,
  "hover:border-accent-electric-sky hover:bg-accent-electric-sky/10",
  "w-full rail:w-auto rail:min-w-[186px]",
  FOCUS_RING,
].join(" ");

export function LandingHero({ copy, image }: LandingHeroProps) {
  return (
    <>
      {/* Media layer: Near Black, the ambient glow, then the static Figma image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface-void-black"
        data-landing-hero-media=""
      >
        {/* Ambient base (Visual Refinement): shows where the contained Desktop image leaves room,
            and wherever no image applies. */}
        <div className="absolute inset-0" style={AMBIENT.hero} data-landing-ambient="hero" />
        {image ? (
          // The LCP element: preloaded; it fills a box of fixed height, so it never shifts layout.
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt=""
            sizes="100vw"
            preload
            data-landing-hero-image=""
            className="absolute inset-0 h-full w-full object-cover object-center xl:object-contain"
          />
        ) : null}
      </div>
      {/* Top and bottom fades into the page base (decorative; outside the text boxes). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[64px] rail:h-[88px]"
        style={AMBIENT.heroFadeTop}
        data-landing-hero-fade="top"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[96px] rail:h-[120px]"
        style={AMBIENT.heroFade}
        data-landing-hero-fade="bottom"
      />

      <div className="relative z-[1] flex flex-col items-center gap-[40px] px-[20px] pt-[150px] pb-[64px] rail:gap-[56px] rail:px-[32px] rail:pt-[200px] rail:pb-[100px] xl:gap-[98px] xl:pt-[344px] xl:pb-[126px]">
        <div
          className="flex w-full max-w-[350px] flex-col items-center gap-[36px] text-center rail:max-w-[704px] xl:max-w-[760px]"
          data-landing-hero-text=""
        >
          <h1
            id="landing-hero-heading"
            className="text-landing-heading-section-tablet text-text-primary rail:text-[44px] xl:min-h-[143px] xl:max-w-[651px] xl:text-heading-display"
          >
            {copy.heading}
          </h1>
          {/* Tablet contrast correction (P07-D21): a soft scrim behind the description only, drawn
              as its own ::before layer (outside the text; the Hero clips its overflow). */}
          <p
            className="text-landing-label-strong text-text-primary/90 rail:relative rail:isolate rail:text-landing-label-title rail:before:pointer-events-none rail:before:absolute rail:before:-inset-x-[96px] rail:before:-inset-y-[24px] rail:before:-z-10 rail:before:bg-(image:--hero-text-scrim) xl:text-heading-medium xl:before:hidden"
            style={
              { "--hero-text-scrim": AMBIENT.heroTextScrim.backgroundImage } as React.CSSProperties
            }
            data-landing-hero-description=""
          >
            {copy.description}
          </p>
        </div>
        <div
          className="flex w-full max-w-[350px] flex-col items-center gap-[12px] rail:h-[86px] rail:w-auto rail:max-w-none rail:flex-row rail:gap-[37px] rail:px-[48px]"
          data-landing-hero-actions=""
        >
          <Link href={ROUTES["auth.register"]} data-landing-hero-cta="primary" className={PRIMARY}>
            {copy.ctaPrimary}
          </Link>
          <a href="#how-it-works" data-landing-hero-cta="secondary" className={OUTLINE}>
            {copy.ctaSecondary}
          </a>
        </div>
      </div>
    </>
  );
}
