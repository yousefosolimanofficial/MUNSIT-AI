import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./test";

/*
 * Phase 07 Visual Refinement and Hero media (P07-D17, plan §8e). Motion is allowed in this file
 * unless a test emulates reduced motion. P07-D21: the Hero background is the original static Figma
 * image (no video, poster or control; production gate in gates.ts). Measurements:
 * docs/phases/phase-07-static-hero.md.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
/** Any request for the superseded video files or their poster. */
const VIDEO_MEDIA = /\.(mp4|webm)(\?|$)|hero-ambient/;

async function open(page: Page, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

const hero = (page: Page) => page.locator("section#top");
const heroImage = (page: Page) => hero(page).locator("img[data-landing-hero-image]");

/**
 * WCAG contrast of an element's text over the Hero image as displayed (object-fit, centred),
 * sampled at every pixel of its line boxes. Returns the 1st percentile: the lowest 1% of ratios
 * (glyph-edge and highlight noise) is ignored.
 */
async function contrastOverImage(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const img = document.querySelector<HTMLImageElement>("img[data-landing-hero-image]");
    const el = document.querySelector<HTMLElement>(sel);
    if (!img || !el) return 0;
    const ib = img.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(ib.width);
    canvas.height = Math.round(ib.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.fillStyle = "#040506";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const pick = getComputedStyle(img).objectFit === "contain" ? Math.min : Math.max;
    const s = pick(ib.width / img.naturalWidth, ib.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (ib.width - w) / 2, (ib.height - h) / 2, w, h);
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return 0;
    probe.fillStyle = getComputedStyle(el).color;
    probe.fillRect(0, 0, 1, 1);
    const [fr = 0, fg = 0, fb = 0, fa8 = 255] = probe.getImageData(0, 0, 1, 1).data;
    const fa = fa8 / 255;
    const lin = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const lum = (r: number, g: number, b: number) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const range = document.createRange();
    range.selectNodeContents(el);
    const ratios: number[] = [];
    for (const r of range.getClientRects()) {
      const x = Math.max(0, Math.floor(r.left - ib.left));
      const y = Math.max(0, Math.floor(r.top - ib.top));
      const rw = Math.min(canvas.width - x, Math.ceil(r.width));
      const rh = Math.min(canvas.height - y, Math.ceil(r.height));
      if (rw <= 0 || rh <= 0) continue;
      const d = ctx.getImageData(x, y, rw, rh).data;
      for (let i = 0; i < d.length; i += 4) {
        const br = d[i] ?? 0;
        const bg = d[i + 1] ?? 0;
        const bb = d[i + 2] ?? 0;
        const text = lum(fr * fa + br * (1 - fa), fg * fa + bg * (1 - fa), fb * fa + bb * (1 - fa));
        const back = lum(br, bg, bb);
        ratios.push((Math.max(text, back) + 0.05) / (Math.min(text, back) + 0.05));
      }
    }
    ratios.sort((a, b) => a - b);
    return ratios[Math.floor(0.01 * (ratios.length - 1))] ?? 0;
  }, selector);
}

test.describe("Hero media (static Figma image, P07-D21)", () => {
  for (const width of [1440, 768, 390]) {
    test(`${width}: no video, poster or control; no video download; the image loads`, async ({
      page,
    }) => {
      const requests: string[] = [];
      page.on("request", (request) => {
        if (VIDEO_MEDIA.test(request.url())) requests.push(request.url());
      });
      await open(page, width);
      await page.waitForLoadState("networkidle");
      expect(requests).toEqual([]);
      await expect(hero(page).locator("video")).toHaveCount(0);
      await expect(hero(page).locator("[data-landing-hero-poster]")).toHaveCount(0);
      await expect(hero(page).locator("[data-landing-hero-control]")).toHaveCount(0);
      await expect
        .poll(() =>
          heroImage(page).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth),
        )
        .toBeGreaterThan(0);
      expect(await heroImage(page).evaluate((img: HTMLImageElement) => img.currentSrc)).toContain(
        encodeURIComponent("/landing/hero/hero-figma-2880x1782.webp"),
      );
    });
  }

  test("the image is static (no animation or transition) and causes no layout shift", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { heroShift: number };
      w.heroShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          sources?: { node?: Node | null }[];
        }[]) {
          const inHero = entry.sources?.some((s) =>
            s.node instanceof Element ? s.node.closest("section#top") !== null : false,
          );
          if (inHero) w.heroShift += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await open(page, 1440);
    await page.waitForLoadState("networkidle");
    const state = await heroImage(page).evaluate((img) => ({
      animations: img.getAnimations().length,
      animation: getComputedStyle(img).animationName,
    }));
    expect(state).toEqual({ animations: 0, animation: "none" });
    expect(await page.evaluate(() => (window as unknown as { heroShift: number }).heroShift)).toBe(
      0,
    );
  });

  // WCAG over the image (1st percentile of the per-pixel ratios). The heading is large text
  // (3:1) everywhere. The description is large on Desktop (24 px, 3:1) and normal text on Mobile
  // (16 px, 4.5:1). The Tablet description (20 px) is an OPEN finding: measured and documented in
  // docs/phases/phase-07-static-hero.md, not asserted here.
  for (const [width, description] of [
    [1440, 3],
    [390, 4.5],
  ] as const) {
    test(`${width}: text contrast over the image (heading ≥ 3; description ≥ ${description})`, async ({
      page,
    }) => {
      await open(page, width);
      await expect
        .poll(() => heroImage(page).evaluate((img: HTMLImageElement) => img.complete))
        .toBe(true);
      expect(await contrastOverImage(page, "#landing-hero-heading")).toBeGreaterThanOrEqual(3);
      expect(await contrastOverImage(page, "[data-landing-hero-text] p")).toBeGreaterThanOrEqual(
        description,
      );
    });
  }

  test("768: heading contrast over the image ≥ 3", async ({ page }) => {
    await open(page, 768);
    await expect
      .poll(() => heroImage(page).evaluate((img: HTMLImageElement) => img.complete))
      .toBe(true);
    expect(await contrastOverImage(page, "#landing-hero-heading")).toBeGreaterThanOrEqual(3);
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

test.describe("Responsive and accessibility with motion", () => {
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
