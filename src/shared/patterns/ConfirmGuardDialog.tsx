"use client";

import { useRef } from "react";

import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";

/*
 * MUNSIT AI — guard confirmation dialog (Phase 06, D-U1). Built on the Phase 03 `Dialog`.
 *
 * Figma reference: Leave Recording Guard `2744:5118` (Tablet `2744:5135`, Mobile `2591:3192`);
 * annotation `2588:338`. Every guard follows it (Roadmap Phase 06, Handoff P2), including the
 * Notes Unsaved Changes Guard `2746:14333`, whose drawn action order is inverted.
 *
 * - `alertdialog`, danger tone (`alert` icon tile, Coral 12/30).
 * - Stay: Primary, focused when the dialog opens.
 * - Leave: the red-text `danger` Button (D-U2). Leaving is an explicit choice.
 * - Esc, the scrim and any other dismissal mean Stay: the current page is kept.
 * - No close button (none is drawn). Focus returns to the element focused before opening (the
 *   Phase 03 focus stack).
 * - Widths: 420 for the recording guard, 440 for the unsaved-changes guard (Figma).
 */

export type GuardKind = "unsaved" | "recording";

export interface GuardCopy {
  title: string;
  description: string;
  stay: string;
  leave: string;
}

export interface ConfirmGuardDialogProps {
  open: boolean;
  kind: GuardKind;
  copy: GuardCopy;
  /** Called for Stay, Esc and scrim. */
  onStay: () => void;
  /** Called for Leave only. */
  onLeave: () => void;
}

const WIDTH = { recording: 420, unsaved: 440 } as const satisfies Record<GuardKind, number>;

export function ConfirmGuardDialog({ open, kind, copy, onStay, onLeave }: ConfirmGuardDialogProps) {
  const stayRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onStay();
      }}
      role="alertdialog"
      tone="danger"
      icon="alert"
      width={WIDTH[kind]}
      title={copy.title}
      description={copy.description}
      initialFocusRef={stayRef}
      // DOM order = reading order: Stay first (inline start, right in RTL), as in Figma.
      actions={
        <>
          <Button ref={stayRef} data-guard-action="stay" onClick={onStay}>
            {copy.stay}
          </Button>
          <Button variant="danger" data-guard-action="leave" onClick={onLeave}>
            {copy.leave}
          </Button>
        </>
      }
    />
  );
}
