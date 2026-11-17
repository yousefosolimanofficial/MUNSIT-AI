"use client";

import type { ComponentProps } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { Link, usePathname } from "@/i18n/navigation";

/*
 * MUNSIT AI — "the current page" as a typed next-intl `href`, for switching language without
 * leaving the page (Phase 05: the Top Bar language switch and the mobile More sheet).
 *
 * - `pathname` is next-intl's internal template of the typed `pathnames` (e.g. a `[folderId]`
 *   route); the current route params fill it (without the `[locale]` segment, which the link's
 *   `locale` replaces).
 * - `useSamePageHrefWithQuery` also carries the current query string. It reads
 *   `useSearchParams`, so its component must sit inside a `<Suspense>` boundary: on prerendered
 *   pages the boundary's fallback renders the same links without the query, and the client
 *   adds the query after hydration (Next.js 16, `useSearchParams` › Prerendering).
 */

export type LinkHref = ComponentProps<typeof Link>["href"];

type Query = Record<string, string | string[]>;

function toQuery(search: URLSearchParams): Query | undefined {
  const query: Query = {};
  for (const key of new Set(search.keys())) {
    const values = search.getAll(key);
    query[key] = values.length === 1 ? (values[0] ?? "") : values;
  }
  return Object.keys(query).length > 0 ? query : undefined;
}

/** The current page without its query string. */
export function useSamePageHref(query?: Query): LinkHref {
  const pathname = usePathname();
  const params = Object.fromEntries(
    Object.entries(useParams<Record<string, string>>()).filter(([key]) => key !== "locale"),
  );
  const hasParams = Object.keys(params).length > 0;
  if (!hasParams && !query) return pathname as LinkHref;
  // next-intl cannot correlate a runtime pathname template with its params type, hence the cast.
  return {
    pathname,
    ...(hasParams ? { params } : {}),
    ...(query ? { query } : {}),
  } as LinkHref;
}

/** The current page with its query string. Call only inside a `<Suspense>` boundary. */
export function useSamePageHrefWithQuery(): LinkHref {
  return useSamePageHref(toQuery(useSearchParams()));
}
