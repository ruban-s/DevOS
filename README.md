<p align="center">
  <strong>DevOS</strong>
</p>

<p align="center">
  <strong>done is a claim with a receipt</strong>
</p>

<p align="center">
  Your coding agent says "should work" and moves on.<br>
  DevOS makes it prove the claim first. Same agent. Same model. Fewer lies.
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/version-0.2.0-blue?style=flat" alt="Version"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License"></a>
  <a href="#install"><img src="https://img.shields.io/badge/bun-%3E%3D1.2-black?style=flat&logo=bun" alt="Bun"></a>
  <a href="#the-numbers"><img src="https://img.shields.io/badge/tests-87_passing-brightgreen?style=flat" alt="Tests"></a>
  <a href="#agent-matrix"><img src="https://img.shields.io/badge/agents-8-orange?style=flat" alt="Agents"></a>
  <a href="#just-the-skills"><img src="https://img.shields.io/badge/skills-38-purple?style=flat" alt="Skills"></a>
  <a href="https://skills.sh/ruban-s/DevOS"><img src="https://www.skills.sh/b/ruban-s/DevOS" alt="skills.sh"></a>
</p>

<p align="center">
  <a href="#see-it">See it</a> ·
  <a href="#install">Install</a> ·
  <a href="#the-numbers">Numbers</a> ·
  <a href="#the-loop-unpacked">Loop</a> ·
  <a href="#the-gates-unpacked">Gates</a> ·
  <a href="#agent-matrix">Agents</a> ·
  <a href="#limits">Limits</a> ·
  <a href="#license">License</a>
</p>

---

## See it

A feature request goes in. A spec of falsifiable claims comes out, and every claim stays open until something runs:

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

ISC-1 closed on a passing probe. ISC-2 and ISC-3 stay open until theirs pass. Now watch what happens when the agent tries to declare victory anyway:

<table>
<tr>
<th width="50%">🗣️ Plain agent</th>
<th width="50%">🪨 Agent under DevOS</th>
</tr>
<tr>
<td valign="top">

> All three criteria are implemented and the feature is complete. The JSON output should match the text fields, and existing behavior is preserved.

*Ships. Nothing ran.*

</td>
<td valign="top">

```json
"hard": [{
  "code": "PROGRESS_FORMAT",
  "message": "progress: \"3/3\" is not
             the mechanical count 2/3"
}],
"blocks": true,
"note": "BLOCKS close — fix hard violations"
```

*Blocked. Counted, not trusted.*

</td>
</tr>
</table>

That is real output from `Tools/ISAGate.ts`, not a mockup. The gate never reads the agent's summary. It counts closed boxes, checks every claim has a probe row, and refuses the close when the two disagree.

```
┌──────────────────────────────────────────────────────┐
│   claims closed on evidence      █████████     100%  │
│   claims closed on "should work" ░░░░░░░░░       0%  │
│   your model                     ░░░░░░░░░  unchanged│
│   your workflow                  ██░░░░░░░  one file │
└──────────────────────────────────────────────────────┘
```

DevOS does not make the agent smarter. It makes the agent *accountable*.

## Install

DevOS comes in two sizes.

### Just the skills

38 standalone skills — research, red-teaming, evals, scraping, prompt work. No script, no runtime, works in any skills-compatible agent:

```bash
npx skills add ruban-s/DevOS
```

Pick the ones you want, or take all 38. This route gives you skills only: no Algorithm loop, no gates, no ISA.

### The whole thing

One script. It checks for `bun` (installs it with `--with-bun`), prints the plan, then applies. No sudo, no writes outside the config root, safe to re-run:

```bash
curl -fsSL https://raw.githubusercontent.com/ruban-s/DevOS/v0.2.0/install.sh | bash -s -- --yes
```

That deploys the payload to `~/.claude/DEVOS/` and nothing else. Wiring is a separate permission gate and never defaults on. Add `--wire-claude-md --wire-hooks` when you want the pointer block and the five always-on gates. Add `--with-bun` to let it install bun for you.

Drop `--yes` and you get the plan with nothing written. `--yes` is where consent moves when piped: a pipe has no TTY to prompt on, so without it the script refuses to apply a plan nobody saw.

<details>
<summary><strong>More doors into the cave</strong> · manual install, forks, uninstall, non-Claude machines</summary>

<br>

Prefer to drive it yourself? Same work, step by step, straight through the CLIs:

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
- All install tools refuse the DevOS source checkout as a target, and fail loud on an incomplete source tree.
- Downloads print the tarball's `sha256`. Pin `DEVOS_EXPECTED_SHA256=<hash>` and the installer verifies it and aborts on mismatch. Leave it unset and the hash is reported, not enforced, and it says so on stderr.
- Forks and branches: `DEVOS_REPO=owner/repo`, `DEVOS_VERSION=x.y.z`, or `DEVOS_TARBALL_URL=<url>` to bypass tag resolution entirely.
- Without Claude on the machine, install writes an `AGENTS.md` pointer naming the detected agent and refuses hook wiring. Hooks are a Claude Code mechanism; everywhere else the same gates run by hand.
- `bun Tools/Doctor.ts --target <dir>` reports install health: live / broken (with the fix command) / declined. Every capability is re-probed per run, so no cached state goes stale.

Changed your mind: delete `DEVOS/` to remove the payload, delete the `devos-managed` blocks to unwire. Nothing else was touched.

</details>

Full flags and refusal rules: `install.sh --help`.

## The numbers

No token-savings chart here, because DevOS does not claim one. What it claims is that its own gates work, and that is testable.

### What actually runs

| Surface | Covered by | Count |
| ------- | ---------- | ----: |
| ISA parser, close gates, frontier protocol | `tests/isa.test.ts` | — |
| Both installer paths, seeding, imports | `tests/install.test.ts`, `tests/e2e.test.ts` | — |
| All six hook CLIs | `tests/hooks.test.ts` | 6 of 6 |
| Every file in `Tools/` | direct coverage | 13 of 13 |
| **Total** | `bun test tests/` | **87 pass, 0 fail** |

```bash
bun test tests/     # 87 pass, 0 fail, 300 expect() calls, ~3s
bun run typecheck   # tsc --noEmit, strict — no build step, emits nothing
```

The suite has already caught real bugs: quoted YAML scalars keeping their quotes, a dry-run path that wrote, a merge check that dropped a hook entry, and a packaging bug that copied a skill's `node_modules` into every install (42,453 files instead of 710).

> [!IMPORTANT]
> Before you read that table as "fully tested": `install.sh` is shell and has **no automated test**. Its download-and-extract path is exercised by hand only. That gap is not theoretical — it is exactly how a broken release-tag URL shipped in this README. Skills carry their own `package.json` and are typechecked separately in CI, not by `bun test`.

> **Note on honesty.** The gap paragraph above stays in. A coverage claim is worth exactly its gaps, and a repo that only prints its green numbers has taught you nothing about the red ones.

## The loop, unpacked

```
Setup → Spec → Build → Verify
```

| Step | What happens | Driver |
| ---- | ------------ | ------ |
| **Setup** | Payload lands in the repo, pointer block wired, install verified in three evidence classes | `Workflows/Setup.md` |
| **Spec** | Repo scan plus ≤3 questions produce `ISA.md`: Goal, falsifiable Claims, Test Strategy with exact probe commands | `Workflows/Spec.md` |
| **Build** | The Algorithm loop climbs the ISA. Spend scales to difficulty, discovered from the work, never predicted from a rubric | `RUNTIME/ALGORITHM/` |
| **Verify** | Structural close-gate, transcript-graded evidence checks, per-claim checkpoints, browser verification for web output | `hooks/`, `RUNTIME/RULES/Verification.md` |

Trivial work finishes in seconds on minimal resources. Frontier work earns agents, audits, and stronger models. You steer in plain language (`go heavy`, `quick pass`), which outranks everything except blast-radius safety rules.

## The gates, unpacked

Six hook CLIs, five of them wired always-on. Every one fails open and always exits 0, so a broken gate can never wedge your session.

<details>
<summary><strong>What each gate refuses</strong> · and what it lets through</summary>

<br>

| Gate | Fires on | Refuses |
| ---- | -------- | ------- |
| `ISAGate` | close attempt | A `phase: complete` whose checked boxes don't match the mechanical count, or claims with no Test Strategy row |
| `StopGates` | session stop | Ending a turn with the ISA in a state the structural gate rejects |
| `VerificationGate` | session stop | A visual/UI claim closed without a real captured screenshot in the turn's evidence |
| `CheckpointPerISC` | Write/Edit | Nothing — it records a per-claim baseline so a regression has something to diff against |
| `ISASync` | Write/Edit | Nothing — it re-derives ascent state so every surface reads the same number |
| `AlgorithmNudge` | Bash, prompt | Nothing — it flags blast radius before a destructive command runs |

The three that refuse are the teeth. The three that don't are the memory. Together they mean "done" is a count, not an opinion.

</details>

## Agent matrix

The install scans the machine (binaries and config dirs, no network) and adapts. Hooks fire where hooks exist; everywhere else the same gates run as explicit commands.

| Agent | Install | Always-on gates | Pointer |
| ----- | ------- | --------------- | ------- |
| **Claude Code** | ✅ full | ✅ 5, with `--wire-hooks` | `CLAUDE.md` |
| Codex · Cursor · Copilot · Gemini · Cline · Windsurf · OpenCode | ✅ payload | — refused at install, by design | `AGENTS.md` |

Two caveats a table can't hold. Wiring is never on by default, and `--wire-hooks` is refused outright on a non-Claude agent. And detection reads the *installing machine's* config dirs, not the target repo, so in the repo-local flow the pointer filename follows whoever ran Setup. On a mixed team expect both files over time; the block is the same either way and each is upserted in place.

## Layout

<details>
<summary><strong>What lives where</strong> · and the conventions that govern it</summary>

<br>

| Path | What |
| ---- | ---- |
| `skills/DevOS/SKILL.md` | Orchestrator: setup \| spec \| doctor \| update. Deploys to `DEVOS/SKILL.md` |
| `RUNTIME/` | Doctrine — `ALGORITHM/`, `RULES/Verification.md`, `SYSTEM_PROMPT.md`, `ISA_FORMAT.md`, `VERSION` |
| `Tools/` | Bun CLIs — dry-run by default, `--apply` writes |
| `Workflows/` | `Setup.md`, `Spec.md`, `Update.md` |
| `hooks/` + `hooks.json` | Enforcement gates — fail-open, always exit 0 |
| `skills/` | 38 curated dev skills ([port log](skills/DEVOS-PORT.md)) |
| `templates/` | ISA and dev-profile seeds |
| `tests/` | Self-tests |
| `temp/` | Scratch and frozen predecessor snapshot — read-only, gitignored |

Conventions: additive installs only, permission before mutation, LF endings, `.toml` never `.yaml`. Component `version:` lines track `RUNTIME/VERSION` at release. Ships `.ts` run directly by bun, so there is no build step and nothing to go stale between source and dist.

</details>

## Limits

Stated up front, so nobody discovers them mid-run:

- **No memory system yet.** Cortex ships as doc pointers. The knowledge archive, graph, and dashboard are v2. State today is ISAs plus `MEMORY/WORK` plus checkpoints.
- **Hooks are Claude-only.** Other agents get the pointer and manual gates: same teeth, no automation.
- **Web claims need real Chrome.** Without it, web output holds `[DEFERRED-VERIFY]`. Weaker evidence is never substituted for the missing screenshot.
- **Model-graded evals need the `claude` CLI.** Deterministic asserts run anywhere; judges don't.
- **v0.2.** APIs, paths, and skill versions may shift before 1.0.

## Credit

Built on [LifeOS](https://github.com/danielmiessler/LifeOS) by Daniel Miessler (MIT).

## License

MIT — see [LICENSE](./LICENSE). Copyright (c) 2026 DevOS contributors.

---

<sub>
<strong>Docs:</strong>
<a href="./skills/DevOS/SKILL.md">Orchestrator</a> ·
<a href="./Workflows/Setup.md">Setup</a> ·
<a href="./Workflows/Spec.md">Spec</a> ·
<a href="./RUNTIME/ISA_FORMAT.md">ISA format</a> ·
<a href="./RUNTIME/RULES/Verification.md">Verification rules</a> ·
<a href="./skills/DEVOS-PORT.md">Skill port log</a> ·
<a href="./LICENSE">License</a> ·
<a href="https://github.com/ruban-s/DevOS/issues">Issues</a>
<br>
No claim closes on "should work".
</sub>
