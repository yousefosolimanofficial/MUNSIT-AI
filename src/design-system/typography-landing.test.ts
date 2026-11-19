import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

/*
 * Landing typography tokens (Phase 07 Increment 1) against the Figma values recorded in
 * docs/design-values.md: §0.4.4 (`Landing/*`, both tables) and the Foundation styles the Landing
 * uses (§0.4.3: Heading/Display, Heading/Medium, UI/Button, UI/Navigation). The docs are the
 * expected values; the CSS must define exactly these styles, no extras.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const read = (path: string): string => readFileSync(path, "utf8");

const designValues = read(join(root, "docs/design-values.md"));
const landingCss = read(join(here, "typography-landing.css"));

const WEIGHTS: Record<string, string> = {
  Regular: "400",
  Medium: "500",
  SemiBold: "600",
  Bold: "700",
  ExtraBold: "800",
};

interface Expected {
  style: string;
  token: string;
  size: string;
  lineHeight: string;
  weight: string;
}

const tokenOf = (style: string) =>
  `--text-${style.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")}`;
const ratio = (percent: string) => String(Number(percent) / 100);

/** `| Landing/… | Family | Weight 600 | 40 | 120% |` rows (§0.4.4, both tables). */
const landingRows: Expected[] = [
  ...designValues.matchAll(
    /^\|\s*(Landing\/[A-Za-z/ ]+?)\s*\|\s*(?:Cairo|Inter|Geist Mono)\s*\|\s*[A-Za-z]+ (\d{3})\s*\|\s*(\d+)\s*\|\s*(\d+)%\s*\|/gm,
  ),
].map(([, style = "", weight = "", size = "", lh = ""]) => ({
  style,
  token: tokenOf(style),
  size: `${size}px`,
  lineHeight: ratio(lh),
  weight,
}));

/** Foundation rows used by the Landing (§0.4.3); the weight is the first known word or number. */
const FOUNDATION = ["Heading/Display", "Heading/Medium", "UI/Button", "UI/Navigation"];
const foundationRows: Expected[] = FOUNDATION.map((style) => {
  const row = designValues
    .split("\n")
    .find((line) => line.startsWith(`| ${style} `) && /\|\s*\d+\s*\|\s*\d+%\s*\|/.test(line));
  if (!row) throw new Error(`design-values row missing: ${style}`);
  const cells = row.split("|").map((c) => c.trim());
  const weightCell = cells[3] ?? "";
  const weight =
    weightCell.match(/\b(\d{3})\b/)?.[1] ?? WEIGHTS[weightCell.split(" ")[0] ?? ""] ?? "";
  return {
    style,
    token: tokenOf(style),
    size: `${cells[4]}px`,
    lineHeight: ratio((cells[5] ?? "").replace("%", "")),
    weight,
  };
});

const expected = [...foundationRows, ...landingRows];

function value(css: string, name: string): string | undefined {
  const escaped = name.replace(/[-]/g, "\\-");
  return css.match(new RegExp(`${escaped}:\\s*([^;]+);`))?.[1]?.trim();
}

describe("Landing typography tokens match design-values (Figma)", () => {
  it("design-values lists the Landing set: 26 Landing/* styles and 4 Foundation styles", () => {
    expect(landingRows).toHaveLength(26);
    expect(foundationRows).toHaveLength(4);
  });

  it("UI/Navigation is verified at weight 400 (measured, §16.5), not the face name", () => {
    expect(foundationRows.find((r) => r.style === "UI/Navigation")?.weight).toBe("400");
    expect(landingRows.find((r) => r.style === "Landing/Navigation/Tablet")?.weight).toBe("800");
  });

  it("typography-landing.css defines exactly those styles, no extras", () => {
    const defined = [...landingCss.matchAll(/(--text-[a-z0-9-]+?):\s*\d+px;/g)]
      .map((m) => m[1])
      .filter((name): name is string => name !== undefined && !name.slice(2).includes("--"));
    expect(defined.sort()).toEqual(expected.map((e) => e.token).sort());
  });

  it.each(expected)("$style — $size / $lineHeight, weight $weight, tracking 0", (e) => {
    expect(value(landingCss, e.token)).toBe(e.size);
    expect(value(landingCss, `${e.token}--line-height`)).toBe(e.lineHeight);
    expect(value(landingCss, `${e.token}--letter-spacing`)).toBe("0px");
    expect(value(landingCss, `${e.token}--font-weight`)).toBe(e.weight);
  });
});

describe("Landing utilities compile (real Tailwind compiler, globals.css entry)", () => {
  let css = "";
  beforeAll(async () => {
    const entry = join(root, "src/app/globals.css");
    const compiler = await compile(read(entry), {
      base: dirname(entry),
      loadStylesheet: async (id, base) => {
        const path =
          id === "tailwindcss"
            ? join(root, "node_modules/tailwindcss/index.css")
            : resolve(base, id);
        return { path, base: dirname(path), content: read(path) };
      },
    });
    css = compiler.build(["text-ui-navigation", "text-landing-footer-link", "text-dashboard-body"]);
  });

  it("a Landing utility sets size, line height, tracking and weight; Dashboard ones still exist", () => {
    const rule = css.match(/\.text-ui-navigation\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("font-size: var(--text-ui-navigation)");
    expect(rule).toContain("var(--text-ui-navigation--line-height)");
    expect(rule).toContain("var(--text-ui-navigation--font-weight)");
    expect(css).toMatch(/\.text-landing-footer-link\s*\{/);
    expect(css).toMatch(/\.text-dashboard-body\s*\{/);
  });
});
