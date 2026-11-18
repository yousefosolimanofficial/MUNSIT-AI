import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { GuardHarness } from "./GuardHarness";

/*
 * TEMPORARY development-only route (Phase 06, D-U9): exercises the navigation guard inside the
 * real app shell (Sidebar, Rail, drawer, bottom bar, More sheet, user menu). Returns 404 in
 * production builds, is linked from nowhere, shows no debugging data, and is removed before the
 * Phase 06 closure.
 */

export const metadata: Metadata = {
  title: "Dev · Navigation guard",
  robots: { index: false, follow: false },
};

export default async function DevGuardPage() {
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
