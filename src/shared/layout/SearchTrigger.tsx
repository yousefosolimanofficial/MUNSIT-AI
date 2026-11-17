"use client";

import { Icon } from "@/shared/ui/Icon";
import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";
import { Popover } from "@/shared/ui/Popover";

/*
 * MUNSIT AI — shell search trigger (Phase 05, D-S4). **No text field, no search backend.**
 *
 * - `field` (Desktop and Tablet Top Bar): a `<button>` styled as the Figma `Search Input`
 *   (`2211:201` / `2224:418`): 44 high, radius 12, padding 0 / 16, gap 12, White 4% fill,
 *   1px Sky 12%, `search` 18 at the inline start, placeholder text Cairo Regular 14 Secondary.
 *   It grows up to 440 (Desktop Figma) and shrinks with the Top Bar (Tablet 353 at 768).
 * - `icon` (Mobile Top Bar): the O-8 `NavigationIconButton` `lg` (44, icon 18), Figma
 *   `Search Button` `2238:925`.
 * - Both open the Phase 03 Popover with the approved "coming soon" message. The `icon` button is
 *   named "البحث". The `field` name is "البحث: " + its visible text (a visually hidden prefix),
 *   so the name contains the visible label (WCAG 2.5.3).
 */

export interface SearchTriggerProps {
  variant: "field" | "icon";
  labels: { search: string; searchPlaceholder: string; searchSoon: string };
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const FIELD = [
  "flex h-[44px] w-full min-w-0 cursor-pointer items-center gap-sm rounded-md border px-md text-start",
  "border-accent-electric-sky/12 bg-text-primary/4 text-text-secondary",
  FOCUS_RING,
].join(" ");

export function SearchTrigger({ variant, labels }: SearchTriggerProps) {
  return (
    <Popover
      label={labels.search}
      trigger={(props) =>
        variant === "icon" ? (
          <NavigationIconButton
            ref={props.ref}
            icon="search"
            size="lg"
            label={labels.search}
            aria-haspopup={props["aria-haspopup"]}
            aria-expanded={props["aria-expanded"]}
            aria-controls={props["aria-controls"]}
            onClick={props.onClick}
          />
        ) : (
          <button
            ref={props.ref}
            type="button"
            aria-haspopup={props["aria-haspopup"]}
            aria-expanded={props["aria-expanded"]}
            aria-controls={props["aria-controls"]}
            onClick={props.onClick}
            className={FIELD}
          >
            <Icon name="search" size={18} className="shrink-0" />
            {/* Name = approved label + the visible text (WCAG 2.5.3 Label in Name). */}
            <span className="sr-only">{`${labels.search}: `}</span>
            <span className="min-w-0 flex-1 truncate text-dashboard-body">
              {labels.searchPlaceholder}
            </span>
          </button>
        )
      }
    >
      <p className="text-dashboard-body text-text-secondary">{labels.searchSoon}</p>
    </Popover>
  );
}
