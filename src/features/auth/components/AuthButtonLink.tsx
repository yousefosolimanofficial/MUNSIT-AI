import type { ComponentProps, ReactNode } from "react";

import { Link } from "@/i18n/navigation";

import { PRIMARY_BUTTON } from "./auth-styles";

/*
 * A route link drawn as the `Auth / Primary Button` (Default and Focus). Used where Figma's primary
 * action navigates instead of submitting: Register Success "تسجيل الدخول", Forgot Email sent and
 * Reset Updated "العودة لتسجيل الدخول", Reset Invalid and Expired link "طلب رابط جديد". It is a link
 * (it changes page), so it is announced as one; the locale prefix comes from the localized `Link`.
 */

type AuthHref = ComponentProps<typeof Link>["href"];

export function AuthButtonLink({ href, children }: { href: AuthHref; children: ReactNode }) {
  return (
    <Link href={href} data-auth-button-link="" className={`${PRIMARY_BUTTON} cursor-pointer`}>
      {children}
    </Link>
  );
}
