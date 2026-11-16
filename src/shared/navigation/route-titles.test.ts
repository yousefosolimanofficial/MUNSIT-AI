import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { MESSAGES } from "@/i18n/messages";
import { ROUTE_KEYS } from "@/i18n/routes";

import { DESTINATIONS } from "./nav-registry";
import { routeTitleSource, type PlaceholderRouteKey } from "./route-titles";

/*
 * Placeholder titles (D-R9) and the Phase 04 DoD: no component hardcodes a nav label or path.
 */

function lookup(locale: "ar" | "en", namespace: string, key: string): unknown {
  return [namespace, ...key.split(".")].reduce<unknown>(
    (node, part) => (node as Record<string, unknown> | undefined)?.[part],
    MESSAGES[locale],
  );
}

const PLACEHOLDER_KEYS = ROUTE_KEYS.filter((k) => !k.startsWith("dev.")) as PlaceholderRouteKey[];

describe("placeholder titles", () => {
  it.each(PLACEHOLDER_KEYS)("%s has a non-empty title in both locales", (routeKey) => {
    const { namespace, key } = routeTitleSource(routeKey);
    for (const locale of ["ar", "en"] as const) {
      const value = lookup(locale, namespace, key);
      expect(typeof value, `${locale} ${namespace}.${key}`).toBe("string");
      expect((value as string).trim()).not.toBe("");
    }
  });

  it("destination roots reuse the nav label (no duplicated copy)", () => {
    for (const d of DESTINATIONS) {
      expect(routeTitleSource(d.routeKey)).toEqual({ namespace: "nav", key: d.labelKey });
    }
  });

  it("every pages.titles entry belongs to an approved placeholder route (no orphans)", () => {
    const used = PLACEHOLDER_KEYS.map(routeTitleSource)
      .filter((s) => s.namespace === "pages")
      .map((s) => s.key.replace(/^titles\./, ""));
    expect(Object.keys(MESSAGES.ar.pages.titles).sort()).toEqual(used.sort());
  });
});

/** Source files that may contain nav labels or app paths. */
const ALLOWED = [
  /^i18n\/routes\.ts$/,
  /^i18n\/messages\//,
  /^shared\/navigation\//,
  /\.test\.tsx?$/,
  // Development-only routes: the gallery's Lecture-tool tab labels (Figma) coincide with two nav
  // labels (الأسئلة, الملاحظات) but are tab copy, not navigation. /dev/* is 404 in production.
  /^app\/\[locale\]\/dev\//,
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.(ts|tsx)$/.test(name)
        ? [path]
        : [];
  });
}

describe("no hardcoded nav labels or app paths (Roadmap Phase 04 DoD)", () => {
  const root = join(process.cwd(), "src");
  const files = sourceFiles(root)
    .map((path) => ({ path, rel: relative(root, path).replaceAll("\\", "/") }))
    .filter(({ rel }) => !ALLOWED.some((pattern) => pattern.test(rel)));
  const labels = [
    ...Object.values(MESSAGES.ar.nav.destinations),
    ...Object.values(MESSAGES.en.nav.destinations),
  ];
  const appPath =
    /["'`]\/(dashboard|lectures|summaries|questions|flashcards|notes|favorites|folders|settings|login|register|forgot-password|reset-password)\b/;

  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(["dashboard", "lectures"])("sanity: the path pattern matches a quoted /%s", (seg) => {
    expect(appPath.test(`"/${seg}"`)).toBe(true);
  });

  it("no file outside the registry, routes and messages contains a nav label or an app path", () => {
    const offenders = files.flatMap(({ path, rel }) => {
      const text = readFileSync(path, "utf8");
      const hits = labels.filter(
        (label) => text.includes(`"${label}"`) || text.includes(`>${label}<`),
      );
      if (appPath.test(text)) hits.push("app path literal");
      return hits.length ? [`${rel}: ${hits.join(", ")}`] : [];
    });
    expect(offenders).toEqual([]);
  });
});
