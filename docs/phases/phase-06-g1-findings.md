# Phase 06 — G-1: navigation guard and browser Back (findings, 2026-11-18)

**Status: RISK ACCEPTED — BROWSER LIMITATION** (product owner, 2026-11-18, option A in §7).
This is a **conditional** risk acceptance, **not** approval of unrecoverable user-data loss in
production. The browser limitation is **not fixed**: §2–§5 stay as the record of what was found.
The acceptance holds only together with the binding data-protection criteria in §6.

## 1. Symptom

The page is guarded (unsaved changes or an active recording), and the user presses browser Back.
The guard cancels it and shows the confirmation dialog. In some sequences, the user's **next**
browser Back then leaves the page **without** the dialog, and the page's unsaved state is lost.

## 2. Root cause (browser rule, not an application bug)

The WHATWG HTML Standard lets a page cancel a Back or Forward started from the browser UI only
while it holds **history-action user activation**. Cancelling uses that activation up.

- [Inner navigate event firing algorithm](https://html.spec.whatwg.org/multipage/nav-history-apis.html#inner-navigate-event-firing-algorithm),
  steps 8, 9 and 28.1:
  - a traversal is cancelable only if the destination is same-document and "either
    userInvolvement is not "browser UI", or navigation's relevant global object has
    history-action activation";
  - when a traversal is cancelled, the algorithm runs "consume history-action user activation".
- [History-action activation](https://html.spec.whatwg.org/multipage/interaction.html#history-action-activation):
  it becomes true when the user interacts with the page, and is reset when it is consumed.
- [Activation-triggering input event](https://html.spec.whatwg.org/multipage/interaction.html#activation-triggering-input-event):
  `keydown` counts only "provided the key is neither the Esc key nor a shortcut key reserved by
  the user agent". **Esc never grants activation.**

This is the anti back-trapping protection: a page can stop **one** browser Back for each real
user interaction. Chromium implements it. When the second Back arrives, `navigate` fires with
`cancelable = false`, and `NavigationGuardProvider` cannot stop it. The navigation then commits.

## 3. Evidence (Chromium, Playwright, `/dev/guard`, now `/dev/fixtures/navigation-guard`)

Every row ran 4 to 8 times with the same result.

| Sequence after the first, cancelled Back                 | Second Back          |
| -------------------------------------------------------- | -------------------- |
| Esc, then Back (any delay, 0 to 1000 ms)                 | **Leaves** (c=false) |
| Back again with no other interaction (dialog still open) | **Leaves**           |
| Click Stay, then Back                                    | Asked again (safe)   |
| Enter on Stay, then Back                                 | Asked again (safe)   |
| Esc, then a click anywhere on the page, then Back        | Asked again (safe)   |
| Esc, then Tab, then Back                                 | Asked again (safe)   |
| Back to another document (full page load)                | Native prompt (safe) |

**Guard kind:** unsaved and recording guards behave the same.

**Esc dismissal:** Esc acts as Stay. The dialog closes, the URL is unchanged, the guard stays on,
and focus returns to the element that had it.

**Test artefact:** Playwright `page.evaluate` and locator polling run with a user gesture, so
they grant activation. A test that polls the page between the two Backs passes, and one that
doesn't fails. This explains the intermittent result of the former guard E2E "browser Back
(user-initiated) … repeated Back asks again".

**Test contract after the decision** (PR #45, `tests/e2e/navigation-guard.spec.ts`):

- **Guaranteed behaviour:** Back is asked; Stay (click or Enter) keeps the page, and the next Back
  is asked again; Esc is Stay with focus restored; after a later key press, Back is asked again.
- **Browser-controlled (G-1), kept as an explicit reproduction:** "Esc, then Back" and "Back
  twice" leave, and the second traversal is logged as non-cancelable. There are no page calls
  between the Backs, so no artificial activation. If the browser behaviour changes, these tests
  fail and G-1 is reviewed again.
- **Dropped:** the script `history.back()` loop dismissed with Esc. It is not a user path; the
  rapid-Back tests cover script traversals.

**Separate defect found while correcting the tests (fixed in PR #45):** a Back right after Stay
was sometimes cancelled **with no dialog**. A stale `close` event from the dialog's previous
`close()` arrived after `showModal()` and closed the reopened dialog (`useModalDialog`). This was
not G-1: it was an application bug, now fixed and unit-tested.

## 3a. Other engines (Increment 5, 2026-11-18)

Playwright's engine builds (Firefox 159, WebKit 27.2 for Windows) in the focused spec
`tests/e2e/navigation-guard.cross-browser.spec.ts`. This is automation, not real Safari or real
devices (R-3).

| Second browser Back, no interaction in between | Chromium                         | Firefox                  | WebKit                                                                                                                |
| ---------------------------------------------- | -------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Esc then Back, or Back twice                   | **Leaves** (non-cancelable): G-1 | Asked again (cancelable) | Asked again; native `beforeunload` prompt instead when the previous entry is the document's initial load (4/4 probes) |

- **G-1 is engine-specific** in automation. The acceptance (§7) and the data-protection criteria
  (§6) still apply to every browser: no engine's behaviour is a guarantee.
- **W-1 (WebKit, separate from G-1, OPEN under R-3):**
  - Leave after a cancelled Back (`navigation.traverseTo`) fires `beforeunload`.
  - Accepting the native prompt reloads the guarded page instead of going back.
  - Dismissing it aborts the traversal, with an unhandled `AbortError` from `committed`.
  - Kept as a visible `fixme` test. Real Safari must confirm it before any guard change.

## 4. Mitigation options

| Option                                                          | Assessment                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Re-push or traverse forward after a non-cancelable Back         | **Rejected.** This is the back-trapping the browser rule exists to stop. Chromium's history-manipulation intervention can make Back skip such entries. The behaviour can't be verified with the real toolbar, and it may trap users. |
| Extra sentinel history entry while guarded                      | **Rejected.** Same intervention risk. It also truncates Forward history and adds an entry the user didn't create.                                                                                                                    |
| Disable Esc on the guard dialog                                 | **Rejected.** It breaks the WCAG rule "Esc closes overlays" and doesn't help: a repeated Back with no interaction still leaves.                                                                                                      |
| Move focus to Stay so the next key grants activation            | Already the case. Any key other than Esc, or any click, grants activation. It does not cover Esc followed by Back, or Back pressed twice.                                                                                            |
| **Module draft persistence** (recommended long-term protection) | Safe and browser-independent: work survives any exit, including crashes and tab close. It needs storage and product decisions, so it is out of Phase 06 scope (§6).                                                                  |

**No application-level change can fully protect against the second Back without a history hack.**
Phase 06 therefore implements no fix.

## 5. What is still guaranteed

- **First Back:** confirmed after any user interaction.
- **Links, programmatic navigation and the language switch:** always confirmed.
- **Refresh, tab close and cross-document Back:** the native prompt.
- **Users can always leave:** the guard never traps anyone.

It is **not** guaranteed that unsaved data survives a second browser Back unless the user
interacted with the page in between.

## 6. Binding data-protection acceptance criteria (Recording, Notes)

These are **acceptance criteria** for the Notes and Recording implementation phases, carried
forward from this decision. They are not implemented in Phase 06, and no backend behaviour is
assumed here: storage choices are made in those phases, with the backend team.

**General (both modules):**

- G1. The navigation guard is a courtesy prompt, not storage. Data protection must not depend on
  it.
- G2. The guard stays on while there is unsaved or unpersisted work.
- G3. Storage, retention and privacy rules are decided per module; tokens and PII are never
  written to logs.

**Notes:**

- N1. **Automatic draft persistence** while editing (no explicit save needed to keep a draft).
- N2. **Recovery after accidental navigation:** returning to the note offers the persisted draft.
- N3. **Recovery after a refresh.**
- N4. **Recovery after a browser restart,** where the chosen storage strategy supports it; the
  limits of the chosen storage are documented.
- N5. **Visible save status** (for example saving, saved, not saved).
- N6. **Failed saves are handled:** the failure is shown, the draft is kept, and the user can try
  again.
- N7. **No accidental overwrite of a newer draft:** a stale copy (another tab, or an older
  recovery) never silently replaces newer content.

**Recording:**

- R1. **Incremental persistence:** audio is persisted in segments while recording, not only at
  the end.
- R2. **Recovery of persisted segments** after navigation or interruption.
- R3. **Clear recording and save status.**
- R4. **Explicit handling of storage and upload failures:** shown to the user, never silent.
- R5. **A recovery workflow for interrupted recordings:** resume, keep or discard.
- R6. **The real recovery guarantees are validated by tests** (navigation, refresh, interruption).
- R7. **No promise beyond what was persisted:** audio that was never successfully persisted is
  not claimed to be recoverable, and the copy says so.

**Release gate:** Notes and Recording are **not production-ready** until their criteria above are
implemented and tested. Each implementation phase plan must list them in its acceptance
criteria.

## 7. Decision (product owner, 2026-11-18)

Options presented:

- **A.** Accept G-1 as a documented browser limitation.
- **B.** Keep G-1 open and block the Phase 06 closure.

**Selected: A — RISK ACCEPTED — BROWSER LIMITATION.** The acceptance is conditional:

- it does **not** approve unrecoverable user-data loss in production;
- the §6 criteria are binding for Notes and Recording, and their release gate applies;
- the guard E2E asserts the documented behaviour and keeps the G-1 reproduction (PR #45).
