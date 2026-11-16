import type { IconName } from "@/design-system/icons/manifest";
import { ROUTES } from "@/i18n/routes";
import type { DESTINATIONS, DestinationId } from "@/shared/navigation/nav-registry";

/*
 * MUNSIT AI — app shell data model (Phase 05). Plan: docs/phases/phase-05-plan.md §7, §10.
 *
 * The shell is fed only by the Phase 04 registry (`DESTINATIONS`) and translated on the server
 * (`getShellLabels`), so client parts receive plain strings and paths. This module holds types
 * and constants only: no React, no translations.
 */

/** The static root path of a registry destination (e.g. the Dashboard or My Lectures root). */
export type DestinationPath = (typeof ROUTES)[(typeof DESTINATIONS)[number]["routeKey"]];

/** One navigation entry, already translated. */
export interface ShellDestination {
  readonly id: DestinationId;
  readonly label: string;
  readonly icon: IconName;
  readonly href: DestinationPath;
}

/** Every string the shell renders (approved copy, plan §14), resolved for the active locale. */
export interface ShellLabels {
  /** `nav` landmark name for the Sidebar, Rail and drawer: "التنقل الرئيسي". */
  readonly mainNavigation: string;
  /** Skip link: "الانتقال إلى المحتوى الرئيسي". */
  readonly skipToContent: string;
  /** Rail menu button name: "فتح القائمة". */
  readonly openMenu: string;
  /** Drawer dialog name: "القائمة". */
  readonly drawerTitle: string;
  readonly upgrade: {
    /** Card title and Rail upgrade button name: "ترقية الخطة" (`nav.moreExtras.upgradePlan`). */
    readonly title: string;
    readonly description: string;
    /** Card action: "ترقية الآن". */
    readonly action: string;
  };
  /** The eight destinations in registry order. */
  readonly destinations: readonly ShellDestination[];
}

/** Plan upgrade target (D-S7): the existing subscription settings route. No payment logic. */
export const UPGRADE_HREF = ROUTES["settings.subscription"];

/** Id of the shell's `<main>`; the skip link targets it. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * Viewport range in which the Tablet Rail (and so its drawer) is shown: ADR-004
 * `rail:` (45rem) up to `xl:` (80rem). Used to close the drawer when the viewport leaves it.
 */
export const RAIL_RANGE_QUERY = "(width >= 45rem) and (width < 80rem)";
