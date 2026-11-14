import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Button } from "@/shared/ui/Button";

/*
 * TEMPORARY internal component gallery (Phase 03, P-5). Not a product screen; English headings
 * are developer notes. Returns 404 in production builds. Remove before Phase 22.
 *
 * Button: Primary and Secondary, enabled and disabled, on the six allowed surfaces
 * (contract §12.2). Hover, Pressed and Focus-visible are live interaction states. Ember Hush is
 * deliberately absent: the Secondary Button is not allowed there.
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

export default async function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const locale = await getLocale();
  const label = locale === "en" ? LABELS.en : LABELS.ar;

  return (
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
    </main>
  );
}
