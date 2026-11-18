# Phase 06 — G-1: navigation guard and browser Back (findings, 2026-11-18)

**Status: OPEN. Waiting for a product-owner risk decision.** Nothing in the guard code or its
tests is changed by this document.

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

## 3. Evidence (Chromium, Playwright, `/dev/guard`)

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
doesn't fails. This explains the intermittent result of the guard E2E "browser Back
(user-initiated) … repeated Back asks again". **That test is left unchanged:** it detects real
behaviour.

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

## 6. Requirements for future modules (Recording, Notes)

1. **Do not rely on the navigation guard alone to protect data.** It is a courtesy prompt, not
   storage.
2. **Persist drafts continuously:**
   - Notes: debounced autosave of the draft.
   - Recording: chunked capture, so a stopped or interrupted session can be recovered.
3. **Offer recovery on return:** when the module opens, show "restore draft" or "recover
   recording", and let the user discard it explicitly.
4. **Decide storage per module,** with the backend team: local (IndexedDB) or server. Include
   retention and privacy rules, and never write tokens or PII to logs.
5. **Keep the guard on while unsaved:** it still catches the common cases (§5).

## 7. Decision needed (product owner)

Choose one:

- **A.** Accept G-1 as a documented browser limitation for Phase 06. The persistence
  requirements in §6 become acceptance criteria for the Recording and Notes phases. The guard
  E2E would then be corrected to assert the documented behaviour, as a separate, reviewed change.
- **B.** Keep G-1 open and block the Phase 06 closure until another approach is approved.

Until then, the guard E2E stays as it is and may fail intermittently.
