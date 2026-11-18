import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/*
 * Test fixtures (`page.fixture.tsx`) are routes only outside production: `next dev` (and the E2E
 * suite, which runs on it) serves them; `next build` does not see them at all. Phase 06: the
 * navigation-guard fixture, which needs the real app shell (docs/shared-patterns.md).
 */
const PAGE_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions:
    process.env.NODE_ENV === "production" ? PAGE_EXTENSIONS : [...PAGE_EXTENSIONS, "fixture.tsx"],
  poweredByHeader: false,
  // The dev-only route indicator is pinned to a viewport corner, where it covers a shell control
  // in every corner of the mobile shell (Top Bar or bottom navigation). Compile and runtime errors
  // are still shown in development; production is unaffected.
  devIndicators: false,
};

// i18n request config lives in src/i18n (Roadmap §3).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
