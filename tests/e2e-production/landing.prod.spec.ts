import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "../e2e/test";
import arCommon from "../../src/i18n/messages/ar/common.json" with { type: "json" };
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };

/*
 * Production smoke suite for the Landing (Phase 07 Increment 6, owner-approved 2026-11-22).
 * Runs only through playwright.production.config.ts, against `next start` of a build made with
 * `NEXT_PUBLIC_APP_ENV=production`. Production gates under test:
 * - Authentication (P07-D24): no login or register entry point, no Final CTA;
 * - Pricing (P07-D4): not rendered;
 * - English (P07-D1): `/en` is 404 and there is no language link.
 * The shared fixture fails a test on any console error, page error or hydration warning.
 */

const WIDTHS = [
  { width: 1440, height: 900, bar: "desktop" },
  { width: 768, height: 1024, bar: "compact" },
  { width: 390, height: 844, bar: "compact" },
] as const;

/** Any link to an Authentication route, in either locale. */
const AUTH_LINK =
  'a[href$="/login"], a[href$="/register"], a[href$="/forgot-password"], a[href$="/reset-password"]';

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

// Status checks use HTTP requests, not a page: a browser logs every 404 document as a console
// error, which the shared console guard (rightly) fails on page tests.
test.describe("production configuration", () => {
  test("this server is a production build: development-only routes return 404", async ({
    request,
  }) => {
    // /dev/* pages call notFound() in production builds only.
    expect((await request.get("/dev/tokens")).status()).toBe(404);
  });

  test("English Landing stays gated: /en is 404", async ({ request }) => {
    expect((await request.get("/en")).status()).toBe(404);
  });
});

for (const { width, height, bar } of WIDTHS) {
  test.describe(`production Landing · ${width}px`, () => {
    test.use({ reducedMotion: "reduce" });

    test("Arabic RTL metadata", async ({ page }) => {
      await open(page, width, height);
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page).toHaveTitle(arCommon.brand.name);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        arLanding.hero.description,
      );
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        "content",
        arLanding.hero.description,
      );
    });

    test("no Login or Register link anywhere; no Final CTA, Pricing or language link", async ({
      page,
    }) => {
      await open(page, width, height);
      // In the DOM at all, visible or hidden by CSS.
      await expect(page.locator(AUTH_LINK)).toHaveCount(0);
      await expect(page.locator("[data-landing-action=login]")).toHaveCount(0);
      await expect(page.locator("[data-landing-hero-cta=primary]")).toHaveCount(0);
      await expect(page.locator("[data-landing-footer-column=account]")).toHaveCount(0);
      await expect(page.locator('[data-landing-section="cta"]')).toHaveCount(0);
      await expect(page.locator('[data-landing-section="pricing"]')).toHaveCount(0);
      await expect(page.locator('a[href="/en"], a[href^="/en/"]')).toHaveCount(0);
      // The approved sections remain, in order.
      expect(
        await page
          .locator("main > section")
          .evaluateAll((els) => els.map((el) => el.getAttribute("data-landing-section"))),
      ).toEqual(["hero", "showcase", "features", "howItWorks", "useCases", "faq"]);
    });

    test("Hero secondary CTA scrolls to How it works", async ({ page }) => {
      await open(page, width, height);
      const secondary = page.locator("[data-landing-hero-cta=secondary]");
      await expect(secondary).toBeVisible();
      await expect(secondary).toHaveText(arLanding.hero.ctaSecondary);
      await secondary.click();
      await expect(page).toHaveURL(/#how-it-works$/);
      await expect(page.locator("#how-it-works")).toBeInViewport();
    });

    test("navigation works and holds no Login link", async ({ page }) => {
      await open(page, width, height);
      const navBar = page.locator(`[data-landing-bar=${bar}]`);
      await expect(navBar).toBeVisible();
      if (bar === "desktop") {
        const faq = navBar.locator('a[href="#faq"]');
        await expect(faq).toBeVisible();
        await faq.click();
      } else {
        const button = page.getByRole("button", { name: arShell.openMenu });
        await waitForHydration(page, button);
        await button.click();
        const menu = page.locator("[data-landing-menu]");
        await expect(menu).toBeVisible();
        await expect(menu.locator("a[href^='#']")).toHaveCount(4);
        await expect(menu.locator(AUTH_LINK)).toHaveCount(0);
        // Esc closes the sheet; a section link closes it and navigates.
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await button.click();
        await menu.locator('a[href="#faq"]').click();
        await expect(menu).toBeHidden();
      }
      await expect(page).toHaveURL(/#faq$/);
      await expect(page.locator("#faq")).toBeInViewport();
    });

    test("no horizontal overflow", async ({ page }) => {
      await open(page, width, height);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  });
}
