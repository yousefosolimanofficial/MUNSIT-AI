import { expect, test } from "./test";
import arPages from "../../src/i18n/messages/ar/pages.json" with { type: "json" };
import enPages from "../../src/i18n/messages/en/pages.json" with { type: "json" };

/*
 * P07-D25 (owner, 2026-11-22): development keeps the Phase 04 Auth placeholders (production
 * returns 404 until Authentication is available; tests/e2e-production/auth-routes.prod.spec.ts).
 * Every placeholder is `noindex, nofollow`; the Landing stays indexable.
 */

const AUTH_ROUTES = [
  { path: "/login", key: "auth_login" },
  { path: "/register", key: "auth_register" },
  { path: "/forgot-password", key: "auth_forgotPassword" },
  { path: "/reset-password", key: "auth_resetPassword" },
] as const;

for (const { prefix, locale, pages } of [
  { prefix: "", locale: "ar", pages: arPages },
  { prefix: "/en", locale: "en", pages: enPages },
] as const) {
  test.describe(`Auth placeholders in development (${locale})`, () => {
    for (const { path, key } of AUTH_ROUTES) {
      test(`${prefix}${path}: placeholder page, noindex, no form`, async ({ page }) => {
        const response = await page.goto(`${prefix}${path}`);
        expect(response?.status()).toBe(200);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(pages.titles[key]);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          "content",
          "noindex, nofollow",
        );
        await expect(page.locator("form, input")).toHaveCount(0);
      });
    }
  });
}

test("the Landing has no robots restriction", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});
