## Description

<!-- What does this PR do and why? Link the roadmap phase or issue. -->

## Scope

- **Roadmap phase:** <!-- e.g. Phase 09 — Dashboard -->
- **In scope:**
- **Out of scope:**

## Related modules

<!-- Tick every area this PR touches. -->

- [ ] `src/app` (routes)
- [ ] `src/features/<module>`: <!-- name the module(s) -->
- [ ] `src/shared` (ui / patterns / layout / navigation / a11y / hooks / lib / utils)
- [ ] `src/design-system`
- [ ] `src/api` / `src/state` / `src/i18n` / `src/types` / `src/config`
- [ ] Tooling / configuration
- [ ] Documentation

## Files changed

<!-- Main files and what changed in each. -->

## Validation

<!-- Paste the real result of each command. Do not tick a box for a command you did not run. -->

- [ ] **TypeScript:** `corepack pnpm typecheck`
- [ ] **Lint + module boundaries:** `corepack pnpm lint`
- [ ] **Formatting:** `corepack pnpm format:check`
- [ ] **Unit tests:** `corepack pnpm test`
- [ ] **E2E (if routes or UI changed):** `corepack pnpm test:e2e`
- [ ] **Build:** `corepack pnpm build`

```text
<!-- command output summary -->
```

## Responsive testing

- [ ] Desktop — 1440
- [ ] Tablet — 768
- [ ] Mobile — 390
- [ ] No horizontal overflow at 320
- [ ] Not applicable (no UI change)

## RTL / LTR verification

- [ ] Arabic (RTL) layout correct — Sidebar/Rail on the right, icons mirrored per whitelist
- [ ] English (LTR) layout correct, if the screen supports it
- [ ] Numerals and Latin terms stay LTR inside Arabic text
- [ ] Logo is not mirrored
- [ ] Not applicable (no UI change)

## Accessibility

- [ ] Keyboard-only pass (visible focus, Esc closes overlays, focus trap in dialogs/sheets)
- [ ] Automated a11y check on touched screens
- [ ] Not applicable

## Screenshots

<!-- Before / after at 1440, 768 and 390, in RTL (and LTR if supported). -->

## Known limitations

<!-- Anything incomplete, "UI-complete, not functional", or NOT VERIFIED against Figma. -->

## Integration dependencies

<!-- Other PRs, shared components, backend contracts or open decisions (D-xx) this depends on. -->

## Checklist

- [ ] Branch is up to date with `main`
- [ ] Only the stated scope is changed; no unrelated refactors
- [ ] No changes to another developer's assigned module without agreement
- [ ] Shared code reused instead of duplicated
- [ ] No secrets, tokens or real `.env` values committed
- [ ] New dependencies (if any) are justified in a separate `chore(deps)` commit
- [ ] `docs/PROGRESS.md` / phase report updated when a phase milestone changes
