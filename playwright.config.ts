import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

// Phase 01: Chromium smoke test only. Firefox, WebKit (Safari) and Edge are
// added for the cross-browser pass (latest two stable majors, ADR-001).
export default defineConfig({
  testDir: "./tests/e2e",
  // Sequential warm-up of the dev server before parallel workers (see the file for why).
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI retries only to capture a trace (`on-first-retry`); a test that passes only on a retry
  // is reported as flaky and fails the run, so retries never hide instability.
  retries: process.env.CI ? 2 : 0,
  failOnFlakyTests: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
