# Phase 05 — Shared App Shell — Plan

- **Status:** **Plan with approved architecture (user, 2026-11-16). Phase 05 has not started.**
  Implementation needs a separate authorization.
  - **Approved:** ADR-004, the O-8 contract, and decisions D-S1 to D-S8 (§20).
  - **Still pending:** the new shell copy (§14), marked "Requires approval".
- **Baseline:** `main` at `72c8ad9` (Phase 04 CLOSED; risk R-2 OPEN).
- **Companion documents:**
  - [phase-05-navigation-icon-button-contract.md](phase-05-navigation-icon-button-contract.md)
    (O-8, Approved)
  - [ADR-004 — App-shell breakpoints](../decisions/ADR-004-shell-breakpoints.md) (Approved;
    thresholds subject to validation)
- **Notation:**
  - **FIGMA:** a verified Figma value.
  - **DECISION:** a product-owner decision.
  - **PROPOSED:** awaiting approval.

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
- **Mobile Top Bar** plus the **84 px bottom nav** with the More tab on every mobile screen.
- **More sheet:** the five remaining destinations, account settings, plan upgrade.
- **Top Bar:** search, language, theme ("coming soon" for Light and System), notifications, user
  menu.
- The **upgrade card** pinned at the bottom of the Sidebar and Rail.
- `aria-current="page"`, a skip link, mobile safe-area insets.
- The **Navigation Icon Button** (O-8, approved contract) is built first.

## 3. Exclusions (deferred, not built in Phase 05)

- **Search:** no results, input, index or backend (D-17).
- **Notifications:** no notification center, items, unread count or dot (D-17).
- **Authentication:** no logout, session or user data (D-02). The user trigger shows no name or
  role.
- **Plan upgrade:** no payment, checkout or subscription logic (D-18).
- **Themes:** no Light or System theme, switching or stored preference (D-16).
- **No Tooltip primitive** (O-6 stays deferred, D-NIB6).
- Module screens; Phase 06 overlay and guard infrastructure; Landing navigation (Phase 07); the
  Settings secondary-navigation UI (Phase 20).
- No new navigation system and no new dependencies.

## 4. Authoritative references

- Roadmap v1.0 Phase 05 and §3 (read-only).
- Handoff pp. 4 and 8.
- Phase 03 contracts: Sheet (D-SH3 is based on the More Menu), Popover/Menu, Avatar, Button, Card,
  Dialog.
- Phase 04 plan and closure: registry, `resolveActiveDestination`, `mobileBarIndicator`, D-R6.
- ADR-002, ADR-003, ADR-004.
- `docs/design-values.md` §2b.1 and the logos.
- The Next.js 16.4 docs.

## 5. Figma evidence (read-only, 2026-11-16, page 03 unless stated)

| Part                       | Verified values (FIGMA)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop `2211:74`          | Sidebar 232 at the inline start; Main 1208 with padding 24, gap 24. The Top Bar is the first child of Main and scrolls with the page                                                                                                                                                                                                                                                                                                                                                                                                      |
| Sidebar                    | Fill `7,8,10 @ 88%`; 1px inline-end border Sky 10%; padding 24/16; gap 20. Logo 168×55, divider (Sky 10%), nav (gap 6), spacer, then the **Upgrade Plan Card**: 199×166, radius 18, padding 16, gap 10, gradient, 1px Sky 30%; title "ترقية الخطة" 16; text 12; Primary Button "ترقية الآن" 44                                                                                                                                                                                                                                            |
| Sidebar Item `2210:118`    | 199×44, radius 12, padding 0/14, gap 12, icon 20, Cairo Medium 14. Default: Text/Secondary. Hover: Sky 7%. Pressed: Sky 14%. Active: Sky 12% + 1px Sky 22%, SemiBold, white, 3×22 Electric Sky accent bar                                                                                                                                                                                                                                                                                                                                 |
| Desktop Top Bar `2211:179` | 56 high. **User Menu Trigger** 219×54 (radius 14, padding 6/10, White 4%, Sky 12%; Avatar 40; name and role are sample data; chevron 16); divider 1×28 Sky 15%; **Language Switch** 86×38 (radius 12, padding 4; segments "EN"/"AR" 37×28, radius 9, active Sky 20%); **Theme Toggle** (O-8, `moon`); **Notifications** (O-8, `bell` + 9 px Coral "Unread Dot"); **Search Input** `2210:147` 440×44 (radius 12, padding 0/16, icon 18, placeholder "ابحث في محاضراتك، الملخصات أو الأسئلة..."; Focus Sky 70%; Filled with a clear button) |
| Tablet `2224:372`          | **Rail** 72: fill and border as the Sidebar; padding 20/16; gap 10. Logo mark 40 (r 10), divider (White 8%), menu, 8 destinations (Active `home`), spacer, upgrade (`crown`); all O-8. Top Bar: compact user trigger 88 (avatar only), search 353                                                                                                                                                                                                                                                                                         |
| Drawer `2242:1272`         | The expanded Sidebar (232, same content) at the inline start over a scrim (Void 66%). Prototype: menu → drawer; scrim → close. **No close button**                                                                                                                                                                                                                                                                                                                                                                                        |
| Mobile `2238:741`          | **Top Bar** 72: Void 88%, bottom border Sky 10%, **blur 16**, padding 0/20/0/14. Logo 121×40; actions (gap 6): user trigger 88, notifications wrapper 44, **Search Button** 44 (icon 18). Content padding 88 top / 108 bottom, 20 sides                                                                                                                                                                                                                                                                                                   |
| Bottom navigation          | 390×84, `7,8,10 @ 94%`, top border Sky 12%, **blur 16**, padding 8/16/16/16. Four **Mobile Navigation Items** `2210:302`: 76×60, radius 14, padding 8, gap 4, icon 22, Cairo 12; Active = Sky 12% + Sky label                                                                                                                                                                                                                                                                                                                             |
| More Menu Sheet `2236:972` | Fill `17,18,20 @ 98%`, 1px Sky 18%, padding 12/20/28/20, gap 8; grabber 40×4; header (title "المزيد" 20, close 40). Rows 56 high (radius 14, padding 0/12, gap 14, Sky 5% fill, Sky 10% border, 36 icon tile Sky 14%, icon 18, label 14). **Upgrade row:** Sky 12%, Sky 30%, Sky label                                                                                                                                                                                                                                                    |
| User Menu `2236:813`       | 256×224: header (sample name and role), items "الملف الشخصي" (`user`), "الإعدادات" (`settings`), "تسجيل الخروج" (`logout`)                                                                                                                                                                                                                                                                                                                                                                                                                |
| Notifications              | Dropdown title "الإشعارات", "تحديد الكل كمقروء", sample items, "عرض كل الإشعارات" (content Phase 06/09; not built)                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Active states              | Flashcards Mobile: bottom-nav **More = Active**. **Settings Mobile: More = Active** (see D-S1). Settings Tablet: no Rail item Active                                                                                                                                                                                                                                                                                                                                                                                                      |

## 6. Component inventory and dependency graph

| #   | Component (location)                                                             | Depends on                                                                                               | Independent?                                                                           |
| --- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | `NavigationIconButton` (`src/shared/ui`)                                         | O-8 contract; `Icon`; next-intl `Link`                                                                   | **Yes**: build first                                                                   |
| 2   | `AppShell` + `SkipLink` (`src/shared/layout`, `src/shared/a11y`)                 | ADR-004 `rail`/`xl`; `(app)` layout                                                                      | Yes (skeleton)                                                                         |
| 3   | `Sidebar`, `SidebarItem`, `UpgradeCard`                                          | Registry, `useActiveDestination`, Button (Primary), `Logo` Horizontal, routes (`/settings/subscription`) | After 2                                                                                |
| 4   | `TabletRail`, `TabletDrawer`                                                     | 1; 3 (the drawer reuses the Sidebar content); `useModalDialog` (Phase 03)                                | After 1 and 3                                                                          |
| 5   | `MobileTopBar`                                                                   | 1 (`lg`); 9; `Logo` Horizontal                                                                           | After 1 and 9                                                                          |
| 6   | `BottomNav`, **`MobileNavItem`**                                                 | Registry, `mobileBarIndicator`, `MORE_CONTROL`; More opens 7                                             | `MobileNavItem` is **independent** (Mariam candidate, §21); `BottomNav` comes after it |
| 7   | `MoreSheet`                                                                      | Phase 03 `Sheet`; `MORE_SHEET_DESTINATIONS`/`MORE_SHEET_EXTRAS`                                          | After 2                                                                                |
| 8   | `TopBar` (desktop and tablet)                                                    | 9; 10                                                                                                    | After 9 and 10                                                                         |
| 9   | Controls: `SearchTrigger`, `LanguageSwitch`, `ThemeMenu`, `NotificationsTrigger` | 1; Phase 03 `Popover` and `Menu`; next-intl navigation                                                   | After 1                                                                                |
| 10  | `UserMenu` (trigger + menu)                                                      | Phase 03 `Menu`, `Avatar` (decorative placeholder); routes                                               | After 1                                                                                |

- **Reused:** Phase 03 Button, Sheet, Popover, Menu, Avatar, Card, `Icon`, `Logo`,
  `useModalDialog`, and the Phase 04 navigation utilities.
- **No duplicate primitives:**
  - The shell search **trigger** is not a second `Input`.
  - The drawer is not a second Sheet: it uses the shared modal lifecycle with a side-panel layout.

## 7. Layout architecture

- `(app)/layout.tsx` renders `AppShell`, which replaces the Phase 04 placeholder layout. `(focus)`
  stays shell-less.
- `AppShell` holds the `SkipLink`, labelled `nav` landmarks, the `header` (Top Bar) and
  `main#main-content`.
- Active state comes **only** from `useActiveDestination()` and `mobileBarIndicator()`, both
  unchanged from Phase 04. Labels come from messages; there are no hardcoded paths.
- The Phase 04 `ActiveDestinationProbe` is removed when the shell renders the real active state.

## 8. Responsive architecture

- **Mobile (< 45rem):**
  - fixed Top Bar and bottom nav (FIGMA blur 16);
  - content padding 88/108 plus safe-area insets;
  - search as an O-8 `lg` button; compact user trigger.
- **Tablet (`rail:`):**
  - sticky Rail 72, full viewport height, internal scroll;
  - drawer from the menu button;
  - compact Top Bar.
- **Desktop (`xl:`):**
  - sticky Sidebar 232, full viewport height, internal scroll (D-S2);
  - full Top Bar.
- The Top Bar scrolls with the content on Tablet and Desktop (FIGMA). Main content scrolls
  independently of the sticky navigation.

## 9. Breakpoints (ADR-004, Approved; subject to validation)

| Shell   | Range                                                   |
| ------- | ------------------------------------------------------- |
| Mobile  | < 45rem (720 px)                                        |
| Rail    | 45rem – < 80rem (`rail:`, the one new theme breakpoint) |
| Sidebar | ≥ 80rem (1280 px) (`xl:`, Tailwind default)             |

- **Validation:**
  - boundary regression tests at 719/720 and 1279/1280;
  - 200% and 400% zoom;
  - 20 and 24 px root font sizes;
  - RTL and LTR;
  - short heights;
  - safe areas.
- A failing threshold needs a **documented ADR revision**.

## 10. Navigation behaviour

- The **same registry** feeds the Sidebar, Rail, drawer, bottom bar and More sheet.
- The active destination has the Active visual plus `aria-current="page"`, on exactly one item per
  surface.
- **Bottom-bar More (D-R6, D-S1):**
  - More is a `button` with `aria-haspopup="dialog"` and `aria-expanded`. It is **never**
    `aria-current`.
  - Its **visual** "contains the current destination" state follows `mobileBarIndicator`, i.e.
    only for the five More-sheet destinations.
  - **Settings does not light More** (D-S1).
- **More sheet:**
  - the 5 destinations (the active one gets `aria-current="page"`);
  - "إعدادات الحساب" → `/settings`;
  - the upgrade row → `/settings/subscription` (D-S7).
- Destination changes close the drawer and the More sheet.

## 11. Interaction requirements (DECISIONS, 2026-11-16)

| #   | Topic                       | Decision and specification                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Sticky Sidebar (D-S2)       | Sticky, full viewport height, internal vertical scroll. All destinations reachable at short heights, nothing clipped, RTL and LTR, main content scrolls independently                                                                                                                                                                                                                                                                                                            |
| 2   | Tablet drawer (D-S8)        | Native modal dialog through `useModalDialog`: focus trap, scroll lock, Esc, scrim and destination change close it; focus returns to the Rail menu button. Motion: slide from the inline start with `duration-slow` in and `duration-base` out, `ease-standard`, `--motion-distance` (reduced motion = opacity only). Same lifecycle as the Dialog and Sheet, so nested overlays (a Menu inside, or a Dialog opened from it) keep Phase 03 behaviour: Esc closes the topmost only |
| 3   | Mobile More sheet           | Phase 03 `Sheet` (grabber, close 40, title "المزيد"): focus trap, Esc, scrim, close, destination change; focus returns to More                                                                                                                                                                                                                                                                                                                                                   |
| 4   | Theme (D-S3)                | O-8 trigger (`moon`) opens a Phase 03 `Menu` with radio items. **Dark** is checked; **Light** and **System** are disabled menu items labelled "coming soon". No switching and no stored preference                                                                                                                                                                                                                                                                               |
| 5   | Search (D-S4)               | **No text field.** Desktop/Tablet: a `button` styled as the Figma search box (icon + placeholder text). Mobile: the O-8 `lg` search button. Activating opens a Phase 03 `Popover` with a short "search is coming soon" message (copy §14). No input, results or backend                                                                                                                                                                                                          |
| 6   | Notifications (D-S5)        | O-8 trigger (`bell`). **No unread dot, no count, no fake items.** Activating opens a Phase 03 `Popover` titled "الإشعارات" (FIGMA) with a "notifications are coming soon" message (copy §14)                                                                                                                                                                                                                                                                                     |
| 7   | User menu (D-S6)            | The trigger shows the decorative Avatar placeholder (no user data; no name or role) and opens a Phase 03 `Menu` with **"الملف الشخصي" → `/settings`** (Profile Overview, an existing route). **No logout** (D-02). "الإعدادات" is in Figma, but its target is not an approved route (§20, D-S9)                                                                                                                                                                                  |
| 8   | Upgrade (D-S7)              | Card button, Rail `crown` and More-sheet row → **`/settings/subscription`** through the locale-aware `Link`. No payment, checkout, subscription or billing logic                                                                                                                                                                                                                                                                                                                 |
| 9   | Settings access             | Mobile: the More sheet's "إعدادات الحساب". Tablet/Desktop: the user menu's "الملف الشخصي". No destination is active on `/settings` (D-R6)                                                                                                                                                                                                                                                                                                                                        |
| 10  | Focus management            | Skip link first. Overlays trap focus and return it to their trigger. Route changes use Next's route announcer                                                                                                                                                                                                                                                                                                                                                                    |
| 11  | Scroll locking              | The drawer and More sheet use the `useModalDialog` scroll lock (no layout shift); popovers do not lock scroll                                                                                                                                                                                                                                                                                                                                                                    |
| 12  | Escape                      | Closes the topmost overlay only                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 13  | Screen-reader announcements | Labelled `nav` landmarks; `aria-current` on active items; `aria-expanded` and `aria-haspopup` on triggers; route changes announced; popover messages announced on open                                                                                                                                                                                                                                                                                                           |
| 14  | Reduced motion              | Drawer and sheet = opacity only; controls = colour fades only                                                                                                                                                                                                                                                                                                                                                                                                                    |

## 12. Accessibility requirements

- WCAG 2.2 AA:
  - visible D-B2 focus ring;
  - keyboard-only traversal of every shell part;
  - targets ≥ 24 (40 desktop and tablet, 44 mobile actions; bottom-nav items 76×60);
  - rendered contrast measured in Chromium;
  - axe on the shell in RTL and LTR.
- Landmarks: one `header`, labelled `nav` regions, one `main`. The skip link is visible on focus.
- No colour-only state: Active pairs with `aria-current`, and the Sidebar Item has its accent bar.
- Every icon-only control has an accessible name; there are no tooltips (D-NIB6).

## 13. Design System dependencies

- **Existing:** colour, spacing and radius tokens, motion tokens, `Icon`, `Logo`, Button, Sheet,
  Popover, Menu, Avatar, Card, `useModalDialog`.
- **New (approved):**
  - `NavigationIconButton` (O-8);
  - one theme breakpoint `--breakpoint-rail: 45rem` (ADR-004);
  - `viewportFit: "cover"`.
- **Deferred primitives (ADR-002):**

| Primitive                  | Phase 05                                                                       | First consumer                               |
| -------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| Navigation Icon Button     | **Essential**                                                                  | Tablet Rail; Top Bar theme and notifications |
| Tooltip                    | **Deferred** (D-NIB6): accessible names suffice                                | —                                            |
| Generic Badge              | **Not needed**: no unread indicator without data (D-S5)                        | —                                            |
| Select, Radio              | **Not needed**: the theme menu is a menu (`MenuItemRadio`), not a form control | —                                            |
| Textarea, Checkbox, Switch | Not needed                                                                     | —                                            |

## 14. Internationalization and bilingual copy

- Phase 04 navigation labels (destinations, More, More-sheet extras) are **approved and
  unchanged**.
- New shell strings go in a new `shell` namespace and **require approval** before the
  implementation PR merges.
- Logical properties only: the shell is on the right in RTL and on the left in LTR, and the logo
  never flips.

| UI location                                       | Arabic                                                                                         | English                                                                                    | Source                             | Figma status           | Proposed change                    | Approval                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------- | ---------------------------------- | ------------------------------------------------------------- |
| Sidebar, Rail, drawer, bottom nav: 8 destinations | الرئيسية · محاضراتي · الملخصات · الأسئلة · البطاقات التعليمية · الملاحظات · المفضلة · المجلدات | Dashboard · My Lectures · Summaries · Questions · Flashcards · Notes · Favorites · Folders | Handoff / Figma; EN D-R7           | Verified               | None                               | **Approved (Phase 04)**                                       |
| Bottom nav: More                                  | المزيد                                                                                         | More                                                                                       | Figma                              | Verified               | None                               | **Approved (Phase 04)**                                       |
| More sheet: account settings and upgrade rows     | إعدادات الحساب · ترقية الخطة                                                                   | Account settings · Upgrade plan                                                            | Figma                              | Verified               | None                               | **Approved (Phase 04)**                                       |
| More sheet: title                                 | المزيد                                                                                         | More                                                                                       | Figma                              | Verified               | Reuse `nav.more`                   | **Approved (Phase 04)**                                       |
| More sheet: close button name                     | إغلاق                                                                                          | Close                                                                                      | Claude (Phase 03 usage)            | Icon only in Figma     | —                                  | Requires approval                                             |
| Upgrade card: title                               | ترقية الخطة                                                                                    | Upgrade plan                                                                               | Figma                              | Verified               | Reuse `nav.moreExtras.upgradePlan` | AR approved; EN approved (Phase 04)                           |
| Upgrade card: description                         | افتح ميزات أكثر: أسئلة غير محدودة وملخصات أذكى.                                                | Unlock more: unlimited questions and smarter summaries.                                    | Figma; EN Claude                   | Verified (AR)          | —                                  | AR verified; EN requires approval                             |
| Upgrade card: button                              | ترقية الآن                                                                                     | Upgrade now                                                                                | Figma; EN Claude                   | Verified (AR)          | —                                  | AR verified; EN requires approval                             |
| Rail: upgrade button name                         | ترقية الخطة                                                                                    | Upgrade plan                                                                               | Figma (instance name)              | Verified               | Reuse                              | **Approved (Phase 04)**                                       |
| Rail: menu button name                            | فتح القائمة                                                                                    | Open menu                                                                                  | Claude                             | Icon only              | —                                  | Requires approval                                             |
| Drawer: dialog name                               | القائمة                                                                                        | Menu                                                                                       | Claude                             | —                      | —                                  | Requires approval                                             |
| Search trigger (desktop and tablet text)          | ابحث في محاضراتك، الملخصات أو الأسئلة...                                                       | Search your lectures, summaries or questions...                                            | Figma placeholder; EN Claude       | Verified (AR)          | Used as the trigger's visible text | AR verified; EN requires approval                             |
| Search button name (mobile)                       | البحث                                                                                          | Search                                                                                     | Claude                             | Icon only              | —                                  | Requires approval                                             |
| Search popover message                            | البحث غير متاح حاليًا، وسيتوفر قريبًا.                                                           | Search isn't available yet. It's coming soon.                                              | Claude                             | Not designed           | —                                  | Requires approval                                             |
| Notifications button name and popover title       | الإشعارات                                                                                      | Notifications                                                                              | Figma (dropdown title)             | Verified (AR)          | —                                  | AR verified; EN requires approval                             |
| Notifications popover message                     | الإشعارات غير متاحة حاليًا، وستتوفر قريبًا.                                                      | Notifications aren't available yet. They're coming soon.                                   | Claude                             | Not designed           | —                                  | Requires approval                                             |
| Theme trigger name                                | المظهر                                                                                         | Theme                                                                                      | Claude                             | Icon only              | —                                  | Requires approval                                             |
| Theme option: Dark                                | داكن                                                                                           | Dark                                                                                       | Claude                             | Not designed           | —                                  | Requires approval                                             |
| Theme option: Light                               | فاتح — قريبًا                                                                                   | Light — coming soon                                                                        | Claude                             | Not designed           | —                                  | Requires approval                                             |
| Theme option: System                              | حسب النظام — قريبًا                                                                             | System — coming soon                                                                       | Claude                             | Not designed           | —                                  | Requires approval                                             |
| User menu trigger name                            | قائمة الحساب                                                                                   | Account menu                                                                               | Claude                             | Shows sample user data | No name or role without auth       | Requires approval                                             |
| User menu: profile item                           | الملف الشخصي                                                                                   | Profile                                                                                    | Figma; EN as Phase 04 settings nav | Verified (AR)          | → `/settings`                      | AR verified; EN approved (Phase 04 `nav.settingsNav.profile`) |
| User menu: settings item                          | الإعدادات                                                                                      | Settings                                                                                   | Figma                              | Verified (AR)          | Not shown until D-S9 is decided    | Pending D-S9                                                  |
| User menu: logout                                 | تسجيل الخروج                                                                                   | Log out                                                                                    | Figma                              | Verified (AR)          | **Not shown** (D-02)               | Deferred                                                      |
| Language switch: segments                         | EN · AR                                                                                        | EN · AR                                                                                    | Figma                              | Verified               | —                                  | Verified                                                      |
| Language switch: group name                       | اللغة                                                                                          | Language                                                                                   | Claude                             | —                      | —                                  | Requires approval                                             |
| Language switch: segment names                    | English · العربية                                                                              | English · العربية                                                                          | Claude                             | —                      | Full names for screen readers      | Requires approval                                             |
| Landmarks: desktop, tablet and mobile navigation  | التنقل الرئيسي                                                                                 | Main navigation                                                                            | Claude                             | —                      | —                                  | Requires approval                                             |
| Landmark: bottom navigation                       | التنقل السفلي                                                                                  | Bottom navigation                                                                          | Claude                             | —                      | —                                  | Requires approval                                             |
| Skip link                                         | تخطَّ إلى المحتوى                                                                                | Skip to content                                                                            | Claude                             | Not designed           | —                                  | Requires approval                                             |
| Logo alt text                                     | MUNSIT AI                                                                                      | MUNSIT AI                                                                                  | Brand (`common.brand.name`)        | Verified               | —                                  | **Approved** (brand)                                          |

## 15. Implementation sequence (after authorization)

1. `NavigationIconButton` (#1): component, tests, gallery.
2. The `rail` breakpoint token, `viewportFit`, the `AppShell` skeleton and `SkipLink` (#2).
3. `Sidebar`, `SidebarItem`, `UpgradeCard` (#3).
4. `TabletRail`, `TabletDrawer` (#4).
5. Shell controls (#9) and `UserMenu` (#10), then `TopBar` (#8) and `MobileTopBar` (#5).
6. `MobileNavItem` (#6; Mariam candidate), then `BottomNav` (#6) and `MoreSheet` (#7).
7. Remove `ActiveDestinationProbe`; E2E reads the real `aria-current`.
8. ADR-004 validation matrix; tests; screenshots; copy approval; closure report; `PROGRESS.md`;
   PR.

## 16. Testing strategy

- **Unit tests for each shell part:**
  - registry-driven rendering;
  - exactly one `aria-current` per surface (none on Settings);
  - More never `aria-current` and **not lit on Settings** (D-S1);
  - user menu without logout;
  - search and notifications open availability popovers only;
  - theme options: Dark checked, Light and System disabled;
  - upgrade targets `/settings/subscription`;
  - type-level API checks;
  - jest-axe in RTL and LTR.
- **Playwright:**
  - the ADR-004 matrix (320, 390, 719/720, 768, 1024, 1279/1280, 1440; RTL and LTR; 200% and
    400% zoom; 20 and 24 px root font; short heights; safe areas);
  - drawer open/close (scrim, Esc, destination change) and focus return;
  - More sheet focus trap;
  - nested overlay Esc order;
  - keyboard-only traversal;
  - axe;
  - computed Figma values;
  - rendered contrast;
  - reduced motion;
  - sticky navigation with independent main scroll.

## 17. Acceptance criteria (Roadmap Phase 05)

1. The same registry is used in all five navigation shells.
2. Breakpoints are chosen by testing content space and recorded in ADR-004, with the validation
   matrix passed.
3. The Sidebar is sticky to the viewport height with the upgrade card visible (D-S2).
4. No fixed artboard heights.
5. The More tab shows active for destinations inside it (APPROVED, D-R6).
6. RTL: shell on the right; LTR: on the left; the logo is never flipped.
7. No horizontal overflow at 320 px.
8. Component tests for each part; Playwright at 1440/768/390 for navigation, the drawer, the More
   sheet focus trap, axe and keyboard-only traversal.

## 18. Definition of Done

- The shell is implemented exactly once, and module phases only render content inside it.
- The universal checks pass, and all shell copy is approved.
- The phase report is written, and `PROGRESS.md` is updated (O-8 delivered).
- No later phase is started.

## 19. Risks

| Risk                                             | Mitigation                                                     |
| ------------------------------------------------ | -------------------------------------------------------------- |
| A threshold fails validation                     | A documented ADR-004 revision (fallback 75rem for the Sidebar) |
| Backdrop blur 16 performance on low-end phones   | Measure; keep the FIGMA value unless a problem is measured     |
| The D-S1 Figma deviation is visible to designers | Documented here and in the closure report                      |
| "Coming soon" controls feel broken               | Explicit popover messages (D-S4, D-S5); copy approval          |
| R-2 (blank no-JS 404) still open                 | Unchanged; Phase 22 gate                                       |

## 20. Decisions

| ID      | Decision (user, 2026-11-16)                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Status                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| D-S1    | **D-R6 preserved.** Settings resolves to no canonical destination, and **Settings does not light More**, even though Settings is reached through the More sheet. More may visually indicate that it contains an active destination (the five More-sheet destinations only) and never gets `aria-current`. **Documented discrepancy:** Figma "Settings / 01 Profile Overview / Mobile" (`2463:2538`) shows More as Active. The resolver and `mobileBarIndicator` are unchanged | **Approved**               |
| D-S2    | Sticky desktop Sidebar (and Rail) with internal scrolling; every destination reachable; short heights, RTL and LTR verified; independent main scroll                                                                                                                                                                                                                                                                                                                          | **Approved**               |
| D-S3    | Dark only. Light and System are clearly unavailable ("coming soon"). No switching, no stored preference. Uses the Phase 03 `Menu`                                                                                                                                                                                                                                                                                                                                             | **Approved**               |
| D-S4    | A search trigger only, opening an availability message. No text field, results or backend                                                                                                                                                                                                                                                                                                                                                                                     | **Approved**; copy pending |
| D-S5    | A notifications trigger only, opening an availability message. No notification center, unread count or dot                                                                                                                                                                                                                                                                                                                                                                    | **Approved**; copy pending |
| D-S6    | The user menu uses existing approved routes only ("الملف الشخصي" → `/settings`). No logout, no session management                                                                                                                                                                                                                                                                                                                                                             | **Approved**               |
| D-S7    | Upgrade card, Rail upgrade and More-sheet upgrade → `/settings/subscription` through the locale-aware `Link`; no billing integration                                                                                                                                                                                                                                                                                                                                          | **Approved**               |
| D-S8    | Drawer motion with existing tokens and reduced-motion support; scrim, Esc and destination close; focus return; scroll lock; focus trap; nested overlays compatible with the Dialog and Sheet                                                                                                                                                                                                                                                                                  | **Approved**               |
| D-S9    | Figma's user-menu item "الإعدادات": hide it, or point it at an existing Settings route (for example `/settings/preferences`)?                                                                                                                                                                                                                                                                                                                                                 | **Open**                   |
| ADR-004 | Breakpoints 45rem / 80rem (`rail` + `xl`), subject to validation                                                                                                                                                                                                                                                                                                                                                                                                              | **Approved**               |
| O-8     | Navigation Icon Button contract, D-NIB1 to D-NIB6                                                                                                                                                                                                                                                                                                                                                                                                                             | **Approved**               |
| Copy    | The "Requires approval" rows in §14                                                                                                                                                                                                                                                                                                                                                                                                                                           | **Open**                   |

## 21. Team responsibilities and Mariam delegation (approved in principle; nothing assigned)

| Role   | Responsibilities                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Yousef | Product decisions, design approvals, copy approval, final integration review, merges                                        |
| Claude | Architecture, O-8 and all other shell components, Design System integration, automated tests, documentation                 |
| Mariam | **Approved in principle.** No task is assigned, and no starter package or branch exists until the user approves the handoff |

### 21.1 Primary candidate: `MobileNavItem` (implementation)

- **Start condition:**
  - O-8 merged;
  - the registry contract unchanged since Phase 04 (`DESTINATIONS`, `MORE_CONTROL`,
    `mobileBarIndicator`);
  - this API frozen;
  - the starter package built from that `main` commit.
- **Delegated files (only these):**
  - `src/shared/layout/MobileNavItem.tsx`
  - `src/shared/layout/MobileNavItem.test.tsx`
  - Claude does **not** touch them while delegated. `BottomNav`, which consumes them, is built by
    Claude **after** integration.
- **API:**

  ```tsx
  type MobileNavItemProps =
    | { kind: "destination"; icon: IconName; label: string; href: RoutePath; active: boolean }
    | {
        kind: "more";
        icon: "more";
        label: string;
        onOpen: () => void;
        expanded: boolean;
        containsActive: boolean;
      };
  ```

  - `destination` renders a next-intl `Link`, with `aria-current="page"` when `active`.
  - `more` renders a `button` with `aria-haspopup="dialog"`, `aria-expanded={expanded}` and
    **never** `aria-current`. `containsActive` only switches the Active visual.

- **Figma:** `Mobile Navigation Item` `2210:302` (Default / Active); Dashboard Mobile bottom nav
  (`2238:741`).
- **Tokens and classes (FIGMA):**
  - box: `w-[76px] h-[60px] rounded-[14px] p-[8px]` (padding 8 is a local value; the `xs` token
    is 4);
  - layout: `flex-col gap-xs` (gap 4 = the `xs` token);
  - icon: 22;
  - label: `text-dashboard-caption` (Cairo 12);
  - Default: `text-text-secondary`;
  - Active: `bg-accent-electric-sky/12 text-accent-electric-sky`;
  - focus ring D-B2;
  - hover on fine pointers only; no hover is designed, so none is added.
- **Accessibility:**
  - the visible label is the accessible name;
  - the icon is `aria-hidden`;
  - the target is 76×60;
  - contrast is measured at integration.
- **Tests:**
  - classes per state;
  - link vs button;
  - `aria-current` only for an active destination;
  - More never `aria-current`, with `aria-expanded` passed through;
  - jest-axe in RTL and LTR;
  - `@ts-expect-error` for mixing the kinds and for `aria-current` on More;
  - `corepack pnpm check` passes.
- **Integration procedure** (`TEAM_COLLABORATION.md`):
  1. A `delivery/shell-mobile-nav-item-v1` branch from the recorded baseline.
  2. Apply only the two files.
  3. `git status` matches the manifest.
  4. Commit the delivery separately from integration fixes.
  5. Rebase, run all checks, and merge through a PR.
- **Definition of Done:** the files and tests merged; `pnpm check` passes; Claude's `BottomNav`
  consumes the component without changing it; screenshots at 390 and 320 in RTL and LTR.

### 21.2 Visual QA against Figma (no code)

- **Deliverable:** a checklist plus screenshots comparing the implemented shell with frames
  `2211:74`, `2224:372`, `2238:741`, `2242:1272`, `2236:972` and `2236:813` at 1440/768/390, in RTL
  and LTR.
- **Depends on:** the shell on a preview branch.
- **Acceptance:** every FIGMA value in §5 checked; differences listed with node ids.

### 21.3 English shell copy review (no code)

- **Deliverable:** a written note on every "Requires approval" English string in §14, each marked
  OK or Change with a reason, and checked for consistency with the Phase 04 labels.
- **Depends on:** this plan.
