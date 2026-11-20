// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import type { HeroVideoAsset } from "../model/hero-media";
import { HERO_PAUSED_KEY, HeroVideo } from "./HeroVideo";

/*
 * Phase 07: Hero video component behaviour (contract §4–§5). P07-D21 superseded the video: the
 * page no longer renders HeroVideo (LandingHero.test.tsx); the component and these tests are kept
 * as history. These tests use sample asset objects (paths
 * only), with and without a portrait master; the provisional asset itself is covered by E2E.
 * jsdom has no media playback or matchMedia: both are stubbed.
 */

const ASSET: HeroVideoAsset = {
  landscape: { webm: "/landing/hero/landscape.webm", mp4: "/landing/hero/landscape.mp4" },
  portrait: { webm: "/landing/hero/portrait.webm", mp4: "/landing/hero/portrait.mp4" },
  poster: {
    landscape: "/landing/hero/poster-landscape.jpg",
    portrait: "/landing/hero/poster-portrait.jpg",
  },
};
/** Landscape-only asset (no portrait master), like the provisional development asset. */
const LANDSCAPE_ONLY: HeroVideoAsset = {
  landscape: ASSET.landscape,
  poster: { landscape: ASSET.poster.landscape },
};
const LABELS = {
  pause: MESSAGES.ar.landing.hero.videoPause,
  play: MESSAGES.ar.landing.hero.videoPlay,
};

let reduced = false;
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
  reduced = false;
  play.mockClear();
  pause.mockClear();
  window.sessionStorage.clear();
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce") ? reduced : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  HTMLMediaElement.prototype.play = play;
  HTMLMediaElement.prototype.pause = pause;
});

afterEach(cleanup);

function renderVideo(asset: HeroVideoAsset = ASSET) {
  const view = render(<HeroVideo asset={asset} labels={LABELS} />);
  const video = view.container.querySelector("video");
  if (!video) throw new Error("video missing");
  return { ...view, video };
}

describe("HeroVideo", () => {
  it("is a decorative, muted, looping, inline video without autoplay; portrait sources first", () => {
    const { video } = renderVideo();
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.getAttribute("preload")).toBe("metadata");
    expect(video.getAttribute("aria-hidden")).toBe("true");
    expect(video.getAttribute("tabindex")).toBe("-1");
    expect(video.hasAttribute("autoplay")).toBe(false);
    const sources = [...video.querySelectorAll("source")].map((s) => [
      s.getAttribute("src"),
      s.getAttribute("type"),
      s.getAttribute("media"),
    ]);
    expect(sources).toEqual([
      ["/landing/hero/portrait.webm", "video/webm", "(max-width: 44.99rem)"],
      ["/landing/hero/portrait.mp4", "video/mp4", "(max-width: 44.99rem)"],
      ["/landing/hero/landscape.webm", "video/webm", null],
      ["/landing/hero/landscape.mp4", "video/mp4", null],
    ]);
    expect(video.className).toContain("object-cover");
  });

  it("plays when motion is allowed; the control appears only once the video is playable", () => {
    const { video } = renderVideo();
    expect(play).toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull(); // no playable video yet
    fireEvent(video, new Event("loadedmetadata"));
    fireEvent(video, new Event("playing"));
    const button = screen.getByRole("button", { name: LABELS.pause });
    expect(video.className).toContain("opacity-100");
    fireEvent.click(button);
    expect(pause).toHaveBeenCalled();
    expect(window.sessionStorage.getItem(HERO_PAUSED_KEY)).toBe("1");
    fireEvent(video, new Event("pause"));
    expect(screen.getByRole("button", { name: LABELS.play })).toBeTruthy();
  });

  it("Play after Pause clears the session choice and plays again", () => {
    const { video } = renderVideo();
    fireEvent(video, new Event("loadedmetadata"));
    fireEvent(video, new Event("playing"));
    fireEvent.click(screen.getByRole("button", { name: LABELS.pause }));
    fireEvent(video, new Event("pause"));
    play.mockClear();
    fireEvent.click(screen.getByRole("button", { name: LABELS.play }));
    expect(window.sessionStorage.getItem(HERO_PAUSED_KEY)).toBeNull();
    expect(play).toHaveBeenCalled();
  });

  it("reduced motion: renders no video at all (nothing downloads), never plays, no control", () => {
    reduced = true;
    const { container } = render(<HeroVideo asset={ASSET} labels={LABELS} />);
    expect(container.querySelector("video")).toBeNull();
    expect(play).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("landscape-only asset: sources restricted to rail and up (Mobile fetches nothing); hidden below rail", () => {
    const { video } = renderVideo(LANDSCAPE_ONLY);
    const sources = [...video.querySelectorAll("source")].map((s) => [
      s.getAttribute("src"),
      s.getAttribute("type"),
      s.getAttribute("media"),
    ]);
    expect(sources).toEqual([
      ["/landing/hero/landscape.webm", "video/webm", "(min-width: 45rem)"],
      ["/landing/hero/landscape.mp4", "video/mp4", "(min-width: 45rem)"],
    ]);
    expect(video.className).toContain("hidden");
    expect(video.className).toContain("rail:block");
  });

  it("a paused choice in this session is respected: no play() on mount, the control offers Play", () => {
    window.sessionStorage.setItem(HERO_PAUSED_KEY, "1");
    const { video } = renderVideo();
    expect(play).not.toHaveBeenCalled();
    fireEvent(video, new Event("loadedmetadata"));
    expect(screen.getByRole("button", { name: LABELS.play })).toBeTruthy();
  });

  it("a refused autoplay leaves the poster (no error, no control state change)", async () => {
    play.mockImplementationOnce(() => Promise.reject(new Error("NotAllowedError")));
    const { video } = renderVideo();
    await act(async () => {});
    expect(video.className).toContain("opacity-0");
  });
});
