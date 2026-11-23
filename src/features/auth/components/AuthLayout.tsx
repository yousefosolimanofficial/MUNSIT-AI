import type { ReactNode } from "react";

import { Logo } from "@/shared/ui/Logo";

import type { AuthFamily } from "../model/auth-images";
import { AuthMarketingPanel, type AuthMarketingCopy } from "./AuthMarketingPanel";
import { CARD_WIDTH } from "./auth-styles";

/*
 * The shared Authentication layout (Phase 08 Increment 1; Figma Login `67:3` / `67:59` / `67:37`).
 * Breakpoints follow ADR-004: Mobile < 720 ≤ Tablet (`rail:`) < 1280 ≤ Desktop (`xl:`).
 *
 * - Desktop: one centred row, gap 96. The form column (inline start, the right in RTL): Logo
 *   188 × 49 aligned to the start, gap 40, then the card (480). The marketing panel (520) at the
 *   inline end.
 * - Tablet: one column, padding 40 / 48 / 48, gap 32: Logo centred, the panel, then the card (480,
 *   centred).
 * - Mobile: one column, padding 24 / 20 / 32, gap 24: Logo centred, the card, then the panel.
 *
 * DOM order equals visual order at every breakpoint (D-08-9). The panel therefore has two slots:
 * before the form (Tablet) and after it (Mobile and Desktop). Only one is displayed; the other is
 * `display: none`, so it is not read or focused, and its lazy photo is not fetched.
 *
 * Background Void Black. Each screen composes this layout in its own increment (Increments 2–4),
 * so it is not a route-group layout. No `<main>` here: the page provides it.
 */

export interface AuthLayoutProps {
  family: AuthFamily;
  marketing: AuthMarketingCopy;
  children: ReactNode;
}

export function AuthLayout({ family, marketing, children }: AuthLayoutProps) {
  return (
    <div
      data-auth-layout={family}
      className="relative flex min-h-dvh flex-col items-center gap-6 overflow-x-clip bg-surface-void-black px-5 pt-6 pb-8 rail:gap-8 rail:px-12 rail:pt-10 rail:pb-12 xl:flex-row xl:justify-center xl:gap-24 xl:px-12 xl:py-10"
    >
      <div data-auth-logo="top" className="flex justify-center xl:hidden">
        <Logo variant="horizontal" height={49} preload />
      </div>

      <AuthMarketingPanel
        family={family}
        copy={marketing}
        className="hidden rail:block xl:hidden"
      />

      <div
        data-auth-form-column=""
        className={`flex flex-col items-center gap-10 xl:items-start ${CARD_WIDTH}`}
      >
        <div data-auth-logo="column" className="hidden xl:flex">
          <Logo variant="horizontal" height={49} preload />
        </div>
        {children}
      </div>

      <AuthMarketingPanel family={family} copy={marketing} className="rail:hidden xl:block" />
    </div>
  );
}
