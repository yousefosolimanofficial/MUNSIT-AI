import type { FullConfig } from "@playwright/test";

/**
 * Warms the Next.js dev server before the parallel E2E workers start.
 *
 * Why: on a cold `next dev` (empty .next), concurrent first requests to routes that are still
 * compiling can make the dev server read its own build files mid-write ("SyntaxError: Unexpected
 * end of JSON input" in Next internals, observed 2026-11-13). Requesting every route once,
 * sequentially, completes the first compile without contention. Production builds are unaffected.
 */
const ROUTES = [
  "/",
  "/en",
  "/dev/tokens",
  "/en/dev/tokens",
  "/dev/components",
  "/en/dev/components",
];

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  for (const route of ROUTES) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch(new URL(route, baseURL));
      await response.text(); // wait for the full response (compile finished)
      if (response.ok) break;
      if (attempt === 3) throw new Error(`Warm-up failed for ${route}: HTTP ${response.status}`);
    }
  }
}
