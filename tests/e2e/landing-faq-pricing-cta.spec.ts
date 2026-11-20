import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./test";
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };

/*
 * Phase 07 Increment 5: FAQ (P07-D18), Pricing (development only, P07-D4 / P07-D19), Final CTA.
 * Figma FAQ `124:94` / `200:629` / `200:778`, Pricing `131:177` / `200:640` / `200:789`, Final CTA
 * `126:104` / `200:651` / `200:800`. The E2E server runs outside production, so Pricing renders
 * here; its production gate is covered by the unit tests (isPlaceholderPricingVisible).
 *
 * Known differences (documented): Figma line boxes are whole pixels (question 34 vs 33.6), so FAQ
 * items are ~0.8 px shorter; the shared Inter/Cairo font stack makes some Arabic lines wrap one
 * line more than Figma (Mobile FAQ answer 01; Plus and Pro descriptions in narrow cards).
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", path: "/", m: arLanding },
  { locale: "en", dir: "ltr", path: "/en", m: enLanding },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("not rendered");
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}

function near(actual: number, expected: number, label: string, tolerance = 1) {
  expect(Math.abs(actual - expected), `${label}: ${actual} ≈ ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
}

async function open(page: Page, path: string, width: number, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const faq = (page: Page) => page.locator("section#faq");
const triggers = (page: Page) => faq(page).getByRole("button");
const states = (page: Page) =>
  triggers(page).evaluateAll((buttons) => buttons.map((b) => b.getAttribute("aria-expanded")));
const plans = (page: Page) => page.locator("section#pricing [data-plan]");
const docTop = (locator: Locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

for (const { locale, dir, path, m } of LOCALES) {
  test.describe(`Landing FAQ, Pricing and Final CTA (${locale})`, () => {
    test.use({ reducedMotion: "reduce" });

    test("FAQ (P07-D18): item 01 open on load; one at a time; all may be collapsed", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(faq(page).getByRole("heading", { level: 2 })).toHaveText(m.faq.heading);
      const items = Object.values(m.faq.items);
      await expect(faq(page).getByRole("heading", { level: 3 })).toHaveText(
        items.map((item) => item.question),
      );
      expect(await states(page)).toEqual(["true", "false", "false", "false", "false", "false"]);
      await expect(faq(page).getByRole("region", { name: items[0]?.question })).toHaveText(
        items[0]?.answer ?? "",
      );
      await triggers(page).nth(3).click();
      expect(await states(page)).toEqual(["false", "false", "false", "true", "false", "false"]);
      await expect(faq(page).getByRole("region", { name: items[3]?.question })).toBeVisible();
      await expect(faq(page).getByText(items[0]?.answer ?? "")).toBeHidden();
      await triggers(page).nth(3).click();
      expect((await states(page)).every((state) => state === "false")).toBe(true);
    });

    test("FAQ keyboard: Tab order, Enter / Space, visible focus ring, no trap", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const first = triggers(page).nth(0);
      await first.focus();
      expect(await first.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
      await page.keyboard.press("Tab");
      await expect(triggers(page).nth(1)).toBeFocused();
      await page.keyboard.press("Enter");
      expect((await states(page))[1]).toBe("true");
      await page.keyboard.press("Space");
      expect((await states(page))[1]).toBe("false");
      // Tab walks past the last trigger into the next section (no trap).
      await triggers(page).nth(5).focus();
      await page.keyboard.press("Tab");
      const inFaq = await page.evaluate(() => !!document.activeElement?.closest("#faq"));
      expect(inFaq).toBe(false);
    });

    test("FAQ reduced motion: the answer changes instantly", async ({ page }) => {
      await open(page, path, 1440);
      const panel = faq(page).locator("[data-faq-panel]").first();
      // transition-property: none — nothing animates (the duration value is inert).
      expect(await panel.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
    });

    test("Pricing (dev only): three plans Starter → Plus → Pro, placeholders, Register links", async ({
      page,
    }) => {
      await open(page, path, 1440);
      await expect(plans(page)).toHaveCount(3);
      const plan = m.pricing.plans;
      await expect(page.locator("section#pricing").getByRole("heading", { level: 3 })).toHaveText([
        plan.starter.name,
        plan.plus.name,
        plan.pro.name,
      ]);
      await expect(page.locator("[data-plan-badge]")).toHaveText(m.pricing.badge);
      for (const card of await plans(page).all()) {
        await expect(card.getByText(m.pricing.price, { exact: true })).toBeVisible();
        await expect(card.getByText(m.pricing.feature)).toHaveCount(4);
        expect(await card.textContent()).not.toMatch(/[0-9٠-٩]/);
        await expect(card.locator("a")).toHaveAttribute(
          "href",
          locale === "ar" ? "/register" : "/en/register",
        );
      }
      // Not offered anywhere else: no navigation link, no structured offer data.
      await expect(
        page.locator('header a[href="#pricing"], footer a[href="#pricing"]'),
      ).toHaveCount(0);
      expect(await page.locator('script[type="application/ld+json"]').count()).toBe(0);
    });

    test("Final CTA: verbatim, primary at the inline start → Register, outline → #features", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const cta = page.locator("section#cta");
      await expect(cta.getByRole("heading", { level: 2 })).toHaveText(m.cta.heading);
      const primary = await box(cta.locator("[data-cta-action=primary]"));
      const secondary = await box(cta.locator("[data-cta-action=secondary]"));
      expect(dir === "rtl" ? primary.x > secondary.x : primary.x < secondary.x).toBe(true);
      await expect(cta.locator("[data-cta-action=primary]")).toHaveAttribute(
        "href",
        locale === "ar" ? "/register" : "/en/register",
      );
      await expect(cta.locator("[data-cta-action=secondary]")).toHaveAttribute("href", "#features");
    });

    test("Desktop 1440: Figma geometry (FAQ 989, plans 3 × 384, CTA panel 1200 × 366)", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const accordion = await box(page.locator("[data-faq-accordion]"));
      near(accordion.w, 900, "accordion width");
      near(accordion.x, 270, "accordion x");
      for (let index = 0; index < 3; index += 1) {
        near((await box(plans(page).nth(index))).w, 384, `plan ${index + 1} width`);
      }
      const first = await box(plans(page).nth(0));
      const second = await box(plans(page).nth(1));
      expect(dir === "rtl" ? first.x > second.x : first.x < second.x).toBe(true);
      const badge = await box(page.locator("[data-plan-badge]"));
      near(badge.x + badge.w / 2, second.x + second.w / 2, "badge centred", 1);
      near(badge.y, second.y - 14, "badge on the top edge", 1);
      const panel = await box(page.locator("[data-cta-panel]"));
      near(panel.w, 1200, "CTA panel width");
      if (locale === "ar") {
        near(await docTop(faq(page)), 5215, "FAQ y", 1.5);
        near((await box(faq(page))).h, 989, "FAQ height");
        near((await box(faq(page).locator("[data-faq-item]").nth(0))).h, 152, "item 01", 1);
        near((await box(faq(page).locator("[data-faq-item]").nth(1))).h, 76, "item 02", 1);
        near(await docTop(page.locator("section#pricing")), 6246, "pricing y", 1.5);
        near(panel.h, 366, "CTA panel height");
        const footerTop = await docTop(page.locator("footer"));
        near(
          footerTop - (panel.y + panel.h + (await page.evaluate(() => window.scrollY))),
          86,
          "CTA → footer",
        );
      }
    });

    test("Tablet 768: FAQ 704, plans 520 in one column, CTA panel 704 × 302", async ({ page }) => {
      await open(page, path, 768);
      near((await box(page.locator("[data-faq-accordion]"))).w, 704, "accordion width");
      for (let index = 0; index < 3; index += 1) {
        const card = await box(plans(page).nth(index));
        near(card.w, 520, `plan ${index + 1} width`);
        near(card.x, 124, `plan ${index + 1} x`);
      }
      const panel = await box(page.locator("[data-cta-panel]"));
      expect(panel).toMatchObject({ x: 32, w: 704 });
      if (locale === "ar") {
        near((await box(faq(page))).h, 870, "FAQ height", 5);
        near((await box(page.locator("section#pricing"))).h, 1985, "pricing height", 2);
        near(panel.h, 302, "CTA panel height");
      }
    });

    test("Mobile 390: FAQ 350, plans 350, CTA actions stacked (primary first)", async ({
      page,
    }) => {
      await open(page, path, 390);
      expect(await box(page.locator("[data-faq-accordion]"))).toMatchObject({ x: 20, w: 350 });
      for (let index = 0; index < 3; index += 1) {
        expect(await box(plans(page).nth(index))).toMatchObject({ x: 20, w: 350 });
      }
      const primary = await box(page.locator("[data-cta-action=primary]"));
      const secondary = await box(page.locator("[data-cta-action=secondary]"));
      expect(primary.y).toBeLessThan(secondary.y);
      near(primary.w, 308, "primary full width");
      if (locale === "ar") {
        near((await box(faq(page).locator("[data-faq-item]").nth(1))).h, 110, "item 02", 1.5);
        near((await box(page.locator("section#pricing"))).h, 2019, "pricing height", 2);
        near((await box(page.locator("[data-cta-panel]"))).h, 361, "CTA panel height", 2);
      }
    });

    for (const width of [320, 390, 768, 1024, 1280, 1440]) {
      test(`${width}px: no overflow or clipped text in FAQ, Pricing, CTA`, async ({ page }) => {
        await open(page, path, width);
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const clipped = [
            ...document.querySelectorAll<HTMLElement>(
              "#faq h3, #faq [data-faq-panel] p, #pricing [data-plan] *, #cta h2, #cta p, #cta a",
            ),
          ]
            .filter(
              (el) => el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden",
            )
            .filter((el) => el.scrollWidth > el.clientWidth + 1)
            .map((el) => el.textContent?.slice(0, 20));
          return { overflow: root.scrollWidth - root.clientWidth, clipped };
        });
        expect(result.overflow).toBe(0);
        expect(result.clipped).toEqual([]);
      });
    }

    test("200% zoom (1440 × 900 → 720 CSS px): no overflow; the accordion still works", async ({
      page,
    }) => {
      await open(page, path, 720, 450);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
      await triggers(page).nth(2).click();
      expect((await states(page))[2]).toBe("true");
    });

    for (const width of [390, 768, 1440]) {
      test(`axe ${width}px (WCAG 2.2 AA), default and changed accordion state`, async ({
        page,
      }) => {
        await open(page, path, width);
        const scan = () =>
          new AxeBuilder({ page })
            .include("#faq")
            .include("#pricing")
            .include("#cta")
            .withTags(WCAG_TAGS)
            .analyze();
        expect((await scan()).violations).toEqual([]);
        await triggers(page).nth(4).click();
        expect((await scan()).violations).toEqual([]);
      });
    }
  });
}
