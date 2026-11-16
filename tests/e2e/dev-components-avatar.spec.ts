import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Avatar V1 browser checks on the temporary /dev/components gallery (contract
 * docs/phases/phase-03-avatar-contract.md §6, §9). Rendered values per size, initials per locale
 * (ZWNJ, Latin upper-case), **rendered contrast measured on the actual pixels** of the gradient
 * (screenshot with the initials hidden, minimum ratio of white over the whole circle interior),
 * image / broken image / placeholder, accessibility, no motion, and 1440 / 768 / 390 / 320.
 */

const ZWNJ = String.fromCharCode(0x200c);
const LOCALES = [
  {
    path: "/dev/components",
    dir: "rtl",
    one: "أ",
    two: `أ${ZWNJ}م`,
    broken: `س${ZWNJ}ع`,
    name: "أحمد محمود",
  },
  {
    path: "/en/dev/components",
    dir: "ltr",
    one: "A",
    two: `A${ZWNJ}M`,
    broken: `S${ZWNJ}A`,
    name: "Ahmed Mahmoud",
  },
] as const;
const VIEWPORTS = [1440, 768, 390, 320] as const;

const avatar = (page: Page, id: string) =>
  page.getByTestId(`avatar-${id}`).locator(":scope > span:first-child");

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-avatar").locator(":scope span"));
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-testid="gallery-avatar"] img')].every(
      (img) => (img as HTMLImageElement).complete,
    ),
  );
}

function expectOnBlack(actual: number[], rgb: [number, number, number], alpha: number): void {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha)).toBeLessThanOrEqual(1.5);
  });
}

/** Composited color of a computed CSS color over black (Chromium paints it). */
async function onBlack(locator: Locator, property: "borderTopColor" | "backgroundColor") {
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

/**
 * Minimum contrast of white against every rendered pixel of the circle interior (inside the
 * border), from a real screenshot of the avatar with its initials made transparent.
 */
async function renderedMinContrast(page: Page, root: Locator): Promise<number> {
  await root.locator(":scope > span").evaluate((el) => {
    (el as HTMLElement).style.color = "transparent";
  });
  const png = (await root.screenshot({ animations: "disabled", scale: "css" })).toString("base64");
  const border = await root.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
  return page.evaluate(
    async ({ data, borderWidth }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return 0;
      ctx.drawImage(img, 0, 0);
      const { data: px, width, height } = ctx.getImageData(0, 0, img.width, img.height);
      const lin = (v: number) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const cx = width / 2;
      const cy = height / 2;
      const inner = width / 2 - borderWidth - 1.5; // skip the border and its anti-aliasing
      let min = Infinity;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > inner) continue;
          const i = (y * width + x) * 4;
          const l =
            0.2126 * lin(px[i] ?? 0) + 0.7152 * lin(px[i + 1] ?? 0) + 0.0722 * lin(px[i + 2] ?? 0);
          min = Math.min(min, 1.05 / (l + 0.05));
        }
      }
      return min;
    },
    { data: png, borderWidth: border },
  );
}

for (const locale of LOCALES) {
  test.describe(`Avatar gallery ${locale.path}`, () => {
    test("rendered values: sizes, borders, gradient, initials", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      for (const [id, size, border, alpha, text, fontSize] of [
        ["initials-40", 40, "1px", 0.4, locale.one, "16px"],
        ["initials-96", 96, "2px", 0.5, locale.two, "28px"],
      ] as const) {
        const root = avatar(page, id);
        const m = await root.evaluate((el) => {
          const s = getComputedStyle(el);
          const initials = el.querySelector(":scope > span");
          const t = initials ? getComputedStyle(initials) : null;
          const box = el.getBoundingClientRect();
          return {
            w: box.width,
            h: box.height,
            border: s.borderTopWidth,
            radius: parseFloat(s.borderTopLeftRadius),
            image: s.backgroundImage,
            text: initials?.textContent,
            dir: initials?.getAttribute("dir"),
            color: t?.color,
            fontSize: t?.fontSize,
            transition: s.transitionDuration,
          };
        });
        expect(m.w, id).toBe(size);
        expect(m.h, id).toBe(size);
        expect(m.border, id).toBe(border);
        expect(m.radius, id).toBeGreaterThanOrEqual(size / 2);
        expect(m.image, id).toMatch(/linear-gradient\(135deg, .+ -80%, .+ 71%\)/);
        expectOnBlack(await onBlack(root, "borderTopColor"), [99, 161, 255], alpha);
        expect(m.text, id).toBe(text);
        expect(m.dir, id).toBe("auto");
        expect(m.color, id).toBe("rgb(255, 255, 255)");
        expect(m.fontSize, id).toBe(fontSize);
        expect(m.transition, id).toBe("0s"); // static: no motion
      }
    });

    test("rendered contrast: white initials ≥ 5:1 on every pixel of the gradient", async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      for (const id of ["initials-40", "initials-96"]) {
        const min = await renderedMinContrast(page, avatar(page, id));
        testInfo.annotations.push({ type: `min contrast ${id}`, description: min.toFixed(2) });
        expect(min, id).toBeGreaterThanOrEqual(5);
      }
    });

    test("image, broken image and placeholder", async ({ page }) => {
      await load(page, locale.path);
      for (const id of ["image-40", "image-96"]) {
        const img = avatar(page, id).locator("img");
        await expect(img).toBeVisible();
        const m = await img.evaluate((el) => ({
          natural: (el as HTMLImageElement).naturalWidth,
          fit: getComputedStyle(el).objectFit,
          alt: el.getAttribute("alt"),
          w: el.getBoundingClientRect().width,
        }));
        expect(m.natural).toBeGreaterThan(0);
        expect(m.fit).toBe("cover");
        expect(m.alt).toBe("");
        expect(m.w).toBe(id === "image-40" ? 38 : 92); // inside the 1px / 2px border
      }
      const broken = avatar(page, "broken-96");
      await expect(broken.locator("img")).toHaveCount(0);
      await expect(broken.locator(":scope > span")).toHaveText(locale.broken);

      for (const [id, icon] of [
        ["placeholder-40", 18],
        ["placeholder-96", 44],
      ] as const) {
        const root = avatar(page, id);
        expectOnBlack(await onBlack(root, "backgroundColor"), [27, 28, 30], 1);
        const svg = root.locator('[data-icon="user"]');
        expect((await svg.boundingBox())?.width).toBe(icon);
        await expect(root).toHaveAttribute("aria-hidden", "true");
      }
    });

    test("accessibility: named once when meaningful, hidden when decorative; axe", async ({
      page,
    }) => {
      await load(page, locale.path);
      const section = page.getByTestId("gallery-avatar");
      await expect(section.getByRole("img", { name: locale.name })).toHaveCount(4);
      await expect(section.locator("[tabindex]")).toHaveCount(0);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .include('[data-testid="gallery-avatar"]')
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
      ).toEqual([]);
    });

    test("reduced motion: still no transition or animation", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await load(page, locale.path);
      const counts = await page
        .getByTestId("gallery-avatar")
        .locator(":scope [data-testid^='avatar-'] > span:first-child")
        .evaluateAll((els) => els.map((el) => el.getAnimations().length));
      expect(counts.every((n) => n === 0)).toBe(true);
    });

    for (const width of VIEWPORTS) {
      test(`${width}px: fixed sizes, no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await load(page, locale.path);
        const boxes = await page
          .getByTestId("gallery-avatar")
          .locator(":scope [data-testid^='avatar-'] > span:first-child")
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
        expect(boxes).toHaveLength(7);
        for (const box of boxes) {
          expect([40, 96]).toContain(box.width);
          expect(box.height).toBe(box.width);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }
  });
}
