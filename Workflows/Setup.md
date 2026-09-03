# Setup — repo-local install

Installs DevOS into a target project repo. Runs FIRST, always — integration lands before the Spec interview seeds anything. All four tools are dry-run by default; nothing writes without `--apply`.

Target layout produced:

```
<repo>/DEVOS/            # harness copy (SKILL.md, RUNTIME/, Tools/, Workflows/, skills/, hooks/, templates/)
<repo>/DEVOS/MEMORY/     # runtime state: WORK/ STATE/ KNOWLEDGE/ LEARNING/
<repo>/AGENTS.md         # gains the DevOS pointer block (created if absent)
<repo>/ISA.md            # NOT created here — seeded by Workflows/Spec.md
```

`MEMORY/` is runtime state — gitignore it in the target repo.

## Steps

1. **DetectEnv** — `bun Tools/DetectEnv.ts --target <repo>` → `{os, harness, target}`. Read-only, exit 0 always.
   - If `target.isDevTree` or `target.isSelf` → STOP. Never deploy into the DevOS source checkout.
   - If `harness.confidence` is `"assumed"`, confirm the harness with the principal before branching — detection was a guess.
2. **ScanConflicts** (read-only) — `bun Tools/ScanConflicts.ts --target <repo>` → existing `DEVOS/`, `ISA.md`, pointer state, skill collisions. Show the report to the principal. Nothing has changed yet.
3. **DeployCore** — `bun Tools/DeployCore.ts --target <repo>` (dry run — prints the plan), show it, get a yes, then `--apply`. copyMissing only; substitutes `{{HARNESS_NAME}}` / `{{HARNESS_VERSION}}`; fails the run on surviving harness placeholders. `{{PROJECT_*}}` / `{{OWNER_*}}` tokens resolve at Spec time — not flagged here.
   - Exit 1 = source incomplete or target has no DEVOS (downstream). Exit 2 = dev-tree refusal.
4. **ActivateImports** — `bun Tools/ActivateImports.ts --target <repo>` (dry run), then `--apply` with permission. Creates/appends/refreshes the pointer block in the target's `AGENTS.md`, idempotently. Refuses when `DEVOS/SKILL.md` is absent (DeployCore first).
5. **Verify (three evidence classes)** — (a) `DEVOS/SKILL.md` + `RUNTIME/SYSTEM_PROMPT.md` + `RUNTIME/ISA_FORMAT.md` resolve on disk; (b) target `AGENTS.md` carries the pointer block (read it back); (c) versions consistent — `DEVOS/RUNTIME/VERSION` equals root `RUNTIME/VERSION`, no `{{HARNESS_*}}` survivors (DeployCore already gates this; re-check, never assume). Report what was checked.
6. **Transition** — "Setup complete. Now the Spec interview:" → `Workflows/Spec.md` (Phase 4).

## Notes

- Re-running any step is safe: DeployCore reports `idempotent re-run` with empty `added`; ActivateImports refreshes in place.
- A dry run that reports success while the target stays empty is correct behavior — the plan is the product until `--apply`.
