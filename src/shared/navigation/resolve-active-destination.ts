import { routing } from "@/i18n/routing";
import { ROUTE_KEYS, ROUTES, type RouteKey } from "@/i18n/routes";

import {
  DESTINATIONS,
  isDestinationId,
  MOBILE_BAR_DESTINATIONS,
  type DestinationId,
} from "./nav-registry";

/*
 * Active destination from the URL alone (Phase 04, plan §9, D-R6). Pure functions: no React,
 * no presentation. The same URL always gives the same result, so a server render, a deep link
 * and a refresh agree.
 */

export interface ActiveDestination {
  /** The matched route (for breadcrumbs later), or null for an unknown path. */
  readonly routeKey: RouteKey | null;
  /** The canonical destination, or null (Settings, Landing, Auth, dev, unknown). */
  readonly destination: DestinationId | null;
}

/** Route groups whose top segment is not a destination: they never mark a destination. */
const NO_DESTINATION_ROOTS: ReadonlySet<string> = new Set(["landing", "auth", "settings", "dev"]);

const PATTERNS = ROUTE_KEYS.map((routeKey) => ({
  routeKey,
  segments: toSegments(ROUTES[routeKey]),
}));

function toSegments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function isDynamic(segment: string): boolean {
  return segment.startsWith("[") && segment.endsWith("]");
}

/**
 * Normalizes a pathname: drops query and hash, a trailing slash and a locale prefix
 * (`/en/...`, `/ar/...`). next-intl's `usePathname()` already returns the path without the
 * locale (and, with `pathnames`, may return the internal template such as
 * `/lectures/[lectureId]`); both forms are accepted.
 */
export function normalizePathname(pathname: string): string[] {
  const path = pathname.split(/[?#]/)[0] ?? "";
  const segments = toSegments(path).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
  const [first] = segments;
  if (first !== undefined && (routing.locales as readonly string[]).includes(first)) {
    segments.shift();
  }
  return segments;
}

/**
 * Specificity per segment: a static match scores 2, a dynamic match 1. Comparing the scores
 * position by position makes `/lectures/record` win over `/lectures/[lectureId]`.
 */
function score(pattern: string[], path: string[]): number[] | null {
  if (pattern.length !== path.length) return null;
  const result: number[] = [];
  for (const [index, segment] of pattern.entries()) {
    const actual = path[index];
    if (actual === undefined || actual === "") return null;
    if (isDynamic(segment)) result.push(1);
    else if (segment === actual) result.push(2);
    else return null;
  }
  return result;
}

function compare(a: number[], b: number[]): number {
  for (let index = 0; index < a.length; index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** The most specific route matching `pathname`, or null. */
export function matchRoute(pathname: string): RouteKey | null {
  const path = normalizePathname(pathname);
  let best: { routeKey: RouteKey; score: number[] } | null = null;
  for (const pattern of PATTERNS) {
    const s = score(pattern.segments, path);
    if (s && (best === null || compare(s, best.score) > 0)) {
      best = { routeKey: pattern.routeKey, score: s };
    }
  }
  return best?.routeKey ?? null;
}

/** The destination a route belongs to: the root of its key, unless that root has none. */
export function destinationOfRoute(routeKey: RouteKey): DestinationId | null {
  const root = routeKey.split(".")[0] ?? "";
  if (NO_DESTINATION_ROOTS.has(root)) return null;
  return isDestinationId(root) ? root : null;
}

export function resolveActiveDestination(pathname: string): ActiveDestination {
  const routeKey = matchRoute(pathname);
  return { routeKey, destination: routeKey ? destinationOfRoute(routeKey) : null };
}

/** Mobile bottom-bar tabs: the three bar destinations and the More control (not a destination). */
export type MobileBarTab = DestinationId | "more";

/**
 * D-R6: which bottom-bar tab indicates the current page.
 * - A bar destination marks its own tab (that tab gets `aria-current="page"` in Phase 05).
 * - A More-sheet destination marks the More control as "contains the current page" — visual
 *   only, never `aria-current` (More is not a page).
 * - No destination (Settings, Landing, Auth, unknown) marks nothing, so Settings never lights More.
 * The More sheet's open/closed state is separate UI state and never changes this result.
 */
export function mobileBarIndicator(destination: DestinationId | null): MobileBarTab | null {
  if (destination === null) return null;
  if (MOBILE_BAR_DESTINATIONS.some((d) => d.id === destination)) return destination;
  return DESTINATIONS.some((d) => d.id === destination && d.mobile === "more") ? "more" : null;
}
