"use client";

import { useToast } from "@/shared/patterns/Toast";
import { Button } from "@/shared/ui/Button";

/*
 * TEMPORARY gallery demo for the Phase 06 toast system (dev-only, /dev/components). The buttons
 * show each variant through `useToast()`; the error carries the Figma retry action. No backend:
 * the retry only shows a success toast.
 */

export interface ToastDemoCopy {
  success: string;
  error: string;
  info: string;
  retry: string;
}

export function ToastDemo({ copy }: { copy: ToastDemoCopy }) {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-sm" lang="en">
      <Button
        data-testid="toast-success"
        variant="secondary"
        onClick={() => toast.show({ kind: "success", message: copy.success })}
      >
        Show success
      </Button>
      <Button
        data-testid="toast-error"
        variant="secondary"
        onClick={() =>
          toast.show({
            kind: "error",
            message: copy.error,
            action: {
              label: copy.retry,
              onAction: () => toast.show({ kind: "success", message: copy.success }),
            },
          })
        }
      >
        Show error
      </Button>
      <Button
        data-testid="toast-info"
        variant="secondary"
        onClick={() => toast.show({ kind: "info", message: copy.info })}
      >
        Show info
      </Button>
      <Button
        data-testid="toast-burst"
        variant="secondary"
        onClick={() => {
          toast.show({ kind: "error", message: copy.error });
          toast.show({ kind: "success", message: copy.success });
          toast.show({ kind: "info", message: copy.info });
          toast.show({ kind: "success", message: `${copy.success} (2)` });
        }}
      >
        Show four
      </Button>
    </div>
  );
}
