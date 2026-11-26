import type { FullConfig } from "@playwright/test";

import { ROUTES } from "../../src/i18n/routes";

/**
 * Warms the Next.js dev server before the parallel E2E workers start.
 *
 * Why: on a cold `next dev` (empty .next), concurrent first requests to routes that are still
 * compiling can make the dev server read its own build files mid-write ("SyntaxError: Unexpected
 * end of JSON input" in Next internals, observed 2026-11-13). Requesting every route once,
 * sequentially, completes the first compile without contention. Production builds are unaffected.
 *
 * Phase 04: every route in `src/i18n/routes.ts` is warmed in both locales (dynamic segments with
 * a sample id), plus the catch-all 404, so new routes are covered automatically.
 */
const SAMPLE = (path: string) => path.replace(/\[[^\]]+\]/g, "sample-1");

const ROUTES_OK = Object.values(ROUTES).flatMap((path) => {
  const sample = SAMPLE(path);
  return [sample, sample === "/" ? "/en" : `/en${sample}`];
});

/**
 * Development-only preview routes that E2E specs open under parallel workers (not in the route
 * registry). Phase 08 Increment 1: `/dev/auth` failed on a cold server without this.
 */
const DEV_ROUTES = [
  "/dev/auth",
  "/en/dev/auth",
  "/dev/auth/login",
  "/en/dev/auth/login",
  "/dev/auth/register",
  "/en/dev/auth/register",
];

/** Expected to answer 404 (the localized not-found page): warmed, not treated as a failure. */
const ROUTES_404 = ["/warm-up-unknown-route", "/en/warm-up-unknown-route"];

async function warm(baseURL: string, route: string, expected: number | "ok"): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(new URL(route, baseURL));
    await response.text(); // wait for the full response (compile finished)
    if (expected === "ok" ? response.ok : response.status === expected) return;
    if (attempt === 3) throw new Error(`Warm-up failed for ${route}: HTTP ${response.status}`);
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  for (const route of ROUTES_OK) await warm(baseURL, route, "ok");
  for (const route of DEV_ROUTES) await warm(baseURL, route, "ok");
  for (const route of ROUTES_404) await warm(baseURL, route, 404);
}
