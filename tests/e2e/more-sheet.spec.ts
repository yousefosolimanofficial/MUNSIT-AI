import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arNav from "../../src/i18n/messages/ar/nav.json" with { type: "json" };
import arShell from "../../src/i18n/messages/ar/shell.json" with { type: "json" };
import enNav from "../../src/i18n/messages/en/nav.json" with { type: "json" };
import enShell from "../../src/i18n/messages/en/shell.json" with { type: "json" };

/**
 * Phase 05 mobile navigation increment: the More sheet (Figma `More Menu Sheet` `2236:972`) with
 * the approved mobile language access. In the product the bottom navigation's More control opens
 * it (`BottomNav` + `MobileNavItem`, integrated later); until then the temporary
 * /dev/components gallery opens it with a sample button.
 *
 * The current-row semantics on real destination routes (D-R6) are unit-tested
 * (src/shared/layout/shell.test.tsx); they need the bottom navigation to be reached in a browser.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", nav: arNav, shell: arShell },
  { locale: "en", dir: "ltr", prefix: "/en", nav: enNav, shell: enShell },
] as const;
const MORE_IDS = ["questions", "flashcards", "notes", "favorites", "folders"] as const;
const SKY: [number, number, number] = [99, 161, 255];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const opener = (page: Page) => page.getByTestId("more-sheet-open");

async function open(page: Page, path: string): Promise<Locator> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, opener(page));
  await opener(page).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveAttribute("data-state", "open");
  return dialog;
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

for (const { locale, dir, prefix, nav, shell } of LOCALES) {
  const path = `${prefix}/dev/components`;

  test.describe(`More sheet (${locale})`, () => {
    for (const width of [320, 390, 719, 720]) {
      test(`${width}px: bottom sheet, Figma rows, language row, no overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        const dialog = await open(page, path);
        await expect(page.getByRole("dialog", { name: nav.more })).toBeVisible();
        expect(await page.evaluate(() => [document.documentElement.lang, document.dir])).toEqual([
          locale,
          dir,
        ]);
        // Settled after the slide-up (320 ms), in viewport coordinates.
        await expect
          .poll(() => dialog.evaluate((el) => Math.round(el.getBoundingClientRect().bottom)))
          .toBe(844);
        const box = await dialog.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        expect(box.width).toBe(width);
        expect(Math.round(box.y + box.height)).toBe(844);

        const rows = dialog.getByTestId("more-sheet-rows").getByRole("link");
        await expect(rows.nth(0)).toHaveText(nav.destinations.questions);
        for (const [i, id] of MORE_IDS.entries()) {
          await expect(rows.nth(i)).toHaveText(nav.destinations[id]);
          await expect(rows.nth(i)).toHaveAttribute("href", `${prefix}/${id}`);
        }
        await expect(rows.nth(5)).toHaveText(nav.moreExtras.accountSettings);
        await expect(rows.nth(5)).toHaveAttribute("href", `${prefix}/settings`);
        const upgrade = rows.last();
        await expect(upgrade).toHaveText(nav.moreExtras.upgradePlan);
        await expect(upgrade).toHaveAttribute("href", `${prefix}/settings/subscription`);
        await expect(dialog.locator("[aria-current]")).toHaveCount(1); // only the current language
        await expect(dialog.locator("[aria-current='page']")).toHaveCount(0); // a dev route

        // Row and tile values (Figma).
        const row = rows.nth(0);
        const g = await row.evaluate((el) => {
          const s = getComputedStyle(el);
          const tile = el.querySelector("span")?.getBoundingClientRect();
          return {
            h: el.getBoundingClientRect().height,
            radius: s.borderTopLeftRadius,
            tile: [tile?.width, tile?.height],
            icon: el.querySelector("svg")?.getBoundingClientRect().width,
            weight: s.fontWeight,
          };
        });
        expect(g).toEqual({ h: 56, radius: "14px", tile: [36, 36], icon: 18, weight: "500" });
        expectTint(await onBlack(row, "backgroundColor"), SKY, 0.05, "row fill");
        expectTint(await onBlack(row, "borderTopColor"), SKY, 0.1, "row border");
        expect(await onBlack(row, "color")).toEqual([255, 255, 255]);
        expectTint(await onBlack(upgrade, "backgroundColor"), SKY, 0.12, "upgrade fill");
        expectTint(await onBlack(upgrade, "borderTopColor"), SKY, 0.3, "upgrade border");
        expect(await onBlack(upgrade, "color")).toEqual(SKY);

        const languages = dialog.getByRole("group", { name: shell.language });
        await expect(languages).toBeVisible();
        await expect(languages.getByRole("link").nth(0)).toHaveAccessibleName("EN English");
        await expect(languages.getByRole("link").nth(1)).toHaveAccessibleName("AR العربية");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
        // Every row stays inside the sheet.
        const rowBoxes = await rows.evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return [r.left, r.right];
          }),
        );
        for (const [left = 0, right = 0] of rowBoxes) {
          expect(left).toBeGreaterThanOrEqual(box.x);
          expect(right).toBeLessThanOrEqual(box.x + width + 0.5);
        }
      });
    }

    test("keyboard: focus starts on «إغلاق القائمة», Tab stays inside, Esc closes and returns focus", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = await open(page, path);
      await expect(dialog.getByRole("button", { name: shell.closeMenu })).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
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
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(opener(page)).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });

    test("the close button and the scrim close it", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      let dialog = await open(page, path);
      await dialog.getByRole("button", { name: shell.closeMenu }).click();
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(opener(page)).toBeFocused();

      dialog = await open(page, path);
      await page.mouse.click(195, 20); // above the sheet: the scrim
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    });

    test("choosing a destination navigates and closes the sheet", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = await open(page, path);
      await dialog.getByRole("link", { name: nav.destinations.notes }).click();
      await expect(page).toHaveURL(new RegExp(`${prefix}/notes$`));
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    });

    test("mobile language access: switches the language on the same page", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = await open(page, path);
      const other = locale === "ar" ? "en" : "ar";
      await dialog
        .getByRole("group", { name: shell.language })
        .getByRole("link", { name: shell.languageNames[other] })
        .click();
      await expect(page).toHaveURL(
        (url) => url.pathname === `${other === "en" ? "/en" : ""}/dev/components`,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", other);
      await expect(page.locator("html")).toHaveAttribute("dir", other === "ar" ? "rtl" : "ltr");
      await expect(page.locator("dialog[open]")).toHaveCount(0);
    });

    test("reduced motion: the sheet fades without moving", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      const dialog = await open(page, path);
      const motion = await dialog.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.transitionProperty, s.translate];
      });
      expect(motion[0]).toBe("opacity");
      expect(["none", "0px", "0px 0px", "0px 0%"]).toContain(motion[1]);
    });

    test("axe (WCAG 2.2 AA) with the sheet open", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, path);
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include("dialog[open]")
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });
}
