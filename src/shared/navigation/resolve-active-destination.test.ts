import { describe, expect, it } from "vitest";

import { ROUTE_KEYS, ROUTES, type RouteKey } from "@/i18n/routes";

import type { DestinationId } from "./nav-registry";
import {
  matchRoute,
  mobileBarIndicator,
  normalizePathname,
  resolveActiveDestination,
} from "./resolve-active-destination";

/*
 * Active destination (Phase 04, plan §9 and §14; Roadmap acceptance 2 and 4; D-R6).
 * One row per approved route: a concrete URL, its route key and its destination.
 */

const TABLE: readonly [path: string, routeKey: RouteKey, destination: DestinationId | null][] = [
  ["/", "landing", null],
  ["/login", "auth.login", null],
  ["/register", "auth.register", null],
  ["/forgot-password", "auth.forgotPassword", null],
  ["/reset-password", "auth.resetPassword", null],
  ["/dashboard", "dashboard", "dashboard"],
  ["/lectures", "lectures", "lectures"],
  ["/lectures/lec-42", "lectures.detail", "lectures"],
  ["/lectures/record", "lectures.record", "lectures"],
  ["/summaries", "summaries", "summaries"],
  ["/summaries/s7", "summaries.reader", "summaries"],
  ["/questions", "questions", "questions"],
  ["/questions/new", "questions.new", "questions"],
  ["/questions/q1/quiz", "questions.quiz", "questions"],
  ["/flashcards", "flashcards", "flashcards"],
  ["/flashcards/new", "flashcards.new", "flashcards"],
  ["/flashcards/d3", "flashcards.deck", "flashcards"],
  ["/flashcards/d3/study", "flashcards.study", "flashcards"],
  ["/notes", "notes", "notes"],
  ["/notes/new", "notes.new", "notes"],
  ["/notes/n9", "notes.editor", "notes"],
  ["/favorites", "favorites", "favorites"],
  ["/folders", "folders", "folders"],
  ["/folders/f2", "folders.detail", "folders"],
  ["/settings", "settings", null],
  ["/settings/profile", "settings.profile", null],
  ["/settings/preferences", "settings.preferences", null],
  ["/settings/notifications", "settings.notifications", null],
  ["/settings/security", "settings.security", null],
  ["/settings/subscription", "settings.subscription", null],
  ["/dev/components", "dev.components", null],
  ["/dev/tokens", "dev.tokens", null],
  ["/dev/error-test", "dev.errorTest", null],
];

describe("route table", () => {
  it("covers every approved route exactly once", () => {
    expect(TABLE.map(([, key]) => key).sort()).toEqual([...ROUTE_KEYS].sort());
  });

  it.each(TABLE)("%s → %s → %s (Arabic, unprefixed)", (path, routeKey, destination) => {
    expect(resolveActiveDestination(path)).toEqual({ routeKey, destination });
  });

  it.each(TABLE)("/en%s → same result (English)", (path, routeKey, destination) => {
    const english = path === "/" ? "/en" : `/en${path}`;
    expect(resolveActiveDestination(english)).toEqual({ routeKey, destination });
  });

  it.each(ROUTE_KEYS)(
    "internal template of %s resolves to itself (next-intl usePathname)",
    (key) => {
      expect(matchRoute(ROUTES[key])).toBe(key);
    },
  );
});

describe("rules", () => {
  it("exactly one destination for every (app) and (focus) route except Settings", () => {
    const appRoutes = TABLE.filter(([, key]) => !/^(landing|auth|settings|dev)/.test(key));
    expect(appRoutes).toHaveLength(19);
    for (const [path] of appRoutes) {
      expect(resolveActiveDestination(path).destination, path).not.toBeNull();
    }
  });

  it("Settings, Landing and Auth never mark a destination", () => {
    for (const [path, key] of TABLE) {
      if (/^(landing|auth|settings)/.test(key)) {
        expect(resolveActiveDestination(path).destination, path).toBeNull();
      }
    }
  });

  it("static segments win over dynamic ones", () => {
    expect(matchRoute("/lectures/record")).toBe("lectures.record");
    expect(matchRoute("/questions/new")).toBe("questions.new");
    expect(matchRoute("/flashcards/new")).toBe("flashcards.new");
    expect(matchRoute("/notes/new")).toBe("notes.new");
  });

  it.each([
    "/lectures/lec-42/tutor",
    "/questions/q1/results",
    "/questions/q1/review",
    "/folders/f2/manage",
    "/folders/f2/add",
    "/unknown",
    "/en/unknown/path",
    "/dashboard/extra",
  ])("unknown or deferred path %s → no route, no destination", (path) => {
    expect(resolveActiveDestination(path)).toEqual({ routeKey: null, destination: null });
  });

  it("deep links and refresh: query, hash, trailing slash and encoding do not change the result", () => {
    const expected = { routeKey: "folders.detail", destination: "folders" };
    for (const path of [
      "/folders/f2/",
      "/folders/f2?sort=recent",
      "/folders/f2#items",
      `/folders/${encodeURIComponent("مراجعة")}`,
      "/en/folders/f2/?view=list",
    ]) {
      expect(resolveActiveDestination(path), path).toEqual(expected);
    }
  });

  it("strips only a real locale prefix", () => {
    expect(normalizePathname("/en/lectures")).toEqual(["lectures"]);
    expect(normalizePathname("/ar/lectures")).toEqual(["lectures"]);
    expect(normalizePathname("/english/lectures")).toEqual(["english", "lectures"]);
  });
});

describe("mobile bar indicator (D-R6)", () => {
  it.each([
    ["dashboard", "dashboard"],
    ["lectures", "lectures"],
    ["summaries", "summaries"],
    ["questions", "more"],
    ["flashcards", "more"],
    ["notes", "more"],
    ["favorites", "more"],
    ["folders", "more"],
  ] as const)("%s → %s", (destination, tab) => {
    expect(mobileBarIndicator(destination)).toBe(tab);
  });

  it("no destination (Settings, Landing, Auth, unknown) → no tab, so Settings never lights More", () => {
    expect(mobileBarIndicator(null)).toBeNull();
    expect(
      mobileBarIndicator(resolveActiveDestination("/settings/security").destination),
    ).toBeNull();
  });
});
