import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, settleAnimations, test, waitForHydration } from "./test";

/**
 * Sheet V1 browser checks on the temporary /dev/components gallery (contract
 * docs/phases/phase-03-sheet-contract.md §8, browser part). Real `showModal()`: bottom shell
 * values, focus containment, Esc / scrim / close button, focus return, slide motion and reduced
 * motion, Sheet → Dialog with the shared scroll lock and focus stack (D-SH6), axe and rendered
 * contrast, 390 / 320 (plus 768 / 1440 render) in RTL and LTR.
 */

const LOCALES = [
  { path: "/dev/components", dir: "rtl", close: "إغلاق" },
  { path: "/en/dev/components", dir: "ltr", close: "Close" },
] as const;
const MOBILE = { width: 390, height: 844 } as const;

/** Open sheets only (the gallery's delete confirmation is an alertdialog in the same section). */
const openSheet = (page: Page) =>
  page.locator('[data-testid="gallery-sheet"] dialog[open]:not([role="alertdialog"])');

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-sheet").locator("button"));
}

async function settle(locator: Locator): Promise<void> {
  await settleAnimations(locator);
}

/** CSS transitions running on the element: [property, duration ms]. */
async function transitions(locator: Locator): Promise<[string, number][]> {
  return locator.evaluate((el) =>
    el
      .getAnimations()
      .filter((a): a is CSSTransition => "transitionProperty" in a)
      .map((a) => [a.transitionProperty, Number(a.effect?.getTiming().duration ?? 0)]),
  );
}

async function expectAllClosed(page: Page, trigger: Locator): Promise<void> {
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
}

/** `actual` is a color painted over black; expected = rgb × alpha (±1.5 for rounding). */
function expectOnBlack(actual: number[], rgb: [number, number, number], alpha: number): void {
  expect(actual).toHaveLength(3);
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha)).toBeLessThanOrEqual(1.5);
  });
}

for (const locale of LOCALES) {
  test.describe(`Sheet gallery ${locale.path}`, () => {
    test("bottom shell values, decorative grabber, close at inline-end, initial focus", async ({
      page,
    }) => {
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      await page.getByTestId("sheet-open-options").click();
      const sheet = openSheet(page);
      await expect(sheet).toBeVisible();
      await settle(sheet);
      const close = page.getByRole("button", { name: locale.close, exact: true });
      await expect(close).toBeFocused();

      const m = await sheet.evaluate((el) => {
        const paint = (colors: string[]) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return [];
          for (const color of ["#000", ...colors]) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
          }
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        const lum = (rgb: number[]) => {
          const [r, g, b] = rgb.map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
        };
        const s = getComputedStyle(el);
        const backdrop = getComputedStyle(el, "::backdrop");
        const panel = paint([
          getComputedStyle(document.documentElement).backgroundColor,
          getComputedStyle(document.body).backgroundColor,
          backdrop.backgroundColor,
          s.backgroundColor,
        ]);
        const title = el.querySelector("h2");
        const titleRgb = paint([title ? getComputedStyle(title).color : "#000"]);
        const [hi, lo] = [lum(titleRgb), lum(panel)].sort((x, y) => y - x);
        const box = el.getBoundingClientRect();
        const grabberRow = el.querySelector('[aria-hidden="true"]');
        const grabber = grabberRow?.querySelector("span")?.getBoundingClientRect();
        const closeBox = el.querySelector("button[aria-label]")?.getBoundingClientRect();
        const titleBox = title?.getBoundingClientRect();
        return {
          modal: el.matches(":modal"),
          ariaModal: el.getAttribute("aria-modal"),
          labelled: document.getElementById(el.getAttribute("aria-labelledby") ?? "")?.tagName,
          box: { left: box.left, right: box.right, bottom: box.bottom, width: box.width },
          radius: [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius],
          borderWidth: s.borderTopWidth,
          border: paint([s.borderTopColor]),
          background: paint([s.backgroundColor]),
          scrim: paint([backdrop.backgroundColor]),
          shadow: s.boxShadow,
          translate: s.translate,
          opacity: s.opacity,
          paddingInline: [s.paddingInlineStart, s.paddingInlineEnd],
          grabber: grabber ? { w: grabber.width, h: grabber.height } : null,
          grabberHidden: grabberRow?.getAttribute("aria-hidden"),
          close: closeBox
            ? { w: closeBox.width, h: closeBox.height, left: closeBox.left, right: closeBox.right }
            : null,
          title: titleBox ? { left: titleBox.left, right: titleBox.right } : null,
          contrast: ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05),
        };
      });
      expect(m.modal).toBe(true);
      expect(m.ariaModal).toBe("true");
      expect(m.labelled).toBe("H2");
      expect(m.box).toEqual({ left: 0, right: 390, bottom: 844, width: 390 });
      expect(m.radius).toEqual(["28px", "28px", "0px"]);
      expect(m.borderWidth).toBe("1px");
      expectOnBlack(m.border, [99, 161, 255], 0.18);
      expectOnBlack(m.background, [17, 18, 20], 0.98);
      expectOnBlack(m.scrim, [4, 5, 6], 0.66);
      expect(m.shadow.endsWith("rgba(0, 0, 0, 0.55) 0px 24px 64px 0px")).toBe(true);
      expect(["0px", "0px 0px", "none"]).toContain(m.translate);
      expect(m.opacity).toBe("1");
      expect(m.grabber).toEqual({ w: 40, h: 4 });
      expect(m.grabberHidden).toBe("true");
      expect(m.close).toMatchObject({ w: 40, h: 40 });
      expect(m.contrast).toBeGreaterThanOrEqual(4.5);
      // Close at inline-end (1px border + 20 padding from that edge); title at inline-start.
      if (locale.dir === "rtl") {
        expect(m.close?.left).toBeCloseTo(21, 0);
        expect(m.title?.right).toBeCloseTo(390 - 21, 0);
      } else {
        expect(m.close?.right).toBeCloseTo(390 - 21, 0);
        expect(m.title?.left).toBeCloseTo(21, 0);
      }
    });

    test("focus trap: Tab and Shift+Tab never reach the page behind", async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      await page.getByTestId("sheet-open-options").click();
      await settle(openSheet(page));
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
    });

    test("Esc, scrim click and the close button close it; focus returns", async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      const trigger = page.getByTestId("sheet-open-options");
      await trigger.scrollIntoViewIfNeeded();

      await trigger.click();
      await settle(openSheet(page));
      await page.keyboard.press("Escape");
      await expectAllClosed(page, trigger);

      await trigger.click();
      await settle(openSheet(page));
      await openSheet(page).getByRole("heading").click(); // inside: stays open
      await expect(openSheet(page)).toHaveCount(1);
      await page.mouse.click(195, 40); // scrim above the sheet
      await expectAllClosed(page, trigger);

      await trigger.click();
      await settle(openSheet(page));
      await page.getByRole("button", { name: locale.close, exact: true }).click();
      await expectAllClosed(page, trigger);
    });

    test("motion: slide up 320ms, slide down 200ms while still modal, clean rapid input", async ({
      page,
    }) => {
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      const trigger = page.getByTestId("sheet-open-options");
      await trigger.click();
      const sheet = openSheet(page);
      expect(await transitions(sheet)).toEqual(expect.arrayContaining([["translate", 320]]));
      await settle(sheet);

      await page.keyboard.press("Escape");
      const exiting = await page.evaluate(() => {
        const d = document.querySelector('[data-testid="gallery-sheet"] dialog');
        return {
          open: d instanceof HTMLDialogElement && d.open,
          state: d instanceof HTMLElement ? d.dataset.state : null,
        };
      });
      expect(exiting).toEqual({ open: true, state: "closing" });
      expect(
        await transitions(page.locator('[data-testid="gallery-sheet"] dialog').first()),
      ).toEqual(expect.arrayContaining([["translate", 200]]));
      await page.keyboard.press("Escape");
      await page.mouse.click(195, 40);
      await expectAllClosed(page, trigger);

      await page.keyboard.press("Enter"); // reopen from the restored trigger
      await expect(openSheet(page)).toBeVisible();
      expect(await transitions(openSheet(page))).toEqual(
        expect.arrayContaining([["translate", 320]]),
      );
    });

    test("reduced motion: no movement, opacity fade only", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      await page.getByTestId("sheet-open-options").click();
      const entrance = (await transitions(openSheet(page))).map(([p]) => p);
      expect(entrance).toContain("opacity");
      expect(entrance).not.toContain("translate");
      await settle(openSheet(page));
      await page.keyboard.press("Escape");
      const exit = (
        await transitions(page.locator('[data-testid="gallery-sheet"] dialog').first())
      ).map(([p]) => p);
      expect(exit).toContain("opacity");
      expect(exit).not.toContain("translate");
    });

    test("Sheet → Dialog: focus moves to the dialog, then back to the trigger; page scrolls after both close", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 600 });
      await load(page, locale.path);
      const trigger = page.getByTestId("sheet-open-options");
      await trigger.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => window.scrollY);

      await trigger.click();
      await settle(openSheet(page));
      await page.getByTestId("sheet-options-delete").click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expect(page.getByTestId("sheet-delete-cancel")).toBeFocused();
      await expect(openSheet(page)).toHaveCount(0); // the sheet finished its exit
      await expect(page.getByTestId("sheet-delete-cancel")).toBeFocused(); // still in the dialog
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");

      await page.keyboard.press("Escape");
      await expectAllClosed(page, trigger);
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
      await page.mouse.move(195, 300);
      await page.mouse.wheel(0, -400);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(before);
    });

    test("scroll lock without layout shift on a page with a scrollbar", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 600 });
      await load(page, locale.path);
      const trigger = page.getByTestId("sheet-open-options");
      await trigger.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => ({
        y: window.scrollY,
        width: document.documentElement.clientWidth,
      }));
      await trigger.click();
      await settle(openSheet(page));
      expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(before.width);
      await page.mouse.move(700, 100);
      await page.mouse.wheel(0, 600);
      expect(await page.evaluate(() => window.scrollY)).toBe(before.y);
      await page.keyboard.press("Escape");
      await expectAllClosed(page, trigger);
      expect(
        await page.evaluate(() => ({
          y: window.scrollY,
          width: document.documentElement.clientWidth,
        })),
      ).toEqual(before);
    });

    test("axe with each sheet open", async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await load(page, locale.path);
      for (const id of ["options", "upload"]) {
        const trigger = page.getByTestId(`sheet-open-${id}`);
        await trigger.click();
        await settle(openSheet(page));
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .include('[data-testid="gallery-sheet"] dialog[open]')
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
          id,
        ).toEqual([]);
        expect(results.passes.map((r) => r.id)).toEqual(
          expect.arrayContaining(["aria-allowed-attr", "aria-hidden-focus", "button-name"]),
        );
        // Top-layer contrast is "incomplete" in axe; it is measured in the shell test.
        expect(
          results.incomplete.filter((r) => r.id !== "color-contrast").map((r) => r.id),
        ).toEqual([]);
        await page.keyboard.press("Escape");
        await expectAllClosed(page, trigger);
      }
    });

    for (const [width, height] of [
      [390, 844],
      [320, 640],
      [768, 1024],
      [1440, 900],
    ] as const) {
      test(`${width}px: full width at the bottom, height ≤ viewport − 64, body scrolls, header and actions visible`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height });
        await load(page, locale.path);
        await page.getByTestId("sheet-open-upload").click();
        const sheet = openSheet(page);
        await settle(sheet);
        const m = await sheet.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const body = el.querySelector('[data-testid="sheet-long-body"]')?.parentElement;
          const header = el.querySelector("h2")?.getBoundingClientRect();
          const actions = body?.nextElementSibling?.getBoundingClientRect();
          return {
            left: box.left,
            width: box.width,
            top: box.top,
            bottom: box.bottom,
            height: box.height,
            bodyScrolls: body ? body.scrollHeight > body.clientHeight : false,
            headerTop: header?.top ?? -1,
            actionsBottom: actions?.bottom ?? Infinity,
            pageScroll: document.documentElement.scrollWidth,
            pageClient: document.documentElement.clientWidth,
          };
        });
        expect(m.left).toBe(0);
        expect(m.width).toBe(width);
        expect(m.bottom).toBeCloseTo(height, 0);
        expect(m.height).toBeLessThanOrEqual(height - 64);
        expect(m.top).toBeGreaterThanOrEqual(64 - 0.5);
        expect(m.bodyScrolls).toBe(true);
        // The overflowing body is reachable and scrollable by keyboard (WCAG 2.1.1).
        const body = sheet.getByRole("region");
        await expect(body).toHaveAttribute("tabindex", "0");
        await body.focus();
        await page.keyboard.press("PageDown");
        await expect.poll(() => body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
        expect(m.headerTop).toBeGreaterThanOrEqual(m.top);
        expect(m.actionsBottom).toBeLessThanOrEqual(height);
        expect(m.pageScroll).toBeLessThanOrEqual(m.pageClient);
      });
    }
  });
}
