import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/*
 * Phase 07 Increment 6, A3: page-level accessibility checks (automated; not a screen-reader test).
 * Complements the per-section axe and keyboard specs:
 * - axe (WCAG 2.2 AA tags) on the whole page at all six widths, ar and en (English is a development
 *   preview, gated in production);
 * - one end-to-end keyboard pass: every Tab stop is reachable, shows a visible focus indicator and
 *   is on screen; the order is recorded;
 * - the heading outline: one h1, no skipped levels.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const WIDTHS = [1440, 1280, 1024, 768, 390, 320] as const;
const LOCALES = [
  { name: "ar", path: "/" },
  { name: "en", path: "/en" },
] as const;

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

for (const locale of LOCALES) {
  test.describe(`Landing page-level accessibility (${locale.name})`, () => {
    test.use({ reducedMotion: "reduce" });

    for (const width of WIDTHS) {
      test(`axe ${width}px: whole page, WCAG 2.2 AA`, async ({ page }) => {
        await open(page, locale.path, width);
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      });
    }

    test("heading outline: one h1, no skipped levels", async ({ page }) => {
      await open(page, locale.path, 1440);
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
          .filter((h) => (h as HTMLElement).offsetParent !== null || h.getClientRects().length)
          .map((h) => Number(h.tagName.slice(1))),
      );
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(levels[0]).toBe(1);
      for (let index = 1; index < levels.length; index += 1) {
        const step = (levels[index] ?? 0) - (levels[index - 1] ?? 0);
        expect(
          step,
          `heading ${index}: h${levels[index - 1]} → h${levels[index]}`,
        ).toBeLessThanOrEqual(1);
      }
    });

    for (const width of [1440, 390] as const) {
      test(`keyboard ${width}px: every Tab stop is visible and shows a focus indicator`, async ({
        page,
      }) => {
        test.setTimeout(90_000);
        await open(page, locale.path, width);
        await waitForHydration(page, page.locator("a").first());
        const stops: string[] = [];
        for (let index = 0; index < 80; index += 1) {
          await page.keyboard.press("Tab");
          const state = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return {
              label: `${el.tagName.toLowerCase()}:${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 24)}`,
              indicator:
                (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) ||
                s.boxShadow !== "none",
              onScreen: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight,
              inFooter: el.closest("footer") !== null,
            };
          });
          if (state === null) break;
          if (stops.includes(state.label) && state.inFooter) break;
          stops.push(state.label);
          expect(state.indicator, `focus indicator on ${state.label}`).toBe(true);
          expect(state.onScreen, `${state.label} scrolled into view`).toBe(true);
        }
        // The skip link comes first; the page has a meaningful number of stops.
        expect(stops[0]).toMatch(/^a:/);
        expect(stops.length).toBeGreaterThan(8);
      });
    }
  });
}
