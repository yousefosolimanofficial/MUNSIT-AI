import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 Proxy (formerly `middleware.ts`). Resolves the locale from the URL only:
 * unprefixed → Arabic (internally rewritten to `/ar/...`), `/en/...` → English,
 * `/ar/...` → redirected to the unprefixed URL. No Accept-Language detection, no cookie.
 */
export default createMiddleware(routing);

export const config = {
  // All pathnames except API/internal routes and files with an extension (e.g. /brand/*.png).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
