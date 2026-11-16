/**
 * MUNSIT AI route constants — the single source of every application path (Phase 04,
 * docs/phases/phase-04-plan.md §7.2, decisions D-R1/D-R2/D-R11/D-R12, ADR-003).
 *
 * - Keys are stable route keys (dot = nesting, used for breadcrumbs later); values are the
 *   internal path templates (`[param]` = dynamic segment).
 * - The same paths serve both locales: Arabic unprefixed, English under `/en` (routing.ts).
 * - Only routes approved in the plan are listed. Deferred/unresolved routes (AI Tutor, Quiz
 *   Results, Answer Review) are intentionally absent until their decisions are made (D-08, D-09).
 * - Static segments (`new`, `record`) win over dynamic ones, so they can never be used as ids.
 *
 * This module imports nothing, so both `src/i18n` and `src/shared` can depend on it.
 */
export const ROUTES = {
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
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/** Route keys in declaration order (typed `Object.keys`). */
export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/** next-intl `pathnames`: identical path for every locale (D-R2, shared segments). */
export const PATHNAMES = Object.fromEntries(Object.values(ROUTES).map((path) => [path, path])) as {
  readonly [P in RoutePath]: P;
};
