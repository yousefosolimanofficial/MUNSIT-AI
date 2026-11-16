"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

/*
 * Localized route-error boundary (Phase 04, plan §6). Error boundaries must be Client Components
 * (Next.js 16.4 docs). The locale layout passes the `errors` namespace to the client, so
 * `useTranslations("errors")` works here (the rest of the catalog stays on the server). Unknown
 * routes are handled separately by `not-found.tsx`. Copy: `errors.error` (PROPOSED, D-R9).
 *
 * Next.js 16.2+ passes `retry` (re-fetch and re-render the segment) and `error: unknown`.
 */

const CARD_WIDTH = "max-w-[560px]";

export default function RouteError({ retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations("errors");

  return (
    <main
      data-testid="route-error"
      className="grid min-h-dvh place-items-center bg-surface-void-black p-lg"
    >
      <Card
        as="section"
        aria-labelledby="route-error-title"
        className={`grid w-full ${CARD_WIDTH} gap-sm text-center`}
      >
        {/* Card is static by contract (no role); the alert lives on an inner wrapper. */}
        <div role="alert" className="grid gap-sm">
          <h1 id="route-error-title" className="text-dashboard-title-l">
            {t("error.title")}
          </h1>
          <p className="text-dashboard-body text-text-secondary">{t("error.body")}</p>
        </div>
        <Button type="button" className="justify-self-center" onClick={() => retry()}>
          {t("error.retry")}
        </Button>
      </Card>
    </main>
  );
}
