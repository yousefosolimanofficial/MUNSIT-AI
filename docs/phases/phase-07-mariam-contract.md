# Phase 07 — Mariam assignment contract: Features and How It Works (DRAFT)

- **Status:** **DRAFT. Not sent.** The assignment is approved (P07-D13). The starter package is
  created and sent only when both conditions hold:
  1. Increment 1 (Landing foundation) is merged on `main` and becomes the baseline commit;
  2. the owner approves the Feature Card and Step Card specifications below.
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

## 4. Figma specification (to be approved before the starter is sent)

### 4.1 Feature Card `114:2`

| Part        | Value                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box         | Ink `#07080a` fill, 1px `#363739` border (Landing-local, as the nav), radius 16, padding 24, vertical gap 12                                                    |
| Visual      | Full width × 144, radius 12, Obsidian `#111214` behind the image (Desktop 336 × 144)                                                                            |
| Title       | `Landing/Card/Title`: SemiBold 20 / 130%, white, aligned to the inline start                                                                                    |
| Description | `Landing/Body/Feature Desktop`: 18 / 145%, Text/Secondary `#9c9c9d`, inline start; Tablet and Mobile sizes to verify (`Feature Tablet` 16, `Feature Mobile` 15) |
| Size        | Desktop 384 × 300; Tablet 342 × 288; Mobile 350 × 286                                                                                                           |

### 4.2 Step Card `121:32`

| Part       | Value                                                                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Box        | Ink fill, 1px Slate `#2f3031` border, radius 16, padding 20, vertical gap 12                                                                                                                                                            |
| Number row | Horizontal, gap 8, aligned to the inline start: number `Landing/Mono/Step` (Geist Mono 14, Electric Sky `#63a1ff`); connector line 1px Info Blue `#56c2ff` (fills the row) ending in a 6 × 6 Info Blue dot (shown when `showConnector`) |
| Visual     | Full width × 136, radius 12, Obsidian behind the image (Desktop 240 × 136)                                                                                                                                                              |
| Title      | `Landing/Card/Title`: SemiBold 20 / 130%, white                                                                                                                                                                                         |
| Text       | `Landing/Body/Large`: 18 / 150%, Text/Secondary                                                                                                                                                                                         |
| Size       | Desktop 282 × 440; Tablet 342 × 302; Mobile 350 × 300                                                                                                                                                                                   |

### 4.3 Sections

| Breakpoint    | Features                                                                                                                                                     | How It Works                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Desktop (xl+) | Width 1200, padding block 64, gap 40; intro 900 wide (heading `Section Desktop` 40, description `Body/Intro` 24, white, centred, gap 16); grid 3 × 2, gap 24 | As Features, gap 48; 4 cards in one row, gap 24 |
| Tablet (rail) | Padding 64 / 32, gap 32; intro 704 (heading `Section Tablet` 32, description `Body/Large` 18); 2 per row, 3 rows, gap 20                                     | As Features; 2 × 2, gap 20                      |
| Mobile        | Padding 48 / 20, gap 28; intro 350 (heading `Section Mobile` 26, description `Body/Base Mobile` 15); 1 column, gap 16                                        | As Features; 1 column, gap 16                   |

**Order (RTL):**

- **Features:** card 01 at the inline start (right).
- **How It Works:** step 01 at the inline start; Figma Desktop draws 01 at the right.

LTR mirrors both.

**Tokens:** all typography utilities exist since Increment 1 (`typography-landing.css`). The
colours are existing tokens, plus the Landing-local `#363739` border (approved). No new token.

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

## 6. Open points before sending

- **Card text sizes:** Tablet and Mobile description sizes inside the cards are read per instance
  when the contract is finalized.
- **Image `alt` text:** decided per image at integration (decorative or descriptive, from approved
  copy).
- **Baseline commit hash:** recorded in `DELIVERY.md` when the starter is made.
