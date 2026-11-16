import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Navigation Icon Button (O-8) browser checks on the temporary /dev/components gallery
 * (contract docs/phases/phase-05-navigation-icon-button-contract.md §12): computed Figma values
 * per state, hover on fine pointers only, transient pressed, D-B2 focus ring, keyboard
 * activation, disabled behaviour, locale-aware hrefs, rendered icon contrast, colour-only
 * motion, axe, and 1440 / 768 / 390 / 320 in RTL and LTR.
 */

const LOCALES = [
  { path: "/dev/components", locale: "ar", dir: "rtl", prefix: "" },
  { path: "/en/dev/components", locale: "en", dir: "ltr", prefix: "/en" },
] as const;
const SKY: [number, number, number] = [99, 161, 255];
const WHITE: [number, number, number] = [255, 255, 255];
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-nib").locator("button"));
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

async function box(locator: Locator) {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const svg = el.querySelector("svg");
    return {
      w: r.width,
      h: r.height,
      radius: s.borderTopLeftRadius,
      border: s.borderTopWidth,
      icon: svg ? svg.getBoundingClientRect().width : 0,
      iconHidden: svg?.getAttribute("aria-hidden"),
      transitionProperty: s.transitionProperty,
      transitionDuration: s.transitionDuration,
      opacity: s.opacity,
    };
  });
}

/** WCAG contrast of the icon colour over the button fill composited on the page background. */
async function iconContrast(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const chain: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    for (const node of chain) {
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
    }
    const bg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const fg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    const lum = (rgb: number[]) =>
      rgb
        .map((v) => {
          const c = v / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, c, i) => sum + c * ([0.2126, 0.7152, 0.0722][i] ?? 0), 0);
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
  });
}

for (const { path, dir, prefix } of LOCALES) {
  test.describe(`Navigation Icon Button gallery ${path}`, () => {
    test("Figma geometry and Default / Active values; md 40 · icon 20, lg 44 · icon 18", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, path);
      expect(await page.evaluate(() => document.documentElement.dir)).toBe(dir);

      const def = page.getByTestId("nib-link");
      const m = await box(def);
      expect([m.w, m.h, m.radius, m.border, m.icon, m.iconHidden]).toEqual([
        40,
        40,
        "12px",
        "1px",
        20,
        "true",
      ]);
      expectTint(await onBlack(def, "backgroundColor"), WHITE, 0.04, "default fill");
      expectTint(await onBlack(def, "borderTopColor"), SKY, 0.12, "default border");
      expect(await def.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(156, 156, 157)");

      const active = page.getByTestId("nib-link-active");
      expectTint(await onBlack(active, "backgroundColor"), SKY, 0.18, "active fill");
      expectTint(await onBlack(active, "borderTopColor"), SKY, 0.45, "active border");
      expect(await active.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(255, 255, 255)");
      await expect(active).toHaveAttribute("aria-current", "page");
      await expect(def).not.toHaveAttribute("aria-current");

      const lg = await box(page.getByTestId("nib-lg"));
      expect([lg.w, lg.h, lg.icon]).toEqual([44, 44, 18]);
    });

    test("hover (fine pointer): Sky 10% fill, Sky 30% border, white icon", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, path);
      const button = page.getByTestId("nib-count");
      await button.hover();
      await expect
        .poll(async () => (await onBlack(button, "backgroundColor"))[2])
        .toBeGreaterThan(20);
      expectTint(await onBlack(button, "backgroundColor"), SKY, 0.1, "hover fill");
      expectTint(await onBlack(button, "borderTopColor"), SKY, 0.3, "hover border");
      await expect
        .poll(() => button.evaluate((el) => getComputedStyle(el).color))
        .toBe("rgb(255, 255, 255)");
    });

    test("every hover rule requires (hover: hover) and (pointer: fine) — no sticky hover on touch", async ({
      page,
    }) => {
      await load(page, path);
      const rules = await page.getByTestId("nib-count").evaluate((el) => {
        const found: { selector: string; media: string[] }[] = [];
        const children = (rule: CSSRule) =>
          "cssRules" in rule ? Array.from((rule as CSSGroupingRule).cssRules) : [];
        const styled = (rule: CSSRule) =>
          "style" in rule &&
          ["backgroundColor", "borderTopColor", "color"].some(
            (p) => (rule as CSSStyleRule).style[p as "color"] !== "",
          );
        const collect = (rule: CSSRule, selector: string, media: string[]) => {
          const next = rule instanceof CSSMediaRule ? [...media, rule.conditionText] : media;
          if (styled(rule)) found.push({ selector, media: next });
          for (const child of children(rule)) collect(child, selector, next);
        };
        const walk = (list: CSSRule[], media: string[]) => {
          for (const rule of list) {
            const next = rule instanceof CSSMediaRule ? [...media, rule.conditionText] : media;
            if (rule instanceof CSSStyleRule && /(?<!\\):hover/.test(rule.selectorText)) {
              let matches = false;
              try {
                matches = el.matches(
                  rule.selectorText
                    .replace(/(?<!\\):hover/g, "")
                    .replace(/(?<!\\):not\(:active\)/g, ""),
                );
              } catch {
                matches = false;
              }
              if (matches) {
                collect(rule, rule.selectorText, media);
                continue;
              }
            }
            walk(children(rule), next);
          }
        };
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            walk(Array.from(sheet.cssRules), []);
          } catch {
            // cross-origin sheet
          }
        }
        return found;
      });
      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        expect(
          rule.media.some((m) => m.includes("hover: hover") && m.includes("pointer: fine")),
          rule.selector,
        ).toBe(true);
      }
    });

    test("pressed (transient): Sky 14% fill while the pointer is down, back after release", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, path);
      const button = page.getByTestId("nib-count");
      // Press for real: hover (scrolls into view, like the Button spec), press, and confirm the
      // element matches :active before measuring. Under parallel load a late layout shift can
      // move the button away from the pointer, so the press is retried (the assertions are not
      // loosened).
      await expect(async () => {
        await page.mouse.up();
        await button.hover();
        await page.mouse.down();
        expect(await button.evaluate((el) => el.matches(":active"))).toBe(true);
      }).toPass({ timeout: 10_000 });
      // Wait for the 120 ms colour transition to settle, then require the exact Pressed values
      // (Sky 14% fill, Sky 30% border; same 1.5 tolerance as every other state check).
      const settled = async (property: "backgroundColor" | "borderTopColor", alpha: number) => {
        const actual = await onBlack(button, property);
        return SKY.every((c, i) => Math.abs((actual[i] ?? -99) - c * alpha) <= 1.5);
      };
      await expect.poll(() => settled("backgroundColor", 0.14)).toBe(true);
      await expect.poll(() => settled("borderTopColor", 0.3)).toBe(true);
      await page.mouse.up();
      await page.mouse.move(0, 0);
      await expect.poll(async () => (await onBlack(button, "backgroundColor"))[2]).toBeLessThan(15);
    });

    test("keyboard: Enter and Space activate; D-B2 focus ring; disabled is skipped and never activates", async ({
      page,
    }) => {
      await load(page, path);
      const count = page.getByTestId("nib-count");
      const value = page.getByTestId("nib-count-value");
      await count.focus();
      const ring = await count.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.outlineStyle, s.outlineWidth, s.outlineOffset];
      });
      expect(ring).toEqual(["solid", "2px", "2px"]);
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      await expect(value).toHaveText("2");

      const disabled = page.getByTestId("nib-count-disabled");
      await expect(disabled).toBeDisabled();
      expect(await disabled.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
      await disabled.click({ force: true });
      await expect(value).toHaveText("2");
      // Tab from the counter skips the disabled button and lands on the 44 search action.
      await count.focus();
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("nib-lg")).toBeFocused();
    });

    test("expandable action exposes aria-expanded and keeps the Default visual when open", async ({
      page,
    }) => {
      await load(page, path);
      const toggle = page.getByTestId("nib-expand");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toHaveAttribute("aria-haspopup", "dialog");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(toggle).not.toHaveAttribute("aria-current");
      await page.mouse.move(0, 0);
      await expect.poll(async () => (await onBlack(toggle, "backgroundColor"))[2]).toBeLessThan(15);
    });

    test("links are locale-aware; the disabled link is a non-focusable span announced as a link", async ({
      page,
    }) => {
      await load(page, path);
      await expect(page.getByTestId("nib-link-active")).toHaveAttribute(
        "href",
        `${prefix}/dashboard`,
      );
      await expect(page.getByTestId("nib-link")).toHaveAttribute("href", `${prefix}/lectures`);
      const disabled = page.getByTestId("nib-link-disabled");
      expect(await disabled.evaluate((el) => el.tagName)).toBe("SPAN");
      await expect(disabled).toHaveAttribute("role", "link");
      await expect(disabled).toHaveAttribute("aria-disabled", "true");
      await expect(disabled).not.toHaveAttribute("href");
      await expect(disabled).not.toHaveAttribute("tabindex");
      expect(
        await page
          .getByTestId("gallery-nib")
          .locator("a button, button a, a a, button button")
          .count(),
      ).toBe(0);
    });

    test("rendered icon contrast: Default ≥ 4.5:1, Active ≥ 4.5:1", async ({ page }, testInfo) => {
      await load(page, path);
      for (const id of ["nib-link", "nib-link-active", "nib-count"]) {
        const ratio = await iconContrast(page.getByTestId(id));
        testInfo.annotations.push({ type: `icon contrast ${id}`, description: ratio.toFixed(2) });
        expect(ratio, id).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("motion: colour transitions only, 200ms (existing tokens); reduced motion adds no movement", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await load(page, path);
      const m = await box(page.getByTestId("nib-count"));
      expect(m.transitionDuration.split(",")[0]?.trim()).toBe("0.2s");
      for (const property of m.transitionProperty.split(",").map((p) => p.trim())) {
        // `transition-colors` also covers Tailwind's gradient colour variables.
        expect(property, "transitioned property").toMatch(
          /color|fill|stroke|background|border|outline|decoration|--tw-gradient-(from|via|to)/,
        );
      }
    });

    test("axe on the section, with keyboard focus on an action", async ({ page }) => {
      await load(page, path);
      await page.getByTestId("nib-count").focus();
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include('[data-testid="gallery-nib"]')
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
      ).toEqual([]);
    });

    for (const width of [1440, 768, 390, 320]) {
      test(`${width}px: fixed sizes inside the viewport, no horizontal overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await load(page, path);
        const boxes = await page
          .getByTestId("gallery-nib")
          .locator("a, button, span[role='link']")
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
        expect(boxes).toHaveLength(7);
        for (const b of boxes) {
          expect([40, 44]).toContain(b.width);
          expect(b.left).toBeGreaterThanOrEqual(0);
          expect(b.right).toBeLessThanOrEqual(width);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }
  });
}

test.describe("Navigation Icon Button: locale document", () => {
  test("lang/dir per locale on the gallery", async ({ page }) => {
    for (const { path, locale, dir } of LOCALES) {
      await page.goto(path);
      expect(
        await page.evaluate(() => [document.documentElement.lang, document.documentElement.dir]),
      ).toEqual([locale, dir]);
    }
  });
});
