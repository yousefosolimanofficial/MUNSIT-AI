"use client";

import { usePathname } from "@/i18n/navigation";

import { resolveActiveDestination, type ActiveDestination } from "./resolve-active-destination";

/**
 * Active destination for Client Components (Phase 05 navigation). A thin wrapper: the locale-
 * stripped pathname from next-intl, resolved by the pure `resolveActiveDestination`.
 */
export function useActiveDestination(): ActiveDestination {
  return resolveActiveDestination(usePathname());
}
