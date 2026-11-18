# Phase 06 — `EmptyState` assignment (starter package)

**Status:** DELIVERED / UNDER REVIEW. The starter `munsit-starter-70c821d.zip` reached Mariam (no
separate send date was recorded), and her delivery `munsit-delivery-empty-state-20261118-v1.zip`
was received on 2026-11-18. It is integrated for review on `delivery/phase-06-empty-state-v1`, and
becomes ACCEPTED / INTEGRATED once that PR is merged with CI green. The assignment was authorized
by the product owner on 2026-11-18 (Phase 06 plan D-U4, §10).

---

## 1. Sending checklist (Yousef)

1. Send `munsit-starter-<baseline>.zip`. Its SHA-256 is logged when the handoff is confirmed.
2. Then record:
   - the starter in the `TEAM_COLLABORATION.md` delivery log (date, baseline, "Phase 06
     EmptyState — delegated `EmptyState.tsx`, `EmptyState.test.tsx`");
   - the status in `PROGRESS.md`.

Claude neither creates nor edits the two delegated files while they are delegated, and makes no
commits on Mariam's behalf.

---

## 2. Your task, Mariam

Build **one** shared component, `EmptyState`, with its unit tests. Every module uses it for
"nothing here yet" and "no results" screens. Two variants, `default` and `compact`, both match
verified Figma frames.

| You may change **only**                   | Everything else                                                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/shared/patterns/EmptyState.tsx`      | Do not edit. If you need a change elsewhere (messages, icons, tokens, config), write it as a request in `DELIVERY.md` |
| `src/shared/patterns/EmptyState.test.tsx` | Never install or upgrade packages                                                                                     |

The folder `src/shared/patterns/` does not exist in the starter; creating it for these two files is
expected.

## 3. Exact API (frozen)

```tsx
import type { ReactNode } from "react";
import type { IconName } from "@/design-system/icons/manifest";

export type EmptyStateVariant = "default" | "compact";

export interface EmptyStateProps {
  /** Default "default". */
  variant?: EmptyStateVariant;
  /** Decorative icon in the tile (hidden from assistive technology). */
  icon: IconName;
  /** Visible heading text (module copy). */
  title: string;
  /** Optional supporting sentence (module copy). */
  description?: string;
  /** Up to two actions, passed by the module (for example shared `Button`s). Rendered in order. */
  actions?: ReactNode;
  /** Optional small note under the actions (module copy). */
  footnote?: string;
  /** Heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
}

export function EmptyState(props: EmptyStateProps) {
  /* … */
}
```

- **Props:**
  - no `className`, `children`, `style` or extra props;
  - no state, no effects and no `"use client"`, so it works in Server and Client Components.
- **Copy:** every text comes from props. The component contains no copy of its own.

## 4. Figma (read-only; never edit Figma)

File `Avyn9kL0drXepQyTXTLXXb`. Values are verified and recorded in `docs/design-values.md` §15.3.

| Variant   | Figma source                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | `Shared / Empty State` `2389:4037` (page 08 — My Summaries): `NoSummaries` `2389:4004`, `NoResults` `2389:4017`, `NoLectures` `2389:4027`; used by Notes `2433:7748`–`2433:7796` |
| `compact` | Dashboard `First-Time Empty State` Desktop `2482:2130`, Tablet `2482:2661`, Mobile `2482:3155`                                                                                   |

**About the names:** `compact` is the tighter box (padding 48/32, radius 20). Its icon tile is
nevertheless larger (72) than the default tile (64), exactly as drawn.

## 5. Visual values (FIGMA, verified 2026-11-17)

| Part        | `default`                                                                                                                        | `compact`                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Box         | full width of its container; vertical stack, centred; gap 16 (`gap-md`); padding 56 block / 40 inline; radius 24 (`rounded-2xl`) | same layout; padding 48 block / 32 inline (`py-[48px] px-xl`); radius 20 (`rounded-xl`)       |
| Surface     | `bg-surface-obsidian/88`, 1px `border-accent-electric-sky/12`                                                                    | `bg-surface-obsidian/88`, 1px `border-accent-electric-sky/14`                                 |
| Icon tile   | 64 × 64, radius 18, `bg-accent-electric-sky/12`, 1px `border-accent-electric-sky/25`; icon 28, `text-accent-electric-sky`        | 72 × 72, radius 20, `bg-accent-electric-sky/12`, 1px `border-accent-electric-sky/40`; icon 32 |
| Title       | `text-dashboard-title-l` (Cairo Bold 28/40), `text-text-primary`, centred                                                        | same                                                                                          |
| Description | `text-dashboard-body` (14/22), `text-text-secondary`, centred                                                                    | same                                                                                          |
| Actions     | one row, centred, gap 12 (`gap-sm`); wraps on narrow widths                                                                      | same (Figma shows Primary + Secondary)                                                        |
| Footnote    | `text-dashboard-caption` (12/18), `text-text-secondary`, centred                                                                 | same                                                                                          |
| Mobile      | the box follows its container (Figma 350); text wraps; no horizontal overflow at 320                                             | same                                                                                          |

- **Tokens:** existing ones only. Radius 18, the tints and the tile sizes are local constants (CLAUDE.md).
- **Not allowed:** hex values, new tokens and motion. Figma draws no motion.

## 6. RTL / LTR and accessibility

- **Direction:**
  - logical properties only (`ps-`/`pe-`, `text-start` where needed), never `left`/`right`;
  - the layout is centred, so it is identical in RTL and LTR;
  - the icon is never mirrored.
- **Semantics:**
  - the title is a real heading (`h2` by default, `h3` with `headingLevel={3}`);
  - the icon is decorative (`aria-hidden="true"`, which the shared `Icon` does without `label`);
  - the actions keep their own accessible names;
  - no `role` on the box.
- **Text:** passes AA. Title white and body Text/Secondary on Obsidian were already measured in
  Phase 02.
- **Behaviour:** no focus trap and no auto-focus. It is content, not an overlay.

## 7. Unit-test acceptance criteria (`EmptyState.test.tsx`)

All of the following must pass:

1. **`default`:** the box, surface, tile and text classes match §5 (`default` column).
2. **`compact`:** its classes match §5 (`compact` column), and none of the `default`-only values
   are present (and vice versa).
3. **Heading:** the title renders as `h2`, or `h3` with `headingLevel={3}`, with the exact text.
4. **Optional parts:** with `description`, `actions` or `footnote` omitted, nothing renders for
   them (no empty elements). With them, they render in the order icon, title, description,
   actions, footnote.
5. **Actions:** zero, one or two passed buttons render, in order, inside the actions row.
6. **Icon:** the `svg` has `data-icon` equal to the prop, width 28 (`default`) or 32
   (`compact`), and `aria-hidden="true"`.
7. **Compile-time API:** `// @ts-expect-error` for an unknown `variant`, a missing `title`,
   `children`, `className`, and an unknown icon.
8. **Hygiene:** no hover or pressed state, no transform, no hex value, no physical left/right
   class.
9. **jest-axe:** in `ar` (RTL) and `en` (LTR), for both variants, asserted as
   `expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([])`.
10. **Checks:** `corepack pnpm check` passes on your copy.

## 8. Branch and delivery workflow (offline; `TEAM_COLLABORATION.md` §4–§5)

1. Unzip the starter into an empty folder, then:

   ```bash
   corepack pnpm install
   git init -b baseline && git add -A && git commit -m "baseline <short hash>"
   git switch -c work
   ```

   These branches are local only; nothing is pushed.

2. Implement the two files on `work`. Run `corepack pnpm check`.
3. Deliver `munsit-delivery-empty-state-<YYYYMMDD>-v1.zip`, containing:
   - `DELIVERY.md` with the full baseline hash from `BASELINE_COMMIT.txt`;
   - `files/` with exactly the two files;
   - `delivery.patch` (`git diff baseline..work`);
   - `pnpm check` output;
   - screenshots if you used a scratch page. Do not commit the scratch page.
4. **Never include:** `node_modules/`, `.next/`, `.env*`, caches or credentials.

## 9. Integration and Definition of Done (Yousef)

1. Branch `delivery/shared-empty-state-v1` from the recorded baseline.
2. Apply the patch only, and check that `git status` lists exactly the two files.
3. Commit the delivery on its own, then rebase onto `main`.
4. Add the dev-gallery section and E2E (computed Figma values at 1440/768/390/320, RTL and LTR,
   rendered contrast, axe) in a separate commit.
5. Merge through a PR with CI green, using a rebase merge to keep the delivery commit.

**Definition of Done:**

- The two files are merged unchanged, or with documented, reviewed fixes.
- Every §7 criterion passes, plus the integration E2E.
- No other file was changed by the delivery.
