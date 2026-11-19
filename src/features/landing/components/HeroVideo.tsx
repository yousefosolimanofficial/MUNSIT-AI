"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Icon } from "@/shared/ui/Icon";

import {
  HERO_LANDSCAPE_MEDIA,
  HERO_PORTRAIT_MEDIA,
  type HeroVideoAsset,
} from "../model/hero-media";
import { FOCUS_RING } from "./landing-styles";
import { PauseIcon } from "./PauseIcon";

/*
 * Hero background video (Phase 07 Increment 2; contract docs/phases/phase-07-hero-contract.md §4–§5).
 *
 * - Decorative: `aria-hidden`, muted (no audio track), `loop`, `playsInline`,
 *   `preload="metadata"`, never focusable.
 * - Sources: portrait below `rail`, landscape above (WebM first when present, then MP4);
 *   `object-fit: cover` with the asset's `object-position` per orientation (P07-D10).
 * - No `autoplay` attribute: playback starts from the client with `play()`, and only when motion
 *   is allowed and the user has not paused it. Under `prefers-reduced-motion: reduce` (and on the
 *   server) no <video> is rendered, so nothing downloads; the poster beneath stays visible.
 * - Landscape-only assets (no portrait master) are restricted to `rail` and up with
 *   `<source media>`: Mobile matches no source and downloads nothing.
 * - The video fades in (opacity, `flip` duration) once it actually plays.
 * - The video is transparent until it actually plays, so the poster shows before playback and
 *   when autoplay is blocked.
 * - Pause/Play (P07-D7, P07-D15): a 40 px dark circle at the Hero's bottom inline-end corner,
 *   rendered only when a playable video exists (metadata loaded) and motion is allowed. Its label
 *   names the action. The user's choice is kept for the session.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const HERO_PAUSED_KEY = "munsit:landing-hero-video-paused";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Reduced motion is assumed on the server (nothing moves before hydration). */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

function readPaused(): boolean {
  try {
    return window.sessionStorage.getItem(HERO_PAUSED_KEY) === "1";
  } catch {
    return false; // storage unavailable: no memory, still controllable
  }
}

function writePaused(paused: boolean) {
  try {
    if (paused) window.sessionStorage.setItem(HERO_PAUSED_KEY, "1");
    else window.sessionStorage.removeItem(HERO_PAUSED_KEY);
  } catch {
    // storage unavailable: the choice applies to this page view only
  }
}

const CONTROL = [
  "absolute end-[12px] bottom-[12px] z-[2] flex size-[40px] cursor-pointer items-center justify-center rounded-full",
  "border border-neutral-mist/30 bg-surface-void-black/60 text-text-primary",
  "rail:end-[24px] rail:bottom-[24px]",
  FOCUS_RING,
].join(" ");

export interface HeroVideoProps {
  asset: HeroVideoAsset;
  labels: { pause: string; play: string };
}

export function HeroVideo({ asset, labels }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState(readPaused);
  const [playable, setPlayable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (reducedMotion || userPaused) {
      element.pause();
      return;
    }
    // Autoplay can be refused (data saver, policies): the poster simply stays.
    element.play().catch(() => {});
  }, [reducedMotion, userPaused]);

  const toggle = () => {
    const next = !userPaused && playing;
    writePaused(next);
    setUserPaused(next);
  };

  const style = {
    "--hero-position-landscape": asset.position?.landscape ?? "center",
    "--hero-position-portrait": asset.position?.portrait ?? "center",
  } as React.CSSProperties;

  // Reduced motion (and the server render, which assumes it): no <video> at all, so nothing is
  // downloaded; the poster beneath stays visible.
  if (reducedMotion) return null;

  const portrait = asset.portrait;
  // A landscape-only asset applies from `rail` up; Mobile matches no source and fetches nothing.
  const landscapeMedia = portrait ? undefined : HERO_LANDSCAPE_MEDIA;

  return (
    <>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        data-landing-hero-video=""
        onLoadedMetadata={() => setPlayable(true)}
        onError={() => setPlayable(false)}
        onPlaying={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        style={style}
        className={[
          "absolute inset-0 z-[1] h-full w-full object-cover",
          "object-[var(--hero-position-portrait)] rail:object-[var(--hero-position-landscape)]",
          "transition-opacity duration-flip ease-standard",
          portrait ? "" : "hidden rail:block",
          started ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {portrait?.webm ? (
          <source src={portrait.webm} type="video/webm" media={HERO_PORTRAIT_MEDIA} />
        ) : null}
        {portrait ? (
          <source src={portrait.mp4} type="video/mp4" media={HERO_PORTRAIT_MEDIA} />
        ) : null}
        {asset.landscape.webm ? (
          <source src={asset.landscape.webm} type="video/webm" media={landscapeMedia} />
        ) : null}
        <source src={asset.landscape.mp4} type="video/mp4" media={landscapeMedia} />
      </video>
      {playable ? (
        <button
          type="button"
          data-landing-hero-control=""
          aria-label={playing ? labels.pause : labels.play}
          onClick={toggle}
          className={CONTROL}
        >
          {playing ? <PauseIcon size={16} /> : <Icon name="play" size={16} />}
        </button>
      ) : null}
    </>
  );
}
