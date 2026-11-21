import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Phase 07 Increment 6, A1: Landing visual baselines (full page and every section).
 *
 * Capture environment (recorded in docs/phases/phase-07-qa-report.md):
 * - Build: `next dev` (the E2E web server), development gates: the static Hero image, the Pricing
 *   development preview and the English preview are visible. **These baselines are not a
 *   production rendering** and do not approve any development-only feature.
 * - Browser: Playwright bundled Chromium; per-platform baselines (`-chromium-win32` from Windows,
 *   `-chromium-linux` from the CI runner), as for `visual.spec.ts`.
 * - Viewports 1440×900, 768×1024, 390×844; deviceScaleFactor 1; reduced motion (reveals settled,
 *   nothing animating); all images loaded; the Next.js dev overlay hidden.
 * Baselines must be reviewed and approved by the owner, never auto-accepted (Roadmap §8).
 */

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
] as const;

const LOCALES = [
  { name: "ar", path: "/", dir: "rtl" },
  { name: "en", path: "/en", dir: "ltr" },
] as const;

/** Page parts in reading order: the header, the eight sections, the footer. */
const PARTS = [
  { name: "01-header", selector: "[data-landing-bar] >> visible=true" },
  { name: "02-hero", selector: '[data-landing-section="hero"]' },
  { name: "03-showcase", selector: '[data-landing-section="showcase"]' },
  { name: "04-features", selector: '[data-landing-section="features"]' },
  { name: "05-how-it-works", selector: '[data-landing-section="howItWorks"]' },
  { name: "06-use-cases", selector: '[data-landing-section="useCases"]' },
  { name: "07-faq", selector: '[data-landing-section="faq"]' },
  { name: "08-pricing-dev-preview", selector: '[data-landing-section="pricing"]' },
  { name: "09-final-cta", selector: '[data-landing-section="cta"]' },
  { name: "10-footer", selector: "footer" },
] as const;

const SHOT = {
  animations: "disabled",
  caret: "hide",
  scale: "css",
  // Tolerates sub-pixel anti-aliasing noise only (0.1% of pixels), as visual.spec.ts.
  maxDiffPixelRatio: 0.001,
  timeout: 20_000,
} as const;

/** Lazy images below the fold load only when scrolled to: load them all before capturing. */
async function loadAllImages(page: Page): Promise<void> {
  // Every image must be hydrated before `loading` changes, or React reports a mismatch (#3).
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

test.use({ deviceScaleFactor: 1, reducedMotion: "reduce" });

for (const locale of LOCALES) {
  for (const viewport of VIEWPORTS) {
    test(`landing · ${locale.name} · ${viewport.name}px · full page and sections`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(locale.path);
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      await page.evaluate(() => document.fonts.ready);
      await loadAllImages(page);

      expect(await page.evaluate(() => document.documentElement.dir)).toBe(locale.dir);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);

      await expect(page).toHaveScreenshot(`landing-${locale.name}-${viewport.name}-00-full.png`, {
        ...SHOT,
        fullPage: true,
      });
      for (const part of PARTS) {
        const target = page.locator(part.selector).first();
        await expect(target).toBeVisible();
        await expect(target).toHaveScreenshot(
          `landing-${locale.name}-${viewport.name}-${part.name}.png`,
          SHOT,
        );
      }
    });
  }
}
