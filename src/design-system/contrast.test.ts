import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/*
 * Button label contrast on every surface the Button is allowed on (Phase 03, decisions D-B6 and
 * the Ember Hush rule, approved by the user 2026-11-13). See docs/design-values.md §6 and
 * docs/phases/phase-03-button-contract.md §4 and §12.
 *
 * Pure WCAG 2.x arithmetic in Node from the token values in tokens.css (single source of truth).
 * No DOM emulation is used: jsdom does not compute rendered colors. The rendered Button is
 * re-checked in a real browser (Playwright) when it is integrated.
 */

const tokensCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");

type Rgb = readonly [number, number, number];

function token(name: string): Rgb {
  const match = tokensCss.match(new RegExp(`--color-${name}:\\s*#([0-9a-f]{6});`, "i"));
  if (!match?.[1]) throw new Error(`Color token not found: --color-${name}`);
  const hex = match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb;
}

/** Source-over compositing of `color` at `alpha` on an opaque `background`. */
function over(color: Rgb, alpha: number, background: Rgb): Rgb {
  return color.map((c, i) => alpha * c + (1 - alpha) * (background[i] ?? 0)) as unknown as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number): number => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const voidBlack = token("surface-void-black");
const electricSky = token("accent-electric-sky");
const infoBlue = token("accent-info-blue");

/** Surfaces the Button may sit on (contract §12). Card surfaces are the translucent locals. */
const ALLOWED_SURFACES: Record<string, Rgb> = {
  "Void Black": voidBlack,
  Ink: token("surface-ink"),
  Obsidian: token("surface-obsidian"),
  Graphite: token("color-surface-graphite"),
  "Obsidian 88% card": over(token("surface-obsidian"), 0.88, voidBlack),
  "Graphite 95% card hover": over(token("color-surface-graphite"), 0.95, voidBlack),
};

/** Fill alphas per state (FIGMA, except Secondary Pressed: 20% instead of 24%, D-B6). */
const FILL = {
  primaryPressed: 0.78,
  secondaryDefault: 0.08,
  secondaryHover: 0.16,
  secondaryPressed: 0.2,
} as const;

/** WCAG 1.4.3 AA for normal text (Dashboard/Button is 14px SemiBold, not large text). */
const AA = 4.5;

describe.each(Object.entries(ALLOWED_SURFACES))("Button label on %s", (_, surface) => {
  it("Primary Default: Void Black on Electric Sky ≥ 4.5", () => {
    expect(contrast(voidBlack, electricSky)).toBeGreaterThanOrEqual(AA);
  });

  it("Primary Hover: Void Black on Info Blue ≥ 4.5", () => {
    expect(contrast(voidBlack, infoBlue)).toBeGreaterThanOrEqual(AA);
  });

  it("Primary Pressed: Void Black on Electric Sky 78% ≥ 4.5", () => {
    expect(
      contrast(voidBlack, over(electricSky, FILL.primaryPressed, surface)),
    ).toBeGreaterThanOrEqual(AA);
  });

  it.each([
    ["Default", FILL.secondaryDefault],
    ["Hover", FILL.secondaryHover],
    ["Pressed (20%, D-B6)", FILL.secondaryPressed],
  ])("Secondary %s: Electric Sky on its tint ≥ 4.5", (_state, alpha) => {
    expect(contrast(electricSky, over(electricSky, alpha, surface))).toBeGreaterThanOrEqual(AA);
  });
});

describe("why the decisions exist (documents the approved exceptions)", () => {
  it("the original Figma Secondary Pressed fill (24%) fails AA on Graphite", () => {
    const graphite = ALLOWED_SURFACES.Graphite as Rgb;
    expect(contrast(electricSky, over(electricSky, 0.24, graphite))).toBeLessThan(AA);
  });

  it("Secondary fails AA on Ember Hush, so the Secondary Button is not allowed there", () => {
    const emberHush = token("color-surface-ember-hush");
    expect(contrast(electricSky, over(electricSky, FILL.secondaryHover, emberHush))).toBeLessThan(
      AA,
    );
    expect(Object.keys(ALLOWED_SURFACES)).not.toContain("Ember Hush");
  });
});
