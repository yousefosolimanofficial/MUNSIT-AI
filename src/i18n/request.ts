import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { MESSAGES } from "./messages";
import { routing } from "./routing";

/**
 * Per-request i18n configuration for Server Components (next-intl).
 *
 * The locale comes from the `[locale]` root segment via `next/root-params` (Next.js 16.3+), so
 * pages stay statically renderable and no `setRequestLocale` call is needed. Unknown locales 404.
 * Messages are bundled server-side only. The root layout's NextIntlClientProvider passes the
 * locale to Client Components (locale-aware Link) with `messages={null}`: no translations are
 * sent to the browser until a Client Component needs specific namespaces.
 */
export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;
  if (!resolved) {
    const param = await rootParams.locale();
    if (!hasLocale(routing.locales, param)) notFound();
    resolved = param;
  }
  if (!hasLocale(routing.locales, resolved)) notFound();

  return {
    locale: resolved,
    messages: MESSAGES[resolved],
  };
});
