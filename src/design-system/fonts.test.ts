import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string): Buffer => readFileSync(join(here, "fonts", name));

/** Approved checksums of the committed official font files (see fonts/README.md). */
const FONT_FILES = {
  "cairo-arabic.woff2": "748022f50c427456ad66031e855349be3448ee1f05a5f1eb59574ebe0c686749",
  "inter-latin.woff2": "3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62",
  "geist-mono-latin.woff2": "684ad5b531f81d43c1e8c7038262d5db7cdc1f68006e04d6c7769efa8d33c8cc",
} as const;

const LICENSES = ["OFL-Cairo.txt", "OFL-Inter.txt", "OFL-GeistMono.txt"] as const;

describe("self-hosted font files", () => {
  it.each(Object.entries(FONT_FILES))("%s is the approved WOFF2 file", (name, sha256) => {
    const bytes = read(name);
    expect(bytes.subarray(0, 4).toString("latin1")).toBe("wOF2");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);
  });

  it.each(LICENSES)("%s is the SIL Open Font License 1.1", (name) => {
    expect(read(name).toString("utf8")).toContain("SIL Open Font License, Version 1.1");
  });

  it("fonts.ts loads only local files — no Google Fonts at build time", () => {
    const source = readFileSync(join(here, "fonts.ts"), "utf8");
    expect(source).toContain('from "next/font/local"');
    expect(source).not.toContain("next/font/google");
    for (const name of Object.keys(FONT_FILES)) expect(source).toContain(`./fonts/${name}`);
  });
});
