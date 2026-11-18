"use client";

import { useState } from "react";

import {
  ConfirmGuardDialog,
  type GuardCopy,
  type GuardKind,
} from "@/shared/patterns/ConfirmGuardDialog";
import { Button } from "@/shared/ui/Button";

/*
 * TEMPORARY gallery demo for the Phase 06 guard dialog (D-U1) and the danger Button (D-U2).
 * Dev-only; part of /dev/components. Opening a dialog here never navigates: the real interception
 * is exercised by the dev-only fixture /dev/fixtures/navigation-guard inside the app shell.
 */

export function GuardDialogDemo({ copy }: { copy: Record<GuardKind, GuardCopy> }) {
  const [kind, setKind] = useState<GuardKind>("unsaved");
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("—");
  const show = (next: GuardKind) => {
    setKind(next);
    setOpen(true);
  };
  const close = (result: string) => {
    setLast(result);
    setOpen(false);
  };

  return (
    <div className="grid justify-items-start gap-md">
      <div className="flex flex-wrap gap-sm">
        <Button
          data-testid="guard-demo-unsaved"
          variant="secondary"
          onClick={() => show("unsaved")}
        >
          {copy.unsaved.title}
        </Button>
        <Button
          data-testid="guard-demo-recording"
          variant="secondary"
          onClick={() => show("recording")}
        >
          {copy.recording.title}
        </Button>
        <Button data-testid="guard-demo-danger" variant="danger">
          {copy.recording.leave}
        </Button>
        <Button data-testid="guard-demo-danger-disabled" variant="danger" disabled>
          {copy.unsaved.leave}
        </Button>
      </div>
      <p data-testid="guard-demo-result" lang="en">
        Last result: {last}
      </p>
      <ConfirmGuardDialog
        open={open}
        kind={kind}
        copy={copy[kind]}
        onStay={() => close("stay")}
        onLeave={() => close("leave")}
      />
    </div>
  );
}
