import type { Metadata } from "next";

import { placeholderMetadata, RoutePlaceholder } from "@/app/[locale]/_components/RoutePlaceholder";

/** Phase 04 placeholder (route key `flashcards.deck`; path in `src/i18n/routes.ts`). Not implemented yet. */
export function generateMetadata(): Promise<Metadata> {
  return placeholderMetadata("flashcards.deck");
}

export default function Page() {
  return <RoutePlaceholder routeKey="flashcards.deck" />;
}
