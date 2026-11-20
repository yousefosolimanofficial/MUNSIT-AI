# Phase 07 — Increment 5 proposal: FAQ, Pricing, Final CTA

Status: **PROPOSAL, NOT STARTED** (prepared 2026-11-20 for owner review). No code is written until
the owner approves this proposal. Sources: plan §6 (P07-D1–D5), the `landing` messages (Arabic
verbatim from Figma), Figma Desktop `124:94` / `131:177` / `126:104`, Tablet `200:629` /
`200:640` / `200:651`, Mobile `200:778` / `200:789` / `200:800` (read-only, 2026-11-20).

## 1. Approved work (buildable now)

### FAQ (ClickUp `123ru7v2pme`, estimate 2 days)

- **Copy:** heading, description and six question/answer pairs, all present verbatim
  (`landing.faq`); no new copy needed.
- **Figma:** section padding 80 (Desktop) / 64 + 32 (Tablet) / 48 + 20 (Mobile); intro 900 / 704 /
  350; accordion 900 wide, item gap 13; item padding 20 / 24, radius 12; collapsed 76 high (Desktop
  drawn); item 01 drawn **Expanded** (152). States in Figma: Collapsed (Ink, Slate border), Hover
  (Obsidian, Iron border), Expanded (a separate component, X-9).
- **Behaviour:** a disclosure per item (`<button aria-expanded aria-controls>` + region), full
  keyboard (Enter / Space; Tab order), visible focus ring; height and icon transitions with motion
  tokens, instant under reduced motion. No new dependency; Landing-local component.
- **Owner decision needed (small):** item 01 open on load (as drawn) or all closed; items open
  independently (proposed) or one at a time.

### Final CTA (ClickUp `123ru7v2pmg`, estimate 1 day)

- **Copy:** heading, description, "اكتشف المميزات" and "ابدأ مجانًا" (`landing.cta`).
- **Figma:** panel 1200 × 366 (Obsidian, 1px Slate, radius 24, padding 80 / 64, gap 24);
  description 560 wide; actions gap 16: outline 170 × 48 (Slate border, radius 8) → `#features`,
  primary 116 × 48 (Mist fill, radius 8) → Register (P07-D3). Tablet panel 704 (padding 56 / 32),
  Mobile 350 (padding 40 / 20).
- **Glow:** Figma ellipse 520 × 160, Cobalt Edge at 20% with a 120 blur: rendered as a radial
  gradient (no CSS blur filter), consistent with the approved ambient glows. Not cyan.
- **Interactions:** the approved CTA hover states (Visual Refinement); scroll reveal.

### Shared for both

Section order and gaps from Figma; RTL/LTR by logical properties; English stays gated (P07-D1).

## 2. Approval-dependent work

### Pricing (ClickUp `123ru7v2pmf`, estimate 2 days, **development and preview only**)

- **P07-D4:** placeholder pricing never reaches production. `isPlaceholderPricingVisible` already
  removes the section in production; that gate stays.
- **Content available:** eyebrow, heading, description and information note (P07-D5: reused on
  Desktop), and one placeholder plan: label "Starter", name, text, price "—", price note "السعر
  وتفاصيل الاستخدام تُحدد لاحقًا", feature "ميزة الخطة — تُحدد لاحقًا", CTA "ابدأ مجانًا", and the
  Featured badge "الخطة المميزة". **No prices, plan names, benefits or limits are invented**; the
  three Figma cards (Standard, Featured, Secondary; 384 × 520) render the same placeholder plan.
- **P07-D3:** the CTA links to Register with **no plan parameter**; no checkout, subscription or
  plan selection.
- **Blocked for production by:** approved commercial content (owner). Until then this is a
  structure-only, development-visible section.

### Not in Increment 5

- English copy approval (P07-D1), legal pages (P07-D2), the production Hero video, the typography
  investigation (`123ru7v2q27`).

## 3. Tests

- **Unit:** FAQ disclosure (aria-expanded toggles, `aria-controls` targets, Enter/Space), CTA links
  (Register without parameters, `#features`), Pricing gate (absent in production) and placeholder
  copy only.
- **E2E (ar, en):** geometry against Figma at 1440 / 768 / 390; overflow 320–1440; keyboard pass
  through the FAQ; reduced motion; axe WCAG 2.2 AA; production gate for Pricing.

## 4. Proposed delivery

One PR for FAQ and Final CTA (approved work), and Pricing in the same or a follow-up PR as a
development-only section; the owner chooses.
