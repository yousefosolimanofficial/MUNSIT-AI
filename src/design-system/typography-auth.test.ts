import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

/*
 * Authentication typography tokens (Phase 08 Increment 1) against the Figma values recorded in
 * docs/design-values.md §0.4.5. The docs are the expected values; the CSS must define exactly
 * these styles, no extras.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const read = (path: string): string => readFileSync(path, "utf8");

const designValues = read(join(root, "docs/design-values.md"));
const authCss = read(join(here, "typography-auth.css"));

interface Expected {
  style: string;
  token: string;
  size: string;
  lineHeight: string;
  weight: string;
}

const tokenOf = (style: string) =>
  `--text-${style.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")}`;

/** `| Auth/… | SemiBold 600 | 20 | 150% |` rows (§0.4.5). */
const expected: Expected[] = [
  ...designValues.matchAll(
    /^\|\s*(Auth\/[A-Za-z/ ]+?)\s*\|\s*[A-Za-z]+ (\d{3})\s*\|\s*(\d+)\s*\|\s*(\d+)%\s*\|/gm,
  ),
].map(([, style = "", weight = "", size = "", lh = ""]) => ({
  style,
  token: tokenOf(style),
  size: `${size}px`,
  lineHeight: String(Number(lh) / 100),
  weight,
}));

function value(css: string, name: string): string | undefined {
  const escaped = name.replace(/[-]/g, "\\-");
  return css.match(new RegExp(`${escaped}:\\s*([^;]+);`))?.[1]?.trim();
}

describe("Auth typography tokens match design-values (Figma)", () => {
  it("design-values lists the 12 Auth/* styles", () => {
    expect(expected).toHaveLength(12);
  });

  it("typography-auth.css defines exactly those styles, no extras", () => {
    const defined = [...authCss.matchAll(/(--text-[a-z0-9-]+?):\s*\d+px;/g)]
      .map((m) => m[1])
      .filter((name): name is string => name !== undefined && !name.slice(2).includes("--"));
    expect(defined.sort()).toEqual(expected.map((e) => e.token).sort());
  });

  it.each(expected)("$style — $size / $lineHeight, weight $weight, tracking 0", (e) => {
    expect(value(authCss, e.token)).toBe(e.size);
    expect(value(authCss, `${e.token}--line-height`)).toBe(e.lineHeight);
    expect(value(authCss, `${e.token}--letter-spacing`)).toBe("0px");
    expect(value(authCss, `${e.token}--font-weight`)).toBe(e.weight);
  });
});

describe("Auth utilities compile (real Tailwind compiler, globals.css entry)", () => {
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
    css = compiler.build(["text-auth-heading-form", "text-auth-form-label"]);
  });

  it("an Auth utility sets size, line height and weight", () => {
    const rule = css.match(/\.text-auth-heading-form\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("font-size: var(--text-auth-heading-form)");
    expect(rule).toContain("var(--text-auth-heading-form--line-height)");
    expect(rule).toContain("var(--text-auth-heading-form--font-weight)");
    expect(css).toMatch(/\.text-auth-form-label\s*\{/);
  });
});
