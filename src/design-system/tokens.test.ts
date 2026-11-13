import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const read = (path: string): string => readFileSync(path, "utf8");

const reference = read(join(root, "docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md"));
const tokensCss = read(join(here, "tokens.css"));
const motionCss = read(join(here, "motion.css"));

/** Lines of the reference between a heading and the next heading of the same level. */
function section(markdown: string, heading: string): string {
  const start = markdown.indexOf(heading);
  if (start === -1) throw new Error(`Heading not found in reference: ${heading}`);
  const level = heading.split(" ")[0] ?? "##";
  const next = markdown.indexOf(`\n${level} `, start + heading.length);
  return markdown.slice(start, next === -1 ? undefined : next);
}

/** "ColorSurface / Ember Hush" → "color-surface-ember-hush" (rule documented in tokens.css). */
function toCssName(figmaName: string): string {
  return figmaName
    .split("/")
    .map((part) =>
      part
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .split(/\s+/)
        .join("-"),
    )
    .join("-");
}

/** Custom property declarations (`--name: value;`) in a CSS string. */
function declarations(css: string, prefix: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const match of css.matchAll(new RegExp(`(${prefix}[a-z0-9-]+):\\s*([^;]+);`, "g"))) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined && value.trim() !== "initial") {
      result.set(name, value.trim());
    }
  }
  return result;
}

// ---------------------------------------------------------------------------- reference parsing

const referenceColors = [
  ...section(reference, "## 1. Color system").matchAll(
    /^\|\s*([A-Za-z]+ \/ [A-Za-z ]+?)\s*\|\s*(#[0-9a-fA-F]{6})\s*\|/gm,
  ),
].map(([, name = "", hex = ""]) => ({ name, hex, css: `--color-${toCssName(name)}` }));

function scaleRow(label: string): number[] {
  const row = section(reference, "### 3.1").match(
    new RegExp(`^\\|\\s*${label}[^|]*\\|\\s*([\\d /]+)\\|`, "m"),
  );
  if (!row?.[1]) throw new Error(`Row not found in reference §3.1: ${label}`);
  return row[1].split("/").map((value) => Number(value.trim()));
}

// -------------------------------------------------------------------------------------- tests

describe("color tokens match the Design System Reference", () => {
  const cssColors = declarations(tokensCss, "--color-");

  it("reference lists exactly 19 colors", () => {
    expect(referenceColors).toHaveLength(19);
  });

  it("tokens.css defines exactly 19 colors, no extras", () => {
    expect(cssColors.size).toBe(19);
    expect([...cssColors.keys()].sort()).toEqual(referenceColors.map((c) => c.css).sort());
  });

  it.each(referenceColors)("$name → $css = $hex", ({ css, hex }) => {
    expect(cssColors.get(css)).toBe(hex.toLowerCase());
  });
});

describe("spacing and radius tokens match the reference (HANDOFF values)", () => {
  const names = ["xs", "sm", "md", "lg", "xl"] as const;
  const radiusNames = ["sm", "md", "lg", "xl", "2xl"] as const;

  it("spacing XS–XL", () => {
    const expected = scaleRow("Space");
    const actual = declarations(tokensCss, "--spacing-");
    expect(actual.size).toBe(5);
    names.forEach((name, i) => expect(actual.get(`--spacing-${name}`)).toBe(`${expected[i]}px`));
  });

  it("radius SM–2XL", () => {
    const expected = scaleRow("Radius");
    const actual = declarations(tokensCss, "--radius-");
    expect(actual.size).toBe(5);
    radiusNames.forEach((name, i) =>
      expect(actual.get(`--radius-${name}`)).toBe(`${expected[i]}px`),
    );
  });
});

describe("motion tokens (approved 2026-11-13)", () => {
  it("durations and easing", () => {
    const durations = declarations(motionCss, "--transition-duration-");
    expect(Object.fromEntries(durations)).toEqual({
      "--transition-duration-fast": "120ms",
      "--transition-duration-base": "200ms",
      "--transition-duration-slow": "320ms",
      "--transition-duration-flip": "400ms",
    });
    expect(Object.fromEntries(declarations(motionCss, "--ease-"))).toEqual({
      "--ease-standard": "cubic-bezier(0.4, 0, 0.2, 1)",
    });
  });

  it("reduced motion removes movement and stops looping animations", () => {
    const reduced = motionCss.slice(motionCss.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/--motion-distance:\s*0;/);
    expect(reduced).toMatch(/animation-iteration-count:\s*1 !important;/);
    expect(reduced).toMatch(/animation-duration:\s*1ms !important;/);
  });

  it("direction sign is -1 in RTL and 1 in LTR", () => {
    expect(motionCss).toMatch(/\[dir="rtl"\]\s*\{\s*--motion-dir:\s*-1;/);
    expect(motionCss).toMatch(/\[dir="ltr"\]\s*\{\s*--motion-dir:\s*1;/);
  });
});

describe("Tailwind 4 @theme integration (real compiler, globals.css entry)", () => {
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
    css = compiler.build([
      "bg-surface-obsidian",
      "text-text-primary",
      "border-accent-electric-sky",
      "p-md",
      "gap-xl",
      "rounded-md",
      "rounded-2xl",
      "duration-base",
      "duration-flip",
      "ease-standard",
      "transition",
      // Must NOT generate (off-system):
      "bg-red-500",
      "text-white",
      "bg-black",
      "rounded-3xl",
      "ease-in-out",
      "animate-spin",
      "animate-pulse",
    ]);
  });

  it("emits exactly the 19 MUNSIT colors as theme variables", () => {
    expect(declarations(css, "--color-").size).toBe(19);
  });

  it("generates utilities from MUNSIT tokens", () => {
    expect(css).toMatch(/\.bg-surface-obsidian\s*\{[^}]*var\(--color-surface-obsidian\)/);
    expect(css).toMatch(/\.text-text-primary\s*\{[^}]*var\(--color-text-primary\)/);
    expect(css).toMatch(/\.p-md\s*\{[^}]*var\(--spacing-md\)/);
    expect(css).toMatch(/\.rounded-md\s*\{[^}]*var\(--radius-md\)/);
    expect(css).toMatch(/\.duration-base\s*\{[^}]*var\(--transition-duration-base\)/);
    expect(css).toMatch(/\.ease-standard\s*\{[^}]*var\(--ease-standard\)/);
  });

  it.each([
    "bg-red-500",
    "text-white",
    "bg-black",
    "rounded-3xl",
    "ease-in-out",
    "animate-spin",
    "animate-pulse",
  ])("does not generate off-system utility .%s", (utility) => {
    expect(css).not.toContain(`.${utility} {`);
    expect(css).not.toContain(`.${utility}{`);
  });

  it("bare `transition` uses the approved base duration and easing", () => {
    expect(css).toMatch(/--default-transition-duration:\s*var\(--transition-duration-base\)/);
    expect(css).toMatch(/--default-transition-timing-function:\s*var\(--ease-standard\)/);
  });
});
