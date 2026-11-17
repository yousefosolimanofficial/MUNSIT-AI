"use client";

import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/i18n/routes";
import { useGuardedRouter, useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import type { GuardKind } from "@/shared/patterns/ConfirmGuardDialog";
import { Button } from "@/shared/ui/Button";

/** Dev-only harness for the navigation guard (D-U9). No product copy, no debugging data. */
export interface GuardHarnessProps {
  labels: {
    guardOn: string;
    guardOff: string;
    kindUnsaved: string;
    kindRecording: string;
    inPageLink: string;
    programmatic: string;
    status: string;
  };
}

export function GuardHarness({ labels }: GuardHarnessProps) {
  const [on, setOn] = useState(false);
  const [kind, setKind] = useState<GuardKind>("unsaved");
  const router = useGuardedRouter();
  useNavigationGuard({ when: on, kind });

  return (
    <div className="grid justify-items-start gap-md">
      <p data-testid="guard-status" data-guard={on ? "on" : "off"} data-kind={kind}>
        {labels.status}: {on ? labels.guardOn : labels.guardOff}
      </p>
      <div className="flex flex-wrap gap-sm">
        <Button data-testid="guard-toggle" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          {on ? labels.guardOff : labels.guardOn}
        </Button>
        <Button
          data-testid="guard-kind"
          variant="secondary"
          onClick={() => setKind((k) => (k === "unsaved" ? "recording" : "unsaved"))}
        >
          {kind === "unsaved" ? labels.kindRecording : labels.kindUnsaved}
        </Button>
      </div>
      <Link data-testid="guard-in-page-link" href={ROUTES.lectures} className="underline">
        {labels.inPageLink}
      </Link>
      <Button
        data-testid="guard-programmatic"
        variant="secondary"
        onClick={() => router.push(ROUTES.summaries)}
      >
        {labels.programmatic}
      </Button>
    </div>
  );
}
