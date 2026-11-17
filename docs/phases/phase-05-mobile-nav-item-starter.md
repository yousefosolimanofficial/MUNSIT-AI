# Phase 05 — `MobileNavItem` assignment (starter package, final)

**Status:** ACCEPTED / INTEGRATED (2026-11-17). Mariam's delivery
`munsit-delivery-mobile-nav-item-20261117-v1.zip` was received on 2026-11-17 and integrated
without source changes through PR #35 (rebase merge). Her delivery commit is `d364d58`, and the
`BottomNav` integration is `6c47e35`; CI is green on `main`. The assignment below was authorized
by the product owner on 2026-11-17.
The starter `munsit-starter-9abe1c0.zip` (baseline `9abe1c0`, SHA-256
`205bbdc72f90b1cb0f7069530ea661e8f6c908001844ab1969c13c7a2facb634`) was sent to Mariam; delivery
confirmed by Yousef on 2026-11-17. Not complete until her delivery is received, reviewed and its
tests pass. (The starter's `START_HERE.md` is this document as sent, before this status line.)

- **Reviewed against `main` `9abe1c0` on 2026-11-17**, after PR #32:
  - **API inputs:** O-8 (`0404c6e`) is merged; `DestinationPath` is in
    `src/shared/layout/shell-model.ts`; `ICON_SIZES.mobileNav` is 22.
  - **Registry contract:** unchanged since Phase 04. `git diff 9888e08 9abe1c0` over
    `src/shared/navigation` and `src/i18n/routes.ts` is empty, so `DESTINATIONS`, `MORE_CONTROL`
    and `mobileBarIndicator` are as approved.
  - **API frozen:** §3 below, approved with this authorization.
  - Neither delegated file exists on `main`.
- **Sources:**
  - Phase 05 plan §21.1.
  - Figma, re-checked read-only on 2026-11-17.
  - The procedure in [TEAM_COLLABORATION.md](../TEAM_COLLABORATION.md) and
    [FEATURE_DELIVERY_CHECKLIST.md](../FEATURE_DELIVERY_CHECKLIST.md).
- **Integration dependency:** `BottomNav` and the shell wiring of the More sheet (built in the
  mobile navigation increment) wait for this delivery.

## 1. Sending checklist (Yousef)

1. Send the prepared starter `munsit-starter-9abe1c0.zip`. It contains the tracked files at
   `9abe1c0`, plus `BASELINE_COMMIT.txt` and this document as `START_HERE.md`. Alternatively,
   rebuild it with `TEAM_COLLABORATION.md` §4.
2. After sending, record:
   - the assignment in `docs/PROGRESS.md` (module assignments);
   - the starter in the `TEAM_COLLABORATION.md` delivery log (date, `9abe1c0`, "Phase 05
     MobileNavItem — delegated `MobileNavItem.tsx`, `MobileNavItem.test.tsx`").

Claude neither creates nor edits the two delegated files while they are delegated, and makes no
commits on Mariam's behalf. `BottomNav` is built only after this delivery is integrated.

---

## 2. Your task, Mariam

Build **one** shared component: `MobileNavItem`, one item of the mobile bottom navigation, with its
unit tests.

| You may change **only**                    | Everything else                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/layout/MobileNavItem.tsx`      | Do not edit. If you need a change elsewhere (messages, registry, tokens, config), write it as a request in `DELIVERY.md` |
| `src/shared/layout/MobileNavItem.test.tsx` | Never install or upgrade packages                                                                                        |

`BottomNav` (the bar that lays out four items) is **not** part of your task. Yousef's integration
builds it on top of your component.

## 3. Exact API (frozen)

```tsx
import type { IconName } from "@/design-system/icons/manifest";

import type { DestinationPath } from "./shell-model";

export type MobileNavItemProps =
  | { kind: "destination"; icon: IconName; label: string; href: DestinationPath; active: boolean }
  | {
      kind: "more";
      icon: "more";
      label: string;
      onOpen: () => void;
      expanded: boolean;
      containsActive: boolean;
    };

export function MobileNavItem(props: MobileNavItemProps): React.JSX.Element;
```

- **`kind: "destination"`** renders the locale-aware `Link` from `@/i18n/navigation`, never
  `next/link`. Set `aria-current="page"` only when `active` is true.
- **`kind: "more"`** renders `<button type="button">` with `aria-haspopup="dialog"` and
  `aria-expanded={expanded}`, and calls `onOpen` on activation. It **never** has `aria-current`,
  because More is not a destination (decision D-R6). `containsActive` only switches it to the
  Active **look**; `BottomNav` sets it from `mobileBarIndicator()`.
- **No other props:** no `children`, `className`, `role`, `tabIndex`, `variant` or `size`. Mixing
  the two kinds must be a type error.
- **Rendering:**
  - The component must work as a Client Component child (`BottomNav` is client-side), and needs
    no state of its own.
  - Follow the pattern of `src/shared/ui/NavigationIconButton.tsx`: a discriminated union, and
    `ref` destructured in the signature if you add one. No `ref` prop is required.

## 4. Figma (read-only; never edit Figma)

File key: `Avyn9kL0drXepQyTXTLXXb`.

| Node                                | What it is                                                               |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `Mobile Navigation Item` `2210:302` | The component set: `State=Default` `2210:290`, `State=Active` `2210:296` |
| `Bottom Navigation` `2238:1187`     | In Dashboard Mobile `2238:741`: four items, Active = الرئيسية            |

## 5. Visual states (FIGMA, verified 2026-11-17)

| Property | Default (`2210:290`)                                          | Active (`2210:296`)                 |
| -------- | ------------------------------------------------------------- | ----------------------------------- |
| Box      | 76 × 60, radius 14, padding 8, vertical stack, gap 4, centred | same                                |
| Fill     | none                                                          | Electric Sky 12%                    |
| Border   | none                                                          | none                                |
| Icon     | 22, Text/Secondary `#9c9c9d`                                  | 22, Electric Sky `#63a1ff`          |
| Label    | Cairo Regular 12 / 18, Text/Secondary                         | Cairo Regular 12 / 18, Electric Sky |

"Active" means an active destination, or More with `containsActive`.

**Hover and pressed:** neither is designed, so add neither.

**Focus:** the D-B2 ring, copied from `Button.tsx`:
`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid
focus-visible:outline-accent-electric-sky`.

**Motion:** colour transitions only (`transition-colors duration-base ease-standard`). No
transform.

**Classes** (tokens; the sizes are local constants, not tokens):

| Need           | Class                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------- |
| Box            | `w-[76px] h-[60px] rounded-[14px] p-[8px] flex flex-col items-center justify-center gap-xs` |
| Default colour | `text-text-secondary`                                                                       |
| Active         | `bg-accent-electric-sky/12 text-accent-electric-sky`                                        |
| Label          | `text-dashboard-caption`                                                                    |
| Icon           | `<Icon name={icon} size={22} />` (`ICON_SIZES.mobileNav`), coloured by `currentColor`       |

No literal hex values and no new tokens. Do not use physical `left`/`right` classes.

## 6. Accessibility requirements

- The visible label is the accessible name; the icon is `aria-hidden`, which `Icon` does by
  default.
- The target is 76 × 60 (WCAG 2.5.8).
- **Destination:** `aria-current="page"` only when active.
- **More:** a real `<button>` with `aria-haspopup="dialog"` and `aria-expanded`. Enter and Space
  activate it, and it never has `aria-current`.
- **No nested interactive elements.**
- **RTL and LTR:** identical vertical layout, and the icon is never mirrored.

## 7. Unit-test acceptance criteria (`MobileNavItem.test.tsx`)

**Setup:** jsdom, Testing Library, and a `NextIntlClientProvider` wrapper in `ar` and `en`. Copy
the setup from `src/shared/ui/NavigationIconButton.test.tsx`.

All of the following must pass:

1. A destination renders `<a>` with the locale href (`/dashboard` in `ar`, `/en/dashboard` in
   `en`); More renders `<button type="button">`.
2. `aria-current="page"` appears only on an active destination. It never appears on More, even
   with `containsActive`.
3. **More:** `aria-haspopup="dialog"`, and `aria-expanded` follows `expanded`. `onOpen` is called
   on click, on Enter and on Space.
4. **Classes:**
   - Default: `text-text-secondary`, no fill.
   - Active destination, or More with `containsActive`: `bg-accent-electric-sky/12` and
     `text-accent-electric-sky`.
   - Box classes as in §5.
5. The icon is 22 (`width="22"`) and `aria-hidden="true"`, and the label text renders.
6. **Compile-time API:** `// @ts-expect-error` for:
   - mixing the kinds;
   - `aria-current` on More;
   - a missing `label`;
   - `children`;
   - an unknown icon.
7. jest-axe in RTL and LTR, asserted as
   `expect((await axe(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([])`.
8. `corepack pnpm check` passes on your copy.

## 8. Branch and delivery workflow (offline; `TEAM_COLLABORATION.md` §4–§5)

1. Unzip the starter into an empty folder, then:

   ```bash
   corepack pnpm install
   git init -b baseline && git add -A && git commit -m "baseline <short hash>"
   git switch -c work
   ```

   These branches are local only; nothing is pushed.

2. Implement the two files on `work`. Run `corepack pnpm check`.
3. Deliver `munsit-delivery-mobile-nav-item-<YYYYMMDD>-v1.zip`, containing:
   - `DELIVERY.md`: the template in §5.2, with the full baseline hash from
     `BASELINE_COMMIT.txt`;
   - `files/` with exactly the two files;
   - `delivery.patch` (`git diff baseline..work`);
   - `pnpm check` output;
   - screenshots if you used a scratch page. Do not commit the scratch page.
4. **Never include:** `node_modules/`, `.next/`, `.env*`, caches or credentials.

## 9. Integration requirements (Yousef)

1. Create `delivery/shell-mobile-nav-item-v1` from the recorded baseline commit.
2. Apply the patch or the two manifest files only; never unzip over the project.
3. Check that `git status` lists exactly the two files.
4. Commit the delivery on its own; integration fixes go in separate commits.
5. Rebase onto `main`, then run typecheck, lint, format, unit tests, build and E2E.
6. Open a PR, wait for CI to be green, and merge.
7. Claude then builds `BottomNav` with the component **unchanged**, plus the E2E checks (390 and
   320, RTL and LTR, computed Figma values, rendered contrast).

**Definition of Done:**

- The two files are merged, with every §7 criterion passing.
- `BottomNav` consumes the component unchanged.
- No other file was changed by the delivery.
