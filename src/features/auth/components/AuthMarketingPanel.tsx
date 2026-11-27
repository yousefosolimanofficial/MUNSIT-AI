import Image from "next/image";
import type { ReactNode } from "react";

import { AUTH_IMAGES, type AuthFamily } from "../model/auth-images";
import { PANEL_SHADOW } from "./auth-styles";

/*
 * `Auth / Marketing Panel` and its `Auth / Background Glow` (Login `67:3` / `67:59` / `67:37`).
 *
 * Panel: Void Black, 1 px Neutral Slate border, radius 24 (`radius-2xl`), shadow 0 24 48 −12 black
 * 40%. Photo on top (200 on Mobile, 350 on Desktop; Tablet 350 for Login and 240 for Register and
 * Recovery; `object-cover`, the Figma `FILL`), then the copy, centred, gap 12, padding 28 / 32 / 32 / 32 (Mobile 20 / 20 / 24 / 20).
 * Width 520 on Desktop; the column width on Tablet (672 at 768) and Mobile (350 at 390).
 *
 * Copy styles per family (design-values §0.4.5): Login `Compact`, Register `Relaxed`, Forgot and
 * Reset the plain `Auth/Panel/Heading` and `Auth/Panel/Lead`; body `Auth/Panel/Body` Text
 * Secondary; the highlighted heading word Electric Sky (passed in as rich text).
 *
 * The photo is decorative (`alt=""`, D-08-9). The heading is a paragraph, not a heading element:
 * the form card title is the page's only `h1`.
 */

const HEADING: Readonly<Record<AuthFamily, string>> = {
  login: "text-auth-panel-heading-compact",
  register: "text-auth-panel-heading-relaxed",
  recovery: "text-auth-panel-heading",
};

const LEAD: Readonly<Record<AuthFamily, string>> = {
  login: "text-auth-panel-lead-compact",
  register: "text-auth-panel-lead-relaxed",
  recovery: "text-auth-panel-lead",
};

/*
 * Background glow: three radial ellipses positioned around the panel, per breakpoint, from the
 * Figma frames (offsets from the panel's physical left edge in RTL, so `end-*` keeps them on the
 * same side in LTR). Figma softens them with a layer blur (110–160); like the Landing atmosphere
 * (P07-D17) they are drawn here as gradients that already fade to transparent, without blur
 * filters (rendering cost).
 */
const GLOWS = [
  // Glow / Cobalt — Cobalt Edge 25% → 0
  "h-[439px] w-[351px] top-[-68px] end-[-20px] rail:h-[500px] rail:w-[691px] rail:top-[-60px] rail:end-[-48px] xl:h-[680px] xl:w-[680px] xl:top-[-68px] xl:end-[-132px] bg-[radial-gradient(closest-side,rgba(20,60,163,0.25),rgba(20,60,163,0))]",
  // Glow / Cyan — Info Blue 12% → 0
  "h-[300px] w-[234px] top-[-8px] end-[136px] rail:h-[300px] rail:w-[461px] rail:top-0 rail:end-[259px] xl:h-[400px] xl:w-[460px] xl:top-[-128px] xl:end-[58px] bg-[radial-gradient(closest-side,rgba(86,194,255,0.12),rgba(86,194,255,0))]",
  // Glow / Deep Blue — Deep Space 35% → 0
  "h-[400px] w-[351px] top-[63px] end-0 rail:h-[400px] rail:w-[691px] rail:top-[170px] rail:end-[-10px] xl:h-[500px] xl:w-[650px] xl:top-[232px] xl:end-[-92px] bg-[radial-gradient(closest-side,rgba(2,25,59,0.35),rgba(2,25,59,0))]",
] as const;

export interface AuthMarketingCopy {
  /** Heading with the highlighted word already wrapped (rich text from the message file). */
  heading: ReactNode;
  lead: string;
  body: readonly string[];
}

/**
 * Photo height per family (Figma): Mobile 200 and Desktop 350 for every family; Tablet 350 for
 * Login (`67:59`) and 240 for Register (`67:66`) and Recovery (`67:73`, `2480:860`).
 */
const PHOTO_HEIGHT: Record<AuthFamily, string> = {
  login: "h-[200px] rail:h-[350px]",
  register: "h-[200px] rail:h-[240px] xl:h-[350px]",
  recovery: "h-[200px] rail:h-[240px] xl:h-[350px]",
};

/**
 * Copy padding per family (Figma `Auth / Marketing Copy`): Login and Recovery 20 / 20 / 24 / 20 on
 * Mobile and 28 / 32 / 32 / 32 from Tablet; Register 28 / 20 / 32 / 20 on Mobile (`67:44`), 24 on
 * every side on Tablet (`67:66`) and 28 / 32 / 32 / 32 on Desktop (`67:14`).
 */
const COPY_PADDING: Record<AuthFamily, string> = {
  login: "px-5 pt-5 pb-6 rail:px-8 rail:pt-7 rail:pb-8",
  register: "px-5 pt-7 pb-8 rail:p-6 xl:px-8 xl:pt-7 xl:pb-8",
  recovery: "px-5 pt-5 pb-6 rail:px-8 rail:pt-7 rail:pb-8",
};

export function AuthMarketingPanel({
  family,
  copy,
  className,
}: {
  family: AuthFamily;
  copy: AuthMarketingCopy;
  className?: string;
}) {
  const image = AUTH_IMAGES[family];
  return (
    <div
      data-auth-marketing=""
      className={["relative isolate w-full xl:w-[520px]", className].filter(Boolean).join(" ")}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {GLOWS.map((glow) => (
          <span key={glow} className={`absolute rounded-full ${glow}`} />
        ))}
      </div>
      <div
        className={`overflow-hidden rounded-2xl border border-solid border-neutral-slate bg-surface-void-black ${PANEL_SHADOW}`}
      >
        <div className={`relative w-full ${PHOTO_HEIGHT[family]}`}>
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt=""
            sizes="(min-width: 1280px) 520px, (min-width: 720px) calc(100vw - 96px), calc(100vw - 40px)"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className={`flex flex-col items-center gap-3 text-center ${COPY_PADDING[family]}`}>
          <p className={`${HEADING[family]} text-text-primary`}>{copy.heading}</p>
          <p className={`${LEAD[family]} text-text-primary`}>{copy.lead}</p>
          {copy.body.map((paragraph) => (
            <p
              key={paragraph}
              className="whitespace-pre-line text-auth-panel-body text-text-secondary"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
