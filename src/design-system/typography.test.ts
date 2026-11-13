import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const read = (path: string): string => readFileSync(path, "utf8");

const reference = read(join(root, "docs/references/MUNSIT_AI_Design_System_Reference_v1.0.md"));
const typographyCss = read(join(here, "typography.css"));

/** `Dashboard/*` rows of Design System Reference §2.1 — the expected values. */
const start = reference.indexOf("### 2.1");
const referenceSection = reference.slice(start, reference.indexOf("\n### ", start + 1));
const referenceStyles = [
  ...referenceSection.matchAll(
    /^\|\s*([A-Za-z ]+?)\s*\|\s*(Cairo|Inter|Geist Mono)\s*\|\s*[A-Za-z]+ (\d{3})\s*\|\s*(\d+) \/ (\d+)\s*\|\s*([\d.]+)\s*\|/gm,
  ),
].map(([, name = "", family = "", weight = "", size = "", lineHeight = "", tracking = ""]) => ({
  name,
  family,
  weight,
  size: `${size}px`,
  lineHeight: `${lineHeight}px`,
  tracking: `${tracking}px`,
  token: `--text-dashboard-${name.toLowerCase().split(" ").join("-")}`,
}));

function value(css: string, name: string): string | undefined {
  const escaped = name.replace(/[-]/g, "\\-");
  return css.match(new RegExp(`${escaped}:\\s*([^;]+);`))?.[1]?.trim();
}

describe("Dashboard/* text styles match the Design System Reference §2.1", () => {
  it("reference lists 11 Dashboard styles", () => {
    expect(referenceStyles).toHaveLength(11);
  });

  it("typography.css defines exactly those 11 styles, no extras", () => {
    const defined = [...typographyCss.matchAll(/(--text-[a-z0-9-]+?):\s*\d+px;/g)]
      .map((m) => m[1])
      .filter((name) => name !== undefined && !name.includes("--", 2));
    expect(defined.sort()).toEqual(referenceStyles.map((s) => s.token).sort());
  });

  it.each(referenceStyles)(
    "Dashboard/$name — $family $weight, $size / $lineHeight, tracking $tracking",
    ({ token, size, lineHeight, tracking, weight }) => {
      expect(value(typographyCss, token)).toBe(size);
      expect(value(typographyCss, `${token}--line-height`)).toBe(lineHeight);
      expect(value(typographyCss, `${token}--letter-spacing`)).toBe(tracking);
      expect(value(typographyCss, `${token}--font-weight`)).toBe(weight);
    },
  );

  it("families: Inter first then Cairo (script routing); Geist Mono for metadata", () => {
    expect(value(typographyCss, "--font-sans")).toBe(
      '"Inter", "Cairo", "Cairo Fallback", system-ui, sans-serif',
    );
    expect(value(typographyCss, "--font-mono")).toBe(
      '"Geist Mono", "Cairo", "Cairo Fallback", ui-monospace, monospace',
    );
  });
});

describe("Tailwind 4 typography utilities (real compiler, globals.css entry)", () => {
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
      "text-dashboard-title-l",
      "text-dashboard-meta",
      "font-sans",
      "font-mono",
      // Must NOT generate (off-system):
      "text-sm",
      "text-2xl",
      "font-serif",
      "leading-tight",
      "tracking-wide",
    ]);
  });

  it("one utility applies size, line height, letter spacing and weight", () => {
    const rule = css.match(/\.text-dashboard-title-l\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toContain("font-size: var(--text-dashboard-title-l)");
    expect(rule).toContain("var(--text-dashboard-title-l--line-height)");
    expect(rule).toContain("var(--text-dashboard-title-l--letter-spacing)");
    expect(rule).toContain("var(--text-dashboard-title-l--font-weight)");
  });

  it("font-sans and font-mono map to the MUNSIT stacks", () => {
    expect(css).toMatch(/\.font-sans\s*\{[^}]*var\(--font-sans\)/);
    expect(css).toMatch(/\.font-mono\s*\{[^}]*var\(--font-mono\)/);
  });

  it.each(["text-sm", "text-2xl", "font-serif", "leading-tight", "tracking-wide"])(
    "does not generate off-system utility .%s",
    (utility) => {
      expect(css).not.toMatch(new RegExp(`\\.${utility}\\s*\\{`));
    },
  );
});
