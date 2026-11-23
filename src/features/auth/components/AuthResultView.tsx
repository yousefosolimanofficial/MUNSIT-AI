import type { ReactNode } from "react";

import { Icon } from "@/shared/ui/Icon";

import { AuthCardHeader } from "./AuthFormCard";
import { CARD_WIDTH } from "./auth-styles";

/*
 * Result views (Register Success `2480:2534`; Email sent, Updated, Invalid and Expired link in
 * Increment 4): one component with props. A vertical stack, gap 28: the status icon, the header
 * (the page's `h1`), the actions, then an optional footer.
 *
 * Status icon (Figma `Status Icon`): 64 × 64, radius 20 (`radius-xl`), Success Green 12% fill,
 * Success Green 40% border, the official `check` icon at 28 in Success Green. The values of the
 * link-error views (Invalid, Expired) are read from Figma in Increment 4 before a second tone is
 * added. Success views are shown only in explicit development previews until Authentication is
 * functional (D-08-4).
 */

export interface AuthResultViewProps {
  heading: string;
  body: string;
  actions: ReactNode;
  footer?: ReactNode;
  headingId?: string;
}

export function AuthResultView({ heading, body, actions, footer, headingId }: AuthResultViewProps) {
  return (
    <section data-auth-result="" className={`flex flex-col gap-7 ${CARD_WIDTH}`}>
      <div className="flex size-16 items-center justify-center rounded-xl border border-solid border-accent-success-green/40 bg-accent-success-green/12 text-accent-success-green">
        <Icon name="check" size={28} />
      </div>
      <AuthCardHeader heading={heading} description={body} headingId={headingId} />
      {actions}
      {footer}
    </section>
  );
}
