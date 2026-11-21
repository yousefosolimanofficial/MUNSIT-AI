import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };

/*
 * Phase 07 Increment 3: Product Showcase and Use Cases. Figma Showcase Desktop `36:169`, Tablet
 * `200:568`, Mobile `200:722`; Use Cases `123:64`, `200:616`, `200:765` (design-values §16.6).
 * Arabic is the Figma copy, so its geometry is exact (±1 for sub-pixel centring and text-driven
 * heights). English has no Figma frames and longer proposed copy (P07-D1): structure, order and
 * overflow only.
 *
 * P07-D22 (2026-11-20): the Showcase illustration is the native Mobile live-transcription card on
 * every breakpoint (no Desktop/Tablet screenshot or menu). It sits in a stage that keeps the former
 * window's height (Tablet 436, Desktop 560): Tablet 520 wide, centred; Desktop (owner-approved
 * Candidate B, widened to 760 on 2026-11-21) 760 wide, 48 below the stage top.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", path: "/", m: arLanding },
  { locale: "en", dir: "ltr", path: "/en", m: enLanding },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("not rendered");
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}

/** Within ±1 px: sub-pixel centring and text-driven heights. */
function near(actual: number, expected: number, label: string) {
  expect(Math.abs(actual - expected), `${label}: ${actual} ≈ ${expected}`).toBeLessThanOrEqual(1);
}

async function open(page: Page, path: string, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const showcase = (page: Page) => page.locator("section#showcase");
const casesSection = (page: Page) => page.locator("section#use-cases");
const appWindow = (page: Page) => page.locator("[data-showcase-window]");
const stage = (page: Page) => page.locator("[data-showcase-stage]");

/** The same native card on Tablet and Desktop: stacked header, transcript body, no screenshot. */
async function expectNativeCard(page: Page, m: typeof arLanding, dir: string) {
  const win = await box(appWindow(page));
  await expect(showcase(page).locator("img")).toHaveCount(0);
  await expect(page.locator("[data-showcase-screen]")).toHaveCount(0);
  await expect(page.locator("[data-showcase-sidebar]")).toHaveCount(0);
  const card = page.locator("[data-showcase-mobile]");
  await expect(card).toBeVisible();
  await expect(card).toContainText(m.showcase.mobile.heading);
  await expect(page.locator("[data-showcase-waveform] > span")).toHaveCount(10);
  // Mobile hierarchy kept: the pill above the title, both at the inline start (17 from the edge).
  const status = await box(page.locator("[data-showcase-status]"));
  const title = await box(page.locator("[data-showcase-title]"));
  expect(status.y).toBeLessThan(title.y);
  near(status.h, 40, "status height (Mobile value)");
  if (dir === "rtl") near(status.x + status.w, win.x + win.w - 17, "status inline start");
  else near(status.x, win.x + 17, "status inline start");
  near((await box(page.locator("[data-showcase-header]"))).h, 114.8, "header height");
  // Same type sizes as Mobile.
  expect(
    await card
      .locator("p")
      .first()
      .evaluate((e) => getComputedStyle(e).fontSize),
  ).toBe("16px");
  return win;
}
const rows = (page: Page) => page.locator("[data-use-case]");

for (const { locale, dir, path, m } of LOCALES) {
  test.describe(`Landing Showcase and Use Cases (${locale})`, () => {
    // Layout is measured settled: with motion allowed, elements below the fold are still in their
    // scroll-reveal start state (12 px low, transparent). Reduced motion turns the reveal off. The
    // reveal itself is covered with motion on in landing-visual-refinement.spec.ts.
    test.use({ reducedMotion: "reduce" });

    test("copy: verbatim headings (h2, h3), descriptions and illustration copy", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      // textContent: exact, including the U+2028 line separator of the Arabic heading.
      expect(await page.locator("#landing-showcase-heading").textContent()).toBe(
        m.showcase.heading,
      );
      await expect(showcase(page)).toHaveAttribute("aria-labelledby", "landing-showcase-heading");
      await expect(showcase(page).getByText(m.showcase.description)).toBeVisible();
      await expect(appWindow(page)).toContainText(m.showcase.recording);
      await expect(appWindow(page)).toContainText(m.showcase.timer);
      for (const key of ["heading", "live", "line1", "line2", "time1", "time2", "pause"] as const) {
        await expect(appWindow(page)).toContainText(m.showcase.mobile[key]);
      }

      await expect(casesSection(page)).toHaveAttribute(
        "aria-labelledby",
        "landing-use-cases-heading",
      );
      await expect(casesSection(page).getByRole("heading", { level: 2 })).toHaveText(
        m.useCases.heading,
      );
      await expect(casesSection(page).getByText(m.useCases.description)).toBeVisible();
      const items = Object.values(m.useCases.items);
      await expect(casesSection(page).getByRole("heading", { level: 3 })).toHaveText(
        items.map((item) => item.title),
      );
      for (const [index, item] of items.entries()) {
        await expect(rows(page).nth(index)).toContainText(item.eyebrow);
        await expect(rows(page).nth(index)).toContainText(item.text);
      }
    });

    test("the illustration is not interactive: aria-hidden, nothing focusable, no controls", async ({
      page,
    }) => {
      for (const width of [1440, 390]) {
        await open(page, path, width);
        await expect(appWindow(page)).toHaveAttribute("aria-hidden", "true");
        for (const section of [showcase(page), casesSection(page)]) {
          await expect(
            section.locator("a, button, input, select, textarea, [tabindex], [role=button]"),
          ).toHaveCount(0);
        }
        // Nothing in the window is exposed to assistive technology.
        await expect(showcase(page).getByRole("img")).toHaveCount(0);
      }
    });

    test("images: the Figma assets, decorative (empty alt), loaded at their boxes", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const images = casesSection(page).locator("img");
      await expect(images).toHaveCount(3);
      const files = ["during-lecture", "studying", "exam-preparation"];
      for (const [index, file] of files.entries()) {
        const image = images.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveAttribute("alt", "");
        await expect(image).toHaveAttribute("src", new RegExp(`use-cases%2F${file}\\.webp`));
        await expect
          .poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
          .toBe(true);
        await expect(image).toHaveCSS("object-fit", "cover");
      }
      // P07-D22: the Showcase has no raster image; its illustration is native HTML.
      await expect(showcase(page).locator("img")).toHaveCount(0);
    });

    test("Desktop 1440: the native card, 760 wide, 48 below the top of the 1171 × 560 stage (Candidate B); alternating Use Case rows", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const win = await expectNativeCard(page, m, dir);
      const area = await box(stage(page));
      near(area.w, 1171, "stage width");
      near(area.h, 560, "stage height");
      near(area.x, 134.5, "stage x");
      near(win.w, 760, "card width");
      near(win.x + win.w / 2, 720, "card centred horizontally");
      near(win.y, area.y + 48, "card 48 below the stage top");

      // Rows 1 and 3: image at the inline end; row 2: at the inline start.
      for (let index = 0; index < 3; index += 1) {
        const row = await box(rows(page).nth(index));
        const image = await box(rows(page).nth(index).locator("[data-use-case-image]"));
        near(row.w, 1200, `row ${index + 1} width`);
        near(row.x, 120, `row ${index + 1} x`);
        near(image.w, 500, `image ${index + 1} width`);
        near(image.h, 276, `image ${index + 1} height`);
        const imageLeft = image.x < row.x + row.w / 2;
        const atEnd = index !== 1;
        expect(imageLeft, `row ${index + 1} image side`).toBe(dir === "rtl" ? atEnd : !atEnd);
      }

      if (locale === "ar") {
        const section = await box(showcase(page));
        near(section.y, 935, "showcase y");
        near(section.h, 942, "showcase height");
        near(area.y, 935 + 339, "stage y (the former window's position)");
        near(win.h, 304.8, "card height (content)");
        // About 99 from the description's last line to the card (Candidate B).
        const descriptionBottom = await page.locator("[data-showcase-intro] p").evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return Math.max(...[...range.getClientRects()].map((r) => r.bottom));
        });
        near(win.y - descriptionBottom, 99, "description to card");
        // The section height and every later section keep their positions.
        near((await box(page.locator("section#features"))).y, 1967, "Features y");
        const intro = await box(page.locator("[data-showcase-intro]"));
        near(intro.w, 900, "intro width");
        near(intro.h, 257, "intro height");
        const uc = await box(casesSection(page));
        near(uc.h, 1410, "use cases height");
        const first = await box(rows(page).nth(0));
        near(first.y, uc.y + 72 + 94 + 48, "first row y");
        for (let index = 0; index < 3; index += 1) {
          near((await box(rows(page).nth(index))).h, 340, `row ${index + 1} height`);
        }
      }
    });

    test("Desktop 1280: the 760 card, centred, 48 below the stage top; section unchanged", async ({
      page,
    }) => {
      await open(page, path, 1280);
      const win = await expectNativeCard(page, m, dir);
      const area = await box(stage(page));
      near(area.h, 560, "stage height");
      near(win.w, 760, "card width");
      near(win.x + win.w / 2, 640, "card centred horizontally");
      near(win.y, area.y + 48, "card 48 below the stage top");
      if (locale === "ar") {
        const section = await box(showcase(page));
        near(section.y, 935, "showcase y");
        near(section.h, 942, "showcase height");
      }
    });

    test("Tablet 768: the native card, 520 wide, centred in the 704 × 436 stage; stacked Use Case cards", async ({
      page,
    }) => {
      await open(page, path, 768);
      const win = await expectNativeCard(page, m, dir);
      const area = await box(stage(page));
      expect(area).toMatchObject({ x: 32, w: 704 });
      near(area.h, 436, "stage height");
      near(win.w, 520, "card width");
      near(win.x + win.w / 2, 384, "card centred horizontally");
      near(win.y + win.h / 2, area.y + area.h / 2, "card centred vertically");
      if (locale === "ar") near(win.h, 326.8, "card height (content)");

      for (let index = 0; index < 3; index += 1) {
        const row = await box(rows(page).nth(index));
        const image = await box(rows(page).nth(index).locator("[data-use-case-image]"));
        expect(row).toMatchObject({ x: 32, w: 704 });
        near(image.w, 654, `image ${index + 1} width`);
        near(image.h, 280, `image ${index + 1} height`);
        near(image.y, row.y + 25, `image ${index + 1} on top`);
        if (locale === "ar") near(row.h, 509, `card ${index + 1} height`);
      }
      if (locale === "ar") {
        const hero = await box(page.locator("section#top"));
        const section = await box(showcase(page));
        near(section.y, hero.y + hero.h + 32, "showcase gap");
        near(section.h, 786, "showcase height");
      }
    });

    test("Mobile 390: stacked header and the live-transcript card (no image)", async ({ page }) => {
      await open(page, path, 390);
      const win = await box(appWindow(page));
      expect(win).toMatchObject({ x: 20, w: 350 });
      await expect(page.locator("[data-showcase-screen]")).toBeHidden();
      await expect(page.locator("[data-showcase-sidebar]")).toBeHidden();
      const card = page.locator("[data-showcase-mobile]");
      await expect(card).toBeVisible();
      await expect(card).toContainText(m.showcase.mobile.heading);
      await expect(card).toContainText(m.showcase.mobile.live);
      for (const key of ["line1", "line2", "time1", "time2", "pause"] as const) {
        await expect(card).toContainText(m.showcase.mobile[key]);
      }
      await expect(page.locator("[data-showcase-waveform] > span")).toHaveCount(10);
      // Pill above the title, both at the inline start.
      const status = await box(page.locator("[data-showcase-status]"));
      const title = await box(page.locator("[data-showcase-title]"));
      expect(status.y).toBeLessThan(title.y);
      if (dir === "rtl") near(status.x + status.w, win.x + win.w - 17, "status inline start");
      else near(status.x, win.x + 17, "status inline start");

      for (let index = 0; index < 3; index += 1) {
        const row = await box(rows(page).nth(index));
        const image = await box(rows(page).nth(index).locator("[data-use-case-image]"));
        expect(row).toMatchObject({ x: 20, w: 350 });
        near(image.w, 316, `image ${index + 1} width`);
        near(image.h, 200, `image ${index + 1} height`);
      }
      if (locale === "ar") {
        near(win.h, 366, "window height");
        near((await box(page.locator("[data-showcase-header]"))).h, 114.8, "header height");
        near((await box(card)).h, 250, "transcript body height");
        near((await box(showcase(page))).h, 673, "showcase height");
        const heights = [502, 502, 475];
        for (let index = 0; index < 3; index += 1) {
          near((await box(rows(page).nth(index))).h, heights[index] ?? 0, `card ${index + 1}`);
        }
      }
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`${width}px: no horizontal overflow (page and illustration)`, async ({ page }) => {
        await open(page, path, width);
        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          const inside = [
            ...document.querySelectorAll("[data-showcase-window] *, [data-use-case] *"),
          ]
            .filter((e) => (e as HTMLElement).offsetParent !== null)
            .filter(
              (e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== "hidden",
            )
            .map((e) => e.className.toString().slice(0, 60));
          return { page: root.scrollWidth - root.clientWidth, inside };
        });
        expect(overflow.page).toBe(0);
        expect(overflow.inside).toEqual([]);
        // The window and the cards fit the viewport.
        const win = await box(appWindow(page));
        expect(win.x).toBeGreaterThanOrEqual(0);
        expect(win.x + win.w).toBeLessThanOrEqual(width);
      });
    }

    test("no layout shift from the Showcase at 1440, 768 and 390", async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as unknown as { showcaseShift: number };
        w.showcaseShift = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            value: number;
            sources?: { node?: Node | null }[];
          }[]) {
            const inShowcase = entry.sources?.some((s) =>
              s.node instanceof Element ? s.node.closest("section#showcase") !== null : false,
            );
            if (inShowcase) w.showcaseShift += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await showcase(page).scrollIntoViewIfNeeded();
        await page.waitForLoadState("networkidle");
        expect(
          await page.evaluate(() => (window as unknown as { showcaseShift: number }).showcaseShift),
          `layout shift at ${width}`,
        ).toBe(0);
      }
    });

    test("reduced motion: nothing animates in either section", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await open(page, path, 1440);
      const running = await page.evaluate(
        () =>
          ["#showcase", "#use-cases"].flatMap(
            (id) => document.querySelector(id)?.getAnimations({ subtree: true }) ?? [],
          ).length,
      );
      expect(running).toBe(0);
    });

    for (const width of [390, 768, 1440]) {
      test(`axe ${width}px (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, path, width);
        const results = await new AxeBuilder({ page })
          .include("#showcase")
          .include("#use-cases")
          .withTags(WCAG_TAGS)
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}
