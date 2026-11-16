# Phase 05 — Shared App Shell — Plan

- **Status:** **PROPOSED plan — Phase 05 has not started.** Nothing here is implemented. Open
  decisions are in §20; the O-8 contract and the breakpoint ADR are proposed alongside this plan.
- **Baseline:** `main` at `72c8ad9` (Phase 04 closed through PRs #27 and #28).
- **Companion documents (PROPOSED):**
  - [phase-05-navigation-icon-button-contract.md](phase-05-navigation-icon-button-contract.md)
    (O-8)
  - [ADR-004 — App-shell breakpoints](../decisions/ADR-004-shell-breakpoints.md)

## 1. Objective

Build the shared app shell **once**, driven by the Phase 04 registry, so module phases only render
content inside it (Roadmap Phase 05 DoD). The shell has these parts:

- the Desktop Sidebar;
- the Tablet Rail and drawer;
- the Mobile Top Bar, bottom navigation and More sheet;
- the Top Bar.

## 2. Scope (Roadmap Phase 05)

- The shell layout in `(app)`; hidden in `(focus)`.
- **Sidebar** 232 (Horizontal logo).
- **Rail** 72 (Symbol logo, menu button).
- **Drawer:** opens from the Rail menu; closes on scrim click, Esc and destination change.
- **Mobile Top Bar**, plus the **84 px bottom nav** with the More tab on every mobile screen.
- **More sheet:** the five remaining destinations, account settings, and the plan-upgrade entry
  (UI only).
- **Top Bar** with search, language toggle, theme toggle (System/Light "coming soon", not
  functional), and the notifications and user-menu triggers. Overlay content belongs to Phases
  06/09.
- The **upgrade card** pinned at the bottom of the Sidebar and Rail.
- `aria-current="page"`, a skip link, mobile safe-area insets and bottom padding.
- The **Navigation Icon Button** (O-8), as a prerequisite once its contract is approved.

## 3. Exclusions

- Notification and search **content, data or results** (D-17), and user-menu actions that need
  auth, such as logout (D-02).
- Plan-upgrade behaviour (D-18).
- Light and System themes (D-16).
- Module screens.
- Overlay and guard infrastructure (Phase 06).
- Landing navigation (Phase 07).
- The Settings secondary-navigation UI (Phase 20; its data already exists).
- Any new navigation system; the shell consumes `src/shared/navigation`.
- New dependencies.

## 4. Authoritative references

- Roadmap v1.0 Phase 05 and §3 (`src/shared/layout/`), read-only.
- Handoff pp. 4 and 8 (shell, registry, interactions).
- Phase 03 contracts (Sheet D-SH3 is based on the More Menu, Popover/Menu, Avatar, Button, Card).
- Phase 04 plan and closure: registry, `resolveActiveDestination`, `mobileBarIndicator`, route
  groups, D-R6.
- ADR-002 (deferred primitives) and ADR-003.
- `docs/design-values.md` §2b.1 (shell icons) and the logo section.
- The Next.js 16.4 docs in `node_modules`.

## 5. Figma evidence (read-only, 2026-11-16, page 03 unless stated)

| Part                       | Verified values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop frame `2211:74`    | Sidebar 232 at the inline start; Main 1208 with padding 24, gap 24; Top Bar is the first child of Main (it scrolls with the page)                                                                                                                                                                                                                                                                                                                                                                                                          |
| Sidebar                    | Fill `7,8,10 @ 88%`; 1px inline-end border Sky 10%; padding 24/16; gap 20. Logo 168×55, then divider (1px Sky 10%), nav (gap 6), spacer, then **Upgrade Plan Card** (199×166, radius 18, padding 16, gap 10, gradient fill, 1px Sky 30%; title "ترقية الخطة" 16; text 12 Text/Secondary; Primary Button 44)                                                                                                                                                                                                                                |
| Sidebar Item `2210:118`    | 200×44 (199 in use), radius 12, padding 0/14, gap 12, icon 20, Cairo Medium 14. Default: transparent, Text/Secondary. Hover: Sky 7%, white. Pressed: Sky 14%, white. Active: Sky 12% + 1px Sky 22%, Cairo SemiBold, white; 3×22 Electric Sky accent bar                                                                                                                                                                                                                                                                                    |
| Desktop Top Bar `2211:179` | 56 high. Controls (gap 10): **User Menu Trigger** 219×54 (radius 14, padding 6/10, White 4%, Sky 12%; Avatar 40; name; chevron 16), divider 1×28 Sky 15%, **Language Switch** 86×38 (radius 12, padding 4, segments EN/AR 37×28 radius 9, active Sky 20%), **Theme Toggle** (Navigation Icon Button, `moon`), **Notifications** (Navigation Icon Button, `bell` + 9px Coral "Unread Dot"). **Search Input** `2210:147` 440×44 (radius 12, padding 0/16, gap 12, icon 18, White 4%, Sky 12%; Focus Sky 70%; Filled shows a 24 clear button) |
| Tablet frame `2224:372`    | **Rail** 72: same fill and border as the Sidebar; padding 20/16; gap 10. Logo mark 40 (radius 10), divider (White 8%), menu button, 8 destination buttons (Active `home`), spacer, upgrade (`crown`). All are Navigation Icon Buttons. Main padding 24; Top Bar = compact user trigger 88 (avatar only) + search 353                                                                                                                                                                                                                       |
| Drawer `2242:1272`         | The expanded Sidebar (232, same content as the Desktop Sidebar) at the inline start over a scrim (Void 66%). Prototype: menu → overlay; scrim → close. **No close button**                                                                                                                                                                                                                                                                                                                                                                 |
| Mobile frame `2238:741`    | **Top Bar** 72, fill Void 88%, bottom border Sky 10%, **background blur 16**, padding 0/20/0/14. Logo 121×40; actions (gap 6): user trigger 88, notifications wrapper 44, **Search Button** 44 (icon 18). Content padding 88 top / 108 bottom, 20 sides                                                                                                                                                                                                                                                                                    |
| Bottom navigation          | 390×84, fill `7,8,10 @ 94%`, top border Sky 12%, **blur 16**, padding 8/16/16/16. Four **Mobile Navigation Items** `2210:302`: 76×60, radius 14, padding 8, gap 4, icon 22, Cairo 12. Active: Sky 12% fill, Sky label                                                                                                                                                                                                                                                                                                                      |
| More Menu Sheet `2236:972` | 390 wide; fill `17,18,20 @ 98%`; 1px Sky 18%; padding 12/20/28/20; gap 8. Grabber 40×4; header (title "المزيد" 20, close 40). Rows 56 high: radius 14, padding 0/12, gap 14, Sky 5% fill, Sky 10% border, 36 icon tile (Sky 14%, icon 18), label 14 white. **Upgrade row:** Sky 12%, Sky 30% border, Sky label. Scrim in "Overlay / Mobile / More Menu"                                                                                                                                                                                    |
| Active states elsewhere    | Flashcards Mobile: bottom-nav **More = Active**. Settings Mobile: bottom-nav **More = Active** (see §20, D-S1). Settings Tablet: **no** Rail item Active                                                                                                                                                                                                                                                                                                                                                                                   |
| Overlays                   | Notifications dropdown 380×341 (Desktop/Tablet), 350 (Mobile); User Menu `2236:813` 256×224. Both close on backdrop click; their content is Phase 06/09                                                                                                                                                                                                                                                                                                                                                                                    |

## 6. Component inventory (`src/shared/layout/` unless noted)

| Component                                 | Built from                                                                                            | Notes                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `NavigationIconButton` (`src/shared/ui`)  | New: O-8 contract                                                                                     | Rail items, menu, upgrade, theme, notifications     |
| `AppShell`                                | Layout for `(app)`                                                                                    | Grid: Sidebar / Rail / Main; mobile fixed bars      |
| `SkipLink` (`src/shared/a11y`)            | New, small                                                                                            | To `#main-content`                                  |
| `Sidebar`, `SidebarItem`, `UpgradeCard`   | Registry + Button (Primary)                                                                           | Shared by the Sidebar and the drawer                |
| `TabletRail`                              | `NavigationIconButton` + registry                                                                     | Symbol logo                                         |
| `TabletDrawer`                            | `useModalDialog` (Phase 03 internal) + `Sidebar` content                                              | Side panel from the inline start                    |
| `TopBar` (desktop/tablet), `MobileTopBar` | `SearchField`, `LanguageSwitch`, `ThemeToggle`, `NotificationsTrigger`, `UserMenuTrigger` (Avatar 40) | Compact variants by breakpoint                      |
| `SearchField`                             | New shell field (Figma "Search Input")                                                                | Not the form `Input`: no label slot; behaviour D-S4 |
| `LanguageSwitch`                          | next-intl `Link` to the same route in the other locale                                                | Functional (D-R2)                                   |
| `BottomNav`, `MobileNavItem`              | Registry + `mobileBarIndicator`                                                                       | The More tab opens the More sheet                   |
| `MoreSheet`                               | Phase 03 `Sheet` + `MORE_SHEET_DESTINATIONS`/`MORE_SHEET_EXTRAS`                                      | Rows per Figma                                      |

## 7. Layout architecture

- `(app)/layout.tsx` renders `AppShell` and replaces the Phase 04 placeholder layout. `(focus)` has
  no shell.
- `AppShell` holds:
  - `SkipLink`;
  - the `nav` landmarks;
  - a `header` (Top Bar);
  - `main#main-content`.
- Active state comes from `useActiveDestination()` and `mobileBarIndicator()` only. Labels come
  from `nav.*` messages; there are no hardcoded paths.
- The Phase 04 `ActiveDestinationProbe` is removed once the shell renders the real active state.

## 8. Responsive architecture

- **Mobile:**
  - fixed Top Bar and bottom nav (Figma blur 16);
  - content padding 88/108 plus safe-area insets;
  - search is a button;
  - the user trigger is compact (avatar only).
- **Tablet:**
  - sticky Rail (72), full viewport height with internal scrolling;
  - the drawer opens from the menu button;
  - compact Top Bar.
- **Desktop:**
  - sticky Sidebar (232), full viewport height with internal scrolling; the upgrade card is at the
    bottom when there is room;
  - full Top Bar (user name visible, search 440).
- The Top Bar scrolls with the content on Tablet and Desktop (Figma: it is a child of Main).

## 9. Breakpoint proposal (ADR-004, PROPOSED)

| Shell   | Range             |
| ------- | ----------------- |
| Mobile  | < 45rem (720 px)  |
| Rail    | 45rem – 79.99rem  |
| Sidebar | ≥ 80rem (1280 px) |

The breakpoints are rem-based (they follow the user's font size) and are validated by testing at
implementation. The evidence and alternatives are in the ADR.

## 10. Navigation behaviour

- The **same registry** feeds all five surfaces: Sidebar, Rail, drawer, bottom bar and More sheet.
- **Sidebar, Rail and drawer** list the 8 destinations. The active one gets the Active visual and
  `aria-current="page"`.
- **Bottom bar:** the 3 bar destinations plus the **More** control.
  - More is a `button` with `aria-haspopup="dialog"` and `aria-expanded`. It is **never**
    `aria-current` (D-R6).
  - Its visual Active state follows `mobileBarIndicator` (Roadmap: "More tab shows active for
    destinations inside it", APPROVED). Settings is D-S1.
- **More sheet:** the 5 destinations (the active one gets `aria-current="page"`), account settings
  (`/settings`) and upgrade (D-S7).
- A destination change closes the drawer and the More sheet.

## 11. Interaction requirements (proposed decisions)

| #   | Topic                       | Proposal                                                                                                                                                                                                                                                                  |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sticky Sidebar              | Sticky, full viewport height, internal scroll (Roadmap PROPOSED; Figma has no fixed artboard height)                                                                                                                                                                      |
| 2   | Tablet drawer               | Opens from the Rail menu (focus moves inside). Closes on scrim, Esc and destination change (Roadmap). Focus returns to the menu button. Built as a native modal dialog (`useModalDialog`). Motion: slide from the inline start, 320/200 ms; reduced motion = opacity only |
| 3   | Mobile More sheet           | Phase 03 `Sheet` (grabber, close 40, title "المزيد"): focus trap, Esc, scrim, close; destination change closes it; focus returns to More                                                                                                                                  |
| 4   | Theme toggle                | A Navigation Icon Button opening a Phase 03 `Menu` with radio items. Dark is checked. Light and System are disabled with a "coming soon" label (copy D-S3); there is no theme switching (D-16)                                                                            |
| 5   | Search                      | D-S4 (UI-only field or button; no results until D-17)                                                                                                                                                                                                                     |
| 6   | Notifications               | The trigger renders (Navigation Icon Button, `bell`). **No unread dot without data** (no mock data). Popover content is Phase 06/09 (D-S5)                                                                                                                                |
| 7   | Upgrade card and entries    | UI only (D-18). Target per D-S7                                                                                                                                                                                                                                           |
| 8   | Mobile More highlight       | Visual Active from `mobileBarIndicator`; never `aria-current` (D-R6). Settings per D-S1                                                                                                                                                                                   |
| 9   | Settings access             | The More sheet's "إعدادات الحساب" on mobile, and the user menu (D-S6) on Tablet and Desktop. No destination is active on `/settings` (D-R6)                                                                                                                               |
| 10  | Focus management            | Skip link first. Overlays trap focus and return it to the trigger. Route changes rely on Next's route announcer; focus moves to `main` only after skip-link activation                                                                                                    |
| 11  | Scroll locking              | Drawer and More sheet use the existing `useModalDialog` scroll lock without layout shift                                                                                                                                                                                  |
| 12  | Escape                      | Closes the topmost overlay only (drawer, sheet or menu), as in Phase 03                                                                                                                                                                                                   |
| 13  | Screen-reader announcements | Labelled `nav` landmarks (desktop, tablet and mobile labels in messages); `aria-current` on active items; `aria-expanded` on triggers; route changes via the Next route announcer                                                                                         |
| 14  | Reduced motion              | Opacity-only fades for the drawer and sheet; colour fades for hover; no movement                                                                                                                                                                                          |

## 12. Accessibility requirements

- WCAG 2.2 AA:
  - visible D-B2 focus ring everywhere;
  - keyboard-only traversal of every shell part;
  - targets ≥ 24 (40 on desktop, 44 on mobile);
  - rendered contrast measured in Chromium;
  - axe on the shell.
- Landmarks: one `header`, one or more labelled `nav`, one `main`. The skip link is visible on
  focus.
- No information by colour alone: the Active state also uses `aria-current`, and the Sidebar Item
  has its accent bar.

## 13. Design System dependencies

- **Existing:** the 19 colours, spacing and radius tokens, `Icon`, `Logo` (Horizontal and
  Symbol), Button, Sheet, Popover/Menu, Avatar, Card, `useModalDialog`, and the motion tokens.
- **New, pending approval:** the `NavigationIconButton` primitive (O-8) and two breakpoint tokens
  (ADR-004).
- **Deferred primitives (ADR-002):**

| Primitive                  | Needed in Phase 05?                                                                                                    | First consumer                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Navigation Icon Button     | **Essential**                                                                                                          | Tablet Rail and Top Bar (theme, notifications) |
| Tooltip                    | Optional (not designed)                                                                                                | Rail icon items, only if D-NIB6 is approved    |
| Generic Badge              | **No**: the unread dot is a 9 px decorative indicator inside the notifications trigger, not a badge                    | —                                              |
| Select, Radio              | **No**: the theme menu is a menu (Phase 03 `MenuItemRadio`), not a form control; native Radio stays deferred (ADR-002) | —                                              |
| Textarea, Checkbox, Switch | No                                                                                                                     | —                                              |

## 14. Internationalization

- New `shell` message keys:
  - nav landmark labels;
  - open/close menu;
  - search placeholder (Figma verbatim: "ابحث في محاضراتك، الملخصات أو الأسئلة...");
  - search button label;
  - language switch labels (EN/AR);
  - theme options and "coming soon";
  - notifications;
  - user menu;
  - upgrade card title and text (Figma verbatim) and button;
  - skip link.
- Arabic is verbatim where Figma has it. **English and any new Arabic need approval** before
  merge, as in Phase 04.
- Logical properties only. The shell sits at the inline start (right in RTL, left in LTR). The logo
  is never flipped.

## 15. Implementation sequence (after approval)

1. Approvals: the O-8 contract, ADR-004 and the decisions in §20.
2. `NavigationIconButton`: component, tests, gallery section.
3. Breakpoint tokens and `AppShell` skeleton: skip link, landmarks, `(app)` layout, `(focus)`
   without the shell.
4. Sidebar, Sidebar Item, upgrade card.
5. Tablet Rail and drawer.
6. Mobile Top Bar, bottom nav and More sheet.
7. Top Bar parts: search, language, theme menu, notifications and user triggers.
8. Remove `ActiveDestinationProbe`; E2E reads the real `aria-current`.
9. Tests, screenshots, accessibility; closure report; `PROGRESS.md`; PR.

## 16. Testing strategy

- **Unit tests for every shell part:**
  - registry-driven rendering (order, labels, icons);
  - `aria-current` on exactly one item (none on Settings);
  - More never `aria-current`;
  - `mobileBarIndicator` wiring;
  - type-level API checks;
  - jest-axe in RTL and LTR.
- **Playwright** at 1440/768/390 plus 320, and the ADR-004 threshold widths, in RTL and LTR:
  - navigation;
  - drawer open/close (scrim, Esc, destination change) and focus return;
  - More sheet focus trap;
  - keyboard-only traversal;
  - axe;
  - no overflow;
  - safe-area padding;
  - short heights;
  - 200% zoom;
  - reduced motion;
  - computed Figma values;
  - rendered contrast.

## 17. Acceptance criteria (Roadmap Phase 05)

1. The same registry is used in all five navigation shells.
2. Breakpoints are chosen by testing content space and recorded in an ADR (ADR-004), not assumed
   from artboard widths.
3. The Sidebar is sticky to the viewport height with the upgrade card visible (PROPOSED → D-S2).
4. No fixed artboard heights.
5. The More tab shows active for destinations inside it (APPROVED).
6. RTL: the shell is on the right; LTR: on the left; the logo is never flipped.
7. No horizontal overflow at 320 px.
8. Tests: component tests for each shell part; Playwright at 1440/768/390 for navigation, the
   drawer, the More sheet focus trap, axe and keyboard-only traversal.

## 18. Definition of Done

- The shell is implemented exactly once, and module phases only render content inside it.
- The universal checks pass.
- The phase report is written, `PROGRESS.md` is updated, and no later phase is started.

## 19. Risks

| Risk                                                                | Mitigation                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Breakpoints untested in a real shell                                | ADR-004 validation matrix before closure; fallback 75rem                     |
| Backdrop blur 16 performance on low-end phones                      | Measure; Figma value kept unless a performance issue is measured             |
| Figma vs D-R6 on Settings mobile (D-S1)                             | Decide before implementation                                                 |
| Pressed, focus and disabled states not designed for the icon button | D-NIB2/3 decisions; D-B2 ring                                                |
| R-2 (blank no-JS 404) still open                                    | Unchanged; Phase 22 gate                                                     |
| Placeholder (non-functional) triggers could mislead                 | `aria-haspopup` only where a real overlay opens; "coming soon" copy approved |

## 20. Open decisions

| ID      | Decision                                                                                                                                                                        | Recommendation                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-S1    | **Settings on mobile:** Figma shows the bottom-nav More as Active on Settings, but approved D-R6 (and the implemented `mobileBarIndicator`) gives no indicator on Settings      | Amend D-R6 so the visual More indicator follows Figma on `/settings` (account settings is in the More sheet). No canonical destination and no `aria-current` still apply. Otherwise keep D-R6 and deviate from Figma |
| D-S2    | Sticky Sidebar and Rail with internal scroll                                                                                                                                    | Approve                                                                                                                                                                                                              |
| D-S3    | Theme menu: Dark checked; Light and System disabled with "coming soon" copy                                                                                                     | Approve; copy to approve                                                                                                                                                                                             |
| D-S4    | Search: a visible Figma field (Desktop/Tablet) and button (Mobile) with no results until D-17. Field focusable and typeable, no submission, or a non-interactive "coming soon"? | Focusable field, no submission and no results (UI-complete, not functional); mobile button disabled until D-17                                                                                                       |
| D-S5    | Notifications: trigger only; no unread dot without data; does opening it show an empty Phase 03 `Popover`?                                                                      | Trigger renders, popover deferred to Phase 06/09 (button without `aria-haspopup` until then)                                                                                                                         |
| D-S6    | User menu on Tablet/Desktop: open the Figma User Menu (Phase 03 `Menu`) with Profile and Settings links now, logout hidden until D-02, or defer the whole menu?                 | Build the menu with the existing routes now; no logout                                                                                                                                                               |
| D-S7    | Upgrade card, Rail crown and More-sheet upgrade row target: none (inert), or `/settings/subscription` (an existing route)?                                                      | Link to `/settings/subscription`; no plan logic (D-18)                                                                                                                                                               |
| D-S8    | Drawer motion (not designed): slide from the inline start, 320/200 ms                                                                                                           | Approve (same as the Sheet)                                                                                                                                                                                          |
| ADR-004 | Breakpoints 45rem / 80rem and two new tokens                                                                                                                                    | Approve after review                                                                                                                                                                                                 |
| O-8     | Navigation Icon Button contract (D-NIB1–6)                                                                                                                                      | Approve with the recommendations                                                                                                                                                                                     |
| Copy    | All new shell strings (English, and any Arabic not in Figma)                                                                                                                    | Approve before the implementation PR merges                                                                                                                                                                          |

## 21. Team responsibilities (PROPOSED — nothing assigned)

| Role   | Responsibilities                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| Yousef | Product decisions (§20), design approvals, copy approval, final integration review, merges                           |
| Claude | Architecture, O-8 and shell implementation after approval, Design System integration, automated tests, documentation |
| Mariam | Only after delegation approval and a reviewed starter and handoff. Proposals below                                   |

**Proposed Mariam tasks** (each independently testable):

1. **`MobileNavItem` presentational component** (delegated files: `src/shared/layout/MobileNavItem.tsx`
   and its test).
   - **Figma:** `Mobile Navigation Item` `2210:302`.
   - **Depends on:** the approved O-8, ADR-004 and copy.
   - **Acceptance:** classes per Figma state; `aria-current` only when active; More variant
     without `aria-current`; jest-axe in RTL and LTR; `pnpm check` passes.
   - **Integration:** a `delivery/shell-mobile-nav-item-v1` branch from the recorded baseline, per
     `TEAM_COLLABORATION.md`.
2. **Shell visual QA checklist.**
   - **Deliverable:** a checklist plus screenshots comparing the implemented shell with Figma
     frames `2211:74`, `2224:372`, `2238:741`, `2242:1272` and `2236:972`, at 1440/768/390 in RTL
     and LTR.
   - **Depends on:** the shell being merged to a preview branch.
   - **Acceptance:** every Figma value in §5 checked, and differences listed with node ids.
   - **No code.**
3. **English shell copy review.**
   - **Deliverable:** a written note on the proposed English shell strings (§14) and their
     consistency with Phase 04 labels.
   - **Acceptance:** each string marked OK or Change, with a reason.
   - **No code.**
