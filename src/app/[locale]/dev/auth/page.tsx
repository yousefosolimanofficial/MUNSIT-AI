import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AuthFoundationPreview, type AuthFamily } from "@/features/auth";

/*
 * Development-only preview of the Authentication foundation (Phase 08 Increment 1, D-08-4).
 * Like every `/dev/*` route it returns 404 in production builds. Query: `family` = login |
 * register | recovery (default login), `view` = components | result (default components).
 * Preview labels are development fixtures, kept here (not product copy).
 */

export const metadata: Metadata = { robots: { index: false, follow: false } };

const FAMILIES: readonly AuthFamily[] = ["login", "register", "recovery"];

const LABELS = {
  ar: {
    banner: "معاينة تطوير فقط — ليست مصادقة فعّالة. لا يتم إنشاء حسابات أو جلسات.",
    sections: { fields: "حالات الحقول", actions: "حالات الأزرار والرسائل", result: "عرض النتيجة" },
  },
  en: {
    banner:
      "Development preview only — not functional authentication. No accounts or sessions are created.",
    sections: {
      fields: "Field states",
      actions: "Button and message states",
      result: "Result view",
    },
  },
} as const;

export default async function DevAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string; view?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const [{ family: familyParam, view: viewParam }, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);
  const family = FAMILIES.find((f) => f === familyParam) ?? "login";
  const view = viewParam === "result" ? "result" : "components";

  return (
    <main>
      <AuthFoundationPreview
        family={family}
        view={view}
        labels={locale === "en" ? LABELS.en : LABELS.ar}
      />
    </main>
  );
}
