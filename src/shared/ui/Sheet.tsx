"use client";

import { useId, type ReactNode, type RefObject } from "react";

import { Icon } from "./Icon";
import { useModalDialog } from "./internal/useModalDialog";
import { useScrollableFocus } from "./internal/useScrollableFocus";

/*
 * MUNSIT AI — Sheet (Phase 03, Sheet V1). Contract: docs/phases/phase-03-sheet-contract.md.
 * Figma: no shared component; one bottom-sheet shell shared by the Mobile sheets (More Menu
 * `2236:972`, Upload `2268:1823`, Filter `2268:1863`, Options `2268:1890`, Folders …).
 *
 * - Native `<dialog>` + `showModal()`, lifecycle shared with Dialog (`internal/useModalDialog`,
 *   D-SH6): controlled `open`, Esc / scrim / close button → `onOpenChange(false)`, exit before
 *   `close()`, shared scroll lock and focus stack.
 * - Bottom-anchored, full width, no breakpoint logic (D-SH4): the page renders Sheet on Mobile.
 * - Always has a visible close button (normalization N-2): dismissal never depends on Esc.
 * - Motion (D-SH5): slides up its own height (`translate`), slow in / base out, `ease-standard`.
 *   Distance and starting opacity both use `--motion-distance`: full motion = slide at opacity 1;
 *   reduced motion (0) = no movement, opacity fade.
 *
 * Tailwind reads class names from source text, so every class below is written in full.
 */

export interface SheetProps {
  /** Controlled open state. */
  open: boolean;
  /** Called with `false` on Esc, scrim click and the close button. */
  onOpenChange: (open: boolean) => void;
  /** Visible title (`Dashboard/Title M`); also the accessible name. */
  title: ReactNode;
  /** Optional description (`Dashboard/Body`, Text / Secondary); `aria-describedby`. */
  description?: ReactNode;
  /** Accessible name of the close button (required: every sheet has one, N-2). */
  closeLabel: string;
  /** Element focused on open; default: the first focusable element (the close button). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Actions row (existing `Button`s); children decide their widths. */
  actions?: ReactNode;
  /** Body: menu rows, filters, forms. Scrolls when the sheet reaches its maximum height. */
  children?: ReactNode;
}

/** Focus ring, D-B2 (same as Button). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky";

const SHEET_CLASSES = [
  // UA reset and placement: bottom of the viewport, full width (§3).
  "inset-x-0 top-auto bottom-0 m-0 max-h-none w-full max-w-none overflow-hidden p-0",
  // Shell (D-SH1): Obsidian 98%, Sky 18% border, radius 28 on the top corners, shadow 24/64/55%.
  "rounded-t-[28px] border border-accent-electric-sky/18 bg-surface-obsidian/98 text-text-primary",
  "shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
  // Motion (D-SH5). Under reduced motion only opacity transitions (no movement at all).
  "[translate:0_0%] transition-[translate,opacity] duration-slow ease-standard motion-reduce:transition-opacity",
  "starting:open:[translate:0_calc(100%_*_var(--motion-distance))] starting:open:[opacity:var(--motion-distance)]",
  "data-[state=closing]:pointer-events-none data-[state=closing]:duration-base",
  "data-[state=closing]:[translate:0_calc(100%_*_var(--motion-distance))] data-[state=closing]:[opacity:var(--motion-distance)]",
  // Scrim (D-SH1: 66%, as Dialog) with the same timing.
  "backdrop:bg-surface-void-black/66 backdrop:transition-opacity backdrop:duration-slow backdrop:ease-standard",
  "starting:open:backdrop:opacity-0",
  "data-[state=closing]:backdrop:opacity-0 data-[state=closing]:backdrop:duration-base",
].join(" ");

/**
 * Padding 12 / 20 / 28 (+ bottom safe area), gap 16 (D-SH1, D-SH4). Height: the outer box is
 * capped at viewport − 64; the wrapper sits inside the 1px top and bottom borders, hence − 66.
 */
const WRAPPER_CLASSES =
  "flex max-h-[calc(100dvh_-_66px)] flex-col gap-md px-lg pt-sm pb-[calc(28px_+_env(safe-area-inset-bottom))] text-start";

/** Grabber 40 × 4, radius 2, White 20% (D-SH3); decorative (D-SH2). */
const GRABBER_ROW_CLASSES = "flex shrink-0 justify-center";
const GRABBER_CLASSES = "block h-[4px] w-[40px] rounded-[2px] bg-text-primary/20";

const TITLE_CLASSES = "text-dashboard-title-m text-text-primary";
const DESCRIPTION_CLASSES = "text-dashboard-body text-text-secondary";

/** More Menu Sheet close button (D-SH3): 40, radius 12, Sky 8% fill, Sky 16% border, `x` 18. */
const CLOSE_CLASSES = [
  "flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-md",
  "border border-accent-electric-sky/16 bg-accent-electric-sky/8 text-text-secondary",
  FOCUS_RING,
].join(" ");

/** Focusable only while it overflows (useScrollableFocus); ring inset so overflow never clips it. */
const BODY_CLASSES = [
  "min-h-0 flex-1 overflow-y-auto overscroll-contain",
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky",
].join(" ");
const ACTIONS_CLASSES = "flex shrink-0 gap-[12px]";

/** Full motion ends on `translate`, reduced motion on `opacity` (§6). */
const EXIT_PROPERTIES = ["translate", "opacity"] as const;

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  initialFocusRef,
  actions,
  children,
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { present, requestClose, dialogProps } = useModalDialog({
    open,
    onOpenChange,
    initialFocusRef,
    exitProperties: EXIT_PROPERTIES,
  });
  const { ref: bodyRef, scrollable: bodyScrollable } = useScrollableFocus<HTMLDivElement>(
    present && children !== undefined,
  );

  return (
    <dialog
      {...dialogProps}
      aria-modal="true"
      aria-labelledby={present ? titleId : undefined}
      aria-describedby={present && description !== undefined ? descriptionId : undefined}
      className={SHEET_CLASSES}
    >
      {present ? (
        <div className={WRAPPER_CLASSES}>
          <div className={GRABBER_ROW_CLASSES} aria-hidden="true">
            <span className={GRABBER_CLASSES} />
          </div>
          {/* Header: title block at inline-start, close button at inline-end. */}
          <div
            className={`flex shrink-0 gap-[12px] ${description === undefined ? "items-center" : "items-start"}`}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
              <h2 id={titleId} className={TITLE_CLASSES}>
                {title}
              </h2>
              {description === undefined ? null : (
                <p id={descriptionId} className={DESCRIPTION_CLASSES}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className={CLOSE_CLASSES}
              aria-label={closeLabel}
              onClick={requestClose}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          {children === undefined ? null : (
            <div
              ref={bodyRef}
              className={BODY_CLASSES}
              {...(bodyScrollable
                ? { tabIndex: 0, role: "region", "aria-labelledby": titleId }
                : {})}
            >
              {children}
            </div>
          )}
          {actions === undefined ? null : <div className={ACTIONS_CLASSES}>{actions}</div>}
        </div>
      ) : null}
    </dialog>
  );
}
