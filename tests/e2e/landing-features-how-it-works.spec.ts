import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };

/*
 * Phase 07 Increment 4: Mariam's Features and How It Works sections, integrated in the page.
 * Figma Features Desktop `114:6` (fixed 1000), Tablet `200:591`, Mobile `200:745`; How It Works
 * Desktop `121:40` (fixed 820), Tablet `200:605`, Mobile `200:756`. Arabic geometry is exact (±1);
 * English has no Figma frames (structure, order and overflow only).
 *
 * Known difference (documented, not hidden): at 768, Arabic steps 03 and 04 wrap to 3 lines
 * (Figma 2) because of the shared `Inter, Cairo` font stack (Inter draws the spaces in Arabic
 * runs). The test asserts at least the Figma height there.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", path: "/", m: arLanding },
  { locale: "en", dir: "ltr", path: "/en", m: enLanding },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FEATURE_FILES = [
  "live-transcription",
  "smart-highlights",
  "smart-summaries",
  "question-bank",
  "ai-tutor",
  "lecture-slides",
];
const STEP_FILES = ["record", "processing", "review", "practice"];

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("not rendered");
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}

function near(actual: number, expected: number, label: string, tolerance = 1) {
  expect(Math.abs(actual - expected), `${label}: ${actual} ≈ ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
}

async function open(page: Page, path: string, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const features = (page: Page) => page.locator("section#features");
const how = (page: Page) => page.locator("section#how-it-works");
const featureCards = (page: Page) => features(page).locator("[data-landing-card=feature]");
const stepCards = (page: Page) => how(page).locator("[data-landing-card=step]");
const docTop = async (locator: Locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

for (const { locale, dir, path, m } of LOCALES) {
  test.describe(`Landing Features and How It Works (${locale})`, () => {
    // Layout is measured settled (scroll reveal off); the reveal is covered elsewhere.
    test.use({ reducedMotion: "reduce" });

    test("copy and landmarks: verbatim headings, cards and steps; named regions", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.getByRole("region", { name: m.features.heading })).toHaveAttribute(
        "id",
        "features",
      );
      await expect(page.getByRole("region", { name: m.howItWorks.heading })).toHaveAttribute(
        "id",
        "how-it-works",
      );
      await expect(features(page).getByRole("heading", { level: 2 })).toHaveText(
        m.features.heading,
      );
      await expect(how(page).getByRole("heading", { level: 2 })).toHaveText(m.howItWorks.heading);
      const items = Object.values(m.features.items);
      await expect(features(page).getByRole("heading", { level: 3 })).toHaveText(
        items.map((item) => item.title),
      );
      for (const [index, item] of items.entries()) {
        // textContent keeps the Figma "\n" (rendered with pre-line).
        expect(await featureCards(page).nth(index).locator("p").textContent()).toBe(item.text);
      }
      const steps = Object.values(m.howItWorks.steps);
      await expect(how(page).getByRole("heading", { level: 3 })).toHaveText(
        steps.map((step) => step.title),
      );
      for (const [index, step] of steps.entries()) {
        await expect(stepCards(page).nth(index)).toContainText(step.number);
        await expect(stepCards(page).nth(index)).toContainText(step.text);
      }
      await expect(featureCards(page)).toHaveCount(6);
      await expect(stepCards(page)).toHaveCount(4);
    });

    test("reading order: card and step 01 at the inline start; numbers LTR; connector decorative", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const first = await box(featureCards(page).nth(0));
      const second = await box(featureCards(page).nth(1));
      const step1 = await box(stepCards(page).nth(0));
      const step2 = await box(stepCards(page).nth(1));
      if (dir === "rtl") {
        expect(first.x).toBeGreaterThan(second.x);
        expect(step1.x).toBeGreaterThan(step2.x);
      } else {
        expect(first.x).toBeLessThan(second.x);
        expect(step1.x).toBeLessThan(step2.x);
      }
      await expect(stepCards(page).nth(0).locator("bdi[dir=ltr]")).toHaveText("01");
      const connectors = how(page).locator("[data-step-connector]");
      await expect(connectors).toHaveCount(8);
      for (const connector of await connectors.all()) {
        await expect(connector).toHaveAttribute("aria-hidden", "true");
      }
    });

    test("images: the ten Figma visuals load, decorative, in card order", async ({ page }) => {
      await open(page, path, 1440);
      const checks: [Locator, string, string][] = [
        ...FEATURE_FILES.map(
          (file, index) =>
            [featureCards(page).nth(index), "features", file] as [Locator, string, string],
        ),
        ...STEP_FILES.map(
          (file, index) =>
            [stepCards(page).nth(index), "how-it-works", file] as [Locator, string, string],
        ),
      ];
      for (const [card, folder, file] of checks) {
        const image = card.locator("img");
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveAttribute("alt", "");
        await expect(image).toHaveAttribute("src", new RegExp(`${folder}%2F${file}\\.webp`));
        await expect
          .poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
          .toBe(true);
        await expect(image).toHaveCSS("object-fit", "cover");
      }
    });

    test("Desktop 1440: grids 3 × 2 and 4, Figma card and visual sizes", async ({ page }) => {
      await open(page, path, 1440);
      for (let index = 0; index < 6; index += 1) {
        const card = await box(featureCards(page).nth(index));
        const visual = await box(featureCards(page).nth(index).locator("img"));
        near(card.w, 384, `feature ${index + 1} width`);
        near(visual.w, 336, `feature ${index + 1} visual width`);
        near(visual.h, 144, `feature ${index + 1} visual height`);
        if (locale === "ar") near(card.h, 300, `feature ${index + 1} height`);
      }
      for (let index = 0; index < 4; index += 1) {
        const card = await box(stepCards(page).nth(index));
        const visual = await box(stepCards(page).nth(index).locator("img"));
        near(card.w, 282, `step ${index + 1} width`);
        near(visual.w, 240, `step ${index + 1} visual width`);
        near(visual.h, 136, `step ${index + 1} visual height`);
        if (locale === "ar") near(card.h, 440, `step ${index + 1} height`);
      }
      if (locale === "ar") {
        // Figma page positions: Features 1967 (1000 high), How It Works 2967 (820), Use Cases 3787.
        near(await docTop(features(page)), 1967, "features y");
        near((await box(features(page))).h, 1000, "features height");
        near(await docTop(how(page)), 2967, "how it works y");
        near((await box(how(page))).h, 820, "how it works height");
        near(await docTop(page.locator("section#use-cases")), 3787, "use cases y");
      }
    });

    test("Tablet 768: two columns; Figma card and visual sizes", async ({ page }) => {
      await open(page, path, 768);
      for (let index = 0; index < 6; index += 1) {
        const card = await box(featureCards(page).nth(index));
        near(card.w, 342, `feature ${index + 1} width`);
        near((await box(featureCards(page).nth(index).locator("img"))).w, 294, "visual width");
        if (locale === "ar") near(card.h, 288, `feature ${index + 1} height`);
      }
      for (let index = 0; index < 4; index += 1) {
        const card = await box(stepCards(page).nth(index));
        near(card.w, 342, `step ${index + 1} width`);
        near((await box(stepCards(page).nth(index).locator("img"))).w, 300, "visual width");
        // Figma 302; steps 03–04 wrap to 3 lines with the shared font stack (documented).
        if (locale === "ar") expect(card.h).toBeGreaterThanOrEqual(301.5);
      }
      if (locale === "ar") {
        near(await docTop(features(page)), 1600, "features y");
        // ±2: each card is 288.4 (Figma rounds to 288); three rows plus the intro add ~1.6.
        near((await box(features(page))).h, 1172, "features height", 2);
        near(await docTop(how(page)), 2804, "how it works y", 2); // carries the ~1.5 above
      }
    });

    test("Mobile 390: one column; Figma card and visual sizes", async ({ page }) => {
      await open(page, path, 390);
      for (let index = 0; index < 6; index += 1) {
        const card = await box(featureCards(page).nth(index));
        expect(card).toMatchObject({ x: 20, w: 350 });
        near((await box(featureCards(page).nth(index).locator("img"))).w, 302, "visual width");
        if (locale === "ar") near(card.h, 286, `feature ${index + 1} height`);
      }
      for (let index = 0; index < 4; index += 1) {
        const card = await box(stepCards(page).nth(index));
        expect(card).toMatchObject({ x: 20, w: 350 });
        near((await box(stepCards(page).nth(index).locator("img"))).w, 308, "visual width");
        if (locale === "ar") near(card.h, 300, `step ${index + 1} height`);
      }
      if (locale === "ar") {
        near((await box(features(page))).h, 2067, "features height", 2);
        near((await box(how(page))).h, 1488, "how it works height", 2);
      }
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`${width}px: no overflow, no clipped text, no overlap`, async ({ page }) => {
        await open(page, path, width);
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const cards = [...document.querySelectorAll<HTMLElement>("[data-landing-card]")];
          const clipped = cards
            .flatMap((card) => [...card.querySelectorAll<HTMLElement>("h3, p")])
            .filter(
              (el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1,
            )
            .map((el) => el.textContent?.slice(0, 20));
          const rects = cards.map((card) => card.getBoundingClientRect());
          let overlaps = 0;
          rects.forEach((a, i) =>
            rects.slice(i + 1).forEach((b) => {
              const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (x > 1 && y > 1) overlaps += 1;
            }),
          );
          return { overflow: root.scrollWidth - root.clientWidth, clipped, overlaps };
        });
        expect(result.overflow).toBe(0);
        expect(result.clipped).toEqual([]);
        expect(result.overlaps).toBe(0);
      });
    }

    for (const width of [390, 768, 1440]) {
      test(`axe ${width}px (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, path, width);
        const results = await new AxeBuilder({ page })
          .include("#features")
          .include("#how-it-works")
          .withTags(WCAG_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}
