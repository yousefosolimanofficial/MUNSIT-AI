import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Official icon system (Phase 02 step 5) on the temporary /dev/tokens route.
 *
 * Visual reference: tests/e2e/fixtures/figma-icons/*.png — Figma renders of the icon components
 * (24 px, stroke #9C9C9D on the Figma frame background) and of Figma placements at 20 / 22 / 18 px,
 * cropped from Figma screenshots (2026-11-13). Each icon is rendered at the same pixel size, in
 * Text / Secondary (#9c9c9d = the Figma stroke color), on the fixture's own background color,
 * and compared pixel by pixel.
 */

const ICONS = [
  "home",
  "book",
  "fileText",
  "help",
  "note",
  "star",
  "folder",
  "search",
  "bell",
  "moon",
  "chevDown",
  "upload",
  "cloudUpload",
  "play",
  "check",
  "clock",
  "target",
  "message",
  "download",
  "sparkles",
  "alert",
  "crown",
  "menu",
  "x",
  "user",
  "settings",
  "logout",
  "more",
  "trending",
  "network",
  "box",
  "sigma",
  "cpu",
  "checkSquare",
  "mic",
  "file",
  "arrowLeft",
  "lightbulb",
  "cards",
  "slides",
] as const;

const fixture = (name: string): string =>
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "fixtures", "figma-icons", `${name}.png`),
  ).toString("base64");

/**
 * Mean absolute RGB difference (0–255) allowed between our render and the Figma render.
 * Measured 2026-11-13: 0.1–3.9 for 39 icons, 6.36 for `target` (three concentric circles = the
 * most anti-aliased edges; visually identical when magnified). Differences come from the two
 * rasterizers' anti-aliasing only. Identification tests below make the check meaningful: each
 * icon must also be clearly closest to its own reference among all 40.
 */
const MAX_DIFF = 8;

/** Captures the icon on the fixture's background color (PNG, base64). */
async function capture(page: Page, cell: Locator, fixtureName: string): Promise<string> {
  const bg = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const c = new OffscreenCanvas(img.width, img.height).getContext("2d");
    if (!c) throw new Error("no 2d context");
    c.drawImage(img, 0, 0);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  }, fixture(fixtureName));
  await cell.evaluate((el, color) => {
    (el as HTMLElement).style.background = color;
  }, bg);
  const svg = cell.locator("svg");
  await svg.evaluate((el) => el.scrollIntoView({ block: "center" }));
  return (await svg.screenshot()).toString("base64");
}

/** Mean RGB difference of every shot against every reference (rows = shots). */
async function diffMatrix(page: Page, shots: string[], refs: string[]): Promise<number[][]> {
  return page.evaluate(
    async ([a, b]) => {
      const load = async (data: string): Promise<ImageData> => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const c = new OffscreenCanvas(img.width, img.height).getContext("2d");
        if (!c) throw new Error("no 2d context");
        c.drawImage(img, 0, 0);
        return c.getImageData(0, 0, img.width, img.height);
      };
      const [xs, ys] = await Promise.all([Promise.all(a.map(load)), Promise.all(b.map(load))]);
      return xs.map((x) =>
        ys.map((y) => {
          if (x.width !== y.width || x.height !== y.height) return 255;
          let sum = 0;
          for (let i = 0; i < x.data.length; i += 4) {
            for (let ch = 0; ch < 3; ch++)
              sum += Math.abs((x.data[i + ch] ?? 0) - (y.data[i + ch] ?? 0));
          }
          return sum / (x.width * x.height * 3);
        }),
      );
    },
    [shots, refs] as const,
  );
}

/**
 * Renders the element on the fixture's background color, captures it and compares it with the
 * Figma fixture. Returns the mean RGB difference directly and against the mirrored fixture.
 */
async function compareWithFigma(
  page: Page,
  cell: Locator,
  fixtureName: string,
): Promise<{ direct: number; mirrored: number }> {
  const ref = fixture(fixtureName);
  const bg = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const c = new OffscreenCanvas(img.width, img.height).getContext("2d");
    if (!c) throw new Error("no 2d context");
    c.drawImage(img, 0, 0);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  }, ref);
  const svg = cell.locator("svg");
  await cell.evaluate((el, color) => {
    (el as HTMLElement).style.background = color;
  }, bg);
  await svg.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const shot = (await svg.screenshot()).toString("base64");

  return page.evaluate(
    async ([a, b]) => {
      const load = async (data: string): Promise<ImageData> => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const c = new OffscreenCanvas(img.width, img.height).getContext("2d");
        if (!c) throw new Error("no 2d context");
        c.drawImage(img, 0, 0);
        return c.getImageData(0, 0, img.width, img.height);
      };
      const [x, y] = await Promise.all([load(a), load(b)]);
      if (x.width !== y.width || x.height !== y.height) return { direct: 255, mirrored: 255 };
      let direct = 0;
      let mirrored = 0;
      for (let row = 0; row < x.height; row++) {
        for (let col = 0; col < x.width; col++) {
          const i = (row * x.width + col) * 4;
          const m = (row * x.width + (x.width - 1 - col)) * 4;
          for (let ch = 0; ch < 3; ch++) {
            direct += Math.abs((x.data[i + ch] ?? 0) - (y.data[i + ch] ?? 0));
            mirrored += Math.abs((x.data[i + ch] ?? 0) - (y.data[m + ch] ?? 0));
          }
        }
      }
      const n = x.width * x.height * 3;
      return { direct: direct / n, mirrored: mirrored / n };
    },
    [shot, ref] as const,
  );
}

test.describe("icons match Figma", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/tokens");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("all 40 icons match their Figma render and are identified as themselves", async ({
    page,
  }) => {
    const shots: string[] = [];
    for (const name of ICONS) {
      const cell = page.getByTestId(`icon-rtl-${name}`);
      await expect(cell.locator("svg")).toBeVisible();
      shots.push(await capture(page, cell, name));
    }
    const matrix = await diffMatrix(page, shots, ICONS.map(fixture));
    const report: Record<string, string> = {};
    ICONS.forEach((name, i) => {
      const row = matrix[i] ?? [];
      const own = row[i] ?? 255;
      const others = row.filter((_, j) => j !== i);
      const nearestOther = Math.min(...others);
      report[name] = `${own.toFixed(2)} (nearest other ${nearestOther.toFixed(2)})`;
      expect(own, `${name} vs its Figma render`).toBeLessThan(MAX_DIFF);
      expect(own * 2, `${name} must be clearly closest to its own reference`).toBeLessThan(
        nearestOther,
      );
    });
    test.info().annotations.push({ type: "icon-diffs", description: JSON.stringify(report) });
  });

  test("placement sizes 20 / 22 / 18 keep the Figma 1.75 stroke", async ({ page }) => {
    const samples = [
      "sidebar-home-20",
      "sidebar-active-home-20",
      "mobile-home-22",
      "mobile-active-home-22",
      "search-18",
    ];
    const report: Record<string, string> = {};
    for (const id of samples) {
      const cell = page.getByTestId(`icon-sample-${id}`);
      const ref = fixture(`sample-${id}`);
      const real = await capture(page, cell, `sample-${id}`);
      // Test-only control: the same icon with the stroke scaled by the viewBox (no
      // non-scaling-stroke) — what a plain SVG would draw. Figma keeps 1.75 instead.
      await cell
        .locator("svg *")
        .evaluateAll((els) => els.forEach((el) => el.removeAttribute("vector-effect")));
      const scaled = await capture(page, cell, `sample-${id}`);
      const matrix = await diffMatrix(page, [real, scaled], [ref]);
      const realDiff = matrix[0]?.[0] ?? 255;
      const scaledDiff = matrix[1]?.[0] ?? 255;
      report[id] = `1.75 stroke ${realDiff.toFixed(2)} · scaled stroke ${scaledDiff.toFixed(2)}`;
      expect(realDiff, id).toBeLessThan(MAX_DIFF);
      expect(realDiff, `${id}: Figma keeps the 1.75 stroke`).toBeLessThan(scaledDiff);
    }
    test.info().annotations.push({ type: "sample-diffs", description: JSON.stringify(report) });
  });
});

test.describe("direction behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/tokens");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("only arrowLeft flips, and only in LTR", async ({ page }) => {
    for (const dir of ["rtl", "ltr"] as const) {
      for (const name of ICONS) {
        const scale = await page
          .getByTestId(`icon-${dir}-${name}`)
          .locator("svg")
          .evaluate((el) => getComputedStyle(el).scale);
        const flipped = scale !== "none" && scale.trim().startsWith("-1");
        expect(flipped, `${dir}/${name} scale=${scale}`).toBe(
          dir === "ltr" && name === "arrowLeft",
        );
      }
    }
  });

  test("arrowLeft in LTR is the mirrored Figma drawing; logout and play are unchanged", async ({
    page,
  }) => {
    const ltrArrow = await compareWithFigma(
      page,
      page.getByTestId("icon-ltr-arrowLeft"),
      "arrowLeft",
    );
    expect(ltrArrow.mirrored).toBeLessThan(MAX_DIFF);
    expect(ltrArrow.direct).toBeGreaterThan(ltrArrow.mirrored * 3);

    for (const name of ["logout", "play"] as const) {
      for (const dir of ["rtl", "ltr"] as const) {
        const result = await compareWithFigma(page, page.getByTestId(`icon-${dir}-${name}`), name);
        expect(result.direct, `${dir}/${name}`).toBeLessThan(MAX_DIFF);
        expect(result.mirrored, `${dir}/${name} must not be mirrored`).toBeGreaterThan(
          result.direct * 3,
        );
      }
    }
  });
});

test.describe("accessibility", () => {
  test("decorative icons are hidden; a labelled icon has an accessible name", async ({ page }) => {
    await page.goto("/dev/tokens");
    const hidden = await page
      .locator('[data-testid^="icon-rtl-"] svg, [data-testid^="icon-ltr-"] svg')
      .evaluateAll((els) => els.every((el) => el.getAttribute("aria-hidden") === "true"));
    expect(hidden).toBe(true);
    await expect(page.getByRole("img", { name: "Notifications (dev sample)" })).toHaveCount(1);
    // Decorative icons are not exposed as images.
    await expect(page.getByRole("img", { name: /^(home|bell|arrowLeft)$/ })).toHaveCount(0);
  });
});

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow-320", width: 320, height: 700 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`icons @ ${viewport.name} ${viewport.width}px: all visible, no horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/dev/tokens");
    for (const dir of ["rtl", "ltr"] as const) {
      await expect(page.locator(`[data-testid^="icon-${dir}-"] svg`)).toHaveCount(40);
    }
    const sizes = await page
      .locator('[data-testid^="icon-rtl-"] svg')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(new Set(sizes)).toEqual(new Set([24]));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
