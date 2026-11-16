"use client";

import { useEffect, useId, useState } from "react";

import { useActiveDestination } from "@/shared/navigation/use-active-destination";
import { Logo } from "@/shared/ui/Logo";
import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";

import { RAIL_RANGE_QUERY, UPGRADE_HREF, type ShellLabels } from "./shell-model";
import { TabletDrawer } from "./TabletDrawer";

/*
 * MUNSIT AI — Tablet Rail (Phase 05). Figma: Tablet `2224:372` → `Sidebar` `2224:379` (72).
 *
 * - Shown from `rail:` (45rem) up to `xl:` (80rem) (ADR-004); sticky at full viewport height
 *   with internal vertical scrolling, on the inline start, border on the inline end.
 * - Content (Figma order, gap 10): Symbol logo (40 box), divider (White 8%), menu button, the
 *   eight destinations, spacer, upgrade (`crown` → the subscription settings route, D-S7). Every
 *   control is the O-8 `NavigationIconButton` (`md`, 40).
 * - Active state only from `useActiveDestination()`: the current destination is the Active
 *   link with `aria-current="page"`; none on Settings (D-R6).
 * - The menu button opens the drawer (`aria-haspopup="dialog"`, `aria-expanded`,
 *   `aria-controls`). It keeps the Default visual while expanded (O-8 D-NIB4).
 * - The drawer closes when the viewport leaves the Rail range, so it never stays open over
 *   the Sidebar or the mobile shell.
 */

/**
 * 72 wide (local constant), Ink 88%, 1px inline-end border Sky 10%. Padding 20 / 16 as Figma,
 * whose items sit 1 + 16 from the bordered edge and 15 from the other: CSS borders take layout
 * space, so the inline start is 15 and the 40 controls stay centred on the same pixels.
 */
const RAIL = [
  "sticky top-0 hidden h-dvh w-[72px] shrink-0 self-start overflow-y-auto overscroll-contain rail:block xl:hidden",
  "border-e border-accent-electric-sky/10 bg-surface-ink/88",
].join(" ");

const RAIL_CONTENT = "flex min-h-full flex-col items-center gap-[10px] ps-[15px] pe-md py-lg";

/** Symbol logo fitted into a 40 × 40 box (Figma `Logo Mark`, FIT). */
const LOGO_BOX = "flex size-[40px] shrink-0 items-center justify-center";

/** Divider 40 × 1, White 8%. Decorative. */
const DIVIDER = "h-px w-[40px] shrink-0 bg-text-primary/8";

export function TabletRail({ labels }: { labels: ShellLabels }) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const { destination } = useActiveDestination();

  useEffect(() => {
    const query = window.matchMedia(RAIL_RANGE_QUERY);
    const onChange = () => {
      if (!query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <div data-shell="rail" className={RAIL}>
        <div className={RAIL_CONTENT}>
          <span className={LOGO_BOX}>
            <Logo variant="symbol" height={25} />
          </span>
          <div aria-hidden="true" className={DIVIDER} />
          <NavigationIconButton
            icon="menu"
            label={labels.openMenu}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen(true)}
          />
          <nav aria-label={labels.mainNavigation}>
            <ul className="flex flex-col gap-[10px]">
              {labels.destinations.map((item) => (
                <li key={item.id} className="flex">
                  <NavigationIconButton
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={item.id === destination}
                  />
                </li>
              ))}
            </ul>
          </nav>
          {/* Spacer: pins the upgrade button to the bottom; collapses on short viewports. */}
          <div aria-hidden="true" className="flex-1" />
          <NavigationIconButton href={UPGRADE_HREF} icon="crown" label={labels.upgrade.title} />
        </div>
      </div>
      <TabletDrawer id={drawerId} open={open} onOpenChange={setOpen} labels={labels} />
    </>
  );
}
