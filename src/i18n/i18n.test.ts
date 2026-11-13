import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import { directionOf, LOCALE_DIRECTION } from "./direction";
import { MESSAGES } from "./messages";
import { routing } from "./routing";

/** All leaf key paths of a message tree, e.g. "dev.fixture.goal". */
function keyPaths(tree: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    value !== null && typeof value === "object"
      ? keyPaths(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("routing (approved 2026-11-13)", () => {
  it("Arabic default, English secondary, Arabic URLs unprefixed, no detection, no cookie", () => {
    expect(routing.locales).toEqual(["ar", "en"]);
    expect(routing.defaultLocale).toBe("ar");
    expect(routing.localePrefix).toBe("as-needed");
    expect(routing.localeDetection).toBe(false);
    expect(routing.localeCookie).toBe(false);
  });

  it("Arabic is RTL and English is LTR", () => {
    expect(LOCALE_DIRECTION).toEqual({ ar: "rtl", en: "ltr" });
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });
});

describe("message catalogs", () => {
  it("Arabic and English have exactly the same namespaces and keys", () => {
    expect(keyPaths(MESSAGES.en).sort()).toEqual(keyPaths(MESSAGES.ar).sort());
  });

  it("no empty messages", () => {
    for (const locale of routing.locales) {
      for (const path of keyPaths(MESSAGES[locale])) {
        const value = path
          .split(".")
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], MESSAGES[locale]);
        expect(typeof value === "string" && value.trim().length > 0, `${locale}:${path}`).toBe(
          true,
        );
      }
    }
  });

  it("brand name is the Handoff product name in both locales", () => {
    expect(MESSAGES.ar.common.brand.name).toBe("MUNSIT AI");
    expect(MESSAGES.en.common.brand.name).toBe("MUNSIT AI");
  });
});

describe("number formatting keeps Latin digits in Arabic (Design System: numerals in Inter)", () => {
  it("ar formats 1234 as 1,234 — not Arabic-Indic digits", () => {
    const t = createTranslator({ locale: "ar", messages: MESSAGES.ar, namespace: "dev.fixture" });
    const text = t("mixedNumber", { count: 1234 });
    expect(text).toContain("1,234");
    expect(text).not.toMatch(/[٠-٩۰-۹]/);
  });

  it("en formats 1234 as 1,234", () => {
    const t = createTranslator({ locale: "en", messages: MESSAGES.en, namespace: "dev.fixture" });
    expect(t("mixedNumber", { count: 1234 })).toBe("You have 1,234 new lectures");
  });
});
