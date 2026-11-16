import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import { Card } from "@/shared/ui/Card";

/*
 * Localized 404 (Phase 04, D-R8). Rendered inside the locale layout for every `notFound()`,
 * including unknown paths through the `[...rest]` catch-all, so `lang`/`dir` follow the URL.
 * Copy: `errors.notFound` (approved 2026-11-16). Server Component.
 *
 * Title: Next.js 16 serves `notFound()` responses through its error document and renders this
 * page on hydration, where segment metadata is not applied (Phase 04 report §7.1). The page
 * therefore renders React's <title> itself, which React hoists into <head>.
 */

const CARD_WIDTH = "max-w-[560px]";

/** Text-link style with the D-B2 focus ring (no button: this is navigation). */
const LINK_CLASSES = [
  "justify-self-center rounded-sm text-dashboard-body-medium text-accent-electric-sky",
  "underline underline-offset-4",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky",
].join(" ");

export default async function NotFound() {
  const [t, tCommon] = await Promise.all([getTranslations("errors"), getTranslations("common")]);

  return (
    <main
      data-testid="not-found"
      className="grid min-h-dvh place-items-center bg-surface-void-black p-lg"
    >
      <title>{`${t("notFound.title")} · ${tCommon("brand.name")}`}</title>
      <Card
        as="section"
        aria-labelledby="not-found-title"
        className={`grid w-full ${CARD_WIDTH} gap-sm text-center`}
      >
        <h1 id="not-found-title" className="text-dashboard-title-l">
          {t("notFound.title")}
        </h1>
        <p className="text-dashboard-body text-text-secondary">{t("notFound.body")}</p>
        <Link href={ROUTES.landing} className={LINK_CLASSES}>
          {t("notFound.backHome")}
        </Link>
      </Card>
    </main>
  );
}
