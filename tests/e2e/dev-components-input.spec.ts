import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import AxeBuilder from "@axe-core/playwright";
import type { Locator, Page } from "@playwright/test";

import { expect, settleAnimations, test } from "./test";

/**
 * Input V1 integration checks on the temporary /dev/components gallery (Input contract §11,
 * integration): computed size and colors per state, rendered contrast for every row of §7 on the
 * real surfaces, keyboard focus, native disabled behavior, error ARIA, the email field's LTR
 * direction inside RTL, the rendered font per script, axe with focus, and 1440/768/390/320 in RTL
 * and LTR with no horizontal overflow. Expected colors come from src/design-system/tokens.css.
 *
 * As in dev-components.spec.ts, colors are composited by Chromium itself: each computed color is
 * painted onto a 1×1 canvas over the real stack of ancestor backgrounds.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const tokensCss = readFileSync(join(root, "src/design-system/tokens.css"), "utf8");
function rgba(name: string, alpha = 1): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`).exec(tokensCss);
  if (!match?.[1]) throw new Error(`token --color-${name} not found`);
  const h = match[1];
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SURFACES = ["void-black", "card", "obsidian", "graphite"] as const;
const STATES = ["default", "focused", "placeholder", "error", "disabled", "email"] as const;
const LOCALES = [
  {
    path: "/dev/components",
    dir: "rtl",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    error: "اكتب اسمك الكامل.",
  },
  {
    path: "/en/dev/components",
    dir: "ltr",
    name: "Full name",
    email: "Email",
    error: "Enter your full name.",
  },
] as const;
const VIEWPORTS = [1440, 768, 390, 320] as const;
const GLOW = "rgba(99, 161, 255, 0.25) 0px 0px 6px 2px";

type RGB = [number, number, number];

async function settle(locator: Locator): Promise<void> {
  await settleAnimations(locator);
}

interface Measured {
  height: number;
  paddingInline: [string, string];
  radius: string;
  borderWidth: string;
  shadow: string;
  outlineColor: string;
  transform: string;
  direction: string;
  textAlign: string;
  wrapperOpacity: string;
  focusVisible: boolean;
  font: { family: string; size: string; lineHeight: string; weight: string };
  labelFont: { family: string; size: string; lineHeight: string };
  bodyFamily: string;
  /** Composited over the real ancestor stack (the field's surface). */
  surface: RGB;
  ink: RGB;
  border: RGB;
  borderOnInk: RGB;
  value: RGB;
  placeholder: RGB | null;
  label: RGB;
  message: RGB | null;
  expected: Record<string, RGB>;
}

async function measure(input: Locator, expected: Record<string, string>): Promise<Measured> {
  await settle(input);
  return input.evaluate((el, exp) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("no 2d context");
    const stack: string[] = [];
    for (let node = el.parentElement; node; node = node.parentElement) {
      stack.unshift(getComputedStyle(node).backgroundColor);
    }
    const paint = (layers: string[]): [number, number, number] => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 1, 1);
      for (const layer of layers) {
        ctx.fillStyle = layer;
        ctx.fillRect(0, 0, 1, 1);
      }
      const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };
    const wrapper = el.parentElement;
    if (!wrapper) throw new Error("no wrapper");
    const labelEl = wrapper.querySelector("label");
    if (!labelEl) throw new Error("no label");
    const messageEl = wrapper.querySelector("p");
    const s = getComputedStyle(el);
    const ls = getComputedStyle(labelEl);
    const ink = s.backgroundColor;
    return {
      height: el.getBoundingClientRect().height,
      paddingInline: [s.paddingInlineStart, s.paddingInlineEnd] as [string, string],
      radius: s.borderRadius,
      borderWidth: s.borderTopWidth,
      shadow:
        s.boxShadow
          .split(/,(?![^(]*\))/)
          .map((layer) => layer.trim())
          .filter((layer) => layer !== "none" && !layer.startsWith("rgba(0, 0, 0, 0)"))
          .join(", ") || "none",
      outlineColor: s.outlineColor,
      transform: s.transform,
      direction: s.direction,
      textAlign: s.textAlign,
      wrapperOpacity: getComputedStyle(wrapper).opacity,
      focusVisible: el.matches(":focus-visible"),
      font: {
        family: s.fontFamily,
        size: s.fontSize,
        lineHeight: s.lineHeight,
        weight: s.fontWeight,
      },
      labelFont: { family: ls.fontFamily, size: ls.fontSize, lineHeight: ls.lineHeight },
      bodyFamily: getComputedStyle(document.body).fontFamily,
      surface: paint(stack),
      ink: paint([...stack, ink]),
      border: paint([...stack, s.borderTopColor]),
      borderOnInk: paint([...stack, ink, s.borderTopColor]),
      value: paint([...stack, ink, s.color]),
      placeholder: el.hasAttribute("placeholder")
        ? paint([...stack, ink, getComputedStyle(el, "::placeholder").color])
        : null,
      label: paint([...stack, ls.color]),
      message: messageEl ? paint([...stack, getComputedStyle(messageEl).color]) : null,
      expected: Object.fromEntries(
        Object.entries(exp).map(([key, color]) => [key, paint([...stack, color])]),
      ),
    };
  }, expected);
}

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
function near(actual: RGB, expected: RGB | undefined, tolerance = 2): boolean {
  return actual.every((v, i) => Math.abs(v - (expected?.[i] ?? -999)) <= tolerance);
}

/** Expected composited colors (the field's own border; ink fill; text colors). */
const EXPECTED = {
  ink: rgba("surface-ink"),
  muted: rgba("text-muted"),
  sky70: rgba("accent-electric-sky", 0.7),
  coral70: rgba("accent-coral-pulse", 0.7),
  sky14: rgba("accent-electric-sky", 0.14),
  label: rgba("text-secondary"),
  value: rgba("text-primary"),
  placeholder: rgba("text-muted-readable"),
  message: rgba("accent-coral-pulse"),
};

type PlatformFont = { familyName: string; glyphCount: number };

/** Fonts Chromium actually used to draw a node's text (CDP), including an input's value. */
async function platformFonts(page: Page, selector: string): Promise<PlatformFont[]> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root: doc } = await cdp.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.nodeId, selector });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await cdp.detach();
  return fonts.map(({ familyName, glyphCount }) => ({ familyName, glyphCount }));
}
async function families(page: Page, selector: string): Promise<string> {
  return (await platformFonts(page, selector)).map((f) => f.familyName).join(" | ");
}

for (const locale of LOCALES) {
  test.describe(`Input gallery ${locale.path}`, () => {
    test("is served with dir, 24 labelled inputs, and the email field LTR inside the page", async ({
      page,
    }) => {
      await page.goto(locale.path);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      await expect(page.getByTestId("gallery-input").locator("input")).toHaveCount(24);
      await expect(page.getByLabel(locale.name, { exact: true })).toHaveCount(20);
      await expect(page.getByLabel(locale.email, { exact: true })).toHaveCount(4);

      for (const surface of SURFACES) {
        const email = page.getByTestId(`input-${surface}-email`);
        await expect(email).toHaveAttribute("type", "email");
        await expect(email).toHaveAttribute("dir", "ltr");
        await expect(email).toHaveAttribute("autocomplete", "email");
        const dirs = await email.evaluate((el) => ({
          input: getComputedStyle(el).direction,
          label: getComputedStyle(el.parentElement?.querySelector("label") ?? el).direction,
        }));
        expect(dirs.input, surface).toBe("ltr");
        // The label still follows the document direction.
        expect(dirs.label, surface).toBe(locale.dir);
        // Other fields follow the document direction.
        const name = page.getByTestId(`input-${surface}-default`);
        expect(await name.evaluate((el) => getComputedStyle(el).direction)).toBe(locale.dir);
      }
    });

    test("states: computed size, colors and rendered contrast on every surface (contract §4, §7)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(locale.path);
      await page.evaluate(() => document.fonts.ready);
      const report: string[] = [];

      for (const surface of SURFACES) {
        for (const state of STATES) {
          const input = page.getByTestId(`input-${surface}-${state}`);
          await page.mouse.move(0, 0);
          if (state === "focused") await input.focus();
          else await page.locator("body").focus();
          const m = await measure(input, EXPECTED);
          const where = `${surface} ${state}`;

          // Size (§2), no transform (§8), fill Ink in every state.
          expect(m.height, where).toBe(46);
          expect(m.paddingInline, where).toEqual(["14px", "14px"]);
          expect(m.radius, where).toBe("12px");
          expect(m.borderWidth, where).toBe("1px");
          expect(m.transform, where).toBe("none");
          expect(m.textAlign, where).toBe("start");
          expect(near(m.ink, m.expected.ink), `${where} fill`).toBe(true);

          const borderKey =
            state === "error"
              ? "coral70"
              : state === "disabled"
                ? "sky14"
                : state === "focused"
                  ? "sky70"
                  : "muted";
          expect(near(m.border, m.expected[borderKey]), `${where} border ${borderKey}`).toBe(true);
          expect(m.focusVisible, where).toBe(state === "focused");
          expect(m.shadow, where).toBe(state === "focused" ? GLOW : "none");
          expect(m.wrapperOpacity, where).toBe(state === "disabled" ? "0.6" : "1");

          expect(near(m.label, m.expected.label), `${where} label color`).toBe(true);
          if (state === "error") {
            expect(m.message && near(m.message, m.expected.message), `${where} message`).toBe(true);
          } else {
            expect(m.message, where).toBeNull();
          }

          if (state === "disabled") continue; // Exempt from contrast (1.4.3, 1.4.11).
          const ratios: Record<string, number> = {
            label: contrast(m.label, m.surface),
            value: contrast(m.value, m.ink),

            "border/surface": contrast(m.border, m.surface),
            "border/ink": contrast(m.borderOnInk, m.ink),
          };
          if (m.message) ratios.message = contrast(m.message, m.surface);
          if (m.placeholder) ratios.placeholder = contrast(m.placeholder, m.ink);
          expect(m.placeholder !== null, where).toBe(state === "placeholder");
          report.push(
            `${where}: ${Object.entries(ratios)
              .map(([k, v]) => `${k} ${v.toFixed(2)}`)
              .join(", ")}`,
          );
          for (const key of ["label", "value", "placeholder", "message"]) {
            if (ratios[key] !== undefined) {
              expect(ratios[key], `${where} ${key}`).toBeGreaterThanOrEqual(4.5);
            }
          }
          expect(ratios["border/surface"], `${where} border/surface`).toBeGreaterThanOrEqual(3);
          expect(ratios["border/ink"], `${where} border/ink`).toBeGreaterThanOrEqual(3);
        }

        // Error + focus keeps Coral 70% and adds the glow. No hover state (D-I1).
        const error = page.getByTestId(`input-${surface}-error`);
        await error.focus();
        const ef = await measure(error, EXPECTED);
        expect(near(ef.border, ef.expected.coral70), `${surface} error+focus border`).toBe(true);
        expect(ef.shadow).toBe(GLOW);
        expect(contrast(ef.border, ef.surface)).toBeGreaterThanOrEqual(3);

        await page.locator("body").focus();
        const idle = page.getByTestId(`input-${surface}-default`);
        const before = await measure(idle, EXPECTED);
        await idle.hover();
        const hovered = await measure(idle, EXPECTED);
        expect(hovered.border, `${surface} hover`).toEqual(before.border);
        expect(hovered.shadow).toBe("none");
      }
      await test.info().attach("contrast.txt", { body: report.join("\n") });
    });

    test("error: aria-invalid, aria-describedby to the message, decorative icon", async ({
      page,
    }) => {
      await page.goto(locale.path);
      for (const surface of SURFACES) {
        const input = page.getByTestId(`input-${surface}-error`);
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(input).toHaveAccessibleName(locale.name);
        await expect(input).toHaveAccessibleDescription(locale.error);
        const id = await input.getAttribute("id");
        await expect(input).toHaveAttribute("aria-describedby", `${id}-message`);
        const message = page.locator(`[id="${id}-message"]`);
        await expect(message).toHaveText(locale.error);
        await expect(message.locator("svg")).toHaveAttribute("aria-hidden", "true");
        await expect(message).not.toHaveAttribute("role", /.+/);
        await expect(message).not.toHaveAttribute("aria-live", /.+/);

        for (const state of ["default", "focused", "placeholder", "disabled", "email"]) {
          const other = page.getByTestId(`input-${surface}-${state}`);
          await expect(other, `${surface} ${state}`).not.toHaveAttribute("aria-invalid", /.*/);
          await expect(other, `${surface} ${state}`).not.toHaveAttribute("aria-describedby", /.*/);
        }
      }
    });

    test("keyboard: Tab order skips disabled fields; focus-visible shows border and glow", async ({
      page,
    }) => {
      await page.goto(locale.path);
      const buttons = await page.locator("main button:not([disabled])").count();
      const expected = SURFACES.flatMap((surface) =>
        STATES.filter((s) => s !== "disabled").map((s) => `input-${surface}-${s}`),
      );

      await page.mouse.click(1, 1);
      await page.locator("body").focus();
      for (let i = 0; i < buttons; i++) await page.keyboard.press("Tab");

      const visited: (string | null)[] = [];
      for (let i = 0; i < expected.length; i++) {
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        visited.push(await focused.getAttribute("data-testid"));
        const m = await measure(focused, EXPECTED);
        expect(m.focusVisible).toBe(true);
        expect(m.shadow).toBe(GLOW);
        const isError = (visited.at(-1) ?? "").endsWith("-error");
        expect(near(m.border, m.expected[isError ? "coral70" : "sky70"])).toBe(true);
      }
      expect(visited).toEqual(expected);
    });

    test("disabled: native attribute, not focusable, typing changes nothing", async ({ page }) => {
      await page.goto(locale.path);
      for (const surface of SURFACES) {
        const input = page.getByTestId(`input-${surface}-disabled`);
        await expect(input).toBeDisabled();
        await expect(input).toBeEditable({ editable: false });
        const before = await input.inputValue();
        await input.click({ force: true });
        await page.keyboard.type("xyz");
        await expect(input).toHaveValue(before);
        await expect(input).not.toBeFocused();
      }
      // An enabled field does accept typing (control check).
      const enabled = page.getByTestId("input-void-black-placeholder");
      await enabled.fill("abc");
      await expect(enabled).toHaveValue("abc");
    });

    test("fonts: inherited Dashboard type; Arabic in Cairo, Latin in Inter, never a system face", async ({
      page,
    }) => {
      await page.goto(locale.path);
      await page.evaluate(() => document.fonts.ready);
      const m = await measure(page.getByTestId("input-void-black-default"), EXPECTED);
      // Native inputs inherit the project stack (no UA font): Dashboard/Body value,
      // Dashboard/Caption label.
      expect(m.font.family).toBe(m.bodyFamily);
      expect(m.font.family).toMatch(/^Inter, Cairo/);
      expect([m.font.size, m.font.lineHeight, m.font.weight]).toEqual(["14px", "22px", "400"]);
      expect(m.labelFont.family).toBe(m.bodyFamily);
      expect([m.labelFont.size, m.labelFont.lineHeight]).toEqual(["12px", "18px"]);

      const id = (state: string) => `[data-testid="input-void-black-${state}"]`;
      const script = locale.dir === "rtl" ? /cairo/i : /inter/i;
      const checks: [string, RegExp][] = [
        [id("default"), script], // value
        [id("placeholder"), script], // placeholder text
        [
          `label[for="${await page.getByTestId("input-void-black-default").getAttribute("id")}"]`,
          script,
        ],
        [id("email"), /inter/i], // Latin email value, in both locales
      ];
      for (const [selector, family] of checks) {
        await expect
          .poll(() => families(page, selector), { message: selector, timeout: 15_000 })
          .toMatch(family);
        const used = await families(page, selector);
        expect(used, selector).not.toMatch(/arial|segoe|tahoma|times/i);
      }
      // The email value is drawn entirely in Inter (no Cairo glyphs).
      expect(await families(page, id("email"))).not.toMatch(/cairo/i);
    });

    test("axe in the browser with keyboard focus on a field and on an error field", async ({
      page,
    }) => {
      await page.goto(locale.path);
      await page.evaluate(() => document.fonts.ready);
      for (const state of ["focused", "error"]) {
        await page.getByTestId(`input-card-${state}`).focus();
        await settle(page.getByTestId(`input-card-${state}`));
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .include('[data-testid="gallery-input"]')
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, sample: v.nodes[0]?.target.join(" ") })),
          state,
        ).toEqual([]);
        expect(results.passes.map((r) => r.id)).toEqual(
          expect.arrayContaining(["color-contrast", "label"]),
        );
      }
    });

    for (const width of VIEWPORTS) {
      test(`${width}px: 46px fields inside the viewport, no horizontal overflow`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(locale.path);
        await page.evaluate(() => document.fonts.ready);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
        const boxes = await page
          .getByTestId("gallery-input")
          .locator("input, label, p")
          .evaluateAll((els) =>
            els.map((el) => ({ tag: el.tagName, ...el.getBoundingClientRect().toJSON() })),
          );
        expect(boxes.filter((b) => b.tag === "INPUT")).toHaveLength(24);
        for (const box of boxes) {
          if (box.tag === "INPUT") expect(box.height).toBe(46);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
        }
      });
    }
  });
}
