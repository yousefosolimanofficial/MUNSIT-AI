import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/*
 * Phase 07 Increment 6, A5: Landing smoke test in Playwright Chromium, Firefox and WebKit
 * (`*.cross-browser.spec.ts` runs in all three projects). This is browser-engine automation on
 * desktop emulation, not real Safari, Edge or device verification (R-3 stays a manual obligation).
 */

const SECTIONS = [
  "hero",
  "showcase",
  "features",
  "howItWorks",
  "useCases",
  "faq",
  "pricing",
  "cta",
] as const;

async function open(page: Page, width: number, path = "/") {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Landing smoke · cross-browser", () => {
  test.use({ reducedMotion: "reduce" });

  test("Desktop 1440: section order, navbar, Hero image, Showcase card, no overflow", async ({
    page,
  }) => {
    await open(page, 1440);
    const order = await page
      .locator("[data-landing-section]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-landing-section")));
    expect(order).toEqual([...SECTIONS]);
    const bar = page.locator("[data-landing-bar=desktop]");
    await expect(bar).toBeVisible();
    expect(Math.round((await bar.boundingBox())?.height ?? 0)).toBe(58);
    await expect(bar.getByRole("link")).toHaveCount(4 + 3); // 4 sections, login, language, logo
    const image = page.locator("img[data-landing-hero-image]");
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
    await expect(page.locator("video")).toHaveCount(0);
    const card = await page.locator("[data-showcase-window]").boundingBox();
    expect(Math.round(card?.width ?? 0)).toBe(760);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);
  });

  test("CTAs and section links: destinations and in-page navigation", async ({ page }) => {
    await open(page, 1440);
    await expect(page.locator("[data-landing-hero-cta=primary]")).toHaveAttribute(
      "href",
      "/register",
    );
    await expect(page.locator("[data-cta-action=primary]")).toHaveAttribute("href", "/register");
    await expect(
      page.locator("[data-landing-bar=desktop] [data-landing-action=login]"),
    ).toHaveAttribute("href", "/login");
    const featuresLink = page.locator("[data-landing-bar=desktop] nav a[href='#features']");
    await waitForHydration(page, featuresLink);
    await featuresLink.click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#features");
  });

  test("keyboard: the FAQ accordion opens and closes with Enter and Space", async ({ page }) => {
    await open(page, 1440);
    const triggers = page.locator("[data-faq-item] button");
    await waitForHydration(page, triggers.first());
    const second = triggers.nth(1);
    await second.focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press(" ");
    await expect(second).toHaveAttribute("aria-expanded", "false");
  });

  test("Mobile 390: compact bar, menu opens and closes, no overflow", async ({ page }) => {
    await open(page, 390);
    const bar = page.locator("[data-landing-bar=compact]");
    await expect(bar).toBeVisible();
    const menu = bar.getByRole("button").first();
    await waitForHydration(page, menu);
    await menu.click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);
  });

  test("Tablet 768 English (development preview): LTR, compact bar, Showcase 520", async ({
    page,
  }) => {
    await open(page, 768, "/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("[data-landing-bar=compact]")).toBeVisible();
    const card = await page.locator("[data-showcase-window]").boundingBox();
    expect(Math.round(card?.width ?? 0)).toBe(520);
  });
});
