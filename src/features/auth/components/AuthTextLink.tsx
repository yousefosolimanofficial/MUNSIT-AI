import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/i18n/navigation";

import { FOCUS_RING } from "./auth-styles";

/*
 * `Auth / Text Link` (Figma component set `191:62`: Default `191:58` Electric Sky, Hover `191:60`
 * Info Blue). `Auth/Form/Label`, padding 2 / 0. Route links only (Login, Register, Forgot); the
 * locale prefix comes from the localized `Link`.
 */

/** A localized route path (typed by the navigation registry). */
type AuthHref = ComponentProps<typeof Link>["href"];

export function AuthTextLink({ href, children }: { href: AuthHref; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-sm py-0.5 text-auth-form-label text-accent-electric-sky transition-colors duration-150 hover:text-accent-info-blue ${FOCUS_RING}`}
    >
      {children}
    </Link>
  );
}
