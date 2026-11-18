import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";
import arPatterns from "../../src/i18n/messages/ar/patterns.json" with { type: "json" };
import enPatterns from "../../src/i18n/messages/en/patterns.json" with { type: "json" };

/**
 * Phase 06 Increment 4 — toast system (D-U6) on /dev/components. Figma `Settings / Toast`
 * `2462:1771`; placements `2464:3617` (Desktop, bottom gap 78) and `2464:4337` (Mobile, 118 above
 * the bottom, clear of the 84 bottom bar). Real timers: Success/Info 4 s, Error persistent.
 */

const LOCALES = [
  {
    locale: "ar",
    dir: "rtl",
    prefix: "",
    close: arPatterns.toast.close,
    error: "حصلت مشكلة أثناء حفظ التغييرات",
    retry: "إعادة المحاولة",
  },
  {
    locale: "en",
    dir: "ltr",
    prefix: "/en",
    close: enPatterns.toast.close,
    error: "Something went wrong while saving your changes",
    retry: "Try again",
  },
] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const TONES = {
  success: [89, 212, 153],
  error: [255, 99, 99],
  info: [86, 194, 255],
} as const;

const stack = (page: Page) => page.locator("[data-toast-stack]");
const toast = (page: Page, kind: keyof typeof TONES) => page.locator(`[data-toast="${kind}"]`);

async function openGallery(page: Page, prefix: string) {
  await page.goto(`${prefix}/dev/components`);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("toast-success"));
}

/** Waits until the toast's entry transition has settled (its position stops moving). */
async function settled(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate(
        (el) =>
          getComputedStyle(el).translate === "none" || getComputedStyle(el).translate === "0px",
      ),
    )
    .toBe(true);
  await locator.page().waitForTimeout(250); // > the 200ms entry transition
}

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

function expectTint(actual: number[], rgb: readonly number[], alpha: number, label: string) {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha), label).toBeLessThanOrEqual(1.5);
  });
}

async function renderedContrast(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    const chain: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node);
    for (const node of chain) {
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
    }
    const bg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    const fg = [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    const lin = (c: number) => {
      const v = c / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r = 0, g = 0, b = 0]: number[]) =>
      0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const [hi = 0, lo = 0] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
}

for (const { locale, dir, prefix, close, error, retry } of LOCALES) {
  test.describe(`Toast (${locale})`, () => {
    test("Figma values at 1440: 420 wide, centred, 78 above the bottom; tones, mark and text", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      for (const kind of ["success", "error", "info"] as const) {
        await page.getByTestId(`toast-${kind}`).click();
      }
      await settled(toast(page, "info"));
      const box = await toast(page, "info").evaluate((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const mark = el.querySelector("span") as HTMLElement;
        const m = mark.getBoundingClientRect();
        const text = el.querySelector("p") as HTMLElement;
        return {
          width: r.width,
          centre: Math.round(r.left + r.width / 2),
          bottomGap: Math.round(window.innerHeight - r.bottom),
          minHeight: s.minHeight,
          radius: s.borderTopLeftRadius,
          padding: [s.paddingTop, s.paddingInlineEnd, s.paddingBottom, s.paddingInlineStart],
          gap: s.columnGap,
          mark: [
            m.width,
            m.height,
            parseFloat(getComputedStyle(mark).borderTopLeftRadius) >= m.width / 2,
          ],
          icon: mark.querySelector("svg")?.getBoundingClientRect().width,
          text: [getComputedStyle(text).fontSize, getComputedStyle(text).lineHeight],
        };
      });
      expect(box).toEqual({
        width: 420,
        centre: 720,
        bottomGap: 78,
        minHeight: "52px",
        radius: "14px",
        padding: ["10px", "14px", "10px", "14px"],
        gap: "14px",
        mark: [22, 22, true], // fully round
        icon: 13,
        text: ["14px", "22px"],
      });
      for (const kind of ["success", "error", "info"] as const) {
        const item = toast(page, kind);
        expectTint(await onBlack(item, "backgroundColor"), [27, 28, 30], 0.98, `${kind} fill`);
        expectTint(await onBlack(item, "borderTopColor"), TONES[kind], 0.4, `${kind} border`);
        const mark = item.locator("span").first();
        expect(await onBlack(mark, "backgroundColor")).toEqual([...TONES[kind]]);
        expect(await onBlack(mark, "color")).toEqual([4, 5, 6]); // Void Black icon
        expect(await renderedContrast(item.locator("p"))).toBeGreaterThanOrEqual(4.5);
      }
      const action = toast(page, "error").getByRole("button", { name: retry });
      expect(await renderedContrast(action)).toBeGreaterThanOrEqual(4.5);
      // Mark at the inline start, close at the inline end.
      const order = await toast(page, "error").evaluate((el) => {
        const mark = el.querySelector("span")?.getBoundingClientRect();
        const closeButton = el.querySelector("button:last-of-type")?.getBoundingClientRect();
        return getComputedStyle(el).direction === "rtl"
          ? (mark?.left ?? 0) > (closeButton?.left ?? 0)
          : (mark?.left ?? 0) < (closeButton?.left ?? 0);
      });
      expect(order).toBe(true);
      expect(await page.evaluate(() => document.dir)).toBe(dir);
    });

    test("390 Mobile: 350 wide, 118 above the bottom, clear of the bottom bar, which stays usable", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-error").click();
      const item = toast(page, "error");
      await settled(item);
      const r = await item.evaluate((el) => {
        const b = el.getBoundingClientRect();
        return { width: b.width, bottomGap: Math.round(window.innerHeight - b.bottom) };
      });
      expect(r).toEqual({ width: 350, bottomGap: 118 });
      // The gallery has no bottom bar; the 84 bar would end 84 above the bottom: 34 clear.
      expect(r.bottomGap - 84).toBe(34);
      // Pointer events pass beside the toast (the stack itself never blocks controls).
      expect(await stack(page).evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
      expect(await item.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("auto");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });

    test("320: fits the viewport (280 wide), no overflow, text wraps inside", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-error").click();
      const r = await toast(page, "error").evaluate((el) => {
        const b = el.getBoundingClientRect();
        const inside = [...el.querySelectorAll("*")].every((c) => {
          const x = c.getBoundingClientRect();
          return x.left >= b.left - 0.5 && x.right <= b.right + 0.5;
        });
        return { width: b.width, inside };
      });
      expect(r).toEqual({ width: 280, inside: true });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });

    test("timing: success leaves after about 4 s; an error stays", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-success").click();
      await page.getByTestId("toast-error").click();
      await page.mouse.move(5, 5);
      await page.waitForTimeout(3000);
      await expect(toast(page, "success")).toHaveCount(1);
      await expect(toast(page, "success")).toHaveCount(0, { timeout: 3000 });
      await page.waitForTimeout(2000);
      await expect(toast(page, "error")).toHaveCount(1);
    });

    test("hover pauses the timer; leaving resumes it", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-info").click();
      await toast(page, "info").hover();
      await page.waitForTimeout(5500);
      await expect(toast(page, "info")).toHaveCount(1);
      await page.mouse.move(5, 5);
      await expect(toast(page, "info")).toHaveCount(0, { timeout: 6000 });
    });

    test("keyboard: close is reachable and dismisses; focus returns; new toasts never take focus", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      const trigger = page.getByTestId("toast-error");
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(toast(page, "error")).toHaveCount(1);
      await expect(trigger).toBeFocused(); // not moved to the toast
      const closeButton = toast(page, "error").getByRole("button", { name: close });
      await closeButton.focus();
      await page.keyboard.press("Enter");
      await expect(toast(page, "error")).toHaveCount(0);
      await expect(trigger).toBeFocused(); // returned
    });

    test("the error action runs and dismisses; four at once keep three, the error kept", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-error").click();
      await toast(page, "error").getByRole("button", { name: retry }).click();
      await expect(toast(page, "error")).toHaveCount(0);
      await expect(toast(page, "success")).toHaveCount(1); // the demo action shows a success
      await toast(page, "success").getByRole("button", { name: close }).click();

      await page.getByTestId("toast-burst").click();
      await expect(page.locator("[data-toast]")).toHaveCount(3);
      await expect(toast(page, "error")).toHaveCount(1);
      await expect(toast(page, "error")).toContainText(error);
    });

    test("announcements: polite for success/info, assertive for errors; toasts are not live regions", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-error").click();
      await expect(page.locator('[data-toast-announcer="assertive"]')).toHaveText(error);
      await expect(page.locator('[data-toast-announcer="assertive"]')).toHaveAttribute(
        "role",
        "alert",
      );
      await page.getByTestId("toast-info").click();
      await expect(page.locator('[data-toast-announcer="polite"]')).not.toHaveText("");
      await expect(page.locator('[data-toast-announcer="polite"]')).toHaveAttribute(
        "role",
        "status",
      );
      expect(await toast(page, "error").getAttribute("role")).toBeNull();
      expect(await toast(page, "error").getAttribute("aria-live")).toBeNull();
    });

    test("reduced motion: opacity transition, no movement", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 390, height: 844 });
      await openGallery(page, prefix);
      await page.getByTestId("toast-success").click();
      const motion = await toast(page, "success").evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          property: s.transitionProperty,
          distance: getComputedStyle(document.documentElement)
            .getPropertyValue("--motion-distance")
            .trim(),
        };
      });
      expect(motion.property).toContain("opacity");
      expect(motion.distance).toBe("0");
    });

    test("axe (WCAG 2.2 AA, contrast on) with all three variants", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openGallery(page, prefix);
      for (const kind of ["success", "error", "info"] as const) {
        await page.getByTestId(`toast-${kind}`).click();
      }
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .include("[data-toast-stack]")
        .analyze();
      expect(results.violations.map((v) => ({ id: v.id, target: v.nodes[0]?.target }))).toEqual([]);
    });
  });
}
