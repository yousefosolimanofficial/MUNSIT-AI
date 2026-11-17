import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arPatterns from "../../src/i18n/messages/ar/patterns.json" with { type: "json" };
import enPatterns from "../../src/i18n/messages/en/patterns.json" with { type: "json" };

/**
 * Phase 06 Increment 1 gallery: guard dialog (D-U1) and danger Button (D-U2) on /dev/components.
 * Contrast is measured from the rendered computed colours, composited layer by layer: the label
 * over the button fill, over the dialog surface, over the scrim, over the page.
 */

const LOCALES = [
  { locale: "ar", dir: "rtl", prefix: "", guard: arPatterns.guard },
  { locale: "en", dir: "ltr", prefix: "/en", guard: enPatterns.guard },
] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** WCAG contrast of an element's text colour over its stacked translucent backgrounds. */
async function textContrast(target: Locator): Promise<number> {
  return target.evaluate((el) => {
    // Normalizes any computed colour syntax (rgb(), color(srgb …), oklab …) through a canvas.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const parse = (value: string) => {
      if (!ctx) return { r: 0, g: 0, b: 0, a: 0 };
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = value;
      ctx.fillRect(0, 0, 1, 1);
      const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
      return { r, g, b, a: a / 255 };
    };
    const layers: { r: number; g: number; b: number; a: number }[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg.a > 0) layers.push(bg);
      if (node instanceof HTMLDialogElement) {
        const backdrop = parse(getComputedStyle(node, "::backdrop").backgroundColor);
        if (backdrop.a > 0) layers.push(backdrop);
      }
    }
    let color = { r: 4, g: 5, b: 6 }; // page: Void Black
    for (const layer of layers.reverse()) {
      color = {
        r: color.r + (layer.r - color.r) * layer.a,
        g: color.g + (layer.g - color.g) * layer.a,
        b: color.b + (layer.b - color.b) * layer.a,
      };
    }
    const text = parse(getComputedStyle(el).color);
    const lin = (c: number) => {
      const v = c / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: { r: number; g: number; b: number }) =>
      0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const [hi, lo] = [lum(text), lum(color)].sort((x, y) => y - x);
    return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
  });
}

async function openGallery(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/components`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("guard-demo-unsaved"));
}

for (const { locale, dir, prefix, guard } of LOCALES) {
  test.describe(`Guard dialog gallery (${locale})`, () => {
    test("danger label contrast in the dialog: rest, hover, keyboard focus and pressed all ≥ 4.5", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("guard-demo-recording").click();
      const dialog = page.getByRole("alertdialog", { name: guard.recording.title });
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(400);
      const leave = dialog.getByRole("button", { name: guard.recording.leave });
      const color = await leave.evaluate((el) => getComputedStyle(el).color);
      expect(color).toBe("rgb(255, 99, 99)"); // Coral Pulse

      const rest = await textContrast(leave);
      await leave.hover();
      await page.waitForTimeout(250);
      const hover = await textContrast(leave);
      await page.mouse.move(5, 5);
      await page.keyboard.press("Tab"); // Stay → Leave
      await expect(leave).toBeFocused();
      await page.waitForTimeout(250);
      const focus = await textContrast(leave);
      const ring = await leave.evaluate((el) => getComputedStyle(el).outlineColor);
      expect(ring).toBe("rgb(99, 161, 255)");
      const box = await leave.boundingBox();
      await page.mouse.move((box?.x ?? 0) + 10, (box?.y ?? 0) + 10);
      await page.mouse.down();
      await page.waitForTimeout(200);
      const pressed = await textContrast(leave);
      await page.mouse.move(5, 5);
      await page.mouse.up();
      test.info().annotations.push({
        type: "contrast",
        description: JSON.stringify({ rest, hover, focus, pressed }),
      });
      for (const [state, value] of Object.entries({ rest, hover, focus, pressed })) {
        expect(value, state).toBeGreaterThanOrEqual(4.5);
      }
      // Calculated in design-values §15.4: 5.79 at rest, 4.66 pressed (D-B6 Sky 20%).
      expect(rest).toBeGreaterThan(pressed);
    });

    test("Stay is focused first and before Leave; Esc and scrim keep the page (stay)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      expect(await page.evaluate(() => document.dir)).toBe(dir);
      const opener = page.getByTestId("guard-demo-unsaved");
      await opener.click();
      const dialog = page.getByRole("alertdialog", { name: guard.unsaved.title });
      await expect(dialog.getByRole("button", { name: guard.unsaved.stay })).toBeFocused();
      const boxes = await dialog.locator("[data-guard-action]").evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { action: el.getAttribute("data-guard-action"), left: r.left };
        }),
      );
      const [stay, leave] = boxes;
      // Stay at the inline start: right in RTL, left in LTR.
      if (dir === "rtl") expect(stay?.left ?? 0).toBeGreaterThan(leave?.left ?? 0);
      else expect(stay?.left ?? 0).toBeLessThan(leave?.left ?? 0);

      await page.keyboard.press("Escape");
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(page.getByTestId("guard-demo-result")).toHaveText("Last result: stay");
      await expect(opener).toBeFocused();

      await opener.click();
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(400);
      await page.mouse.click(10, 10);
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(page.getByTestId("guard-demo-result")).toHaveText("Last result: stay");

      await opener.click();
      await dialog.getByRole("button", { name: guard.unsaved.leave }).click();
      await expect(page.getByTestId("guard-demo-result")).toHaveText("Last result: leave");
    });

    test("390: the dialog is 350 wide (viewport − 40), actions side by side; reduced motion fades only; axe", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      await openGallery(page, prefix);
      await page.getByTestId("guard-demo-recording").click();
      const dialog = page.getByRole("alertdialog", { name: guard.recording.title });
      await expect(dialog).toBeVisible();
      // Reduced motion: the running entrance transitions animate opacity, never scale.
      const entrance = await dialog.evaluate((el) =>
        el
          .getAnimations()
          .filter((a): a is CSSTransition => "transitionProperty" in a)
          .map((a) => a.transitionProperty),
      );
      expect(entrance).toContain("opacity");
      expect(entrance).not.toContain("scale");
      await page.waitForTimeout(400);
      const width = await dialog.evaluate((el) => Math.round(el.getBoundingClientRect().width));
      expect(width).toBe(350);
      const tops = await dialog
        .locator("[data-guard-action]")
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include('[role="alertdialog"]')
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });
}
