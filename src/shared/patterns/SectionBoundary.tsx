"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

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
 *
 * Focus after retry (scoped to this section, no global focus management): when retry is activated
 * from inside the section, the retry button disappears once the outcome is known, so focus moves
 * without scrolling to
 * - the recovered section's first heading (made programmatically focusable, `tabindex="-1"`), or
 *   the section wrapper when it has no heading;
 * - the new retry button when the failure persists;
 * and waits while the section is loading. If the user has already moved focus elsewhere, nothing
 * is moved. The watcher stops once it has decided, when focus moves to another element outside
 * the section, or when the section unmounts. It has no time limit: `retry()` waits for a router
 * refresh (a server round trip), and a slow network must not drop focus to the document when the
 * retry button finally unmounts.
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

/**
 * Restores a logical focus position after a retry started from inside `root` (see the header).
 * Returns `arm`, called when retry is activated; observes `root` only until the outcome is known.
 */
function useRetryFocus() {
  const root = useRef<HTMLDivElement>(null);
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), []);

  const arm = useCallback(() => {
    const container = root.current;
    const origin = document.activeElement;
    if (!container || !(origin instanceof HTMLElement) || !container.contains(origin)) return;
    stop.current?.();

    const settle = () => {
      const active = document.activeElement;
      const lost = active === null || active === document.body || !active.isConnected;
      // The user moved on (focus is elsewhere on the page): never steal it.
      if (!lost && !container.contains(active)) return finish();
      // Still loading: wait for the outcome.
      if (container.querySelector('[aria-busy="true"]')) return;
      const retryButton = container.querySelector<HTMLElement>("[data-error-card] button");
      if (retryButton) {
        // Same button still there: the retry is pending, or its re-render (a Transition with a
        // router refresh, which can take a while) has not committed yet. Keep waiting for a
        // decisive outcome: recovery, a new fallback, the user moving on, or the time limit.
        if (retryButton === origin && origin.isConnected) return;
        retryButton.focus({ preventScroll: true }); // the failure persists (a new button)
        return finish();
      }
      // Recovered. If the user already focused something inside the content, keep it.
      if (!lost && active !== origin) return finish();
      const target = container.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6") ?? container;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      finish();
    };

    const observer = new MutationObserver(settle);
    // The user moved focus to another element outside the section: stop watching at once. A
    // null `relatedTarget` (the focused button unmounting, or the window losing focus) is not a
    // user move; the observer decides those.
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && !container.contains(next)) finish();
    };
    const scope: HTMLElement = container; // narrowed above; `finish` is hoisted
    scope.addEventListener("focusout", onFocusOut);
    function finish() {
      observer.disconnect();
      scope.removeEventListener("focusout", onFocusOut);
      stop.current = null;
    }
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-busy"],
    });
    stop.current = finish;
  }, []);

  return { root, arm };
}

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
  const { root, arm } = useRetryFocus();
  const { copy, layout = "section", headingLevel, onRetry, onError } = fallback;
  const retry = async () => {
    arm();
    await onRetry?.();
  };

  let content: ReactNode;
  if (status === "loading") content = loading;
  else if (status === "error") {
    const common = { layout, title: copy.title, description: copy.description, headingLevel };
    // Without `onRetry` there is nothing to retry, so no button is shown.
    content = onRetry ? (
      <ErrorCard {...common} retryLabel={copy.retryLabel} onRetry={retry} />
    ) : (
      <ErrorCard {...common} />
    );
  } else {
    content = (
      <CatchSection
        copy={copy}
        layout={layout}
        headingLevel={headingLevel}
        onError={onError}
        onRetry={retry}
      >
        {children}
      </CatchSection>
    );
  }
  // The wrapper is the focus scope of this section (and the fallback focus target).
  return (
    <div
      ref={root}
      data-section-boundary=""
      className="min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky"
    >
      {content}
    </div>
  );
}
