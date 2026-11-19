import { getImageProps } from "next/image";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";

import { HERO_PORTRAIT_MEDIA, type HeroVideoAsset } from "../model/hero-media";
import { HeroVideo } from "./HeroVideo";
import { FOCUS_RING } from "./landing-styles";

/*
 * Landing Hero (Phase 07 Increment 2). Approved contract: docs/phases/phase-07-hero-contract.md;
 * Figma Desktop `28:3`, Tablet `200:559`, Mobile `200:713` (design-values §16.1).
 *
 * Box (the `#top` section): Desktop 900 at y 0 under the floating header; Tablet 640 after a 32
 * gap; Mobile 538 after a 24 gap. Background: Near Black `#040506` (P07-D14) until the approved
 * video exists. The temporary background is not the final visual.
 *
 * Content, a centred column:
 * - padding 344 / 126 (Desktop), 200 / 100 (Tablet), 150 / 64 (Mobile); inline 20 / 32;
 * - gap to the actions 132 / 56 / 40;
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
    videoPause: string;
    videoPlay: string;
  };
  /** The approved video, or `null` (Near Black, no video, no control). */
  video: HeroVideoAsset | null;
}

const PRIMARY = [
  "inline-flex h-[46px] items-center justify-center rounded-lg border border-neutral-iron bg-neutral-mist px-[20px]",
  "text-ui-button whitespace-nowrap text-surface-ink",
  // Figma widths with the Arabic labels (the label box is wider than the glyphs): minimums, so
  // longer labels are never clipped.
  "w-full rail:w-auto rail:min-w-[131px]",
  FOCUS_RING,
].join(" ");

const OUTLINE = [
  "inline-flex h-[48px] items-center justify-center rounded-lg border border-neutral-mist px-[13px]",
  "text-ui-button whitespace-nowrap text-text-primary",
  "w-full rail:w-auto rail:min-w-[186px]",
  FOCUS_RING,
].join(" ");

/** Poster layer (art direction: portrait below `rail`). Decorative. */
function HeroPoster({ poster }: { poster: HeroVideoAsset["poster"] }) {
  const common = { alt: "", sizes: "100vw", priority: true } as const;
  const {
    props: { srcSet: landscape },
  } = getImageProps({ ...common, src: poster.landscape, width: 1920, height: 1200 });
  const {
    props: { srcSet: portrait, ...rest },
  } = getImageProps({ ...common, src: poster.portrait, width: 1080, height: 1490 });
  return (
    <picture>
      <source media={HERO_PORTRAIT_MEDIA} srcSet={portrait} />
      <source srcSet={landscape} />
      {/* getImageProps art direction, as in the Next.js Image docs. */}
      <img {...rest} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </picture>
  );
}

export function LandingHero({ copy, video }: LandingHeroProps) {
  return (
    <>
      {/* Media layer: Near Black, then the poster (when an approved asset exists). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-surface-void-black"
        data-landing-hero-media=""
      >
        {video ? <HeroPoster poster={video.poster} /> : null}
      </div>
      {video ? (
        <HeroVideo asset={video} labels={{ pause: copy.videoPause, play: copy.videoPlay }} />
      ) : null}

      <div className="relative z-[1] flex flex-col items-center gap-[40px] px-[20px] pt-[150px] pb-[64px] rail:gap-[56px] rail:px-[32px] rail:pt-[200px] rail:pb-[100px] xl:gap-[132px] xl:pt-[344px] xl:pb-[126px]">
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
          {/* Desktop: Figma's fixed, top-aligned 760 × 33 box; Figma renders the text on two lines that
              overflow the box into the 132 gap, and the layout follows the box. Reproduced with the box
              height and visible overflow (nothing is clipped). */}
          <p className="text-landing-label-strong text-text-primary/90 rail:text-landing-label-title xl:h-[33px] xl:text-heading-medium">
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
