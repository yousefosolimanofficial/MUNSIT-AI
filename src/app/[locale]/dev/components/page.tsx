import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Ltr } from "@/shared/ui/Ltr";

import { DialogDemo } from "./_components/DialogDemo";
import { SheetDemo } from "./_components/SheetDemo";

/*
 * TEMPORARY internal component gallery (Phase 03, P-5). Not a product screen; English headings
 * are developer notes. Returns 404 in production builds. Remove before Phase 22.
 *
 * Button: Primary and Secondary, enabled and disabled, on the six allowed surfaces
 * (contract §12.2). Hover, Pressed and Focus-visible are live interaction states. Ember Hush is
 * deliberately absent: the Secondary Button is not allowed there.
 *
 * Input: Default, Focused, Placeholder, Error, Disabled and Email (`dir="ltr"`) on the four
 * surfaces of Input contract §7. Focused is a live interaction state (`:focus-visible`): the
 * "focused" field is the one to Tab to.
 *
 * Dialog: layout A (alertdialog, danger tile, safe action focused), layout B (close button) and
 * a long body for the overflow check. Interactive client demo in `_components/DialogDemo.tsx`.
 *
 * Sheet: title-only options sheet (its Delete row opens a dialog: Sheet → Dialog) and a sheet with
 * description, actions and a long body. Client demo in `_components/SheetDemo.tsx`. Both overlay
 * sections sit outside <main> (see below).
 */

export const metadata: Metadata = {
  title: "Dev · Components",
  robots: { index: false, follow: false },
};

/** Allowed surfaces. The translucent cards sit on Void Black, as in the contract table. */
const SURFACES = [
  { id: "void-black", label: "Void Black", className: "bg-surface-void-black" },
  { id: "ink", label: "Ink", className: "bg-surface-ink" },
  { id: "obsidian", label: "Obsidian", className: "bg-surface-obsidian" },
  { id: "obsidian-88", label: "Obsidian 88% (over Void)", className: "bg-surface-obsidian/88" },
  { id: "graphite", label: "Graphite", className: "bg-color-surface-graphite" },
  {
    id: "graphite-95",
    label: "Graphite 95% (over Void)",
    className: "bg-color-surface-graphite/95",
  },
] as const;

/** Label copy: Figma default "متابعة"; English counterpart for the LTR locale. */
const LABELS = { ar: "متابعة", en: "Continue" } as const;

/**
 * Input surfaces (contract §7): page Void Black, the Settings Group card (Obsidian 90% over
 * Void), Obsidian and Graphite.
 */
const INPUT_SURFACES = [
  { id: "void-black", label: "Void Black", className: "bg-surface-void-black" },
  {
    id: "card",
    label: "Settings card · Obsidian 90% (over Void)",
    className: "bg-surface-obsidian/90",
  },
  { id: "obsidian", label: "Obsidian", className: "bg-surface-obsidian" },
  { id: "graphite", label: "Graphite", className: "bg-color-surface-graphite" },
] as const;

/**
 * Input copy: Figma `Label` "الاسم الكامل" and `Message` "اكتب اسمك الكامل." (contract §1); the
 * sample value, placeholder and email are the delivery's sample data. English counterparts for LTR.
 */
const INPUT_COPY = {
  ar: {
    name: "الاسم الكامل",
    value: "سارة أحمد",
    placeholder: "اكتب اسمك الكامل",
    error: "اكتب اسمك الكامل.",
    email: "البريد الإلكتروني",
  },
  en: {
    name: "Full name",
    value: "Sara Ahmed",
    placeholder: "Enter your full name",
    error: "Enter your full name.",
    email: "Email",
  },
} as const;
const SAMPLE_EMAIL = "sara@example.com";

/** One gallery cell: a developer caption (state name) above the field. */
function InputCell({ state, children }: { state: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 flex-[1_1_280px] gap-xs">
      <span className="font-mono text-dashboard-meta text-text-secondary" lang="en">
        <Ltr>{state}</Ltr>
      </span>
      {children}
    </div>
  );
}

export default async function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const locale = await getLocale();
  const label = locale === "en" ? LABELS.en : LABELS.ar;
  const copy = locale === "en" ? INPUT_COPY.en : INPUT_COPY.ar;

  return (
    <>
      <main className="grid gap-xl p-lg">
        <h1 className="text-dashboard-title-l" lang="en">
          Dev · Components (temporary)
        </h1>
        <section data-testid="gallery-button" className="grid gap-md">
          <h2 className="text-dashboard-title-m" lang="en">
            Button · locale={locale} · hover, press and Tab to see interaction states
          </h2>
          {SURFACES.map((surface) => (
            <div key={surface.id} className="rounded-lg bg-surface-void-black">
              <div
                data-testid={`surface-${surface.id}`}
                className={`grid gap-sm rounded-lg border border-neutral-slate p-lg ${surface.className}`}
              >
                <h3 className="font-mono text-dashboard-meta text-text-secondary" lang="en">
                  {surface.label}
                </h3>
                <div className="flex flex-wrap gap-sm">
                  <Button data-testid={`btn-${surface.id}-primary`}>{label}</Button>
                  <Button data-testid={`btn-${surface.id}-primary-disabled`} disabled>
                    {label}
                  </Button>
                  <Button data-testid={`btn-${surface.id}-secondary`} variant="secondary">
                    {label}
                  </Button>
                  <Button
                    data-testid={`btn-${surface.id}-secondary-disabled`}
                    variant="secondary"
                    disabled
                  >
                    {label}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </section>
        <section data-testid="gallery-input" className="grid gap-md">
          <h2 className="text-dashboard-title-m" lang="en">
            Input · locale={locale} · Tab to the &quot;focused&quot; field to see the focus state
          </h2>
          {INPUT_SURFACES.map((surface) => (
            <div key={surface.id} className="rounded-lg bg-surface-void-black">
              <div
                data-testid={`input-surface-${surface.id}`}
                className={`grid gap-sm rounded-lg border border-neutral-slate p-lg ${surface.className}`}
              >
                <h3 className="font-mono text-dashboard-meta text-text-secondary" lang="en">
                  {surface.label}
                </h3>
                <div className="flex flex-wrap gap-md">
                  <InputCell state="default">
                    <Input
                      data-testid={`input-${surface.id}-default`}
                      label={copy.name}
                      defaultValue={copy.value}
                    />
                  </InputCell>
                  <InputCell state="focused (Tab here)">
                    <Input
                      data-testid={`input-${surface.id}-focused`}
                      label={copy.name}
                      defaultValue={copy.value}
                    />
                  </InputCell>
                  <InputCell state="placeholder">
                    <Input
                      data-testid={`input-${surface.id}-placeholder`}
                      label={copy.name}
                      placeholder={copy.placeholder}
                    />
                  </InputCell>
                  <InputCell state="error">
                    <Input
                      data-testid={`input-${surface.id}-error`}
                      label={copy.name}
                      error={copy.error}
                    />
                  </InputCell>
                  <InputCell state="disabled">
                    <Input
                      data-testid={`input-${surface.id}-disabled`}
                      label={copy.name}
                      defaultValue={copy.value}
                      disabled
                    />
                  </InputCell>
                  <InputCell state='email · dir="ltr"'>
                    <Input
                      data-testid={`input-${surface.id}-email`}
                      label={copy.email}
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      defaultValue={SAMPLE_EMAIL}
                    />
                  </InputCell>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      {/*
      Outside <main> on purpose: the Button and Input specs count `main button` (24 / 12 / Tab
      order). The Dialog gallery is its own labelled region, so those integrated specs stay valid.
    */}
      <section
        data-testid="gallery-dialog"
        aria-labelledby="gallery-dialog-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-dialog-title" className="text-dashboard-title-m" lang="en">
          Dialog · locale={locale} · Esc, scrim click and the close button close it
        </h2>
        <DialogDemo locale={locale === "en" ? "en" : "ar"} />
      </section>
      <section
        data-testid="gallery-sheet"
        aria-labelledby="gallery-sheet-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-sheet-title" className="text-dashboard-title-m" lang="en">
          Sheet · locale={locale} · Mobile bottom sheet; the options row opens a dialog
        </h2>
        <SheetDemo locale={locale === "en" ? "en" : "ar"} />
      </section>
    </>
  );
}
