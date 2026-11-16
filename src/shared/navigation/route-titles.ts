import type { RouteKey } from "@/i18n/routes";

import { destinationForRoot, type DestinationId } from "./nav-registry";

/*
 * Where each placeholder route takes its visible title from (Phase 04, D-R9). One source per
 * title, so nav labels are never duplicated:
 * - Landing → `common.brand.name`;
 * - a destination root → its nav label (`nav.destinations.<id>`);
 * - any other route → `pages.titles.<key>` (dots become underscores in message keys).
 */

/** `lectures.detail` → `lectures_detail` (next-intl keys cannot contain dots). */
type Underscored<K extends string> = K extends `${infer Head}.${infer Tail}`
  ? `${Head}_${Underscored<Tail>}`
  : K;

/** Routes that render a placeholder page (development routes excluded). */
export type PlaceholderRouteKey = Exclude<RouteKey, `dev.${string}`>;

export type PageTitleKey = Underscored<Exclude<PlaceholderRouteKey, "landing" | DestinationId>>;

export type RouteTitleSource =
  | { readonly namespace: "common"; readonly key: "brand.name" }
  | { readonly namespace: "nav"; readonly key: `destinations.${DestinationId}` }
  | { readonly namespace: "pages"; readonly key: `titles.${PageTitleKey}` };

export function routeTitleSource(routeKey: PlaceholderRouteKey): RouteTitleSource {
  if (routeKey === "landing") return { namespace: "common", key: "brand.name" };
  const destination = destinationForRoot(routeKey);
  if (destination) return { namespace: "nav", key: destination.labelKey };
  const key = routeKey.replaceAll(".", "_") as PageTitleKey;
  return { namespace: "pages", key: `titles.${key}` };
}
