"use client";

import { useRef, useState } from "react";

import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { Sheet } from "@/shared/ui/Sheet";

/*
 * TEMPORARY gallery demo for Sheet V1 (contract docs/phases/phase-03-sheet-contract.md).
 * Dev-only; part of /dev/components. Copy: More Options `2268:1890`, Upload `2268:1674`,
 * Delete Confirmation `2268:1824` (Figma). The options sheet's "Delete" row opens the delete
 * dialog (Sheet → Dialog, D-SH6). Rows are plain Buttons (menu rows are not part of Sheet V1);
 * the long sheet's rows are developer filler for the overflow check (D-SH4).
 */

const COPY = {
  ar: {
    optionsTitle: "خيارات المحاضرة",
    open: "فتح المحاضرة",
    rename: "إعادة تسمية",
    delete: "حذف",
    uploadTitle: "أضف محاضرتك الجديدة",
    uploadText: "ارفع محاضرتك، وسيب مُنصت يساعدك تحولها لمحتوى أسهل في الفهم والمراجعة.",
    start: "ابدأ المعالجة",
    cancel: "إلغاء",
    close: "إغلاق",
    deleteTitle: "حذف المحاضرة؟",
    deleteText: "هل أنت متأكد إنك عايز تحذف المحاضرة دي؟",
  },
  en: {
    optionsTitle: "Lecture options",
    open: "Open lecture",
    rename: "Rename",
    delete: "Delete",
    uploadTitle: "Add your new lecture",
    uploadText: "Upload your lecture and let Munsit turn it into easier study material.",
    start: "Start processing",
    cancel: "Cancel",
    close: "Close",
    deleteTitle: "Delete the lecture?",
    deleteText: "Are you sure you want to delete this lecture?",
  },
} as const;

const LONG_ROWS = Array.from({ length: 30 }, (_, i) => i + 1);

type Which = "options" | "upload" | "delete" | null;

export function SheetDemo({ locale }: { locale: "ar" | "en" }) {
  const copy = COPY[locale];
  const [which, setWhich] = useState<Which>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => setWhich(null);
  const onOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <div className="flex flex-wrap gap-md">
      <Button data-testid="sheet-open-options" onClick={() => setWhich("options")}>
        Title only · options → dialog
      </Button>
      <Button
        data-testid="sheet-open-upload"
        variant="secondary"
        onClick={() => setWhich("upload")}
      >
        Description · actions · long body
      </Button>

      <Sheet
        open={which === "options"}
        onOpenChange={onOpenChange}
        title={copy.optionsTitle}
        closeLabel={copy.close}
      >
        <div className="grid gap-xs">
          <Button variant="secondary" onClick={close}>
            {copy.open}
          </Button>
          <Button variant="secondary" onClick={close}>
            {copy.rename}
          </Button>
          <Button
            data-testid="sheet-options-delete"
            variant="secondary"
            onClick={() => setWhich("delete")}
          >
            {copy.delete}
          </Button>
        </div>
      </Sheet>

      <Sheet
        open={which === "upload"}
        onOpenChange={onOpenChange}
        title={copy.uploadTitle}
        description={copy.uploadText}
        closeLabel={copy.close}
        actions={
          <>
            <Button className="flex-1" onClick={close}>
              {copy.start}
            </Button>
            <Button variant="secondary" onClick={close}>
              {copy.cancel}
            </Button>
          </>
        }
      >
        <ul data-testid="sheet-long-body" className="grid gap-xs" lang="en">
          {LONG_ROWS.map((n) => (
            <li key={n} className="text-dashboard-body text-text-secondary">
              Row {n}
            </li>
          ))}
        </ul>
      </Sheet>

      <Dialog
        open={which === "delete"}
        onOpenChange={onOpenChange}
        role="alertdialog"
        width={420}
        icon="alert"
        tone="danger"
        title={copy.deleteTitle}
        description={copy.deleteText}
        initialFocusRef={cancelRef}
        actions={
          <>
            <Button onClick={close}>{copy.delete}</Button>
            <Button
              ref={cancelRef}
              data-testid="sheet-delete-cancel"
              variant="secondary"
              onClick={close}
            >
              {copy.cancel}
            </Button>
          </>
        }
      />
    </div>
  );
}
