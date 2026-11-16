"use client";

import { useModalDialog } from "@/shared/ui/internal/useModalDialog";

import type { ShellLabels } from "./shell-model";
import { SidebarPanel } from "./Sidebar";

/*
 * MUNSIT AI — Tablet navigation drawer (Phase 05, D-S8). Figma: `Overlay / Tablet / Navigation
 * Expanded` `2242:1272`: the expanded Sidebar (232, same content) at the inline start over a
 * Void Black 66% scrim; no close button (prototype: scrim → close).
 *
 * - Not a second Sheet: the native modal `<dialog>` with the shared Phase 03 lifecycle
 *   (`useModalDialog`): focus trap, shared scroll lock, Esc and scrim close it, focus returns to
 *   the Rail menu button, and nested overlays keep Phase 03 behaviour (Esc closes the topmost).
 * - Closes on a destination change: any destination or the upgrade link closes it.
 * - Motion: slides in from the inline start (`--motion-dir`), `duration-slow` in and
 *   `duration-base` out, `ease-standard`; `--motion-distance` makes reduced motion opacity-only.
 */

export interface TabletDrawerProps {
  /** Referenced by the menu button's `aria-controls`. */
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: ShellLabels;
}

/*
 * Off-screen offset: −100% × `--motion-dir` (LTR −100%, RTL +100%) × `--motion-distance`
 * (0 under reduced motion). Tailwind reads class names from source text, so each is written in
 * full.
 */
const DRAWER_CLASSES = [
  // UA reset and placement: full height at the inline start.
  "inset-y-0 start-0 end-auto m-0 h-dvh max-h-none w-[232px] max-w-full overflow-hidden p-0",
  // Panel (Figma: as the Sidebar): Ink 88%, 1px inline-end border Sky 10%.
  "border-0 border-e border-accent-electric-sky/10 bg-surface-ink/88 text-text-primary",
  // Motion (D-S8). Under reduced motion only opacity transitions (no movement at all).
  "[translate:0_0] transition-[translate,opacity] duration-slow ease-standard motion-reduce:transition-opacity",
  "starting:open:[translate:calc(-100%_*_var(--motion-dir)_*_var(--motion-distance))_0] starting:open:[opacity:var(--motion-distance)]",
  "data-[state=closing]:pointer-events-none data-[state=closing]:duration-base",
  "data-[state=closing]:[translate:calc(-100%_*_var(--motion-dir)_*_var(--motion-distance))_0] data-[state=closing]:[opacity:var(--motion-distance)]",
  // Scrim: Void Black 66% (Figma), same timing as Dialog and Sheet.
  "backdrop:bg-surface-void-black/66 backdrop:transition-opacity backdrop:duration-slow backdrop:ease-standard",
  "starting:open:backdrop:opacity-0",
  "data-[state=closing]:backdrop:opacity-0 data-[state=closing]:backdrop:duration-base",
].join(" ");

/** Full motion ends on `translate`, reduced motion on `opacity` (as Sheet). */
const EXIT_PROPERTIES = ["translate", "opacity"] as const;

export function TabletDrawer({ id, open, onOpenChange, labels }: TabletDrawerProps) {
  const { present, requestClose, dialogProps } = useModalDialog({
    open,
    onOpenChange,
    exitProperties: EXIT_PROPERTIES,
  });

  return (
    <dialog
      {...dialogProps}
      id={id}
      aria-modal="true"
      aria-label={labels.drawerTitle}
      data-shell="drawer"
      className={DRAWER_CLASSES}
    >
      {present ? (
        <div className="h-full overflow-y-auto overscroll-contain">
          <SidebarPanel labels={labels} onNavigate={requestClose} />
        </div>
      ) : null}
    </dialog>
  );
}
