# ADR-003 — Phase 04 scope interpretation: focused folder routes

- **Status:** **Approved** (user, 2026-11-16, "ADR-003 Approval & Phase 04 Planning Closure"). An
  approved, documented exception to the two Roadmap statements below.
- **Date:** 2026-11-16
- **Amends (interpretation):** Development Roadmap v1.0, Phase 04 Scope and §3 folder layout. The
  Roadmap is a read-only reference (CLAUDE.md), so it stays unchanged. This ADR records the
  amendment, as ADR-002 did for Phase 03.
- **Related:** [phase-04-plan.md](../phases/phase-04-plan.md) §7.1, §7.3, D-R4;
  [ADR-002](ADR-002-phase-03-scope-deferral.md) (precedent for Roadmap scope amendments)

## Original Roadmap requirements

1. **Phase 04 Scope:** "Flashcards Study Mode / focused folder routes in `(focus)`".
2. **§3 folder layout:** "`(focus)/` # study mode / focused folder workflows".

The Handoff (p.8) also says: "Flashcards Study Mode and focused Folder workflows may hide global
navigation".

## Context: verified Figma evidence

A read-only inspection on 2026-11-16 (page 13 — My Folders: frame names, prototype links and shell
presence) found:

- **"Folder Management"** is the **Create Folder dialog**:
  - Title "إنشاء مجلد جديد".
  - Scrim, close and cancel actions close it.
  - It opens from the Library "Create Folder" action and acts on the library, not on one folder.
- **"Add Content"** is a **dialog**:
  - Title "إضافة محتوى للمجلد".
  - Scrim and cancel close it.
  - It opens from Folder Details "Add Content".
- **"Content Organization"** is **Folder Details in selection mode**:
  - It is reached by selecting an item.
  - "Clear Selection" and "Undo" return to Folder Details.
- **Folder Library and Folder Details** show the global navigation: the Rail on Tablet, the Sidebar
  on Desktop. Folder Details has the breadcrumb "المجلدات / ‹folder›".

No folder screen without the global navigation is drawn as a page.

## Decision (approved scope interpretation)

1. **Folder Details** stays in the `(app)` route group, at `/folders/[folderId]`, next to
   `/folders`. Both keep **Folders** as the active destination.
2. **Folder Management** (Create Folder) is a **dialog**, not a route.
3. **Add Content** is a **dialog** within the folder workflow, not a route.
4. **Content Organization** is a **state** within Folder Details, not a route.
5. **No dedicated focused-folder routes** are implemented in Phase 04.
6. **Flashcards Study Mode** stays in `(focus)` (`/flashcards/[deckId]/study`), as planned.

The "focused folder workflows" in the Roadmap and Handoff are read as these modal dialogs and the
selection state. They hide the navigation by being modal, not by being routes.

## Rationale

- Routes must correspond to screens that exist in the design. The project does not invent routes or
  behaviour.
- A modal dialog is not deep-linkable state in the design; routing it would add URL surface and
  behaviour that nothing specifies.
- An empty `(focus)` folder route would be unused code and unused public URL surface to maintain.

## Consequences

- The original Roadmap requirements stay traceable: the requirements above, this ADR and plan §7.3
  explain why no folder route is created in Phase 04.
- The Phase 04 acceptance criteria are unchanged. "Exactly one active item per route" covers
  `/folders` and `/folders/[folderId]`.
- The `(focus)` route group still exists, for Flashcards Study Mode.

## Relationship to future folder functionality

- The folder workflows are **not cancelled**. The Create Folder dialog, the Add Content dialog and
  the selection state are built with the Folders module (Phase 19), using the Phase 03 Dialog and
  Sheet, from a contract read from Figma.
- If a later Figma version draws a full-screen folder workflow without global navigation, it gets a
  `(focus)` route through a component or screen contract and an update to the Phase 04 plan (or the
  phase that consumes it). In that case the original Roadmap requirement applies again.
- This decision changes how the requirement is met in Phase 04. It does **not** remove the
  requirement that focused folder workflows exist and hide the global navigation.
