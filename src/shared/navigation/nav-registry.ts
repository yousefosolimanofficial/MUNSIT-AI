import type { IconName } from "@/design-system/icons/manifest";
import type { RouteKey } from "@/i18n/routes";

/*
 * MUNSIT AI navigation registry (Phase 04). The single source for every navigation surface:
 * Sidebar, Rail, Drawer, mobile bottom bar, More sheet (Phase 05) and the Settings secondary
 * navigation (Phase 05/20). Plan: docs/phases/phase-04-plan.md §8; decisions D-R6, D-R7.
 *
 * - Labels are message keys in the `nav` namespace, never inline strings (Roadmap Phase 04 DoD).
 *   Arabic labels are verbatim from the Handoff and Figma; English labels are product-owner
 *   approved (D-R7) for destinations.
 * - Routes are route keys from `@/i18n/routes`, never paths.
 * - Icons are verified Figma icons (docs/design-values.md §2b.1).
 * - This module holds data only: no React, no presentation.
 */

/** Canonical destination ids, in the approved order (Handoff, Roadmap Phase 04). */
export const DESTINATION_IDS = [
  "dashboard",
  "lectures",
  "summaries",
  "questions",
  "flashcards",
  "notes",
  "favorites",
  "folders",
] as const;

export type DestinationId = (typeof DESTINATION_IDS)[number];

/** Where a destination appears on mobile: the bottom bar or the More sheet (Handoff). */
export type MobilePlacement = "bar" | "more";

export interface Destination {
  readonly id: DestinationId;
  /** Key in the `nav` namespace. */
  readonly labelKey: `destinations.${DestinationId}`;
  readonly icon: IconName;
  /** The destination's root route. */
  readonly routeKey: RouteKey;
  readonly mobile: MobilePlacement;
}

export const DESTINATIONS = [
  {
    id: "dashboard",
    labelKey: "destinations.dashboard",
    icon: "home",
    routeKey: "dashboard",
    mobile: "bar",
  },
  {
    id: "lectures",
    labelKey: "destinations.lectures",
    icon: "book",
    routeKey: "lectures",
    mobile: "bar",
  },
  {
    id: "summaries",
    labelKey: "destinations.summaries",
    icon: "fileText",
    routeKey: "summaries",
    mobile: "bar",
  },
  {
    id: "questions",
    labelKey: "destinations.questions",
    icon: "help",
    routeKey: "questions",
    mobile: "more",
  },
  {
    id: "flashcards",
    labelKey: "destinations.flashcards",
    icon: "cards",
    routeKey: "flashcards",
    mobile: "more",
  },
  { id: "notes", labelKey: "destinations.notes", icon: "note", routeKey: "notes", mobile: "more" },
  {
    id: "favorites",
    labelKey: "destinations.favorites",
    icon: "star",
    routeKey: "favorites",
    mobile: "more",
  },
  {
    id: "folders",
    labelKey: "destinations.folders",
    icon: "folder",
    routeKey: "folders",
    mobile: "more",
  },
] as const satisfies readonly Destination[];

/**
 * Mobile bottom bar: the three `bar` destinations followed by the More control (Handoff,
 * Roadmap acceptance: الرئيسية، محاضراتي، الملخصات، المزيد). More is **not** a destination (D-R6).
 */
export const MOBILE_BAR_DESTINATIONS = DESTINATIONS.filter((d) => d.mobile === "bar");

export const MORE_CONTROL = { labelKey: "more", icon: "more" } as const satisfies {
  labelKey: "more";
  icon: IconName;
};

/**
 * More sheet (Handoff): the five `more` destinations, then account settings and the plan upgrade
 * entry. Copy verbatim from Figma "Overlay / Mobile / More Menu". The upgrade entry has no route
 * until the plan behaviour is defined (gate D-18).
 */
export const MORE_SHEET_DESTINATIONS = DESTINATIONS.filter((d) => d.mobile === "more");

export const MORE_SHEET_EXTRAS = [
  {
    id: "accountSettings",
    labelKey: "moreExtras.accountSettings",
    icon: "settings",
    routeKey: "settings",
  },
  { id: "upgradePlan", labelKey: "moreExtras.upgradePlan", icon: "crown", routeKey: null },
] as const satisfies readonly {
  id: string;
  labelKey: `moreExtras.${string}`;
  icon: IconName;
  routeKey: RouteKey | null;
}[];

/**
 * Settings secondary navigation, in Figma order ("Settings Navigation", page 14). `activeFor`
 * lists the routes on which the item is current (Figma: Profile is active on both Profile
 * Overview and Edit Profile). "إدارة الحساب" is never active in Figma and has no screen of its
 * own, so its target is unresolved (`routeKey: null`); it is not invented.
 */
export const SETTINGS_NAV = [
  {
    id: "profile",
    labelKey: "settingsNav.profile",
    routeKey: "settings",
    activeFor: ["settings", "settings.profile"],
  },
  {
    id: "preferences",
    labelKey: "settingsNav.preferences",
    routeKey: "settings.preferences",
    activeFor: ["settings.preferences"],
  },
  {
    id: "notifications",
    labelKey: "settingsNav.notifications",
    routeKey: "settings.notifications",
    activeFor: ["settings.notifications"],
  },
  {
    id: "security",
    labelKey: "settingsNav.security",
    routeKey: "settings.security",
    activeFor: ["settings.security"],
  },
  {
    id: "subscription",
    labelKey: "settingsNav.subscription",
    routeKey: "settings.subscription",
    activeFor: ["settings.subscription"],
  },
  { id: "account", labelKey: "settingsNav.account", routeKey: null, activeFor: [] },
] as const satisfies readonly {
  id: string;
  labelKey: `settingsNav.${string}`;
  routeKey: RouteKey | null;
  activeFor: readonly RouteKey[];
}[];

export function isDestinationId(value: string): value is DestinationId {
  return (DESTINATION_IDS as readonly string[]).includes(value);
}

/** The destination whose root route is `routeKey`, if any (used for placeholder titles). */
export function destinationForRoot(routeKey: RouteKey): Destination | undefined {
  return DESTINATIONS.find((d) => d.routeKey === routeKey);
}
