import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import arAuth from "../../src/i18n/messages/ar/authentication.json" with { type: "json" };
import { expect, test, waitForHydration } from "./test";

/*
 * Phase 08 Increment 1: the Authentication foundation in the development-only preview
 * (`/dev/auth`, D-08-4). Checks the shared layout per breakpoint (ADR-004: Mobile < 720 ≤ Tablet
 * < 1280 ≤ Desktop), DOM order equal to visual order (D-08-9), no horizontal overflow, axe (WCAG
 * 2.2 AA, ar and en), the password toggle, the preview banner, and the Figma geometry of the card,
 * field and button. Production returns 404 for this route (tests/e2e-production).
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** The visible top-level blocks of the layout, in DOM order. */
async function visibleOrder(page: Page) {
  return page.locator("[data-auth-layout] > *").evaluateAll((els) =>
    els
      .filter((el) => getComputedStyle(el).display !== "none")
      .map((el) => {
        const r = el.getBoundingClientRect();
        const kind = el.hasAttribute("data-auth-form-column")
          ? "form"
          : el.hasAttribute("data-auth-marketing")
            ? "panel"
            : "logo";
        return {
          kind,
          top: Math.round(r.top),
          left: Math.round(r.left),
          right: Math.round(r.right),
        };
      }),
  );
}

test.describe("Auth foundation preview (/dev/auth)", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows the development-preview banner and one h1", async ({ page }) => {
    await open(page, "/dev/auth", 1440);
    await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(arAuth.login.heading);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("Desktop 1440: form column on the inline start (right in RTL), panel 520 at the end", async ({
    page,
  }) => {
    await open(page, "/dev/auth", 1440);
    const order = await visibleOrder(page);
    expect(order.map((o) => o.kind)).toEqual(["form", "panel"]);
    const [form, panel] = order;
    expect(form && panel && form.left > panel.right).toBe(true);
    const panelBox = await page.locator("[data-auth-marketing]:visible > div").last().boundingBox();
    expect(Math.round(panelBox?.width ?? 0)).toBe(520);
    const card = await page.locator("[data-auth-card]").boundingBox();
    expect(Math.round(card?.width ?? 0)).toBe(480);
    // Figma gap between the form column and the panel: 96.
    expect(form && panel ? form.left - panel.right : 0).toBe(96);
  });

  test("Tablet 768: logo, panel, then the form (stacked)", async ({ page }) => {
    await open(page, "/dev/auth", 768);
    const order = await visibleOrder(page);
    expect(order.map((o) => o.kind)).toEqual(["logo", "panel", "form"]);
    expect(order.map((o) => o.top)).toEqual([...order.map((o) => o.top)].sort((a, b) => a - b));
    const panel = await page.locator("[data-auth-marketing]:visible > div").last().boundingBox();
    expect(Math.round(panel?.width ?? 0)).toBe(672);
  });

  test("Mobile 390: logo, the form, then the panel (stacked)", async ({ page }) => {
    await open(page, "/dev/auth", 390);
    const order = await visibleOrder(page);
    expect(order.map((o) => o.kind)).toEqual(["logo", "form", "panel"]);
    expect(order.map((o) => o.top)).toEqual([...order.map((o) => o.top)].sort((a, b) => a - b));
    const card = await page.locator("[data-auth-card]").boundingBox();
    expect(Math.round(card?.width ?? 0)).toBe(350);
  });

  for (const width of [1440, 768, 390, 320] as const) {
    test(`no horizontal overflow at ${width}`, async ({ page }) => {
      await open(page, "/dev/auth", width);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });
  }

  test("Figma geometry: field 52, button 52, radius 12", async ({ page }) => {
    await open(page, "/dev/auth", 1440);
    const field = page.locator("[data-auth-field] input").first().locator("..");
    expect(Math.round((await field.boundingBox())?.height ?? 0)).toBe(52);
    expect(await field.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("12px");
    const button = page.getByRole("button", { name: arAuth.login.submit }).first();
    expect(Math.round((await button.boundingBox())?.height ?? 0)).toBe(52);
  });

  test("the password toggle shows and hides the value with the keyboard", async ({ page }) => {
    await open(page, "/dev/auth", 1440);
    const toggle = page.getByRole("button", { name: arAuth.password.show }).first();
    await waitForHydration(page, toggle);
    const input = page.getByLabel(arAuth.login.password).first();
    await expect(input).toHaveAttribute("type", "password");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(input).toHaveAttribute("type", "text");
  });

  test("result view preview (labelled), one h1", async ({ page }) => {
    await open(page, "/dev/auth?family=register&view=result", 1440);
    await expect(page.locator("[data-auth-preview-banner]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      arAuth.register.success.heading,
    );
  });

  for (const { name, path } of [
    { name: "ar", path: "/dev/auth" },
    { name: "en", path: "/en/dev/auth" },
    { name: "ar register", path: "/dev/auth?family=register" },
    { name: "ar recovery", path: "/dev/auth?family=recovery" },
  ] as const) {
    for (const width of [1440, 768, 390] as const) {
      test(`axe ${name} ${width}px (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, path, width);
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      });
    }
  }
});
