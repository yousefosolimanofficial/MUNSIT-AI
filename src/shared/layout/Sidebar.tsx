"use client";

import { useActiveDestination } from "@/shared/navigation/use-active-destination";
import { Logo } from "@/shared/ui/Logo";

import type { ShellLabels } from "./shell-model";
import { SidebarItem } from "./SidebarItem";
import { UpgradeCard } from "./UpgradeCard";

/*
 * MUNSIT AI — Desktop Sidebar (Phase 05). Figma: Desktop `2211:74` → `Sidebar` `2211:81`;
 * the Tablet drawer `2242:1275` is the same panel ("the expanded Sidebar").
 *
 * - `SidebarPanel` is the content (logo, divider, navigation, spacer, upgrade card), shared by
 *   the Sidebar and the drawer, fed only by the registry through `ShellLabels`.
 * - Active state comes only from `useActiveDestination()` (Phase 04): exactly one item is
 *   current on a destination route, none on Settings (D-R6).
 * - `Sidebar` is the Desktop placement (`xl:`, ADR-004): sticky at full viewport height with
 *   internal vertical scrolling (D-S2), on the inline start (right in RTL), border on the
 *   inline end.
 */

export interface SidebarPanelProps {
  labels: ShellLabels;
  /** Called when a destination or the upgrade link is activated (the drawer closes). */
  onNavigate?: () => void;
  /** Preload the logo: only the Desktop Sidebar, where it is above the fold on first paint. */
  preloadLogo?: boolean;
}

/** Padding 24 / 16, gap 20 (Space LG), children centred (Figma). */
const PANEL = "flex min-h-full flex-col items-center gap-lg px-md py-[24px]";

/** Logo box 168 × 55 with the Horizontal logo fitted inside (Figma FIT: 168 / 3.85 ≈ 43 high). */
const LOGO_BOX = "flex h-[55px] w-[168px] shrink-0 items-center justify-center";

/** Divider: full width, 1px, Sky 10%. Decorative. */
const DIVIDER = "h-px w-full shrink-0 bg-accent-electric-sky/10";

export function SidebarPanel({ labels, onNavigate, preloadLogo = false }: SidebarPanelProps) {
  const { destination } = useActiveDestination();

  return (
    <div className={PANEL}>
      <span className={LOGO_BOX}>
        <Logo variant="horizontal" height={43} preload={preloadLogo} />
      </span>
      <div aria-hidden="true" className={DIVIDER} />
      <nav aria-label={labels.mainNavigation} className="w-full">
        <ul className="flex flex-col gap-[6px]">
          {labels.destinations.map((item) => (
            <li key={item.id}>
              <SidebarItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={item.id === destination}
                onClick={onNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>
      {/* Spacer: pins the upgrade card to the bottom; collapses to 0 on short viewports. */}
      <div aria-hidden="true" className="flex-1" />
      <UpgradeCard
        title={labels.upgrade.title}
        description={labels.upgrade.description}
        action={labels.upgrade.action}
        onNavigate={onNavigate}
      />
    </div>
  );
}

/**
 * 232 wide (local constant), Ink 88% fill, 1px inline-end border Sky 10%. Hidden below `xl:`.
 * `self-start` + `h-dvh` keep it sticky in the shell's flex row; it scrolls internally.
 */
const SIDEBAR = [
  "sticky top-0 hidden h-dvh w-[232px] shrink-0 self-start overflow-y-auto overscroll-contain xl:block",
  "border-e border-accent-electric-sky/10 bg-surface-ink/88",
].join(" ");

export function Sidebar({ labels }: { labels: ShellLabels }) {
  return (
    <div data-shell="sidebar" className={SIDEBAR}>
      <SidebarPanel labels={labels} preloadLogo />
    </div>
  );
}
