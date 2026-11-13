import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ICON_GEOMETRY } from "./geometry.generated";
import { ICON_MANIFEST, ICON_NAMES, ICON_SIZES } from "./manifest";

const here = dirname(fileURLToPath(import.meta.url));
const svgSource = (name: string): string => readFileSync(join(here, "svg", `${name}.svg`), "utf8");

/**
 * Geometry fingerprints computed INSIDE Figma (read-only plugin script, 2026-11-13) from each
 * component's own SVG export: djb2 hash of the shapes' attributes (ids excluded) + length.
 * They tie ./svg/*.svg to the Figma components independently of the download path.
 */
const FIGMA_FINGERPRINTS: Record<string, string> = {
  home: "6fb6ab52:353",
  book: "2a8319be:497",
  fileText: "129944bf:695",
  help: "b142edf7:601",
  note: "a5e2f588:426",
  star: "bd114c8e:179",
  folder: "c07ef881:583",
  search: "1c2fe6a7:296",
  bell: "d0292087:536",
  moon: "663341d9:599",
  chevDown: "bfef5666:98",
  upload: "adec41e2:437",
  cloudUpload: "9656b37a:852",
  play: "78681130:101",
  check: "af846862:98",
  clock: "53a7448e:294",
  target: "e69999eb:596",
  message: "16de2f8:470",
  download: "34e23d55:440",
  sparkles: "5df9e174:503",
  alert: "1665e8f8:864",
  crown: "e5fe9bfa:213",
  menu: "5e52a21c:274",
  x: "610fe719:187",
  user: "c0be4073:442",
  settings: "bc20d4b0:2608",
  logout: "b8e206cf:433",
  more: "ef195891:599",
  trending: "144116e5:207",
  network: "98941e60:959",
  box: "e886a7e2:859",
  sigma: "20fb0784:694",
  cpu: "98fc9273:447",
  checkSquare: "c0279e52:421",
  mic: "d84e24c7:726",
  file: "f5d5e8b4:420",
  arrowLeft: "8734d1e4:191",
  lightbulb: "67fa3e00:511",
  cards: "e301ecce:272",
  slides: "14714734:304",
};

const SHAPE = /<(path|rect|circle|line|ellipse|polyline|polygon)\b([^>]*?)\/?>/g;
const ATTR = /([\w-]+)="([^"]*)"/g;

function shapesOf(svg: string): { tag: string; attrs: [string, string][] }[] {
  return [...svg.matchAll(SHAPE)].map(([, tag = "", attrs = ""]) => ({
    tag,
    attrs: [...attrs.matchAll(ATTR)]
      .map(([, k = "", v = ""]) => [k, v] as [string, string])
      .filter(([k]) => k !== "id"),
  }));
}

function fingerprint(svg: string): string {
  const canonical = shapesOf(svg)
    .map(
      ({ tag, attrs }) =>
        `${tag}:${attrs
          .map(([k, v]) => `${k}=${v}`)
          .sort()
          .join(";")}`,
    )
    .join("|");
  let hash = 5381;
  for (let i = 0; i < canonical.length; i++) hash = ((hash * 33) ^ canonical.charCodeAt(i)) >>> 0;
  return `${hash.toString(16)}:${canonical.length}`;
}

const toReactProp = (name: string): string =>
  name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

describe("icon registry", () => {
  it("contains exactly the 40 verified Figma icons", () => {
    expect(ICON_NAMES).toHaveLength(40);
    expect([...ICON_NAMES].sort()).toEqual(Object.keys(FIGMA_FINGERPRINTS).sort());
    expect(Object.keys(ICON_GEOMETRY).sort()).toEqual([...ICON_NAMES].sort());
  });

  it("every icon has its original SVG and a Figma node id", () => {
    for (const name of ICON_NAMES) {
      expect(existsSync(join(here, "svg", `${name}.svg`)), name).toBe(true);
      expect(ICON_MANIFEST[name].figmaNode, name).toMatch(/^\d+:\d+$/);
    }
  });

  it("approved Figma placement sizes", () => {
    expect(ICON_SIZES).toEqual({ sidebar: 20, rail: 20, mobileNav: 22, moreSheet: 18 });
  });
});

describe.each(ICON_NAMES)("icon %s", (name) => {
  const svg = svgSource(name);

  it("SVG geometry matches the Figma component export (fingerprint)", () => {
    expect(fingerprint(svg)).toBe(FIGMA_FINGERPRINTS[name]);
  });

  it("is a 24×24, unfilled, 1.75-stroke outline in the original color", () => {
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('fill="none"');
    for (const { attrs } of shapesOf(svg)) {
      const map = Object.fromEntries(attrs);
      expect(map["stroke"]).toBe("#9C9C9D");
      expect(map["stroke-width"]).toBe("1.75");
      expect(map["fill"]).toBeUndefined();
      expect(map["transform"]).toBeUndefined();
    }
  });

  it("registry geometry is identical to the SVG, with only the color as currentColor", () => {
    const expected = shapesOf(svg).map(({ tag, attrs }) => [
      tag,
      Object.fromEntries(
        attrs.map(([k, v]) => [toReactProp(k), k === "stroke" ? "currentColor" : v]),
      ),
    ]);
    expect(ICON_GEOMETRY[name]).toEqual(expected);
  });
});

describe("direction behavior (user decision 2026-11-13)", () => {
  it("only arrowLeft mirrors, and only in LTR", () => {
    const mirrored = ICON_NAMES.filter((name) => ICON_MANIFEST[name].mirrorInLtr);
    expect(mirrored).toEqual(["arrowLeft"]);
  });

  it("logout and play never mirror", () => {
    expect(ICON_MANIFEST.logout.mirrorInLtr).toBe(false);
    expect(ICON_MANIFEST.play.mirrorInLtr).toBe(false);
  });
});

describe("licenses", () => {
  it("keeps the upstream Lucide ISC and Feather MIT notices", () => {
    const license = readFileSync(join(here, "LICENSE-lucide.txt"), "utf8");
    expect(license).toContain("ISC License");
    expect(license).toContain("Lucide Icons and Contributors");
    expect(license).toContain("The MIT License (MIT)");
    expect(license).toContain("Cole Bemis");
  });
});
