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

  // Owner finalization (2026-11-23): the ADR-004 contract at 390, 720, 768, 1024, 1280 and 1440.
  // Tablet (720–1279) is fluid between the 768 frame's 48 px side margins; Desktop (≥ 1280) is the
  // 1096 px two-column row (480 form + 96 gap + 520 panel), centred.
  for (const { width, order, panel, card } of [
    { width: 390, order: ["logo", "form", "panel"], panel: 350, card: 350 },
    { width: 720, order: ["logo", "panel", "form"], panel: 624, card: 480 },
    { width: 768, order: ["logo", "panel", "form"], panel: 672, card: 480 },
    { width: 1024, order: ["logo", "panel", "form"], panel: 928, card: 480 },
    { width: 1280, order: ["form", "panel"], panel: 520, card: 480 },
    { width: 1440, order: ["form", "panel"], panel: 520, card: 480 },
  ] as const) {
    test(`breakpoint ${width}: DOM order = visual order, panel ${panel}, card ${card}`, async ({
      page,
    }) => {
      await open(page, "/dev/auth", width);
      const blocks = await visibleOrder(page);
      expect(blocks.map((o) => o.kind)).toEqual(order);
      const panelBox = await page
        .locator("[data-auth-marketing]:visible > div")
        .last()
        .boundingBox();
      expect(Math.round(panelBox?.width ?? 0)).toBe(panel);
      const cardBox = await page.locator("[data-auth-card]").boundingBox();
      expect(Math.round(cardBox?.width ?? 0)).toBe(card);
      if (width >= 1280) {
        // Desktop: one row, the form on the inline start (right in RTL), 96 from the panel, and
        // the row centred.
        const [form, side] = blocks;
        expect(form && side ? form.left - side.right : 0).toBe(96);
        expect(side?.left).toBe((width - 1096) / 2);
      } else {
        // Stacked: reading order runs top to bottom.
        expect(blocks.map((o) => o.top)).toEqual(
          [...blocks.map((o) => o.top)].sort((a, b) => a - b),
        );
      }
    });
  }

  for (const width of [1440, 768, 390, 320, 720, 1024, 1280] as const) {
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

  test("toggle pattern: the accessible name stays constant, aria-pressed carries the state", async ({
    page,
  }) => {
    await open(page, "/dev/auth", 1440);
    const toggle = page.getByRole("button", { name: arAuth.password.show, exact: true }).first();
    await waitForHydration(page, toggle);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAccessibleName(arAuth.password.show);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(toggle).toHaveAccessibleName(arAuth.password.show);
  });

  test.describe("PasswordRule (Auth / Validation Rule, 191:72)", () => {
    const COLOURS = {
      neutral: "rgb(141, 141, 143)", // text-muted-readable
      valid: "rgb(89, 212, 153)", // accent-success-green
      error: "rgb(255, 99, 99)", // accent-coral-pulse
    } as const;

    async function rules(page: Page) {
      const list = page.locator("[data-password-rules]");
      const id = await list.getAttribute("id");
      const input = page.locator(`input[aria-describedby="${id}"]`);
      await waitForHydration(page, input);
      return { list, input };
    }

    async function states(page: Page) {
      return page
        .locator("[data-password-rules] > li")
        .evaluateAll((els) =>
          els.map((el) => [el.getAttribute("data-password-rule"), getComputedStyle(el).color]),
        );
    }

    test("Figma geometry at 1440 and 390: dot 6 × 6, gap 6, rule gap 16, 12 / 18", async ({
      page,
    }) => {
      for (const width of [1440, 390]) {
        await open(page, "/dev/auth", width);
        const geometry = await page.locator("[data-password-rules]").evaluate((ul) => {
          const items = [...ul.querySelectorAll(":scope > li")];
          const box = (el: Element | null | undefined) => el?.getBoundingClientRect();
          const first = items[0];
          const marker = box(first?.querySelector("[aria-hidden]"));
          const label = box(first?.querySelector(":scope > span:nth-child(2)"));
          const dot = box(first?.querySelector("[data-password-rule-dot]"));
          const [a, b] = [box(items[0]), box(items[1])];
          return {
            dot: [dot?.width, dot?.height],
            markerGap: marker && label ? Math.round(marker.left - label.right) : null,
            ruleGap: a && b ? Math.round(a.left - b.right) : null,
            font: first
              ? `${getComputedStyle(first).fontSize}/${getComputedStyle(first).lineHeight}`
              : "",
            firstRuleRightmost: a && b ? a.right > b.right : false,
          };
        });
        // RTL: the marker is on the inline start (right) of the label; the first rule is rightmost.
        expect(geometry).toEqual({
          dot: [6, 6],
          markerGap: 6,
          ruleGap: 16,
          font: "12px/18px",
          firstRuleRightmost: true,
        });
      }
    });

    test("Neutral → Error → Valid while typing; colours, shapes and status words", async ({
      page,
    }) => {
      await open(page, "/dev/auth", 1440);
      const { list, input } = await rules(page);
      await expect(list).toHaveAttribute("aria-live", "polite");
      expect(await states(page)).toEqual([
        ["neutral", COLOURS.neutral],
        ["neutral", COLOURS.neutral],
        ["neutral", COLOURS.neutral],
      ]);

      await input.fill("abcdefg1");
      expect(await states(page)).toEqual([
        ["valid", COLOURS.valid],
        ["error", COLOURS.error],
        ["valid", COLOURS.valid],
      ]);
      // Never by colour alone: a check for met, an x for not met, and the status word in text.
      expect(
        await list
          .locator("li [aria-hidden] svg")
          .evaluateAll((els) => els.map((el) => el.getAttribute("data-icon"))),
      ).toEqual(["check", "x", "check"]);
      await expect(list.locator("li").nth(1)).toHaveText(
        `${arAuth.rules.case} ${arAuth.status.notMet}`,
      );

      await input.fill("Abcdefg1");
      expect((await states(page)).map(([state]) => state)).toEqual(["valid", "valid", "valid"]);
      await expect(list.locator("li").first()).toContainText(arAuth.status.met);
    });

    for (const width of [1440, 390] as const) {
      test(`axe with Error and Valid rules at ${width}px (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, "/dev/auth", width);
        const { input } = await rules(page);
        await input.fill("abcdefg1");
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      });
    }
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
