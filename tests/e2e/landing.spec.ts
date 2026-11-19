import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arCommon from "../../src/i18n/messages/ar/common.json" with { type: "json" };
import arLanding from "../../src/i18n/messages/ar/landing.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enCommon from "../../src/i18n/messages/en/common.json" with { type: "json" };
import enLanding from "../../src/i18n/messages/en/landing.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/*
 * Phase 07 Increment 1: Landing foundation (header, footer, menu, section boundaries,
 * metadata). Figma: design-values §16. The E2E server is `next dev` (NEXT_PUBLIC_APP_ENV unset
 * = development), so the English Landing (P07-D1) and the Pricing boundary (P07-D4) render;
 * their production gates are unit-tested.
 */

const LOCALES = [
  {
    locale: "ar",
    dir: "rtl",
    path: "/",
    other: "/en",
    m: arLanding,
    shell: arShell,
    brand: arCommon.brand.name,
  },
  {
    locale: "en",
    dir: "ltr",
    path: "/en",
    other: "/",
    m: enLanding,
    shell: enShell,
    brand: enCommon.brand.name,
  },
] as const;

const SECTION_IDS = [
  "top",
  "showcase",
  "features",
  "how-it-works",
  "use-cases",
  "faq",
  "pricing",
  "cta",
];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function open(page: Page, path: string, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("not rendered");
  return {
    x: Math.round(b.x),
    y: Math.round(b.y),
    w: Math.round(b.width),
    h: Math.round(b.height),
  };
}

for (const { locale, dir, path, other, m, shell, brand } of LOCALES) {
  const nav = (page: Page) => page.getByRole("navigation", { name: shell.mainNavigation });
  const menuButton = (page: Page) => page.getByRole("button", { name: shell.openMenu });

  test.describe(`Landing foundation (${locale})`, () => {
    test("structure: lang/dir, one h1, one main, sections in the approved order, metadata", async ({
      page,
    }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(m.hero.heading);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveAttribute("data-route-key", "landing");
      const ids = await page.locator("main > section").evaluateAll((els) => els.map((e) => e.id));
      expect(ids).toEqual(SECTION_IDS);
      await expect(page).toHaveTitle(brand);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        m.hero.description,
      );
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", brand);
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", brand);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
        "content",
        m.hero.description,
      );
      // No OG image or URL is invented (no approved asset, no production domain yet).
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    });

    test("Desktop 1440: floating bar geometry, verbatim links, login and language", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const bar = page.locator("[data-landing-bar=desktop]");
      await expect(bar).toBeVisible();
      await expect(page.locator("[data-landing-bar=compact]")).toBeHidden();
      expect(await box(bar)).toEqual({ x: 40, y: 18, w: 1361, h: 67 });
      const style = await bar.evaluate((el) => {
        const s = getComputedStyle(el);
        return { border: s.borderTopColor, radius: s.borderTopLeftRadius, blur: s.backdropFilter };
      });
      expect(style).toEqual({ border: "rgb(54, 55, 57)", radius: "16px", blur: "blur(48px)" });
      const links = nav(page).getByRole("link");
      await expect(links).toHaveText([m.nav.home, m.nav.features, m.nav.howItWorks, m.nav.faq]);
      // Verbatim, including the navigation spacing (P07-D11).
      expect(await links.nth(2).textContent()).toBe(m.nav.howItWorks);
      const font = await links.first().evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.fontSize, s.fontWeight, s.lineHeight];
      });
      expect(font).toEqual(["20px", "400", "28px"]); // UI/Navigation, weight measured (§16.5)
      const login = bar.locator("[data-landing-action=login]");
      // Figma: 145 × 46 with the Arabic label; the button hugs its label in English.
      expect(await box(login)).toMatchObject(locale === "ar" ? { w: 145, h: 46 } : { h: 46 });
      await expect(login).toHaveAttribute("href", locale === "ar" ? "/login" : "/en/login");
      const language = bar.locator("[data-landing-action=language]");
      expect(await box(language)).toMatchObject({ w: 38, h: 45 });
      const brandBox = await box(bar.locator("[data-landing-brand]"));
      const loginBox = await box(login);
      // RTL: actions at the right, logo at the left; LTR mirrors it.
      if (dir === "rtl") expect(brandBox.x).toBeLessThan(loginBox.x);
      else expect(brandBox.x).toBeGreaterThan(loginBox.x);
    });

    test("Tablet 768 and 1024: compact bar, menu + login + language, logo at the end", async ({
      page,
    }) => {
      for (const width of [768, 1024]) {
        await open(page, path, width);
        const bar = page.locator("[data-landing-bar=compact]");
        await expect(bar).toBeVisible();
        await expect(page.locator("[data-landing-bar=desktop]")).toBeHidden();
        expect((await box(bar)).h).toBe(78);
        expect(await box(menuButton(page))).toMatchObject({ w: 46, h: 42 });
        await expect(bar.locator("[data-landing-action=login]")).toBeVisible();
        await expect(bar.locator("[data-landing-action=language]")).toBeVisible();
        const brandBox = await box(bar.locator("[data-landing-brand]"));
        const menuBox = await box(menuButton(page));
        if (dir === "rtl") expect(brandBox.x).toBeLessThan(menuBox.x);
        else expect(brandBox.x).toBeGreaterThan(menuBox.x);
        expect(brandBox.h).toBe(39);
      }
    });

    test("Mobile 390: 70 high, logo at the inline start, menu at the end, actions in the menu", async ({
      page,
    }) => {
      await open(page, path, 390);
      const bar = page.locator("[data-landing-bar=compact]");
      expect((await box(bar)).h).toBe(70);
      await expect(bar.locator("[data-landing-action=login]")).toBeHidden();
      const brandBox = await box(bar.locator("[data-landing-brand]"));
      const menuBox = await box(menuButton(page));
      if (dir === "rtl") {
        expect(brandBox.x + brandBox.w).toBe(370); // padding 20 at the inline start (right)
        expect(menuBox.x).toBe(20);
      } else {
        expect(brandBox.x).toBe(20);
        expect(menuBox.x + menuBox.w).toBe(370);
      }
    });

    test("menu: opens the sheet, Esc closes and returns focus, a link closes it and scrolls", async ({
      page,
    }) => {
      await open(page, path, 390, 700);
      await waitForHydration(page, menuButton(page));
      const button = menuButton(page);
      await button.click();
      const sheet = page.getByRole("dialog", { name: shell.drawerTitle });
      await expect(sheet).toBeVisible();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const sheetNav = sheet.getByRole("navigation", { name: shell.mainNavigation });
      await expect(sheetNav.getByRole("link")).toHaveText([
        m.nav.home,
        m.nav.features,
        m.nav.howItWorks,
        m.nav.faq,
        m.nav.login,
        locale === "ar" ? "EN English" : "AR العربية",
      ]);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(button).toBeFocused();

      await button.click();
      await expect(sheet).toBeVisible();
      await sheet.getByRole("link", { name: m.nav.faq }).click();
      await expect(sheet).toBeHidden();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect.poll(() => page.evaluate(() => location.hash)).toBe("#faq");
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    });

    test("menu by keyboard: Enter opens, focus stays inside, Esc closes", async ({ page }) => {
      await open(page, path, 390);
      await waitForHydration(page, menuButton(page));
      await menuButton(page).focus();
      await page.keyboard.press("Enter");
      const sheet = page.getByRole("dialog", { name: shell.drawerTitle });
      await expect(sheet).toBeVisible();
      // Native modal dialog: Tab and Shift+Tab never reach the page behind (focus may pass
      // through the browser UI, reported as body), as in the shared Sheet contract.
      let inside = 0;
      for (const key of [...Array<string>(6).fill("Tab"), ...Array<string>(6).fill("Shift+Tab")]) {
        await page.keyboard.press(key);
        const where = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return "body";
          return document.querySelector("dialog[open]")?.contains(active) ? "in" : "OUTSIDE";
        });
        expect(where, key).not.toBe("OUTSIDE");
        if (where === "in") inside += 1;
      }
      expect(inside).toBeGreaterThanOrEqual(8);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(menuButton(page)).toBeFocused();
    });

    test("language switch keeps the Landing and flips the direction", async ({ page }) => {
      await open(page, path, 1440);
      await waitForHydration(
        page,
        page.locator("[data-landing-bar=desktop] [data-landing-action=language]"),
      );
      await page.locator("[data-landing-bar=desktop] [data-landing-action=language]").click();
      await expect(page).toHaveURL((url) => url.pathname === other);
      await expect(page.locator("html")).toHaveAttribute("dir", dir === "rtl" ? "ltr" : "rtl");
      await expect(page.getByRole("main")).toHaveAttribute("data-route-key", "landing");
    });

    test("footer: anchors, Auth links, non-interactive legal text, verbatim copyright", async ({
      page,
    }) => {
      await open(page, path, 1440);
      const footer = page.locator("footer");
      const platform = footer.getByRole("navigation", { name: m.footer.platformTitle });
      await expect(platform.getByRole("link")).toHaveText([
        m.footer.home,
        m.footer.features,
        m.footer.howItWorks,
        m.footer.faq,
      ]);
      const account = footer.getByRole("navigation", { name: m.footer.accountTitle });
      await expect(account.getByRole("link")).toHaveText([m.footer.login, m.footer.register]);
      const legal = footer.locator("[data-landing-legal]");
      await expect(legal.locator("a, button")).toHaveCount(0);
      await expect(legal).toContainText(m.footer.terms);
      await expect(legal).toContainText(m.footer.privacy);
      await expect(footer.getByText(m.footer.copyright)).toHaveAttribute("dir", "ltr");
      // Desktop: the footer content is 1200 wide (x 120 at 1440).
      expect(await box(footer.locator(":scope > div"))).toMatchObject({ x: 120, w: 1200 });
    });

    test("anchors: every header and footer link target exists; a click moves to it", async ({
      page,
    }) => {
      await open(page, path, 1440);
      for (const id of ["top", "features", "how-it-works", "faq"]) {
        await expect(page.locator(`main > section#${id}`)).toHaveCount(1);
      }
      await nav(page).getByRole("link", { name: m.nav.faq }).click();
      await expect.poll(() => page.evaluate(() => location.hash)).toBe("#faq");
    });

    test("keyboard: the skip link comes first and moves focus to main", async ({ page }) => {
      await open(page, path, 1440);
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: shell.skipToContent });
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
    });

    for (const width of [320, 390, 768, 1024, 1440]) {
      test(`${width}px: no horizontal overflow`, async ({ page }) => {
        await open(page, path, width);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    for (const width of [1440, 768, 390]) {
      test(`axe ${width}px (WCAG 2.2 AA)`, async ({ page }) => {
        await open(page, path, width);
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .exclude("nextjs-portal")
          .analyze();
        expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual(
          [],
        );
      });
    }

    test("axe 390px with the menu open", async ({ page }) => {
      await open(page, path, 390);
      await waitForHydration(page, menuButton(page));
      await menuButton(page).click();
      await expect(page.getByRole("dialog", { name: shell.drawerTitle })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .exclude("nextjs-portal")
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });
}
