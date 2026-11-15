"use client";

import { useRef, useState } from "react";

import { Button } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";

/*
 * TEMPORARY gallery demo for Dialog V1 (contract docs/phases/phase-03-dialog-contract.md).
 * Dev-only; part of /dev/components. Copy: Notes delete `2432:4308` and Logout `2462:1490`
 * (Figma); the close label is supplied here, as a consumer would (D-DL5). The long dialog's rows
 * are developer filler for the overflow check (D-DL2).
 */

const COPY = {
  ar: {
    deleteTitle: "حذف الملاحظة؟",
    deleteText: "هل أنت متأكد إنك عايز تحذف الملاحظة دي؟",
    deleteAction: "حذف الملاحظة",
    logoutTitle: "تسجيل الخروج؟",
    logoutText: "هيتم إنهاء جلستك على الجهاز ده فقط. بياناتك ومحتواك فاضلين زي ما هما.",
    logoutAction: "تسجيل الخروج",
    cancel: "إلغاء",
    close: "إغلاق",
  },
  en: {
    deleteTitle: "Delete the note?",
    deleteText: "Are you sure you want to delete this note?",
    deleteAction: "Delete note",
    logoutTitle: "Log out?",
    logoutText:
      "This ends your session on this device only. Your data and content stay as they are.",
    logoutAction: "Log out",
    cancel: "Cancel",
    close: "Close",
  },
} as const;

const LONG_ROWS = Array.from({ length: 30 }, (_, i) => i + 1);

type Which = "alert" | "header" | "long" | null;

export function DialogDemo({ locale }: { locale: "ar" | "en" }) {
  const copy = COPY[locale];
  const [which, setWhich] = useState<Which>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => setWhich(null);
  const onOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <div className="flex flex-wrap gap-md">
      <Button data-testid="dialog-open-alert" onClick={() => setWhich("alert")}>
        Layout A · alertdialog
      </Button>
      <Button
        data-testid="dialog-open-header"
        variant="secondary"
        onClick={() => setWhich("header")}
      >
        Layout B · close button
      </Button>
      <Button data-testid="dialog-open-long" variant="secondary" onClick={() => setWhich("long")}>
        Long body · 640
      </Button>

      <Dialog
        open={which === "alert"}
        onOpenChange={onOpenChange}
        role="alertdialog"
        width={440}
        icon="alert"
        tone="danger"
        title={copy.deleteTitle}
        description={copy.deleteText}
        initialFocusRef={cancelRef}
        actions={
          <>
            <Button data-testid="dialog-alert-confirm" onClick={close}>
              {copy.deleteAction}
            </Button>
            <Button
              ref={cancelRef}
              data-testid="dialog-alert-cancel"
              variant="secondary"
              onClick={close}
            >
              {copy.cancel}
            </Button>
          </>
        }
      />

      <Dialog
        open={which === "header"}
        onOpenChange={onOpenChange}
        icon="logout"
        title={copy.logoutTitle}
        description={copy.logoutText}
        closeLabel={copy.close}
        actions={
          <>
            <Button onClick={close}>{copy.logoutAction}</Button>
            <Button variant="secondary" onClick={close}>
              {copy.cancel}
            </Button>
          </>
        }
      />

      <Dialog
        open={which === "long"}
        onOpenChange={onOpenChange}
        width={640}
        title={copy.logoutTitle}
        closeLabel={copy.close}
        actions={
          <Button variant="secondary" onClick={close}>
            {copy.cancel}
          </Button>
        }
      >
        <ul data-testid="dialog-long-body" className="grid gap-xs" lang="en">
          {LONG_ROWS.map((n) => (
            <li key={n} className="text-dashboard-body text-text-secondary">
              Row {n}
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
