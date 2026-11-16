import type { MouseEventHandler } from "react";

import type { IconName } from "@/design-system/icons/manifest";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/shared/ui/Icon";

import type { DestinationPath } from "./shell-model";

/*
 * MUNSIT AI — Sidebar Item (Phase 05). Figma: component set `Sidebar Item` `2210:118`
 * (State = Default | Hover | Pressed | Active), used by the Desktop Sidebar `2211:81` and the
 * Tablet drawer `2242:1275`.
 *
 * - Always a locale-aware next-intl `Link` to a registry destination. Active = the current
 *   destination: Active visual + `aria-current="page"` (never colour alone: the 3 × 22 accent bar
 *   and the SemiBold label pair with it).
 * - Hover only on fine pointers and not while pressed (M-1 rule); Pressed = `:active`.
 *   The Active item has no hover or pressed visual (none is designed).
 * - Icon on the inline start, label after it; the accent bar sits on the inline-end edge
 *   (Figma x = 0 in RTL), so the whole item mirrors in LTR. Colour transitions only.
 * - Server-safe (no "use client"); the parent decides `active`.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export interface SidebarItemProps {
  icon: IconName;
  /** Visible label and accessible name. */
  label: string;
  href: DestinationPath;
  active: boolean;
  /** Called on activation (the drawer closes itself on a destination change). */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

/**
 * 199 (fills the 232 Sidebar: 16 + 199 + 16 + 1 border) × 44, radius 12, padding 0 / 14,
 * gap 12 (Space SM). The 1px border is transparent until Active, so all states keep 44.
 * `min-h` instead of a fixed height: a label never clips under larger text settings.
 */
const BASE = [
  "relative flex min-h-[44px] w-full items-center gap-sm rounded-md border px-[14px]",
  "transition-colors duration-base ease-standard",
  FOCUS_RING,
].join(" ");

/** Default: no fill, Text/Secondary, Cairo Medium 14/22. Hover Sky 7% + white label; Pressed Sky 14%. */
const DEFAULT = [
  "border-transparent text-text-secondary text-dashboard-body-medium",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:bg-accent-electric-sky/7",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:not-active:text-text-primary",
  "active:bg-accent-electric-sky/14 active:text-text-primary active:duration-fast",
].join(" ");

/** Active: Sky 12% fill, 1px Sky 22% border, white Cairo SemiBold 14/20. */
const ACTIVE =
  "border-accent-electric-sky/22 bg-accent-electric-sky/12 text-text-primary text-dashboard-button";

/** Icon 20: Text/Secondary in every state except Active (Electric Sky), per Figma. */
const ICON_DEFAULT = "shrink-0 text-text-secondary";
const ICON_ACTIVE = "shrink-0 text-accent-electric-sky";

/**
 * Accent bar 3 × 22, radius 2, Electric Sky, vertically centred (Figma y = 11 of 44). Positioned
 * over the item's own inline-end border (−1px), as in Figma.
 */
const ACCENT =
  "pointer-events-none absolute -end-px top-1/2 h-[22px] w-[3px] -translate-y-1/2 rounded-[2px] bg-accent-electric-sky";

export function SidebarItem({ icon, label, href, active, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`${BASE} ${active ? ACTIVE : `${DEFAULT} cursor-pointer`}`}
    >
      <Icon name={icon} size={20} className={active ? ICON_ACTIVE : ICON_DEFAULT} />
      <span className="min-w-0 flex-1">{label}</span>
      {active ? <span aria-hidden="true" data-accent="" className={ACCENT} /> : null}
    </Link>
  );
}
