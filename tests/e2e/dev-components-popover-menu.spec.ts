import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, settleAnimations, test, waitForHydration } from "./test";

/**
 * Popover / Menu V1 browser checks on the temporary /dev/components gallery (contract
 * docs/phases/phase-03-popover-menu-contract.md §8, browser part). Real Popover API: top layer,
 * placement (offsets 6 / 9 / 16, RTL/LTR alignment, flip, viewport clamping), keyboard (APG menu
 * button, type-ahead in Arabic and English), dismissal, Esc inside Dialog and Sheet, Menu →
 * Dialog focus return, motion and reduced motion, axe and rendered contrast.
 */

const LOCALES = [
  {
    path: "/dev/components",
    dir: "rtl",
    rename: "إعادة تسمية",
    typeKey: "ا",
    deleteLabel: "حذف",
    oldest: "الأقدم أولًا",
  },
  {
    path: "/en/dev/components",
    dir: "ltr",
    rename: "Rename",
    typeKey: "r",
    deleteLabel: "Delete",
    oldest: "Oldest first",
  },
] as const;

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-popover-menu").locator("button"));
  // The section is the last on the page: room to scroll its triggers to the top (after hydration).
  await page.evaluate(() => {
    document.body.style.paddingBottom = "100vh";
  });
}

/** The popover panel controlled by a trigger. */
async function panelOf(page: Page, trigger: Locator): Promise<Locator> {
  const id = await trigger.getAttribute("aria-controls");
  return page.locator(`[id="${id ?? ""}"]`);
}

/**
 * Real key press through Chromium's input pipeline (CDP), also for Arabic characters that
 * Playwright's US-layout `keyboard.press` does not know.
 */
async function typeKey(page: Page, key: string): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, text: key });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key });
  await cdp.detach();
}

async function settle(locator: Locator): Promise<void> {
  await settleAnimations(locator);
}

async function transitions(locator: Locator): Promise<[string, number][]> {
  return locator.evaluate((el) =>
    el
      .getAnimations()
      .filter((a): a is CSSTransition => "transitionProperty" in a)
      .map((a) => [a.transitionProperty, Number(a.effect?.getTiming().duration ?? 0)]),
  );
}

/** Scrolls the trigger to the top of the viewport (room below), then opens it. */
async function open(page: Page, testId: string): Promise<{ trigger: Locator; panel: Locator }> {
  const trigger = page.getByTestId(testId);
  await trigger.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await trigger.click();
  const panel = await panelOf(page, trigger);
  await expect(panel).toBeVisible();
  await settle(panel);
  return { trigger, panel };
}

async function geometry(trigger: Locator, panel: Locator) {
  const t = await trigger.evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
  const p = await panel.evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
  return { t, p };
}

/** Colors composited by Chromium over the real stack; contrast of text against the panel. */
async function measure(panel: Locator, textSelector: string) {
  return panel.evaluate((el, selector) => {
    const paint = (colors: string[]) => {
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
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
    };
    const s = getComputedStyle(el);
    const panelRgb = paint([
      getComputedStyle(document.documentElement).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
      s.backgroundColor,
    ]);
    const text = el.querySelector(selector);
    const textRgb = paint([text ? getComputedStyle(text).color : "#000"]);
    const [hi, lo] = [lum(textRgb), lum(panelRgb)].sort((x, y) => y - x);
    return {
      radius: s.borderRadius,
      borderWidth: s.borderTopWidth,
      border: paint([s.borderTopColor]),
      background: paint([s.backgroundColor]),
      shadow: s.boxShadow,
      contrast: ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05),
      popoverOpen: el.matches(":popover-open"),
    };
  }, textSelector);
}

function expectOnBlack(actual: number[], rgb: [number, number, number], alpha: number): void {
  rgb.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel * alpha)).toBeLessThanOrEqual(1.5);
  });
}

for (const locale of LOCALES) {
  test.describe(`Popover / Menu gallery ${locale.path}`, () => {
    test("context menu: Figma values, offset 6, inline-end alignment, focus on the first item", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      const { trigger, panel } = await open(page, "menu-trigger-context");
      const m = await measure(panel, '[role="menuitem"]');
      expect(m.popoverOpen).toBe(true);
      expect(m.radius).toBe("14px");
      expect(m.borderWidth).toBe("1px");
      expectOnBlack(m.border, [99, 161, 255], 0.18);
      expectOnBlack(m.background, [27, 28, 30], 0.98);
      expect(m.shadow.endsWith("rgba(0, 0, 0, 0.5) 0px 16px 40px 0px")).toBe(true);
      expect(m.contrast).toBeGreaterThanOrEqual(4.5);
      const danger = await measure(panel, '[role="menuitem"]:last-of-type');
      expect(danger.contrast).toBeGreaterThanOrEqual(4.5);

      const { t, p } = await geometry(trigger, panel);
      expect(p.width).toBe(220);
      expect(p.top).toBeCloseTo(t.bottom + 6, 0);
      // Inline-end alignment (RTL: left edges; LTR: right edges), clamped 16 inside the viewport.
      const preferred = locale.dir === "rtl" ? t.left : t.right - p.width;
      const expectedLeft = Math.min(Math.max(preferred, 16), 1440 - 16 - p.width);
      expect(p.left).toBeCloseTo(expectedLeft, 0);
      const firstItem = panel.getByRole("menuitem").first();
      await expect(firstItem).toBeFocused();
      expect((await firstItem.boundingBox())?.height).toBe(40);
    });

    test("account menu offset 9 and items 44; popover offset 16, inline-start alignment", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      const account = await open(page, "menu-trigger-account");
      const a = await geometry(account.trigger, account.panel);
      expect(a.p.width).toBe(256);
      expect(a.p.top).toBeCloseTo(a.t.bottom + 9, 0);
      expect((await account.panel.getByRole("menuitem").first().boundingBox())?.height).toBe(44);
      expect(
        await account.panel.evaluate((el) => {
          const header = el.querySelector('[data-testid="menu-account-header"]');
          return !!header && !el.querySelector('[role="menu"]')?.contains(header);
        }),
      ).toBe(true);
      await page.keyboard.press("Escape");

      const pop = await open(page, "popover-trigger");
      const g = await geometry(pop.trigger, pop.panel);
      expect(g.p.width).toBe(380);
      expect(g.p.top).toBeCloseTo(g.t.bottom + 16, 0);
      if (locale.dir === "rtl") expect(g.p.right).toBeCloseTo(g.t.right, 0);
      else expect(g.p.left).toBeCloseTo(g.t.left, 0);
      const m = await measure(pop.panel, '[data-testid="popover-body"]');
      expect(m.radius).toBe("20px");
      expectOnBlack(m.background, [17, 18, 20], 0.97);
      expect(m.contrast).toBeGreaterThanOrEqual(4.5);
      await expect(pop.panel.getByRole("button").first()).toBeFocused();
    });

    test("keyboard: ArrowDown opens, Home/End, type-ahead, Enter selects, Tab closes", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      const trigger = page.getByTestId("menu-trigger-context");
      await trigger.evaluate((el) => el.scrollIntoView({ block: "start" }));
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      const panel = await panelOf(page, trigger);
      const items = panel.getByRole("menuitem");
      await expect(items.first()).toBeFocused();
      await page.keyboard.press("End");
      await expect(items.last()).toBeFocused();
      await page.keyboard.press("Home");
      await expect(items.first()).toBeFocused();
      await typeKey(page, locale.typeKey);
      await expect(panel.getByRole("menuitem", { name: locale.rename })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");

      const sort = page.getByTestId("menu-trigger-sort");
      await sort.focus();
      await page.keyboard.press("Enter");
      const sortPanel = await panelOf(page, sort);
      await expect(sortPanel.getByRole("menuitemradio").first()).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("menu-sort-value")).toHaveText("oldest");
      await expect(sort).toBeFocused();
      await sort.click();
      await expect(sortPanel.getByRole("menuitemradio", { name: locale.oldest })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    test("Esc and outside click dismiss; focus returns only on Esc", async ({ page }) => {
      await load(page, locale.path);
      const { trigger, panel } = await open(page, "menu-trigger-context");
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
      await expect(trigger).toBeFocused();
      await open(page, "popover-trigger");
      await page.mouse.click(5, 5);
      await expect(page.locator(":popover-open")).toHaveCount(0);
      await expect(page.getByTestId("popover-trigger")).not.toBeFocused();
    });

    for (const host of ["dialog", "sheet"] as const) {
      test(`Esc inside a ${host} closes only the menu`, async ({ page }) => {
        await page.setViewportSize({ width: host === "sheet" ? 390 : 1440, height: 844 });
        await load(page, locale.path);
        await page.getByTestId(`menu-open-${host}`).click();
        const modal = page.locator("dialog[open]");
        await expect(modal).toHaveCount(1);
        await settle(modal);
        const { trigger, panel } = await open(page, `menu-trigger-in-${host}`);
        await page.keyboard.press("Escape");
        await expect(panel).toBeHidden();
        await expect(modal).toHaveCount(1); // the modal stays open
        await expect(trigger).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(page.locator("dialog[open]")).toHaveCount(0);
      });
    }

    test("Menu → Dialog: focus returns to the menu trigger after the dialog closes", async ({
      page,
    }) => {
      await load(page, locale.path);
      const { trigger, panel } = await open(page, "menu-trigger-context");
      await page.keyboard.press("End");
      await expect(panel.getByRole("menuitem", { name: locale.deleteLabel })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(page.getByTestId("menu-confirm-cancel")).toBeFocused();
      await expect(panel).toBeHidden();
      await page.keyboard.press("Escape");
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });

    test("flips above when there is no room below; no layout shift on open", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 500 });
      await load(page, locale.path);
      const trigger = page.getByTestId("menu-trigger-context");
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="menu-trigger-context"]');
        const r = el?.getBoundingClientRect();
        if (r) window.scrollBy(0, r.bottom - (window.innerHeight - 40));
      });
      const before = await page.evaluate(() => ({
        y: window.scrollY,
        w: document.documentElement.scrollWidth,
      }));
      await trigger.click();
      const panel = await panelOf(page, trigger);
      await settle(panel);
      const { t, p } = await geometry(trigger, panel);
      expect(await panel.getAttribute("data-side")).toBe("top");
      expect(p.bottom).toBeCloseTo(t.top - 6, 0);
      expect(
        await page.evaluate(() => ({
          y: window.scrollY,
          w: document.documentElement.scrollWidth,
        })),
      ).toEqual(before);
    });

    for (const width of [390, 320] as const) {
      test(`${width}px: menus keep 16 and the popover 20 from the viewport edges`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await load(page, locale.path);
        for (const [id, margin] of [
          ["menu-trigger-account", 16],
          ["popover-trigger", 20],
        ] as const) {
          const trigger = page.getByTestId(id);
          await trigger.scrollIntoViewIfNeeded();
          await trigger.click();
          const panel = await panelOf(page, trigger);
          await settle(panel);
          const box = await panel.evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
          expect(box.left, id).toBeGreaterThanOrEqual(margin - 0.5);
          expect(box.right, id).toBeLessThanOrEqual(width - margin + 0.5);
          if (id === "popover-trigger") {
            expect(box.width).toBe(Math.min(380, width - 40)); // 350 at 390 (Figma)
          }
          await page.keyboard.press("Escape");
          await expect(panel).toBeHidden();
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }

    test("motion: 200ms fade/scale/slide in, 120ms fade/scale out while still shown", async ({
      page,
    }) => {
      await load(page, locale.path);
      const trigger = page.getByTestId("menu-trigger-context");
      await trigger.click();
      const panel = await panelOf(page, trigger);
      expect(await transitions(panel)).toEqual(
        expect.arrayContaining([
          ["opacity", 200],
          ["scale", 200],
          ["translate", 200],
        ]),
      );
      await settle(panel);
      await page.keyboard.press("Escape");
      expect(
        await panel.evaluate((el) => ({
          state: (el as HTMLElement).dataset.state,
          shown: el.matches(":popover-open"),
        })),
      ).toEqual({ state: "closing", shown: true });
      const exit = await transitions(panel);
      expect(exit).toEqual(expect.arrayContaining([["opacity", 120]]));
      expect(exit.map(([p]) => p)).not.toContain("translate");
      await expect(panel).toBeHidden();
    });

    test("reduced motion: opacity only", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await load(page, locale.path);
      const trigger = page.getByTestId("menu-trigger-context");
      await trigger.click();
      const panel = await panelOf(page, trigger);
      const entrance = (await transitions(panel)).map(([p]) => p);
      expect(entrance).toContain("opacity");
      expect(entrance).not.toContain("scale");
      expect(entrance).not.toContain("translate");
      await settle(panel);
      await page.keyboard.press("Escape");
      const exit = (await transitions(panel)).map(([p]) => p);
      expect(exit).toEqual(["opacity"]);
    });

    test("axe with each menu and the popover open", async ({ page }) => {
      await load(page, locale.path);
      for (const id of [
        "menu-trigger-context",
        "menu-trigger-sort",
        "menu-trigger-account",
        "popover-trigger",
      ]) {
        const { panel } = await open(page, id);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .include('[data-testid="gallery-popover-menu"]')
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
          id,
        ).toEqual([]);
        await page.keyboard.press("Escape");
        await expect(panel).toBeHidden();
      }
    });
  });
}
