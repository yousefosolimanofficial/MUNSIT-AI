import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { LOGO_ASSETS, LOGO_VARIANTS } from "./brand";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Approved SHA-256 checksums of the official logo files (recorded 2026-11-13 from the original
 * exports). The test reads only the committed files in public/brand/ and compares them with
 * these constants, so it runs on any fresh clone — the local, git-ignored `assets/` folder is
 * never read. Any edit, re-export or optimization of a logo fails this test.
 */
const ORIGINAL_SHA256 = {
  full: "282e7f28ab0c98e803a781cc97810120002964e8d93f144788fedabf18363e81",
  horizontal: "199f6a1353b508bb3f464f730e426750eb29ccdc1823532df93a4785a9665c81",
  symbol: "3792279dabfab348000071b1527e142278f27fdf31aa94e1c86a352d41836147",
} as const;

/** Design System Reference §6 sizes. */
const REFERENCE_SIZE = {
  full: [1228, 236],
  horizontal: [908, 236],
  symbol: [372, 236],
} as const;

describe.each(LOGO_VARIANTS)("logo asset: %s", (variant) => {
  const asset = LOGO_ASSETS[variant];
  const bytes = readFileSync(join(root, "public", asset.src));

  it("is the original file, byte for byte", () => {
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(ORIGINAL_SHA256[variant]);
  });

  it("is a transparent PNG (RGBA) with the reference size", () => {
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    const colorType = bytes[25];
    expect([width, height]).toEqual([...REFERENCE_SIZE[variant]]);
    expect(colorType).toBe(6); // RGBA
  });

  it("declares the same intrinsic size in brand.ts", () => {
    expect([asset.width, asset.height]).toEqual([...REFERENCE_SIZE[variant]]);
  });
});
