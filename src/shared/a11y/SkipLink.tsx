/*
 * MUNSIT AI — skip link (Phase 05, plan §11.10 and §12). The first focusable element of every
 * shell page: it moves focus to the main content, past the navigation.
 *
 * - Visually hidden until focused (`not-focus:sr-only`), then shown at the inline-start top
 *   corner, above the shell. A plain `<a href="#…">`: same-page fragment, no client navigation.
 * - The target must be focusable programmatically (`tabIndex={-1}` on `<main>`).
 * - Server Component. Colours are tokens; 44 high like the Phase 03 Button.
 */

export interface SkipLinkProps {
  /** Id of the element that receives focus (the shell's `<main>`). */
  targetId: string;
  /** Visible text and accessible name (approved copy). */
  label: string;
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const CLASSES = [
  "not-focus:sr-only fixed start-sm top-sm z-50",
  "inline-flex h-[44px] items-center rounded-md px-lg",
  "border border-accent-electric-sky/30 bg-surface-obsidian text-dashboard-button text-text-primary",
  FOCUS_RING,
].join(" ");

export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className={CLASSES}>
      {label}
    </a>
  );
}
