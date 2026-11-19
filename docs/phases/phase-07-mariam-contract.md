# Phase 07 — Mariam assignment contract: Features and How It Works (DRAFT)

- **Status:** **APPROVED** (owner, 2026-11-19). The Feature Card and Step Card specifications in
  §4 are approved, and the assignment scope is unchanged (P07-D13). The starter package is
  prepared from the verified `main` after this record merges. It is **not sent** by Claude: Yousef
  sends it.
- **Ownership:**
  - **Mariam writes:** the files in §2.
  - **Yousef provides:** the route, the copy wiring, the images, the tokens and all integration.
  - **Git:** Yousef is the Git author and integrator ([TEAM_COLLABORATION.md](../TEAM_COLLABORATION.md)).
- **Sources:**
  - Figma (read-only, 2026-11-19): Feature Card `114:2`, Step Card `121:32`; sections Desktop
    `114:6` / `121:40`, Tablet `200:591` / `200:605`, Mobile `200:745` / `200:756`;
  - [design-values §16](../design-values.md);
  - [copy](phase-07-landing-copy.md) §4–§5;
  - [plan](phase-07-plan.md) §8.

## 1. Scope

Two sections of the Landing, in the approved order (after the Showcase, before Use Cases):

- **Features** (`#features`): intro and 6 feature cards.
- **How It Works** (`#how-it-works`): intro and 4 step cards.

**Not in scope:**

- **Other parts of the page:** the page itself, the header and footer, other sections, the
  section anchors (they exist already).
- **Shared infrastructure:** messages, tokens, shared or design-system files, image export,
  routes, configuration, dependencies.

## 2. File boundaries (only these)

```
src/features/landing/components/FeatureCard.tsx
src/features/landing/components/FeaturesSection.tsx
src/features/landing/components/StepCard.tsx
src/features/landing/components/HowItWorksSection.tsx
src/features/landing/components/FeatureCard.test.tsx
src/features/landing/components/StepCard.test.tsx
src/features/landing/components/FeaturesSection.test.tsx
src/features/landing/components/HowItWorksSection.test.tsx
```

Anything else needed (a token, a message key, an image, a shared change) is written as a request
in `DELIVERY.md`. No packages are installed.

## 3. Component interfaces (Server Components, no copy inside)

```ts
export interface LandingImage {
  src: string; // provided by Yousef (exported from Figma)
  alt: string; // module copy; "" when decorative (decided per image at integration)
}

export interface FeatureCardProps {
  title: string;
  text: string; // may contain "\n" (Figma line breaks): render with white-space: pre-line
  visual: LandingImage;
}

export interface FeaturesSectionProps {
  heading: string;
  description: string; // contains "\n"
  items: readonly FeatureCardProps[]; // 6, in Figma order
}

export interface StepCardProps {
  number: string; // "01"–"04", LTR, Geist Mono
  title: string;
  text: string;
  visual: LandingImage;
  showConnector?: boolean; // Figma property "Show Connector" (default true)
}

export interface HowItWorksSectionProps {
  heading: string;
  description: string;
  steps: readonly StepCardProps[]; // 4, in reading order 01 → 04
}
```

**Semantics:**

- each section heading is an `h2`, and each card title an `h3`;
- the cards are a list (`ul` / `li`);
- the sections render **inside** the existing `<section id>` boundaries (`LandingPage`), so they
  do not set `id`s themselves.

## 4. Figma specification (APPROVED, 2026-11-19)

Read-only from the component masters and their Tablet and Mobile instances (2026-11-19). All
typography utilities exist (`typography-landing.css`, Increment 1). The colours are tokens, plus
the Landing-local `#363739` (approved).

### 4.1 Feature Card (master `114:2`)

| Part        | Desktop                                                                                                 | Tablet                                         | Mobile                                         |
| ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Card size   | **384 × 300**                                                                                           | **342 × 288**                                  | **350 × 286**                                  |
| Box         | Ink `#07080a` fill; 1px `#363739` border; radius 16; padding 24; vertical gap 12                        | Same                                           | Same                                           |
| Visual      | 336 × 144, radius 12, Obsidian `#111214` behind the image                                               | 294 × 144                                      | 302 × 144                                      |
| Title       | `text-landing-card-title` (20 / 1.3, 600), white, inline start                                          | Same                                           | Same                                           |
| Description | `text-landing-body-feature-desktop` (18 / 1.45, 400), Text/Secondary `#9c9c9d`, `white-space: pre-line` | `text-landing-body-feature-tablet` (16 / 1.45) | `text-landing-body-feature-mobile` (15 / 1.45) |

Order inside the card: visual, title, description. The visual fills the width, and the height
follows the content (Figma heights come from the text).

### 4.2 Step Card (master `121:32`, properties Number, Title, Description, Show Connector)

| Part        | Desktop                                                                                                                                                                                                                                                                | Tablet                              | Mobile                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| Card size   | **282 × 440**                                                                                                                                                                                                                                                          | **342 × 302**                       | **350 × 300**                              |
| Box         | Ink fill; 1px Slate `#2f3031` border; radius 16; padding 20; vertical gap 12                                                                                                                                                                                           | Same                                | Same                                       |
| Number row  | Full width × 14, horizontal, gap 8, at the inline start: number (`font-mono text-landing-mono-step`, 14 / 1, Electric Sky `#63a1ff`, LTR), connector line 1px Info Blue `#56c2ff` filling the row, then a 6 × 6 Info Blue dot (line and dot only when `showConnector`) | Row 300 wide                        | Row 308 wide                               |
| Visual      | 240 × 136, radius 12, Obsidian behind the image                                                                                                                                                                                                                        | 300 × 136                           | 308 × 136                                  |
| Title       | `text-landing-card-title` (20 / 1.3, 600), white                                                                                                                                                                                                                       | Same                                | Same                                       |
| Description | `text-landing-body-large` (18 / 1.5), Text/Secondary                                                                                                                                                                                                                   | `text-landing-body-base` (16 / 1.5) | `text-landing-body-base-mobile` (15 / 1.5) |

The Desktop Step Card is taller (440) because the four cards share one row and their text wraps
in 240.

### 4.3 Sections and grids

| Breakpoint    | Features                                                                                                                                                                     | How It Works                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Desktop (xl+) | Content 1200; padding block 64; gap 40. Intro 900, gap 16: heading `section-desktop` (40 / 1.2), description `body-intro` (24 / 1.5), white, centred. Grid **3 × 2**, gap 24 | Same, gap 48; **4 in one row**, gap 24 |
| Tablet (rail) | Padding 64 / 32; gap 32. Intro 704: heading `section-tablet` (32), description `body-large` (18). Grid **2 per row, 3 rows**, gap 20                                         | Same; **2 × 2**, gap 20                |
| Mobile        | Padding 48 / 20; gap 28. Intro 350: heading `section-mobile` (26), description `body-base-mobile` (15). **1 column**, gap 16                                                 | Same; **1 column**, gap 16             |

**Order:** card or step 01 at the inline start (right in RTL), in reading order; LTR mirrors it.
Figma Tablet rows confirm it (row 01: card 02 drawn at left, 01 at right).

### 4.4 Images

- **Assets:** six feature visuals and four step visuals, each 1376 × 768 in Figma. **Yousef**
  exports them as WebP or AVIF and passes them as `LandingImage` props. Mariam never exports or
  adds image files.
- **Rendering:** `next/image`, `fill` with `object-fit: cover` inside the visual box (Figma
  `FILL`); `sizes` from §4.1 and §4.2.
- **`alt`:** from props, decided at integration.

## 5. Test expectations (her files)

- **Unit (Vitest and Testing Library, jsdom):**
  - the props render in order;
  - `h2` and `h3` levels;
  - list semantics;
  - "\n" is kept (pre-line);
  - the connector is hidden when `showConnector` is false;
  - images have the given `alt`;
  - no hard-coded copy (rendering with English props shows no Arabic);
  - axe passes with Arabic and English props.
- **Integration (Yousef):** E2E geometry at 1440 / 768 / 390, ar and en, no overflow at 320, and
  screenshot comparison per breakpoint.

## 6. Before sending

- **Owner approval** of §4: done (2026-11-19).
- **Starter package:** made with `git archive` from the merged baseline, and logged in
  TEAM_COLLABORATION.md. The baseline commit hash goes into `DELIVERY.md`.
- **Image `alt` text:** decided per image at integration (decorative or descriptive, from
  approved copy).
