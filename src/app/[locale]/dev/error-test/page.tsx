import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ErrorTrigger } from "./ErrorTrigger";

/*
 * TEMPORARY development-only route (Phase 04, D-R10): throws a render error on request so the
 * localized `[locale]/error.tsx` boundary can be tested end to end. Returns 404 in production
 * builds, like `/dev/components` and `/dev/tokens`. Remove before Phase 22.
 */

export const metadata: Metadata = {
  title: "Dev · Error test",
  robots: { index: false, follow: false },
};

export default async function DevErrorTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const t = await getTranslations("dev");

  return (
    <main className="grid gap-md p-lg" lang="en">
      <h1 className="text-dashboard-title-l">{t("errorTest.title")}</h1>
      <ErrorTrigger label={t("errorTest.trigger")} />
    </main>
  );
}
