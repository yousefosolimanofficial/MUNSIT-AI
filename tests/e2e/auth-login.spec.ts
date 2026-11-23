import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import enAuth from "../../src/i18n/messages/en/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/*
 * Phase 08 Increment 2: the Login UI (contract §7 "E2E (dev)"). `/login` is "UI-complete, not
 * functional": a valid submit always ends with "تسجيل الدخول غير متاح حاليًا.". The Loading and
 * Error states are reviewed only on `/dev/auth/login?state=loading|error` (L-3). Production keeps
 * `/login` at 404 (tests/e2e-production/auth-routes.prod.spec.ts, unchanged).
 *
 * Figma card geometry (Default `67:3` / `67:59` / `67:37`, Error `2467:75609` / `75701` / `75792`):
 * gap 28; header 65; Fields at 93 (gap 20: email 81, password 81, forgot row 25); button 52 at
 * 348 (Error: banner 44 at 348, button at 420); card 453 (Error 525), at 480 and 350 wide.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const EMAIL = "ahmed@example.com";
const PASSWORD = "Secret-123";

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function hydrated(page: Page) {
  await waitForHydration(page, page.locator("[data-login-form] input").first());
}

/** Card-relative top and size of a block, rounded. */
async function cardOffsets(page: Page) {
  return page.locator("[data-auth-card]").evaluate((card) => {
    const c = card.getBoundingClientRect();
    const rel = (el: Element | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top - c.top),
        height: Math.round(r.height),
        left: Math.round(r.left - c.left),
        right: Math.round(c.right - r.right),
      };
    };
    const form = card.querySelector("[data-login-form]");
    return {
      width: Math.round(c.width),
      height: Math.round(c.height),
      header: rel(card.firstElementChild),
      fields: rel(form?.firstElementChild ?? null),
      inputs: [...card.querySelectorAll("[data-auth-field]")].map(rel),
      forgot: rel(form?.querySelector("a") ?? null),
      banner: rel(card.querySelector("[data-auth-error-banner]")),
      button: rel(card.querySelector('button[type="submit"]')),
      footer: rel(card.lastElementChild),
    };
  });
}

async function fillValid(page: Page) {
  await page.getByLabel(arAuth.login.email, { exact: true }).fill(EMAIL);
  await page.getByLabel(arAuth.login.password, { exact: true }).fill(PASSWORD);
}

test.describe("Login (/login, development)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const { prefix, auth, lang } of [
    { prefix: "", auth: arAuth, lang: "ar" },
    { prefix: "/en", auth: enAuth, lang: "en" },
  ] as const) {
    test(`${prefix}/login: the Login screen, one h1, noindex, the form named by the heading (${lang})`, async ({
      page,
    }) => {
      const response = await open(page, `${prefix}/login`, 1440);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(auth.login.heading);
      await expect(page.getByRole("form", { name: auth.login.heading })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex, nofollow",
      );
      await expect(page.locator("[data-auth-preview-banner]")).toHaveCount(0);
      // Outside the app shell: no navigation; the route title stays (L-4, from routing.spec.ts).
      await expect(page.getByRole("navigation")).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      await expect(page).toHaveTitle(lang === "ar" ? /^تسجيل الدخول · / : /^Log in · /);
      await expect(page.locator("[data-auth-layout]")).toHaveAttribute("data-auth-layout", "login");
    });
  }

  for (const { width, order, card } of [
    { width: 390, order: ["logo", "form", "panel"], card: 350 },
    { width: 720, order: ["logo", "panel", "form"], card: 480 },
    { width: 768, order: ["logo", "panel", "form"], card: 480 },
    { width: 1024, order: ["logo", "panel", "form"], card: 480 },
    { width: 1280, order: ["form", "panel"], card: 480 },
    { width: 1440, order: ["form", "panel"], card: 480 },
  ] as const) {
    test(`breakpoint ${width}: layout order and the Figma card (${card})`, async ({ page }) => {
      await open(page, "/login", width);
      const kinds = await page
        .locator("[data-auth-layout] > *")
        .evaluateAll((els) =>
          els
            .filter((el) => getComputedStyle(el).display !== "none")
            .map((el) =>
              el.hasAttribute("data-auth-form-column")
                ? "form"
                : el.hasAttribute("data-auth-marketing")
                  ? "panel"
                  : "logo",
            ),
        );
      expect(kinds).toEqual(order);
      const o = await cardOffsets(page);
      expect(o.width).toBe(card);
      expect(Math.abs(o.height - 453)).toBeLessThanOrEqual(3);
      expect(o.header?.top).toBe(0);
      expect(Math.abs((o.fields?.top ?? 0) - 93)).toBeLessThanOrEqual(2);
      expect(o.inputs.map((i) => i?.height)).toEqual([81, 81]);
      const [email, password] = o.inputs;
      expect((password?.top ?? 0) - (email?.top ?? 0)).toBe(101);
      expect(o.banner).toBeNull();
      expect(o.button?.height).toBe(52);
      expect(Math.abs((o.button?.top ?? 0) - 348)).toBeLessThanOrEqual(3);
      // RTL: the "forgot" link sits at the inline end, the physical left edge of the card.
      expect(o.forgot?.left).toBe(0);
    });
  }

  for (const width of [1440, 768, 390, 320, 720, 1024, 1280] as const) {
    test(`no horizontal overflow at ${width}`, async ({ page }) => {
      await open(page, "/login", width);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  test("English (LTR): the forgot link sits at the inline end (right)", async ({ page }) => {
    await open(page, "/en/login", 1440);
    const o = await cardOffsets(page);
    expect(o.forgot?.right).toBe(0);
  });

  test("links: forgot password and create account", async ({ page }) => {
    await open(page, "/login", 1440);
    await expect(page.getByRole("link", { name: arAuth.login.forgot })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    await expect(page.getByRole("link", { name: arAuth.login.register })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  test("blur validation, clearing on change, submit focuses the first invalid field", async ({
    page,
  }) => {
    await open(page, "/login", 1440);
    await hydrated(page);
    const email = page.getByLabel(arAuth.login.email, { exact: true });
    await email.focus();
    await page.keyboard.press("Tab");
    await expect(page.getByText(arAuth.validation.emailRequired)).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await email.fill(EMAIL);
    await expect(page.getByText(arAuth.validation.emailRequired)).toHaveCount(0);
    await email.fill("");
    await page.getByRole("button", { name: arAuth.login.submit }).click();
    await expect(email).toBeFocused();
    await expect(page.getByText(arAuth.validation.passwordRequired)).toBeVisible();
  });

  test("keyboard only: reading order, Enter submits, then the unavailable banner (never success)", async ({
    page,
  }) => {
    await open(page, "/login", 1440);
    await hydrated(page);
    const email = page.getByLabel(arAuth.login.email, { exact: true });
    await email.focus();
    await page.keyboard.type(EMAIL);
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(arAuth.login.password, { exact: true })).toBeFocused();
    await page.keyboard.type(PASSWORD);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.password.show })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: arAuth.login.forgot })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.login.submit })).toBeFocused();
    await page.getByLabel(arAuth.login.password, { exact: true }).focus();
    await page.keyboard.press("Enter");
    const banner = page.locator("[data-auth-error-banner]");
    await expect(banner).toHaveText(arAuth.errors.unavailable.login);
    await expect(page.getByText(arAuth.errors.invalidCredentials)).toHaveCount(0);
    await expect(page).toHaveURL(/\/login$/);
    // The banner sits between the fields and the button (Figma Error layout).
    const o = await cardOffsets(page);
    expect(Math.abs((o.banner?.top ?? 0) - 348)).toBeLessThanOrEqual(3);
    expect(Math.abs((o.button?.top ?? 0) - 420)).toBeLessThanOrEqual(4);
  });

  test("no request leaves the page on submit, and nothing is stored", async ({ page }) => {
    await open(page, "/login", 1440);
    await hydrated(page);
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") requests.push(`${r.method()} ${r.url()}`);
    });
    await fillValid(page);
    await page.getByRole("button", { name: arAuth.login.submit }).click();
    await expect(page.locator("[data-auth-error-banner]")).toHaveText(
      arAuth.errors.unavailable.login,
    );
    expect(requests).toEqual([]);
    const stored = await page.evaluate(() => ({
      local: Object.keys(localStorage).length,
      session: Object.keys(sessionStorage).length,
      cookie: document.cookie.includes("ahmed"),
    }));
    expect(stored).toEqual({ local: 0, session: 0, cookie: false });
  });

  for (const { prefix, lang } of [
    { prefix: "", lang: "ar" },
    { prefix: "/en", lang: "en" },
  ] as const) {
    for (const width of [1440, 768, 390] as const) {
      test(`axe ${lang} ${width}px, Default and with errors (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, `${prefix}/login`, width);
        await hydrated(page);
        const first = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(first.violations).toEqual([]);
        await page.locator('[data-login-form] button[type="submit"]').click();
        await expect(page.locator("[data-login-form] [aria-invalid]")).toHaveCount(2);
        const second = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(second.violations).toEqual([]);
      });
    }
  }
});

test.describe("Login preview (/dev/auth/login, development only)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [1440, 768, 390] as const) {
    test(`Loading ${width}: the Figma Loading button, aria-busy, no second submit`, async ({
      page,
    }) => {
      await open(page, "/dev/auth/login?state=loading", width);
      await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
      await hydrated(page);
      await fillValid(page);
      await page.getByRole("button", { name: arAuth.login.submit }).click();
      const loading = page.getByRole("button", { name: arAuth.login.submitting });
      await expect(loading).toHaveAttribute("aria-busy", "true");
      await expect(loading).toBeDisabled();
      expect(Math.round((await loading.boundingBox())?.height ?? 0)).toBe(52);
      await expect(loading.locator("svg")).toBeVisible();
      await expect(page.locator("[data-auth-error-banner]")).toHaveCount(0);
    });

    test(`Error ${width}: the Figma Error banner between the fields and the button`, async ({
      page,
    }) => {
      await open(page, "/dev/auth/login?state=error", width);
      await hydrated(page);
      await fillValid(page);
      await page.getByRole("button", { name: arAuth.login.submit }).click();
      await expect(page.locator("[data-auth-error-banner]")).toHaveText(
        arAuth.errors.invalidCredentials,
      );
      // Figma Error: both fields get a Coral Pulse 70% border and no helper. The border colour
      // transitions (150 ms), so poll until it settles; Chromium reports it as rgba or oklab.
      await expect
        .poll(() =>
          page
            .locator("[data-login-form] [data-auth-field] input")
            .evaluateAll((els) =>
              els.map((el) => getComputedStyle(el.parentElement as Element).borderTopColor),
            ),
        )
        .toEqual([
          expect.stringMatching(/(255, 99, 99, 0\.7\)|\/ 0\.7\))$/),
          expect.stringMatching(/(255, 99, 99, 0\.7\)|\/ 0\.7\))$/),
        ]);
      await expect(page.locator("[data-login-form] [aria-invalid]")).toHaveCount(2);
      const o = await cardOffsets(page);
      expect(Math.abs(o.height - 525)).toBeLessThanOrEqual(4);
      expect(Math.abs((o.banner?.top ?? 0) - 348)).toBeLessThanOrEqual(3);
      expect(Math.abs((o.banner?.height ?? 0) - 44)).toBeLessThanOrEqual(2);
      expect(Math.abs((o.button?.top ?? 0) - 420)).toBeLessThanOrEqual(4);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("Password shown: the shown placeholder and the constant toggle name", async ({ page }) => {
    await open(page, "/dev/auth/login", 1440);
    await hydrated(page);
    const input = page.getByLabel(arAuth.login.password, { exact: true });
    await expect(input).toHaveAttribute("placeholder", arAuth.placeholders.password);
    const toggle = page.getByRole("button", { name: arAuth.password.show, exact: true });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAttribute("placeholder", arAuth.placeholders.passwordShown);
  });
});
