# Update — idempotent re-overlay

Brings an existing install (repo-local `DEVOS/` or global `~/.claude/DEVOS/`) to the checkout's version. Same machinery as Setup, same gates: dry-run first, permission, then `--apply`. Never overwrites populated files; never touches harness settings.

## Steps

1. **Version check** — compare checkout `RUNTIME/VERSION` against `<install>/RUNTIME/VERSION` (repo-local: `<repo>/DEVOS`; global: `~/.claude/DEVOS`). Same version → still proceed (overlay repairs drift), but say so.
2. **DetectEnv + ScanConflicts** against the install root — surface what's populated before touching anything.
3. **DeployCore** — dry run, show the plan, permission, `--apply`. copyMissing only: new files land, existing files (including the install's `ISA.md`, `PROFILE/`, `MEMORY/`) are never overwritten. Substitution re-runs over the deployed tree; surviving `{{HARNESS_*}}` fails the run.
4. **ActivateImports** (repo-local) — dry run, permission, `--apply`. Refreshes the pointer block in place.
   Global: re-run `GlobalInstall --apply` instead (refreshes the `CLAUDE.md` block; settings.json untouched unless `--wire-hooks` was used before — re-wiring reuses the same backup rotation).
5. **Doctor** — `--target <install-root>` (repo-local: the repo; global: `~/.claude`). Broken set must be empty or declined-with-reason.
6. **Report** — version before/after, files added (never modified-in-place except the managed pointer block), Doctor state.

## Notes

- Downgrade (checkout older than install) is refused — check out the matching version first.
- `MEMORY/` is runtime state: overlay never deletes it, never migrates it. Format changes ship with a migration note in the release, applied by hand.
- Settings merges are never part of Update. If hook wiring changed upstream, the release notes say so and re-wiring is a separate, permissioned `--wire-hooks` run.
