import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LOGO_ASSETS, LOGO_VARIANTS } from "@/design-system/brand";

import { Logo } from "./Logo";

/** Render to HTML and return the attributes of the single <img>. */
function renderImg(element: React.ReactElement): Map<string, string> {
  const html = renderToStaticMarkup(element);
  const tag = html.match(/<img\b[^>]*>/)?.[0];
  if (!tag) throw new Error(`No <img> rendered: ${html}`);
  return new Map(
    [...tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map(([, key = "", value = ""]) => [key, value]),
  );
}

describe.each(LOGO_VARIANTS)("Logo variant=%s", (variant) => {
  const asset = LOGO_ASSETS[variant];

  it("serves the original file directly (no optimizer, no srcset re-encoding)", () => {
    const img = renderImg(<Logo variant={variant} height={40} />);
    expect(img.get("src")).toBe(asset.src);
    expect(img.has("srcset") || img.has("srcSet")).toBe(false);
  });

  it("keeps the original aspect ratio", () => {
    const img = renderImg(<Logo variant={variant} height={40} />);
    const width = Number(img.get("width"));
    const height = Number(img.get("height"));
    expect(height).toBe(40);
    expect(Math.abs(width / height - asset.width / asset.height)).toBeLessThan(0.02);
    expect(img.get("style")).toContain("height:40px");
    expect(img.get("style")).toContain("width:auto");
    expect(img.get("style")).toContain("object-fit:contain");
  });

  it("is never mirrored: no transform, scale or rotate", () => {
    const img = renderImg(<Logo variant={variant} height={40} />);
    expect(img.get("style") ?? "").not.toMatch(/transform|scale|rotate/);
    expect(img.get("class") ?? "").not.toMatch(/scale|rotate|flip|mirror/);
  });

  it('has the Handoff product name "MUNSIT AI" as default alt, marked as English', () => {
    const img = renderImg(<Logo variant={variant} height={40} />);
    expect(img.get("alt")).toBe("MUNSIT AI");
    expect(img.get("lang")).toBe("en");
  });

  it("is hidden from assistive tech when decorative", () => {
    const img = renderImg(<Logo variant={variant} height={40} decorative />);
    expect(img.get("alt")).toBe("");
    expect(img.has("lang")).toBe(false);
  });
});
