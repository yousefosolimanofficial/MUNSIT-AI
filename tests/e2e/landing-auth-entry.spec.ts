import type { Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };

/*
 * P07-D24 (owner, 2026-11-22): public authentication entry points (navbar login, Mobile menu
 * login, Hero "ابدأ الآن", Final CTA, footer account links) are hidden in production until
 * Authentication is operational, and kept in development. The E2E server is `next dev`
 * (development), so this spec verifies the development behaviour on the real page. Production
 * behaviour is covered by the gate and component unit tests (`auth-gate.test.tsx`) and by the
 * production-build check recorded in docs/phases/phase-07-cta-correction.md.
 */

const LOCALES = [
  { locale: "ar", path: "/", prefix: "", m: arLanding },
  { locale: "en", path: "/en", prefix: "/en", m: enLanding },
] as const;

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

for (const { locale, path, prefix, m } of LOCALES) {
  test.describe(`Authentication entry points in development (${locale})`, () => {
    test.use({ reducedMotion: "reduce" });

    test("Desktop 1440: navbar login, Hero primary, Final CTA and footer account links", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const login = page.locator("[data-landing-bar=desktop] [data-landing-action=login]");
      await expect(login).toBeVisible();
      await expect(login).toHaveAttribute("href", `${prefix}/login`);

      const hero = page.locator("[data-landing-hero-cta=primary]");
      await expect(hero).toBeVisible();
      await expect(hero).toHaveText(m.hero.ctaPrimary);
      await expect(hero).toHaveAttribute("href", `${prefix}/register`);

      const cta = page.locator('[data-landing-section="cta"]');
      await expect(cta).toHaveCount(1);
      await expect(cta.locator("[data-cta-action=primary]")).toHaveText(m.cta.primary);
      await expect(cta.locator("[data-cta-action=primary]")).toHaveAttribute(
        "href",
        `${prefix}/register`,
      );

      const account = page.locator("[data-landing-footer-column=account] a");
      await expect(account).toHaveCount(2);
      expect(await account.evaluateAll((els) => els.map((a) => a.getAttribute("href")))).toEqual([
        `${prefix}/login`,
        `${prefix}/register`,
      ]);
    });

    test("Tablet 768: login in the compact bar", async ({ page }) => {
      await open(page, path, 768);
      const login = page.locator("[data-landing-bar=compact] [data-landing-action=login]");
      await expect(login).toBeVisible();
      await expect(login).toHaveAttribute("href", `${prefix}/login`);
    });

    test("Mobile 390: login in the menu sheet", async ({ page }) => {
      await open(page, path, 390);
      const menu = page.locator("[data-landing-bar=compact] button").first();
      await waitForHydration(page, menu);
      await menu.click();
      const login = page.locator("[data-landing-menu] [data-landing-action=login]");
      await expect(login).toBeVisible();
      await expect(login).toHaveAttribute("href", `${prefix}/login`);
    });
  });
}
