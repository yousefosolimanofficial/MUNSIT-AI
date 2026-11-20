import Image from "next/image";
import { Fragment } from "react";

import { SHOWCASE_SCREEN } from "../model/landing-images";
import { NAV_BORDER, REVEAL } from "./landing-styles";

/*
 * Product Showcase (Phase 07 Increment 3). Figma Desktop `36:169`, Tablet `200:568`, Mobile
 * `200:722` (design-values §16.6).
 *
 * The app window is a static illustration of the product, not a working UI: it is `aria-hidden`,
 * has no focusable element and no control, and is described by the section heading and text. Its
 * demo copy (timer, lecture title, menu, transcript lines) is the Figma copy from the `landing`
 * messages; nothing in it is live.
 *
 * - Desktop (≥ 1280): window 1171 × 560 (Ink, 1px `#363739`, radius 16): header 84 (Obsidian;
 *   status pill at the inline end, then a 438 gap and the two-tone lecture title, packed to the
 *   inline end as in Figma), body 470: the screen image (Figma CROP, reproduced as cover at
 *   50% 70.5%) and the 251-wide menu at the inline start.
 * - Tablet (720–1279): window 436 high; header 74 with the title at the inline start and the pill
 *   at the inline end; body 360: the image only (cover, centred). No menu (hidden in Figma).
 * - Mobile (< 720): window ≥ 366; a stacked header (pill above the title, at the inline start) and
 *   the live-transcript card drawn in Figma (no image: its fill is hidden there). Minimum heights,
 *   so narrower screens (320) grow instead of clipping.
 *
 * Intro: Figma uses auto line height (Cairo "normal") in fixed text boxes, reproduced as
 * minimum heights (Desktop 161 / 80, Tablet 120 / 54, Mobile 98 / 69) so the window keeps Figma's
 * position and larger text pushes it down instead of overlapping.
 *
 * Menu: Figma's sidebar (481 high, padding 16) overflows the 470 body; its title sits at y 6 and
 * the list at y 63, reproduced with a 6 top padding.
 *
 * Motion: the intro and the window fade up once on entry (scroll reveal, Visual Refinement). The
 * waveform and the recording dot stay still (P07-D17): animating them would suggest live
 * recording, which this illustration does not do.
 */

export interface LandingShowcaseCopy {
  heading: string;
  description: string;
  recording: string;
  timer: string;
  /** Two lines separated by "\n": the first in white, the second in Text/Secondary. */
  lectureTitle: string;
  sidebarTitle: string;
  sidebar: readonly string[];
  mobile: {
    live: string;
    heading: string;
    lines: readonly { time: string; text: string }[];
    pause: string;
  };
}

/** U+2028 LINE SEPARATOR: a forced line break in the Figma copy, which CSS does not honour. */
const LINE_SEPARATOR = " ";

/**
 * Renders the copy verbatim: each U+2028 stays in the text (so it still separates the words for
 * assistive technology and copy-paste) and is followed by a `<br>`, the break Figma draws.
 */
function withLineBreaks(text: string) {
  return text.split(LINE_SEPARATOR).map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? (
        <>
          {LINE_SEPARATOR}
          <br />
        </>
      ) : null}
      {part}
    </Fragment>
  ));
}

/** Figma waveform bar heights (Mobile audio controls), in px. */
const WAVEFORM = [8, 16, 24, 14, 20, 10, 18, 12, 22, 9] as const;

/** Live chip tint: Figma `#ff6b6b` at 14% (a local value, not a token). */
const LIVE_TINT = "bg-[#ff6b6b]/14";

function LectureTitle({ text, className }: { text: string; className: string }) {
  const [first, ...rest] = text.split("\n");
  return (
    <p className={`text-start ${className}`} data-showcase-title="">
      <span className="block text-text-primary">{first}</span>
      {rest.length > 0 ? <span className="block text-text-secondary">{rest.join(" ")}</span> : null}
    </p>
  );
}

function RecordingStatus({ copy }: { copy: LandingShowcaseCopy }) {
  return (
    <div
      className="flex h-[40px] shrink-0 items-center gap-[8px] rounded-[6px] bg-color-surface-graphite px-[7px] rail:h-[54px]"
      data-showcase-status=""
    >
      <span className="text-[14px] leading-[1.4] font-semibold text-text-secondary rail:text-heading-medium">
        {copy.recording}
      </span>
      <span
        dir="ltr"
        className="font-mono text-[12px] leading-[1.6] text-text-primary rail:text-[16px]"
      >
        {copy.timer}
      </span>
      <span className="size-[8px] shrink-0 rounded-full bg-accent-coral-pulse" />
    </div>
  );
}

function MobileTranscript({ copy }: { copy: LandingShowcaseCopy["mobile"] }) {
  return (
    <div
      className="flex flex-1 flex-col gap-[10px] bg-surface-void-black p-[12px] rail:hidden"
      data-showcase-mobile=""
    >
      <div className="flex min-h-[24px] items-center justify-between gap-[8px]">
        <p className="text-dashboard-card-title text-text-primary">{copy.heading}</p>
        <span
          className={`flex shrink-0 items-center gap-[5px] rounded-full px-[8px] py-[3px] ${LIVE_TINT}`}
        >
          <span className="size-[6px] rounded-full bg-accent-coral-pulse" />
          <span className="text-[12px] leading-[1.4] text-accent-coral-pulse">{copy.live}</span>
        </span>
      </div>
      <div className="flex flex-col gap-[10px] rounded-[12px] border border-text-primary/8 bg-surface-obsidian p-[10px]">
        {copy.lines.map((line) => (
          <div key={line.time} className="flex items-start gap-[10px]">
            <p className="min-w-0 flex-1 text-start text-dashboard-body text-text-primary">
              {line.text}
            </p>
            <span
              dir="ltr"
              className="shrink-0 font-mono text-dashboard-meta text-text-muted-readable"
            >
              {line.time}
            </span>
          </div>
        ))}
      </div>
      <div className="flex h-[44px] items-center justify-between gap-[8px] rounded-[12px] bg-color-surface-graphite px-[12px] py-[8px]">
        <span className="flex items-center gap-[8px]">
          {/* Figma: two white 3 × 10 bars, 3 apart, in a 28 px coral circle; never mirrored. */}
          <span className="flex size-[28px] shrink-0 items-center justify-center gap-[3px] rounded-full bg-accent-coral-pulse">
            <span className="h-[10px] w-[3px] rounded-[1px] bg-text-primary" />
            <span className="h-[10px] w-[3px] rounded-[1px] bg-text-primary" />
          </span>
          <span className="text-[12px] leading-[1.4] text-text-muted-readable">{copy.pause}</span>
        </span>
        <span className="flex h-[24px] items-center gap-[3px]" data-showcase-waveform="">
          {WAVEFORM.map((height, index) => (
            <span
              key={index}
              className="w-[3px] rounded-[2px] bg-accent-electric-sky"
              style={{ height }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export function LandingShowcase({ copy }: { copy: LandingShowcaseCopy }) {
  return (
    <div className="mx-auto flex w-full max-w-[1331px] flex-col items-center gap-[28px] px-[20px] py-[48px] rail:gap-[32px] rail:px-[32px] rail:py-[64px] xl:gap-[39px] xl:px-[80px] xl:py-[43px]">
      <div
        className={`flex w-full max-w-[350px] flex-col gap-[16px] text-center text-text-primary rail:max-w-[704px] xl:max-w-[900px] ${REVEAL}`}
        data-showcase-intro=""
        data-reveal=""
      >
        <h2
          id="landing-showcase-heading"
          className="min-h-[98px] text-landing-heading-section-mobile leading-[normal] rail:min-h-[120px] rail:text-landing-heading-section-tablet rail:leading-[normal] xl:min-h-[161px] xl:text-landing-heading-section-desktop xl:leading-[normal]"
        >
          {withLineBreaks(copy.heading)}
        </h2>
        <p className="min-h-[69px] text-landing-body-base-mobile rail:min-h-[54px] rail:text-landing-body-large xl:min-h-[80px] xl:text-landing-body-intro">
          {copy.description}
        </p>
      </div>

      <div
        aria-hidden="true"
        data-showcase-window=""
        data-reveal=""
        className={`${REVEAL} flex min-h-[366px] w-full max-w-[350px] flex-col overflow-hidden rounded-[16px] border bg-surface-ink ${NAV_BORDER} rail:h-[436px] rail:max-w-none xl:h-[560px] xl:max-w-[1171px]`}
      >
        <div
          className="flex min-h-[114px] shrink-0 flex-col items-start gap-[6px] bg-surface-obsidian px-[16px] py-[12px] rail:h-[74px] rail:min-h-0 rail:flex-row rail:items-center rail:justify-between rail:gap-[24px] rail:px-[24px] rail:py-[10px] xl:h-[84px] xl:justify-end xl:gap-[438px]"
          data-showcase-header=""
        >
          {/* Mobile: the pill above the title; Tablet and Desktop: title first (inline start). */}
          <LectureTitle
            text={copy.lectureTitle}
            className="order-last text-[14px] leading-[1.6] rail:order-none rail:text-landing-body-reading xl:text-[20px] xl:leading-[1.6] xl:font-normal"
          />
          <RecordingStatus copy={copy} />
        </div>

        <div className="flex min-h-0 flex-1 rail:h-[360px] rail:flex-none xl:h-[470px]">
          <div
            className="hidden w-[251px] shrink-0 flex-col gap-[23px] overflow-hidden bg-surface-obsidian px-[11px] pt-[6px] xl:flex"
            data-showcase-sidebar=""
          >
            <p className="text-start text-heading-medium text-text-primary">{copy.sidebarTitle}</p>
            <ul className="flex flex-col gap-[25px] rounded-[8px] px-[12px] py-[8px]">
              {copy.sidebar.map((item) => (
                <li
                  key={item}
                  className="flex h-[40px] items-center text-heading-medium text-text-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden min-w-0 flex-1 rail:block" data-showcase-screen="">
            <Image
              src={SHOWCASE_SCREEN.src}
              width={SHOWCASE_SCREEN.width}
              height={SHOWCASE_SCREEN.height}
              alt=""
              sizes="(min-width: 1280px) 918px, (min-width: 720px) calc(100vw - 66px), 1px"
              className="absolute inset-0 h-full w-full object-cover xl:object-[50%_70.5%]"
            />
          </div>
          <div className="flex flex-1 flex-col rail:hidden">
            <MobileTranscript copy={copy.mobile} />
          </div>
        </div>
      </div>
    </div>
  );
}
