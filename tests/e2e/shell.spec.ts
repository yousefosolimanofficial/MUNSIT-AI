import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import ar from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import en from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/**
 * App shell, first increment (Phase 05): Desktop Sidebar, Sidebar Item, Upgrade Card, Tablet
 * Rail, Tablet drawer, skip link, ADR-004 breakpoints. Values from Figma (plan §5): Sidebar
 * `2211:81`, Sidebar Item `2210:118`, Upgrade Plan Card `2211:158`, Rail `2224:379`,
 * drawer `2242:1272`.
 *
 * Not yet covered (the rest of the shell does not exist yet): the mobile Top Bar and bottom
 * navigation, the Top Bars, and the full ADR-004 validation matrix (zoom, larger root fonts,
 * safe areas). Mobile widths here only prove that no navigation leaks below 45rem.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", nav: ar, shell: arShell },
  { locale: "en", dir: "ltr", prefix: "/en", nav: en, shell: enShell },
] as const;
const DESTINATION_IDS = [
  "dashboard",
  "lectures",
  "summaries",
  "questions",
  "flashcards",
  "notes",
  "favorites",
  "folders",
] as const;
const SKY: [number, number, number] = [99, 161, 255];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const DESKTOP = { width: 1440, height: 900 };
const TABLET = { width: 1024, height: 768 };

const sidebar = (page: Page) => page.locator('[data-shell="sidebar"]');
const rail = (page: Page) => page.locator('[data-shell="rail"]');
const drawer = (page: Page) => page.locator('dialog[data-shell="drawer"]');

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

const lum = ([r, g, b]: number[]) => {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r ?? 0) + 0.7152 * lin(g ?? 0) + 0.0722 * lin(b ?? 0);
};
const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
};

for (const { locale, dir, prefix, nav, shell } of LOCALES) {
  const labels = DESTINATION_IDS.map((id) => nav.destinations[id]);
  const mainNav = { name: shell.mainNavigation };

  test.describe(`Desktop Sidebar (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(DESKTOP);
    });

    test("only the Sidebar is shown; inline start, 232 × full height; one main, one nav", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      expect(await page.evaluate(() => [document.documentElement.lang, document.dir])).toEqual([
        locale,
        dir,
      ]);
      await expect(sidebar(page)).toBeVisible();
      await expect(rail(page)).toBeHidden();
      await expect(page.getByRole("navigation", mainNav)).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);

      const box = await rect(sidebar(page));
      expect(box.width).toBe(232);
      expect(box.height).toBe(DESKTOP.height);
      expect(box.y).toBe(0);
      // Inline start: right in RTL, left in LTR. Border on the inline end.
      if (dir === "rtl") expect(box.x + box.width).toBe(DESKTOP.width);
      else expect(box.x).toBe(0);
      const style = await sidebar(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return { start: s.borderInlineStartWidth, end: s.borderInlineEndWidth };
      });
      expect(style).toEqual({ start: "0px", end: "1px" });
      expectTint(await onBlack(sidebar(page), "backgroundColor"), [7, 8, 10], 0.88, "Ink 88%");
      expectTint(
        await sidebar(page).evaluate((el) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return [];
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = getComputedStyle(el).borderInlineEndColor;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        }),
        SKY,
        0.1,
        "inline-end border Sky 10%",
      );
    });

    test("registry order, hrefs, Figma item geometry and states", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      const navLinks = sidebar(page).getByRole("navigation", mainNav).getByRole("link");
      await expect(navLinks).toHaveText(labels);
      for (const [i, id] of DESTINATION_IDS.entries()) {
        await expect(navLinks.nth(i)).toHaveAttribute("href", `${prefix}/${id}`);
      }

      const activeItem = navLinks.nth(0);
      const item = navLinks.nth(1);
      for (const link of [activeItem, item]) {
        const g = await link.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            w: r.width,
            h: r.height,
            radius: s.borderTopLeftRadius,
            pad: s.paddingInlineStart,
            icon: el.querySelector("svg")?.getBoundingClientRect().width,
          };
        });
        expect(g).toEqual({ w: 199, h: 44, radius: "12px", pad: "14px", icon: 20 });
      }

      // Default: no fill, Text/Secondary Cairo Medium 14.
      await expect(item).not.toHaveAttribute("aria-current");
      expectTint(await onBlack(item, "backgroundColor"), SKY, 0, "default fill");
      expect(await onBlack(item, "color")).toEqual([156, 156, 157]);
      expect(await item.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("500");

      // Active: Sky 12% + 1px Sky 22%, white SemiBold, Sky icon, 3 × 22 accent at the inline end.
      await expect(activeItem).toHaveAttribute("aria-current", "page");
      expectTint(await onBlack(activeItem, "backgroundColor"), SKY, 0.12, "active fill");
      expectTint(await onBlack(activeItem, "borderTopColor"), SKY, 0.22, "active border");
      expect(await onBlack(activeItem, "color")).toEqual([255, 255, 255]);
      expect(await activeItem.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("600");
      expect(await onBlack(activeItem.locator("svg"), "color")).toEqual(SKY);
      const itemBox = await rect(activeItem);
      const accent = await rect(activeItem.locator("[data-accent]"));
      expect([accent.width, accent.height]).toEqual([3, 22]);
      expect(accent.y - itemBox.y).toBe(11);
      if (dir === "rtl") expect(accent.x).toBe(itemBox.x);
      else expect(accent.x + accent.width).toBe(itemBox.x + itemBox.width);
    });

    test("hover (fine pointer): Sky 7% and a white label; the Active item does not change", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      const navLinks = sidebar(page).getByRole("navigation", mainNav).getByRole("link");
      await navLinks.nth(2).hover();
      await expect
        .poll(async () => onBlack(navLinks.nth(2), "backgroundColor"))
        .toEqual(SKY.map((c) => Math.round(c * 0.07)));
      await expect.poll(async () => onBlack(navLinks.nth(2), "color")).toEqual([255, 255, 255]);
      expect(await onBlack(navLinks.nth(2).locator("svg"), "color")).toEqual([156, 156, 157]);

      await navLinks.nth(0).hover();
      await page.waitForTimeout(300);
      expectTint(await onBlack(navLinks.nth(0), "backgroundColor"), SKY, 0.12, "active on hover");
    });

    test("logo, divider and the Upgrade Plan Card (Figma values, pinned to the bottom)", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      const logo = sidebar(page).getByRole("img", { name: "MUNSIT AI" });
      await expect(logo).toHaveAttribute("data-logo", "horizontal");
      const logoBox = await rect(logo);
      expect(logoBox.width).toBeLessThanOrEqual(168);
      expect(Math.round(logoBox.height)).toBe(43);

      const card = sidebar(page).getByTestId("upgrade-card");
      const g = await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return { w: r.width, bottom: r.bottom, radius: s.borderTopLeftRadius, pad: s.paddingTop };
      });
      expect(g).toEqual({ w: 199, bottom: DESKTOP.height - 24, radius: "18px", pad: "16px" });
      expectTint(await onBlack(card, "borderTopColor"), SKY, 0.3, "card border");
      await expect(card.getByText(nav.moreExtras.upgradePlan)).toBeVisible();
      const action = card.getByRole("link", { name: shell.upgradeCard.action });
      await expect(action).toHaveAttribute("href", `${prefix}/settings/subscription`);
      expect((await rect(action)).height).toBe(44);
      expect(await onBlack(action, "backgroundColor")).toEqual(SKY);
      expect(await onBlack(card.locator("svg"), "color")).toEqual([86, 194, 255]); // Info Blue
    });

    test("rendered contrast: item labels and the card text (worst point of the gradient)", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      // Sidebar background: Ink 88% over the Void Black page.
      const sidebarBg = [7, 8, 10].map((c, i) => c * 0.88 + ([4, 5, 6][i] ?? 0) * 0.12);
      const item = sidebar(page).getByRole("navigation", mainNav).getByRole("link").nth(1);
      expect(contrast(await onBlack(item, "color"), sidebarBg)).toBeGreaterThanOrEqual(4.5);

      // Gradient Cobalt Edge 85% → Deep Space 95%, measured at both ends of every text line.
      const worst = await sidebar(page)
        .getByTestId("upgrade-card")
        .evaluate((card, bg) => {
          const mix = (a: number[], b: number[], t: number) =>
            a.map((v, i) => v * t + (b[i] ?? 0) * (1 - t));
          const lin = (c: number) => {
            const v = c / 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          const L = (c: number[]) =>
            0.2126 * lin(c[0] ?? 0) + 0.7152 * lin(c[1] ?? 0) + 0.0722 * lin(c[2] ?? 0);
          const cardBox = card.getBoundingClientRect();
          const ltr = document.documentElement.dir === "ltr";
          const colourAt = (x: number) => {
            const f = Math.min(1, Math.max(0, (x - cardBox.left) / cardBox.width));
            const t = ltr ? 1 - f : f; // 0 = Cobalt Edge end, 1 = Deep Space end
            const rgb = mix([2, 25, 59], [20, 60, 163], t);
            return mix(rgb, bg, 0.85 * (1 - t) + 0.95 * t);
          };
          let min = Infinity;
          for (const p of card.querySelectorAll("p")) {
            const fg = (getComputedStyle(p).color.match(/\d+/g) ?? []).slice(0, 3).map(Number);
            const range = document.createRange();
            range.selectNodeContents(p);
            for (const r of range.getClientRects()) {
              for (const x of [r.left, r.right]) {
                const [hi, lo] = [L(fg), L(colourAt(x))].sort((a, b) => b - a);
                min = Math.min(min, ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05));
              }
            }
          }
          return min;
        }, sidebarBg);
      expect(worst).toBeGreaterThanOrEqual(4.5);
    });

    test("sticky: the page scrolls, the Sidebar stays at full viewport height", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      // Hydrated main content first, so the added element is never a server/client mismatch.
      await waitForHydration(page, page.locator("#main-content, #main-content *"));
      await page.evaluate(() => {
        const tall = document.createElement("div");
        tall.style.height = "3000px";
        document.getElementById("main-content")?.append(tall);
        window.scrollTo(0, 1500);
      });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
      const box = await rect(sidebar(page));
      expect([box.y, box.height]).toEqual([0, DESKTOP.height]);
      const main = await rect(page.getByRole("main"));
      expect(main.y).toBeLessThan(-1000); // the main content moved; the Sidebar did not
    });

    test("short height (1280 × 600): every control reachable by scrolling inside the Sidebar", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 600 });
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      await expect(sidebar(page)).toBeVisible();
      const action = sidebar(page).getByRole("link", { name: shell.upgradeCard.action });
      await action.focus();
      await expect(action).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => window.scrollY)).toBe(0); // scrolled inside the Sidebar
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test("active state: one item on a destination subtree, none on Settings (D-R6)", async ({
      page,
    }) => {
      await load(page, `${prefix}/questions/new`, sidebar(page).getByRole("link").first());
      const current = sidebar(page).locator("[aria-current]");
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(nav.destinations.questions);

      await load(page, `${prefix}/settings`, sidebar(page).getByRole("link").first());
      await expect(sidebar(page).locator("[aria-current]")).toHaveCount(0);
    });

    test("keyboard: skip link first and visible on focus, moves focus to main; then the Sidebar", async ({
      page,
    }) => {
      await load(page, `${prefix}/lectures`, sidebar(page).getByRole("link").first());
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: shell.skipToContent });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport({ ratio: 1 });
      expect((await rect(skip)).height).toBe(44);

      // Tab order from the skip link: 8 destinations → upgrade action.
      const order: string[] = [];
      for (let i = 0; i < 9; i += 1) {
        await page.keyboard.press("Tab");
        order.push(await page.evaluate(() => document.activeElement?.textContent ?? ""));
      }
      expect(order).toEqual([...labels, shell.upgradeCard.action]);

      // D-B2 focus ring on a Sidebar item.
      const focused = sidebar(page).getByRole("link", { name: shell.upgradeCard.action });
      const ring = await focused.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.outlineStyle, s.outlineWidth, s.outlineOffset];
      });
      expect(ring).toEqual(["solid", "2px", "2px"]);

      // Activating the skip link moves focus to the main content.
      await skip.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
    });

    test("axe (WCAG 2.2 AA) on the shell", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, sidebar(page).getByRole("link").first());
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .exclude("nextjs-portal")
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });

  test.describe(`Tablet Rail and drawer (${locale})`, () => {
    const menuOf = (page: Page) => rail(page).getByRole("button", { name: shell.openMenu });

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(TABLET);
    });

    test("only the Rail is shown: 72 at the inline start, O-8 controls, Figma order", async ({
      page,
    }) => {
      await load(page, `${prefix}/summaries`, menuOf(page));
      await expect(sidebar(page)).toBeHidden();
      await expect(rail(page)).toBeVisible();
      await expect(page.getByRole("navigation", mainNav)).toHaveCount(1);
      const box = await rect(rail(page));
      expect([box.width, box.height, box.y]).toEqual([72, TABLET.height, 0]);
      if (dir === "rtl") expect(box.x + box.width).toBe(TABLET.width);
      else expect(box.x).toBe(0);

      const links = rail(page).getByRole("navigation", mainNav).getByRole("link");
      await expect(links).toHaveCount(8);
      for (const [i, label] of labels.entries()) {
        await expect(links.nth(i)).toHaveAttribute("aria-label", label);
        const r = await rect(links.nth(i));
        expect([r.width, r.height]).toEqual([40, 40]);
        // Centred in the 72 Rail on the Figma pixels: 1 border + 16 on the bordered side.
        if (dir === "rtl") expect(r.x - box.x).toBe(17);
        else expect(box.x + box.width - (r.x + r.width)).toBe(17);
      }
      const current = rail(page).locator("[aria-current]");
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute("aria-label", nav.destinations.summaries);
      expectTint(await onBlack(current, "backgroundColor"), SKY, 0.18, "Rail active");

      const upgrade = rail(page).getByRole("link", { name: nav.moreExtras.upgradePlan });
      await expect(upgrade).toHaveAttribute("href", `${prefix}/settings/subscription`);
      // Pinned to the bottom: 20 padding below it.
      expect(Math.round((await rect(upgrade)).y + 40)).toBe(TABLET.height - 20);
      await expect(rail(page).getByRole("img", { name: "MUNSIT AI" })).toHaveAttribute(
        "data-logo",
        "symbol",
      );
    });

    test("drawer: keyboard open, modal at the inline start, focus trapped, Esc closes and restores focus", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      const menu = menuOf(page);
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await menu.focus();
      await page.keyboard.press("Enter");

      const dialog = page.getByRole("dialog", { name: shell.drawerTitle });
      await expect(dialog).toBeVisible();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await expect(menu).toHaveAttribute(
        "aria-controls",
        (await drawer(page).getAttribute("id")) ?? "",
      );
      // Settled position: 232 wide, full height, flush with the inline start.
      await expect
        .poll(async () => {
          const r = await rect(drawer(page));
          return dir === "rtl" ? r.x + r.width : r.x;
        })
        .toBe(dir === "rtl" ? TABLET.width : 0);
      const box = await rect(drawer(page));
      expect([box.width, box.height]).toEqual([232, TABLET.height]);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");

      // The drawer is the Sidebar panel: same destinations and current item.
      const links = dialog.getByRole("navigation", mainNav).getByRole("link");
      await expect(links).toHaveText(labels);
      await expect(dialog.locator("[aria-current]")).toHaveText(nav.destinations.dashboard);
      await expect(dialog.getByRole("button")).toHaveCount(0); // Figma: no close button

      let inside = 0;
      for (const key of [...Array<string>(12).fill("Tab"), ...Array<string>(4).fill("Shift+Tab")]) {
        await page.keyboard.press(key);
        const where = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return "body";
          return document.querySelector("dialog[open]")?.contains(active) ? "in" : "OUTSIDE";
        });
        expect(where, key).not.toBe("OUTSIDE");
        if (where === "in") inside += 1;
      }
      expect(inside).toBeGreaterThan(10);

      await page.keyboard.press("Escape");
      await expect(drawer(page)).not.toHaveAttribute("open");
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    test("drawer: a scrim click closes it", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      await menuOf(page).click();
      await expect(drawer(page)).toHaveAttribute("data-state", "open");
      // Outside the panel, on the content side.
      await page.mouse.click(dir === "rtl" ? 200 : TABLET.width - 200, 400);
      await expect(drawer(page)).not.toHaveAttribute("open");
      await expect(menuOf(page)).toHaveAttribute("aria-expanded", "false");
    });

    test("drawer: choosing a destination navigates and closes it", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      await menuOf(page).click();
      const dialog = page.getByRole("dialog", { name: shell.drawerTitle });
      await dialog.getByRole("link", { name: nav.destinations.notes }).click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/notes$`));
      await expect(drawer(page)).not.toHaveAttribute("open");
      await expect(rail(page).locator("[aria-current]")).toHaveAttribute(
        "aria-label",
        nav.destinations.notes,
      );
    });

    test("drawer: closes when the viewport grows to the Sidebar", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      await menuOf(page).click();
      await expect(drawer(page)).toHaveAttribute("open");
      await page.setViewportSize(DESKTOP);
      await expect(drawer(page)).not.toHaveAttribute("open");
      await expect(sidebar(page)).toBeVisible();
    });

    test("drawer motion: slide + fade from the inline start; opacity only under reduced motion", async ({
      page,
    }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      await menuOf(page).click();
      await expect(drawer(page)).toHaveAttribute("data-state", "open");
      const full = await drawer(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.transitionProperty, s.transitionDuration];
      });
      expect(full).toEqual(["translate, opacity", "0.32s"]);
      await page.keyboard.press("Escape");
      await expect(drawer(page)).not.toHaveAttribute("open");

      await page.emulateMedia({ reducedMotion: "reduce" });
      await menuOf(page).click();
      await expect(drawer(page)).toHaveAttribute("data-state", "open");
      const reduced = await drawer(page).evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.transitionProperty, s.translate];
      });
      expect(reduced[0]).toBe("opacity");
      expect(["none", "0px", "0px 0px"]).toContain(reduced[1]);
    });

    test("short height (1024 × 600): the Rail scrolls internally, upgrade reachable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1024, height: 600 });
      await load(page, `${prefix}/dashboard`, menuOf(page));
      const upgrade = rail(page).getByRole("link", { name: nav.moreExtras.upgradePlan });
      await upgrade.focus();
      await expect(upgrade).toBeInViewport({ ratio: 1 });
      expect(await noHorizontalOverflow(page)).toBe(true);
    });

    test("axe (WCAG 2.2 AA), drawer closed and open", async ({ page }) => {
      await load(page, `${prefix}/dashboard`, menuOf(page));
      const scan = async () =>
        (
          await new AxeBuilder({ page }).withTags(WCAG_TAGS).exclude("nextjs-portal").analyze()
        ).violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }));
      expect(await scan()).toEqual([]);
      await menuOf(page).click();
      await expect(drawer(page)).toHaveAttribute("data-state", "open");
      await page.waitForTimeout(400); // settled, so axe reads final colours
      expect(await scan()).toEqual([]);
    });
  });

  test.describe(`ADR-004 thresholds, first increment (${locale})`, () => {
    const CASES = [
      { width: 320, shell: "none" },
      { width: 390, shell: "none" },
      { width: 719, shell: "none" },
      { width: 720, shell: "rail" },
      { width: 768, shell: "rail" },
      { width: 1024, shell: "rail" },
      { width: 1279, shell: "rail" },
      { width: 1280, shell: "sidebar" },
      { width: 1440, shell: "sidebar" },
    ] as const;
    for (const { width, shell: expected } of CASES) {
      test(`${width}px: ${expected === "none" ? "no navigation yet (mobile shell follows)" : expected}, no horizontal overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`${prefix}/dashboard`);
        await page.evaluate(() => document.fonts.ready);
        await expect(sidebar(page)).toBeVisible({ visible: expected === "sidebar" });
        await expect(rail(page)).toBeVisible({ visible: expected === "rail" });
        await expect(page.getByRole("navigation", mainNav)).toHaveCount(
          expected === "none" ? 0 : 1,
        );
        expect(await noHorizontalOverflow(page)).toBe(true);
        // The placeholder content stays inside the main column.
        const main = await rect(page.getByRole("main"));
        const card = await rect(page.locator("[data-route-key] > section"));
        expect(card.x).toBeGreaterThanOrEqual(main.x);
        expect(card.x + card.width).toBeLessThanOrEqual(main.x + main.width + 0.5);
      });
    }
  });

  test.describe(`shell boundaries (${locale})`, () => {
    for (const path of ["/flashcards/sample-1/study", "/login", "/"]) {
      test(`${prefix}${path || "/"} has no app shell`, async ({ page }) => {
        await page.setViewportSize(DESKTOP);
        await page.goto(`${prefix}${path}`);
        await expect(page.locator("[data-shell]")).toHaveCount(0);
        await expect(page.getByRole("link", { name: shell.skipToContent })).toHaveCount(0);
        await expect(page.getByRole("main")).toHaveCount(1);
      });
    }
  });
}
