import type { ReactNode } from "react";

import { Icon } from "@/shared/ui/Icon";

import { AuthCardHeader } from "./AuthFormCard";
import { CARD_WIDTH } from "./auth-styles";

/*
 * Result views (Register Success `2480:2534`; Email sent, Updated, Invalid and Expired link in
 * Increment 4): one component with props. A vertical stack, gap 28: the status icon, the header
 * (the page's `h1`), the actions, then an optional footer.
 *
 * Status icon (Figma `Status Icon`): 64 × 64, radius 20 (`radius-xl`), a 12% fill and a 40% border
 * of the tone colour, and the official icon at 28 in the tone colour. Tones (read from Figma,
 * 2026-11-26): `success` Success Green + `check` (Register Success `2480:2534`, Reset Updated
 * `2480:816`); `danger` Coral Pulse + `alert` (Reset Invalid link `2480:724`); `warning` Semantic
 * Warning + `alert` (Reset Expired link `2480:770`). `null` draws no icon (Forgot Email sent
 * `2467:75582`). Success views are shown only in explicit development previews until
 * Authentication is functional (D-08-4).
 */

export type AuthResultTone = "success" | "danger" | "warning";

const TONES: Record<AuthResultTone, { classes: string; icon: "check" | "alert" }> = {
  success: {
    classes: "border-accent-success-green/40 bg-accent-success-green/12 text-accent-success-green",
    icon: "check",
  },
  danger: {
    classes: "border-accent-coral-pulse/40 bg-accent-coral-pulse/12 text-accent-coral-pulse",
    icon: "alert",
  },
  warning: {
    classes: "border-semantic-warning/40 bg-semantic-warning/12 text-semantic-warning",
    icon: "alert",
  },
};

export interface AuthResultViewProps {
  heading: string;
  body: string;
  actions: ReactNode;
  footer?: ReactNode;
  headingId?: string;
  /** Status icon tone; `null` draws no icon. Default `success`. */
  tone?: AuthResultTone | null;
}

export function AuthResultView({
  heading,
  body,
  actions,
  footer,
  headingId,
  tone = "success",
}: AuthResultViewProps) {
  const status = tone ? TONES[tone] : null;
  return (
    <section data-auth-result={tone ?? "plain"} className={`flex flex-col gap-7 ${CARD_WIDTH}`}>
      {status ? (
        <div
          data-auth-result-icon={tone}
          className={`flex size-16 items-center justify-center rounded-xl border border-solid ${status.classes}`}
        >
          <Icon name={status.icon} size={28} />
        </div>
      ) : null}
      <AuthCardHeader heading={heading} description={body} headingId={headingId} />
      {actions}
      {footer}
    </section>
  );
}
