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
  /** `nav` landmark name for the mobile bottom navigation: "التنقل السفلي". */
  readonly bottomNavigation: string;
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
  /** Top Bar controls (plan §11, decisions D-S3–D-S6, D-S9). */
  readonly topBar: TopBarLabels;
  /** Mobile More sheet (plan §10, §11.3; mobile language access approved 2026-11-17). */
  readonly more: MoreSheetLabels;
}

export interface MoreSheetLabels {
  /** Sheet title and accessible name: "المزيد" (`nav.more`). */
  readonly title: string;
  /** Close button name: "إغلاق القائمة". */
  readonly close: string;
  /** "إعدادات الحساب" (`nav.moreExtras.accountSettings`) → the Settings root. */
  readonly accountSettings: string;
}

export interface TopBarLabels {
  /** Search button and trigger name: "البحث". */
  readonly search: string;
  /** Visible text of the desktop/tablet search trigger (Figma placeholder). */
  readonly searchPlaceholder: string;
  /** Search availability message (D-S4). */
  readonly searchSoon: string;
  /** Notifications button name and popover title: "الإشعارات". */
  readonly notifications: string;
  /** Notifications availability message (D-S5). */
  readonly notificationsSoon: string;
  /** Appearance (theme) trigger name and menu name: "المظهر". */
  readonly appearance: string;
  /** Theme options (D-S3): Dark is the only available theme. */
  readonly theme: { readonly dark: string; readonly light: string; readonly system: string };
  /** User menu trigger name and menu name: "قائمة الحساب". */
  readonly accountMenu: string;
  /** User menu: "الملف الشخصي" (`nav.settingsNav.profile`). */
  readonly profile: string;
  /** User menu: "الإعدادات". */
  readonly settings: string;
  /** Language switch group name: "اللغة". */
  readonly language: string;
  /** Each language named in its own language (rendered with `lang`). */
  readonly languageNames: { readonly en: string; readonly ar: string };
}

/** Settings root (D-S9): the user menu's Profile and Settings both open it. */
export const SETTINGS_HREF = ROUTES.settings;

/** Plan upgrade target (D-S7): the existing subscription settings route. No payment logic. */
export const UPGRADE_HREF = ROUTES["settings.subscription"];

/** Id of the shell's `<main>`; the skip link targets it. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * Viewport range in which the Tablet Rail (and so its drawer) is shown: ADR-004
 * `rail:` (45rem) up to `xl:` (80rem). Used to close the drawer when the viewport leaves it.
 */
export const RAIL_RANGE_QUERY = "(width >= 45rem) and (width < 80rem)";

/**
 * Viewport range of the mobile shell (ADR-004: below `rail:`, 45rem). Used to close the More
 * sheet when the viewport leaves it.
 */
export const MOBILE_RANGE_QUERY = "(width < 45rem)";
