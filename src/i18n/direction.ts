import type { AppLocale } from "./routing";

/** Writing direction per locale: Arabic RTL, English LTR (CLAUDE.md, Handoff). */
export const LOCALE_DIRECTION: Readonly<Record<AppLocale, "rtl" | "ltr">> = {
  ar: "rtl",
  en: "ltr",
};

export function directionOf(locale: AppLocale): "rtl" | "ltr" {
  return LOCALE_DIRECTION[locale];
}
