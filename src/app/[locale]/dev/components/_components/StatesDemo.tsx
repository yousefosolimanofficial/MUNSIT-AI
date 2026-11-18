"use client";

import { useState } from "react";

import { SectionBoundary, type SectionErrorCopy } from "@/shared/patterns/SectionBoundary";
import { Skeleton, SkeletonRegion, SkeletonText } from "@/shared/patterns/Skeleton";
import { Button } from "@/shared/ui/Button";

/*
 * TEMPORARY gallery demo for the Phase 06 section boundary (dev-only, /dev/components).
 * Section B renders a component that throws during render once "Break section B" is pressed; its
 * retry either fixes the cause or keeps failing (to show both outcomes). Sections A and C stay
 * healthy and interactive. Section D is driven by `status` (a failure outside render). No
 * product feature: the controls and copy are development fixtures.
 */

export interface StatesDemoCopy {
  section: SectionErrorCopy;
  loading: string;
  healthy: string;
}

/** Simulated network latency of a retry (dev fixture), so the pending state is observable. */
const RETRY_DELAY_MS = 400;
const wait = () => new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

const HOST =
  "min-h-[140px] rounded-xl border border-accent-electric-sky/14 bg-surface-obsidian/88 p-md";

function Fragile({ broken }: { broken: boolean }) {
  if (broken) throw new Error("MUNSIT dev states-demo: intentional section render error");
  return (
    <p data-testid="section-b-content" className="text-dashboard-body">
      B · OK
    </p>
  );
}

function Counter({ id, label }: { id: string; label: string }) {
  const [count, setCount] = useState(0);
  return (
    <Button
      variant="secondary"
      data-testid={`section-${id}-counter`}
      onClick={() => setCount((c) => c + 1)}
    >
      {label} {id.toUpperCase()} · {count}
    </Button>
  );
}

export function StatesDemo({ copy }: { copy: StatesDemoCopy }) {
  const [broken, setBroken] = useState(false);
  const [fixOnRetry, setFixOnRetry] = useState(true);
  const [retries, setRetries] = useState(0);
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");

  return (
    <div className="grid gap-md" lang="en">
      <div className="flex flex-wrap gap-sm">
        <Button data-testid="break-section-b" onClick={() => setBroken(true)}>
          Break section B
        </Button>
        <Button
          variant="secondary"
          data-testid="retry-mode"
          aria-pressed={fixOnRetry}
          onClick={() => setFixOnRetry((v) => !v)}
        >
          {fixOnRetry ? "Retry fixes the cause" : "Retry keeps failing"}
        </Button>
        <Button variant="secondary" data-testid="section-d-fail" onClick={() => setStatus("error")}>
          Fail section D (data)
        </Button>
        <Button
          variant="secondary"
          data-testid="section-d-load"
          onClick={() => setStatus("loading")}
        >
          Load section D
        </Button>
      </div>
      <p data-testid="retry-count">Retries: {retries}</p>

      <div className="grid gap-md md:grid-cols-3">
        <section data-testid="section-a" aria-label="Section A" className={HOST}>
          <SectionBoundary copy={copy.section}>
            <Counter id="a" label={copy.healthy} />
          </SectionBoundary>
        </section>
        <section data-testid="section-b" aria-label="Section B" className={HOST}>
          <SectionBoundary
            copy={copy.section}
            onRetry={async () => {
              setRetries((r) => r + 1);
              await wait();
              if (fixOnRetry) setBroken(false);
            }}
          >
            <Fragile broken={broken} />
          </SectionBoundary>
        </section>
        <section data-testid="section-c" aria-label="Section C" className={HOST}>
          <SectionBoundary copy={copy.section}>
            <Counter id="c" label={copy.healthy} />
          </SectionBoundary>
        </section>
      </div>

      <section data-testid="section-d" aria-label="Section D" className={HOST}>
        <SectionBoundary
          copy={copy.section}
          status={status}
          onRetry={async () => {
            setStatus("loading");
            await wait();
            setStatus("ready");
          }}
          loading={
            <SkeletonRegion label={copy.loading}>
              <Skeleton width={124} height={16} />
              <SkeletonText lines={2} />
            </SkeletonRegion>
          }
        >
          <p data-testid="section-d-content" className="text-dashboard-body">
            D · OK
          </p>
        </SectionBoundary>
      </section>
    </div>
  );
}
