"use client";

import { Suspense } from "react";

import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

import { useSamePageHref, useSamePageHrefWithQuery, type LinkHref } from "./use-same-page-href";

/*
 * MUNSIT AI — language switch (Phase 05). Figma: `Language Switch` `2211:182`: 86 × 38,
 * radius 12, padding 4, gap 2, White 4% fill, 1px Sky 12%; segments 37 × 28, radius 9,
 * padding 6 / 10, Inter Medium 12/16; current segment Sky 20% + white, other Text/Secondary.
 *
 * - A labelled group ("اللغة") of two locale-aware links to the **same page** in each language
 *   (typed next-intl `Link`): the pathname, dynamic params and query string are kept. The other
 *   language passes `locale`, which next-intl always prefixes (`/ar/…` then redirects to the
 *   unprefixed Arabic URL); the current language links without it and has
 *   `aria-current="true"`.
 * - The query is read inside a `<Suspense>` boundary (`useSamePageHrefWithQuery`); its fallback
 *   is the same group without the query, so the prerendered HTML and the layout never change.
 * - Visible text stays "EN" / "AR" (Figma). Each link is also named by its language in that
 *   language (approved copy, plan §14), in a visually hidden span with `lang`, after the visible
 *   code, so the name contains the visible label (WCAG 2.5.3): "EN English", "AR العربية".
 * - The segment order is the Figma visual order (EN, AR from left to right) in both directions:
 *   Latin labels, so the group is `dir="ltr"`.
 */

export interface LanguageSwitchProps {
  labels: { language: string; languageNames: { en: string; ar: string } };
  /** Called when a language link is activated (the mobile More sheet closes). */
  onNavigate?: () => void;
}

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

/** The two languages, in the Figma visual order. Shared with the mobile More sheet. */
export const LANGUAGE_SEGMENTS = [
  { locale: "en", text: "EN" },
  { locale: "ar", text: "AR" },
] as const satisfies readonly { locale: AppLocale; text: string }[];

function LanguageGroup({ labels, href, onNavigate }: LanguageSwitchProps & { href: LinkHref }) {
  const current = useLocale();
  return (
    <div role="group" aria-label={labels.language} dir="ltr" className={GROUP}>
      {LANGUAGE_SEGMENTS.map((segment) => {
        const isCurrent = segment.locale === current;
        return (
          <Link
            key={segment.locale}
            href={href}
            locale={isCurrent ? undefined : segment.locale}
            aria-current={isCurrent ? "true" : undefined}
            onClick={onNavigate}
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

function LanguageGroupWithQuery(props: LanguageSwitchProps) {
  return <LanguageGroup {...props} href={useSamePageHrefWithQuery()} />;
}

function LanguageGroupWithoutQuery(props: LanguageSwitchProps) {
  return <LanguageGroup {...props} href={useSamePageHref()} />;
}

export function LanguageSwitch(props: LanguageSwitchProps) {
  return (
    <Suspense fallback={<LanguageGroupWithoutQuery {...props} />}>
      <LanguageGroupWithQuery {...props} />
    </Suspense>
  );
}
