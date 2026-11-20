import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };

/*
 * Phase 07 Visual Refinement and Hero media (P07-D17, plan §8e). Motion is allowed in this file
 * unless a test emulates reduced motion. The Hero video is the PROVISIONAL development asset
 * (landscape only; production hides it, see gates.ts). Its offline inspection and per-frame
 * contrast are in docs/phases/phase-07-hero-media.md.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const m = arLanding;
const HERO_MEDIA = /\/landing\/hero\//;

async function open(page: Page, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

const hero = (page: Page) => page.locator("section#top");
const video = (page: Page) => hero(page).locator("video");

test.describe("Hero media (provisional asset)", () => {
  test("Desktop: muted, looping, inline WebM plays over the poster; Pause/Play toggles and is remembered", async ({
    page,
  }) => {
    await open(page, 1440);
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    const state = await video(page).evaluate((v: HTMLVideoElement) => ({
      muted: v.muted,
      loop: v.loop,
      inline: v.hasAttribute("playsinline"),
      src: v.currentSrc,
      hidden: v.getAttribute("aria-hidden"),
      tabIndex: v.tabIndex,
    }));
    expect(state).toMatchObject({ muted: true, loop: true, inline: true, hidden: "true" });
    expect(state.tabIndex).toBe(-1);
    expect(state.src).toMatch(/hero-ambient-1280x720\.webm$/);
    const poster = await page
      .locator("[data-landing-hero-poster]")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(poster).toContain("hero-ambient-poster-1280x720.webp");

    const pause = hero(page).getByRole("button", { name: m.hero.videoPause });
    await pause.click();
    await expect.poll(() => video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(hero(page).getByRole("button", { name: m.hero.videoPlay })).toBeFocused();
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await expect(hero(page).getByRole("button", { name: m.hero.videoPlay })).toBeVisible();
    expect(await video(page).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("keyboard: the Pause/Play control is reachable, labelled and has a visible focus ring", async ({
    page,
  }) => {
    await open(page, 1440);
    const control = hero(page).locator("[data-landing-hero-control]");
    await expect(control).toBeVisible();
    await control.focus();
    await page.keyboard.press("Enter");
    await expect(hero(page).getByRole("button", { name: m.hero.videoPlay })).toBeFocused();
    const outline = await control.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("Mobile: no portrait master, so no Hero media is requested at all", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (HERO_MEDIA.test(request.url())) requests.push(request.url());
    });
    await open(page, 390);
    await page.waitForLoadState("networkidle");
    expect(requests).toEqual([]);
    await expect(hero(page).locator("[data-landing-hero-control]")).toHaveCount(0);
    await expect(page.locator("[data-landing-ambient=hero]")).toHaveCount(1);
  });

  test("reduced motion: no <video> and no video download; the poster is shown", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requests: string[] = [];
    page.on("request", (request) => {
      if (/\.(mp4|webm)(\?|$)/.test(request.url())) requests.push(request.url());
    });
    await open(page, 1440);
    await page.waitForLoadState("networkidle");
    await expect(video(page)).toHaveCount(0);
    expect(requests).toEqual([]);
    await expect(hero(page).locator("[data-landing-hero-control]")).toHaveCount(0);
    const poster = await page
      .locator("[data-landing-hero-poster]")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(poster).toContain("hero-ambient-poster-1280x720.webp");
  });
});

test.describe("Ambient backgrounds", () => {
  test("glows use token colours only (no cyan) and stay inside their sections", async ({
    page,
  }) => {
    await open(page, 1440);
    const layers = await page.locator("[data-landing-ambient]").evaluateAll((els) =>
      els.map((el) => {
        const section = el.closest("section")?.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return {
          image: getComputedStyle(el).backgroundImage,
          inside:
            !!section &&
            box.left >= section.left - 0.5 &&
            box.right <= section.right + 0.5 &&
            box.top >= section.top - 0.5 &&
            box.bottom <= section.bottom + 0.5,
        };
      }),
    );
    expect(layers).toHaveLength(3); // Hero, Showcase, Use Cases
    for (const layer of layers) {
      expect(layer.image).toContain("radial-gradient");
      expect(layer.image).not.toMatch(/rgb\(6, 182, 212\)|#06b6d4/i);
      expect(layer.inside).toBe(true);
    }
  });
});

test.describe("Scroll reveal", () => {
  test("below-the-fold content reveals on entry, with no layout shift", async ({ page }) => {
    await open(page, 1440);
    await page.evaluate(() => {
      (window as unknown as { cls: number }).cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { value: number }[]) {
          (window as unknown as { cls: number }).cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const row = page.locator("[data-use-case]").first();
    await expect(row).toHaveAttribute("data-reveal", "pending");
    expect(await row.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    const layoutTop = await row.evaluate((el) => (el as HTMLElement).offsetTop);

    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveAttribute("data-reveal", "shown");
    await expect.poll(() => row.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await row.evaluate((el) => (el as HTMLElement).offsetTop)).toBe(layoutTop);
    const cls = await page.evaluate(() => (window as unknown as { cls: number }).cls);
    expect(cls).toBeLessThan(0.01);
  });

  test("content on screen at load is never hidden", async ({ page }) => {
    await open(page, 1440);
    const states = await page
      .locator("[data-reveal]")
      .evaluateAll((els) =>
        els
          .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
          .map((el) => (el as HTMLElement).dataset.reveal),
      );
    expect(states.length).toBeGreaterThan(0);
    expect(states.every((state) => state !== "pending")).toBe(true);
  });

  test("reduced motion: nothing is ever hidden", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, 1440);
    await expect(page.locator("[data-reveal=pending]")).toHaveCount(0);
  });
});

test.describe("P07-D17: the Showcase recording UI stays static", () => {
  test("waveform and recording dot have no animation, even with motion allowed", async ({
    page,
  }) => {
    await open(page, 390);
    const card = page.locator("[data-showcase-mobile]");
    await card.scrollIntoViewIfNeeded();
    await expect(page.locator("[data-showcase-window]")).not.toHaveAttribute(
      "data-reveal",
      "pending",
    );
    await page.waitForTimeout(600); // let the window's reveal transition finish
    const count = await page.evaluate(
      () =>
        ["[data-showcase-waveform]", "[data-showcase-status]"]
          .flatMap((selector) => [...document.querySelectorAll(selector)])
          .flatMap((el) => el.getAnimations({ subtree: true })).length,
    );
    expect(count).toBe(0);
  });
});

test.describe("Navigation centring", () => {
  for (const width of [1440, 1280]) {
    test(`Desktop ${width}: the floating bar is geometrically centred`, async ({ page }) => {
      await open(page, width);
      const bar = await page.locator("[data-landing-bar=desktop]").boundingBox();
      if (!bar) throw new Error("bar not rendered");
      const left = bar.x;
      const right = width - (bar.x + bar.width);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
      expect(Math.abs(bar.x + bar.width / 2 - width / 2)).toBeLessThanOrEqual(0.5);
    });
  }

  for (const width of [1024, 768, 390]) {
    test(`${width}: the compact bar spans the viewport`, async ({ page }) => {
      await open(page, width);
      const bar = await page.locator("[data-landing-bar=compact]").boundingBox();
      if (!bar) throw new Error("bar not rendered");
      expect(Math.round(bar.x)).toBe(0);
      expect(Math.round(bar.width)).toBe(width);
    });
  }
});

test.describe("Interactions", () => {
  test("CTA and navigation hover: colour, border and glow transitions only (no movement)", async ({
    page,
  }) => {
    await open(page, 1440);
    const primary = page.locator("[data-landing-hero-cta=primary]");
    const outline = page.locator("[data-landing-hero-cta=secondary]");
    const before = await primary.boundingBox();
    await primary.hover();
    await expect
      .poll(() => primary.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe("none");
    expect(await primary.boundingBox()).toEqual(before);
    await outline.hover();
    await expect
      .poll(() => outline.evaluate((el) => getComputedStyle(el).borderTopColor))
      .toBe("rgb(99, 161, 255)");
    const link = page.locator("[data-landing-bar=desktop] nav a").first();
    await link.hover();
    await expect
      .poll(() => link.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(99, 161, 255)");
  });
});

test.describe("Responsive and accessibility with motion and video", () => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`${width}px: no horizontal overflow`, async ({ page }) => {
      await open(page, width);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  for (const width of [390, 768, 1440]) {
    test(`axe ${width}px (WCAG 2.2 AA) with the refinement active`, async ({ page }) => {
      await open(page, width);
      const results = await new AxeBuilder({ page })
        .include("main")
        .include("header")
        .withTags(WCAG_TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
