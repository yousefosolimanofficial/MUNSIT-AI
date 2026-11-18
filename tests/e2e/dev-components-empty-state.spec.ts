import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Phase 06 EmptyState (Mariam delivery v1) — gallery integration on /dev/components
 * (assignment docs/phases/phase-06-empty-state-starter.md §9.4). Computed values are compared
 * with design-values §15.3 (Figma `Shared / Empty State` `2389:4037` for `default`, Dashboard
 * First-Time `2482:2130` for `compact`); colours are composited over black on a canvas.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "" },
  { locale: "en", dir: "ltr", prefix: "/en" },
] as const;
const WIDTHS = [320, 390, 768, 1440] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const SKY: [number, number, number] = [99, 161, 255];
const OBSIDIAN: [number, number, number] = [17, 18, 20];

const section = (page: Page) => page.getByTestId("gallery-empty-state");
const box = (page: Page, id: "default" | "compact" | "minimal") =>
  page.getByTestId(`empty-${id}`).locator(":scope > div");

async function openGallery(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/components`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, section(page).getByRole("button").first());
}

/** A colour property composited over black (the element's own colour only). */
async function onBlack(locator: Locator, property: "backgroundColor" | "borderTopColor" | "color") {
  return locator.evaluate((el, prop) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(el)[prop];
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, property);
}

function expectTint(actual: number[], rgb: [number, number, number], alpha: number, label: string) {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha), label).toBeLessThanOrEqual(1.5);
  });
}

/** WCAG contrast of the element's text over all its ancestors' backgrounds, on the page. */
async function renderedContrast(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    const chain: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node);
    for (const node of chain) {
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
    }
    const bg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const fg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    const lin = (c: number) => {
      const v = c / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r = 0, g = 0, b = 0]: number[]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const [hi = 0, lo = 0] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
}

async function geometry(target: Locator) {
  return target.evaluate((el) => {
    const s = getComputedStyle(el);
    const tile = el.firstElementChild as HTMLElement;
    const t = getComputedStyle(tile);
    const svg = tile.querySelector("svg");
    return {
      padding: [s.paddingTop, s.paddingInlineEnd, s.paddingBottom, s.paddingInlineStart],
      radius: s.borderTopLeftRadius,
      border: s.borderTopWidth,
      gap: s.rowGap,
      tile: [tile.getBoundingClientRect().width, tile.getBoundingClientRect().height],
      tileRadius: t.borderTopLeftRadius,
      icon: svg ? svg.getBoundingClientRect().width : 0,
      iconTransform: svg ? getComputedStyle(svg).transform : "",
    };
  });
}

for (const { locale, dir, prefix } of LOCALES) {
  test.describe(`EmptyState gallery (${locale})`, () => {
    test("Figma values: default (2389:4037) and compact (2482:2130)", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      expect(await page.evaluate(() => document.dir)).toBe(dir);

      expect(await geometry(box(page, "default"))).toEqual({
        padding: ["56px", "40px", "56px", "40px"],
        radius: "24px",
        border: "1px",
        gap: "16px",
        tile: [64, 64],
        tileRadius: "18px",
        icon: 28,
        iconTransform: "none",
      });
      expect(await geometry(box(page, "compact"))).toEqual({
        padding: ["48px", "32px", "48px", "32px"],
        radius: "20px",
        border: "1px",
        gap: "16px",
        tile: [72, 72],
        tileRadius: "20px",
        icon: 32,
        iconTransform: "none",
      });

      for (const [id, borderAlpha, tileBorderAlpha] of [
        ["default", 0.12, 0.25],
        ["compact", 0.14, 0.4],
      ] as const) {
        const target = box(page, id);
        const tile = target.locator(":scope > div").first();
        expectTint(await onBlack(target, "backgroundColor"), OBSIDIAN, 0.88, `${id} fill`);
        expectTint(await onBlack(target, "borderTopColor"), SKY, borderAlpha, `${id} border`);
        expectTint(await onBlack(tile, "backgroundColor"), SKY, 0.12, `${id} tile fill`);
        expectTint(
          await onBlack(tile, "borderTopColor"),
          SKY,
          tileBorderAlpha,
          `${id} tile border`,
        );
        expect(await onBlack(tile, "color")).toEqual(SKY);
      }

      const type = await box(page, "compact").evaluate((el) => {
        const pick = (node: Element | null) => {
          if (!node) return null;
          const s = getComputedStyle(node);
          return [s.fontSize, s.lineHeight, s.fontWeight, s.textAlign];
        };
        return {
          title: pick(el.querySelector("h3")),
          description: pick(el.querySelector("p")),
          footnote: pick(el.querySelector("p:last-child")),
        };
      });
      expect(type).toEqual({
        title: ["28px", "40px", "700", "center"],
        description: ["14px", "22px", "400", "center"],
        footnote: ["12px", "18px", "400", "center"],
      });
      const heading = box(page, "compact").locator("h3");
      expect(await onBlack(heading, "color")).toEqual([255, 255, 255]);
      expect(await onBlack(box(page, "compact").locator("p").first(), "color")).toEqual([
        156, 156, 157,
      ]);
    });

    test("semantics: h3 titles, decorative icons, optional parts, no role or tab stop on the box", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await expect(section(page).getByRole("heading", { level: 3 })).toHaveCount(3);
      await expect(section(page).getByRole("heading", { level: 2 })).toHaveCount(1); // gallery h2
      for (const id of ["default", "compact", "minimal"] as const) {
        const target = box(page, id);
        await expect(target.locator("svg")).toHaveAttribute("aria-hidden", "true");
        expect(await target.getAttribute("role")).toBeNull();
        expect(await target.getAttribute("tabindex")).toBeNull();
      }
      // Optional parts: minimal renders only the tile and the title.
      expect(
        await box(page, "minimal").evaluate((el) => [...el.children].map((c) => c.tagName)),
      ).toEqual(["DIV", "H3"]);
      await expect(box(page, "default").locator("p")).toHaveCount(1);
      await expect(box(page, "compact").locator("p")).toHaveCount(2);
      await expect(box(page, "compact").getByRole("button")).toHaveCount(2);
    });

    test("keyboard: Tab reaches only the actions, in order, with the D-B2 ring; Enter and Space activate", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      const buttons = section(page).getByRole("button");
      await expect(buttons).toHaveCount(3);
      await buttons.nth(0).focus();
      await expect(buttons.nth(0)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(buttons.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(buttons.nth(2)).toBeFocused();
      const ring = await buttons.nth(2).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.outlineStyle, s.outlineWidth, s.outlineOffset];
      });
      expect(ring).toEqual(["solid", "2px", "2px"]);
      // The actions keep their own keyboard behaviour (native buttons): Enter and Space click.
      await buttons.nth(1).evaluate((el) => {
        const w = window as { __clicks?: number };
        w.__clicks = 0;
        el.addEventListener("click", () => {
          w.__clicks = (w.__clicks ?? 0) + 1;
        });
      });
      await buttons.nth(1).focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press(" ");
      expect(await page.evaluate(() => (window as { __clicks?: number }).__clicks)).toBe(2);
    });

    for (const width of WIDTHS) {
      test(`${width}px: no overflow; content inside each box; boxes fill the gallery`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await openGallery(page, prefix);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
        for (const id of ["default", "compact", "minimal"] as const) {
          const fits = await box(page, id).evaluate((el) => {
            const b = el.getBoundingClientRect();
            const parent = (el.parentElement as HTMLElement).getBoundingClientRect();
            const inside = [...el.querySelectorAll("*")].every((child) => {
              const r = child.getBoundingClientRect();
              return r.left >= b.left - 0.5 && r.right <= b.right + 0.5;
            });
            return { inside, fills: Math.abs(b.width - parent.width) < 1 };
          });
          expect(fits, id).toEqual({ inside: true, fills: true });
        }
      });
    }

    test("rendered contrast and axe (WCAG 2.2 AA, contrast on)", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await openGallery(page, prefix);
      const compact = box(page, "compact");
      expect(await renderedContrast(compact.locator("h3"))).toBeGreaterThanOrEqual(4.5);
      expect(await renderedContrast(compact.locator("p").first())).toBeGreaterThanOrEqual(4.5);
      expect(await renderedContrast(compact.locator("p").last())).toBeGreaterThanOrEqual(4.5);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include('[data-testid="gallery-empty-state"]')
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });
}
