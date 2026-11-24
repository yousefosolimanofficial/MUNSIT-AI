import type { ButtonHTMLAttributes, ReactNode } from "react";

/*
 * `Auth / Primary Button` (Figma component set `191:57`: Default `191:51`, Focus `191:53`,
 * Disabled `191:55`, Loading `2542:2824`). 52 high, full width, radius 12, Neutral Mist with
 * Neutral Iron `Auth/Button/Primary` label. Focus: Electric Sky border plus a 3 px Electric Sky 25%
 * ring (keyboard focus only). Disabled: 40% opacity.
 *
 * Loading keeps the size and shows the 18 px spinner (track Iron 25%, arc Iron) at the inline start
 * of the loading label (Figma `2542:2824`: the spinner sits on the right in RTL; Increment 2). It
 * sets `aria-busy` and is disabled so a second submit cannot start. The spinner turns only when
 * motion is allowed (reduced motion: the static Figma spinner).
 */

export interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  /** Label while loading, e.g. "جاري تسجيل الدخول...". */
  loadingLabel: string;
}

const BASE =
  "flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-solid border-transparent bg-neutral-mist text-auth-button-primary text-neutral-iron transition-[box-shadow,border-color,opacity] duration-150 enabled:cursor-pointer focus-visible:border-accent-electric-sky focus-visible:shadow-[0_0_0_3px_rgba(99,161,255,0.25)] focus-visible:outline-none disabled:cursor-not-allowed";

export function AuthSubmitButton({
  children,
  loading = false,
  loadingLabel,
  disabled,
  type = "submit",
  className,
  ...buttonProps
}: AuthSubmitButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading ? "" : undefined}
      className={[BASE, disabled && !loading ? "opacity-40" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <>
          <svg
            width={18}
            height={18}
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 motion-safe:animate-spin"
          >
            <circle
              cx="9"
              cy="9"
              r="7.5"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="3"
            />
            <path
              d="M9 1.5A7.5 7.5 0 0 1 16.5 9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
