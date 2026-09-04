<p align="center">
  <strong>DevOS</strong><br>
  The developer harness for building software with AI agents — your codebase from current state to ideal state.
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/version-0.2.0-blue?style=flat" alt="Version"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License"></a>
  <a href="#install"><img src="https://img.shields.io/badge/bun-%3E%3D1.2-black?style=flat&logo=bun" alt="Bun"></a>
  <a href="#proof"><img src="https://img.shields.io/badge/tests-19_passing-brightgreen?style=flat" alt="Tests"></a>
  <a href="#install"><img src="https://img.shields.io/badge/agents-8-orange?style=flat" alt="Agents"></a>
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

One script, zero surprises (`install.sh`): bun check first (offers to install it when missing), then a dry-run plan, a prompt, then apply. No sudo, no writes outside the config root, safe to re-run. Full flags and refusal rules: `./install.sh --help`.

```bash
# From this checkout
./install.sh --config-root ~/.claude --apply --wire-claude-md --wire-hooks

# One-liner, release tarball (pinned version, checksum-honoring)
curl -fsSL https://raw.githubusercontent.com/ruban-s/DevOS/v0.2.0/install.sh | bash -s -- --config-root ~/.claude --apply
```

Without `--apply` (the default) nothing is written — the plan is the product until you approve it. Each wiring flag is a separate permission gate: `--wire-claude-md` appends one managed block to `CLAUDE.md`; `--wire-hooks` merges five hook entries into `settings.json` after a timestamped backup (rotation of 5). Changed your mind: delete `DEVOS/` to uninstall; remove the `devos-managed` blocks to unwire.

Prefer the granular tools? They do the same work step by step:

**Small — repo-local.** The harness lives in your project at `DEVOS/`, next to the `ISA.md` spec it enforces. Nothing touches your machine config:

```bash
bun /path/to/DevOS/Tools/DetectEnv.ts --target <repo>      # read-only: OS, harness, target state
bun /path/to/DevOS/Tools/ScanConflicts.ts --target <repo>  # read-only: what exists, what collides
bun /path/to/DevOS/Tools/DeployCore.ts --target <repo>     # plan — writes nothing
bun /path/to/DevOS/Tools/DeployCore.ts --target <repo> --apply
bun /path/to/DevOS/Tools/ActivateImports.ts --target <repo> --apply
```

**Big — global.** One install serves every repo from your machine config (`~/.claude/DEVOS/`), as a sibling of any predecessor install — which it never touches:

```bash
bun Tools/GlobalInstall.ts --config-root ~/.claude                 # plan
bun Tools/GlobalInstall.ts --config-root ~/.claude --apply         # deploy only
bun Tools/GlobalInstall.ts --config-root ~/.claude --apply --wire-claude-md --wire-hooks
```

Each wiring flag is a separate permission gate: `--wire-claude-md` appends one managed pointer block to `CLAUDE.md`; `--wire-hooks` merges five hook entries into `settings.json` after a timestamped backup (rotation of 5). Changed your mind: delete `DEVOS/` to uninstall the payload; remove the `devos-managed` blocks to unwire.

<details>
<summary><strong>Details</strong> — exit codes, refusal rules, non-Claude machines</summary>

- Every tool prints JSON; exit `0` = ok (possibly a no-op), `1` = error, `2` = refusal.
- All install tools refuse the DevOS source checkout as a target (dev-tree rule), and fail loud on an incomplete source tree.
- On machines without Claude, install writes an `AGENTS.md` pointer naming the detected harness and refuses hook wiring — hooks are a Claude Code mechanism; everywhere else the gates run by hand (`bun DEVOS/Tools/ISAGate.ts <isa>`).
- `bun Tools/Doctor.ts --target <dir>` reports machine + install health: live / broken (with fix command) / declined (silent OFF, never nagged) / stale.

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

Install scans the machine (binaries + config dirs, no network) and adapts. Hooks fire only where hooks exist; everywhere else the same gates run as explicit commands.

| Agent | Install | Always-on hooks | Pointer |
|---|---|---|---|
| Claude Code | ✅ full | ✅ 5 gates | `CLAUDE.md` |
| Codex / Cursor / Copilot / Gemini / Cline / Windsurf / OpenCode | ✅ payload | — (by design, stated at install) | `AGENTS.md` |

## Proof

No performance claims here — instead, runnable proof. Nineteen fixture-isolated tests cover the parser, the gates, the installer contract, and the hook CLIs:

```bash
bun test tests/
# 19 pass, 0 fail
```

The suite has already caught real bugs: quoted YAML scalars keeping their quotes, a dry-run path that wrote, a merge check that dropped a hook entry. Every number in this file is reproducible from this repo.

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
