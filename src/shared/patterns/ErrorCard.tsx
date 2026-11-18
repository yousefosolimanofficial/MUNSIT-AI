"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

/*
 * MUNSIT AI — ErrorCard (Phase 06, Increment 2; D-U5 approved). Values: docs/design-values.md §15.2.
 *
 * - `layout="card"`: the full error (Dashboard Error State `2495:2424`, Mobile `2495:4794`).
 *   Vertical, centred, gap 14, padding 32/24, radius 20, Obsidian 90%, 1px Coral 25%; tile 56
 *   (radius 14, Coral 12/30, `alert` 25); title Title M; body Body Secondary; Primary retry.
 * - `layout="section"`: the inline error of one section (Section Error `2495:2966`, Tablet and
 *   Mobile in `2495:3661` / `2495:4805`). No surface of its own: it sits inside the section's card.
 *   A row (tile 44, text, Secondary retry; gap 14, padding-inline 16) where the card is at least
 *   28rem wide; stacked and centred below that, as drawn for Mobile. A container query, so it
 *   follows the card, not the viewport.
 *
 * Behaviour:
 * - All copy comes from props (module copy). The component holds none of its own.
 * - Retry (optional): the shared Button. While a promise returned by `onRetry` is pending, further
 *   activations are ignored and the button is `aria-disabled` (it stays focusable, so focus does
 *   not jump). There is no loading visual (none is designed; Button loading is out of v1, D-B3).
 * - The text is a `role="status"` group (polite), so a section that fails after loading is
 *   announced once, without interrupting.
 * - Icon decorative and never mirrored; logical properties only; colours from tokens only.
 */

export type ErrorCardLayout = "card" | "section";

type RetryProps =
  | { onRetry?: undefined; retryLabel?: undefined }
  | {
      /** Called on activation. A returned promise holds the pending state until it settles. */
      onRetry: () => void | Promise<unknown>;
      /** Visible label and accessible name of the retry button (module copy). */
      retryLabel: string;
    };

export type ErrorCardProps = RetryProps & {
  /** Default "card". */
  layout?: ErrorCardLayout;
  title: string;
  description?: string;
  /** Heading level of the title. Default 2 for "card", 3 for "section". */
  headingLevel?: 2 | 3;
};

const FOCUS_SAFE_TEXT = "min-w-0 break-words";

const STYLES = {
  card: {
    root: "flex w-full min-w-0 flex-col items-center gap-[14px] rounded-xl border border-accent-coral-pulse/25 bg-surface-obsidian/90 px-[24px] py-xl text-center",
    tile: "flex size-[56px] shrink-0 items-center justify-center rounded-[14px] border border-accent-coral-pulse/30 bg-accent-coral-pulse/12 text-accent-coral-pulse",
    iconSize: 25,
    text: `flex w-full flex-col items-center gap-[14px] ${FOCUS_SAFE_TEXT}`,
    title: "text-dashboard-title-m text-text-primary",
    description: "text-dashboard-body text-text-secondary",
    retryVariant: "primary",
  },
  section: {
    root: "@container w-full min-w-0",
    row: "flex flex-col items-center gap-[14px] px-md text-center @min-[28rem]:flex-row @min-[28rem]:text-start",
    tile: "flex size-[44px] shrink-0 items-center justify-center rounded-[14px] border border-accent-coral-pulse/30 bg-accent-coral-pulse/12 text-accent-coral-pulse",
    iconSize: 20,
    text: `flex w-full flex-col gap-xs ${FOCUS_SAFE_TEXT} @min-[28rem]:flex-1`,
    title: "text-dashboard-card-title text-text-primary",
    description: "text-dashboard-caption text-text-secondary",
    retryVariant: "secondary",
  },
} as const;

export function ErrorCard(props: ErrorCardProps) {
  const { layout = "card", title, description, headingLevel } = props;
  const style = STYLES[layout];
  const Heading = (headingLevel ?? (layout === "card" ? 2 : 3)) === 3 ? "h3" : "h2";

  const busy = useRef(false);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onRetry = props.onRetry;
  const retry = () => {
    if (onRetry === undefined || busy.current) return;
    busy.current = true;
    setPending(true);
    const done = () => {
      busy.current = false;
      if (mounted.current) setPending(false);
    };
    try {
      void Promise.resolve(onRetry()).then(done, done);
    } catch (error) {
      done();
      throw error;
    }
  };

  const tile = (
    <span className={style.tile}>
      <Icon name="alert" size={style.iconSize} />
    </span>
  );
  const text = (
    <div role="status" className={style.text}>
      <Heading className={style.title}>{title}</Heading>
      {description ? <p className={style.description}>{description}</p> : null}
    </div>
  );
  const action =
    props.retryLabel !== undefined ? (
      <Button
        variant={style.retryVariant}
        className="shrink-0"
        aria-disabled={pending || undefined}
        data-pending={pending || undefined}
        onClick={retry}
      >
        {props.retryLabel}
      </Button>
    ) : null;

  if (layout === "section") {
    return (
      <div className={STYLES.section.root} data-error-card="section">
        <div className={STYLES.section.row}>
          {tile}
          {text}
          {action}
        </div>
      </div>
    );
  }
  return (
    <div className={STYLES.card.root} data-error-card="card">
      {tile}
      {text}
      {action}
    </div>
  );
}
