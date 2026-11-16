# Component contract — Tabs (Phase 03, Tabs V1)

- **Status:** **Approved — final** (2026-11-15). D-T1 to D-T6 decided by the user (§12). Tabs V1
  ships **only the `tool` variant** (sizes `default` and `compact`). Filter rows are **deferred to
  the Favorites, Folders and Question Bank modules** (§1.1, §12); no shared Filter component.
- **Owner:** Yousef (parallel to Mariam's Card V1). Nothing delegated.
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read read-only with the Figma MCP and Plugin API on
  2026-11-15 (all pages searched for tab, segment and toggle-group names). Figma is not modified.
- **Files:** `src/shared/ui/Tabs.tsx`, `src/shared/ui/Tabs.test.tsx`. The `/dev/components`
  section and browser checks follow the Card integration.

## 1. What Figma contains (four families)

| #   | Family                  | Figma                                                                                                                                                                        | Role                                            | Tabs V1                                                |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| 1   | **Lecture tool tabs**   | Component sets `Lecture Tab` `2278:322` (Default / Hover / Active; 66 instances) and `Lecture Tab Compact` `2293:679` ("for tablet/mobile"; Default / Active; 120 instances) | Switches the six tool panels of Lecture Details | **Implemented: variant `tool`**                        |
| 2   | Filter tabs with counts | Frames: Favorites `Content Type Tabs` `2440:258`, Folders `2450:633`, Question Bank `Review Filters` `2415:5877` (identical values)                                          | Filter one shared list (§1.1)                   | **Deferred to the modules** (not ARIA tabs; §1.1, §12) |
| 3   | Settings navigation     | Component set `Settings / Tabs` `2461:514`: "Secondary settings navigation (not a global sidebar)"                                                                           | Each item opens a different Settings screen     | Excluded (D-T1): nav links with `aria-current`, later  |
| 4   | Summary type selector   | Component set `Summary Type Selector` (`Type=Short` `2374:239`)                                                                                                              | Picks one option (summary length)               | Excluded (D-T1): segmented radio group, later          |

### 1.1 Filter semantic check (user condition on D-T1)

Read 2026-11-15 with the Plugin API:

- **Favorites:** 9 frames contain the tabs (Library and Management on Desktop, Tablet and Mobile,
  plus the components board). The active tab is **always "All"**, and the content under the tabs
  is always the **same structure**: `Toolbar` (or `Search Row` on Mobile), **one** `Favorites
Grid` and a `Count Footer`. No screen designs a separate view for Lectures, Summaries, Questions
  or Notes. The section notes list content _types inside one grid_ ("Lecture · Summary · Question
  set · Note").
- **Question Bank:** 4 frames (`Answer Review` Desktop, Tablet, Mobile and the board). Again only
  "All" is active above **one** `Review List`.
- **Folders** uses the same `Content Type Tabs` frame and values (not re-read screen by screen).

**Result:** the filter tabs narrow **one shared list**. They do not switch distinct content views.
So the ARIA tabs pattern (one `tabpanel` per tab) would be wrong. The `filter` variant is **not
implemented**. Its values stay recorded in §2.3 for whichever pattern is approved later (for
example a group of toggle buttons with `aria-pressed`, or a radio group).

## 2. Exact values (FIGMA)

### 2.1 `tool`, size `default` (`Lecture Tab` `2278:322`, Desktop)

| Property  | Default                                   | Hover (designed) | Active               |
| --------- | ----------------------------------------- | ---------------- | -------------------- |
| Fill      | none                                      | White 5%         | Electric Sky 12%     |
| Border    | none                                      | none             | 1px Electric Sky 32% |
| Label     | `Dashboard/Body Medium`, Text / Secondary | Text / Primary   | Text / Primary       |
| Icon (18) | Text / Secondary                          | Text / Primary   | Electric Sky         |

Height 44, padding-inline 16, gap 8, radius 12. The six tabs share the width equally, gap 8.

### 2.2 `tool`, size `compact` (`Lecture Tab Compact` `2293:679`, Tablet and Mobile)

| Property  | Default                               | Active                            |
| --------- | ------------------------------------- | --------------------------------- |
| Fill      | White 3%                              | Electric Sky 12%                  |
| Border    | 1px Electric Sky 12%                  | 1px Electric Sky 50%              |
| Label     | `Dashboard/Caption`, Text / Secondary | `Dashboard/Caption`, Electric Sky |
| Icon (18) | Text / Secondary                      | Electric Sky                      |

Height 58, icon above label, padding 8 block / 6 inline, gap 4, radius 12. No hover variant.

### 2.3 Filter row (deferred to the modules; values recorded for reference)

Height 42, padding 9 / 14, gap 8, radius 12. Default: White 4% fill, Sky 14% border, Text /
Primary label. Active: Sky 14% fill, Sky 55% border, Sky label. Count pill: padding 1 / 7, radius
8, `Dashboard/Meta`. Default count: White 8% fill, Text / Secondary. Active count: Sky 20% fill;
the text is **Text / Primary** (D-T5, approved deviation from Figma's Sky; 10.88:1 on the card,
9.63:1 on Graphite, against 4.18 and 3.70 in Figma).

### 2.4 Responsive (FIGMA, `Lecture Tabs`)

| Screen  | Size      | Arrangement                  |
| ------- | --------- | ---------------------------- |
| Desktop | `default` | 6 equal tabs, one row, gap 8 |
| Tablet  | `compact` | 6 equal tabs, one row, gap 4 |
| Mobile  | `compact` | 2 rows × 3 (111×58), gap 8   |

Per D-T3 the component has **no breakpoints**. The page chooses `size` and, for the Mobile 2 × 3
grid, passes the layout on `TabList` (`className="grid grid-cols-3 gap-[8px]"`).

### 2.5 Disabled

`Lecture Tabs (inactive while loading)` `2584:1327`: the **whole list at opacity 50%**. There is no
per-tab disabled state.

## 3. Implemented values (existing tokens only)

| Part                | Classes                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tab, both sizes     | `rounded-md border` · focus ring D-B2 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-accent-electric-sky` · `transition-colors duration-base ease-standard` |
| `default` layout    | `h-[44px] px-md gap-[8px] text-dashboard-body-medium` (row)                                                                                                                                                            |
| `default` inactive  | `border-transparent text-text-secondary enabled:hover:bg-text-primary/5 enabled:hover:text-text-primary`                                                                                                               |
| `default` active    | `bg-accent-electric-sky/12 border-accent-electric-sky/32 text-text-primary`, icon `text-accent-electric-sky`                                                                                                           |
| `compact` layout    | `min-h-[58px] flex-col py-[8px] px-[6px] gap-[4px] text-dashboard-caption`                                                                                                                                             |
| `compact` inactive  | `bg-text-primary/3 border-accent-electric-sky/12 text-text-secondary`                                                                                                                                                  |
| `compact` active    | `bg-accent-electric-sky/12 border-accent-electric-sky/50 text-accent-electric-sky`                                                                                                                                     |
| Active label (D-T6) | `underline underline-offset-4`                                                                                                                                                                                         |
| TabList             | `flex` · `gap-[8px]` (`default`) / `gap-xs` (`compact`, 4) · tabs `flex-1 min-w-0`; disabled list `opacity-50`                                                                                                         |
| Icon                | existing `Icon`, size 18, decorative                                                                                                                                                                                   |

The inactive `default` tab keeps a transparent 1px border, so the active border never changes its
size (border-box). Local constants: heights, paddings, gaps 8 and 4 (inline), opacity modifiers
and the underline offset. **No new token.**

**Approved deviations from Figma:**

- **D-T2:** a focus-visible ring (Figma has none).
- **D-T6:** an underlined label on the active tab, a non-color cue. Figma shows the selection by
  color only. Dimensions and spacing are unchanged.
- **D-T5:** applies to the filter row when its module builds it.

**Responsive fix (user, 2026-11-16, final gallery QA):** the `compact` height is a **minimum**
of 58 (`min-h-[58px]`), not a fixed height. Where the label fits on one line (every label at the
Figma Mobile width of 390), the tab stays 58. Below that (360, 320) a two-word label wraps and the
tab grows, keeping the 8px block padding. Tabs in one row stretch to the same height (grid and
flex default). No label is truncated or resized. API and interaction are unchanged.

## 4. API (implemented)

```tsx
"use client";

<Tabs
  label="أدوات المحاضرة" // required: accessible name of the tab list
  size="default" // "default" | "compact" (D-T3); the page decides
  defaultValue="transcript" // uncontrolled, or value + onValueChange (controlled)
  onValueChange={(value) => {}}
  disabled={isLoading} // whole list (§2.5)
  variant="tool" // optional; the only value in V1
>
  <TabList className="…layout only…">
    <Tab value="transcript" icon="fileText">
      التفريغ النصي
    </Tab>
  </TabList>
  <TabPanel value="transcript">…</TabPanel>
</Tabs>;
```

- `Tabs`, `TabList`, `Tab` and `TabPanel` share one context. Ids come from `useId`, and values are
  made id-safe.
- `Tab` takes only `value`, `icon?`, `children` and `className?`: no `onClick`, `role`,
  `tabIndex` or `aria-*` override (the component owns the semantics).
- `TabPanel` takes `value`, `children` and `className?`.
- **Activation is automatic (D-T4):** focus moves and selection follows. This is valid while the
  panels update immediately. A panel that needs network data shows its own loading state, or the
  page disables the list (§2.5).

## 5. Accessibility contract (WAI-ARIA APG Tabs)

- `role="tablist"` with `aria-label`; tabs are `<button type="button" role="tab">` with
  `aria-selected` and `aria-controls`. Panels are `role="tabpanel"` with `aria-labelledby` and
  `tabIndex={0}`, and every inactive panel is `hidden`.
- **Roving focus:** only the selected tab has `tabIndex=0`; Tab moves from the list to the panel.
- **Keys:** ArrowLeft and ArrowRight follow the **visual** direction (read from the list's
  computed `direction`): in RTL ArrowLeft is the next tab, in LTR ArrowRight is. Focus wraps
  around. Home goes to the first tab, End to the last. Each key moves focus and selects.
- **Disabled list:** every tab is natively `disabled` (not focusable, not selectable), the
  tablist has `aria-disabled="true"`, and the list shows at 50%. The panel stays.
- **Contrast** (Void / card): labels 6.50–17.88:1, so all pass AA. The active state is now
  color + underline (D-T6).
- Icons are decorative and mirror only via the existing whitelist.

## 6. Required tests (`Tabs.test.tsx`)

1. Roles and relationships: tablist label, `aria-selected`, `aria-controls` ↔ panel id,
   `aria-labelledby` ↔ tab id, inactive panels `hidden`, roving `tabIndex`.
2. Uncontrolled (`defaultValue`, click) and controlled (`value` + `onValueChange` called once per
   change; the selection follows only the prop).
3. Automatic activation by keyboard: ArrowLeft/Right in **RTL and LTR** with wrap, Home, End;
   focus moves with the selection; Tab moves from the tab list to the panel.
4. Disabled: tabs disabled, `aria-disabled` on the tablist, `opacity-50`, no selection on click
   or key.
5. Classes for `default` and `compact`, inactive and active (§3); hover only on `default`;
   underline only on the active label; focus ring present; no hex, no left/right utilities.
6. Compile-time: `@ts-expect-error` on `variant="filter"`, `size="large"`, a missing `label`,
   `onClick` or `role` on `Tab`, `count` on `Tab`.
7. jest-axe: `default` and `compact` × RTL/LTR, no violations.

## 7. Explicit exclusions

Filter rows (deferred to the modules, §1.1), Settings navigation and Summary Type Selector (D-T1),
Dashboard chips (D-BG2), breakpoints inside the component (D-T3), per-tab disabled, vertical tabs,
closable or draggable tabs, tabs as links, manual activation.

## 8. Acceptance criteria

All §6 tests pass; `corepack pnpm check` passes; values per §3; no token, dependency, route,
gallery, Card, Button, Input or StatusBadge change; the integration later verifies rendered
contrast, axe and 1440/768/390/320 in RTL and LTR.

## 12. Decisions (user, 2026-11-15)

| ID   | Decision                                                                                                                                    | Applied                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| D-T1 | **Approved:** V1 = `tool` + `filter`; Settings nav and Summary selector excluded. Condition: `filter` only if each tab has a distinct panel | `tool` implemented; filter rows deferred to the modules (§1.1) |
| D-T2 | **Approved:** Button focus ring; hover only where designed; disabled = whole list, correct semantics                                        | §3, §5                                                         |
| D-T3 | **Approved:** explicit `default` / `compact`; no breakpoints in the component                                                               | §2.4, §4                                                       |
| D-T4 | **Approved with condition:** automatic activation where panels update without network latency                                               | §4, §5                                                         |
| D-T5 | **Approved:** active count text white on Sky 20% (intentional accessibility adjustment)                                                     | §2.3 (applied when the module builds the filter row)           |
| D-T6 | **Approved with modification:** visible underline on the active label; dimensions unchanged                                                 | §3                                                             |

**Filter rows (user decision, 2026-11-15):** deferred to the Favorites, Folders and Question Bank
modules. The likely direction is a single-choice filter group over one list; its final
interaction and accessibility pattern is decided during module implementation. No shared Filter
component is built now.
