"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useEffect, useRef, type ReactNode } from "react";

import { ErrorCard, type ErrorCardLayout } from "./ErrorCard";

/*
 * MUNSIT AI — SectionBoundary (Phase 06, Increment 2). One independently rendered section: its
 * loading state, its error state with retry, and an error boundary around its content, so one
 * failed section never breaks the page (Roadmap Phase 06; Handoff "partial error, per-section
 * retry").
 *
 * Built on Next.js 16 `catchError` (next/error), the supported component-level boundary:
 * `redirect()` / `notFound()` pass through, `retry()` re-fetches and re-renders the section in a
 * Transition, and the error clears on client navigation to another route.
 *
 * What it catches — and what it does not (React error-boundary semantics):
 * - Caught: errors thrown while rendering the section's children (including a rejected promise
 *   read with `use()` during render), and in their lifecycle methods.
 * - NOT caught: errors in event handlers, timers, or a `fetch` the component awaits outside
 *   render. Report those through `status="error"` (state the module owns), which shows the same
 *   ErrorCard. Nothing is caught for the whole page: unaffected sections keep rendering.
 * - Never silent: React still reports every caught error (development console; the root's
 *   `onCaughtError` in production), and `onError` gives the module the error once.
 *
 * Retry: `onRetry` (the module's re-fetch or state reset; may return a promise) runs first, then
 * the boundary re-renders its children. If they throw again, the ErrorCard returns. Duplicate
 * activations are ignored while a retry is pending (ErrorCard).
 */

export interface SectionErrorCopy {
  title: string;
  description?: string;
  retryLabel: string;
}

export type SectionStatus = "ready" | "loading" | "error";

interface FallbackProps {
  copy: SectionErrorCopy;
  layout?: ErrorCardLayout;
  headingLevel?: 2 | 3;
  onRetry?: () => void | Promise<unknown>;
  onError?: (error: unknown) => void;
}

function SectionFallback(
  { copy, layout = "section", headingLevel, onRetry, onError }: FallbackProps,
  { error, retry }: ErrorInfo,
) {
  return (
    <CaughtError
      error={error}
      copy={copy}
      layout={layout}
      headingLevel={headingLevel}
      onError={onError}
      onRetry={async () => {
        await onRetry?.();
        retry();
      }}
    />
  );
}

/** Reports the caught error to the module once, then shows the ErrorCard. */
function CaughtError({
  error,
  copy,
  layout,
  headingLevel,
  onError,
  onRetry,
}: Omit<FallbackProps, "onRetry"> & {
  error: unknown;
  onRetry: () => Promise<void>;
}) {
  const reported = useRef<unknown>(undefined);
  useEffect(() => {
    if (reported.current === error) return;
    reported.current = error;
    onError?.(error);
  }, [error, onError]);

  return (
    <ErrorCard
      layout={layout}
      title={copy.title}
      description={copy.description}
      headingLevel={headingLevel}
      retryLabel={copy.retryLabel}
      onRetry={onRetry}
    />
  );
}

const CatchSection = catchError(SectionFallback);

export interface SectionBoundaryProps extends FallbackProps {
  /**
   * Data state owned by the module. "loading" shows `loading`; "error" shows the ErrorCard (for
   * failures outside render, such as a rejected fetch); "ready" renders `children` inside the
   * error boundary. Default "ready".
   */
  status?: SectionStatus;
  /** The section's loading state, usually a `SkeletonRegion` shaped like the content. */
  loading?: ReactNode;
  children: ReactNode;
}

export function SectionBoundary({
  status = "ready",
  loading = null,
  children,
  ...fallback
}: SectionBoundaryProps) {
  if (status === "loading") return <>{loading}</>;
  if (status === "error") {
    const { copy, layout = "section", headingLevel, onRetry } = fallback;
    const common = { layout, title: copy.title, description: copy.description, headingLevel };
    // Without `onRetry` there is nothing to retry, so no button is shown.
    return onRetry ? (
      <ErrorCard {...common} retryLabel={copy.retryLabel} onRetry={onRetry} />
    ) : (
      <ErrorCard {...common} />
    );
  }
  return <CatchSection {...fallback}>{children}</CatchSection>;
}
