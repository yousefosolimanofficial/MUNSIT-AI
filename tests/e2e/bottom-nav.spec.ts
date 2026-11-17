import AxeBuilder from "@axe-core/playwright";
import type { CDPSession, Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arNav from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enNav from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/**
 * Phase 05 mobile bottom navigation (`BottomNav` with Mariam's `MobileNavItem`, Figma
 * `Bottom Navigation` `2238:1187`) wired to the More sheet, and the full ADR-004 validation
 * matrix of the finished shell: widths, both directions, 200% / 400% zoom (emulated by the CSS
 * viewport width), root font sizes 20 / 24 px (Chromium default font size), short heights,
 * simulated safe-area insets, reduced motion, keyboard and axe.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", nav: arNav, shell: arShell },
  { locale: "en", dir: "ltr", prefix: "/en", nav: enNav, shell: enShell },
] as const;
const BAR_IDS = ["dashboard", "lectures", "summaries"] as const;
const SKY: [number, number, number] = [99, 161, 255];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PHONE = { width: 390, height: 844 };

const bottomNav = (page: Page) => page.locator('[data-shell="bottom-nav"]');
const sheet = (page: Page) => page.locator("dialog[open]");

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, bottomNav(page).locator("a, button"));
}

/** Viewport-coordinate rectangle (never includes the scroll offset). */
async function box(locator: Locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
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

/**
 * The four items: inside the viewport, never overlapping each other, every label fully inside
 * its own item (no clipping, one line).
 */
async function expectItemsFit(page: Page, width: number): Promise<void> {
  const geometry = await bottomNav(page)
    .locator("li > *")
    .evaluateAll((items) =>
      items.map((item) => {
        const r = item.getBoundingClientRect();
        const label = item.querySelector("span")?.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
          label: label ? [label.left, label.right, label.height] : [],
        };
      }),
    );
  expect(geometry).toHaveLength(4);
  const sorted = [...geometry].sort((a, b) => a.left - b.left);
  sorted.forEach((item, i) => {
    expect(item.width, `item ${i} width`).toBe(76);
    expect(item.height, `item ${i} height`).toBe(60);
    expect(item.left).toBeGreaterThanOrEqual(0);
    expect(item.right).toBeLessThanOrEqual(width + 0.5);
    const [labelLeft = -1, labelRight = 1e6, labelHeight = 0] = item.label;
    expect(labelLeft, `label ${i} start`).toBeGreaterThanOrEqual(item.left - 0.5);
    expect(labelRight, `label ${i} end`).toBeLessThanOrEqual(item.right + 0.5);
    expect(labelHeight, `label ${i} one line`).toBe(18);
    const next = sorted[i + 1];
    if (next)
      expect(item.right, `item ${i} overlaps the next`).toBeLessThanOrEqual(next.left + 0.5);
  });
}

async function safeAreaInsets(page: Page, insets: { top: number; bottom: number }) {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { top: insets.top, bottom: insets.bottom, left: 0, right: 0 },
  });
  return cdp;
}

for (const { locale, dir, prefix, nav, shell } of LOCALES) {
  const barLabels = BAR_IDS.map((id) => nav.destinations[id]);

  test.describe(`Bottom navigation (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(PHONE);
    });

    test("390: the only navigation; Figma bar 390 × 84 at the bottom; items in registry order", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`);
      expect(await page.evaluate(() => [document.documentElement.lang, document.dir])).toEqual([
        locale,
        dir,
      ]);
      const bar = page.getByRole("navigation", { name: shell.bottomNavigation });
      await expect(bar).toBeVisible();
      await expect(page.getByRole("navigation")).toHaveCount(1);
      await expect(page.locator('[data-shell="sidebar"]')).toBeHidden();
      await expect(page.locator('[data-shell="rail"]')).toBeHidden();

      expect(await box(bar)).toMatchObject({ x: 0, width: 390, height: 84, bottom: 844 });
      const style = await bar.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          position: s.position,
          blur: s.backdropFilter,
          border: s.borderTopWidth,
          padding: [s.paddingTop, s.paddingInlineStart, s.paddingBottom, s.paddingInlineEnd],
        };
      });
      expect(style).toEqual({
        position: "fixed",
        blur: "blur(16px)",
        border: "1px",
        padding: ["8px", "16px", "16px", "16px"],
      });
      expectTint(await onBlack(bar, "backgroundColor"), [7, 8, 10], 0.94, "bar fill");
      expectTint(await onBlack(bar, "borderTopColor"), SKY, 0.12, "bar border");

      const items = bar.locator("li > *");
      await expect(items).toHaveText([...barLabels, nav.more]);
      for (const [i, id] of BAR_IDS.entries()) {
        await expect(items.nth(i)).toHaveAttribute("href", `${prefix}/${id}`);
      }
      // Figma: items 9 below the bar's top edge (1 border + 8 padding); space-between.
      const boxes = await items.evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.left), Math.round(r.top)];
        }),
      );
      const lefts = boxes.map(([left = 0]) => left);
      expect(boxes.every(([, top]) => top === 844 - 84 + 9)).toBe(true);
      // RTL: registry order runs from the right (Figma Arabic frame); LTR from the left.
      expect(lefts).toEqual(dir === "rtl" ? [298, 204, 110, 16] : [16, 110, 204, 298]);
      await expectItemsFit(page, 390);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    for (const [path, current, moreActive] of [
      ["/dashboard", "dashboard", false],
      ["/lectures/sample-1", "lectures", false],
      ["/summaries", "summaries", false],
      ["/questions/sample-1/quiz", null, true],
      ["/folders", null, true],
      ["/settings/security", null, false],
    ] as const) {
      test(`indicator on ${path}: ${current ?? (moreActive ? "More (visual only)" : "nothing")}`, async ({
        page,
      }) => {
        await load(page, `${prefix}${path}`);
        const bar = bottomNav(page);
        const currentLinks = bar.locator("[aria-current]");
        if (current) {
          await expect(currentLinks).toHaveCount(1);
          await expect(currentLinks).toHaveAttribute("aria-current", "page");
          await expect(currentLinks).toHaveAttribute("href", `${prefix}/${current}`);
          const active = currentLinks.first();
          expectTint(await onBlack(active, "backgroundColor"), SKY, 0.12, "active fill");
          expect(await onBlack(active, "color")).toEqual(SKY);
        } else {
          await expect(currentLinks).toHaveCount(0);
        }
        const more = bar.getByRole("button", { name: nav.more });
        await expect(more).not.toHaveAttribute("aria-current", /.*/);
        expect(await onBlack(more, "color")).toEqual(moreActive ? SKY : [156, 156, 157]);
      });
    }

    test("320 (WCAG reflow): four 76 × 60 items fit; inline padding 8; no clipping or overflow", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await load(page, `${prefix}/dashboard`);
      const padding = await bottomNav(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.paddingInlineStart, s.paddingInlineEnd];
      });
      expect(padding).toEqual(["8px", "8px"]);
      await expectItemsFit(page, 320);
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    for (const width of [336, 360, 430, 719]) {
      test(`${width}: Figma inline padding 16 kept; items fit`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await load(page, `${prefix}/dashboard`);
        const padding = await bottomNav(page).evaluate(
          (el) => getComputedStyle(el).paddingInlineStart,
        );
        expect(padding).toBe("16px");
        await expectItemsFit(page, width);
        expect(await noHorizontalOverflow(page)).toBe(true);
      });
    }

    test("keyboard: the four items follow the content in Tab order; More opens the sheet; Esc returns focus", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`);
      const items = bottomNav(page).locator("li > *");
      // From the last item backwards: Shift+Tab walks the bar in reverse DOM order.
      await items.nth(3).focus();
      for (let i = 2; i >= 0; i -= 1) {
        await page.keyboard.press("Shift+Tab");
        await expect(items.nth(i)).toBeFocused();
      }
      const more = items.nth(3);
      await more.focus();
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await page.keyboard.press("Enter");
      await expect(sheet(page)).toHaveAttribute("data-state", "open");
      await expect(more).toHaveAttribute("aria-expanded", "true");
      await expect(page.getByRole("dialog", { name: nav.more })).toBeVisible();
      await expect(sheet(page).getByRole("button", { name: shell.closeMenu })).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
      // The More visual is the page indicator, not the sheet state (D-R6).
      expect(await onBlack(more, "color")).toEqual([156, 156, 157]);
      // Focus never reaches the page behind the modal sheet (it may pass through the browser UI,
      // which leaves document.body active).
      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press("Tab");
        const where = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return "body";
          return document.querySelector("dialog[open]")?.contains(active) ? "in" : "OUTSIDE";
        });
        expect(where).not.toBe("OUTSIDE");
      }
      await page.keyboard.press("Escape");
      await expect(sheet(page)).toHaveCount(0);
      await expect(more).toBeFocused();
      await expect(more).toHaveAttribute("aria-expanded", "false");
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");

      // Space opens it too.
      await page.keyboard.press(" ");
      await expect(sheet(page)).toHaveAttribute("data-state", "open");
    });

    test("the scrim closes the sheet and focus returns to More", async ({ page }) => {
      await load(page, `${prefix}/dashboard`);
      const more = bottomNav(page).getByRole("button", { name: nav.more });
      await more.click();
      await expect(sheet(page)).toHaveAttribute("data-state", "open");
      await page.mouse.click(195, 20);
      await expect(sheet(page)).toHaveCount(0);
      await expect(more).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    test("choosing a sheet destination navigates, closes the sheet, and More shows the indicator", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`);
      const more = bottomNav(page).getByRole("button", { name: nav.more });
      await more.click();
      await sheet(page).getByRole("link", { name: nav.destinations.notes }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${prefix}/notes`);
      await expect(sheet(page)).toHaveCount(0);
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await expect(bottomNav(page).locator("[aria-current]")).toHaveCount(0);
      await expect.poll(() => onBlack(more, "color")).toEqual(SKY);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
      // The sheet marks its own current row.
      await more.click();
      await expect(sheet(page).getByRole("link", { name: nav.destinations.notes })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    test("language switching stays available from the bar's More sheet", async ({ page }) => {
      await load(page, `${prefix}/lectures/sample-1?tab=notes`);
      await bottomNav(page).getByRole("button", { name: nav.more }).click();
      const other = locale === "ar" ? "en" : "ar";
      await sheet(page)
        .getByRole("group", { name: shell.language })
        .getByRole("link", { name: shell.languageNames[other] })
        .click();
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === `${other === "en" ? "/en" : ""}/lectures/sample-1` &&
          url.searchParams.get("tab") === "notes",
      );
      await expect(sheet(page)).toHaveCount(0);
      await expect(page.locator("html")).toHaveAttribute("dir", other === "ar" ? "rtl" : "ltr");
    });

    test("the sheet closes when the viewport crosses into the tablet shell", async ({ page }) => {
      await load(page, `${prefix}/dashboard`);
      await bottomNav(page).getByRole("button", { name: nav.more }).click();
      await expect(sheet(page)).toHaveAttribute("data-state", "open");
      await page.setViewportSize({ width: 720, height: 844 });
      await expect(sheet(page)).toHaveCount(0);
      await expect(bottomNav(page)).toBeHidden();
      await expect(page.locator('[data-shell="rail"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    test("focus is never hidden under the fixed bars; content ends 24 above the bar", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`);
      // Long, focusable page content (after hydration, so React never sees the change), inside
      // the route's own element as a real screen's content would be.
      await page.evaluate(() => {
        const main = document.querySelector("[data-route-key]");
        const list = document.createElement("div");
        list.dataset.testid = "long-content";
        for (let i = 0; i < 40; i += 1) {
          const link = document.createElement("a");
          link.href = "#";
          link.textContent = `Item ${i}`;
          link.style.display = "block";
          link.style.padding = "12px 0";
          list.append(link);
        }
        main?.append(list);
      });
      const links = page.getByTestId("long-content").locator("a");
      await links.first().focus();
      const barTop = (await box(bottomNav(page))).y;
      const topBarBottom = (await box(page.locator('[data-shell="mobile-top-bar"]'))).bottom;
      for (let i = 1; i < 40; i += 1) {
        await page.keyboard.press("Tab");
        const r = await box(links.nth(i));
        expect(r.bottom, `item ${i} under the bottom bar`).toBeLessThanOrEqual(barTop + 0.5);
        expect(r.y, `item ${i} under the top bar`).toBeGreaterThanOrEqual(topBarBottom - 0.5);
      }
      // Shift+Tab back up: the top bar never hides focus either.
      for (let i = 38; i >= 0; i -= 1) {
        await page.keyboard.press("Shift+Tab");
        const r = await box(links.nth(i));
        expect(r.y, `item ${i} under the top bar`).toBeGreaterThanOrEqual(topBarBottom - 0.5);
        expect(r.bottom).toBeLessThanOrEqual(barTop + 0.5);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const contentEnd = (await box(page.getByTestId("long-content"))).bottom;
      expect(barTop - contentEnd).toBeGreaterThanOrEqual(24);
      expect(barTop - contentEnd).toBeLessThan(25);
    });

    test("safe-area insets (simulated): bar grows by the bottom inset, content padding follows", async ({
      page,
    }) => {
      const cdp = await safeAreaInsets(page, { top: 47, bottom: 34 });
      await load(page, `${prefix}/dashboard`);
      const bar = await box(bottomNav(page));
      expect(bar).toMatchObject({ height: 84 + 34, bottom: 844 });
      const firstItem = await box(bottomNav(page).locator("li > *").first());
      expect(Math.round(firstItem.y - bar.y)).toBe(9); // the items keep their Figma offset
      const paddings = await page.locator('[data-shell="content"]').evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.paddingTop, s.paddingBottom];
      });
      expect(paddings).toEqual([`${88 + 47}px`, `${108 + 34}px`]);
      const scrollPadding = await page.evaluate(() => {
        const s = getComputedStyle(document.documentElement);
        return [s.scrollPaddingTop, s.scrollPaddingBottom];
      });
      expect(scrollPadding).toEqual([`${72 + 47}px`, `${84 + 34}px`]);
      await cdp.detach();
    });

    test("reduced motion: the bar does not move; the sheet opened from More only fades", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await load(page, `${prefix}/dashboard`);
      const itemMotion = await bottomNav(page)
        .locator("li > *")
        .first()
        .evaluate((el) => getComputedStyle(el).transitionProperty);
      expect(itemMotion).not.toMatch(/transform|translate|all/);
      await bottomNav(page).getByRole("button", { name: nav.more }).click();
      const motion = await sheet(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.transitionProperty, s.translate];
      });
      expect(motion[0]).toBe("opacity");
      expect(["none", "0px", "0px 0px", "0px 0%"]).toContain(motion[1]);
    });

    for (const path of ["/dashboard", "/questions", "/settings/security"]) {
      test(`axe (WCAG 2.2 AA) at 390 on ${path}, sheet closed and open`, async ({ page }) => {
        await load(page, `${prefix}${path}`);
        const scan = async () =>
          (
            await new AxeBuilder({ page }).withTags(WCAG_TAGS).exclude("nextjs-portal").analyze()
          ).violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }));
        expect(await scan()).toEqual([]);
        await bottomNav(page).getByRole("button", { name: nav.more }).click();
        await expect(sheet(page)).toHaveAttribute("data-state", "open");
        await page.waitForTimeout(400);
        expect(await scan()).toEqual([]);
      });
    }
  });

  test.describe(`ADR-004 validation matrix (${locale})`, () => {
    type Shell = "mobile" | "rail" | "sidebar";

    async function expectShell(page: Page, expected: Shell, width: number): Promise<void> {
      await expect(page.locator('[data-shell="sidebar"]')).toBeVisible({
        visible: expected === "sidebar",
      });
      await expect(page.locator('[data-shell="rail"]')).toBeVisible({
        visible: expected === "rail",
      });
      await expect(bottomNav(page)).toBeVisible({ visible: expected === "mobile" });
      await expect(page.locator('[data-shell="mobile-top-bar"]')).toBeVisible({
        visible: expected === "mobile",
      });
      await expect(page.locator('[data-shell="top-bar"]')).toBeVisible({
        visible: expected !== "mobile",
      });
      expect(await noHorizontalOverflow(page), "horizontal overflow").toBe(true);
      // The Top Bar fits in one row.
      const topBar = page.locator(
        expected === "mobile" ? '[data-shell="mobile-top-bar"]' : '[data-shell="top-bar"]',
      );
      expect((await box(topBar)).height).toBe(expected === "mobile" ? 72 : 56);
      if (expected === "mobile") await expectItemsFit(page, width);
      // Every destination is reachable from the visible navigation.
      const visibleNavLinks = page.locator("nav a:visible");
      await expect(visibleNavLinks).toHaveCount(expected === "mobile" ? 3 : 8);
    }

    for (const [width, expected] of [
      [320, "mobile"],
      [390, "mobile"],
      [719, "mobile"],
      [720, "rail"],
      [768, "rail"],
      [1024, "rail"],
      [1279, "rail"],
      [1280, "sidebar"],
      [1440, "sidebar"],
    ] as const) {
      test(`${width}px → ${expected}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        await expectShell(page, expected, width);
      });
    }

    for (const [label, width, expected] of [
      ["1440 at 200%", 720, "rail"],
      ["1440 at 400%", 360, "mobile"],
      ["1280 at 400%", 320, "mobile"],
    ] as const) {
      test(`zoom ${label} (CSS width ${width}) → ${expected}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        await expectShell(page, expected, width);
      });
    }

    for (const [fontSize, width, expected] of [
      [20, 768, "mobile"], // 45rem = 900
      [20, 1024, "rail"],
      [20, 1440, "rail"], // 80rem = 1600
      [24, 1024, "mobile"], // 45rem = 1080
      [24, 1440, "rail"], // 80rem = 1920
      [24, 1920, "sidebar"],
    ] as const) {
      test(`root font ${fontSize}px at ${width} → ${expected}`, async ({ page }) => {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Page.setFontSizes", { fontSizes: { standard: fontSize } });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe(
          `${fontSize}px`,
        );
        await expectShell(page, expected, width);
        await cdp.detach();
      });
    }

    for (const [width, height, expected] of [
      [1280, 600, "sidebar"],
      [1024, 600, "rail"],
      [844, 390, "rail"],
      [700, 390, "mobile"],
      [390, 500, "mobile"],
    ] as const) {
      test(`short height ${width} × ${height} → ${expected}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        await expectShell(page, expected, width);
        if (expected === "mobile") {
          // The bar stays fully visible at the bottom; the content scrolls behind it.
          const bar = await box(bottomNav(page));
          expect(Math.round(bar.bottom)).toBe(height);
          expect(bar.height).toBe(84);
        }
      });
    }
  });
}
