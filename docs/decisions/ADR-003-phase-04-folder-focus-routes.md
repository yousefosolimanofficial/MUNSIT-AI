# ADR-003 — Phase 04 scope interpretation: focused folder routes

- **Status:** **Proposed.** The interpretation is approved for Phase 04 planning (user,
  2026-11-16). This ADR is the formal Roadmap amendment and needs the user's approval.
- **Date:** 2026-11-16
- **Amends (interpretation):** Development Roadmap v1.0, Phase 04 Scope ("Flashcards Study Mode /
  focused folder routes in `(focus)`") and §3 folder layout ("`(focus)/` # study mode / focused
  folder workflows"). The Roadmap is a read-only reference (CLAUDE.md), so it is not edited. This ADR
  records the amendment, as ADR-002 did for Phase 03.
- **Related:** [phase-04-plan.md](../phases/phase-04-plan.md) §7.1, §7.3, D-R4

## Context

The Roadmap places "focused folder routes" in the `(focus)` route group, which has no global
navigation. The Handoff (p.8) says "Flashcards Study Mode and focused Folder workflows may hide
global navigation".

A read-only Figma inspection on 2026-11-16 (page 13 — My Folders) found:

- **"Folder Management"** is the **Create Folder dialog**: title "إنشاء مجلد جديد", with scrim,
  close and cancel actions that close it. It opens from the Library "Create Folder" action and acts
  on the library, not on one folder.
- **"Add Content"** is a **dialog** ("إضافة محتوى للمجلد"; scrim and cancel close it). It opens from
  Folder Details "Add Content".
- **"Content Organization"** is **Folder Details in selection mode**. It is reached by selecting an
  item; "Clear Selection" and "Undo" return to Folder Details.
- **Folder Library and Folder Details** show the global navigation (the Rail on Tablet, the Sidebar
  on Desktop).

No folder screen without the global navigation is drawn as a page.

## Decision

1. Phase 04 creates **no** folder routes in `(focus)`. `(focus)` holds Flashcards Study Mode
   (`/flashcards/[deckId]/study`) only.
2. Folder routes are `/folders` and `/folders/[folderId]` in `(app)`. Both keep **Folders** as the
   active destination.
3. The "focused folder workflows" are read as the Create Folder and Add Content dialogs and the
   selection state. They hide the navigation by being modal. They are built with the Folders module
   (Phase 19), using the Phase 03 Dialog and Sheet.
4. If a later Figma version draws a full-screen folder workflow without global navigation, it gets a
   `(focus)` route through a contract and an update to the Phase 04 plan.

## Rationale

- Routes must correspond to screens that exist in the design. The project does not invent routes or
  behaviour.
- A modal dialog is not deep-linkable state in the design; routing it would add URL surface and
  behaviour that nothing specifies.
- An empty `(focus)` folder route would be unused code and unused public URL surface to maintain.

## Consequences

- The original Roadmap requirement stays traceable: this ADR and plan §7.3 explain why no folder
  route is created.
- The Phase 04 acceptance criteria are unchanged. "Exactly one active item per route" covers the two
  folder routes.
- Phase 19 implements the folder dialogs and the selection state as in-page UI.
