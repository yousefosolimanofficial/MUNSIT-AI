import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Dialog V1 browser checks on the temporary /dev/components gallery (contract
 * docs/phases/phase-03-dialog-contract.md §7, browser part). Real `showModal()`: top layer,
 * inertness, Esc, scrim, focus return, scroll lock, motion (§5.1), axe and 1440/768/390/320 in
 * RTL and LTR.
 */

const LOCALES = [
  { path: "/dev/components", dir: "rtl", close: "إغلاق" },
  { path: "/en/dev/components", dir: "ltr", close: "Close" },
] as const;
const VIEWPORTS = [1440, 768, 390, 320] as const;

const openDialog = (page: Page) => page.locator("dialog[open]");

/** `actual` is a color painted over black; expected = rgb × alpha (±1.5 for rounding). */
function expectOnBlack(actual: number[], rgb: [number, number, number], alpha: number): void {
  expect(actual).toHaveLength(3);
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha)).toBeLessThanOrEqual(1.5);
  });
}

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-dialog").locator("button"));
}

async function settle(locator: Locator): Promise<void> {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

/** CSS transitions running on the dialog: [property, duration ms]. */
async function transitions(dialog: Locator): Promise<[string, number][]> {
  return dialog.evaluate((el) =>
    el
      .getAnimations()
      .filter((a): a is CSSTransition => "transitionProperty" in a)
      .map((a) => [a.transitionProperty, Number(a.effect?.getTiming().duration ?? 0)]),
  );
}

async function expectClosed(page: Page, trigger: Locator): Promise<void> {
  await expect(openDialog(page)).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
}

for (const locale of LOCALES) {
  test.describe(`Dialog gallery ${locale.path}`, () => {
    test("opens modal, labelled, safe action focused, Figma shell values", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      await page.getByTestId("dialog-open-alert").click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await settle(dialog);
      await expect(page.getByTestId("dialog-alert-cancel")).toBeFocused();

      const measured = await dialog.evaluate((el) => {
        // Chromium composites the computed color (oklab / color-mix) over opaque black itself.
        const paint = (color: string) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return [];
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        const s = getComputedStyle(el);
        const b = getComputedStyle(el, "::backdrop");
        // Effective panel color: page → scrim → panel, composited by Chromium.
        const stack = (colors: string[]) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return [0, 0, 0];
          for (const color of ["#000", ...colors]) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
          }
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        const lum = (rgb: number[]) => {
          const [r, g, bl] = rgb.map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (bl ?? 0);
        };
        const panel = stack([
          getComputedStyle(document.documentElement).backgroundColor,
          getComputedStyle(document.body).backgroundColor,
          b.backgroundColor,
          s.backgroundColor,
        ]);
        const ratio = (selector: string) => {
          const text = el.querySelector(selector);
          if (!text) return 0;
          const [hi, lo] = [lum(stack([getComputedStyle(text).color])), lum(panel)].sort(
            (x, y) => y - x,
          );
          return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
        };
        const box = el.getBoundingClientRect();
        const tile = el
          .querySelector('[data-icon="alert"]')
          ?.parentElement?.getBoundingClientRect();
        return {
          modal: el.matches(":modal"),
          ariaModal: el.getAttribute("aria-modal"),
          name: el.getAttribute("aria-labelledby")
            ? document.getElementById(el.getAttribute("aria-labelledby") ?? "")?.tagName
            : null,
          width: box.width,
          left: box.left,
          right: box.right,
          radius: s.borderRadius,
          borderWidth: s.borderTopWidth,
          border: paint(s.borderTopColor),
          background: paint(s.backgroundColor),
          shadow: s.boxShadow,
          scrim: paint(b.backgroundColor),
          opacity: s.opacity,
          scale: s.scale,
          titleContrast: ratio("h2"),
          descriptionContrast: ratio("p"),
          tile: tile ? { width: tile.width, left: tile.left, right: tile.right } : null,
        };
      });
      expect(measured.modal).toBe(true);
      expect(measured.ariaModal).toBe("true");
      expect(measured.name).toBe("H2");
      expect(measured.width).toBe(440);
      expect(measured.left).toBeCloseTo((1440 - 440) / 2, 0);
      expect(measured.radius).toBe("24px");
      expect(measured.borderWidth).toBe("1px");
      expectOnBlack(measured.border, [99, 161, 255], 0.18); // Electric Sky 18%
      expectOnBlack(measured.background, [17, 18, 20], 0.98); // Obsidian 98%
      // Tailwind prefixes empty ring layers; the Figma shadow is the last (only visible) one.
      expect(measured.shadow.endsWith("rgba(0, 0, 0, 0.5) 0px 16px 40px 0px")).toBe(true);
      expectOnBlack(measured.scrim, [4, 5, 6], 0.66); // Void Black 66%
      expect(measured.opacity).toBe("1");
      // WCAG AA (4.5:1) on the rendered panel over the scrim.
      expect(measured.titleContrast).toBeGreaterThanOrEqual(4.5);
      expect(measured.descriptionContrast).toBeGreaterThanOrEqual(4.5);
      expect(["none", "1"]).toContain(measured.scale);
      // Icon tile 48 at inline-start: 1px border + 24 padding from the start edge.
      expect(measured.tile?.width).toBe(48);
      if (locale.dir === "rtl") expect(measured.tile?.right).toBeCloseTo(measured.right - 25, 0);
      else expect(measured.tile?.left).toBeCloseTo(measured.left + 25, 0);
    });

    test("focus trap: Tab and Shift+Tab never reach the page behind", async ({ page }) => {
      await load(page, locale.path);
      await page.getByTestId("dialog-open-header").click();
      const dialog = openDialog(page);
      await settle(dialog);
      const seen = new Set<string>();
      for (const key of [...Array<string>(8).fill("Tab"), ...Array<string>(8).fill("Shift+Tab")]) {
        await page.keyboard.press(key);
        const where = await page.evaluate(() => {
          const active = document.activeElement;
          const d = document.querySelector("dialog[open]");
          if (!active || active === document.body) return "body";
          return d?.contains(active)
            ? `in:${active.textContent ?? ""}|${active.getAttribute("aria-label") ?? ""}`
            : "OUTSIDE";
        });
        expect(where, key).not.toBe("OUTSIDE");
        seen.add(where);
      }
      // The close button and both actions were all reached.
      expect([...seen].filter((s) => s.startsWith("in:")).length).toBeGreaterThanOrEqual(3);
    });

    test("Esc, scrim click and the close button close it; focus returns", async ({ page }) => {
      await load(page, locale.path);
      const trigger = page.getByTestId("dialog-open-header");

      await trigger.click();
      await settle(openDialog(page));
      await page.keyboard.press("Escape");
      await expectClosed(page, trigger);

      await trigger.click();
      await settle(openDialog(page));
      await openDialog(page).getByRole("heading").click(); // inside: stays open
      await expect(openDialog(page)).toHaveCount(1);
      await page.mouse.click(4, 4); // scrim
      await expectClosed(page, trigger);

      await trigger.click();
      await settle(openDialog(page));
      await page.getByRole("button", { name: locale.close, exact: true }).click();
      await expectClosed(page, trigger);
    });

    test("motion: fade + scale entrance, exit before removal, clean rapid input", async ({
      page,
    }) => {
      await load(page, locale.path);
      const trigger = page.getByTestId("dialog-open-alert");
      await trigger.click();
      const dialog = page.getByRole("alertdialog");
      const entrance = await transitions(dialog);
      expect(entrance).toEqual(
        expect.arrayContaining([
          ["opacity", 320],
          ["scale", 320],
        ]),
      );
      await settle(dialog);

      await page.keyboard.press("Escape");
      // Still modal while the exit runs.
      const exiting = await page.evaluate(() => {
        const d = document.querySelector("dialog");
        return { open: d?.open, state: d?.dataset.state };
      });
      expect(exiting).toEqual({ open: true, state: "closing" });
      expect(await transitions(page.locator("dialog").first())).toEqual(
        expect.arrayContaining([["opacity", 200]]),
      );
      // Rapid extra input during the exit is ignored, and cleanup still completes.
      await page.keyboard.press("Escape");
      await page.mouse.click(4, 4);
      await expectClosed(page, trigger);

      // Reopening right after the exit replays the entrance and focuses again.
      await page.keyboard.press("Enter");
      await expect(page.getByRole("alertdialog")).toBeVisible();
      expect(await transitions(page.getByRole("alertdialog"))).toEqual(
        expect.arrayContaining([["opacity", 320]]),
      );
      await settle(page.getByRole("alertdialog"));
      await expect(page.getByTestId("dialog-alert-cancel")).toBeFocused();
    });

    test("reduced motion: opacity fade only, no scale", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await load(page, locale.path);
      await page.getByTestId("dialog-open-alert").click();
      const dialog = page.getByRole("alertdialog");
      const entrance = await transitions(dialog);
      expect(entrance.map(([p]) => p)).toContain("opacity");
      expect(entrance.map(([p]) => p)).not.toContain("scale");
      await settle(dialog);
      await page.keyboard.press("Escape");
      expect((await transitions(page.locator("dialog").first())).map(([p]) => p)).not.toContain(
        "scale",
      );
    });

    test("scroll lock: page does not scroll; position and width unchanged after close", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 600 });
      await load(page, locale.path);
      const trigger = page.getByTestId("dialog-open-alert");
      await trigger.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => ({
        y: window.scrollY,
        width: document.documentElement.clientWidth,
      }));
      await trigger.click();
      await settle(page.getByRole("alertdialog"));
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
      expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(before.width);
      await page.mouse.move(4, 300);
      await page.mouse.wheel(0, 600);
      expect(await page.evaluate(() => window.scrollY)).toBe(before.y);
      await page.keyboard.press("Escape");
      await expectClosed(page, trigger);
      expect(
        await page.evaluate(() => ({
          y: window.scrollY,
          width: document.documentElement.clientWidth,
        })),
      ).toEqual(before);
    });

    test("axe with each dialog open", async ({ page }) => {
      await load(page, locale.path);
      for (const id of ["alert", "header"]) {
        const trigger = page.getByTestId(`dialog-open-${id}`);
        await trigger.click();
        await settle(openDialog(page));
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .include("dialog[open]")
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
          id,
        ).toEqual([]);
        expect(
          results.passes.map((r) => r.id),
          JSON.stringify(
            results.incomplete.map((r) => ({ id: r.id, why: r.nodes[0]?.any[0]?.message })),
          ),
        ).toEqual(
          expect.arrayContaining(["aria-allowed-attr", "aria-valid-attr-value", "button-name"]),
        );
        // axe cannot resolve backgrounds in the top layer ("partially obscured"), so contrast is
        // measured directly in the shell test; any other incomplete result fails here.
        expect(
          results.incomplete.filter((r) => r.id !== "color-contrast").map((r) => r.id),
        ).toEqual([]);
        await page.keyboard.press("Escape");
        await expectClosed(page, trigger);
      }
    });

    for (const width of VIEWPORTS) {
      test(`${width}px: width capped to viewport − 40, long body scrolls, no overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 700 });
        await load(page, locale.path);
        await page.getByTestId("dialog-open-long").click();
        const dialog = openDialog(page);
        await settle(dialog);
        const m = await dialog.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const body = el.querySelector('[data-testid="dialog-long-body"]')?.parentElement;
          return {
            width: box.width,
            height: box.height,
            left: box.left,
            right: box.right,
            bodyScrolls: body ? body.scrollHeight > body.clientHeight : false,
            pageScroll: document.documentElement.scrollWidth,
            pageClient: document.documentElement.clientWidth,
          };
        });
        expect(m.width).toBe(Math.min(640, width - 40));
        expect(m.height).toBeLessThanOrEqual(700 - 40);
        expect(m.left).toBeGreaterThanOrEqual(0);
        expect(m.right).toBeLessThanOrEqual(width);
        expect(m.bodyScrolls).toBe(true);
        expect(m.pageScroll).toBeLessThanOrEqual(m.pageClient);
        await page.keyboard.press("Escape");
        await expect(openDialog(page)).toHaveCount(0);

        if (width === 390) {
          await page.getByTestId("dialog-open-alert").click();
          await settle(page.getByRole("alertdialog"));
          expect((await page.getByRole("alertdialog").boundingBox())?.width).toBe(350);
        }
      });
    }
  });
}
