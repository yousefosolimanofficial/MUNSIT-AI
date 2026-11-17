"use client";

import { useEffect, useState } from "react";

import { MOBILE_BAR_DESTINATIONS, MORE_CONTROL } from "@/shared/navigation/nav-registry";
import { mobileBarIndicator } from "@/shared/navigation/resolve-active-destination";
import { useActiveDestination } from "@/shared/navigation/use-active-destination";

import { MobileNavItem } from "./MobileNavItem";
import { MoreSheet } from "./MoreSheet";
import { MOBILE_RANGE_QUERY, type ShellLabels } from "./shell-model";

/*
 * MUNSIT AI — mobile bottom navigation (Phase 05, plan §10). Figma: `Bottom Navigation`
 * `2238:1187` in Dashboard Mobile `2238:741`.
 *
 * - Mobile only (ADR-004: below `rail:`, 45rem); fixed to the bottom, above the content.
 * - Four `MobileNavItem`s (Mariam delivery v1, used unchanged): the three registry bar
 *   destinations in registry order, then More (`MORE_CONTROL`). In RTL the first sits on the right.
 * - Indicator from `mobileBarIndicator()` (D-R6): a bar destination is the Active link with
 *   `aria-current="page"`; a More-sheet destination gives More the Active look only (never
 *   `aria-current`); Settings and other routes without a destination mark nothing.
 * - More opens the existing `MoreSheet` (`aria-expanded` follows it; the Phase 03 Sheet restores
 *   focus to More). The sheet closes when the viewport leaves the mobile range.
 *
 * FIGMA bar: 390 × 84, Ink 94%, top border Sky 12% (1px, inside the 84), background blur 16,
 * padding 8 / 16 / 16 / 16, items `space-between` (no gap) at the top. The bottom padding adds
 * `env(safe-area-inset-bottom)` (ADR-004); the bar grows by the inset.
 *
 * 320 px (WCAG 1.4.10 reflow width): four 76 px items need 304 px, but 320 − 2 × 16 leaves 288.
 * The inline padding is therefore `min(16px, (100% − 304px) / 2)`, never below 0: exactly 16 from
 * 336 px up (every Figma width, 390 included), and shrinking continuously to 8 at 320. It is a
 * continuous value, not a breakpoint. The items never shrink (`shrink-0`), so labels are never
 * clipped and items never overlap.
 */

const BAR = [
  "fixed inset-x-0 bottom-0 z-40 rail:hidden",
  "h-[calc(84px_+_env(safe-area-inset-bottom))]",
  "border-t border-accent-electric-sky/12 bg-surface-ink/94 backdrop-blur-[16px]",
  "pt-[8px] pb-[calc(16px_+_env(safe-area-inset-bottom))]",
  "px-[max(0px,min(16px,calc((100%_-_304px)/2)))]",
].join(" ");

const LIST = "flex items-start justify-between";

const ITEM = "flex shrink-0";

export function BottomNav({ labels }: { labels: ShellLabels }) {
  const [open, setOpen] = useState(false);
  const { destination } = useActiveDestination();
  const indicator = mobileBarIndicator(destination);
  const items = labels.destinations.filter((item) =>
    MOBILE_BAR_DESTINATIONS.some((bar) => bar.id === item.id),
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_RANGE_QUERY);
    const onChange = () => {
      if (!query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <nav data-shell="bottom-nav" aria-label={labels.bottomNavigation} className={BAR}>
        <ul className={LIST}>
          {items.map((item) => (
            <li key={item.id} className={ITEM}>
              <MobileNavItem
                kind="destination"
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={indicator === item.id}
              />
            </li>
          ))}
          <li className={ITEM}>
            <MobileNavItem
              kind="more"
              icon={MORE_CONTROL.icon}
              label={labels.more.title}
              onOpen={() => setOpen(true)}
              expanded={open}
              containsActive={indicator === "more"}
            />
          </li>
        </ul>
      </nav>
      <MoreSheet open={open} onOpenChange={setOpen} labels={labels} />
    </>
  );
}
