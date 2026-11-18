"use client";

import { useState } from "react";

import { ErrorCard } from "@/shared/patterns/ErrorCard";

/*
 * TEMPORARY gallery samples for ErrorCard (Phase 06, dev-only, /dev/components): the full card,
 * the section layout inside a card, and a section error without retry. Retry only counts
 * activations here (no feature behind it).
 */

export interface ErrorCardSamplesCopy {
  fullTitle: string;
  fullText: string;
  sectionTitle: string;
  sectionText: string;
  retry: string;
}

const HOST = "rounded-xl border border-accent-electric-sky/14 bg-surface-obsidian/88 p-md";

export function ErrorCardSamples({ copy }: { copy: ErrorCardSamplesCopy }) {
  const [count, setCount] = useState(0);
  const onRetry = () => setCount((c) => c + 1);
  return (
    <>
      <p data-testid="error-retry-count" lang="en">
        Retry activations: {count}
      </p>
      <div data-testid="error-full">
        <ErrorCard
          title={copy.fullTitle}
          description={copy.fullText}
          retryLabel={copy.retry}
          onRetry={onRetry}
          headingLevel={3}
        />
      </div>
      <div data-testid="error-section" className={HOST}>
        <ErrorCard
          layout="section"
          title={copy.sectionTitle}
          description={copy.sectionText}
          retryLabel={copy.retry}
          onRetry={onRetry}
        />
      </div>
      <div data-testid="error-no-retry" className={HOST}>
        <ErrorCard layout="section" title={copy.sectionTitle} />
      </div>
    </>
  );
}
