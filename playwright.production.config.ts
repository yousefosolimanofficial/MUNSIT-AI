import { defineConfig, devices } from "@playwright/test";

/*
 * Production smoke suite (Phase 07 Increment 6, owner-approved 2026-11-22).
 *
 * Runs against a real production build (`NEXT_PUBLIC_APP_ENV=production`, `next build` then
 * `next start`), not the development server. It is isolated from the development suite
 * (playwright.config.ts):
 * - its own test folder (`tests/e2e-production`), which the development config never reads;
 * - its own port, report and output folders;
 * - no reuse of an existing server, so a running development server is never tested by mistake.
 *
 * Run: `corepack pnpm test:e2e:prod`. The build overwrites `.next` (as `pnpm build` does).
 */

const PORT = 3200;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e-production",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Same policy as the development suite: retries only capture a trace; flaky fails the run.
  retries: process.env.CI ? 2 : 0,
  failOnFlakyTests: !!process.env.CI,
  outputDir: "test-results-production",
  reporter: process.env.CI
    ? [
        ["list"],
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report-production" }],
      ]
    : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "production-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `next build && next start --port ${PORT}`,
    url: baseURL,
    // Never reuse: the suite must start the production server it built.
    reuseExistingServer: false,
    timeout: 300_000,
    env: { NEXT_PUBLIC_APP_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
