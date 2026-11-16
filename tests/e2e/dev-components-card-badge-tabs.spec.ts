import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, test, waitForHydration } from "./test";

/**
 * Card, Status Badge and Tabs browser checks on the temporary /dev/components gallery (contracts
 * docs/phases/phase-03-card-contract.md §11, phase-03-badge-contract.md §10 and
 * phase-03-tabs-contract.md §8): computed values, rendered text contrast composited over every
 * ancestor background, nested content, keyboard, disabled, reduced motion, axe, and
 * 1440 / 768 / 390 / 320 in RTL and LTR.
 */

const LOCALES = [
  { path: "/dev/components", dir: "rtl", forward: "ArrowLeft", back: "ArrowRight" },
  { path: "/en/dev/components", dir: "ltr", forward: "ArrowRight", back: "ArrowLeft" },
] as const;
const VIEWPORTS = [1440, 768, 390, 320] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const SKY: [number, number, number] = [99, 161, 255];

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await waitForHydration(page, page.getByTestId("gallery-tabs").getByRole("tab"));
}

function expectRgb(actual: number[], expected: readonly number[], label: string): void {
  expected.forEach((channel, i) => {
    expect(Math.abs((actual[i] ?? -99) - channel), label).toBeLessThanOrEqual(1.5);
  });
}

/** Background seen behind `el`: every ancestor background composited from the root down. */
async function backdrop(locator: Locator): Promise<number[]> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    const chain: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node);
    for (const node of chain) {
      ctx.fillStyle = getComputedStyle(node).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
    }
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  });
}

/** WCAG contrast of the element's text color over its composited backdrop. */
async function renderedContrast(locator: Locator): Promise<number> {
  const bg = await backdrop(locator);
  return locator.evaluate((el, back) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.fillStyle = `rgb(${back.join(",")})`;
    ctx.fillRect(0, 0, 1, 1);
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
    const [a, b] = [lum(fg), lum(back)].sort((x, y) => y - x);
    return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
  }, bg);
}

/** Border color composited over black (alpha check, as in the Avatar spec). */
async function borderOnBlack(locator: Locator): Promise<number[]> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return [];
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(el).borderTopColor;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  });
}

function box(locator: Locator) {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      border: s.borderTopWidth,
      borderStyle: s.borderTopStyle,
      radius: s.borderTopLeftRadius,
      padding: [s.paddingTop, s.paddingInlineStart, s.paddingBottom, s.paddingInlineEnd],
      transition: s.transitionDuration,
      shadow: s.boxShadow,
      animations: el.getAnimations().length,
    };
  });
}

for (const locale of LOCALES) {
  test.describe(`Card gallery ${locale.path}`, () => {
    test("computed fill, border, radius and padding per variant (contract §2)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      const cases = [
        ["card-surface-lg", "20px", "20px", "20px", [15, 16, 18], 0.14],
        ["card-surface-md", "20px", "16px", "16px", [15, 16, 18], 0.14],
        ["card-inset-0", "14px", "12px", "16px", [22, 23, 25], 0.12],
      ] as const;
      for (const [id, radius, block, inline, fill, alpha] of cases) {
        const card = page.getByTestId(id);
        const m = await box(card);
        expect(m.border, id).toBe("1px");
        expect(m.borderStyle, id).toBe("solid");
        expect(m.radius, id).toBe(radius);
        expect(m.padding, id).toEqual([block, inline, block, inline]);
        expect(m.transition, id).toBe("0s");
        expect(m.shadow, id).toBe("none");
        expect(m.animations, id).toBe(0);
        // Fill composited over the page: surface #0f1012, inset #161719 (contract §7).
        const inner = card.locator(":scope > *").first();
        expectRgb(await backdrop(inner), fill, `${id} fill`);
        expectRgb(
          await borderOnBlack(card),
          SKY.map((c) => c * alpha),
          `${id} border`,
        );
      }
    });

    test("rendered text contrast on surface and inset ≥ 4.5:1 (contract §7)", async ({
      page,
    }, testInfo) => {
      await load(page, locale.path);
      const surface = page.getByTestId("card-surface-lg");
      const inset = page.getByTestId("card-inset-0");
      const samples: [string, Locator][] = [
        ["surface · primary", surface.locator("h3")],
        ["surface · secondary", surface.locator("p").first()],
        ["surface · muted readable", surface.locator("p").nth(1)],
        ["inset · primary", inset.locator(":scope > span > span").first()],
        ["inset · badge (success green)", inset.locator("span[class*='success-green']")],
      ];
      for (const [label, locator] of samples) {
        const ratio = await renderedContrast(locator);
        testInfo.annotations.push({ type: `contrast ${label}`, description: ratio.toFixed(2) });
        expect(ratio, label).toBeGreaterThanOrEqual(4.5);
      }
    });

    test("nested content: inset rows stay inside the surface; only the inner Button is focusable", async ({
      page,
    }) => {
      for (const width of VIEWPORTS) {
        await page.setViewportSize({ width, height: 900 });
        await load(page, locale.path);
        const outer = await page.getByTestId("card-surface-md").boundingBox();
        for (const id of ["card-inset-0", "card-inset-1"]) {
          const row = page.getByTestId(id);
          const inner = await row.boundingBox();
          if (!outer || !inner) throw new Error("no box");
          expect(inner.x, `${width} ${id}`).toBeGreaterThanOrEqual(outer.x);
          expect(inner.x + inner.width, `${width} ${id}`).toBeLessThanOrEqual(
            outer.x + outer.width,
          );
          const button = await row.getByRole("button").boundingBox();
          if (!button) throw new Error("no button");
          expect(button.x).toBeGreaterThanOrEqual(inner.x);
          expect(button.x + button.width).toBeLessThanOrEqual(inner.x + inner.width);
        }
      }
      const section = page.getByTestId("gallery-card");
      await expect(section.locator("[tabindex], [role]")).toHaveCount(0);
      await section.getByRole("button").first().focus();
      await expect(section.getByRole("button").first()).toBeFocused();
    });
  });

  test.describe(`Status Badge gallery ${locale.path}`, () => {
    test("geometry, dot at the inline start, static (contract §2)", async ({ page }) => {
      await load(page, locale.path);
      for (const status of ["ready", "processing", "pending", "failed"]) {
        const badge = page.getByTestId(`badge-page-${status}`);
        const m = await box(badge);
        const rect = await badge.boundingBox();
        expect(rect?.height, status).toBe(30);
        expect(m.border, status).toBe("1px");
        expect(m.radius, status).toBe("8px");
        expect(m.padding, status).toEqual(["5px", "10px", "5px", "10px"]);
        expect(m.transition, status).toBe("0s");
        expect(m.animations, status).toBe(0);
        const [dot, label] = await badge
          .locator(":scope > span")
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
        if (!dot || !label) throw new Error("no dot or label");
        expect(dot.width).toBe(6);
        if (locale.dir === "rtl") expect(dot.left).toBeGreaterThan(label.left);
        else expect(dot.left).toBeLessThan(label.left);
        await expect(badge).not.toHaveAttribute("role");
        await expect(badge).not.toHaveAttribute("tabindex");
      }
    });

    test("rendered label contrast ≥ 4.5:1 on the page, a surface and an inset", async ({
      page,
    }, testInfo) => {
      await load(page, locale.path);
      for (const context of ["page", "surface", "inset"]) {
        for (const status of ["ready", "processing", "pending", "failed"]) {
          const label = page
            .getByTestId(`badge-${context}-${status}`)
            .locator(":scope > span")
            .nth(1);
          const ratio = await renderedContrast(label);
          testInfo.annotations.push({
            type: `contrast ${context} ${status}`,
            description: ratio.toFixed(2),
          });
          expect(ratio, `${context} ${status}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  });

  test.describe(`Tabs gallery ${locale.path}`, () => {
    test("each size is shown from its designed width; heights and the 2 × 3 grid (§2.4)", async ({
      page,
    }) => {
      const expected = { 1440: 4, 768: 3, 390: 2, 320: 2 } as const;
      for (const width of VIEWPORTS) {
        await page.setViewportSize({ width, height: 900 });
        await load(page, locale.path);
        // getByRole skips display:none samples, so count the markup itself.
        await expect(page.getByTestId("gallery-tabs").locator('[role="tablist"]')).toHaveCount(4);
        const visible = await page
          .getByTestId("gallery-tabs")
          .locator('[role="tablist"]')
          .evaluateAll((els) => els.filter((el) => el.getBoundingClientRect().width > 0).length);
        expect(visible, `${width}`).toBe(expected[width]);
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      const heights = async (id: string) =>
        page
          .getByTestId(id)
          .getByRole("tab")
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
      expect(new Set(await heights("tabs-default"))).toEqual(new Set([44]));
      expect(new Set(await heights("tabs-compact-row"))).toEqual(new Set([58]));
      const grid = await page
        .getByTestId("tabs-compact-grid")
        .getByRole("tab")
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
      expect(new Set(grid).size).toBe(2); // two rows of three
    });

    test("keyboard: automatic activation, direction-aware arrows, Home/End, Tab to panel, ring", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      const tabs = page.getByTestId("tabs-default");
      const active = tabs.getByRole("tab", { selected: true });
      await active.focus();
      await page.keyboard.press(locale.forward);
      const second = tabs.getByRole("tab").nth(1);
      await expect(second).toBeFocused();
      await expect(second).toHaveAttribute("aria-selected", "true");
      const panelId = await second.getAttribute("aria-controls");
      await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
      await page.keyboard.press(locale.back);
      await page.keyboard.press(locale.back); // wraps to the last tab
      await expect(tabs.getByRole("tab").last()).toBeFocused();
      await page.keyboard.press("Home");
      await expect(tabs.getByRole("tab").first()).toBeFocused();
      await page.keyboard.press("End");
      await expect(tabs.getByRole("tab").last()).toBeFocused();
      const ring = await tabs
        .getByRole("tab")
        .last()
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return [s.outlineStyle, s.outlineWidth, s.outlineColor];
        });
      expect(ring.slice(0, 2)).toEqual(["solid", "2px"]);
      await page.keyboard.press("Tab");
      await expect(tabs.getByRole("tabpanel")).toBeFocused();
    });

    test("disabled list: not focusable, no selection, 50% opacity, aria-disabled", async ({
      page,
    }) => {
      await load(page, locale.path);
      const tabs = page.getByTestId("tabs-disabled");
      const list = tabs.getByRole("tablist");
      await expect(list).toHaveAttribute("aria-disabled", "true");
      expect(await list.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
      for (const tab of await tabs.getByRole("tab").all()) await expect(tab).toBeDisabled();
      await tabs.getByRole("tab").nth(1).click({ force: true });
      await expect(tabs.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
    });

    test("rendered label contrast ≥ 4.5:1, inactive and active, both sizes", async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      for (const id of ["tabs-default", "tabs-compact-row"]) {
        for (const [state, tab] of [
          ["active", page.getByTestId(id).getByRole("tab", { selected: true })],
          ["inactive", page.getByTestId(id).getByRole("tab", { selected: false }).first()],
        ] as const) {
          const ratio = await renderedContrast(tab);
          testInfo.annotations.push({
            type: `contrast ${id} ${state}`,
            description: ratio.toFixed(2),
          });
          expect(ratio, `${id} ${state}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test("reduced motion: a selection change moves nothing (color fades only)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1440, height: 900 });
      await load(page, locale.path);
      await page.getByTestId("tabs-default").getByRole("tab").nth(1).click();
      const properties = await page
        .getByTestId("gallery-tabs")
        .getByRole("tab")
        .evaluateAll((els) =>
          els
            .flatMap((el) => el.getAnimations())
            .map((a) => (a as CSSTransition).transitionProperty ?? "keyframes"),
        );
      // Movement (transform, translate, scale, rotate) or keyframes would violate reduced motion.
      expect(properties.filter((p) => !/(^|-)color$|^fill$|^stroke$/.test(p))).toEqual([]);
    });
  });

  test.describe(`Tabs compact responsive fix ${locale.path}`, () => {
    // Approved fix (user, 2026-11-16): compact height is a 58px minimum (contract §3).
    for (const width of [320, 360, 390] as const) {
      test(`${width}px: labels readable, 8px clear of the border, equal rows, keyboard intact`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await load(page, locale.path);
        const tabs = page.getByTestId("tabs-compact-grid").getByRole("tab");
        const m = await tabs.evaluateAll((els) =>
          els.map((el) => {
            const b = el.getBoundingClientRect();
            const label = el.querySelector(":scope > span");
            const l = label?.getBoundingClientRect();
            const content = [...el.children].map((c) => c.getBoundingClientRect());
            return {
              text: label?.textContent ?? "",
              top: Math.round(b.top),
              height: b.height,
              lines:
                label && l
                  ? Math.round(l.height / parseFloat(getComputedStyle(label).lineHeight))
                  : 0,
              clipped: label ? label.scrollWidth > label.clientWidth + 0.5 : true,
              inside: l ? l.left >= b.left + 1 && l.right <= b.right - 1 : false,
              clearTop: Math.min(...content.map((c) => c.top)) - (b.top + 1),
              clearBottom: b.bottom - 1 - Math.max(...content.map((c) => c.bottom)),
              fontSize: label ? getComputedStyle(label).fontSize : "",
            };
          }),
        );
        expect(m).toHaveLength(6);
        for (const tab of m) {
          expect(tab.clipped, tab.text).toBe(false);
          expect(tab.inside, tab.text).toBe(true);
          expect(tab.clearTop, tab.text).toBeGreaterThanOrEqual(7.5); // 8px padding kept
          expect(tab.clearBottom, tab.text).toBeGreaterThanOrEqual(7.5);
          expect(tab.fontSize, tab.text).toBe("12px"); // Dashboard/Caption, never reduced
          expect(tab.height, tab.text).toBeGreaterThanOrEqual(58);
        }
        const rows = new Map<number, number[]>();
        for (const tab of m) rows.set(tab.top, [...(rows.get(tab.top) ?? []), tab.height]);
        expect(rows.size).toBe(2); // 2 × 3 grid
        for (const heights of rows.values()) expect(new Set(heights).size).toBe(1);
        if (width === 390) {
          // Figma Mobile: every label on one line, every tab 58 high.
          expect(m.map((tab) => tab.height)).toEqual(Array(6).fill(58));
          expect(m.every((tab) => tab.lines === 1)).toBe(true);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);

        await tabs.first().focus();
        await page.keyboard.press(locale.forward);
        await expect(tabs.nth(1)).toBeFocused();
        await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
        const outline = await tabs.nth(1).evaluate((el) => getComputedStyle(el).outlineStyle);
        expect(outline).toBe("solid");
      });
    }
  });

  test.describe(`Card, Badge and Tabs axe and viewports ${locale.path}`, () => {
    test("axe on the three sections, with keyboard focus on a tab", async ({ page }) => {
      await load(page, locale.path);
      await page.getByTestId("tabs-compact-grid").getByRole("tab", { selected: true }).focus();
      for (const id of ["gallery-card", "gallery-badge", "gallery-tabs"]) {
        const results = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .include(`[data-testid="${id}"]`)
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
          id,
        ).toEqual([]);
      }
    });

    for (const width of VIEWPORTS) {
      test(`${width}px: no horizontal overflow; every card, badge and visible tab inside the viewport`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await load(page, locale.path);
        const boxes = await page
          .locator(
            '[data-testid^="card-"], [data-testid^="badge-"], [data-testid="gallery-tabs"] [role="tab"]',
          )
          .evaluateAll((els) =>
            els
              .map((el) => el.getBoundingClientRect())
              .filter((r) => r.width > 0)
              .map((r) => [r.left, r.right]),
          );
        expect(boxes.length).toBeGreaterThan(0);
        for (const [left, right] of boxes) {
          expect(left).toBeGreaterThanOrEqual(0);
          expect(right).toBeLessThanOrEqual(width);
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

/**
 * M-1 (Motion & Interaction Audit): the `default` tab hover applies only under
 * `(hover: hover) and (pointer: fine)`, like Button and Menu, so touch never leaves a sticky
 * hover fill. 1280 wide: the `default` row is shown from `lg` (gallery, D-T3).
 */
const tabBg = (tab: Locator) => tab.evaluate((el) => getComputedStyle(el).backgroundColor);
const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("Tabs hover, fine pointer (M-1)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("hovering an inactive default tab shows the White 5% fill and white label", async ({
    page,
  }) => {
    await load(page, "/dev/components");
    expect(
      await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
    ).toBe(true);
    const tab = page.getByTestId("tabs-default").getByRole("tab", { selected: false }).first();
    expect(await tabBg(tab)).toBe(TRANSPARENT);
    await tab.hover();
    await expect.poll(() => tabBg(tab)).not.toBe(TRANSPARENT);
    await expect
      .poll(() => tab.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(255, 255, 255)");
  });
});

test.describe("Tabs hover rules, coarse pointers (M-1)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("every hover rule that styles an inactive default tab requires (hover: hover) and (pointer: fine)", async ({
    page,
  }) => {
    // Chromium cannot emulate hover/pointer media features here, so the loaded stylesheet is
    // checked instead. Tailwind's `hover:` alone only adds `(hover: hover)`, which still matches
    // devices with a coarse primary pointer.
    await load(page, "/dev/components");
    const tab = page.getByTestId("tabs-default").getByRole("tab", { selected: false }).first();
    const rules = await tab.evaluate((el) => {
      // Tailwind 4 emits nested CSS: `.x:enabled:hover { @media (...) { background-color } }`, so
      // declarations can sit in nested blocks under the hover rule; each one is collected with
      // every media condition around it.
      const found: { selector: string; media: string[] }[] = [];
      const hasStyle = (rule: CSSRule) =>
        "style" in rule &&
        ((rule as CSSStyleRule).style.backgroundColor !== "" ||
          (rule as CSSStyleRule).style.color !== "");
      const children = (rule: CSSRule) =>
        "cssRules" in rule ? Array.from((rule as CSSGroupingRule).cssRules) : [];
      const collect = (rule: CSSRule, selector: string, media: string[]) => {
        const next = rule instanceof CSSMediaRule ? [...media, rule.conditionText] : media;
        if (hasStyle(rule)) found.push({ selector, media: next });
        for (const child of children(rule)) collect(child, selector, next);
      };
      const walk = (list: CSSRule[], media: string[]) => {
        for (const rule of list) {
          const next = rule instanceof CSSMediaRule ? [...media, rule.conditionText] : media;
          if (rule instanceof CSSStyleRule && rule.selectorText.includes(":hover")) {
            let matches = false;
            try {
              // Strip only the :hover pseudo-class, not the escaped "\:hover\:" in class names.
              matches = el.matches(rule.selectorText.replace(/(?<!\\):hover/g, ""));
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
          // cross-origin sheet: not ours
        }
      }
      return found;
    });
    expect(rules.length).toBeGreaterThan(0); // the designed hover exists
    for (const rule of rules) {
      expect(
        rule.media.some((m) => m.includes("hover: hover") && m.includes("pointer: fine")),
        rule.selector,
      ).toBe(true);
    }
  });
});

test.describe("Tabs tap (touch emulation)", () => {
  test.use({ viewport: { width: 1280, height: 900 }, hasTouch: true, isMobile: true });

  test("tapping selects a default tab and leaves the previous one without a fill", async ({
    page,
  }) => {
    await load(page, "/dev/components");
    const tabs = page.getByTestId("tabs-default").getByRole("tab");
    await tabs.nth(1).tap();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await tabs.nth(3).tap();
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
    await page.waitForTimeout(300);
    expect(await tabBg(tabs.nth(1))).toBe(TRANSPARENT);
  });
});
