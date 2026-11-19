// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import type { HeroVideoAsset } from "../model/hero-media";
import { HERO_PAUSED_KEY, HeroVideo } from "./HeroVideo";
import { LandingHero } from "./LandingHero";

/*
 * Phase 07: Hero video behaviour (contract §4–§5). These tests use sample asset objects (paths
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

describe("LandingHero", () => {
  const ar = MESSAGES.ar.landing.hero;
  const copy = {
    heading: ar.heading,
    description: ar.description,
    ctaPrimary: ar.ctaPrimary,
    ctaSecondary: ar.ctaSecondary,
    videoPause: ar.videoPause,
    videoPlay: ar.videoPlay,
  };

  function renderHero(video: HeroVideoAsset | null) {
    return render(
      <NextIntlClientProvider locale="ar" messages={null}>
        <LandingHero copy={copy} video={video} />
      </NextIntlClientProvider>,
    );
  }

  it("renders the verbatim h1, description and CTAs; primary → Register, outline → #how-it-works", () => {
    renderHero(null);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(ar.heading);
    expect(screen.getByText(ar.description)).toBeTruthy();
    expect(screen.getByRole("link", { name: ar.ctaPrimary }).getAttribute("href")).toBe(
      "/register",
    );
    expect(screen.getByRole("link", { name: ar.ctaSecondary }).getAttribute("href")).toBe(
      "#how-it-works",
    );
  });

  it("primary CTA comes first (inline start)", () => {
    renderHero(null);
    const links = screen.getAllByRole("link").map((a) => a.textContent);
    expect(links).toEqual([ar.ctaPrimary, ar.ctaSecondary]);
  });

  it("no approved asset: Near Black media layer only — no video, no poster, no control (P07-D14)", () => {
    const { container } = renderHero(null);
    const media = container.querySelector("[data-landing-hero-media]");
    expect(media?.className).toContain("bg-surface-void-black");
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("picture")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("landscape-only asset: CSS poster declared from rail up (no <img>, no Mobile fetch)", () => {
    const { container } = renderHero(LANDSCAPE_ONLY);
    const poster = container.querySelector<HTMLElement>("[data-landing-hero-poster]");
    expect(container.querySelector("picture")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(poster?.className).toContain("rail:bg-(image:--hero-poster)");
    expect(poster?.style.getPropertyValue("--hero-poster")).toBe(
      `url(${LANDSCAPE_ONLY.poster.landscape})`,
    );
  });

  it("ambient base and bottom fade are decorative layers", () => {
    const { container } = renderHero(null);
    expect(container.querySelector("[data-landing-ambient=hero]")).not.toBeNull();
    const fades = [...container.querySelectorAll("[data-landing-hero-fade]")];
    expect(fades.map((fade) => fade.getAttribute("data-landing-hero-fade"))).toEqual([
      "top",
      "bottom",
    ]);
    expect(fades.every((fade) => fade.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("with an asset: poster picture (portrait source first) and the video render", () => {
    const { container } = renderHero(ASSET);
    const sources = [...container.querySelectorAll("picture source")].map((s) =>
      s.getAttribute("media"),
    );
    expect(sources[0]).toBe("(max-width: 44.99rem)");
    expect(container.querySelector("video")).not.toBeNull();
  });
});
