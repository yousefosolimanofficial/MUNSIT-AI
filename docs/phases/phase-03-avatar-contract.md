# Component contract — Avatar (Phase 03, Avatar V1)

- **Status:** **Approved — final** (2026-11-16). D-AV1 to D-AV6 approved by the user with
  refinements (§12). The D-AV1 contrast verification required a stop adjustment (§2.4, N-1);
  it uses existing tokens only.
- **Owner:** Yousef. **Ownership change (user, 2026-11-16):** Phase 03 is finished by Yousef
  and Claude; Mariam joins from Phase 04. The offline Avatar assignment is not issued.
  Implemented on `feature/03-avatar-v1`: `src/shared/ui/Avatar.tsx`, `Avatar.test.tsx`, a
  gallery section and `tests/e2e/dev-components-avatar.spec.ts`.
- **Baseline:** the starter is built from the `main` commit that contains this approved contract
  (not starter v4).
- **Figma:** file `Avyn9kL0drXepQyTXTLXXb`, read-only with the Figma MCP and Plugin API on
  2026-11-16. Pages searched: Design System, Dashboard, AI Tutor, Profile & Settings. Figma is
  not modified.

## 1. What Figma contains

There is no Avatar on the Design System page. Two families exist:

| #   | Family                  | Figma                                                                                                                                                                                                                                                         | Size   | Avatar V1                                      |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------- |
| 1   | **Top Bar user avatar** | Frame `Avatar` inside `User Menu Trigger` on every screen, e.g. Dashboard Desktop `2211:179`, Mobile `2238:755`, Settings `2463:1177` (30+ instances)                                                                                                         | 40     | **Yes** (`size={40}`)                          |
| 2   | **User Menu avatar**    | `User Menu` component `2236:813` → `Account` header avatar `2236:790` (3 instances: Desktop, Tablet, Mobile)                                                                                                                                                  | 40     | **Yes** (`size={40}`)                          |
| 3   | **Profile avatar**      | Component set `Profile / Avatar` `2461:651`: `State=Initials` `2461:626`, `Photo` `2461:628`, `Hover` `2461:633`, `Uploading` `2461:642`, `Failed` `2461:645`; used in the Settings `Avatar Row` (`2463:3503`, `2463:3913`, `2463:4251`) and the Avatar Modal | 96     | **Yes** (`size={96}`): Initials and Photo only |
| 4   | AI Tutor portraits      | `Avatar Portrait / Adam` `2339:440`, `/ Nour` `2339:448`, `/ Munsit` `2339:457` (image rectangles, no radius), in `Avatar Card` `2339:682`, `Avatar Panel`, `Prefs / Tutor Avatar` `2461:1033`                                                                | 64–220 | **No**: AI Tutor / Settings module content     |

Component description of `2461:651`: "Initials avatar (default), representative photo, hover,
uploading, upload failed. No real upload."

## 2. Exact values (FIGMA)

### 2.1 Size 40 (Top Bar and User Menu)

| Property | Top Bar (`2211:179`, 30+ instances)                                           | User Menu (`2236:790`, 3 instances)                                                               |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Box      | 40 × 40, radius 20 (circle)                                                   | 40 × 40, radius 20                                                                                |
| Fill     | Linear gradient **Electric Sky → Cobalt Edge**, horizontal (left → right)     | Linear gradient **Electric Sky → Cobalt Edge**, 135° (top-left → bottom-right), end stop at ≈ 71% |
| Border   | 1px Electric Sky **40%**, inside                                              | none                                                                                              |
| Initials | One letter "أ", `Dashboard/Card Title` (Cairo SemiBold 16/24), **Void Black** | One letter, `Dashboard/Card Title`, **Text / Primary (white)**                                    |

### 2.2 Size 96 (Profile)

| Variant   | Values                                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initials  | 96 × 96, radius 48; gradient **Cobalt Edge → Electric Sky**, 135°, end ≈ 71%; border **2px Electric Sky 50%**, inside; two letters "أم", `Dashboard/Title L` (Cairo Bold 28/40), white |
| Photo     | "Representative photo": **Graphite `#1b1c1e`** fill, same border, `Icon / user` **44**, Text / Secondary (no real image is drawn)                                                      |
| Hover     | Initials + `Change Overlay` (black 55%, `upload` icon 22 + "تغيير" Caption): **upload affordance of the Profile module**                                                               |
| Uploading | "60%" `Dashboard/Stat Small` + Electric Sky progress ring: **Profile module**                                                                                                          |
| Failed    | Border Coral Pulse 80%, `alert` icon 34: **Profile module**                                                                                                                            |

### 2.3 Other facts

- Gradient colors are existing tokens: Electric Sky `#63a1ff`, Cobalt Edge `#143ca3`
  (`--color-accent-cobalt-edge`). Graphite and Text / Secondary are tokens.
- Responsive: the same sizes on Desktop, Tablet and Mobile (Top Bar 40 everywhere; Profile 96 in
  every Settings layout). Only the surrounding trigger changes (219 vs 88 wide).
- RTL / LTR: only RTL frames. A circle has no direction; the Top Bar's horizontal gradient is the
  only directional detail, and it is normalized away (N-1).
- No focus, hover or motion on the avatar itself; the **User Menu Trigger** that contains it is
  the interactive element (Popover/Menu and the Phase 05 shell).

### 2.4 Contrast verification (D-AV1)

Method: the CSS gradient is evaluated across the **whole circle** in steps of 0.1% of the gradient
line (sRGB interpolation, as browsers render it), and the **minimum** ratio against the text
color is reported, including the lightest region. No averages or single sample points. Text
requirement: 4.5:1 at 40 (16px SemiBold is normal text), 3:1 at 96 (28px Bold is large text);
target ≥ 5:1 at both.

| Fill                                                     | White minimum | Void Black minimum | Result                                     |
| -------------------------------------------------------- | ------------- | ------------------ | ------------------------------------------ |
| Top Bar (Figma): Sky → Cobalt, horizontal                | 2.60          | 2.14               | fails                                      |
| Profile (Figma): Cobalt → Sky, 135°                      | 2.60          | 2.14               | fails                                      |
| User Menu (approved proposal): Sky 0% → Cobalt 71%, 135° | **2.60**      | 2.14               | **fails** in the Sky corner                |
| Sky −58% → Cobalt 71%, 135°                              | 4.51          | —                  | AA at 40 and 96, no margin                 |
| **Sky −80% → Cobalt 71%, 135° (implemented)**            | **5.01**      | —                  | **AA with ≥ 5:1 everywhere in the circle** |
| Solid Cobalt Edge (for reference)                        | 9.52          | —                  | passes, but loses the gradient             |

The smallest token-only adjustment that reaches the 5:1 target moves only the Electric Sky stop
(to −80%). Colors, tokens, angle and the Cobalt stop are unchanged; the lightest visible color
becomes `rgb(57,107,206)` (an interpolation of the two tokens) instead of pure Electric Sky. The
placeholder icon (Text / Secondary on Graphite) measures 6.22:1.

## 3. Implemented values (existing tokens only)

| Part                            | Value                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Root                            | `<span>`, `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full select-none`                 |
| Fill (initials)                 | `bg-[linear-gradient(135deg,var(--color-accent-electric-sky)_-80%,var(--color-accent-cobalt-edge)_71%)]` (D-AV1, N-1) |
| Size 40                         | `size-[40px] border border-accent-electric-sky/40`; initials `text-dashboard-card-title text-text-primary`, 1 letter  |
| Size 96                         | `size-[96px] border-2 border-accent-electric-sky/50`; initials `text-dashboard-title-l text-text-primary`, 2 letters  |
| Image                           | `<img>` `size-full object-cover`, `alt=""`, `decoding="async"`, `draggable={false}`; the root's border stays on top   |
| Placeholder (no name, no image) | `bg-color-surface-graphite`, `Icon user` 44 (96) / 18 (40), `text-text-secondary`                                     |

Sizes, radius, border widths and the stop positions are local constants. **No new token, no new
color, no new dependency, no global CSS, no `next.config` change.**

## 4. API (final)

```ts
"use client"; // the image error fallback needs state

export const AVATAR_SIZES = [40, 96] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

interface AvatarBaseProps {
  size?: AvatarSize; // default 40
  src?: string; // optional image
  ref?: Ref<HTMLSpanElement>; // React 19 prop
  className?: string; // layout only, merged last
}

/** Meaningful avatar: announced as an image named by `name`. */
interface MeaningfulAvatarProps extends AvatarBaseProps {
  name: string;
  decorative?: false;
}

/** Decorative avatar: hidden from assistive technology; `name` only feeds the initials. */
interface DecorativeAvatarProps extends AvatarBaseProps {
  decorative: true;
  name?: string;
}

export type AvatarProps = MeaningfulAvatarProps | DecorativeAvatarProps;
```

- **Meaningful avatars require a name** (compile-time). **Decorative avatars may omit it.**
- A nameless avatar is therefore decorative by type. At runtime, a meaningful avatar whose name
  has **no letter** after trimming (e.g. `"  "`) is also rendered decorative: there is no
  accessible name to give, and an empty label is never rendered.
- No other props: no handlers, `role`, `tabIndex`, `alt`, `children`, `variant`, `status`,
  `label` or other sizes. Avatar is not interactive.

## 5. Image, initials and fallback behavior

1. **Image:** when `src` is a non-empty string, render `<img>` covering the circle. Plain `<img>`,
   not `next/image`: the image host is not known (backend NOT VERIFIED) and `next/image` would
   need a `next.config` change. Exactly one line is allowed above it:
   `// eslint-disable-next-line @next/next/no-img-element -- image host not verified; next/image needs next.config (contract §5)`.
2. **Error:** `onError` → show the initials (or the placeholder); a new `src` resets the error.
3. **Initials** (D-AV3), deterministic:
   - trim `name` and split on whitespace (`/\s+/u`; covers non-breaking and Unicode spaces);
   - keep only words that contain a letter (`/\p{L}/u`);
   - in each word take the **first grapheme that starts with a letter**, using
     `new Intl.Segmenter(undefined, { granularity: "grapheme" })` (combining marks such as
     harakat stay with their letter);
   - size 40 → that grapheme of the first word; size 96 → first word + last word (one word → one
     letter);
   - Latin letters `toUpperCase()` (locale-independent); Arabic is unchanged;
   - two letters are joined with **U+200C (zero-width non-joiner)** so they never join
     cursively into a word; each letter is rendered in its isolated form;
   - rendered in `<span dir="auto" aria-hidden="true">`.
4. **Placeholder:** no letter in the name (or no name) **and** no usable image → Graphite +
   `user` icon (§3).
5. No loading spinner, skeleton or blur-up.

## 6. Accessibility

- **Meaningful (default):** root `role="img"` + `aria-label={name.trim()}`; initials, icon and
  image are hidden (`aria-hidden` / `alt=""`), so the name is announced once.
- **Decorative:** root `aria-hidden="true"`, no role, no label — for places where the name is
  visible next to the avatar (Top Bar trigger, User Menu header), to avoid a double announcement.
- Never focusable; no tooltip.
- Contrast per §2.4: ≥ 5:1 for the initials everywhere in the circle at both sizes; re-measured
  in Chromium at integration.
- RTL / LTR: no directional layout; `dir="auto"` on the initials.

## 7. Motion

None (D-AV6). Avatar is static and non-interactive; the trigger that contains it owns hover,
focus, press feedback and any motion. No hover, scale, entrance or image fade-in.

## 8. Required tests (`Avatar.test.tsx`, jsdom)

1. **Initials:** "أحمد محمود" → "أ" (40) and `"أ\u200Cم"` (96); one word → one letter at 96;
   "sara ahmed" → "S" / `"S\u200CA"`; "أَحمد محمود" at 40 → "أَ" (mark kept); leading, trailing,
   double and non-breaking spaces ignored; "(Sara) 2024 Ahmed" at 96 → `"S\u200CA"` (punctuation
   and digit-only words skipped).
2. **Image:** `src` → `<img alt="">` with `object-cover`; `fireEvent.error(img)` → initials and no
   `<img>`; rerender with another `src` → `<img>` again; `src=""` → initials.
3. **Placeholder:** decorative without `name` and no `src` → Graphite class + `user` icon, at 40
   (icon 18) and 96 (icon 44).
4. **Accessibility:** meaningful → `role="img"`, `aria-label` = trimmed name, inner content
   hidden; `decorative` → `aria-hidden="true"`, no role, no label; meaningful with `name="  "` →
   rendered decorative (no empty label); no element has a `tabindex`.
5. **Classes** per §3 for 40 and 96 (size, border, typography, gradient with `-80%` / `71%`);
   default size 40; `className` merged last; no hex, no `left`/`right`, no
   `hover:`/`focus:`/`active:`/`transition`/`animate`/`shadow`/`scale` classes.
6. `ref.current` is the root `HTMLSpanElement`.
7. **Compile-time** (`@ts-expect-error` in a never-called function; `typecheck` checks it):
   rejected — meaningful avatar without `name`, `decorative={false}` without `name`, `size={32}`,
   `onClick`, `role`, `tabIndex`, `alt`, children, `variant`; accepted — `<Avatar name="…" />`,
   `<Avatar decorative />`, `<Avatar decorative name="…" />`, `createRef<HTMLSpanElement>()`,
   `className`. (TypeScript never checks hyphenated props such as `aria-label`; they are simply
   not forwarded.)
8. **jest-axe** (color-contrast off in jsdom): initials 40, initials 96, image, placeholder,
   decorative × RTL/LTR — no violations.

## 9. Acceptance criteria

All §8 tests pass; `corepack pnpm typecheck`, `lint`, `format:check`, `test` and `build` pass on
Mariam's copy; only `Avatar.tsx` and `Avatar.test.tsx` added; values per §3; props per §4; no
token, color, dependency, global CSS, config, route, gallery, Button, Input, Card, StatusBadge,
Tabs, Dialog, Sheet or Popover/Menu change. At integration Yousef adds the gallery section and
verifies rendered contrast, axe and RTL/LTR in Chromium.

## 10. Explicit exclusions

User Menu Trigger, User Menu and Popover/Menu; Profile upload states (Hover overlay, Uploading
progress, Failed) and the Avatar Modal (Profile module, Phase 20); AI Tutor portraits and avatar
selectors (AI Tutor / Settings modules); status dots, badges, avatar groups; other sizes; an
explicit accessible-label prop for nameless avatars (future API, needs approval); `next/image`;
loading skeletons; motion; authentication and user data.

## 11. Intentional Figma normalizations

| ID  | Figma                                                                                                | Implemented                                         | Basis                     |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------- |
| N-1 | Three fills: Top Bar Sky → Cobalt horizontal; User Menu Sky → Cobalt 135°; Profile Cobalt → Sky 135° | One fill at both sizes: Sky −80% → Cobalt 71%, 135° | D-AV1 + contrast (§2.4)   |
| N-2 | Top Bar initials Void Black                                                                          | White (Text / Primary) at both sizes                | D-AV1 (Void Black ≤ 2.14) |
| N-3 | User Menu avatar has no border                                                                       | 1px Electric Sky 40% at 40 (Top Bar, 30+ instances) | D-AV2                     |
| N-4 | Placeholder only drawn at 96 (icon 44)                                                               | Also at 40 with icon 18                             | D-AV4                     |

## 11.1 Files

`src/shared/ui/Avatar.tsx` and `src/shared/ui/Avatar.test.tsx` are **sufficient**: the tokens,
the `user` icon, the typography utilities and the test tooling already exist on `main`; no other
file needs to change. The gallery section is Yousef's.

## 12. Decisions (user, 2026-11-16)

| ID    | Decision                                                                                                                                                              | Applied           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| D-AV1 | **Approved with contrast verification:** the User Menu gradient as the single fill, verified over the whole circle, AA with a ≥ 5:1 margin, existing colors only      | §2.4, §3, N-1/N-2 |
| D-AV2 | **Approved:** sizes 40 and 96 only; borders by size; User Menu border normalized                                                                                      | §3, N-3           |
| D-AV3 | **Approved:** initials from the name (1 at 40, 2 at 96), Arabic and English, combining marks kept, safe whitespace and short names, no broken Arabic rendering        | §5.3              |
| D-AV4 | **Approved:** real image → initials → placeholder (`user` icon); native `<img>` with one scoped, documented lint exception; no config or dependency change            | §5                |
| D-AV5 | **Approved with API refinement:** meaningful avatars require a name; decorative avatars may omit it; nameless placeholders are decorative; no duplicate announcements | §4, §6            |
| D-AV6 | **Approved:** no motion; the interactive trigger owns motion and focus                                                                                                | §7                |

**D-AV1 gradient confirmed by the user (2026-11-16):** Electric Sky −80%, Cobalt Edge 71%, 135°,
white initials, minimum calculated contrast 5.01:1 — an intentional accessibility normalization
from Figma (N-1). Rendered contrast is verified at integration and browser QA.

## 13. Implementation notes (2026-11-16)

- **Hydration:** a server-rendered `<img>` can fail before React attaches `onError`. On mount
  the component checks `complete && naturalWidth === 0` and falls back to the initials (found
  by the browser test with a broken image; unit regression test added).
- **Rendered contrast (Chromium, real pixels):** white against every pixel of the circle
  interior, measured from a screenshot with the initials hidden — RTL 5.85 (40) / 5.69 (96),
  LTR 5.84 / 5.76. Above the 5.01 calculated minimum because the circle clips the gradient's
  lightest corner.
- **Compile-time:** a `div` ref is not rejected (TypeScript is structural and
  `HTMLSpanElement` adds nothing to `HTMLElement`); not tested.
