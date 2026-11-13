import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LOGO_VARIANTS } from "@/design-system/brand";
import { ICON_NAMES, ICON_SIZES } from "@/design-system/icons/manifest";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/shared/ui/Icon";
import { Logo } from "@/shared/ui/Logo";
import { Ltr } from "@/shared/ui/Ltr";

import { readDesignTokens, type DesignTokens } from "./_lib/read-tokens";

/*
 * TEMPORARY internal inspection route (Roadmap Phase 02 deliverable `/dev/tokens`).
 * Not a product screen; English labels are developer notes, not product copy.
 * Returns 404 in production builds. Remove before Phase 22.
 * Heights here are inspection sizes only — real placement heights come from Figma per phase.
 */

export const metadata: Metadata = {
  title: "Dev · Tokens",
  robots: { index: false, follow: false },
};

const SAMPLE_HEIGHT = 48;

function LogoRow({ dir }: { dir: "rtl" | "ltr" }) {
  return (
    <section
      dir={dir}
      data-testid={`logos-${dir}`}
      className="grid gap-md rounded-lg border border-neutral-slate p-lg"
    >
      <h2 className="text-dashboard-title-m" lang="en">
        Logo · dir={dir}
      </h2>
      {LOGO_VARIANTS.map((variant) => (
        <div key={variant} className="grid gap-xs">
          <span className="font-mono text-dashboard-meta text-text-secondary" lang="en">
            {variant}
          </span>
          <div data-testid={`logo-${dir}-${variant}`} className="min-w-0">
            <Logo variant={variant} height={SAMPLE_HEIGHT} />
          </div>
        </div>
      ))}
    </section>
  );
}

function IconRow({ dir }: { dir: "rtl" | "ltr" }) {
  return (
    <section
      dir={dir}
      data-testid={`icons-${dir}`}
      className="grid gap-md rounded-lg border border-neutral-slate p-lg"
    >
      <h2 className="text-dashboard-title-m" lang="en">
        Icons · dir={dir} · 24px · Text / Secondary
      </h2>
      <div className="flex flex-wrap gap-sm">
        {ICON_NAMES.map((name) => (
          <span
            key={name}
            data-testid={`icon-${dir}-${name}`}
            className="inline-flex p-xs text-text-secondary"
          >
            <Icon name={name} />
          </span>
        ))}
      </div>
    </section>
  );
}

/** Figma placement samples: Sidebar/Rail 20, mobile bar 22, search 18 (default + active colors). */
function IconPlacements() {
  const samples = [
    { id: "sidebar-home-20", name: "home", size: ICON_SIZES.sidebar, color: "text-text-secondary" },
    {
      id: "sidebar-active-home-20",
      name: "home",
      size: ICON_SIZES.sidebar,
      color: "text-accent-electric-sky",
    },
    {
      id: "mobile-home-22",
      name: "home",
      size: ICON_SIZES.mobileNav,
      color: "text-text-secondary",
    },
    {
      id: "mobile-active-home-22",
      name: "home",
      size: ICON_SIZES.mobileNav,
      color: "text-accent-electric-sky",
    },
    { id: "search-18", name: "search", size: 18, color: "text-text-secondary" },
  ] as const;
  return (
    <section
      data-testid="icon-placements"
      className="grid gap-md rounded-lg border border-neutral-slate p-lg"
    >
      <h2 className="text-dashboard-title-m" lang="en">
        Icon placements (Figma sizes)
      </h2>
      <div className="flex flex-wrap gap-sm">
        {samples.map(({ id, name, size, color }) => (
          <span key={id} data-testid={`icon-sample-${id}`} className={`inline-flex p-xs ${color}`}>
            <Icon name={name} size={size} />
          </span>
        ))}
        <span data-testid="icon-labelled" className="inline-flex p-xs text-text-secondary">
          <Icon name="bell" size={20} label="Notifications (dev sample)" />
        </span>
      </div>
    </section>
  );
}

/**
 * i18n / direction inspection. All strings come from the DEV-ONLY `dev` message namespace.
 * The language links are a development control, not the product language switcher (Phase 05/20).
 */
async function I18nSection() {
  const locale = await getLocale();
  const t = await getTranslations("dev.fixture");
  const stats = "74% · 92 · 12/30";
  return (
    <section data-testid="i18n" className="grid gap-md rounded-lg border border-neutral-slate p-lg">
      <h2 className="text-dashboard-title-m" lang="en">
        i18n · locale={locale}
      </h2>
      <p className="font-mono text-dashboard-meta text-text-secondary">{t("note")}</p>
      <nav aria-label="Dev language switch" className="flex gap-md text-dashboard-button">
        <Link href="/dev/tokens" locale="ar" data-testid="switch-ar" lang="ar">
          {t("switchToArabic")}
        </Link>
        <Link href="/dev/tokens" locale="en" data-testid="switch-en" lang="en">
          {t("switchToEnglish")}
        </Link>
      </nav>
      <p data-testid="i18n-number">{t("mixedNumber", { count: 1234 })}</p>
      <p data-testid="i18n-goal">
        {t.rich("goal", { number: 5, title: "AVL Trees", ltr: (chunks) => <Ltr>{chunks}</Ltr> })}
      </p>
      <p data-testid="i18n-stats">
        {t.rich("statsLine", { stats, ltr: (chunks) => <Ltr>{chunks}</Ltr> })}
      </p>
      <p data-testid="i18n-stats-control">{t("statsLineControl", { stats })}</p>
      <p data-testid="i18n-stat-label" className="text-dashboard-body text-text-secondary">
        {t("stat")}
      </p>
      <label className="grid gap-xs text-dashboard-body-medium">
        {t("fieldLabel")}
        <input
          data-testid="i18n-input"
          defaultValue={t("stat")}
          className="rounded-md border border-neutral-slate bg-surface-obsidian px-sm py-xs text-dashboard-body"
        />
      </label>
      <div data-testid="i18n-direction-row" className="flex gap-sm">
        <span data-testid="i18n-first" className="ps-xs">
          1
        </span>
        <span data-testid="i18n-second">2</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Design-system foundations (G-1). Values are read from the source CSS (see _lib/read-tokens) */
/* and rendered through the same CSS variables the app uses — nothing is restated here.        */
/* ------------------------------------------------------------------------------------------ */

const SECTION = "grid gap-md rounded-lg border border-neutral-slate p-lg";
const CODE = "font-mono text-dashboard-meta text-text-secondary";

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-dashboard-title-m" lang="en">
      {children}
    </h2>
  );
}

function Colors({ colors }: { colors: DesignTokens["colors"] }) {
  return (
    <section data-testid="dev-colors" className={SECTION}>
      <Heading>Colors · {colors.length}</Heading>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-sm" lang="en">
        {colors.map((color) => (
          <li
            key={color.name}
            data-testid={`swatch-${color.name.replace("--color-", "")}`}
            data-hex={color.value}
            className="grid gap-xs rounded-md border border-neutral-slate p-xs"
          >
            <span
              data-swatch
              className="block h-12 rounded-sm border border-neutral-slate"
              style={{ background: `var(${color.name})` }}
            />
            <span className="text-dashboard-caption text-text-primary">{color.figmaName}</span>
            <span dir="ltr" className={CODE}>
              {color.value}
            </span>
            <span dir="ltr" className={`${CODE} break-all`}>
              {color.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpacingRadius({ tokens }: { tokens: DesignTokens }) {
  return (
    <section data-testid="dev-spacing-radius" className={SECTION} lang="en">
      <Heading>Spacing · Radius · Page padding</Heading>
      <div className="grid gap-sm">
        {tokens.spacing.map((token) => (
          <div
            key={token.name}
            data-testid={`spacing-${token.name}`}
            className="flex items-center gap-sm"
          >
            <span dir="ltr" className={`${CODE} w-32 shrink-0`}>
              {token.name} {token.value}
            </span>
            <span
              data-bar
              className="block h-3 rounded-sm bg-accent-electric-sky"
              style={{ width: `var(${token.name})` }}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-md">
        {tokens.radius.map((token) => (
          <div
            key={token.name}
            data-testid={`radius-${token.name}`}
            className="grid justify-items-center gap-xs"
          >
            <span
              data-box
              className="block size-16 border border-accent-electric-sky bg-surface-obsidian"
              style={{ borderRadius: `var(${token.name})` }}
            />
            <span dir="ltr" className={CODE}>
              {token.name} {token.value}
            </span>
          </div>
        ))}
      </div>
      <p dir="ltr" className={CODE}>
        {tokens.pagePadding.map((token) => `${token.name}: ${token.value}`).join(" · ")}
      </p>
    </section>
  );
}

function Motion({ tokens }: { tokens: DesignTokens }) {
  return (
    <section data-testid="dev-motion" className={SECTION} lang="en">
      <Heading>Motion</Heading>
      <ul className="grid gap-xs">
        {[...tokens.durations, ...tokens.easing].map((token) => (
          <li key={token.name} data-testid={`motion-${token.name}`} dir="ltr" className={CODE}>
            {token.name}: {token.value}
          </li>
        ))}
      </ul>
      <p dir="ltr" className="text-dashboard-caption text-text-secondary">
        Reduced motion: --motion-distance → 0, keyframe animations end immediately (motion.css).
      </p>
    </section>
  );
}

async function Fonts({ tokens }: { tokens: DesignTokens }) {
  // Cairo is the Arabic family: its sample is always the Arabic string, in both locales.
  const tAr = await getTranslations({ locale: "ar", namespace: "dev.fixture" });
  return (
    <section data-testid="dev-fonts" className={SECTION}>
      <Heading>Fonts</Heading>
      <p data-testid="font-cairo" className="text-dashboard-title-m" lang="ar" dir="rtl">
        Cairo — {tAr("stat")}
      </p>
      <p data-testid="font-inter" className="text-dashboard-title-m" lang="en" dir="ltr">
        Inter — MUNSIT AI 0123456789
      </p>
      <p
        data-testid="font-geist-mono"
        className="text-dashboard-title-m"
        lang="en"
        dir="ltr"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Geist Mono — 00:12:45
      </p>
      <p dir="ltr" lang="en" className={CODE}>
        --font-sans: {tokens.fontSans}
        <br />
        --font-mono: {tokens.fontMono}
      </p>
    </section>
  );
}

async function Typography({ styles }: { styles: DesignTokens["textStyles"] }) {
  const t = await getTranslations("dev.fixture");
  const sample = (family: string): string =>
    family === "Geist Mono" ? "00:12:45" : family === "Inter" ? "12 · 74% · Label" : t("stat");
  return (
    <section data-testid="dev-typography" className={SECTION}>
      <Heading>Typography · Dashboard/* · {styles.length}</Heading>
      <ul className="grid gap-md">
        {styles.map((style) => (
          <li
            key={style.token}
            data-testid={`type-${style.token.replace("--text-dashboard-", "")}`}
            className="grid gap-xs border-b border-neutral-slate pb-sm"
          >
            <span dir="ltr" lang="en" className={CODE}>
              {style.figmaName} · {style.family} · {style.weight} · {style.size} /{" "}
              {style.lineHeight} · tracking {style.letterSpacing}
            </span>
            <span
              data-sample
              dir={style.family === "Cairo" ? undefined : "ltr"}
              style={{
                fontFamily: style.family === "Geist Mono" ? "var(--font-mono)" : "var(--font-sans)",
                fontSize: `var(${style.token})`,
                lineHeight: `var(${style.token}--line-height)`,
                letterSpacing: `var(${style.token}--letter-spacing)`,
                fontWeight: `var(${style.token}--font-weight)`,
              }}
            >
              {sample(style.family)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DevTokensPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const tokens = readDesignTokens();

  return (
    <main className="grid gap-xl p-lg">
      <h1 className="text-dashboard-title-l" lang="en">
        Dev · Tokens (temporary)
      </h1>
      <Colors colors={tokens.colors} />
      <SpacingRadius tokens={tokens} />
      <Motion tokens={tokens} />
      <Fonts tokens={tokens} />
      <Typography styles={tokens.textStyles} />
      <I18nSection />
      <LogoRow dir="rtl" />
      <LogoRow dir="ltr" />
      <IconRow dir="rtl" />
      <IconRow dir="ltr" />
      <IconPlacements />
    </main>
  );
}
