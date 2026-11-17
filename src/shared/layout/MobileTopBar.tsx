import { Logo } from "@/shared/ui/Logo";

import { NotificationsTrigger } from "./NotificationsTrigger";
import { SearchTrigger } from "./SearchTrigger";
import type { TopBarLabels } from "./shell-model";
import { UserMenu } from "./UserMenu";

/*
 * MUNSIT AI — Mobile Top Bar (Phase 05). Figma: `Top Bar / Mobile` `2238:923` (390 × 72).
 *
 * - Below `rail:` only (ADR-004). Fixed at the top; the content starts 88 below it (Figma
 *   `Main` padding top 88) plus the top safe-area inset (ADR-004, `viewportFit: "cover"`).
 * - 72 high (+ inset), Void Black 88%, bottom border Sky 10%, background blur 16; padding 20 on
 *   the inline start and 14 on the inline end.
 * - Inline start: the Horizontal logo (121 × 40 box, FIT). It shrinks first on narrow screens, so
 *   320 never overflows. Inline end (gap 6, Figma order from the start side): search (O-8 `lg`,
 *   44), notifications (O-8 `lg`, 44), user menu (compact trigger).
 * - No language switch and no theme control: the Figma mobile bar has neither (see the PR's
 *   known limitations).
 */

const BAR = [
  "fixed inset-x-0 top-0 z-40 flex h-[calc(72px_+_env(safe-area-inset-top))] items-center justify-between gap-[6px] rail:hidden",
  "border-b border-accent-electric-sky/10 bg-surface-void-black/88 backdrop-blur-[16px]",
  "ps-lg pe-[14px] pt-[env(safe-area-inset-top)]",
].join(" ");

/** Logo box 121 × 40, Horizontal logo fitted (121 / 3.85 ≈ 31 high); may shrink. */
const LOGO_BOX = "flex h-[40px] w-[121px] min-w-0 shrink items-center";

export function MobileTopBar({ labels }: { labels: TopBarLabels }) {
  return (
    <header data-shell="mobile-top-bar" className={BAR}>
      <span className={LOGO_BOX}>
        <Logo variant="horizontal" height={31} />
      </span>
      <div className="flex shrink-0 items-center gap-[6px]">
        <SearchTrigger variant="icon" labels={labels} />
        <NotificationsTrigger size="lg" labels={labels} />
        <UserMenu labels={labels} />
      </div>
    </header>
  );
}
