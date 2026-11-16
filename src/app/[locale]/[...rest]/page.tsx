import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths (Phase 04, D-R8). `notFound()` renders the nearest
 * `[locale]/not-found.tsx` inside the locale layout (correct lang/dir) with an HTTP 404. Specific
 * routes always win over this catch-all. The experimental `global-not-found` is not used.
 */
export default function UnknownRoute(): never {
  notFound();
}
