import type { ReactNode } from "react";

import { SkipLink } from "@/shared/a11y/SkipLink";

import { MAIN_CONTENT_ID, type ShellLabels } from "./shell-model";
import { Sidebar } from "./Sidebar";
import { TabletRail } from "./TabletRail";

/*
 * MUNSIT AI — app shell layout (Phase 05, first increment). Plan §7–§9, ADR-004.
 *
 * - Skip link first, then the navigation on the inline start (right in RTL), then the one
 *   `<main id="main-content">` that every `(app)` route renders into. `(focus)` routes never use
 *   this layout.
 * - Breakpoints (ADR-004): Mobile < 45rem (no navigation in this increment; the Top Bar and
 *   bottom navigation follow), Rail `rail:` 45rem – < 80rem, Sidebar `xl:` ≥ 80rem.
 * - The navigation is sticky at full viewport height and scrolls internally; the document
 *   scrolls the main content independently.
 * - Page padding from the existing page-padding variables (20 mobile, 24 tablet and desktop).
 * - Server Component; the Sidebar and Rail are the client parts.
 */

export interface AppShellViewProps {
  labels: ShellLabels;
  children: ReactNode;
}

const MAIN = [
  "min-w-0 flex-1 outline-none",
  "p-[var(--page-padding-mobile)] rail:p-[var(--page-padding-tablet)] xl:p-[var(--page-padding-desktop)]",
].join(" ");

export function AppShellView({ labels, children }: AppShellViewProps) {
  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID} label={labels.skipToContent} />
      <div data-shell="app" className="flex min-h-dvh">
        <Sidebar labels={labels} />
        <TabletRail labels={labels} />
        {/* tabIndex −1: the skip link can move focus here; never a Tab stop itself. */}
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className={MAIN}>
          {children}
        </main>
      </div>
    </>
  );
}
