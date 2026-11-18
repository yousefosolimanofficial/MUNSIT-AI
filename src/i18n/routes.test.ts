import { describe, expect, it } from "vitest";

import { getPathname } from "./navigation";
import { PATHNAMES, ROUTE_KEYS, ROUTES } from "./routes";
import { routing } from "./routing";

/*
 * Phase 04 route constants and locale links (plan §7.2, §10, §14; D-R1, D-R2, D-R11, D-R12,
 * ADR-003). The inventory below is the approved one: adding or removing a route must be a
 * deliberate plan change, so this test fails on any drift.
 */

const APPROVED_INVENTORY = {
  landing: "/",
  "auth.login": "/login",
  "auth.register": "/register",
  "auth.forgotPassword": "/forgot-password",
  "auth.resetPassword": "/reset-password",
  dashboard: "/dashboard",
  lectures: "/lectures",
  "lectures.detail": "/lectures/[lectureId]",
  "lectures.record": "/lectures/record",
  summaries: "/summaries",
  "summaries.reader": "/summaries/[summaryId]",
  questions: "/questions",
  "questions.new": "/questions/new",
  "questions.quiz": "/questions/[setId]/quiz",
  flashcards: "/flashcards",
  "flashcards.new": "/flashcards/new",
  "flashcards.deck": "/flashcards/[deckId]",
  "flashcards.study": "/flashcards/[deckId]/study",
  notes: "/notes",
  "notes.new": "/notes/new",
  "notes.editor": "/notes/[noteId]",
  favorites: "/favorites",
  folders: "/folders",
  "folders.detail": "/folders/[folderId]",
  settings: "/settings",
  "settings.profile": "/settings/profile",
  "settings.preferences": "/settings/preferences",
  "settings.notifications": "/settings/notifications",
  "settings.security": "/settings/security",
  "settings.subscription": "/settings/subscription",
  "dev.components": "/dev/components",
  "dev.tokens": "/dev/tokens",
  "dev.errorTest": "/dev/error-test",
  "dev.navigationGuardFixture": "/dev/fixtures/navigation-guard",
};

describe("route constants (approved inventory)", () => {
  it("equal the approved inventory exactly", () => {
    expect(ROUTES).toEqual(APPROVED_INVENTORY);
  });

  it("every path is unique (no two route groups resolve to the same URL)", () => {
    const paths = Object.values(ROUTES);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(ROUTE_KEYS).size).toBe(ROUTE_KEYS.length);
  });

  it("deferred and unresolved routes are absent (D-08, D-09, ADR-003)", () => {
    const paths: string[] = Object.values(ROUTES);
    for (const forbidden of [/tutor/, /result/i, /review/i, /\/folders\/.+\/(manage|add)/]) {
      expect(paths.filter((p) => forbidden.test(p))).toEqual([]);
    }
  });

  it("reserved static segments (`new`, `record`) are never parameters", () => {
    for (const path of Object.values(ROUTES)) {
      for (const segment of path.split("/")) {
        expect(["[new]", "[record]"]).not.toContain(segment);
      }
    }
  });

  it("every dynamic segment uses one camelCase `…Id` parameter name", () => {
    const params = Object.values(ROUTES).flatMap((p) => p.match(/\[[^\]]+\]/g) ?? []);
    for (const param of params) expect(param).toMatch(/^\[[a-z]+Id\]$/);
  });

  it("next-intl pathnames: the same path for every locale (shared segments)", () => {
    expect(routing.pathnames).toEqual(PATHNAMES);
    for (const [internal, external] of Object.entries(PATHNAMES)) {
      expect(external).toBe(internal);
    }
  });
});

describe("locale-aware links (getPathname)", () => {
  it.each(Object.entries(ROUTES).filter(([, path]) => !path.includes("[")))(
    "%s: Arabic unprefixed, English under /en",
    (_, path) => {
      expect(getPathname({ locale: "ar", href: path as "/" })).toBe(path);
      expect(getPathname({ locale: "en", href: path as "/" })).toBe(
        path === "/" ? "/en" : `/en${path}`,
      );
    },
  );

  it.each([
    ["/lectures/[lectureId]", { lectureId: "lec-42" }, "/lectures/lec-42"],
    ["/summaries/[summaryId]", { summaryId: "s7" }, "/summaries/s7"],
    ["/questions/[setId]/quiz", { setId: "q1" }, "/questions/q1/quiz"],
    ["/flashcards/[deckId]", { deckId: "d3" }, "/flashcards/d3"],
    ["/flashcards/[deckId]/study", { deckId: "d3" }, "/flashcards/d3/study"],
    ["/notes/[noteId]", { noteId: "n9" }, "/notes/n9"],
    ["/folders/[folderId]", { folderId: "f2" }, "/folders/f2"],
  ] as const)("%s fills its parameter in both locales", (pathname, params, expected) => {
    const href = { pathname, params } as Parameters<typeof getPathname>[0]["href"];
    expect(getPathname({ locale: "ar", href })).toBe(expected);
    expect(getPathname({ locale: "en", href })).toBe(`/en${expected}`);
  });

  it("encodes parameter values (Arabic ids stay valid URLs)", () => {
    expect(
      getPathname({
        locale: "ar",
        href: { pathname: "/folders/[folderId]", params: { folderId: "مراجعة" } },
      }),
    ).toBe(`/folders/${encodeURIComponent("مراجعة")}`);
  });
});
