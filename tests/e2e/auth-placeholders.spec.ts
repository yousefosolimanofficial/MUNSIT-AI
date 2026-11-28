import { expect, test } from "./test";

/*
 * P07-D25 (owner, 2026-11-22): production returns 404 for every Auth route until Authentication is
 * available (tests/e2e-production/auth-routes.prod.spec.ts). Every Auth route is
 * `noindex, nofollow`; the Landing stays indexable.
 *
 * No Auth placeholder is left in development. Each route left this file when its screen landed,
 * and its own spec now covers the title, direction, noindex and layout:
 * `/login` (Phase 08 Increment 2, L-4): auth-login.spec.ts;
 * `/register` (Increment 3, R-11): auth-register.spec.ts;
 * `/forgot-password` and `/reset-password` (Recovery UI): auth-recovery.spec.ts.
 */

test("the Landing has no robots restriction", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});
