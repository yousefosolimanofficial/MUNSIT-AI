# Component contract — Status Badge (Phase 03, Badge V1)

- **Status:** **Approved — final** (2026-11-15). D-BG1 (add Failed) and D-BG2 (Dashboard chips
  out of V1) approved by the user; the name `StatusBadge` approved. All four statuses are
  implemented on `feature/03-badge-v1`.
- **Owner:** Yousef. The user moved Badge V1 from Mariam (plan §5) to Yousef on 2026-11-15 so it
  can run in parallel with Card V1. Nothing is delegated.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read read-only via the Figma MCP and the Plugin API on
  2026-11-15. Figma is not modified.
- **Files:** `src/shared/ui/Badge.tsx`, `src/shared/ui/Badge.test.tsx`. The `/dev/components`
  section is added later, separately from the Card integration.

## 1. Purpose and source (FIGMA)

A small, static label that shows a lecture's processing status.

The **only Badge component in Figma** is the component set `Status Badge` `2258:1026` (page
`04 — My Lectures`). Its description: "Lecture processing status. Variants: Ready, Processing,
Pending, Failed." It has one variant property, `Status`, with 29 instances in the file (Ready 11,
Processing 6, Pending 6, Failed 6), for example in the Dashboard Recent Lecture Row on all three
breakpoints.

| Variant (`Status`) | Node        | Label (Figma, verbatim) | Fill              | Border (1px, inside) | Label and dot color                 |
| ------------------ | ----------- | ----------------------- | ----------------- | -------------------- | ----------------------------------- |
| `Ready`            | `2258:1014` | جاهزة                   | Success Green 12% | Success Green 26%    | `Accent / Success Green` (variable) |
| `Processing`       | `2258:1017` | قيد المعالجة            | Electric Sky 12%  | Electric Sky 26%     | `Accent / Electric Sky` (variable)  |
| `Pending`          | `2258:1020` | في الانتظار             | White 6%          | White 12%            | `Text / Secondary` (variable)       |
| `Failed`           | `2258:1023` | فشلت المعالجة           | Coral Pulse 12%   | Coral Pulse 26%      | `Accent / Coral Pulse` (variable)   |

Shared by every variant (FIGMA): horizontal auto layout, hug width; padding 5 block / 10 inline;
gap 6; radius 8; border 1px (included in layout); height **30** (1 + 5 + 18 + 5 + 1); label text
style `Dashboard/Caption` (Cairo Regular 12/18), single line; dot is a 6×6 ellipse in the label
color. In Figma the children are `Label`, then `Dot`, in a frame drawn natively RTL, so the
**dot sits at the inline start** (right in RTL).

The Handoff lists three status labels: في الانتظار / قيد المعالجة / جاهزة (plan §2, Design System
Reference). Figma adds Failed, approved by the user (D-BG1).

## 2. Values in code (existing tokens only)

| Part         | Classes                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| Container    | `inline-flex items-center gap-[6px] rounded-sm border px-[10px] py-[5px] whitespace-nowrap` |
| Label        | `text-dashboard-caption` (inherits the status text color)                                   |
| Dot          | `size-[6px] shrink-0 rounded-full bg-current`, `aria-hidden="true"`                         |
| `ready`      | `bg-accent-success-green/12 border-accent-success-green/26 text-accent-success-green`       |
| `processing` | `bg-accent-electric-sky/12 border-accent-electric-sky/26 text-accent-electric-sky`          |
| `pending`    | `bg-text-primary/6 border-text-primary/12 text-text-secondary`                              |
| `failed`     | `bg-accent-coral-pulse/12 border-accent-coral-pulse/26 text-accent-coral-pulse`             |

- Tokens: colors `accent-success-green`, `accent-electric-sky`, `accent-coral-pulse`,
  `text-primary` (the only
  token-backed white), `text-secondary`; radius `sm` (8); text style `dashboard-caption`. **No new
  token.**
- Local component constants (not tokens): padding 5 / 10, gap 6, dot 6, and the opacity
  modifiers 12 / 26 / 6.
- Height 30 comes from the border (1 + 1), padding (5 + 5) and the 18px line height
  (border-box).

## 3. Typography

`Dashboard/Caption` (12/18, Regular) through `text-dashboard-caption`. The project font stack
renders Arabic in Cairo and Latin in Inter. Labels never wrap (`whitespace-nowrap`).

## 4. States

Static only: no hover, pressed, focus, disabled, shadow, transition or animation. Figma defines
none.

## 5. API

```tsx
// src/shared/ui/Badge.tsx — Server Component
export type StatusBadgeStatus = "ready" | "processing" | "pending" | "failed";

export type StatusBadgeProps = {
  /** Figma `Status` variant. */
  status: StatusBadgeStatus;
  /** Visible label, localized by the caller (e.g. t("lecture.status.ready")). */
  children: ReactNode;
  /** Layout only (margin, alignment), merged last. Never color, size or radius. */
  className?: string;
} & Omit<
  WithoutEventHandlers<ComponentPropsWithRef<"span">>,
  "className" | "children" | "role" | "tabIndex" | "dangerouslySetInnerHTML"
>;

export function StatusBadge(props: StatusBadgeProps): ReactNode;
```

- Named `StatusBadge` (the Figma name). `Badge` stays free for a possible generic badge later
  (D-BG2, approved).
- **The caller passes the label** as `children`. Badge holds no copy: the Arabic labels are in
  §1, and English labels come from i18n messages when the module needs them. Nothing is invented
  here.
- Renders a `<span>`. Native `span` attributes, `aria-*`, `data-*` and `ref` (`HTMLSpanElement`)
  pass through. Event handlers, `role`, `tabIndex` and `dangerouslySetInnerHTML` are rejected at
  compile time, as for Card (static only; raw HTML is a content-injection risk).

## 6. RTL / LTR

The dot is the first DOM child, so it sits at the inline start: right in RTL (as in Figma), left
in LTR. Logical utilities only, symmetric padding, no mirroring needed.

## 7. Accessibility (WCAG 2.2 AA)

- The **text carries the meaning**. Color and the dot are redundant (1.4.1). The dot is
  `aria-hidden`.
- No live region and no role. A status that changes while the user watches is announced by the
  owning screen, not by Badge.
- Label contrast, composited over the real surfaces (WCAG arithmetic from tokens, 2026-11-15):

  | Status     | on Void Black | on `surface` card | on `inset` row |
  | ---------- | ------------- | ----------------- | -------------- |
  | Ready      | 9.29          | 8.28              | 7.62           |
  | Processing | 6.87          | 6.16              | 5.70           |
  | Pending    | 6.72          | 6.03              | 5.56           |
  | Failed     | 6.26          | 5.66              | 5.25           |

  All pass 4.5:1. Borders (1.30–1.78:1) and fills are decorative on a static, non-interactive
  label (1.4.11 does not apply).

## 8. Responsive behavior

None of its own. Badge is the same at 1440, 768 and 390 (the Recent Lecture Row places it inline
on Desktop and Tablet, and in the stacked title row on Mobile). Callers keep it from shrinking.

## 9. Required tests (`Badge.test.tsx`)

1. Renders a `span` with the label; the dot is the first child and `aria-hidden`.
2. Shared classes: `inline-flex`, `gap-[6px]`, `rounded-sm`, `border`, `px-[10px]`, `py-[5px]`,
   `whitespace-nowrap`, `text-dashboard-caption`.
3. Status classes for `ready`, `processing`, `pending`, `failed` exactly per §2.
4. No hex, no left/right utilities, no `hover:`, `focus:`, `active:`, `shadow`, `transition`,
   `animate` or transform classes.
5. `aria-*`, `data-*`, `id` and `ref` pass through; no `role` or `tabindex` is rendered.
6. `className` is merged last.
7. jest-axe: 4 statuses × `rtl`/`ltr`, no violations (color-contrast off in jsdom).
8. Compile-time (`pnpm typecheck`): all four statuses compile; `@ts-expect-error` on a missing
   `status`, an unknown status, `onClick`, `role`, `tabIndex` and `dangerouslySetInnerHTML`;
   an `HTMLSpanElement` ref compiles.

## 10. Acceptance criteria

- [ ] Only `Badge.tsx` and `Badge.test.tsx` added; no token, font, icon, route, gallery or
      dependency change.
- [ ] Values per §2, tokens only, no hex.
- [ ] Static and non-interactive at the type level.
- [ ] RTL and LTR correct (dot at the inline start).
- [ ] All §9 tests pass; `corepack pnpm check` passes.
- [ ] Integration (separately): `/dev/components` section with rendered contrast, axe and
      1440/768/390/320 in RTL and LTR.

## 11. Explicit exclusions

- The Dashboard chips (D-BG2, approved: built with the relevant Dashboard features): topic level `Status` (ضعيف / متوسط, e.g. `2220:286`, `2220:303`),
  `Count Chip` `2220:281`, `Range Chip` `2220:273`, `Progress Chip` `2220:341` and `Duration Chip`
  `2217:217`. These are standalone frames, not components, with their own values (§12).
- Icons, counts, removable or clickable badges, sizes other than 30.

## 12. Decisions (user, 2026-11-15)

| ID    | Decision                                            | Effect                                                                        |
| ----- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| D-BG1 | **Approved:** include Failed (فشلت المعالجة)        | Fourth status with the Figma values in §1–§2; label contrast 5.25–6.26:1 (§7) |
| D-BG2 | **Approved:** Dashboard chips stay outside Badge V1 | Built with the relevant Dashboard features (§11)                              |
| —     | **Approved:** component name `StatusBadge`          | `Badge` stays free for a possible generic badge                               |
