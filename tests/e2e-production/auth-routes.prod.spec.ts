import { expect, test } from "../e2e/test";
import arPages from "../../src/i18n/messages/ar/pages.json" with { type: "json" };
import enPages from "../../src/i18n/messages/en/pages.json" with { type: "json" };

/*
 * P07-D25 (owner, 2026-11-22): unfinished Authentication placeholders in production.
 * Runs only through playwright.production.config.ts (a `NEXT_PUBLIC_APP_ENV=production` build
 * served by `next start`). While `AUTHENTICATION_AVAILABLE` is false:
 * - every Auth route, in both locales, returns 404 with no form, no input, no Auth link and no
 *   placeholder title, and the 404 page is `noindex`;
 * - placeholders that stay public (Phase 04 routes outside Auth) carry `noindex, nofollow`;
 * - the Landing stays reachable and indexable.
 * Status checks use HTTP requests: a browser logs every 404 document as a console error.
 */

const AUTH_ROUTES = [
  { path: "/login", key: "auth_login" },
  { path: "/register", key: "auth_register" },
  { path: "/forgot-password", key: "auth_forgotPassword" },
  { path: "/reset-password", key: "auth_resetPassword" },
] as const;

const NOINDEX = /<meta name="robots" content="noindex(, ?nofollow)?"\s*\/?>/;

for (const { path, key } of AUTH_ROUTES) {
  for (const { prefix, title } of [
    { prefix: "", title: arPages.titles[key] },
    { prefix: "/en", title: enPages.titles[key] },
  ]) {
    test(`${prefix}${path}: 404 in production, no Auth UI, not indexable`, async ({ request }) => {
      const response = await request.get(`${prefix}${path}`);
      expect(response.status()).toBe(404);
      const html = await response.text();
      expect(html).toMatch(NOINDEX);
      expect(html).not.toMatch(/<form|<input|type="password"/i);
      expect(html).not.toMatch(/href="(\/en)?\/(login|register|forgot-password|reset-password)"/);
      // No placeholder heading or title: the screen name appears nowhere in the response.
      expect(html).not.toContain(title);
    });
  }
}

test("/ar/login redirects to the unprefixed URL, which is 404", async ({ request }) => {
  const response = await request.get("/ar/login");
  expect(new URL(response.url()).pathname).toBe("/login");
  expect(response.status()).toBe(404);
});

test("placeholders that stay public are noindex, nofollow", async ({ request }) => {
  for (const path of ["/dashboard", "/en/dashboard", "/lectures/sample-1", "/settings/security"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(await response.text(), path).toMatch(
      /<meta name="robots" content="noindex, nofollow"\s*\/?>/,
    );
  }
});

test("the Landing stays reachable and indexable", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  expect(await response.text()).not.toMatch(/<meta name="robots"/);
});
