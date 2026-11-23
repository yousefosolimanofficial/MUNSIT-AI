import type { ReactNode } from "react";

import { CARD_WIDTH } from "./auth-styles";

/*
 * `Auth / Form Container` (Figma component set: Screen = Login, Register, Forgot Password). A
 * vertical stack with gap 28: header (title `Auth/Heading/Form` Text Primary and description
 * `Landing/Body/Large` Text Secondary, gap 8), the form content, then the footer row (centred,
 * gap 6: `Landing/Body/Small` Text Secondary text plus a text link). 480 wide; 350 on Mobile.
 *
 * The title is the page's `h1`. The form element itself belongs to the screen (Increments 2–4),
 * which places the fields, the error banner and the submit button in `children`.
 */

export function AuthCardHeader({
  heading,
  description,
  headingId,
}: {
  heading: string;
  description: string;
  headingId?: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-start">
      <h1
        id={headingId}
        tabIndex={-1}
        className="text-auth-heading-form text-text-primary outline-none"
      >
        {heading}
      </h1>
      <p className="text-landing-body-large text-text-secondary">{description}</p>
    </div>
  );
}

export function AuthCardFooter({ text, link }: { text: string; link: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-1.5 text-landing-body-small text-text-secondary">
      <span>{text}</span>
      {link}
    </p>
  );
}

export interface AuthFormCardProps {
  heading: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  headingId?: string;
}

export function AuthFormCard({
  heading,
  description,
  children,
  footer,
  headingId,
}: AuthFormCardProps) {
  return (
    <section data-auth-card="" className={`flex flex-col gap-7 ${CARD_WIDTH}`}>
      <AuthCardHeader heading={heading} description={description} headingId={headingId} />
      {children}
      {footer}
    </section>
  );
}

/*
 * `Auth / Error Banner` (Login Error `2467:75609`): the form-level message. Coral Pulse 8% fill,
 * Coral Pulse 35% border, radius 12, padding 10 / 14, `Dashboard/Body Medium` Coral Pulse. An alert
 * region: rendered only while there is a message, so it is announced once.
 */
export function AuthErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      data-auth-error-banner=""
      className="rounded-md border border-solid border-accent-coral-pulse/35 bg-accent-coral-pulse/8 px-3.5 py-2.5 text-dashboard-body-medium text-accent-coral-pulse text-start"
    >
      {message}
    </div>
  );
}
