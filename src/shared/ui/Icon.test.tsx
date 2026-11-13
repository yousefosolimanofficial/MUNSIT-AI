import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

import { ICON_NAMES, ICON_SIZES } from "@/design-system/icons/manifest";

import { Icon } from "./Icon";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function svgAttrs(html: string): Map<string, string> {
  const tag = html.match(/<svg\b[^>]*>/)?.[0] ?? "";
  return new Map(
    [...tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map(([, k = "", v = ""]) => [
      k,
      v.replaceAll("&amp;", "&"),
    ]),
  );
}

describe.each(ICON_NAMES)("<Icon name=%s>", (name) => {
  const html = renderToStaticMarkup(<Icon name={name} />);
  const svg = svgAttrs(html);

  it("renders a 24×24 viewBox at native size by default", () => {
    expect(svg.get("viewBox")).toBe("0 0 24 24");
    expect(svg.get("width")).toBe("24");
    expect(svg.get("height")).toBe("24");
    expect(svg.get("fill")).toBe("none");
  });

  it("every shape uses currentColor and keeps a 1.75 non-scaling stroke", () => {
    const shapes = [...html.matchAll(/<(path|rect)\b[^>]*>/g)].map((m) => m[0]);
    expect(shapes.length).toBeGreaterThan(0);
    for (const shape of shapes) {
      expect(shape).toContain('stroke="currentColor"');
      expect(shape).toContain('stroke-width="1.75"');
      expect(shape).toContain('vector-effect="non-scaling-stroke"');
      expect(shape).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });

  it("is decorative (hidden from assistive tech) without a label", () => {
    expect(svg.get("aria-hidden")).toBe("true");
    expect(svg.get("focusable")).toBe("false");
    expect(svg.has("role")).toBe(false);
  });

  it(name === "arrowLeft" ? "mirrors in LTR only" : "never mirrors", () => {
    const className = svg.get("class") ?? "";
    if (name === "arrowLeft") expect(className).toBe("[scale:calc(var(--motion-dir)*-1)_1]");
    else expect(className).not.toMatch(/scale|rotate|mirror/);
  });
});

describe("<Icon> props", () => {
  it("applies the approved placement sizes", () => {
    for (const size of Object.values(ICON_SIZES)) {
      const svg = svgAttrs(renderToStaticMarkup(<Icon name="home" size={size} />));
      expect([svg.get("width"), svg.get("height")]).toEqual([String(size), String(size)]);
    }
  });

  it("exposes a meaningful label as an image with an accessible name", () => {
    const svg = svgAttrs(renderToStaticMarkup(<Icon name="bell" label="الإشعارات" />));
    expect(svg.get("role")).toBe("img");
    expect(svg.get("aria-label")).toBe("الإشعارات");
    expect(svg.has("aria-hidden")).toBe(false);
  });

  it("passes className through (color via a Design System text utility)", () => {
    const svg = svgAttrs(
      renderToStaticMarkup(<Icon name="arrowLeft" className="text-accent-electric-sky" />),
    );
    expect(svg.get("class")).toBe("[scale:calc(var(--motion-dir)*-1)_1] text-accent-electric-sky");
  });
});

describe("Tailwind generates the LTR mirror rule", () => {
  it("mirror utility flips by the nearest dir via --motion-dir (no :dir / [dir] selectors)", async () => {
    const entry = join(root, "src/app/globals.css");
    const read = (path: string): string => readFileSync(path, "utf8");
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
    const css = compiler.build(["[scale:calc(var(--motion-dir)*-1)_1]"]);
    const declaration = "scale: calc(var(--motion-dir) * -1) 1";
    const at = css.indexOf(declaration);
    expect(at, css).toBeGreaterThan(-1);
    const open = css.lastIndexOf("{", at);
    const rule = css.slice(css.lastIndexOf("\n", open) + 1, css.indexOf("}", at) + 1);
    expect(rule).toContain(declaration);
    // The selector is the class alone: direction comes from the inherited variable, never from
    // :dir() (down-levelled to :lang() by the CSS toolchain) or [dir] ancestor attributes.
    expect(rule).not.toMatch(/:dir\(|:lang\(|\[dir/);
    // motion.css provides the sign on every dir attribute.
    const motion = readFileSync(join(root, "src/design-system/motion.css"), "utf8");
    expect(motion).toMatch(/\[dir="ltr"\]\s*\{\s*--motion-dir:\s*1;/);
    expect(motion).toMatch(/\[dir="rtl"\]\s*\{\s*--motion-dir:\s*-1;/);
  });
});
