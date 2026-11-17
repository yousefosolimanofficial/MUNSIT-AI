import { LanguageSwitch } from "./LanguageSwitch";
import { NotificationsTrigger } from "./NotificationsTrigger";
import { SearchTrigger } from "./SearchTrigger";
import type { TopBarLabels } from "./shell-model";
import { ThemeMenu } from "./ThemeMenu";
import { UserMenu } from "./UserMenu";

/*
 * MUNSIT AI — Desktop and Tablet Top Bar (Phase 05). Figma: Desktop `Top Bar` `2211:170`
 * (1160 × 56), Tablet `2224:399` (648 × 56).
 *
 * - Shown from `rail:` (ADR-004). It scrolls with the page (Figma: the first child of Main).
 * - Inline start: the search trigger, growing up to 440 (Desktop) and taking the remaining width
 *   on Tablet (Figma 353 at 768), so the bar always fits one row.
 * - Inline end (`Controls`, gap 10, Figma order from the start side): notifications, theme,
 *   language switch, divider (1 × 28, Sky 15%), user menu (compact trigger, D-S6).
 * - Server-safe: the controls are the client parts.
 */

/** No gap: Figma space-between with the search taking the rest (Tablet 353 + 295 = 648). */
const BAR = "hidden h-[56px] shrink-0 items-center justify-between rail:flex";
const CONTROLS = "flex shrink-0 items-center gap-[10px]";
const DIVIDER = "h-[28px] w-px shrink-0 bg-accent-electric-sky/15";

export function TopBar({ labels }: { labels: TopBarLabels }) {
  return (
    <header data-shell="top-bar" className={BAR}>
      <div className="flex min-w-0 max-w-[440px] flex-1">
        <SearchTrigger variant="field" labels={labels} />
      </div>
      <div className={CONTROLS}>
        <NotificationsTrigger size="md" labels={labels} />
        <ThemeMenu labels={labels} />
        <LanguageSwitch labels={labels} />
        <div aria-hidden="true" className={DIVIDER} />
        <UserMenu labels={labels} />
      </div>
    </header>
  );
}
