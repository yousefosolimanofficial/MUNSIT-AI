import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import enAuth from "../../src/i18n/messages/en/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/*
 * Phase 08 Recovery UI: Forgot Password and Reset Password (START_HERE §8 "E2E (dev)"). Both routes
 * are "UI-complete, not functional": a valid submit always ends with the unavailable banner. The
 * other states are reviewed only on `/dev/auth/forgot-password?state=…` and
 * `/dev/auth/reset-password?state=…` (RC-2). Production keeps both routes at 404
 * (tests/e2e-production/auth-routes.prod.spec.ts, unchanged; Yousef runs `test:e2e:prod`).
 *
 * Figma card heights (START_HERE §2.1 / §2.2), the same at 480 and 350 wide:
 * Forgot Default 334, Empty 360, Invalid 360, Loading 334, Failed 410, Email sent 225.
 * Reset Default 434 (Shown and Loading 434), Required 486, Mismatch 460, Error 510, Invalid link
 * 290, Expired link 290, Updated 237.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const EMAIL = "ahmed@example.com";
const PASSWORD = "Secret-123";
const HEIGHT_TOLERANCE = 4;

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  const response = await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function hydrated(page: Page, form: "forgot" | "reset") {
  await waitForHydration(page, page.locator(`[data-${form}-form] input`).first());
}

/** The card (form card or result view): width, height and the visible top-level layout order. */
async function geometry(page: Page) {
  const card = page.locator("[data-auth-card], [data-auth-result]");
  await expect(card).toHaveCount(1);
  const box = await card.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height) };
  });
  return box;
}

async function layoutOrder(page: Page) {
  return page
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
}

/** Lines of the header description in the Figma frames (Forgot and Email sent wrap to two). */
const FIGMA_DESCRIPTION_LINES: Record<string, number> = {
  [arAuth.forgot.heading]: 2,
  [arAuth.forgot.sent.heading]: 2,
  [enAuth.forgot.heading]: 2,
  [enAuth.forgot.sent.heading]: 2,
};
const LINE = 27; // `Landing/Body/Large` line box
const RULES_ROW = 18;
// Reset Fields use the Figma gap of 14 (owner decision, 2026-11-28), so Reset form cards match
// the Figma heights with no gap compensation.

/*
 * Card height against Figma, with a documented wrap compensation (DELIVERY.md "Known
 * limitations"). Figma draws every 390 description on one non-wrapping line inside the 350 card and
 * clips the rules row at x −4 (frame `2480:1366`); in the browser the same text wraps. The
 * compensation is only the extra description lines and the extra rules row, measured; everything
 * else (gaps, fields, banner, button, footer) must match Figma within 4 px. At 480 wide no wrap is
 * allowed, except the Invalid-link body (`allowWrapAt480`), whose last word wraps because the
 * browser's Cairo metrics run a few pixels wider than Figma's 480 text box.
 */
async function expectCardHeight(
  page: Page,
  figmaHeight: number,
  { allowWrapAt480 = false }: { allowWrapAt480?: boolean } = {},
) {
  const card = page.locator("[data-auth-card], [data-auth-result]");
  await expect(card).toHaveCount(1);
  const m = await card.evaluate((el) => {
    const header = el.querySelector("h1")?.parentElement;
    const description = header?.querySelector("p");
    const rules = el.querySelector("[data-password-rules]");
    return {
      width: Math.round(el.getBoundingClientRect().width),
      height: Math.round(el.getBoundingClientRect().height),
      heading: el.querySelector("h1")?.textContent ?? "",
      descriptionHeight: Math.round(description?.getBoundingClientRect().height ?? 0),
      rulesHeight: rules ? Math.round(rules.getBoundingClientRect().height) : null,
    };
  });
  const figmaLines = FIGMA_DESCRIPTION_LINES[m.heading] ?? 1;
  const extraLines = Math.round(m.descriptionHeight / LINE) - figmaLines;
  const extraRules = m.rulesHeight === null ? 0 : m.rulesHeight - RULES_ROW;
  expect(extraLines, "description lines beyond Figma").toBeGreaterThanOrEqual(0);
  expect(extraLines, "at most one extra description line").toBeLessThanOrEqual(1);
  expect(extraRules, "at most one extra rules row (18 + gap 4)").toBeLessThanOrEqual(22);
  if (m.width === 480) {
    expect(extraRules, "the rules row fits on one line at 480").toBe(0);
    if (!allowWrapAt480) expect(extraLines, "no extra description line at 480").toBe(0);
  }
  const expected = figmaHeight + extraLines * LINE + extraRules;
  expect(
    Math.abs(m.height - expected),
    `card height ${m.height} vs Figma ${figmaHeight} + wrap ${expected - figmaHeight}`,
  ).toBeLessThanOrEqual(HEIGHT_TOLERANCE);
}

const BREAKPOINTS = [
  { width: 390, order: ["logo", "form", "panel"], card: 350 },
  { width: 720, order: ["logo", "panel", "form"], card: 480 },
  { width: 768, order: ["logo", "panel", "form"], card: 480 },
  { width: 1024, order: ["logo", "panel", "form"], card: 480 },
  { width: 1280, order: ["form", "panel"], card: 480 },
  { width: 1440, order: ["form", "panel"], card: 480 },
] as const;

const ROUTES = [
  { path: "/forgot-password", form: "forgot", height: 334 },
  { path: "/reset-password", form: "reset", height: 434 },
] as const;

/* ------------------------------------------------------------------------------------------ */
/* Both routes                                                                                 */
/* ------------------------------------------------------------------------------------------ */

test.describe("Recovery routes (development)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const { prefix, auth, lang } of [
    { prefix: "", auth: arAuth, lang: "ar" },
    { prefix: "/en", auth: enAuth, lang: "en" },
  ] as const) {
    for (const { path, heading, title } of [
      {
        path: "/forgot-password",
        heading: auth.forgot.heading,
        title: lang === "ar" ? /^نسيت كلمة المرور · / : /^Forgot password · /,
      },
      {
        path: "/reset-password",
        heading: auth.reset.heading,
        title: lang === "ar" ? /^إعادة تعيين كلمة المرور · / : /^Reset password · /,
      },
    ]) {
      test(`${prefix}${path}: the screen, one h1, noindex, recovery layout (${lang})`, async ({
        page,
      }) => {
        const response = await open(page, `${prefix}${path}`, 1440);
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
        await expect(page.getByRole("form", { name: heading })).toBeVisible();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          "content",
          "noindex, nofollow",
        );
        await expect(page.locator("[data-auth-preview-banner]")).toHaveCount(0);
        await expect(page.getByRole("navigation")).toHaveCount(0);
        await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        await expect(page).toHaveTitle(title);
        await expect(page.locator("[data-auth-layout]")).toHaveAttribute(
          "data-auth-layout",
          "recovery",
        );
        await expect(page.getByRole("link", { name: auth.forgot.back })).toHaveAttribute(
          "href",
          prefix ? `${prefix}/login` : "/login",
        );
      });
    }
  }

  for (const route of ROUTES) {
    for (const { width, order, card } of BREAKPOINTS) {
      test(`${route.path} at ${width}: layout order, card ${card} × ${route.height}`, async ({
        page,
      }) => {
        await open(page, route.path, width);
        expect(await layoutOrder(page)).toEqual(order);
        const box = await geometry(page);
        expect(box.width).toBe(card);
        await expectCardHeight(page, route.height);
      });
    }

    for (const width of [320, 390, 720, 768, 1024, 1280, 1440] as const) {
      test(`${route.path}: no horizontal overflow at ${width}`, async ({ page }) => {
        await open(page, route.path, width);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);
      });
    }
  }

  test("Tablet panel photo is 672 × 240 (recovery family)", async ({ page }) => {
    await open(page, "/forgot-password", 768);
    // The panel frame is 672 wide (its 1 px border included, as in auth-foundation.spec.ts); the
    // photo inside it is 240 high.
    const frame = page.locator("[data-auth-marketing]:visible > div").last();
    expect(Math.round((await frame.boundingBox())?.width ?? 0)).toBe(672);
    const photo = page.locator("[data-auth-marketing]:visible img");
    await expect(photo).toBeVisible();
    expect(Math.round((await photo.boundingBox())?.height ?? 0)).toBe(240);
  });

  for (const { prefix, lang } of [
    { prefix: "", lang: "ar" },
    { prefix: "/en", lang: "en" },
  ] as const) {
    for (const route of ROUTES) {
      for (const width of [1440, 768, 390] as const) {
        test(`axe ${lang} ${route.path} ${width}px, Default and with errors`, async ({ page }) => {
          await open(page, `${prefix}${route.path}`, width);
          await hydrated(page, route.form);
          const first = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
          expect(first.violations).toEqual([]);
          await page.locator(`[data-${route.form}-form] button[type="submit"]`).click();
          await expect(page.locator(`[data-${route.form}-form] [aria-invalid]`)).toHaveCount(
            route.form === "forgot" ? 1 : 2,
          );
          const second = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
          expect(second.violations).toEqual([]);
        });
      }
    }
  }
});

/* ------------------------------------------------------------------------------------------ */
/* Forgot Password                                                                             */
/* ------------------------------------------------------------------------------------------ */

test.describe("Forgot Password (/forgot-password, development)", () => {
  test.use({ reducedMotion: "reduce" });

  test("blur validation (Empty, Invalid), clearing on change, submit focuses the field", async ({
    page,
  }) => {
    await open(page, "/forgot-password", 1440);
    await hydrated(page, "forgot");
    const email = page.getByLabel(arAuth.forgot.email, { exact: true });
    await email.focus();
    await page.keyboard.press("Tab");
    await expect(page.getByText(arAuth.validation.emailRequired)).toBeVisible();
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expectCardHeight(page, 360);
    await email.fill("ahmed@example");
    await expect(page.getByText(arAuth.validation.emailInvalid)).toBeVisible();
    await email.fill(EMAIL);
    await expect(page.getByText(arAuth.validation.emailInvalid)).toHaveCount(0);
    await email.fill("");
    await page.getByRole("link", { name: arAuth.forgot.back }).focus();
    const submit = page.getByRole("button", { name: arAuth.forgot.submit });
    await submit.click();
    await expect(email).toBeFocused();
    await expect(submit).toBeEnabled();
  });

  test("keyboard only: order, Enter submits, then the unavailable banner above the field", async ({
    page,
  }) => {
    await open(page, "/forgot-password", 1440);
    await hydrated(page, "forgot");
    const email = page.getByLabel(arAuth.forgot.email, { exact: true });
    await email.focus();
    await page.keyboard.type(`  ${EMAIL} `);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.forgot.submit })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: arAuth.forgot.back })).toBeFocused();
    await email.focus();
    await page.keyboard.press("Enter");
    const banner = page.locator("[data-auth-status-banner]");
    await expect(banner).toHaveText(arAuth.errors.unavailable.forgot);
    await expect(banner).toHaveAttribute("role", "alert");
    await expect(page.getByRole("button", { name: arAuth.forgot.submit })).toBeEnabled();
    await expect(page.getByText(arAuth.forgot.sent.heading)).toHaveCount(0);
    await expect(page).toHaveURL(/\/forgot-password$/);
    const [bannerBox, emailBox] = await Promise.all([banner.boundingBox(), email.boundingBox()]);
    expect(bannerBox?.y ?? 0).toBeLessThan(emailBox?.y ?? 0);
    await expectCardHeight(page, 410);
  });

  test("no request leaves the page on submit, and nothing is stored", async ({ page }) => {
    await open(page, "/forgot-password", 1440);
    await hydrated(page, "forgot");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") requests.push(`${r.method()} ${r.url()}`);
    });
    await page.getByLabel(arAuth.forgot.email, { exact: true }).fill(EMAIL);
    await page.getByRole("button", { name: arAuth.forgot.submit }).click();
    await expect(page.locator("[data-auth-status-banner]")).toHaveText(
      arAuth.errors.unavailable.forgot,
    );
    expect(requests).toEqual([]);
    const stored = await page.evaluate(() => ({
      local: Object.keys(localStorage).length,
      session: Object.keys(sessionStorage).length,
      cookie: document.cookie.includes("ahmed"),
    }));
    expect(stored).toEqual({ local: 0, session: 0, cookie: false });
  });
});

test.describe("Forgot Password preview (/dev/auth/forgot-password, development only)", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [1440, 768, 390] as const) {
    test(`Default ${width}: preview banner, the real placeholder behaviour`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password", width);
      await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
      await expectCardHeight(page, 334);
    });

    test(`Empty ${width}`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password?state=empty", width);
      await expect(page.getByText(arAuth.validation.emailRequired)).toBeVisible();
      await expectCardHeight(page, 360);
    });

    test(`Invalid email ${width}`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password?state=invalid", width);
      await expect(page.getByText(arAuth.validation.emailInvalid)).toBeVisible();
      await expectCardHeight(page, 360);
    });

    test(`Loading ${width}: Loading label, aria-busy, no second submit`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password?state=loading", width);
      await hydrated(page, "forgot");
      await page.getByRole("button", { name: arAuth.forgot.submit }).click();
      const loading = page.getByRole("button", { name: arAuth.forgot.submitting });
      await expect(loading).toHaveAttribute("aria-busy", "true");
      await expect(loading).toBeDisabled();
      expect(Math.round((await loading.boundingBox())?.height ?? 0)).toBe(52);
      await expect(page.locator("[data-auth-status-banner]")).toHaveCount(0);
      await expectCardHeight(page, 334);
    });

    test(`Failed ${width}: the Failed banner and the retry label`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password?state=failed", width);
      await hydrated(page, "forgot");
      await page.getByRole("button", { name: arAuth.forgot.submit }).click();
      await expect(page.locator("[data-auth-status-banner]")).toHaveText(
        arAuth.errors.failed.forgot,
      );
      await expect(page.getByRole("button", { name: arAuth.common.retry })).toBeEnabled();
      await expectCardHeight(page, 410);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`Email sent ${width}: heading focused, no icon, inactive resend`, async ({ page }) => {
      await open(page, "/dev/auth/forgot-password?state=sent", width);
      await hydrated(page, "forgot");
      await page.getByRole("button", { name: arAuth.forgot.submit }).click();
      const heading = page.getByRole("heading", { level: 1, name: arAuth.forgot.sent.heading });
      await expect(heading).toBeFocused();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("[data-auth-result-icon]")).toHaveCount(0);
      await expect(page.locator("[data-auth-button-link]")).toHaveText(arAuth.forgot.back);
      const resend = page.getByRole("button", { name: arAuth.forgot.sent.resend });
      await expect(resend).toHaveAttribute("aria-disabled", "true");
      await expectCardHeight(page, 225);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("Email sent: resend is focusable by keyboard and does nothing", async ({ page }) => {
    await open(page, "/dev/auth/forgot-password?state=sent", 1440);
    await hydrated(page, "forgot");
    await page.getByRole("button", { name: arAuth.forgot.submit }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-auth-button-link]")).toBeFocused();
    await page.keyboard.press("Tab");
    const resend = page.getByRole("button", { name: arAuth.forgot.sent.resend });
    await expect(resend).toBeFocused();
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    // Playwright treats `aria-disabled` as not enabled (as intended, RC-3); force the click to
    // prove that a pointer activation does nothing either.
    await resend.click({ force: true });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(arAuth.forgot.sent.heading);
    await expect(page.locator("[data-auth-status-banner]")).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test("English preview: the Email sent view reads LTR", async ({ page }) => {
    await open(page, "/en/dev/auth/forgot-password?state=sent", 1440);
    await hydrated(page, "forgot");
    await page.getByRole("button", { name: enAuth.forgot.submit }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(enAuth.forgot.sent.heading);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});

/* ------------------------------------------------------------------------------------------ */
/* Reset Password                                                                              */
/* ------------------------------------------------------------------------------------------ */

function resetFields(page: Page, auth: typeof arAuth = arAuth) {
  return {
    password: page.getByLabel(auth.reset.password, { exact: true }),
    confirm: page.getByLabel(auth.reset.confirm, { exact: true }),
    submit: page.locator('[data-reset-form] button[type="submit"]'),
  };
}

async function ruleStates(page: Page) {
  return page
    .locator("[data-password-rule]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-password-rule")));
}

test.describe("Reset Password (/reset-password, development)", () => {
  test.use({ reducedMotion: "reduce" });

  test("rules, Required, Mismatch with re-check, submit focuses the first invalid field", async ({
    page,
  }) => {
    await open(page, "/reset-password", 1440);
    await hydrated(page, "reset");
    const { password, confirm, submit } = resetFields(page);
    expect(await ruleStates(page)).toEqual(["neutral", "neutral", "neutral"]);

    await submit.click();
    await expect(password).toBeFocused();
    await expect(page.getByText(arAuth.validation.newPasswordRequired)).toBeVisible();
    await expect(page.getByText(arAuth.validation.confirmNewRequired)).toBeVisible();
    await expect(submit).toBeEnabled();
    await expectCardHeight(page, 486);

    await password.fill("abcD");
    expect(await ruleStates(page)).toEqual(["error", "valid", "error"]);
    await password.fill(PASSWORD);
    expect(await ruleStates(page)).toEqual(["valid", "valid", "valid"]);
    await confirm.fill("Secret-12");
    await expect(page.getByText(arAuth.validation.mismatch)).toBeVisible();
    await expectCardHeight(page, 460);
    await confirm.fill(PASSWORD);
    await expect(page.getByText(arAuth.validation.mismatch)).toHaveCount(0);
    await password.fill(`${PASSWORD}4`);
    await expect(page.getByText(arAuth.validation.mismatch)).toBeVisible();
  });

  test("rules stay neutral for unmet rules until the field is blurred", async ({ page }) => {
    await open(page, "/reset-password", 1440);
    await hydrated(page, "reset");
    const { password, confirm } = resetFields(page);
    await password.pressSequentially("abcD");
    expect(await ruleStates(page)).toEqual(["neutral", "valid", "neutral"]);
    await confirm.focus();
    await expect.poll(() => ruleStates(page)).toEqual(["error", "valid", "error"]);
  });

  test("keyboard only: independent toggles never submit; Enter submits; unavailable banner", async ({
    page,
  }) => {
    await open(page, "/reset-password", 1440);
    await hydrated(page, "reset");
    const { password, confirm } = resetFields(page);
    const [newToggle, confirmToggle] = [
      page.getByRole("button", { name: arAuth.password.show }).first(),
      page.getByRole("button", { name: arAuth.password.show }).last(),
    ];
    await password.focus();
    await page.keyboard.type(PASSWORD);
    await page.keyboard.press("Tab");
    await expect(newToggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(password).toHaveAttribute("type", "text");
    await expect(confirm).toHaveAttribute("type", "password");
    await expect(page.locator("[data-auth-status-banner]")).toHaveCount(0);
    await page.keyboard.press("Tab");
    await expect(confirm).toBeFocused();
    await page.keyboard.type(PASSWORD);
    await page.keyboard.press("Tab");
    await expect(confirmToggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(confirm).toHaveAttribute("type", "text");
    await expect(newToggle).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: arAuth.reset.submit })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: arAuth.reset.back })).toBeFocused();
    await confirm.focus();
    await page.keyboard.press("Enter");
    const banner = page.locator("[data-auth-status-banner]");
    await expect(banner).toHaveText(arAuth.errors.unavailable.reset);
    await expect(page.getByRole("button", { name: arAuth.reset.submit })).toBeEnabled();
    await expect(page).toHaveURL(/\/reset-password$/);
    const [bannerBox, passwordBox] = await Promise.all([
      banner.boundingBox(),
      password.boundingBox(),
    ]);
    expect(bannerBox?.y ?? 0).toBeLessThan(passwordBox?.y ?? 0);
  });

  test("no request leaves the page on submit, nothing is stored, no token in the URL", async ({
    page,
  }) => {
    await open(page, "/reset-password", 1440);
    await hydrated(page, "reset");
    const requests: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") requests.push(`${r.method()} ${r.url()}`);
    });
    const { password, confirm, submit } = resetFields(page);
    await password.fill(PASSWORD);
    await confirm.fill(PASSWORD);
    await submit.click();
    await expect(page.locator("[data-auth-status-banner]")).toHaveText(
      arAuth.errors.unavailable.reset,
    );
    expect(requests).toEqual([]);
    const stored = await page.evaluate(() => ({
      local: Object.keys(localStorage).length,
      session: Object.keys(sessionStorage).length,
      cookie: document.cookie.includes("Secret"),
    }));
    expect(stored).toEqual({ local: 0, session: 0, cookie: false });
    expect(page.url()).not.toContain("Secret");
  });

  test("English (LTR): the rules row starts at the inline start (left)", async ({ page }) => {
    await open(page, "/en/reset-password", 1440);
    const offset = await page.locator("[data-auth-card]").evaluate((card) => {
      const first = card.querySelector("[data-password-rule]");
      return Math.round(
        (first?.getBoundingClientRect().left ?? -1) - card.getBoundingClientRect().left,
      );
    });
    expect(offset).toBe(0);
  });
});

test.describe("Reset Password preview (/dev/auth/reset-password, development only)", () => {
  test.use({ reducedMotion: "reduce" });

  const visibility = [
    { state: "default", types: ["password", "password"] },
    { state: "shown-both", types: ["text", "text"] },
    { state: "shown-new", types: ["text", "password"] },
    { state: "shown-confirm", types: ["password", "text"] },
  ] as const;

  for (const width of [1440, 768, 390] as const) {
    for (const { state, types } of visibility) {
      test(`${state} ${width}: field types, card 434`, async ({ page }) => {
        await open(page, `/dev/auth/reset-password?state=${state}`, width);
        await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
        const { password, confirm } = resetFields(page);
        await expect(password).toHaveAttribute("type", types[0]);
        await expect(confirm).toHaveAttribute("type", types[1]);
        await expectCardHeight(page, 434);
      });
    }

    test(`Required ${width}`, async ({ page }) => {
      await open(page, "/dev/auth/reset-password?state=required", width);
      await expect(page.getByText(arAuth.validation.newPasswordRequired)).toBeVisible();
      await expect(page.getByText(arAuth.validation.confirmNewRequired)).toBeVisible();
      expect(await ruleStates(page)).toEqual(["neutral", "neutral", "neutral"]);
      await expectCardHeight(page, 486);
    });

    test(`Mismatch ${width}`, async ({ page }) => {
      await open(page, "/dev/auth/reset-password?state=mismatch", width);
      await expect(page.getByText(arAuth.validation.mismatch)).toBeVisible();
      await expectCardHeight(page, 460);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });

    test(`Loading ${width}`, async ({ page }) => {
      await open(page, "/dev/auth/reset-password?state=loading", width);
      await hydrated(page, "reset");
      await resetFields(page).submit.click();
      const loading = page.getByRole("button", { name: arAuth.reset.submitting });
      await expect(loading).toHaveAttribute("aria-busy", "true");
      await expect(loading).toBeDisabled();
      await expectCardHeight(page, 434);
    });

    test(`Error ${width}: the Error banner and the retry label`, async ({ page }) => {
      await open(page, "/dev/auth/reset-password?state=error", width);
      await hydrated(page, "reset");
      await resetFields(page).submit.click();
      await expect(page.locator("[data-auth-status-banner]")).toHaveText(
        arAuth.errors.failed.reset,
      );
      await expect(page.getByRole("button", { name: arAuth.common.retry })).toBeEnabled();
      await expectCardHeight(page, 510);
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });

    for (const { state, tone, heading, primary, href, footer, height } of [
      {
        state: "invalid-link",
        tone: "danger",
        heading: arAuth.reset.invalidLink.heading,
        primary: arAuth.reset.invalidLink.request,
        href: "/forgot-password",
        footer: true,
        height: 290,
      },
      {
        state: "expired-link",
        tone: "warning",
        heading: arAuth.reset.expiredLink.heading,
        primary: arAuth.reset.expiredLink.request,
        href: "/forgot-password",
        footer: true,
        height: 290,
      },
      {
        state: "updated",
        tone: "success",
        heading: arAuth.reset.updated.heading,
        primary: arAuth.reset.back,
        href: "/login",
        footer: false,
        height: 237,
      },
    ] as const) {
      test(`${state} ${width}: ${tone} view, heading focused`, async ({ page }) => {
        await open(page, `/dev/auth/reset-password?state=${state}`, width);
        await hydrated(page, "reset");
        await resetFields(page).submit.click();
        await expect(page.getByRole("heading", { level: 1, name: heading })).toBeFocused();
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("[data-auth-result-icon]")).toHaveAttribute(
          "data-auth-result-icon",
          tone,
        );
        const button = page.locator("[data-auth-button-link]");
        await expect(button).toHaveText(primary);
        await expect(button).toHaveAttribute("href", href);
        await expect(page.locator("[data-auth-result] a")).toHaveCount(footer ? 2 : 1);
        await expectCardHeight(page, height, { allowWrapAt480: state === "invalid-link" });
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }

  test("unknown state falls back to the real placeholder behaviour", async ({ page }) => {
    await open(page, "/dev/auth/reset-password?state=bogus", 1440);
    await expect(page.locator("[data-reset-preview]")).toHaveAttribute(
      "data-reset-preview",
      "default",
    );
  });
});
