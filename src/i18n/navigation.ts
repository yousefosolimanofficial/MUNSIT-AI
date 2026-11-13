import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation. Always use these instead of `next/link` / `next/navigation` so
 * links keep the current locale (Arabic unprefixed, English under `/en`).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
