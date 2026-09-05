# AGENTS.md

Developer harness repo (DevOS v0.2.0). Own project lives at root: `SKILL.md` (orchestrator), `Workflows/`, `Tools/`, `RUNTIME/`, `skills/`, `hooks/`, `templates/`, `tests/`. `temp/reference/` is a frozen predecessor snapshot for reading only (gitignored).

## Boundary

- Do not edit, move, or "fix" anything under `temp/`. Copy patterns out into the root project instead.
- Do not run `temp/reference/LifeOS/install/install.sh` or `bun temp/reference/LifeOS/Tools/*.ts` — those tools assume the reference harness sits at the repo root and refuse inside a source tree. If borrowing an install/tool pattern, copy the file out first and re-resolve its `LifeOS/` / `install/` / `<configRoot>` paths.
- `temp/reference/AGENTS.md` and `temp/reference/SECURITY.md` describe the old repo, not this one. They apply only when reading reference code — never follow their install/deploy instructions here.
- Root is a git repo (`origin https://github.com/ruban-s/DevOS.git`, branch `main`). The reference snapshot's history lives separately in `temp/reference/.git` — never mix the two. Normal read-only git commands at root are fine; do not commit, push, or rewrite history unless the user asks.

## Conventions (root project)

- Runtime is `bun >= 1.2`; tools are `bun Tools/*.ts`, dry-run by default, `--apply` writes. Never node/npm/npx, and never a build step — the payload ships `.ts` run directly by bun, never compiled output.
- Typecheck with `bun run typecheck` (`tsc --noEmit`, strict). This rule used to read "never node/npm/**tsc**"; it was narrowed deliberately, so read the reasoning before widening it back. `tsc --noEmit` is static analysis, not a build — it emits nothing and never enters the runtime path. The root `package.json` carries `typescript` + `@types/bun` as devDependencies *only*; `node_modules/` is gitignored and `PAYLOAD` (an explicit allowlist in `Tools/lib.ts`) means none of it can ship into an install. `@types/bun` is not optional: without it tsc cannot resolve `Bun`, `process`, `console`, `node:*`, or `bun:test`, and the check reports 148 errors instead of real ones. `bun.lock` is committed so CI's `--frozen-lockfile` pins the typechecker; an unpinned one lets CI go red with no change here.
- Verify with `bun test tests/` (52 tests, all fixture-isolated in tmp; must stay green) and `bun run typecheck`. Run both after any `Tools/` or `hooks/` change. CI (`.github/workflows/ci.yml`) runs the same two, both blocking.
- All writes additive (`existsSync`-guarded copy-missing); permission before mutation; LF line endings.
- Config is `.toml`, never `.yaml`.
- Substitution tokens are `{{HARNESS_NAME}}` / `{{HARNESS_VERSION}}` / `{{PROJECT_NAME}}` / `{{OWNER_NAME}}` (identity-only scope — other `{{TOKEN}}` forms in borrowed bodies are legitimate, don't flag).

## Current state

- DevOS v0.2.0 kernel complete (doctrine, tools, hooks, skills, global install, tests). Open item: live `~/.claude` install needs explicit user permission.
- No `opencode.json` instructions file. Keep repo-specific guidance in this file until the project outgrows it.
