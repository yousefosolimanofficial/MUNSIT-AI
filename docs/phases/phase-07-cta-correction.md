# Phase 07 — Primary CTA correction (P07-D24, 2026-11-21)

Status: **IN REVIEW** (branch `fix/landing-cta-label`). Label correction implemented; the production
destination is an **open owner decision**. Linked to the commercial release blocker (ClickUp
"Release blocker: approved commercial pricing content").

## 1. Finding (production build audit, 2026-11-21)

- "ابدأ مجانًا" ("start for free") was the primary label of the Hero CTA and the Final CTA in a
  `NEXT_PUBLIC_APP_ENV=production` build. A free offering has not been commercially approved.
- The same label is on the Pricing Starter card. Pricing is development-only, hidden in production
  (P07-D4, P07-D19), so that label is left to the pricing review.
- English ("Get started free") is gated in production (P07-D1).

## 2. Register destination

- Both primary CTAs link to `/register` (`auth.register`), the approved route (P07-D3).
- `/register` is a **Phase 04 route placeholder**: it shows the screen title and says the feature is
  not implemented. Phase 08 (Authentication UI) has not started, and no backend or auth flow is
  verified. **Registration is not operational.** (The navbar login goes to `/login`, also a
  placeholder.)
- No form was submitted and no account was created during this audit.

## 3. Correction made (this PR)

- Hero and Final CTA primary label: "ابدأ مجانًا" → **"ابدأ الآن"** (owner's provisional label).
  English (gated): "Get started free" → "Get started".
- The design, positions, sizes, destination and every other piece of copy are unchanged. The
  buttons keep their minimum widths (Hero 131), so the layout does not move.
- This is a documented exception to the verbatim Figma copy (P07-D24).

## 4. Open: the production destination (owner decision)

The owner approved "ابدأ الآن" only for a genuinely usable registration destination. Until
registration works, a primary CTA in production still leads to a "not implemented" page. Safe
fallback options (none implemented):

| Option | Production behaviour                                                                                                                                              | Trade-off                                                              |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **A**  | Keep "ابدأ الآن" → `/register` until Phase 08 ships, and accept the placeholder as an interim destination                                                         | Simplest; the CTA leads to a "coming soon"-style page (no false claim) |
| **B**  | Gate the primary CTAs in production (a new gate, like Pricing): hide them; keep the secondary CTAs ("اكتشف كيف يعمل" → How It Works, "اكتشف المميزات" → Features) | No dead end; the Hero and Final CTA show one button in production      |
| **C**  | Keep the buttons, but point them in production to an in-page section with a neutral, approved label                                                               | Needs new approved copy for the label                                  |

**Recommendation: B** until Phase 08 delivers a working registration. It never sends visitors to a
non-working page, it needs no new copy, and it is reversible with one gate. Development and preview
keep the CTA to `/register`.

Until the owner decides, a functional-looking CTA to a non-operational page remains in the
production build, now without the free claim. This is recorded as an unresolved release risk.
