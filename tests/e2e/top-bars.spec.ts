import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arNav from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enNav from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/**
 * Phase 05 increment 2: the Top Bar controls (search, notifications, appearance, language, user
 * menu), the Desktop/Tablet Top Bar and the Mobile Top Bar. Figma: Desktop `Top Bar` `2211:170`,
 * Tablet `2224:399`, Mobile `Top Bar / Mobile` `2238:923`.
 *
 * Not covered yet (the rest of the shell does not exist): the bottom navigation, the More sheet
 * and the full ADR-004 matrix (zoom, larger root fonts, safe areas).
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", shell: arShell, nav: arNav },
  { locale: "en", dir: "ltr", prefix: "/en", shell: enShell, nav: enNav },
] as const;
const SKY: [number, number, number] = [99, 161, 255];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const topBar = (page: Page) => page.locator('[data-shell="top-bar"]');
const mobileBar = (page: Page) => page.locator('[data-shell="mobile-top-bar"]');

async function load(page: Page, path: string, hydrated: Locator): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, hydrated);
}

/** A computed CSS colour composited over black (Chromium paints it). */
async function onBlack(locator: Locator, property: "backgroundColor" | "borderTopColor" | "color") {
  return locator.evaluate((el, prop) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(el)[prop];
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, property);
}

function expectTint(actual: number[], rgb: [number, number, number], alpha: number, label: string) {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha), label).toBeLessThanOrEqual(1.5);
  });
}

async function rect(locator: Locator) {
  const r = await locator.boundingBox();
  expect(r).not.toBeNull();
  return r ?? { x: 0, y: 0, width: 0, height: 0 };
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .exclude("nextjs-portal")
    .analyze();
  return results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }));
}

for (const { locale, dir, prefix, shell, nav } of LOCALES) {
  test.describe(`Desktop and Tablet Top Bar (${locale})`, () => {
    const bar = topBar;
    const search = (page: Page) => bar(page).getByRole("button", { name: shell.search });

    test("1440: Figma geometry and order; one banner; 24 above the content", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, `${prefix}/dashboard`, search(page));
      await expect(bar(page)).toBeVisible();
      await expect(mobileBar(page)).toBeHidden();
      await expect(page.getByRole("banner")).toHaveCount(1);

      const header = await rect(bar(page));
      expect(header.height).toBe(56);
      const main = await rect(page.getByRole("main"));
      expect(main.y - (header.y + header.height)).toBe(24);

      // Search: 440 × 44 at the inline start; text = Figma placeholder; icon 18.
      const s = await rect(search(page));
      expect([s.width, s.height]).toEqual([440, 44]);
      if (dir === "rtl") expect(s.x + s.width).toBe(header.x + header.width);
      else expect(s.x).toBe(header.x);
      await expect(search(page).locator(".truncate")).toHaveText(shell.searchPlaceholder);
      // WCAG 2.5.3: the name contains the visible text.
      await expect(search(page)).toHaveAccessibleName(
        `${shell.search}: ${shell.searchPlaceholder}`,
      );
      expect((await rect(search(page).locator("svg"))).width).toBe(18);
      expectTint(await onBlack(search(page), "backgroundColor"), [255, 255, 255], 0.04, "fill");
      expectTint(await onBlack(search(page), "borderTopColor"), SKY, 0.12, "border");
      expect(await onBlack(search(page), "color")).toEqual([156, 156, 157]);

      // Controls, from the inline start: notifications, appearance, language, divider, user.
      const bell = bar(page).getByRole("button", { name: shell.notifications });
      const moon = bar(page).getByRole("button", { name: shell.appearance });
      const languages = bar(page).getByRole("group", { name: shell.language });
      const user = bar(page).getByRole("button", { name: shell.accountMenu });
      const boxes = [await rect(bell), await rect(moon), await rect(languages), await rect(user)];
      expect(boxes.map((b) => [b.width, b.height])).toEqual([
        [40, 40],
        [40, 40],
        [86, 38],
        [88, 54],
      ]);
      const xs = boxes.map((b) => b.x);
      const sorted = [...xs].sort((a, b) => (dir === "rtl" ? b - a : a - b));
      expect(xs).toEqual(sorted);
      const end = boxes[3] ?? s;
      if (dir === "rtl") expect(end.x).toBe(header.x);
      else expect(end.x + end.width).toBe(header.x + header.width);

      // Language segments 37 × 28; the current language is Sky 20% with a white label.
      const current = languages.getByRole("link", { name: shell.languageNames[locale] });
      await expect(current).toHaveAttribute("aria-current", "true");
      const seg = await rect(current);
      expect([seg.width, seg.height]).toEqual([37, 28]);
      expectTint(await onBlack(current, "backgroundColor"), SKY, 0.2, "current language");
      expect(await onBlack(current, "color")).toEqual([255, 255, 255]);
      await expect(languages.locator("a > span:first-child")).toHaveText(["EN", "AR"]);
      await expect(languages.getByRole("link").nth(0)).toHaveAccessibleName("EN English");
      await expect(languages.getByRole("link").nth(1)).toHaveAccessibleName("AR العربية");
      // No unread dot: no notification data exists (D-S5).
      await expect(bar(page).locator('[class*="coral"]')).toHaveCount(0);
    });

    test("768: the search takes the remaining width (Figma Tablet 353), one row", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 900 });
      await load(page, `${prefix}/dashboard`, search(page));
      expect((await rect(search(page))).width).toBe(353);
      expect((await rect(bar(page))).height).toBe(56);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test("search: «coming soon» popover; Esc closes and returns focus; outside click closes", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, `${prefix}/dashboard`, search(page));
      await expect(page.locator("input")).toHaveCount(0); // no text field (D-S4)
      await search(page).focus();
      await page.keyboard.press("Enter");
      const panel = page.getByRole("dialog", { name: shell.search });
      await expect(panel).toBeVisible();
      await expect(panel).toHaveText(shell.searchSoon);
      await expect(search(page)).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await expect(search(page)).toBeFocused();

      await search(page).click();
      await expect(panel).toBeVisible();
      await page.mouse.click(700, 600);
      await expect(panel).toBeHidden();
    });

    test("notifications: keyboard opens the titled «coming soon» popover; Tab out closes it", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const bell = bar(page).getByRole("button", { name: shell.notifications });
      await load(page, `${prefix}/dashboard`, bell);
      await bell.focus();
      await page.keyboard.press("Space");
      const panel = page.getByRole("dialog", { name: shell.notifications });
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(shell.notifications);
      await expect(panel).toContainText(shell.notificationsSoon);
      await expect(panel.locator("li, [role=listitem]")).toHaveCount(0);
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await expect(bell).toBeFocused();
    });

    test("appearance: Dark checked; Light/System disabled; nothing stored", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const moon = bar(page).getByRole("button", { name: shell.appearance });
      await load(page, `${prefix}/dashboard`, moon);
      await moon.focus();
      await page.keyboard.press("Enter");
      const menu = page.getByRole("menu", { name: shell.appearance });
      await expect(menu).toBeVisible();
      const items = menu.getByRole("menuitemradio");
      await expect(items).toHaveText([shell.theme.dark, shell.theme.light, shell.theme.system]);
      await expect(items.nth(0)).toHaveAttribute("aria-checked", "true");
      await expect(items.nth(1)).toBeDisabled();
      await expect(items.nth(2)).toBeDisabled();
      await expect(items.nth(0)).toBeFocused();
      await page.keyboard.press("ArrowDown"); // disabled items are skipped
      await expect(items.nth(0)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(menu).toBeHidden();
      await expect(moon).toBeFocused();
      expect(
        await page.evaluate(() => ({
          storage: localStorage.length + sessionStorage.length,
          cookie: document.cookie,
          scheme: getComputedStyle(document.documentElement).colorScheme,
        })),
      ).toEqual({ storage: 0, cookie: "", scheme: "dark" });
    });

    test("appearance: ArrowDown / ArrowUp on the trigger open the menu (Menu contract §3.3)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const moon = bar(page).getByRole("button", { name: shell.appearance });
      await load(page, `${prefix}/dashboard`, moon);
      const menu = page.getByRole("menu", { name: shell.appearance });
      for (const key of ["ArrowDown", "ArrowUp"]) {
        await moon.focus();
        await page.keyboard.press(key);
        await expect(menu).toBeVisible();
        // Light and System are disabled: the first and the last available item is Dark.
        await expect(menu.getByRole("menuitemradio", { name: shell.theme.dark })).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(moon).toBeFocused();
      }
    });

    test("language switch keeps the query string (after hydration)", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const group = bar(page).getByRole("group", { name: shell.language });
      const other = locale === "ar" ? "en" : "ar";
      const otherLink = group.getByRole("link", { name: shell.languageNames[other] });
      await load(page, `${prefix}/folders/f2?tab=notes&tag=a&tag=b`, otherLink);
      const otherPrefix = other === "en" ? "/en" : "/ar";
      await expect(otherLink).toHaveAttribute(
        "href",
        `${otherPrefix}/folders/f2?tab=notes&tag=a&tag=b`,
      );
      await otherLink.click();
      const landed = other === "en" ? "/en" : "";
      await expect(page).toHaveURL(
        (url) => url.pathname === `${landed}/folders/f2` && url.search === "?tab=notes&tag=a&tag=b",
      );
      await expect(page.locator("html")).toHaveAttribute("lang", other);
    });

    test("language switch: same page in the other language, params kept, then back", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const group = bar(page).getByRole("group", { name: shell.language });
      await load(page, `${prefix}/folders/f2`, group.getByRole("link").first());
      const other = locale === "ar" ? "en" : "ar";
      const otherPrefix = other === "en" ? "/en" : "";
      await group.getByRole("link", { name: shell.languageNames[other] }).click();
      await expect(page).toHaveURL(new RegExp(`${otherPrefix}/folders/f2$`));
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      const otherShell = other === "ar" ? arShell : enShell;
      const back = topBar(page)
        .getByRole("group", { name: otherShell.language })
        .getByRole("link", { name: otherShell.languageNames[locale] });
      await waitForHydration(page, back);
      await back.click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/folders/f2$`));
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });

    test("user menu: avatar trigger; Profile and Settings open Settings; no logout", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const user = bar(page).getByRole("button", { name: shell.accountMenu });
      await load(page, `${prefix}/dashboard`, user);
      await expect(user).toHaveText("");
      await user.click();
      const menu = page.getByRole("menu", { name: shell.accountMenu });
      await expect(menu.getByRole("menuitem")).toHaveText([
        nav.settingsNav.profile,
        shell.settings,
      ]);
      await expect(menu).not.toContainText(locale === "ar" ? "تسجيل الخروج" : "Log out");
      await menu.getByRole("menuitem", { name: shell.settings }).click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/settings$`));

      await load(page, `${prefix}/dashboard`, user);
      await user.click();
      await page
        .getByRole("menu", { name: shell.accountMenu })
        .getByRole("menuitem", { name: nav.settingsNav.profile })
        .click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/settings$`));
    });

    test("focus ring (D-B2) on the search field and a language link", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, `${prefix}/dashboard`, search(page));
      const group = bar(page).getByRole("group", { name: shell.language });
      for (const target of [search(page), group.getByRole("link").first()]) {
        await target.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(target).toBeFocused();
        const ring = await target.evaluate((el) => {
          const s = getComputedStyle(el);
          return [s.outlineStyle, s.outlineWidth, s.outlineOffset];
        });
        expect(ring).toEqual(["solid", "2px", "2px"]);
      }
    });

    test("reduced motion: popovers and menus fade without movement", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, `${prefix}/dashboard`, search(page));
      await search(page).click();
      const panel = page.getByRole("dialog", { name: shell.search });
      await expect(panel).toBeVisible();
      expect(await panel.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("opacity");
    });

    for (const width of [1440, 768]) {
      test(`axe ${width}: menus closed, user menu open`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const user = bar(page).getByRole("button", { name: shell.accountMenu });
        await load(page, `${prefix}/dashboard`, user);
        expect(await axeViolations(page)).toEqual([]);
        await user.click();
        await expect(page.getByRole("menu", { name: shell.accountMenu })).toBeVisible();
        await page.waitForTimeout(300);
        expect(await axeViolations(page)).toEqual([]);
      });
    }
  });

  test.describe(`Mobile Top Bar (${locale})`, () => {
    for (const width of [390, 320]) {
      test(`${width}: fixed 72 bar, logo + 44 actions, content 88 below the top, no overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        const user = mobileBar(page).getByRole("button", { name: shell.accountMenu });
        await load(page, `${prefix}/dashboard`, user);
        await expect(mobileBar(page)).toBeVisible();
        await expect(topBar(page)).toBeHidden();
        await expect(page.getByRole("banner")).toHaveCount(1);
        const bar = await rect(mobileBar(page));
        expect([bar.x, bar.y, bar.width, bar.height]).toEqual([0, 0, width, 72]);
        const style = await mobileBar(page).evaluate((el) => {
          const s = getComputedStyle(el);
          return { position: s.position, blur: s.backdropFilter, border: s.borderBottomWidth };
        });
        expect(style).toEqual({ position: "fixed", blur: "blur(16px)", border: "1px" });
        expectTint(await onBlack(mobileBar(page), "backgroundColor"), [4, 5, 6], 0.88, "fill");

        const buttons = mobileBar(page).getByRole("button");
        await expect(buttons).toHaveCount(3);
        const names = await buttons.evaluateAll((els) =>
          els.map((e) => e.getAttribute("aria-label")),
        );
        expect(names).toEqual([shell.search, shell.notifications, shell.accountMenu]);
        for (const i of [0, 1]) {
          const b = await rect(buttons.nth(i));
          expect([b.width, b.height]).toEqual([44, 44]);
        }
        const logo = mobileBar(page).getByRole("img", { name: "MUNSIT AI" });
        const logoBox = await rect(logo);
        if (dir === "rtl") expect(Math.round(logoBox.x + logoBox.width)).toBe(width - 20);
        else expect(Math.round(logoBox.x)).toBe(20);
        await expect(mobileBar(page).getByRole("group")).toHaveCount(0); // no language switch
        expect(await noHorizontalOverflow(page)).toBe(true);
        expect((await rect(page.getByRole("main"))).y).toBe(88);

        // Fixed: still at the top after scrolling.
        await waitForHydration(page, page.locator("#main-content, #main-content *"));
        await page.evaluate(() => {
          const tall = document.createElement("div");
          tall.style.height = "2000px";
          document.getElementById("main-content")?.append(tall);
          window.scrollTo(0, 800);
        });
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
        expect((await rect(mobileBar(page))).y).toBe(0);
      });
    }

    test("390: popovers stay inside the viewport; the user menu opens Settings", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      const searchButton = mobileBar(page).getByRole("button", { name: shell.search });
      await load(page, `${prefix}/dashboard`, searchButton);
      await searchButton.click();
      const panel = page.getByRole("dialog", { name: shell.search });
      await expect(panel).toBeVisible();
      await expect(panel).toHaveText(shell.searchSoon);
      const p = await rect(panel);
      expect(p.x).toBeGreaterThanOrEqual(20);
      expect(p.x + p.width).toBeLessThanOrEqual(370);
      await page.keyboard.press("Escape");
      await expect(searchButton).toBeFocused();

      const user = mobileBar(page).getByRole("button", { name: shell.accountMenu });
      await user.click();
      await page
        .getByRole("menu", { name: shell.accountMenu })
        .getByRole("menuitem", { name: shell.settings })
        .click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/settings$`));
    });

    test("axe 390: closed and with notifications open", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      const bell = mobileBar(page).getByRole("button", { name: shell.notifications });
      await load(page, `${prefix}/dashboard`, bell);
      expect(await axeViolations(page)).toEqual([]);
      await bell.click();
      await expect(page.getByRole("dialog", { name: shell.notifications })).toBeVisible();
      await page.waitForTimeout(300);
      expect(await axeViolations(page)).toEqual([]);
    });
  });

  test.describe(`Top Bars at the ADR-004 thresholds (${locale})`, () => {
    const CASES = [
      { width: 320, bar: "mobile" },
      { width: 390, bar: "mobile" },
      { width: 719, bar: "mobile" },
      { width: 720, bar: "top" },
      { width: 768, bar: "top" },
      { width: 1024, bar: "top" },
      { width: 1279, bar: "top" },
      { width: 1280, bar: "top" },
      { width: 1440, bar: "top" },
    ] as const;
    for (const { width, bar } of CASES) {
      test(`${width}px: ${bar === "mobile" ? "Mobile Top Bar" : "Top Bar"} in one row, every control inside, no overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        const visible = bar === "mobile" ? mobileBar(page) : topBar(page);
        await expect(visible).toBeVisible();
        await expect(bar === "mobile" ? topBar(page) : mobileBar(page)).toBeHidden();
        const header = await rect(visible);
        expect(header.height).toBe(bar === "mobile" ? 72 : 56);
        for (const control of await visible.locator("button, a").all()) {
          const c = await rect(control);
          expect(c.x).toBeGreaterThanOrEqual(header.x - 0.5);
          expect(c.x + c.width).toBeLessThanOrEqual(header.x + header.width + 0.5);
          expect(c.y).toBeGreaterThanOrEqual(header.y - 0.5);
          expect(c.y + c.height).toBeLessThanOrEqual(header.y + header.height + 0.5);
        }
        expect(await noHorizontalOverflow(page)).toBe(true);
      });
    }

    test("short height 1280 × 600: Top Bar and Sidebar both usable", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 600 });
      await page.goto(`${prefix}/dashboard`);
      await expect(topBar(page)).toBeVisible();
      expect((await rect(topBar(page))).height).toBe(56);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });
  });
}
