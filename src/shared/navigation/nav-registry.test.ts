import { describe, expect, it } from "vitest";

import { ICON_MANIFEST } from "@/design-system/icons/manifest";
import { MESSAGES } from "@/i18n/messages";
import { ROUTES } from "@/i18n/routes";

import {
  DESTINATION_IDS,
  DESTINATIONS,
  MOBILE_BAR_DESTINATIONS,
  MORE_CONTROL,
  MORE_SHEET_DESTINATIONS,
  MORE_SHEET_EXTRAS,
  SETTINGS_NAV,
} from "./nav-registry";

/*
 * Navigation registry (Phase 04, plan §8; Roadmap Phase 04 acceptance 1 and 3; D-R6, D-R7).
 */

/** Resolve a dotted key in a message namespace. */
function message(locale: "ar" | "en", key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], MESSAGES[locale].nav);
}

describe("canonical destinations", () => {
  it("approved order with Arabic labels verbatim (Roadmap acceptance 1)", () => {
    expect(DESTINATIONS.map((d) => message("ar", d.labelKey))).toEqual([
      "الرئيسية",
      "محاضراتي",
      "الملخصات",
      "الأسئلة",
      "البطاقات التعليمية",
      "الملاحظات",
      "المفضلة",
      "المجلدات",
    ]);
  });

  it("approved English labels (D-R7)", () => {
    expect(DESTINATIONS.map((d) => message("en", d.labelKey))).toEqual([
      "Dashboard",
      "My Lectures",
      "Summaries",
      "Questions",
      "Flashcards",
      "Notes",
      "Favorites",
      "Folders",
    ]);
  });

  it("stable unique ids in the declared order", () => {
    expect(DESTINATIONS.map((d) => d.id)).toEqual([...DESTINATION_IDS]);
    expect(new Set(DESTINATION_IDS).size).toBe(8);
  });

  it("verified icons that exist in the icon manifest", () => {
    expect(DESTINATIONS.map((d) => d.icon)).toEqual([
      "home",
      "book",
      "fileText",
      "help",
      "cards",
      "note",
      "star",
      "folder",
    ]);
    for (const d of DESTINATIONS) expect(ICON_MANIFEST).toHaveProperty(d.icon);
  });

  it("each destination's route is its own root route", () => {
    for (const d of DESTINATIONS) {
      expect(d.routeKey).toBe(d.id);
      expect(ROUTES[d.routeKey]).toBe(`/${d.id}`);
    }
  });
});

describe("mobile navigation (Roadmap acceptance 3, D-R6)", () => {
  it("bottom bar: الرئيسية، محاضراتي، الملخصات، المزيد", () => {
    expect([
      ...MOBILE_BAR_DESTINATIONS.map((d) => message("ar", d.labelKey)),
      message("ar", MORE_CONTROL.labelKey),
    ]).toEqual(["الرئيسية", "محاضراتي", "الملخصات", "المزيد"]);
    expect(message("en", MORE_CONTROL.labelKey)).toBe("More");
  });

  it("More is a control, not a canonical destination", () => {
    expect(DESTINATION_IDS).not.toContain("more");
    expect(MORE_CONTROL).not.toHaveProperty("routeKey");
    expect(ICON_MANIFEST).toHaveProperty(MORE_CONTROL.icon);
  });

  it("More sheet: the five remaining destinations, then account settings and plan upgrade", () => {
    expect(MORE_SHEET_DESTINATIONS.map((d) => d.id)).toEqual([
      "questions",
      "flashcards",
      "notes",
      "favorites",
      "folders",
    ]);
    expect(MORE_SHEET_EXTRAS.map((e) => message("ar", e.labelKey))).toEqual([
      "إعدادات الحساب",
      "ترقية الخطة",
    ]);
    expect(MORE_SHEET_EXTRAS.map((e) => e.routeKey)).toEqual(["settings", null]);
    for (const e of MORE_SHEET_EXTRAS) expect(ICON_MANIFEST).toHaveProperty(e.icon);
  });
});

describe("Settings secondary navigation (plan §8.3, Figma page 14)", () => {
  it("six items in Figma order with Arabic copy verbatim", () => {
    expect(SETTINGS_NAV.map((item) => message("ar", item.labelKey))).toEqual([
      "الملف الشخصي",
      "تفضيلات الدراسة",
      "الإشعارات",
      "الأمان والخصوصية",
      "الاشتراك",
      "إدارة الحساب",
    ]);
  });

  it("Profile is current on Profile Overview and Edit Profile; the account item has no route", () => {
    expect(SETTINGS_NAV[0].activeFor).toEqual(["settings", "settings.profile"]);
    const account = SETTINGS_NAV.find((item) => item.id === "account");
    expect(account?.routeKey).toBeNull();
    expect(account?.activeFor).toEqual([]);
  });

  it("every settings route is current for exactly one item", () => {
    const settingsRoutes = Object.keys(ROUTES).filter((k) => k.startsWith("settings"));
    for (const route of settingsRoutes) {
      const owners = SETTINGS_NAV.filter((item) =>
        (item.activeFor as readonly string[]).includes(route),
      );
      expect(owners, route).toHaveLength(1);
    }
  });
});

describe("labels live only in messages", () => {
  it("every registry label key exists in both locales and is non-empty", () => {
    const keys = [
      ...DESTINATIONS.map((d) => d.labelKey),
      MORE_CONTROL.labelKey,
      ...MORE_SHEET_EXTRAS.map((e) => e.labelKey),
      ...SETTINGS_NAV.map((item) => item.labelKey),
    ];
    for (const key of keys) {
      for (const locale of ["ar", "en"] as const) {
        const value = message(locale, key);
        expect(typeof value, `${locale} ${key}`).toBe("string");
        expect((value as string).trim(), `${locale} ${key}`).not.toBe("");
      }
    }
  });
});
