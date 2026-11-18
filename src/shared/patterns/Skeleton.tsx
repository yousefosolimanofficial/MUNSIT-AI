import type { CSSProperties, ReactNode } from "react";

/*
 * MUNSIT AI — loading skeleton primitives (Phase 06, Increment 2; D-U3).
 * Figma: `Skeleton / Block` `2495:1719` (White 7%, radius 8), placed at the size of the content it
 * replaces inside the real section cards (Dashboard Loading `2495:1720` / `2495:2978` /
 * `2495:4188`). Values: docs/design-values.md §15.1.
 *
 * Geometry-matched pattern: a module composes these primitives inside its real card, at the
 * sizes of the content that will appear, so nothing shifts when the content loads:
 *
 *   <SkeletonRegion label={t("loadingLectures")}>
 *     <Skeleton width={124} height={16} />   // title
 *     <SkeletonText lines={2} />             // two 12px lines
 *     <Skeleton height={96} />               // a 96px block, full width
 *   </SkeletonRegion>
 *
 * - `SkeletonRegion`: `aria-busy="true"` plus one visually hidden label (module copy). No live
 *   region, so nothing is announced repeatedly; the blocks are `aria-hidden`.
 * - Motion: the approved subtle opacity pulse (D-U3); none under `prefers-reduced-motion`.
 * - Server-safe: no state, no effects. Logical properties only (identical in RTL and LTR).
 */

/** A CSS length: a number is pixels; a string is any CSS length (for example "60%"). */
export type SkeletonLength = number | string;

function length(value: SkeletonLength): string {
  return typeof value === "number" ? `${value}px` : value;
}

const BLOCK =
  "block shrink-0 max-w-full rounded-sm bg-text-primary/7 animate-skeleton-pulse motion-reduce:animate-none";

export interface SkeletonProps {
  /** Default "100%" (fills its container). */
  width?: SkeletonLength;
  /** Default 12 (a Figma text line). */
  height?: SkeletonLength;
}

/** One block (Figma `Skeleton / Block`). */
export function Skeleton({ width = "100%", height = 12 }: SkeletonProps) {
  const style: CSSProperties = { inlineSize: length(width), blockSize: length(height) };
  return <span aria-hidden="true" data-skeleton="" className={BLOCK} style={style} />;
}

export interface SkeletonTextProps {
  /** Number of 12px lines. Default 2. */
  lines?: number;
  /** Width of the last line, as in Figma (shorter last line). Default "70%". */
  lastLineWidth?: SkeletonLength;
}

/** Text lines: 12px blocks, gap 14 (the Figma section stack), the last one shorter. */
export function SkeletonText({ lines = 2, lastLineWidth = "70%" }: SkeletonTextProps) {
  const count = Math.max(1, Math.floor(lines));
  return (
    <span aria-hidden="true" className="flex w-full flex-col gap-[14px]">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} width={i === count - 1 && count > 1 ? lastLineWidth : "100%"} />
      ))}
    </span>
  );
}

export interface SkeletonRegionProps {
  /** Visually hidden description of what is loading (module copy), read by screen readers. */
  label: string;
  /** Skeleton primitives, arranged like the content they replace. */
  children: ReactNode;
}

/** The loading state of one region: busy, labelled once, its blocks hidden from assistive tech. */
export function SkeletonRegion({ label, children }: SkeletonRegionProps) {
  return (
    <div
      aria-busy="true"
      data-skeleton-region=""
      className="flex w-full min-w-0 flex-col gap-[14px]"
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
