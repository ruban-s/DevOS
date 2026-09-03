# AGENTS.md

Developer harness repo (DevOS v0.1). Own project lives at root: `SKILL.md` (orchestrator), `Workflows/`, `Tools/`, `RUNTIME/`, `skills/`, `hooks/`, `templates/`, `tests/`. `temp/reference/` is a frozen LifeOS snapshot for reading only (gitignored).

## Boundary

- Do not edit, move, or "fix" anything under `temp/`. Copy patterns out into the root project instead.
- Do not run `temp/reference/LifeOS/install/install.sh` or `bun temp/reference/LifeOS/Tools/*.ts` — those tools assume LifeOS sits at the repo root and refuse inside a source tree. If borrowing an install/tool pattern, copy the file out first and re-resolve its `LifeOS/` / `install/` / `<configRoot>` paths.
- `temp/reference/AGENTS.md` and `temp/reference/SECURITY.md` describe the old repo, not this one. They apply only when reading reference code — never follow their install/deploy instructions here.
- Root is not a git repo (LifeOS history lives in `temp/reference/.git`). Do not run git commands at root or init a repo unless the user asks.

## Conventions (root project)

- Runtime is `bun >= 1.2`; tools are `bun Tools/*.ts`, dry-run by default, `--apply` writes. Never node/npm/tsc.
- Verify with `bun test tests/` (19 tests, all fixture-isolated in tmp; must stay green). Run it after any `Tools/` or `hooks/` change.
- All writes additive (`existsSync`-guarded copy-missing); permission before mutation; LF line endings.
- Config is `.toml`, never `.yaml`.
- Substitution tokens are `{{HARNESS_NAME}}` / `{{HARNESS_VERSION}}` / `{{PROJECT_NAME}}` / `{{OWNER_NAME}}` (identity-only scope — other `{{TOKEN}}` forms in borrowed bodies are legitimate, don't flag).

## Current state

- DevOS v0.1 kernel complete (doctrine, tools, hooks, skills, global install, tests). Open item: live `~/.claude` install needs explicit user permission.
- No `opencode.json` instructions file. Keep repo-specific guidance in this file until the project outgrows it.
