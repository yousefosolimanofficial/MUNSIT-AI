import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };

/*
 * Phase 07 Increment 2: Landing Hero (approved contract docs/phases/phase-07-hero-contract.md;
 * Figma Desktop `28:3`, Tablet `200:559`, Mobile `200:713`, design-values §16.1). No approved
 * video exists yet (P07-D14): the Hero is Near Black, with no video and no Pause/Play control.
 * The video component (poster, reduced motion, control) is covered by HeroVideo.test.tsx.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", path: "/", m: arLanding },
  { locale: "en", dir: "ltr", path: "/en", m: enLanding },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("not rendered");
  return {
    x: Math.round(b.x),
    y: Math.round(b.y),
    w: Math.round(b.width),
    h: Math.round(b.height),
  };
}

async function open(page: Page, path: string, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const hero = (page: Page) => page.locator("section#top");
const primary = (page: Page) => page.locator("[data-landing-hero-cta=primary]");
const secondary = (page: Page) => page.locator("[data-landing-hero-cta=secondary]");

for (const { locale, dir, path, m } of LOCALES) {
  test.describe(`Landing Hero (${locale})`, () => {
    test("copy and CTAs: verbatim heading (h1), description, Register route, How It Works anchor", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.hero.heading);
      await expect(hero(page).getByText(m.hero.description)).toBeVisible();
      await expect(primary(page)).toHaveText(m.hero.ctaPrimary);
      await expect(primary(page)).toHaveAttribute(
        "href",
        locale === "ar" ? "/register" : "/en/register",
      );
      await expect(secondary(page)).toHaveText(m.hero.ctaSecondary);
      await expect(secondary(page)).toHaveAttribute("href", "#how-it-works");
      // The primary CTA is never in the navigation (owner decision).
      await expect(page.locator("header")).not.toContainText(m.hero.ctaPrimary);
    });

    test("Desktop 1440: 1440 × 900 at y 0; text block and actions as Figma; header floats over it", async ({
      page,
    }) => {
      await open(page, path, 1440);
      // Arabic is the Figma copy: exact. English has no Figma frames and longer proposed copy.
      const heroBox = await box(hero(page));
      expect(heroBox).toMatchObject({ x: 0, y: 0, w: 1440 });
      if (locale === "ar") expect(heroBox.h).toBe(900);
      else expect(heroBox.h).toBeGreaterThanOrEqual(900);
      expect(await box(page.locator("[data-landing-hero-text]"))).toMatchObject({
        x: 340,
        y: 344,
        w: 760,
      });
      const h1 = await box(page.getByRole("heading", { level: 1 }));
      expect(h1).toMatchObject({ y: 344, w: 651 });
      if (locale === "ar") {
        expect(h1.h).toBe(143);
        expect((await box(hero(page).getByText(m.hero.description))).y).toBe(523);
      } else {
        expect(h1.h).toBeGreaterThanOrEqual(143);
      }
      const actions = await box(page.locator("[data-landing-hero-actions]"));
      expect(actions.h).toBe(86);
      if (locale === "ar") expect(actions.y).toBe(688);
      // Centred: box() rounds x and width, so an odd width can put the centre at .5 (±1).
      expect(Math.abs(actions.x + actions.w / 2 - 720)).toBeLessThanOrEqual(1);
      const p = await box(primary(page));
      const s = await box(secondary(page));
      expect(p.h).toBe(46);
      expect(s.h).toBe(48);
      if (locale === "ar") {
        // Figma widths with the Arabic labels; ±2 for font rasterisation on the outline label.
        expect(p.w).toBe(131);
        expect(Math.abs(s.w - 186)).toBeLessThanOrEqual(2);
      }
      // Primary at the inline start: right in RTL, left in LTR.
      if (dir === "rtl") expect(p.x).toBeGreaterThan(s.x);
      else expect(p.x).toBeLessThan(s.x);
      const font = await page.getByRole("heading", { level: 1 }).evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.fontSize, c.fontWeight, c.lineHeight, c.textAlign];
      });
      expect(font).toEqual(["56px", "600", "67.2px", "center"]);
      // The floating header is painted above the Hero.
      const bar = await box(page.locator("[data-landing-bar=desktop]"));
      const point: [number, number] = [bar.x + 2, bar.y + bar.h / 2];
      const topAt = await page.evaluate(
        ([x, y]) =>
          document
            .elementFromPoint(x, y)
            ?.closest("[data-landing-bar]")
            ?.getAttribute("data-landing-bar"),
        point,
      );
      expect(topAt).toBe("desktop");
    });

    test("Tablet 768: 640 high, 32 below the 78 header; 44 / 1.2 heading; row actions", async ({
      page,
    }) => {
      await open(page, path, 768);
      const heroBox = await box(hero(page));
      expect(heroBox).toMatchObject({ x: 0, y: 110, w: 768 });
      if (locale === "ar") expect(Math.abs(heroBox.h - 640)).toBeLessThanOrEqual(2);
      else expect(heroBox.h).toBeGreaterThanOrEqual(640);
      expect(await box(page.locator("[data-landing-hero-text]"))).toMatchObject({
        x: 32,
        y: 310,
        w: 704,
      });
      const font = await page.getByRole("heading", { level: 1 }).evaluate((el) => {
        const c = getComputedStyle(el);
        return [c.fontSize, c.fontWeight, c.lineHeight];
      });
      expect(font).toEqual(["44px", "600", "52.8px"]);
      const p = await box(primary(page));
      const s = await box(secondary(page));
      expect(Math.abs(p.y + p.h / 2 - (s.y + s.h / 2))).toBeLessThanOrEqual(1); // one row
      expect(await box(page.locator("[data-landing-hero-actions]"))).toMatchObject({ h: 86 });
    });

    test("Mobile 390: 538 high, 24 below the 70 header; stacked full-width actions, primary first", async ({
      page,
    }) => {
      await open(page, path, 390);
      const heroBox = await box(hero(page));
      expect(heroBox).toMatchObject({ x: 0, y: 94, w: 390 });
      // Figma's Mobile text boxes are rounded (76 / 66 for 76.8 / 67.2): ±2.
      if (locale === "ar") expect(Math.abs(heroBox.h - 538)).toBeLessThanOrEqual(2);
      else expect(heroBox.h).toBeGreaterThanOrEqual(538);
      expect(await box(page.locator("[data-landing-hero-text]"))).toMatchObject({
        x: 20,
        y: 244,
        w: 350,
      });
      const p = await box(primary(page));
      const s = await box(secondary(page));
      expect(p).toMatchObject({ x: 20, w: 350, h: 46 });
      expect(s).toMatchObject({ x: 20, w: 350, h: 48 });
      expect(s.y - (p.y + p.h)).toBe(12);
      const font = await page
        .getByRole("heading", { level: 1 })
        .evaluate((el) => getComputedStyle(el).fontSize);
      expect(font).toBe("32px");
    });

    test("no approved video: Near Black background, no video, no Pause/Play control (P07-D14)", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(hero(page).locator("video")).toHaveCount(0);
      await expect(hero(page).locator("[data-landing-hero-control]")).toHaveCount(0);
      const bg = await page
        .locator("[data-landing-hero-media]")
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe("rgb(4, 5, 6)");
    });

    test("reduced motion: the Hero is static (no video, no control)", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, path, 390);
      await expect(hero(page).locator("video")).toHaveCount(0);
      await expect(hero(page).locator("[data-landing-hero-control]")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("keyboard: the CTAs are reachable with a visible focus ring; the outline CTA moves to How It Works", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await waitForHydration(page, primary(page));
      await primary(page).focus();
      const ring = await primary(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.outlineStyle, s.outlineWidth];
      });
      expect(ring).toEqual(["solid", "2px"]);
      await page.keyboard.press("Tab");
      await expect(secondary(page)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect.poll(() => page.evaluate(() => location.hash)).toBe("#how-it-works");
    });

    test("text contrast on the temporary background meets WCAG AA", async ({ page }) => {
      await open(page, path, 1440);
      // White heading and 90% white description on Near Black: measured from computed colours.
      const ratio = await hero(page)
        .getByText(m.hero.description)
        .evaluate((el) => {
          // Normalise any CSS colour syntax (e.g. color(srgb …)) through a canvas, composited on
          // the Near Black background (#040506).
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return 0;
          ctx.fillStyle = "#040506";
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = getComputedStyle(el).color;
          ctx.fillRect(0, 0, 1, 1);
          const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
          const lum = (rgb: number[]) =>
            rgb
              .map((v) => v / 255)
              .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
              .reduce((acc, v, i) => acc + v * ([0.2126, 0.7152, 0.0722][i] ?? 0), 0);
          const fg = lum([r, g, b]);
          const bg = lum([4, 5, 6]);
          return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`${width}px: no horizontal overflow`, async ({ page }) => {
        await open(page, path, width);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    for (const width of [1440, 768, 390]) {
      test(`axe ${width}px`, async ({ page }) => {
        await open(page, path, width);
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .exclude("nextjs-portal")
          .analyze();
        expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual(
          [],
        );
      });
    }
  });
}
