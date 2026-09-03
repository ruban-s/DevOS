---
name: DevOS
version: 0.2.0
description: Developer-only AI harness built on the LifeOS kernel — Algorithm loop, spec-as-ISA, verification gates. USE WHEN setting up the harness in a repo, running the project-spec interview, checking harness health, or updating the harness. NOT FOR life/TELOS onboarding (use LifeOS reference) or general coding help (just work in the repo directly).
disable-model-invocation: true
argument-hint: "[setup|spec|doctor|update]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# DevOS

The developer-harness distribution root. Mirrors the LifeOS skill shape, stripped to the kernel:

- `RUNTIME/` — doctrine + constitution (`ALGORITHM/`, `RULES/Verification.md`, `SYSTEM_PROMPT.md`)
- `Workflows/` — `Setup.md` (repo-local install), `Spec.md` (project-spec interview), `Update.md`
- `Tools/` — bun CLIs, dry-run by default, `--apply` writes
- `skills/` — curated dev subset; `hooks/` + `hooks.json` — enforcement subset
- `templates/` — `CLAUDE.template.md`, settings parts, ISA seed, dev-profile seed

## Workflow Routing

| Trigger | Target |
|---------|--------|
| `setup`, "install harness", "set up this repo" | `Workflows/Setup.md` |
| `spec`, "run the spec interview", project onboarding | `Workflows/Spec.md` |
| `doctor`, "check harness health", "what's broken" | `Tools/Doctor.ts` |
| `update`, "update harness", after a version bump | `Workflows/Update.md` |
| "install globally", "global install", machine-wide setup | `Tools/GlobalInstall.ts --config-root <dir>` (dry-run first; `--wire-claude-md` / `--wire-hooks` are separate permissioned gates) |

Default flow: **Setup** (repo-local install + verification) → **Spec** (repo scan → current-state → ideal-state → seed `ISA.md`). Setup ALWAYS runs first.

## Hard rules

- **Additive, never clobbering.** All writes are `existsSync`-guarded copy-missing. Never overwrite or `rm` a populated file or foreign dir.
- **Dry-run first.** Every tool prints its plan without `--apply` and writes nothing. Show the plan, then re-run with `--apply`.
- **`temp/` is read-only scratch (frozen LifeOS snapshot under `temp/reference/`).** Borrow patterns by copying out; never edit, move, or run tools in place under `temp/`.

## Versioning

- `RUNTIME/VERSION` is the distribution version — the single source of truth.
- Component `version:` lines (`SKILL.md` frontmatter, `SYSTEM_PROMPT.md`, `Verification.md`, `ALGORITHM/v<V>.md` + `LATEST`) track the distribution version at release. Bump together (Update workflow lands in Phase 7); per-component divergence only after 0.1.
