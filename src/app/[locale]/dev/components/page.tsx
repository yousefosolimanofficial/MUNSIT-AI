import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getShellLabels } from "@/shared/layout/shell-labels";
import { EmptyState } from "@/shared/patterns/EmptyState";
import { Avatar, type AvatarSize } from "@/shared/ui/Avatar";
import { StatusBadge, type StatusBadgeStatus } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Ltr } from "@/shared/ui/Ltr";
import { NavigationIconButton } from "@/shared/ui/NavigationIconButton";
import { Tab, TabList, TabPanel, Tabs, type TabsSize } from "@/shared/ui/Tabs";
import type { IconName } from "@/design-system/icons/manifest";

import { DialogDemo } from "./_components/DialogDemo";
import { MoreSheetDemo } from "./_components/MoreSheetDemo";
import { NavigationIconButtonDemo } from "./_components/NavigationIconButtonDemo";
import { PopoverMenuDemo } from "./_components/PopoverMenuDemo";
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
 *
 * Popover / Menu: context menu (its Delete opens a dialog), Sort radio menu, account menu with a
 * header slot, a Notifications-style popover, and menus inside a Dialog and a Sheet. Client demo
 * in `_components/PopoverMenuDemo.tsx`; also outside <main>.
 *
 * Avatar: both sizes with initials, image, broken image (falls back to initials) and the
 * placeholder; outside <main> like the overlay sections.
 *
 * Navigation Icon Button (O-8, Phase 05): Rail-style links (active, default, disabled) and actions
 * (expanded toggle, activation counter, disabled, 44 mobile size); outside <main> (it has buttons).
 *
 * Card: `surface` at both paddings and `inset` rows nested in a `surface` (Recent Lectures
 * pattern: the row's action is the inner Button, never the card). Status Badge: the four
 * statuses on the page, on a `surface` and on an `inset`. Tabs: `default` (Desktop), `compact`
 * in one row (Tablet) and in the 2 × 3 grid (Mobile), and the disabled list. All three sit
 * outside <main> because they contain buttons.
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

/**
 * Avatar samples (contract docs/phases/phase-03-avatar-contract.md). The image is an inline SVG
 * (no network); the broken image is an invalid data URI that fires `error`. Names: Figma
 * "أحمد محمود" (Top Bar / User Menu) and English counterparts.
 */
const AVATAR_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Crect width='2' height='2' fill='%2359d499'/%3E%3Crect width='1' height='1' fill='%23ff6363'/%3E%3C/svg%3E";
const AVATAR_BROKEN = "data:image/png;base64,AAAA";
const AVATAR_SAMPLES: readonly {
  id: string;
  size: AvatarSize;
  ar: string;
  en: string;
  src?: string;
  decorative?: boolean;
}[] = [
  { id: "initials-40", size: 40, ar: "أحمد محمود", en: "Ahmed Mahmoud" },
  { id: "initials-96", size: 96, ar: "أحمد محمود", en: "Ahmed Mahmoud" },
  { id: "image-40", size: 40, ar: "أحمد محمود", en: "Ahmed Mahmoud", src: AVATAR_IMAGE },
  { id: "image-96", size: 96, ar: "أحمد محمود", en: "Ahmed Mahmoud", src: AVATAR_IMAGE },
  { id: "broken-96", size: 96, ar: "سارة علي", en: "Sara Ali", src: AVATAR_BROKEN },
  { id: "placeholder-40", size: 40, ar: "", en: "", decorative: true },
  { id: "placeholder-96", size: 96, ar: "", en: "", decorative: true },
];

/** Card copy: Figma Dashboard titles; the row titles are sample data. English for LTR. */
/**
 * EmptyState gallery samples (Phase 06, Mariam delivery v1). Arabic is Figma copy: `default` =
 * Notes `NoNotes` (`2433:7748`, instance of `Shared / Empty State` `2389:4037`), `compact` =
 * Dashboard First-Time (`2482:2130`). English is a dev-only gallery sample, not product copy.
 */
const EMPTY_COPY = {
  ar: {
    defaultTitle: "لسه مفيش ملاحظات هنا!",
    defaultText: "ابدأ اكتب أول ملاحظة، وخلي كل أفكارك المهمة في مكان واحد.",
    defaultAction: "إنشاء ملاحظة",
    compactTitle: "لسه رحلتك مع مُنصت بتبدأ!",
    compactText: "ارفع أول محاضرة وابدأ حوّل مذاكرتك لتجربة أذكى وأسهل.",
    compactPrimary: "إضافة أول محاضرة",
    compactSecondary: "تسجيل محاضرة مباشرة",
    compactNote: "تقدر ترفع تسجيل صوتي أو ملف PDF",
    minimalTitle: "مفيش نتائج",
  },
  en: {
    defaultTitle: "No notes here yet!",
    defaultText: "Write your first note and keep all your important ideas in one place.",
    defaultAction: "Create note",
    compactTitle: "Your journey with Munsit is just starting!",
    compactText: "Upload your first lecture and make studying smarter and easier.",
    compactPrimary: "Add first lecture",
    compactSecondary: "Record a live lecture",
    compactNote: "You can upload an audio recording or a PDF file",
    minimalTitle: "No results",
  },
} as const;

const CARD_COPY = {
  ar: {
    activity: "النشاط الأخير",
    lectures: "المحاضرات الأخيرة",
    rows: ["مقدمة في الخوارزميات", "هياكل البيانات"],
    open: "فتح",
    body: "محتوى البطاقة يحدده المكان الذي تُستخدم فيه.",
  },
  en: {
    activity: "Recent activity",
    lectures: "Recent lectures",
    rows: ["Introduction to algorithms", "Data structures"],
    open: "Open",
    body: "The caller decides the card's content and layout.",
  },
} as const;

/** Status Badge labels: Figma `Status Badge` 2258:1026 (contract §1); English for LTR. */
const BADGE_LABELS: Record<StatusBadgeStatus, { ar: string; en: string }> = {
  ready: { ar: "جاهزة", en: "Ready" },
  processing: { ar: "قيد المعالجة", en: "Processing" },
  pending: { ar: "في الانتظار", en: "Pending" },
  failed: { ar: "فشلت المعالجة", en: "Processing failed" },
};
const BADGE_STATUSES = ["ready", "processing", "pending", "failed"] as const;

/**
 * Lecture tool tabs: Figma `Lecture Tabs` (instance of `Lecture Tab` 2278:322), labels and icons
 * in inline order from the start; "التفريغ النصي" is the active tab in Figma. English for LTR.
 */
const LECTURE_TOOLS: readonly { value: string; icon: IconName; ar: string; en: string }[] = [
  { value: "transcript", icon: "fileText", ar: "التفريغ النصي", en: "Transcript" },
  { value: "summary", icon: "sparkles", ar: "الملخص الذكي", en: "Smart summary" },
  { value: "key-points", icon: "lightbulb", ar: "المعلومات المهمة", en: "Key points" },
  { value: "questions", icon: "help", ar: "الأسئلة", en: "Questions" },
  { value: "notes", icon: "note", ar: "الملاحظات", en: "Notes" },
  { value: "slides", icon: "slides", ar: "شرائح المحاضرة", en: "Lecture slides" },
];

/**
 * Tabs samples (contract §2.4, D-T3): the page picks the size and the Mobile grid, so each sample
 * is shown only from the width it is designed for (`visibility`): `default` is the Desktop row
 * (six tabs do not fit a phone), the compact row is the Tablet layout, the 2 × 3 grid is Mobile
 * and fits every width. The disabled list uses the grid so it is checked at every width.
 */
const TABS_GRID = "grid grid-cols-3 gap-[8px]";
const TABS_SAMPLES: readonly {
  id: string;
  size: TabsSize;
  visibility: string;
  listClassName?: string;
  disabled?: boolean;
}[] = [
  { id: "default", size: "default", visibility: "hidden lg:grid" },
  { id: "compact-row", size: "compact", visibility: "hidden md:grid" },
  { id: "compact-grid", size: "compact", visibility: "grid", listClassName: TABS_GRID },
  { id: "disabled", size: "compact", visibility: "grid", listClassName: TABS_GRID, disabled: true },
];

export default async function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const locale = await getLocale();
  const [tNav, tShell, shellLabels] = await Promise.all([
    getTranslations("nav"),
    getTranslations("shell"),
    getShellLabels(),
  ]);
  const label = locale === "en" ? LABELS.en : LABELS.ar;
  const copy = locale === "en" ? INPUT_COPY.en : INPUT_COPY.ar;
  const cardCopy = locale === "en" ? CARD_COPY.en : CARD_COPY.ar;
  const emptyCopy = locale === "en" ? EMPTY_COPY.en : EMPTY_COPY.ar;
  const badgeLabel = (status: StatusBadgeStatus) =>
    BADGE_LABELS[status][locale === "en" ? "en" : "ar"];

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
      {/* Outside <main> as well: its actions are Buttons (see the comment above). */}
      <section
        data-testid="gallery-empty-state"
        aria-labelledby="gallery-empty-state-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-empty-state-title" className="text-dashboard-title-m" lang="en">
          EmptyState (Phase 06, Mariam delivery v1) · default · compact · minimal
        </h2>
        <div data-testid="empty-default">
          <EmptyState
            icon="note"
            title={emptyCopy.defaultTitle}
            description={emptyCopy.defaultText}
            actions={<Button>{emptyCopy.defaultAction}</Button>}
            headingLevel={3}
          />
        </div>
        <div data-testid="empty-compact">
          <EmptyState
            variant="compact"
            icon="upload"
            title={emptyCopy.compactTitle}
            description={emptyCopy.compactText}
            actions={
              <>
                <Button>{emptyCopy.compactPrimary}</Button>
                <Button variant="secondary">{emptyCopy.compactSecondary}</Button>
              </>
            }
            footnote={emptyCopy.compactNote}
            headingLevel={3}
          />
        </div>
        <div data-testid="empty-minimal">
          <EmptyState icon="search" title={emptyCopy.minimalTitle} headingLevel={3} />
        </div>
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
      <section
        data-testid="gallery-popover-menu"
        aria-labelledby="gallery-popover-menu-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-popover-menu-title" className="text-dashboard-title-m" lang="en">
          Popover / Menu · locale={locale} · Esc, outside click and Tab close them
        </h2>
        <PopoverMenuDemo locale={locale === "en" ? "en" : "ar"} />
      </section>
      <section
        data-testid="gallery-avatar"
        aria-labelledby="gallery-avatar-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-avatar-title" className="text-dashboard-title-m" lang="en">
          Avatar · locale={locale} · 40 and 96: initials, image, broken image, placeholder
        </h2>
        <div className="flex flex-wrap items-center gap-md">
          {AVATAR_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              data-testid={`avatar-${sample.id}`}
              className="grid justify-items-center gap-xs"
            >
              {sample.decorative ? (
                <Avatar decorative size={sample.size} />
              ) : (
                <Avatar
                  name={locale === "en" ? sample.en : sample.ar}
                  size={sample.size}
                  {...(sample.src === undefined ? {} : { src: sample.src })}
                />
              )}
              <span className="font-mono text-dashboard-meta text-text-secondary" lang="en">
                <Ltr>{sample.id}</Ltr>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section
        data-testid="gallery-card"
        aria-labelledby="gallery-card-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-card-title" className="text-dashboard-title-m" lang="en">
          Card · locale={locale} · surface (padding lg / md) and inset rows inside a surface
        </h2>
        <div className="grid gap-md md:grid-cols-2">
          <Card
            as="section"
            data-testid="card-surface-lg"
            aria-labelledby="card-activity-title"
            className="grid content-start gap-md"
          >
            <h3 id="card-activity-title" className="text-dashboard-title-m">
              {cardCopy.activity}
            </h3>
            <p className="text-dashboard-body text-text-secondary">{cardCopy.body}</p>
            <p className="text-dashboard-meta text-text-muted-readable">{cardCopy.body}</p>
          </Card>
          <Card
            as="section"
            padding="md"
            data-testid="card-surface-md"
            aria-labelledby="card-lectures-title"
            className="grid content-start gap-[10px]"
          >
            <h3 id="card-lectures-title" className="text-dashboard-title-m">
              {cardCopy.lectures}
            </h3>
            <ul className="grid gap-[10px]">
              {cardCopy.rows.map((title, index) => (
                <Card
                  key={title}
                  as="li"
                  variant="inset"
                  data-testid={`card-inset-${index}`}
                  className="flex flex-wrap items-center justify-between gap-md"
                >
                  <span className="grid min-w-0 gap-xs">
                    <span className="text-dashboard-body-medium">{title}</span>
                    <StatusBadge status={index === 0 ? "ready" : "processing"} className="w-fit">
                      {badgeLabel(index === 0 ? "ready" : "processing")}
                    </StatusBadge>
                  </span>
                  <Button variant="secondary">{cardCopy.open}</Button>
                </Card>
              ))}
            </ul>
          </Card>
        </div>
      </section>
      <section
        data-testid="gallery-badge"
        aria-labelledby="gallery-badge-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-badge-title" className="text-dashboard-title-m" lang="en">
          Status Badge · locale={locale} · four statuses on the page, a surface and an inset
        </h2>
        {(["page", "surface", "inset"] as const).map((context) => {
          const badges = BADGE_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} data-testid={`badge-${context}-${status}`}>
              {badgeLabel(status)}
            </StatusBadge>
          ));
          const row = <div className="flex flex-wrap gap-sm">{badges}</div>;
          return (
            <div key={context} className="grid gap-xs">
              <span className="font-mono text-dashboard-meta text-text-secondary" lang="en">
                <Ltr>{context}</Ltr>
              </span>
              {context === "page" ? (
                row
              ) : context === "surface" ? (
                <Card>{row}</Card>
              ) : (
                <Card>
                  <Card variant="inset">{row}</Card>
                </Card>
              )}
            </div>
          );
        })}
      </section>
      <section
        data-testid="gallery-tabs"
        aria-labelledby="gallery-tabs-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-tabs-title" className="text-dashboard-title-m" lang="en">
          Tabs · locale={locale} · default (lg+), compact row (md+), compact 2 × 3 grid, disabled
        </h2>
        {TABS_SAMPLES.map((sample) => (
          <div
            key={sample.id}
            data-testid={`tabs-${sample.id}`}
            className={`${sample.visibility} gap-xs`}
          >
            <span className="font-mono text-dashboard-meta text-text-secondary" lang="en">
              <Ltr>{sample.id}</Ltr>
            </span>
            <Tabs
              label={`${locale === "en" ? "Lecture tools" : "أدوات المحاضرة"} (${sample.id})`}
              size={sample.size}
              defaultValue="transcript"
              className="grid gap-md"
              {...(sample.disabled ? { disabled: true } : {})}
            >
              <TabList {...(sample.listClassName ? { className: sample.listClassName } : {})}>
                {LECTURE_TOOLS.map((tool) => (
                  <Tab key={tool.value} value={tool.value} icon={tool.icon}>
                    {locale === "en" ? tool.en : tool.ar}
                  </Tab>
                ))}
              </TabList>
              {LECTURE_TOOLS.map((tool) => (
                <TabPanel key={tool.value} value={tool.value}>
                  <Card variant="inset" className="text-dashboard-body text-text-secondary">
                    {locale === "en" ? tool.en : tool.ar}
                  </Card>
                </TabPanel>
              ))}
            </Tabs>
          </div>
        ))}
      </section>
      <section
        data-testid="gallery-nib"
        aria-labelledby="gallery-nib-title"
        className="grid gap-md p-lg pt-0"
      >
        <h2 id="gallery-nib-title" className="text-dashboard-title-m" lang="en">
          Navigation Icon Button · locale={locale} · links (default, active, disabled) and actions
          (md 40 / lg 44, expanded, disabled); hover, press and Tab for live states
        </h2>
        <nav aria-label="Rail link samples" className="flex flex-wrap items-center gap-[10px]">
          <NavigationIconButton
            data-testid="nib-link-active"
            icon="home"
            label={tNav("destinations.dashboard")}
            href="/dashboard"
            active
          />
          <NavigationIconButton
            data-testid="nib-link"
            icon="book"
            label={tNav("destinations.lectures")}
            href="/lectures"
          />
          <NavigationIconButton
            data-testid="nib-link-disabled"
            icon="crown"
            label={tNav("moreExtras.upgradePlan")}
            href="/settings/subscription"
            disabled
          />
        </nav>
        <NavigationIconButtonDemo
          labels={{
            openMenu: tShell("openMenu"),
            notifications: tShell("notifications"),
            search: tShell("search"),
          }}
        />
      </section>
      <section
        data-testid="gallery-more-sheet"
        aria-labelledby="gallery-more-sheet-title"
        className="grid justify-items-start gap-md p-lg pt-0"
      >
        <h2 id="gallery-more-sheet-title" className="text-dashboard-title-m" lang="en">
          Mobile More sheet · locale={locale} · registry rows, language row, upgrade (opened here by
          a sample button; in the product by the bottom navigation&apos;s More control)
        </h2>
        <MoreSheetDemo labels={shellLabels} />
      </section>
    </>
  );
}
