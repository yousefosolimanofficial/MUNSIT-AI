// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";

import { isHeroImageVisible } from "../model/gates";
import { HERO_IMAGE, type HeroImage } from "../model/hero-media";
import { LandingHero } from "./LandingHero";

/* Phase 07, P07-D21: the Hero shows the original static Figma image; no video, poster or control. */

afterEach(cleanup);

const ar = MESSAGES.ar.landing.hero;
const copy = {
  heading: ar.heading,
  description: ar.description,
  ctaPrimary: ar.ctaPrimary,
  ctaSecondary: ar.ctaSecondary,
};

function renderHero(image: HeroImage | null) {
  return render(
    <NextIntlClientProvider locale="ar" messages={null}>
      <LandingHero copy={copy} image={image} />
    </NextIntlClientProvider>,
  );
}

describe("LandingHero", () => {
  it("renders the verbatim h1, description and CTAs; primary → Register, outline → #how-it-works", () => {
    renderHero(HERO_IMAGE);
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
    renderHero(HERO_IMAGE);
    const links = screen.getAllByRole("link").map((a) => a.textContent);
    expect(links).toEqual([ar.ctaPrimary, ar.ctaSecondary]);
  });

  it("static Figma image: decorative, preloaded, Figma framing (cover; contain on Desktop)", () => {
    const { container } = renderHero(HERO_IMAGE);
    const img = container.querySelector<HTMLImageElement>("img[data-landing-hero-image]");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.closest("[aria-hidden=true]")).not.toBeNull();
    expect(img?.getAttribute("src")).toContain(encodeURIComponent(HERO_IMAGE.src));
    expect(img?.getAttribute("sizes")).toBe("100vw");
    expect(img?.getAttribute("loading")).not.toBe("lazy");
    expect(img?.className).toContain("object-cover");
    expect(img?.className).toContain("xl:object-contain");
    // Never animated.
    expect(img?.className).not.toMatch(/animate-|transition/);
  });

  it("Tablet contrast correction: a scrim layer behind the description, Tablet only", () => {
    const { container } = renderHero(HERO_IMAGE);
    const description = container.querySelector<HTMLElement>("[data-landing-hero-description]");
    expect(description?.textContent).toBe(ar.description);
    const classes = description?.className.split(" ") ?? [];
    // Drawn as the description's own ::before layer from `rail` up, behind the text.
    expect(classes).toContain("rail:before:absolute");
    expect(classes).toContain("rail:before:-z-10");
    expect(classes).toContain("rail:before:bg-(image:--hero-text-scrim)");
    // Not on Desktop; nothing on Mobile (every scrim class is `rail:`-prefixed).
    expect(classes).toContain("xl:before:hidden");
    expect(classes.filter((c) => c.startsWith("before:"))).toEqual([]);
    expect(description?.style.getPropertyValue("--hero-text-scrim")).toContain("radial-gradient");
  });

  it("no video, no poster and no Pause/Play control (P07-D21)", () => {
    const { container } = renderHero(HERO_IMAGE);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("[data-landing-hero-poster]")).toBeNull();
    expect(container.querySelector("[data-landing-hero-control]")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("without an image: Near Black media layer with the ambient glow only", () => {
    const { container } = renderHero(null);
    const media = container.querySelector("[data-landing-hero-media]");
    expect(media?.className).toContain("bg-surface-void-black");
    expect(container.querySelector("[data-landing-ambient=hero]")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("ambient base and the top and bottom fades are decorative layers", () => {
    const { container } = renderHero(HERO_IMAGE);
    expect(container.querySelector("[data-landing-ambient=hero]")).not.toBeNull();
    const fades = [...container.querySelectorAll("[data-landing-hero-fade]")];
    expect(fades.map((fade) => fade.getAttribute("data-landing-hero-fade"))).toEqual([
      "top",
      "bottom",
    ]);
    expect(fades.every((fade) => fade.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});

describe("Hero image source and production gate", () => {
  it("is the cropped 2× Figma export (the original's 666 × 412 aspect)", () => {
    expect(HERO_IMAGE.src).toBe("/landing/hero/hero-figma-2880x1782.webp");
    expect(HERO_IMAGE.width / HERO_IMAGE.height).toBeCloseTo(666 / 412, 3);
  });

  it("the existing production gate stays closed until the owner verifies the image", () => {
    expect(HERO_IMAGE.provisional).toBe(true);
    expect(isHeroImageVisible("production", true)).toBe(false);
    expect(isHeroImageVisible("development", true)).toBe(true);
    expect(isHeroImageVisible("test", true)).toBe(true);
    expect(isHeroImageVisible("production", false)).toBe(true);
  });
});
