import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test, type Page } from "@playwright/test";

/**
 * G-1: the temporary /dev/tokens route shows every Phase 02 foundation. Rendered values are
 * compared with the Design System Reference read independently (not with the page's own data).
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const reference = readFileSync(
  join(root, "docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md"),
  "utf8",
);

const referenceColors = [
  ...reference.matchAll(/^\|\s*([A-Za-z]+ \/ [A-Za-z ]+?)\s*\|\s*(#[0-9a-fA-F]{6})\s*\|/gm),
].map(([, name = "", hex = ""]) => ({ name, hex: hex.toLowerCase() }));

const typeSection = reference.slice(reference.indexOf("### 2.1"), reference.indexOf("### 2.2"));
const referenceType = [
  ...typeSection.matchAll(
    /^\|\s*([A-Za-z ]+?)\s*\|\s*(Cairo|Inter|Geist Mono)\s*\|\s*[A-Za-z]+ (\d{3})\s*\|\s*(\d+) \/ (\d+)\s*\|/gm,
  ),
].map(([, name = "", family = "", weight = "", size = "", lh = ""]) => ({
  key: name.toLowerCase().split(" ").join("-"),
  family,
  weight,
  size: `${size}px`,
  lineHeight: `${lh}px`,
}));

async function platformFamilies(page: Page, selector: string): Promise<string> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root: doc } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.nodeId, selector });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts.map((f) => f.familyName).join(" | ");
}

for (const path of ["/dev/tokens", "/en/dev/tokens"]) {
  test.describe(`dev tokens page ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("shows the 19 reference colors with exact HEX, rendered by their CSS variable", async ({
      page,
    }) => {
      expect(referenceColors).toHaveLength(19);
      const swatches = await page.locator('[data-testid^="swatch-"]').evaluateAll((items) =>
        items.map((item) => {
          const rgb = getComputedStyle(item.querySelector("[data-swatch]") as HTMLElement)
            .backgroundColor.match(/\d+/g)
            ?.slice(0, 3)
            .map((n) => Number(n).toString(16).padStart(2, "0"))
            .join("");
          return {
            hex: item.getAttribute("data-hex"),
            rendered: `#${rgb}`,
            text: item.textContent,
          };
        }),
      );
      expect(swatches).toHaveLength(19);
      for (const { name, hex } of referenceColors) {
        const swatch = swatches.find((s) => s.hex === hex && s.text?.includes(name));
        expect(swatch, `${name} ${hex}`).toBeDefined();
        expect(swatch?.rendered, `${name} rendered color`).toBe(hex);
      }
    });

    test("shows spacing 4/12/16/20/32, radius 8/12/16/20/24, page padding and motion", async ({
      page,
    }) => {
      const bars = await page
        .locator('[data-testid^="spacing-"] [data-bar]')
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)));
      expect(bars).toEqual([4, 12, 16, 20, 32]);
      const radii = await page
        .locator('[data-testid^="radius-"] [data-box]')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).borderTopLeftRadius));
      expect(radii).toEqual(["8px", "12px", "16px", "20px", "24px"]);
      await expect(page.getByTestId("dev-spacing-radius")).toContainText(
        "--page-padding-desktop: 24px · --page-padding-tablet: 24px · --page-padding-mobile: 20px",
      );
      const motion = await page.locator('[data-testid^="motion-"]').allTextContents();
      expect(motion).toEqual([
        "--transition-duration-fast: 120ms",
        "--transition-duration-base: 200ms",
        "--transition-duration-slow: 320ms",
        "--transition-duration-flip: 400ms",
        "--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)",
      ]);
    });

    test("shows the 11 Dashboard styles with the reference size, line height and weight", async ({
      page,
    }) => {
      expect(referenceType).toHaveLength(11);
      for (const style of referenceType) {
        const sample = page.getByTestId(`type-${style.key}`).locator("[data-sample]");
        const computed = await sample.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { size: cs.fontSize, lineHeight: cs.lineHeight, weight: cs.fontWeight };
        });
        expect(computed, `Dashboard/${style.key}`).toEqual({
          size: style.size,
          lineHeight: style.lineHeight,
          weight: style.weight,
        });
      }
    });

    test("font samples render in Cairo, Inter and Geist Mono", async ({ page }) => {
      await page.evaluate(() => document.fonts.ready);
      for (const [testId, family] of [
        ["font-cairo", /cairo/i],
        ["font-inter", /inter/i],
        ["font-geist-mono", /geist mono/i],
      ] as const) {
        await expect
          .poll(() => platformFamilies(page, `[data-testid="${testId}"]`), { timeout: 15_000 })
          .toMatch(family);
        expect(await platformFamilies(page, `[data-testid="${testId}"]`)).not.toMatch(
          /arial|segoe|tahoma|times/i,
        );
      }
    });

    test("keeps the logo (3 variants × 2 directions) and icon (40 × 2) sections", async ({
      page,
    }) => {
      await expect(page.locator("img[data-logo]")).toHaveCount(6);
      await expect(page.locator('[data-testid^="icon-rtl-"] svg')).toHaveCount(40);
      await expect(page.locator('[data-testid^="icon-ltr-"] svg')).toHaveCount(40);
    });
  });
}
