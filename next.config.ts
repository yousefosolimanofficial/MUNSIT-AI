import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev-only route indicator is pinned to a viewport corner, where it covers a shell control
  // in every corner of the mobile shell (Top Bar or bottom navigation). Compile and runtime errors
  // are still shown in development; production is unaffected.
  devIndicators: false,
};

// i18n request config lives in src/i18n (Roadmap §3).
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
