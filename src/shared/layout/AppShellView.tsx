import type { ReactNode } from "react";

import { SkipLink } from "@/shared/a11y/SkipLink";

import { MobileTopBar } from "./MobileTopBar";
import { MAIN_CONTENT_ID, type ShellLabels } from "./shell-model";
import { Sidebar } from "./Sidebar";
import { TabletRail } from "./TabletRail";
import { TopBar } from "./TopBar";

/*
 * MUNSIT AI — app shell layout (Phase 05). Plan §7–§9, ADR-004.
 *
 * - Skip link first, then the navigation on the inline start (right in RTL), then the content
 *   column: the Top Bar (`header`) and the one `<main id="main-content">` that every `(app)`
 *   route renders into. `(focus)` routes never use this layout.
 * - Breakpoints (ADR-004): Mobile < 45rem (fixed Mobile Top Bar; the bottom navigation follows),
 *   Rail `rail:` 45rem – < 80rem, Sidebar `xl:` ≥ 80rem. The Desktop/Tablet Top Bar scrolls with
 *   the page (Figma: first child of Main, gap 24).
 * - The navigation is sticky at full viewport height and scrolls internally; the document
 *   scrolls the content column independently.
 * - Padding: the page-padding variables (20 mobile, 24 tablet and desktop). Mobile content starts
 *   88 below the top (Figma `Main` padding) plus the top safe-area inset, under the fixed bar.
 * - Server Component; the navigation and Top Bar controls are the client parts.
 */

export interface AppShellViewProps {
  labels: ShellLabels;
  children: ReactNode;
}

const COLUMN = [
  "flex min-w-0 flex-1 flex-col",
  "px-[var(--page-padding-mobile)] pb-[var(--page-padding-mobile)] pt-[calc(88px_+_env(safe-area-inset-top))]",
  "rail:gap-[24px] rail:p-[var(--page-padding-tablet)] xl:p-[var(--page-padding-desktop)]",
].join(" ");

const MAIN = "min-w-0 flex-1 outline-none";

export function AppShellView({ labels, children }: AppShellViewProps) {
  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID} label={labels.skipToContent} />
      <div data-shell="app" className="flex min-h-dvh">
        <Sidebar labels={labels} />
        <TabletRail labels={labels} />
        <div data-shell="content" className={COLUMN}>
          <MobileTopBar labels={labels.topBar} />
          <TopBar labels={labels.topBar} />
          {/* tabIndex −1: the skip link can move focus here; never a Tab stop itself. */}
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className={MAIN}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
