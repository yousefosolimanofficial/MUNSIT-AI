"use client";

import { useState } from "react";

import { MoreSheet } from "@/shared/layout/MoreSheet";
import type { ShellLabels } from "@/shared/layout/shell-model";
import { Button } from "@/shared/ui/Button";

/*
 * Temporary /dev/components sample of the mobile More sheet (Phase 05). In the product the sheet
 * is opened by the bottom navigation's More control (`BottomNav` + `MobileNavItem`, integrated
 * later); this gallery button only exercises the sheet itself and is not a navigation control.
 */

export function MoreSheetDemo({ labels }: { labels: ShellLabels }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        data-testid="more-sheet-open"
        variant="secondary"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {labels.more.title}
      </Button>
      <MoreSheet open={open} onOpenChange={setOpen} labels={labels} />
    </>
  );
}
