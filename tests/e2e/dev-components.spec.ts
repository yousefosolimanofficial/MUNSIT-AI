import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Locator, Page } from "@playwright/test";

import { expect, test } from "./test";

/**
 * Button v1 integration checks on the temporary /dev/components gallery (contract §11,
 * integration tests): computed styles per state, rendered contrast on every allowed surface,
 * keyboard focus, 1440/768/390/320 in RTL and LTR with no horizontal overflow, and no hover on
 * touch. Expected colors are read from src/design-system/tokens.css, not from the page.
 *
 * Colors are compared and composited by Chromium itself: each computed color is painted onto a
 * 1×1 canvas over the real stack of ancestor backgrounds, so translucent fills (`/8`, `/78`, …)
 * are measured as rendered, never approximated in jsdom.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const tokensCss = readFileSync(join(root, "src/design-system/tokens.css"), "utf8");
function hex(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`).exec(tokensCss);
  if (!match?.[1]) throw new Error(`token --color-${name} not found`);
  return match[1];
}
function rgba(name: string, alpha = 1): string {
  const h = hex(name);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SKY = "accent-electric-sky";
const SURFACES = [
  "void-black",
  "ink",
  "obsidian",
  "obsidian-88",
  "graphite",
  "graphite-95",
] as const;
const LOCALES = [
  { path: "/dev/components", dir: "rtl", label: "متابعة" },
  { path: "/en/dev/components", dir: "ltr", label: "Continue" },
] as const;
const VIEWPORTS = [1440, 768, 390, 320] as const;

type State = "default" | "hover" | "pressed";
const EXPECTED: Record<"primary" | "secondary", Record<State, { bg: string; border?: string }>> = {
  primary: {
    default: { bg: rgba(SKY) },
    hover: { bg: rgba("accent-info-blue") },
    pressed: { bg: rgba(SKY, 0.78) },
  },
  secondary: {
    default: { bg: rgba(SKY, 0.08), border: rgba(SKY, 0.3) },
    hover: { bg: rgba(SKY, 0.16), border: rgba(SKY, 0.55) },
    pressed: { bg: rgba(SKY, 0.2), border: rgba(SKY, 0.55) },
  },
};

/** Waits until every running CSS transition on the element has finished. */
async function settle(locator: Locator): Promise<void> {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

interface Measured {
  height: number;
  paddingInline: [string, string];
  radius: string;
  borderWidth: string;
  bg: string;
  color: string;
  shadow: string;
  outline: string;
  outlineOffset: string;
  cursor: string;
  transform: string;
  /** Label, fill and expected colors composited by Chromium over the real ancestor stack. */
  label: [number, number, number];
  fill: [number, number, number];
  expectedFill: [number, number, number];
  expectedBorder: [number, number, number] | null;
  border: [number, number, number];
}

async function measure(
  button: Locator,
  expected: { bg: string; border?: string } = { bg: "transparent" },
): Promise<Measured> {
  await settle(button);
  return button.evaluate((el, exp) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    // Backgrounds of the ancestors, painted from <html> down to the button's parent.
    const stack: string[] = [];
    for (let node = el.parentElement; node; node = node.parentElement) {
      stack.unshift(getComputedStyle(node).backgroundColor);
    }
    const paint = (layers: string[]): [number, number, number] => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 1, 1);
      for (const layer of layers) {
        ctx.fillStyle = layer;
        ctx.fillRect(0, 0, 1, 1);
      }
      const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };
    const s = getComputedStyle(el);
    return {
      height: el.getBoundingClientRect().height,
      paddingInline: [s.paddingInlineStart, s.paddingInlineEnd] as [string, string],
      radius: s.borderRadius,
      borderWidth: s.borderTopWidth,
      bg: s.backgroundColor,
      color: s.color,
      // Tailwind composes empty ring/inset layers as transparent zero shadows; drop them.
      shadow:
        s.boxShadow
          .split(/,(?![^(]*\))/)
          .map((layer) => layer.trim())
          .filter((layer) => layer !== "none" && !layer.startsWith("rgba(0, 0, 0, 0)"))
          .join(", ") || "none",
      outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
      outlineOffset: s.outlineOffset,
      cursor: s.cursor,
      transform: s.transform,
      fill: paint([...stack, s.backgroundColor]),
      label: paint([...stack, s.backgroundColor, s.color]),
      expectedFill: paint([...stack, exp.bg]),
      expectedBorder: exp.border ? paint([...stack, exp.border]) : null,
      border: paint([...stack, s.borderTopColor]),
    };
  }, expected);
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
function near(actual: number[], expected: number[], tolerance = 2): boolean {
  return actual.every((v, i) => Math.abs(v - (expected[i] ?? -999)) <= tolerance);
}

async function enterState(page: Page, button: Locator, state: State): Promise<void> {
  await page.mouse.up();
  await page.mouse.move(0, 0);
  if (state === "default") return;
  await button.hover();
  if (state === "pressed") await page.mouse.down();
}

for (const locale of LOCALES) {
  test.describe(`Button gallery ${locale.path}`, () => {
    test("is served with dir and the localized label", async ({ page }) => {
      await page.goto(locale.path);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      await expect(page.getByRole("button", { name: locale.label })).toHaveCount(24);
      await expect(page.getByTestId("surface-ember-hush")).toHaveCount(0);
    });

    test("states: computed styles and rendered contrast >= 4.5:1 on every allowed surface", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(locale.path);
      await page.evaluate(() => document.fonts.ready);
      const report: string[] = [];

      for (const surface of SURFACES) {
        for (const variant of ["primary", "secondary"] as const) {
          const button = page.getByTestId(`btn-${surface}-${variant}`);
          for (const state of ["default", "hover", "pressed"] as const) {
            await enterState(page, button, state);
            const exp = EXPECTED[variant][state];
            const m = await measure(button, exp);
            const where = `${surface} ${variant} ${state}`;

            expect(m.height, where).toBe(44);
            expect(m.paddingInline, where).toEqual(["20px", "20px"]);
            expect(m.radius, where).toBe("12px");
            expect(m.borderWidth, where).toBe(variant === "secondary" ? "1px" : "0px");
            expect(m.transform, where).toBe("none");
            expect(m.cursor, where).toBe("pointer");
            expect(near(m.fill, m.expectedFill), `${where} fill ${m.bg}`).toBe(true);
            if (m.expectedBorder) {
              expect(near(m.border, m.expectedBorder), `${where} border`).toBe(true);
            }
            const shadow = variant === "primary" && state === "hover";
            expect(m.shadow, where).toBe(
              shadow ? "rgba(99, 161, 255, 0.35) 0px 4px 9px 0px" : "none",
            );
            if (variant === "secondary" && state === "pressed") {
              // D-B6: the computed fill carries alpha 0.2 (Figma's 24% is not used).
              expect(m.bg, where).toMatch(/[/,]\s*0\.2\)$/);
            }

            const ratio = contrast(m.label, m.fill);
            report.push(`${where}: ${ratio.toFixed(2)}`);
            expect(ratio, `${where} contrast`).toBeGreaterThanOrEqual(4.5);
          }
        }

        // Disabled: no hover or pressed change, Muted label, browser default cursor.
        for (const variant of ["primary", "secondary"] as const) {
          const button = page.getByTestId(`btn-${surface}-${variant}-disabled`);
          await enterState(page, button, "default");
          const idle = await measure(button);
          await button.hover({ force: true });
          await page.mouse.down();
          const pressed = await measure(button);
          await page.mouse.up();
          expect(pressed.bg).toBe(idle.bg);
          expect(pressed.shadow).toBe("none");
          expect(idle.color).toBe(rgba("text-muted").replace(", 1)", ")").replace("rgba", "rgb"));
          expect(idle.cursor).toBe("default");
          expect(idle.height).toBe(44);
        }
      }
      await test.info().attach("contrast.txt", { body: report.join("\n") });
    });

    test("keyboard: Tab reaches enabled buttons only, with a 2px Electric Sky focus-visible ring", async ({
      page,
    }) => {
      await page.goto(locale.path);
      const enabled = await page
        .locator("main button:not([disabled])")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")));
      expect(enabled).toHaveLength(12);

      // A mouse click focuses without a ring.
      const first = page.getByTestId("btn-void-black-primary");
      await first.click();
      expect((await measure(first)).outline).toMatch(/^none/);

      await page.mouse.click(1, 1);
      await page.locator("body").focus();
      const visited: (string | null)[] = [];
      for (let i = 0; i < enabled.length; i++) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        visited.push(await focused.getAttribute("data-testid"));
        const m = await measure(focused);
        expect(m.outline).toBe(
          `solid 2px ${rgba(SKY).replace(", 1)", ")").replace("rgba", "rgb")}`,
        );
        expect(m.outlineOffset).toBe("2px");
      }
      expect(visited).toEqual(enabled);
    });

    for (const width of VIEWPORTS) {
      test(`${width}px: 44px buttons, no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(locale.path);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
        const boxes = await page
          .locator("main button")
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
        expect(boxes).toHaveLength(24);
        for (const box of boxes) {
          expect(box.height).toBe(44);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
        }
      });
    }
  });
}

test.describe("touch (390, coarse pointer)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("tapping does not leave a hover fill", async ({ page }) => {
    await page.goto("/dev/components");
    const button = page.getByTestId("btn-void-black-primary");
    const before = await measure(button);
    await button.tap();
    // The brief :active (Pressed) after a tap is expected; once it ends, no hover fill stays.
    await expect.poll(async () => (await measure(button)).bg).toBe(before.bg);
    expect((await measure(button)).shadow).toBe("none");
  });
});
