import type { Metadata } from "next";

import { placeholderMetadata, RoutePlaceholder } from "@/app/[locale]/_components/RoutePlaceholder";

/** Phase 04 placeholder (route key `summaries.reader`; path in `src/i18n/routes.ts`). Not implemented yet. */
export function generateMetadata(): Promise<Metadata> {
  return placeholderMetadata("summaries.reader");
}

export default function Page() {
  return <RoutePlaceholder routeKey="summaries.reader" />;
}
