import type { IconName } from "@/design-system/icons/manifest";
import { ICON_SIZES } from "@/design-system/icons/manifest";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/shared/ui/Icon";

import type { DestinationPath } from "./shell-model";

/*
 * MUNSIT AI — Mobile Navigation Item (Phase 05). Figma: component set `Mobile Navigation Item`
 * `2210:302` (State = Default `2210:290` | Active `2210:296`), used by `Bottom Navigation`
 * `2238:1187`. Assignment: START_HERE.md §3–§7 (API frozen).
 *
 * - `kind: "destination"`: a locale-aware next-intl `Link`; Active = the current destination,
 *   with `aria-current="page"`.
 * - `kind: "more"`: a `<button type="button">` opening the More sheet (`aria-haspopup="dialog"`,
 *   `aria-expanded`). Never `aria-current`: More is not a destination (D-R6). `containsActive`
 *   only switches it to the Active look (set by `BottomNav` from `mobileBarIndicator()`).
 * - The visible label is the accessible name; the icon is decorative (`aria-hidden`) and never
 *   mirrored. Same vertical layout in RTL and LTR.
 * - No hover or pressed state (none is designed). Colour transitions only, no transform.
 * - Server-safe (no state or effects); works as a Client Component child.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export type MobileNavItemProps =
  | { kind: "destination"; icon: IconName; label: string; href: DestinationPath; active: boolean }
  | {
      kind: "more";
      icon: "more";
      label: string;
      onOpen: () => void;
      expanded: boolean;
      containsActive: boolean;
      /**
       * More is not a destination (D-R6). Hyphenated JSX attributes are exempt from excess-prop
       * checks, so `never` is what makes `aria-current` on More a type error (§7 criterion 6).
       */
      "aria-current"?: never;
    };

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/** FIGMA box: 76 × 60, radius 14, padding 8, vertical stack, gap 4 (Space XS), centred. */
const BASE = [
  "w-[76px] h-[60px] rounded-[14px] p-[8px] flex flex-col items-center justify-center gap-xs",
  "cursor-pointer",
  "text-dashboard-caption",
  "transition-colors duration-base ease-standard",
  FOCUS_RING,
].join(" ");

/** FIGMA Default: no fill, Text/Secondary icon and label. */
const DEFAULT = "text-text-secondary";

/** FIGMA Active: Electric Sky 12% fill, Electric Sky icon and label. */
const ACTIVE = "bg-accent-electric-sky/12 text-accent-electric-sky";

/**
 * One line, always. Three of the four English bar labels are wider than the 60px content box
 * (61.9–70.3px measured in Chromium); the widest would otherwise wrap to two lines and break the
 * 60px height. Each fits inside the 76px box; the Arabic labels fit the content box.
 */
const LABEL = "whitespace-nowrap";

function classesFor(active: boolean): string {
  return `${BASE} ${active ? ACTIVE : DEFAULT}`;
}

export function MobileNavItem(props: MobileNavItemProps) {
  const content = (
    <>
      <Icon name={props.icon} size={ICON_SIZES.mobileNav} className="shrink-0" />
      <span className={LABEL}>{props.label}</span>
    </>
  );

  if (props.kind === "destination") {
    return (
      <Link
        href={props.href}
        aria-current={props.active ? "page" : undefined}
        className={classesFor(props.active)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={props.expanded}
      onClick={props.onOpen}
      className={classesFor(props.containsActive)}
    >
      {content}
    </button>
  );
}
