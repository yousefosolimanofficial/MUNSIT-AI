# ADR-002 — Phase 03 scope deferral (shared UI primitives)

- **Status:** Approved (user, 2026-11-16, "Phase 03 Closure Decision: Approve Deferred
  Implementation")
- **Date:** 2026-11-16
- **Amends:** Development Roadmap v1.0, Phase 03 scope. The Roadmap is a read-only reference
  (CLAUDE.md), so it is not edited. This ADR records the amendment, and the original requirement
  stays in the Roadmap unchanged.
- **Related:** [phase-03-plan.md](../phases/phase-03-plan.md) §2.1,
  [phase-03-closure-report.md](../phases/phase-03-closure-report.md) (A-14, K-1)

## Context

Roadmap Phase 03 lists the shared primitives as Button; Input, Textarea, Select, Checkbox, Radio
and Switch (with labels and an inline error); Badge, including the Status Badge; Tabs; Tooltip;
Avatar; Card surfaces; Dialog; Sheet; and Popover/Menu. It also asks for Figma inspection of the
NOT VERIFIED properties, including the Navigation Icon Button.

Phase 03 delivered nine components from approved contracts: Button, Input, Card, StatusBadge,
Tabs, Dialog, Sheet, Popover/Menu and Avatar. The closure review found that the components below
were neither built nor formally deferred.

## Rationale

1. **No current need.** No Phase 03 screen or feature requires any of the eight components.
2. **Figma first.** Their design specifications must be verified against the actual Figma screens
   where they are used, and values are never invented (CLAUDE.md).
3. **No premature assumptions.** Building them now would introduce unverified assumptions about
   their APIs, behavior and design values, which would likely need rework once a consuming screen
   is designed in detail.
4. **Precedent.** This follows D-T1, the previously approved decision to defer the Tabs filter rows
   to the modules that use them.

## Decision

The following primitives are **deferred, not cancelled**. Each remains a required shared UI
primitive:

1. Textarea
2. Select
3. Checkbox
4. Radio
5. Switch
6. Tooltip
7. Generic Badge
8. Navigation Icon Button: Figma verification and implementation

**Trigger:** each is built **before the first consuming feature is considered complete**. No
phase number is fixed while the consuming feature is not established.

The Navigation Icon Button is verified in Figma and built before its first consuming screen. That
screen may be earlier than Phase 05 (Shell), for example the Landing mobile navbar if it uses the
component.

**Rules for each deferred component:**

- An approved component contract comes before implementation, following the Phase 03 loop: Figma
  verification, contract, user decisions, implementation.
- It lives in `src/shared/ui` when appropriate, follows the Design System (existing tokens; no
  invented values), and is reusable across the application.
- It ships with relevant unit, accessibility (`jest-axe`) and browser validation.
- No local one-off substitutes.
- No assumed replacements:
  - StatusBadge does not replace the generic Badge.
  - Menu does not replace Select.
  - A Tabs filter group does not replace native Radio controls.

## Consequences

- Phase 03 acceptance item A-14 is **DEFERRED — APPROVED**, not PASS.
- Every feature phase that first needs one of these components must include its contract and
  implementation in scope. That phase is not complete until the component is merged with its
  tests.
- `docs/PROGRESS.md` tracks the open obligations once Phase 03 is formally closed.
