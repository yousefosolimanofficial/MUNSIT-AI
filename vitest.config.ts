import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    // next-intl's navigation imports `next/navigation` without a file extension, which Node's ESM
    // resolver rejects; letting Vite process next-intl resolves it (Phase 04 link-locale tests).
    server: { deps: { inline: ["next-intl"] } },
  },
});
