import { Fragment } from "react";

import { NAV_BORDER, REVEAL } from "./landing-styles";

/*
 * Product Showcase (Phase 07 Increment 3; native card on every breakpoint: P07-D22, 2026-11-20).
 * Figma Desktop `36:169`, Tablet `200:568`, Mobile `200:722` (design-values §16.6, §16.8).
 *
 * The illustration is the approved Mobile live-transcription card, in native HTML and CSS, on
 * every breakpoint. The former Desktop and Tablet app window (header, menu and screenshot) is no
 * longer rendered (owner design decision P07-D22). It is a static illustration, not a working UI:
 * `aria-hidden`, with no focusable element and no control, and described by the section heading
 * and text. Its demo copy (timer, lecture title, transcript lines) is the Figma copy from the
 * `landing` messages; nothing in it is live.
 *
 * - Card: the Figma Mobile card. It has a stacked header (the pill above the two-tone title, at the
 *   inline start) and the transcript body (heading and live chip, two lines, the pause bar and the
 *   waveform). Mobile: 350 wide and at least 366 high (it grows at 320 instead of clipping).
 * - Tablet (720–1279) and Desktop (≥ 1280): the same card, unchanged inside, at 520 / 600 wide.
 *   Its height follows its content (no Mobile 366 minimum, which would leave an empty band once the
 *   lines wrap less). It is centred in a stage that keeps the former window's height (436 / 560),
 *   so the section and everything below it keep their Figma positions.
 *
 * Intro: Figma uses auto line height (Cairo "normal") in fixed text boxes, reproduced as minimum
 * heights (Desktop 161 / 80, Tablet 120 / 54, Mobile 98 / 69) so larger text pushes the card down
 * instead of overlapping it.
 *
 * Motion: the intro and the card fade up once on entry (scroll reveal, Visual Refinement). The
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
      className="flex h-[40px] shrink-0 items-center gap-[8px] rounded-[6px] bg-color-surface-graphite px-[7px]"
      data-showcase-status=""
    >
      <span className="text-[14px] leading-[1.4] font-semibold text-text-secondary">
        {copy.recording}
      </span>
      <span dir="ltr" className="font-mono text-[12px] leading-[1.6] text-text-primary">
        {copy.timer}
      </span>
      <span className="size-[8px] shrink-0 rounded-full bg-accent-coral-pulse" />
    </div>
  );
}

function MobileTranscript({ copy }: { copy: LandingShowcaseCopy["mobile"] }) {
  return (
    <div
      className="flex flex-1 flex-col gap-[10px] bg-surface-void-black p-[12px]"
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

      {/* Stage: the former window's height on Tablet and Desktop, with the card centred in it. */}
      <div
        className="flex w-full justify-center rail:h-[436px] rail:items-center xl:h-[560px]"
        data-showcase-stage=""
      >
        <div
          aria-hidden="true"
          data-showcase-window=""
          data-reveal=""
          className={`${REVEAL} flex min-h-[366px] w-full max-w-[350px] flex-col overflow-hidden rounded-[16px] border bg-surface-ink ${NAV_BORDER} rail:min-h-0 rail:max-w-[520px] xl:max-w-[600px]`}
        >
          <div
            className="flex min-h-[114px] shrink-0 flex-col items-start gap-[6px] bg-surface-obsidian px-[16px] py-[12px]"
            data-showcase-header=""
          >
            {/* The pill above the title, both at the inline start. */}
            <LectureTitle
              text={copy.lectureTitle}
              className="order-last text-[14px] leading-[1.6]"
            />
            <RecordingStatus copy={copy} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <MobileTranscript copy={copy.mobile} />
          </div>
        </div>
      </div>
    </div>
  );
}
