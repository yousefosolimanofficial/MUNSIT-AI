import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import enAuth from "../../src/i18n/messages/en/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/*
 * Phase 08 Increment 3: the Register UI (contract §8 "E2E (dev)"). `/register` is "UI-complete,
 * not functional": a valid submit always ends with "إنشاء الحساب غير متاح حاليًا." in the status
 * banner (R-3). Loading, Failed and Success are reviewed only on `/dev/auth/register?state=…`
 * (R-4). Production keeps `/register` at 404 (tests/e2e-production/auth-routes.prod.spec.ts).
 *
 * Figma card geometry (§3.2; 480 and 350 wide): gap 28; header 65; Fields at 93 with gap 16 (name,
 * email, password 81 each, the rules row 18, confirm); button at 527; card 632. One helper 658,
 * Required 736, Failed 708, Success 290. At 390 the rules row may wrap (R-8), adding one row.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const NAME = "أحمد محمد";
const EMAIL = "ahmed@example.com";
const PASSWORD = "Abcdefg1";

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function hydrated(page: Page) {
  await waitForHydration(page, page.locator("[data-register-form] input").first());
}

const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });

async function fillValid(page: Page) {
  await field(page, arAuth.register.name).fill(NAME);
  await field(page, arAuth.register.email).fill(EMAIL);
  await field(page, arAuth.register.password).fill(PASSWORD);
  await field(page, arAuth.register.confirm).fill(PASSWORD);
}

/** Card-relative geometry, rounded. */
async function card(page: Page) {
  return page.locator("[data-auth-card], [data-auth-result]").evaluate((el) => {
    const c = el.getBoundingClientRect();
    const rel = (n: Element | null) => {
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { top: Math.round(r.top - c.top), height: Math.round(r.height) };
    };
    const form = el.querySelector("[data-register-form]");
    return {
      width: Math.round(c.width),
      height: Math.round(c.height),
      banner: rel(el.querySelector("[data-auth-status-banner]")),
      fields: [...el.querySelectorAll("[data-auth-field]")].map(rel),
      rules: rel(el.querySelector("[data-password-rules]")),
      button: rel(form?.querySelector('button[type="submit"]') ?? null),
    };
  });
}

/** Extra height when the rules row wraps (R-8): 0 when it fits on one row. */
async function rulesExtra(page: Page) {
  const rules = await card(page);
  return (rules.rules?.height ?? 18) - 18;
}

test.describe("Register (/register, development)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const { prefix, auth, lang } of [
    { prefix: "", auth: arAuth, lang: "ar" },
    { prefix: "/en", auth: enAuth, lang: "en" },
  ] as const) {
    test(`${prefix}/register: the Register screen, one h1, noindex, outside the shell (${lang})`, async ({
      page,
    }) => {
      const response = await open(page, `${prefix}/register`, 1440);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(auth.register.heading);
      await expect(page.getByRole("form", { name: auth.register.heading })).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "noindex, nofollow",
      );
      await expect(page.locator("[data-auth-preview-banner]")).toHaveCount(0);
      await expect(page.locator("[data-auth-layout]")).toHaveAttribute(
        "data-auth-layout",
        "register",
      );
      await expect(page.getByRole("navigation")).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      await expect(page).toHaveTitle(lang === "ar" ? /^إنشاء حساب · / : /^Create account · /);
    });
  }

  for (const { width, order, cardWidth, photo } of [
    { width: 390, order: ["logo", "form", "panel"], cardWidth: 350, photo: 200 },
    { width: 720, order: ["logo", "panel", "form"], cardWidth: 480, photo: 240 },
    { width: 768, order: ["logo", "panel", "form"], cardWidth: 480, photo: 240 },
    { width: 1024, order: ["logo", "panel", "form"], cardWidth: 480, photo: 240 },
    { width: 1280, order: ["form", "panel"], cardWidth: 480, photo: 350 },
    { width: 1440, order: ["form", "panel"], cardWidth: 480, photo: 350 },
  ] as const) {
    test(`breakpoint ${width}: order, photo ${photo}, the Figma card (${cardWidth})`, async ({
      page,
    }) => {
      await open(page, "/register", width);
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
      const img = page.locator("[data-auth-marketing]:visible img").first();
      expect(Math.round((await img.boundingBox())?.height ?? 0)).toBe(photo);
      const c = await card(page);
      const extra = await rulesExtra(page);
      expect(c.width).toBe(cardWidth);
      expect(Math.abs(c.height - (632 + extra))).toBeLessThanOrEqual(3);
      expect(c.fields.map((f) => f?.height)).toEqual([81, 81, 81, 81]);
      expect(c.fields.map((f) => f?.top)).toEqual([93, 190, 287, 418 + extra]);
      expect(c.rules?.top).toBe(384);
      expect(c.button?.height).toBe(52);
      expect(Math.abs((c.button?.top ?? 0) - (527 + extra))).toBeLessThanOrEqual(3);
      if (width >= 720) expect(extra).toBe(0);
    });
  }

  for (const width of [1440, 768, 390, 320, 720, 1024, 1280] as const) {
    test(`no horizontal overflow at ${width}`, async ({ page }) => {
      await open(page, "/register", width);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
      const rules = page.locator("[data-password-rules]");
      const clipped = await rules.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(clipped).toBe(0);
    });
  }

  test("Required: every field shows its message; card 736; focus on the name", async ({ page }) => {
    await open(page, "/register", 1440);
    await hydrated(page);
    await page.getByRole("button", { name: arAuth.register.submit }).click();
    for (const message of [
      arAuth.validation.nameRequired,
      arAuth.validation.emailRequired,
      arAuth.validation.passwordRequired,
      arAuth.validation.confirmRequired,
    ]) {
      await expect(page.getByText(message, { exact: true })).toBeVisible();
    }
    await expect(field(page, arAuth.register.name)).toBeFocused();
    expect(Math.abs((await card(page)).height - 736)).toBeLessThanOrEqual(3);
  });

  test("Invalid email, Password rules and Mismatch: one helper each (card 658)", async ({
    page,
  }) => {
    await open(page, "/register", 1440);
    await hydrated(page);
    await field(page, arAuth.register.name).fill(NAME);
    await field(page, arAuth.register.email).fill("ahmed@example");
    await field(page, arAuth.register.email).blur();
    await expect(page.getByText(arAuth.validation.emailInvalid)).toBeVisible();
    expect(Math.abs((await card(page)).height - 658)).toBeLessThanOrEqual(3);

    await field(page, arAuth.register.email).fill(EMAIL);
    await field(page, arAuth.register.password).fill("abcdefgh");
    await field(page, arAuth.register.password).blur();
    await expect(page.getByText(arAuth.validation.passwordRules)).toBeVisible();
    const states = await page
      .locator("[data-password-rule]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-password-rule")));
    expect(states).toEqual(["valid", "error", "error"]);
    expect(Math.abs((await card(page)).height - 658)).toBeLessThanOrEqual(3);

    await field(page, arAuth.register.password).fill(PASSWORD);
    await field(page, arAuth.register.confirm).fill("Abcdefg2");
    await field(page, arAuth.register.confirm).blur();
    await expect(page.getByText(arAuth.validation.mismatch)).toBeVisible();
    expect(Math.abs((await card(page)).height - 658)).toBeLessThanOrEqual(3);
    // R-9: fixing the password clears the mismatch without leaving the field.
    await field(page, arAuth.register.password).fill("Abcdefg2");
    await expect(page.getByText(arAuth.validation.mismatch)).toHaveCount(0);
  });

  test("keyboard only: reading order, Enter submits, then the unavailable status banner", async ({
    page,
  }) => {
    await open(page, "/register", 1440);
    await hydrated(page);
    await field(page, arAuth.register.name).focus();
    await page.keyboard.type(NAME);
    await page.keyboard.press("Tab");
    await expect(field(page, arAuth.register.email)).toBeFocused();
    await page.keyboard.type(EMAIL);
    await page.keyboard.press("Tab");
    await expect(field(page, arAuth.register.password)).toBeFocused();
    await page.keyboard.type(PASSWORD);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.password.show }).first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(field(page, arAuth.register.confirm)).toBeFocused();
    await page.keyboard.type(PASSWORD);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.password.show }).last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.register.submit })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: arAuth.register.login })).toBeFocused();
    await field(page, arAuth.register.confirm).focus();
    await page.keyboard.press("Enter");
    const banner = page.locator("[data-auth-status-banner]");
    await expect(banner).toHaveText(arAuth.errors.unavailable.register);
    await expect(page.getByRole("button", { name: arAuth.register.submit })).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
    const c = await card(page);
    expect(c.banner?.top).toBe(93);
    expect(Math.abs((c.banner?.height ?? 0) - 48)).toBeLessThanOrEqual(2);
    expect(Math.abs(c.height - 708)).toBeLessThanOrEqual(4);
  });

  test("no request leaves the page on submit, and nothing is stored", async ({ page }) => {
    await open(page, "/register", 1440);
    await hydrated(page);
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") requests.push(`${r.method()} ${r.url()}`);
    });
    await fillValid(page);
    await page.getByRole("button", { name: arAuth.register.submit }).click();
    await expect(page.locator("[data-auth-status-banner]")).toHaveText(
      arAuth.errors.unavailable.register,
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
        await open(page, `${prefix}/register`, width);
        await hydrated(page);
        const first = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(first.violations).toEqual([]);
        await page.locator('[data-register-form] button[type="submit"]').click();
        await expect(page.locator("[data-register-form] [aria-invalid]")).toHaveCount(4);
        const second = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(second.violations).toEqual([]);
      });
    }
  }
});

test.describe("Register preview (/dev/auth/register, development only)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [1440, 768, 390] as const) {
    test(`Loading ${width}: the State=Loading button, aria-busy, no banner`, async ({ page }) => {
      await open(page, "/dev/auth/register?state=loading", width);
      await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
      await hydrated(page);
      await fillValid(page);
      await page.getByRole("button", { name: arAuth.register.submit }).click();
      const loading = page.getByRole("button", { name: arAuth.register.submitting });
      await expect(loading).toHaveAttribute("aria-busy", "true");
      await expect(loading).toBeDisabled();
      expect(Math.round((await loading.boundingBox())?.height ?? 0)).toBe(52);
      await expect(page.locator("[data-auth-status-banner]")).toHaveCount(0);
    });

    test(`Failed ${width}: the status banner above the fields and "إعادة المحاولة"`, async ({
      page,
    }) => {
      await open(page, "/dev/auth/register?state=failed", width);
      await hydrated(page);
      await fillValid(page);
      await page.getByRole("button", { name: arAuth.register.submit }).click();
      await expect(page.locator("[data-auth-status-banner]")).toHaveText(
        arAuth.errors.failed.register,
      );
      await expect(page.getByRole("button", { name: arAuth.common.retry })).toBeVisible();
      const c = await card(page);
      expect(c.banner?.top).toBe(93);
      expect(Math.abs(c.height - (708 + (await rulesExtra(page))))).toBeLessThanOrEqual(4);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`Success ${width}: the result view, focus on its heading, links to Login`, async ({
      page,
    }) => {
      await open(page, "/dev/auth/register?state=success", width);
      await hydrated(page);
      await fillValid(page);
      await page.getByRole("button", { name: arAuth.register.submit }).click();
      const heading = page.getByRole("heading", {
        level: 1,
        name: arAuth.register.success.heading,
      });
      await expect(heading).toBeFocused();
      await expect(page.locator("h1")).toHaveCount(1);
      const result = page.locator("[data-auth-result]");
      await expect(result.getByRole("link", { name: arAuth.register.login })).toHaveCount(2);
      await expect(result.locator("[data-auth-button-link]")).toHaveAttribute("href", "/login");
      expect(Math.abs((await card(page)).height - 290)).toBeLessThanOrEqual(4);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("Shown: both toggles independent, the shown placeholder", async ({ page }) => {
    await open(page, "/dev/auth/register", 1440);
    await hydrated(page);
    const [first, second] = [
      page.getByRole("button", { name: arAuth.password.show }).first(),
      page.getByRole("button", { name: arAuth.password.show }).last(),
    ];
    await second.click();
    await expect(field(page, arAuth.register.confirm)).toHaveAttribute("type", "text");
    await expect(field(page, arAuth.register.confirm)).toHaveAttribute(
      "placeholder",
      arAuth.placeholders.passwordShown,
    );
    await expect(field(page, arAuth.register.password)).toHaveAttribute("type", "password");
    await first.click();
    await expect(field(page, arAuth.register.password)).toHaveAttribute("type", "text");
  });
});
