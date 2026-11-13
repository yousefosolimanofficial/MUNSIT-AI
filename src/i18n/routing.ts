import { defineRouting } from "next-intl/routing";

/**
 * MUNSIT AI locale routing (Phase 02 step 6). Decisions approved by the user 2026-11-13:
 *
 * - Locales: Arabic `ar` (default, RTL) and English `en` (LTR).
 * - `localePrefix: "as-needed"`: Arabic URLs carry no prefix (`/`, `/dev/tokens` — unchanged),
 *   English URLs are prefixed (`/en`, `/en/dev/tokens`). `/ar/...` redirects to the unprefixed URL.
 * - `localeDetection: false`: no Accept-Language detection — the URL alone decides the locale.
 * - `localeCookie: false`: with detection off next-intl never reads the cookie, so it is not
 *   written either. Persisting the user's choice comes later from the backend preference
 *   (`/me/preferences`, see docs/design-values.md §4).
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
});

export type AppLocale = (typeof routing.locales)[number];
