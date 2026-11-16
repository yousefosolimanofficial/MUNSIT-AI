"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/Button";

/** Throws during render after the click, so the nearest error boundary catches it (D-R10). */
export function ErrorTrigger({ label }: { label: string }) {
  const [crash, setCrash] = useState(false);
  if (crash) throw new Error("MUNSIT dev error-test: intentional render error");
  return (
    <Button type="button" data-testid="trigger-error" onClick={() => setCrash(true)}>
      {label}
    </Button>
  );
}
