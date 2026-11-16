import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/i18n/routes";
import { DESTINATIONS } from "@/shared/navigation/nav-registry";

import type { ShellLabels } from "./shell-model";

/**
 * Server-side: resolves every shell string for the request's locale (approved copy, Phase 05
 * plan §14) and maps the registry to translated destinations. Client shell parts get the result
 * as props, so no message namespace is sent to the browser.
 */
export async function getShellLabels(): Promise<ShellLabels> {
  const [nav, shell] = await Promise.all([getTranslations("nav"), getTranslations("shell")]);
  return {
    mainNavigation: shell("mainNavigation"),
    skipToContent: shell("skipToContent"),
    openMenu: shell("openMenu"),
    drawerTitle: shell("drawerTitle"),
    upgrade: {
      title: nav("moreExtras.upgradePlan"),
      description: shell("upgradeCard.description"),
      action: shell("upgradeCard.action"),
    },
    destinations: DESTINATIONS.map((destination) => ({
      id: destination.id,
      label: nav(destination.labelKey),
      icon: destination.icon,
      href: ROUTES[destination.routeKey],
    })),
  };
}
