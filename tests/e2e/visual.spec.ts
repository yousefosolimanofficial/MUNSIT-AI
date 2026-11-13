import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * G-2: visual reference screenshots of the temporary /dev/tokens route (Roadmap Phase 02 tests).
 *
 * Baselines: tests/e2e/visual.spec.ts-snapshots/dev-tokens-<locale>-<width>-chromium-win32.png
 * Reproducibility (documented in docs/phases/phase-02-report.md):
 * - Browser: Playwright bundled Chromium (project "chromium", Playwright 1.65.0)
 * - OS: Windows 11 — the `win32` suffix is part of the file name; other OSes need their own
 *   baselines (font rasterization differs; not verified to be pixel-identical on Linux)
 * - Viewports 1440×900, 768×1024, 390×844; deviceScaleFactor 1; full-page capture
 * - Fonts: self-hosted (no network); waits for document.fonts.ready and all images
 * - Animations disabled, caret hidden, Next.js dev overlay hidden; deterministic DEV-ONLY data
 * Baselines must be reviewed and approved by the user — never auto-accepted (Roadmap §8).
 */

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
] as const;

const LOCALES = [
  { name: "ar", path: "/dev/tokens", dir: "rtl" },
  { name: "en", path: "/en/dev/tokens", dir: "ltr" },
] as const;

/**
 * Lazy images below the fold never load on their own; load them all before capturing. React
 * must have hydrated the images first, or changing `loading` is a hydration mismatch (#3).
 */
async function loadAllImages(page: Page): Promise<void> {
  await waitForHydration(page, page.locator("main img"));
  await page.evaluate(() =>
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
    }),
  );
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
}

test.use({ deviceScaleFactor: 1 });

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test(`dev tokens · ${locale.name} · ${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(locale.path);
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      await page.evaluate(() => document.fonts.ready);
      await loadAllImages(page);

      // Direction and overflow sanity before capturing.
      expect(await page.evaluate(() => document.documentElement.dir)).toBe(locale.dir);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);

      await expect(page).toHaveScreenshot(`dev-tokens-${locale.name}-${viewport.name}.png`, {
        fullPage: true,
        animations: "disabled",
        caret: "hide",
        scale: "css",
        // Tolerates sub-pixel anti-aliasing noise only (0.1% of pixels).
        maxDiffPixelRatio: 0.001,
        // Full-page captures (~4,300 px tall) need more than the 5 s default to settle when run
        // alongside the other parallel workers; the comparison itself is unchanged.
        timeout: 15_000,
      });
    });
  }
}

test("dev tokens · 320px · no horizontal overflow (ar and en)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const locale of LOCALES) {
    await page.goto(locale.path);
    await loadAllImages(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      locale.name,
    ).toBeLessThanOrEqual(0);
  }
});
