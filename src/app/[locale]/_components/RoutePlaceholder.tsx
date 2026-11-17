import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routeTitleSource, type PlaceholderRouteKey } from "@/shared/navigation/route-titles";
import { Card } from "@/shared/ui/Card";

/*
 * Phase 04 route placeholder (plan §4, D-R9). Not a product screen: it shows the screen title and
 * says the feature is not implemented. Titles come from the registry or messages (never inline),
 * and the copy is bilingual through next-intl. Layout is minimal; on `(app)` routes it renders
 * inside the Phase 05 app shell. Server Component.
 */

async function routeTitle(routeKey: PlaceholderRouteKey): Promise<string> {
  const source = routeTitleSource(routeKey);
  switch (source.namespace) {
    case "common":
      return (await getTranslations("common"))(source.key);
    case "nav":
      return (await getTranslations("nav"))(source.key);
    case "pages":
      return (await getTranslations("pages"))(source.key);
  }
}

/** Page `<title>`: the screen title, completed by the layout's "%s · MUNSIT AI" template. */
export async function placeholderMetadata(routeKey: PlaceholderRouteKey): Promise<Metadata> {
  if (routeKey === "landing") return {};
  return { title: await routeTitle(routeKey) };
}

/** Local layout constant (not a token): readable width of the placeholder card. */
const CARD_WIDTH = "max-w-[560px]";

/**
 * Routes outside the `(app)` group (Landing, Auth, Focus) have no app shell, so the placeholder
 * is their `<main>`. Inside the shell, the shell owns the one `<main>` (Phase 05) and the
 * placeholder is plain content within it.
 */
function isOutsideShell(routeKey: PlaceholderRouteKey): boolean {
  return routeKey === "landing" || routeKey.startsWith("auth.") || routeKey === "flashcards.study";
}

export async function RoutePlaceholder({ routeKey }: { routeKey: PlaceholderRouteKey }) {
  const [title, t] = await Promise.all([routeTitle(routeKey), getTranslations("pages")]);
  const outsideShell = isOutsideShell(routeKey);
  const Root = outsideShell ? "main" : "div";

  return (
    <Root
      data-route-key={routeKey}
      className={
        outsideShell
          ? "grid min-h-dvh place-items-center bg-surface-void-black p-lg"
          : "grid min-h-full place-items-center"
      }
    >
      <Card
        as="section"
        aria-labelledby="route-placeholder-title"
        className={`grid w-full ${CARD_WIDTH} gap-sm text-center`}
      >
        <h1 id="route-placeholder-title" className="text-dashboard-title-l">
          {title}
        </h1>
        <p className="text-dashboard-body text-text-secondary">{t("notImplemented")}</p>
      </Card>
    </Root>
  );
}
