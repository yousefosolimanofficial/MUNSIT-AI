"use client";

import type { ComponentProps } from "react";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

/*
 * MUNSIT AI — language switch (Phase 05). Figma: `Language Switch` `2211:182`: 86 × 38,
 * radius 12, padding 4, gap 2, White 4% fill, 1px Sky 12%; segments 37 × 28, radius 9,
 * padding 6 / 10, Inter Medium 12/16; current segment Sky 20% + white, other Text/Secondary.
 *
 * - A labelled group ("اللغة") of two locale-aware links to the **same page** in each language
 *   (typed next-intl `Link`; dynamic params kept). The other language passes `locale`, which
 *   next-intl always prefixes (`/ar/…` then redirects to the unprefixed Arabic URL); the
 *   current language links without it and has `aria-current="true"`.
 * - Visible text stays "EN" / "AR" (Figma). Each link is also named by its language in that
 *   language (approved copy, plan §14), in a visually hidden span with `lang`, after the visible
 *   code, so the name contains the visible label (WCAG 2.5.3): "EN English", "AR العربية".
 * - The segment order is the Figma visual order (EN, AR from left to right) in both directions:
 *   Latin labels, so the group is `dir="ltr"`.
 * - The query string is not carried over (no screen uses one yet).
 */

export interface LanguageSwitchProps {
  labels: { language: string; languageNames: { en: string; ar: string } };
}

type LinkHref = ComponentProps<typeof Link>["href"];

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const GROUP =
  "flex h-[38px] shrink-0 items-center gap-[2px] rounded-md border border-accent-electric-sky/12 bg-text-primary/4 p-xs";

const SEGMENT = [
  "flex h-[28px] w-[37px] items-center justify-center rounded-[9px] text-dashboard-label-en",
  "transition-colors duration-base ease-standard",
  FOCUS_RING,
].join(" ");
const SEGMENT_CURRENT = "bg-accent-electric-sky/20 text-text-primary";
const SEGMENT_OTHER = "cursor-pointer text-text-secondary";

const SEGMENTS = [
  { locale: "en", text: "EN" },
  { locale: "ar", text: "AR" },
] as const satisfies readonly { locale: AppLocale; text: string }[];

export function LanguageSwitch({ labels }: LanguageSwitchProps) {
  const current = useLocale();
  const pathname = usePathname();
  // Route params without the `[locale]` segment, which `locale` below replaces.
  const params = Object.fromEntries(
    Object.entries(useParams<Record<string, string>>()).filter(([key]) => key !== "locale"),
  );
  // `pathname` is the internal template of the typed `pathnames` (e.g. a `[folderId]` route);
  // the current params fill it. next-intl cannot correlate the two types, hence the cast.
  const href = (Object.keys(params).length > 0 ? { pathname, params } : pathname) as LinkHref;

  return (
    <div role="group" aria-label={labels.language} dir="ltr" className={GROUP}>
      {SEGMENTS.map((segment) => {
        const isCurrent = segment.locale === current;
        return (
          <Link
            key={segment.locale}
            href={href}
            locale={isCurrent ? undefined : segment.locale}
            aria-current={isCurrent ? "true" : undefined}
            className={`${SEGMENT} ${isCurrent ? SEGMENT_CURRENT : SEGMENT_OTHER}`}
          >
            {/* Name = visible code + the language named in itself (WCAG 2.5.3 Label in Name). */}
            <span lang="en">{segment.text}</span>
            <span lang={segment.locale} className="sr-only">
              {` ${labels.languageNames[segment.locale]}`}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
