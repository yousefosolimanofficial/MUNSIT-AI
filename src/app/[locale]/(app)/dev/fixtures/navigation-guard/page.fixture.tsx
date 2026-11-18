import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { GuardHarness } from "./GuardHarness";

/*
 * Development-only TEST FIXTURE (Phase 06 Increment 5; replaces the temporary `/dev/guard` route
 * of D-U9). It exercises the navigation guard inside the real app shell (Sidebar, Rail, drawer,
 * bottom bar, More sheet, user menu) for `tests/e2e/navigation-guard.spec.ts`.
 * - Not a route in production: `.fixture.tsx` is a page extension only outside production
 *   (next.config.ts), so `next build` never compiles it. The `notFound()` below is a second guard.
 * - Linked from nowhere; no product copy and no debugging data.
 */

export const metadata: Metadata = {
  title: "Fixture · Navigation guard",
  robots: { index: false, follow: false },
};

export default async function NavigationGuardFixturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const t = await getTranslations("dev");

  return (
    <div lang="en" className="grid gap-md">
      <h1 className="text-dashboard-title-l">{t("guardTest.title")}</h1>
      <GuardHarness
        labels={{
          guardOn: t("guardTest.guardOn"),
          guardOff: t("guardTest.guardOff"),
          kindUnsaved: t("guardTest.kindUnsaved"),
          kindRecording: t("guardTest.kindRecording"),
          inPageLink: t("guardTest.inPageLink"),
          programmatic: t("guardTest.programmatic"),
          status: t("guardTest.status"),
        }}
      />
    </div>
  );
}
