# Phase 07 — Full Landing Page and Hero Video Review (owner review, 2026-11-20)

Status: **PREPARED FOR OWNER REVIEW.** Nothing in this document approves a production asset,
enables a production gate or starts Increment 6. Phase 07 stays **IN PROGRESS**.

Context: Increment 5 (FAQ, Pricing, Final CTA) merged as PR #58 (`5b17b27`). Every Landing
section from the plan is now implemented. The owner asked to inspect the whole page and the Hero
video before the final verification increment.

## 1. How to open the review locally

No environment file is needed: without `NEXT_PUBLIC_APP_ENV` the app runs as `development`
(`src/config/env.ts`), which shows every development-only item.

```
corepack pnpm install
corepack pnpm dev            # http://localhost:3000/    (Arabic, default)
                             # http://localhost:3000/en  (English, PROPOSED copy)
```

A production-like build (closer to final rendering and performance) is optional:

```
corepack pnpm build
corepack pnpm start --port 3200   # http://localhost:3200/ and /en
```

- **Hero video:** plays automatically (muted, looping) at 720 px and wider. The pause / play
  button sits at the bottom inline-end corner. Mobile (under 720) shows the poster, because no
  portrait master exists. To see the poster as in reduced motion, enable "reduce motion" in the
  operating system or in DevTools → Rendering → "Emulate CSS prefers-reduced-motion".
- **Pricing:** visible in `development` and `test` only. No flag or query parameter turns it on,
  and nothing can enable it in production.
- **Do not** create a `.env.local` with `NEXT_PUBLIC_APP_ENV=production` for review. That only
  simulates production (Pricing and the video disappear; `/en` returns 404).

## 2. Production gates (unchanged)

All gates are in `src/features/landing/model/gates.ts` and depend only on
`NEXT_PUBLIC_APP_ENV`. Production deployments must set `production`.

| Item                    | Development / test | Production                    | Decision        |
| ----------------------- | ------------------ | ----------------------------- | --------------- |
| Placeholder Pricing     | shown              | **not rendered**              | P07-D4, P07-D19 |
| Provisional Hero video  | plays (≥ 720 px)   | **not rendered** (Near Black) | P07-D14         |
| English Landing (`/en`) | shown              | **404**, no language link     | P07-D1          |

**Evidence (2026-11-20):** a build with `NEXT_PUBLIC_APP_ENV=production` produced an Arabic page
with FAQ and Final CTA, and with no Pricing section, no plan card, no `<video>`, no
`hero-ambient` asset reference, no `#pricing` link, no `ld+json` and no "اختار بلس". Unit and E2E
tests cover the same gates.

## 3. Review captures (local only, not committed)

Captured from the production build in `development` mode, Chromium, device scale 1, Arabic unless
the file name says `en`. Folder: `assets/review/landing-2026-11-20/` (git-ignored; regenerate
with the same widths if needed).

| Folder                                  | Contents                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `full/`                                 | full pages, ar 1440 / 1280 / 1024 / 768 / 390 / 320; en 1440 / 768 / 390; `ar-1440-full-motion` (reveals and video active)                                   |
| `sections/`                             | each part separately at 1440 / 768 / 390: header, 8 sections, footer (numbered in page order)                                                                |
| `hero/`                                 | video playing (1440 / 1280 / 1024 / 768 / 390); loop frames at 0.1, 3, 6, 7.9, 8.3, 8.7, 8.95 s (1440, 768); poster fallback (video blocked); reduced motion |
| `states/`                               | hover and keyboard focus at 1440: header link, Hero primary, feature card, FAQ item, featured plan button, Final CTA primary                                 |
| `typography/`                           | Features section, current rendering vs the candidate font fix (§7)                                                                                           |
| `report.json`, `report-typography.json` | measured order, positions, overflow, video state, motion audit, typography                                                                                   |

**Layout results:**

- **Section order** at every width: header, Hero, Showcase, Features, How It Works, Use Cases,
  FAQ, Pricing, Final CTA, footer.
- **Overflow:** no horizontal overflow at 320, 390, 768, 1024, 1280 or 1440.
- **1024:** renders the Tablet layout (Tablet runs from 720 to 1279, Desktop from 1280). Figma has
  no 1024 frame.
- **1280:** renders the Desktop layout. Desktop section positions are identical at 1280 and 1440.

## 4. Hero video: visual assessment of the provisional asset

Asset: `public/landing/hero/hero-ambient-1280x720.{webm,mp4}`. Derived from the owner's file:
9 s loop, 1280 × 720, graded, no audio (hero-media §2). In the page it played muted and looping
(WebM) at 1440, 1280, 1024 and 768. No video was rendered at 390 or under reduced motion.

| #   | Point                       | Finding                                                                                                                                                                                                                                                                     |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Content                     | A generic "AI lecture" dashboard: transcription column, cards with avatars, summary panel, mind-map nodes, comment box. It is not the MUNSIT interface.                                                                                                                     |
| 2   | English dashboard           | English and left-to-right throughout ("Real-time transcription", "AI-generated lecture summary", "Generated Summary", "Add events"). The page is Arabic and right-to-left.                                                                                                  |
| 3   | AI filler text              | Pseudo-Latin filler in the summary panel ("Lorem ipsum labortactos…") and garbled labels ("Add coents", "Commmuny", "Concete"). They are readable at 1440, against brief §3 ("no readable text").                                                                           |
| 4   | Authenticity                | Shows features in a form the product does not have (people avatars, community feed, "Add events"). Brief §2 forbids invented controls and features. **This is the main blocker.**                                                                                           |
| 5   | Crossfade loop              | The loop has no hard cut, but frames 8.3–8.95 s show a **visible double exposure**: two dashboard positions overlap (ghosted panels and a duplicated transcription column) for about 1 s, on every loop.                                                                    |
| 6   | Camera movement             | One slow continuous push-in. Calm and suitable. It does not return to the start position, which is why the crossfade is needed.                                                                                                                                             |
| 7   | Dark grading                | The baked grade (whites to about 36%) keeps it in the Near Black family and lets the ambient glows read. Acceptable as a direction.                                                                                                                                         |
| 8   | Text contrast               | The heading stays readable over the darkened UI. The secondary action ("اكتشف كيف يعمل") sits over a photo avatar and small text at 1440: busy, but the outlined button still separates. Not measured as a failure; final frames must be measured again (Hero contract §6). |
| 9   | Overall quality             | Soft at 1440 × 900 (1280 × 720 upscaled ×1.25 by the browser). Small text and faces show compression. Below the brief minimum (1920 × 1200).                                                                                                                                |
| 10  | Desktop and Tablet cropping | 16:9 into 16:10 at Desktop crops about 5% each side; the window stays whole. At 768 (6:5) about 21% each side is cut; the dashboard's side panels are cut off. 1024 behaves like Tablet (1024 × 640, 16:10, a small crop).                                                  |

**Cohesion with the page:** the video's cyan-blue highlights and the page's Cobalt / Electric Sky
glows sit in the same colour family; no clash was seen. The dashboard frame inside the video
competes slightly with the Showcase mock-up below it (two product frames in a row).

**Verdict:** suitable as a development placeholder only. **Not production-ready:** the content is
not authentic (points 1–4), the loop seam is visible (5), the resolution is too low (9) and there
is no Mobile master.

## 5. Production video requirements (from the approved brief; no assets exist yet)

These are specifications, not evidence that any asset exists. Nothing is production-approved
until the owner reviews the final rendered files.

**A. Landscape master (Desktop and Tablet)**

- Authentic MUNSIT AI interface: real Arabic, right-to-left screens (Recording, Lecture details,
  Smart summaries, Question bank, AI assistant) or a faithful abstraction of them. No invented
  features, people feeds, avatars or controls.
- No generated readable text. Text appears as abstract lines and blocks; real readable text only
  if composited from real screens.
- 16:10, 2560 × 1600 preferred, **1920 × 1200 minimum**, 24 or 30 fps, no upscaling.
- Premium cinematic motion: one slow push-in or parallax drift, soft depth of field, no cuts,
  particles, flares or glitch effects.
- **Seamless loop by design:** the first frame equals the last frame (the camera returns to rest).
  This removes the crossfade and its double exposure.
- Text safe area kept calm and dark (Desktop x 24–76%, y 36–88%). Key motion inside the centre
  75% of the width, so the Tablet 6:5 crop keeps it.
- Grade baked in (Near Black base, Cobalt / Electric Sky accents, cyan allowed in the video only),
  so white HTML text meets contrast on every frame.
- No audio track; plays muted. MP4 (H.264, faststart) and WebM. Budget proposal: ≤ 3 MB.

**B. Mobile master**

- A dedicated portrait composition (≈ 0.725, **1080 × 1490**), not a crop of the landscape master
  (a crop would keep only about 45% of its width).
- Motion kept in the top and bottom bands; the text area (x 5–95%, y 26–90% of the 390 × 538 Hero)
  stays calm.
- Same loop, grade and no-audio rules. Budget proposal: ≤ 1.5 MB.
- Served through `<source media>` (Hero contract §5). Mobile shows the poster until it exists.

**C. Posters**

- The first (= last) frame of each final cut, in the final grade.
- Desktop and Tablet 1920 × 1200; Mobile 1080 × 1490. AVIF or WebP, with a JPEG fallback.
- Check the crops: Desktop cover, Tablet 6:5 cover, Mobile portrait. Measure contrast under the
  heading and actions.

**Acceptance (owner):**

1. Watch both masters in the page at 1440, 768 and 390.
2. Check a full loop for seams.
3. Confirm every visible element exists in MUNSIT.
4. Measure contrast on real frames.
5. Record sizes.
6. Then approve and set `provisional: false` in a separate PR.

## 6. Visual Refinement review

- **Ambient glows and gradients:** CSS gradients only (no blur filters on content). The only
  `backdrop-filter` is the header's Figma glass effect (Ink 20%, blur 48), which already existed.
  The Final CTA glow and the featured plan glow use the same Cobalt Edge family.
- **Section reveals:** each section fades and rises once on entry. After all reveals have run,
  the page has **no running animations** (`document.getAnimations()`). There are no infinite CSS
  animations; the only continuous motion is the Hero video.
- **P07-D17:** the Showcase waveform and recording indicator have **zero animations** (measured).
- **Hover and focus:** consistent across the header, Hero, cards, FAQ, Pricing and Final CTA
  (captures in `states/`). The focus ring is visible on every tested control.
- **CTA styles:** the primary is Mist with an Iron label and the secondary is outlined, in the
  Hero and the Final CTA. The Pricing buttons follow their Figma card variants.
- **Navigation:** the header bar is aligned with the page grid at 1440 (40 px inset). The links
  are centred and the language link and sign-in sit at the inline end.
- **Cohesion:** the page reads as one dark system. **Suggestion, not implemented:** after the
  product-accurate video exists, re-check that the Hero and Showcase frames don't look
  duplicated. No new effects were added.

## 7. Typography review (investigation only; no change made)

Known discrepancies, measured with Arabic in Chromium:

| Item                               | Current            | Figma | With the candidate fix (in-page probe) |
| ---------------------------------- | ------------------ | ----- | -------------------------------------- |
| Features intro, Desktop 1440       | 3 lines            | 2     | **2 lines**                            |
| How It Works section, Tablet 768   | 916.4 px           | 892   | **892.4 px**                           |
| FAQ item 01 (expanded), Mobile 390 | 279.6 px (7 lines) | 248   | **247.6 px (6 lines)**                 |

**Cause, confirmed:** the stack `"Inter", "Cairo", …` makes Inter draw the spaces inside Arabic
runs. The Inter space is 5.63 px at 20 px; the Cairo space is 4.40 px. The Cairo file does contain
a space glyph.

**Candidate (probe only, never committed):** an `@font-face` alias of the same Inter file with
`unicode-range` limited to Latin letters, digits and `%`. It was applied to `:lang(ar)` only, so
Cairo draws spaces and punctuation in Arabic pages. Numerals and Latin words still render in Inter
(verified).

**Safety assessment:** safe for the Landing layout, and it fixes all three items, but **not yet
safe to adopt app-wide**:

- In Arabic pages, Latin punctuation inside English terms or times (`10:30`, `Q&A`, `AI.`) would
  render in Cairo glyphs.
- The rule changes every shared component (shell, dialogs, cards, badges, Geist Mono metadata
  untouched).
- Visual baselines and all E2E geometry checks would need re-measuring.

Recommended next step, after owner approval: a separate typography PR following the ClickUp task
acceptance criteria.
The ClickUp task stays OPEN; nothing is implemented.

## 8. Remaining production blockers (Landing)

1. **Hero video:** a product-accurate landscape master, a portrait master and posters, then owner
   approval. The gate stays closed.
2. **Pricing (P07-D4, P07-D19, P07-D20):** before public release, review actual prices,
   entitlements, commercial claims, billing details, the CTA wording ("اختار بلس" / "اختار برو")
   and the registration and subscription flow.
3. **"ابدأ مجانًا" (Hero, Final CTA, Starter):** "free" is a commercial claim (copy finding F-2).
   It needs commercial verification before launch.
4. **English copy (P07-D1)** approval; until then production serves Arabic only.
5. **Legal pages (P07-D2):** privacy and terms. The footer keeps no fake links.
6. **Typography fix:** optional; known and non-blocking.
7. **Increment 6:** universal checks, real-browser and device QA (R-3, W-1), and closure.
