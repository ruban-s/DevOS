<p align="center">
  <strong>DevOS</strong><br>
  The developer harness for building software with AI agents — your codebase from current state to ideal state.
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/version-0.2.0-blue?style=flat" alt="Version"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License"></a>
  <a href="#install"><img src="https://img.shields.io/badge/bun-%3E%3D1.2-black?style=flat&logo=bun" alt="Bun"></a>
  <a href="#proof"><img src="https://img.shields.io/badge/tests-87_passing-brightgreen?style=flat" alt="Tests"></a>
  <a href="#install"><img src="https://img.shields.io/badge/agents-8-orange?style=flat" alt="Agents"></a>
  <a href="#install"><img src="https://img.shields.io/badge/skills-37-purple?style=flat" alt="Skills"></a>
</p>

<p align="center">
  <a href="#see-it">See it</a> ·
  <a href="#install">Install</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#agent-matrix">Agents</a> ·
  <a href="#proof">Proof</a> ·
  <a href="#limits">Limits</a> ·
  <a href="#credit">Credit</a> ·
  <a href="#license">License</a>
</p>

---

## See it

A feature request goes in. A spec with falsifiable claims comes out, then code that can only close against evidence:

```markdown
## Goal
The CLI accepts a `--json` flag printing one valid JSON object with the same
data as text output; default text output is unchanged.

## Claims
- [x] ISC-1: `--json` prints output that parses as a single JSON object.
- [ ] ISC-2: The JSON carries the same fields the text output shows.
- [ ] ISC-3: Anti: running without `--json` produces byte-identical text to before.

## Test Strategy
| claim | type | check | threshold | tool | anchors_to |
| ISC-1 | bash | `cli --json \| jq .` exits 0 | exit 0 | bash | literal |
| ISC-2 | test | fields(json) == fields(text) | equal | pytest test/cli_test.py -k json_parity | literal |
| ISC-3 | bash | `cli` output diff vs saved baseline is empty | empty | bash | derived: text-parity |
```

No claim closes on "should work". ISC-1 closed on a passing probe; ISC-2 and ISC-3 stay open until theirs pass. That is the whole system: the spec *is* the test suite, and evidence is altitude.

## Install

Two ways in, depending on how much you want.

### Everything

One script. It checks for `bun` (installs it for you with `--with-bun`), prints the plan, then applies. No sudo, no writes outside the config root, safe to re-run:

```bash
curl -fsSL https://raw.githubusercontent.com/ruban-s/DevOS/v0.2.0/install.sh \
  | bash -s -- --config-root ~/.claude --apply --yes --with-bun
```

That deploys the payload and nothing else. Wiring is a separate permission gate and never defaults on — add it when you want the pointer block and the hooks:

```bash
curl -fsSL https://raw.githubusercontent.com/ruban-s/DevOS/v0.2.0/install.sh \
  | bash -s -- --config-root ~/.claude --apply --yes --with-bun --wire-claude-md --wire-hooks
```

`--wire-claude-md` appends one managed block to `CLAUDE.md`; `--wire-hooks` merges five hook entries into `settings.json` after a timestamped backup (rotation of 5). To uninstall, delete `DEVOS/`; to unwire, delete the `devos-managed` blocks.

Drop `--apply --yes` and you get the plan with nothing written. `--yes` is where consent moves when piped: a pipe has no TTY to prompt on, so without it the script refuses to apply a plan nobody saw. Every flag: `install.sh --help`.

### Just the skills

The 37 skills install standalone into any agent, no script and no `bun`:

```bash
npx skills add ruban-s/DevOS --full-depth --all           # every skill, every agent
npx skills add ruban-s/DevOS --full-depth -s Cortex -g    # one skill, user-level
```

`--full-depth` is required, not optional: the root `SKILL.md` otherwise shadows everything under `skills/` and you silently get 1 skill instead of 38. This route gives you the skills alone — no Algorithm loop, no gates, no ISA workflow.

<details>
<summary><strong>Details</strong> — manual install, exit codes, refusal rules, non-Claude machines</summary>

Prefer to drive it yourself? The same work, step by step, straight through the CLIs:

```bash
# Repo-local: lives in your project at DEVOS/, touches no machine config
bun /path/to/DevOS/Tools/DetectEnv.ts --target <repo>      # read-only
bun /path/to/DevOS/Tools/ScanConflicts.ts --target <repo>  # read-only
bun /path/to/DevOS/Tools/DeployCore.ts --target <repo>     # plan — writes nothing
bun /path/to/DevOS/Tools/DeployCore.ts --target <repo> --apply
bun /path/to/DevOS/Tools/ActivateImports.ts --target <repo> --apply

# Global: one install serves every repo, sibling to any predecessor it never touches
bun Tools/GlobalInstall.ts --config-root ~/.claude --apply --wire-claude-md --wire-hooks
```

- Every tool prints JSON; exit `0` = ok (possibly a no-op), `1` = error, `2` = refusal.
- All install tools refuse the DevOS source checkout as a target (dev-tree rule), and fail loud on an incomplete source tree.
- Downloads print the tarball's `sha256`. Pin `DEVOS_EXPECTED_SHA256=<hash>` and the installer compares it and aborts on mismatch before anything is extracted; leave it unset and the hash is reported, not enforced.
- Installing from a fork or a branch: `DEVOS_REPO=owner/repo`, `DEVOS_VERSION=x.y.z`, or `DEVOS_TARBALL_URL=<url>` to bypass tag resolution entirely.
- On machines without Claude, install writes an `AGENTS.md` pointer naming the detected harness and refuses hook wiring — hooks are a Claude Code mechanism; everywhere else the gates run by hand (`bun DEVOS/Tools/ISAGate.ts <isa>`).
- `bun Tools/Doctor.ts --target <dir>` reports machine + install health: live / broken (with fix command) / declined (silent OFF, never nagged). Every capability is re-probed on each run, so there is no cached state to go stale.

</details>

## How it works

```
Setup → Spec → Build → Verify
```

| Step | What happens | Driver |
|---|---|---|
| **Setup** | Harness lands in the repo; pointer block wired; install verified in three evidence classes | `Workflows/Setup.md` |
| **Spec** | Repo scan + ≤3 questions → `ISA.md`: Goal, falsifiable Claims, Test Strategy with exact probe commands, plus `DEVOS/PROFILE/` (owner, conventions) | `Workflows/Spec.md` |
| **Build** | The Algorithm loop climbs the ISA — spend scales to difficulty, discovered from the work, never predicted from a rubric | `RUNTIME/ALGORITHM/` |
| **Verify** | Structural close-gate, transcript-graded evidence checks, per-claim checkpoints, browser verification for web output | `hooks/`, `RUNTIME/RULES/Verification.md` |

Trivial work finishes in seconds on minimal resources; frontier work earns agents, audits, and stronger models. The principal steers in plain language (`go heavy`, `quick pass`), which outranks everything except blast-radius safety rules.

## Agent matrix

The global install scans the machine (binaries + config dirs, no network) and adapts. Hooks fire only where hooks exist; everywhere else the same gates run as explicit commands.

| Agent | Install | Always-on hooks | Pointer |
|---|---|---|---|
| Claude Code | ✅ full | ✅ 5 gates, with `--wire-hooks` | `CLAUDE.md` |
| Codex / Cursor / Copilot / Gemini / Cline / Windsurf / OpenCode | ✅ payload | — (by design, refused at install) | `AGENTS.md` |

Two caveats the table can't hold. Wiring is never on by default: the global install writes no pointer without `--wire-claude-md` and no hooks without `--wire-hooks`, and `--wire-hooks` is refused outright on a non-Claude harness. And detection reads the *installing machine's* config dirs, not the target repo — so in the repo-local Setup flow the pointer filename follows whoever ran Setup. On a mixed-harness team, expect both files to show up over time; the block is the same either way, and each is upserted in place.

## Proof

No performance claims here — instead, runnable proof. Eighty-seven fixture-isolated tests across six files cover the ISA parser, the close gates, both installer paths, the frontier claim protocol, and all six hook CLIs:

```bash
bun test tests/     # 87 pass, 0 fail, 300 expect() calls
bun run typecheck   # tsc --noEmit, strict — no build step, emits nothing
```

Every file in `Tools/` has direct coverage. Stated plainly, because a coverage claim is only worth its gaps: `install.sh` itself is shell and has no automated test, so its download-and-extract path is exercised by hand. Skills ship their own `package.json` and are typechecked separately in CI, not by `bun test`.

The suite has already caught real bugs: quoted YAML scalars keeping their quotes, a dry-run path that wrote, a merge check that dropped a hook entry, and a packaging bug that copied a skill's `node_modules` into every install. Every number in this file is reproducible from this repo.

## Layout

| Path | What |
|---|---|
| `SKILL.md` | Orchestrator: setup \| spec \| doctor \| update |
| `RUNTIME/` | Doctrine — `ALGORITHM/`, `RULES/Verification.md`, `SYSTEM_PROMPT.md`, `ISA_FORMAT.md`, `VERSION` |
| `Tools/` | Bun CLIs — dry-run by default, `--apply` writes |
| `Workflows/` | `Setup.md`, `Spec.md`, `Update.md` |
| `hooks/` + `hooks.json` | Enforcement gates — fail-open, always exit 0 |
| `skills/` | 37 curated dev skills ([port log](skills/DEVOS-PORT.md)) |
| `templates/` | ISA + dev-profile seeds |
| `tests/` | Harness self-tests |
| `temp/` | Scratch + frozen predecessor snapshot (`temp/reference/`) — read-only, gitignored |

Conventions: additive installs only, permission before mutation, LF endings, `.toml` never `.yaml`. Component `version:` lines track `RUNTIME/VERSION` at release.

## Limits

Stated plainly, so nobody discovers them mid-run:

- **No memory system yet.** Cortex ships as doc pointers; the knowledge archive, Atlas graph, and Pulse dashboard are v2. State today is ISAs + `MEMORY/WORK` + checkpoints.
- **Hooks are Claude-only.** Other harnesses get the pointer + manual gates — same teeth, no automation.
- **Web claims need real Chrome.** Without it, web output holds `[DEFERRED-VERIFY]`; weaker evidence is never substituted.
- **Model-graded evals need the `claude` CLI.** Deterministic asserts run anywhere; judges don't.
- **v0.2.** APIs, paths, and skill versions may shift before 1.0.

## Credit

Built on [LifeOS](https://github.com/danielmiessler/LifeOS) by Daniel Miessler (MIT) — see [LICENSE](./LICENSE).

## License

MIT — see [LICENSE](./LICENSE). Copyright (c) 2026 DevOS contributors.
