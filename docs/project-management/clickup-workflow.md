# MUNSIT AI — ClickUp Frontend Workflow

Status: added to the repository on 2026-11-19 (referenced from `CLAUDE.md`, "ClickUp Sync").

**Sources of truth.** GitHub: code, commits, PRs, CI. Official Roadmap: scope and phases.
ClickUp: operational task execution. ClickUp never overrides GitHub or the Roadmap.

## 1. ClickUp organization

- Workspace `1200420000014432` ("Workspace").
- Space `MUNSIT AI — Development.` (`1200420000054166`; the trailing dot is part of the current name).
- Folder `Frontend Development` (`1200420000064458`).
- Lists (organizational categories, not Roadmap phases; every task states its official Phase):

| List                                 | ID               | Holds                                        |
| ------------------------------------ | ---------------- | -------------------------------------------- |
| 01 — Foundation & Architecture       | 1200420000067669 | Phases 01, 04 and the i18n base              |
| 02 — Design System                   | 1200420000067670 | Phases 02, 03                                |
| 03 — Shared Application Shell        | 1200420000067671 | Phase 05                                     |
| 04 — Shared States & Navigation      | 1200420000067672 | Phase 06                                     |
| 05 — Landing Page                    | 1200420000067673 | Phase 07                                     |
| 06 — Authentication & Public UI      | 1200420000067674 | Phase 08                                     |
| 07 — Application Modules             | 1200420000067675 | Phases 09–20                                 |
| 08 — Responsive & Accessibility      | 1200420000067676 | Cross-cutting validation tasks               |
| 09 — Frontend QA & Release Readiness | 1200420000067677 | Phases 21–23 and QA                          |
| 10 — Future Roadmap Tasks            | 1200420000067678 | Deferred items (not approved for scheduling) |
| 11 — Risks & Release Blockers        | 1200420000067679 | R-2, R-3, G-1, W-1 and release gates         |

The space-level list named "List" (`1200420000067664`) is an empty default and is not used.

## 2. Task naming

`Phase NN[ Inc N]: <action-oriented title>`. Mariam tasks start with `Mariam:` until delivered.
Deferred items: `Deferred O-n:` / `Deferred (D-nn):`. Risks keep their original ID (`R-2`, `G-1`, `W-1`).
Tags: `phase-NN`, `history`, `mariam`, `release-blocker`, `deferred`, `visual-refinement`.

## 3. Status definitions

| ClickUp status | Meaning                                                               |
| -------------- | --------------------------------------------------------------------- |
| backlog        | Not approved for scheduling, or waiting on an earlier phase           |
| to do          | Approved, not started (also: sent to Mariam, awaiting implementation) |
| in progress    | Implementation has actually started                                   |
| in review      | A PR is open and awaiting review or merge                             |
| blocked        | A documented dependency prevents completion (record it in the task)   |
| complete       | Acceptance criteria met, PR merged, post-merge validation passed      |

A PR opening, or local tests passing, does not make a task complete.

## 4. Assignment rules

- Yousef: ClickUp user `314564259`. Mariam: ClickUp user `112642267` (Guest; the Folder must stay shared with her).
- Mariam is the implementation contributor for delegated shared components; Yousef is the Git author and integrator.
- Never assign both contributors to the same files. Mariam's boundaries are listed in each contract.
- Future module phases stay unassigned until the owner assigns them.

## 5. Duration estimation

1 day = 480 minutes (ClickUp time estimate). Small 1 day, normal 2, medium 3; split anything larger.
Estimates are planning values stored apart from dates. Completed historical tasks carry no estimate
(actual duration was not recorded). Start/due dates are set only for a verified schedule; completed
tasks use their Git evidence date as due date.

## 6. GitHub traceability

Each implementation task records: official Phase, Increment, PR number, branch, commit SHA, CI
status, contributor, and evidence path. Missing values are written as NOT VERIFIED, never guessed.

## 7. Completion criteria

COMPLETE requires: acceptance criteria met, PR merged (integration tasks), post-merge CI green,
evidence recorded. Release blockers and accepted risks are never marked complete without evidence;
an accepted risk is not a fixed risk.

## 8. Status synchronization

There is **no background automation**. Synchronization runs during Claude development sessions:

1. Find the existing task before starting.
2. Set `in progress` when work starts.
3. Set `in review` when the PR opens; add the PR URL.
4. Set `blocked` with the actual blocker.
5. After merge, verify acceptance and post-merge CI, then set `complete`.
6. Reopened tasks return to their correct active status.
   Every final report states the ClickUp sync result. A failed update is reported with its task ID for retry.

**GitHub integration (verified 2026-11-19).** ClickUp's GitHub integration is **not installed**: no
pull request is linked to any task (the task `git_links` field is empty). PR URLs, merge SHAs and
CI run IDs are therefore written into task descriptions by hand during sessions (the procedure
above, through the ClickUp MCP connector), and status changes were tested that way. Persistent
automatic synchronization would need the ClickUp GitHub app installed by a workspace admin from
the ClickUp App Center, then tested; until both are done, no automation is claimed.

## 9. Duplicate prevention

Search by name, branch and PR number before creating; update the existing task instead. Views
(Board, List, Assignee, Timeline) must never be simulated with duplicate tasks.

## 10. Manual fallback

If ClickUp is unreachable, keep a list of pending updates (task ID, new status, evidence) in the
session report and apply them on the next session.

## 11. Ownership of ClickUp updates

Yousef owns ClickUp. Claude updates tasks only during active sessions, only for tasks it worked on.

## 12. Mariam's external deliveries

Her task stays `to do` while the starter is SENT / AWAITING IMPLEMENTATION. Status moves to
`in progress` only on evidence that work started, and to `complete` only after Yousef reviews and
integrates the delivery (byte-identical files, PR, CI). The delivery log in
`docs/TEAM_COLLABORATION.md` §8 remains the record of packages sent.

No API tokens or secrets are stored in this document.
