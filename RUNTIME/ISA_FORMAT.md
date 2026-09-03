---
version: 0.2.0
---

# DevOS ISA Format v0.2

> Original DevOS specification. Supersedes the 0.1 port. Lineage: the LifeOS ISA format.
>
> What is contract vs prose here: **section order, frontmatter field names, the Test Strategy
> column order, the `(after:)` edge syntax, and ID-stability rules are parser truth** — `Tools/isa.ts`,
> `Tools/ISAGate.ts`, and `Tools/IsaFrontier.ts` read exactly these shapes. Everything else is guidance
> and may evolve freely. Change a contract shape only with the tools updated in the same commit.

## 1. What an ISA is

One artifact, five jobs: it states the ideal, it is the test plan, it verifies the build, it defines done, and it records the system. Its ISCs — Ideal State Criteria — break the ideal into claims, each falsifiable by a named probe. **If you cannot say what failure looks like, the claim can be satisfied by anything** — testability and hard-to-varyness are the same property seen from opposite sides.

No parallel artifacts. No `acceptance.yaml`, no shadow PRD, no separate test spec. Rich work simply carries more ISCs — API behavior, budgets, security posture, auth flows, data invariants are claims here, not documents elsewhere.

The ISA is alive. It sharpens through pursuit — Goal clarified, claims split, merged, or killed — driven by feedback, tool output, research, and failed verification. Rigor is the **outcome** of the process, never its precondition.

Above every specific ideal sits the same universal one: the principal delighted — the right output, at the right time, for the right spend. `## Vision` gives that goal its local shape.

## 2. Homes and lifecycles

Two canonical homes, identical format, different lifecycles:

- **Project ISAs** — `<project>/ISA.md`. For anything with persistent identity: an app, a library, a CLI, a service, this harness. The system of record; tasks read, extend, and tighten this one file.
- **Task ISAs** — `DEVOS/MEMORY/WORK/{slug}/ISA.md`. Ad-hoc work with no persistent home: one-shots, investigations, spikes. Created at scaffold, archived at close.

Project ISAs grow across tasks; task ISAs live for one run.

## 3. Frontmatter — minimal, mechanical

```yaml
---
phase: climbing                           # REQUIRED — marking | climbing | learn | complete
progress: 3/8                             # REQUIRED — closed / total, counted not felt
task: "8 word task description"           # recommended — H1 is the fallback
slug: YYYYMMDD-HHMMSS_kebab-task          # recommended — directory name is the fallback
started: 2026-01-01T00:00:00Z             # recommended, ISO 8601, set once
updated: 2026-01-01T00:00:00Z             # recommended, ISO 8601, every write
principal_stated_goal: "verbatim quote"   # when goal-detection fired (immutable; see below)
current_state: "one-line before"          # optional journey summary
ideal_state: "one-line after"             # optional; aligns with Goal
parent: some-slug                         # optional — hierarchy (constraint inheritance)
children:                               # optional — child slugs
  - other-slug
iteration: 2                              # hook-owned on reopen (omit on first run)
---
```

Rules: `phase` is a thin lifecycle bracket (`marking` while articulating, `climbing` on the wall, `learn` on reopen, `complete` at close) — moved only on genuine transitions; every other surface derives from the one table in `Tools/ascent.ts`. `progress` is `M/N`, recomputed on every check change, never batched. `task` is imperative, ≤60 chars. Never written: `effort:`, `mode:`, response/execution class fields, optimize/ideate blocks — spend is discovered, not declared.

`principal_stated_goal` is byte-verbatim (fail-closed: under 6 tokens or no propositional content → `null`, candidate logged to Decisions) and immutable unless the principal revises it — recorded as a `## Decisions` row with `refined: principal_stated_goal:`.

Hierarchy: a child inherits every ancestor `## Constraints`. Overriding one is a parent-level renegotiation logged in the parent's Decisions, never a silent child departure.

## 4. Body — seventeen sections, fixed order, omit-when-empty

Never create an empty placeholder section. The Completeness Gate (§6) decides what's required.

| # | Section | Job | Written |
|---|---------|-----|---------|
| 1 | `## Problem` | What's broken or missing right now | scoping |
| 2 | `## Vision` | Experiential intent — what delight looks like here | scoping |
| 3 | `## Out of Scope` | Anti-vision in prose — what this is *not* | scoping |
| 4 | `## Language` | Ubiquitous language — one block per term: meaning + `Avoid:` displaced names. **A term enters only after causing a real confusion.** Glossary only; never implementation, claims, or scratch. Project ISAs only. | scoping → any |
| 5 | `## Principles` | Substrate-independent truths the work respects | scoping |
| 6 | `## Constraints` | Immovable mandates (plus inherited ones) | scoping |
| 7 | `## Dependencies` | Cross-ISA needs, one machine-readable line each: `requires: <slug> — <what/contract>`. Omit with none. | scoping |
| 8 | `## Goal` | The spine — 1–3 sentences naming verifiable done | scoping |
| 9 | `## Claims` | Flat home for atomic ISCs (one binary probe each), including `Anti:` / `Antecedent:` claims. Omit when using `## Features`. | scoping → climbing |
| 10 | `## Not yet specified` | Fog — in-scope questions too dim for claims: `- fog: <sharpest statable form> — <what resolves it>`. Graduates to an ISC or dies via Decisions. Never checked, never counted. | scoping → any |
| 11 | `## Bridge Criteria` | Cross-ISA integration ISCs: `- [ ] ISC-N: Bridge: <what holds across the seam>` (`anchors_to: cross: <slug>`). Verified as a distinct pass after leaf claims. | scoping → climbing |
| 12 | `## Test Strategy` | Per-ISC verification contract (§7). | scoping |
| 13 | `## Features` | Feature mode — blocks holding claims when the work has distinct features (§5). This OR flat `## Claims`, never both. | scoping → climbing |
| 14 | `## Decisions` | Timestamped log including dead ends (`❌ DEAD END`), `refined:` rows, `[arch]` structural calls (harvested to the repo arch log). | any |
| 15 | `## Learning` | Conjecture / refuted-by / learned / criterion-now — only when understanding changed. **Not a changelog.** | learning |
| 16 | `## Verification` | One-line provenance stub per claim, collapsed on close. May be headed `## Log`. | climbing → close |
| 17 | `## Remaining Work` | Owed work that was never this run's ISC: `- [ ] <concrete work> — <why not an ISC / what it waits on>`. **Listing here IS a complete disposition** — no card or issue also required. Advisory, omit-when-empty, never gated. | learning |

## 5. Feature blocks

```markdown
## Features

### F0 · Cross-cutting
Why: invariants across every feature — security, deploy, data integrity.

- [x] ISC-1: Every response carries HSTS + X-Content-Type-Options.
- [x] ISC-2: All DB access is parameterized — no value interpolation.

### F1 · Billing
Why: a visitor becomes a paying subscriber and self-serve cancels, without support.

- [x] ISC-3: Checkout creates a session with server-side pricing.
- [ ] ISC-4: Anti: the webhook is idempotent on event.id.
```

`F0` is reserved for cross-cutting; features are `F1…` in build/read order (reordering free). **ISC IDs are global and stable** — moving a claim between features never renumbers it. **`Why:` must say what name+claims don't** — a restating Why is noise. Flat `## Claims` or `## Features`, never both.

## 6. Gates and ID discipline

**Completeness Gate (substance-scaled):**

| Substance | Required |
|-----------|----------|
| **Trivial** (mechanical, single-probe, minutes) | Goal, Claims — minimal direct-written ISA, shape check logged inline |
| **Substantial** (multi-claim build, real blast radius) | Problem, Vision, Out of Scope, Constraints, Goal, Claims, Test Strategy, Features* |
| **Deepest** (frontier multi-component work) | All seventeen* + Spec interview before building |

\* `## Dependencies` / `## Bridge Criteria` conditional on hierarchy/cross-ISA relations. `## Not yet specified` only with genuine fog. `## Language` only after a real confusion — never required by substance. `## Remaining Work` never required. Project-ISA override: any `<project>/ISA.md` needs full substantial-grade structure regardless of task size.

**Mechanical close gate (`Tools/ISAGate.ts`, wired via `hooks/StopGates.hook.ts`):** `phase: complete` hard-blocks on (1) non-mechanical `progress:`, (2) unresolved fog lines, (3) a Test Strategy row missing `anchors_to` while a stated goal exists. Count-gameable checks stay advisory — a count-block manufactures the count. Without wiring, enforce by hand at close.

**Guardrail taxonomy** (who binds whom): Principles bind **thinking**; Constraints bind the **solution space**; Out of Scope binds the **vision**; Anti-claims bind the **test surface**.

**ID-Stability Rule:** IDs never renumber. Splits become `ISC-N.M` (parent preserved); drops become tombstones (`- [ ] ISC-N: [DROPPED — see Decisions]`).

**Splitting Test (every claim):** "and"/"with"/"including" joining two verifiable things → split. Part A passable while B fails → split. "all"/"every"/"complete" → enumerate. Crosses a boundary (UI/API/data/logic) → one per boundary. Shared-symbol change → enumerate consumers, one probe each.

**Granularity rule:** split until each claim is one binary tool probe. If you can't name the probe, the claim isn't atomic.

**Coverage Gate (replaces all count floors):** every subsystem named in Vision/Goal carries a container ISC decomposed to single-probe leaves. Never split to hit a number. Judged at **close, not scaffold** — unknown-at-scaffold subsystems wait as fog and graduate.

**Doctrinal minimums:** ≥1 Anti-claim always; ≥1 `Antecedent:` when the goal is experiential.

## 7. Test Strategy — the contract

**Column order is parser truth: `isc | type | check | threshold | tool | anchors_to | severity`** — optional eighth `tier`. Any other order mis-probes.

| Type | Probe | For |
|------|-------|-----|
| `bun-test` | `bun test <file> -t "<pattern>"` exits 0 | Example-based correctness, deterministic TS |
| `bun-property` | `fc.assert(fc.property(gen, pred), { numRuns })` | Universal claims — pure functions, parsers, serializers, transforms (default 1000 runs; 10000 invariant-critical) |
| `test` | **Repo-native runner** — `<runner> <target>` exits 0, runner named in `tool` (`pytest`, `go test`, `cargo test`) | Non-TS target stacks |
| `bash` | Shell exits 0 / output matches | grep, diff, jq probes |
| `curl` | `curl -i` status/headers/body match | Reachability + contract (kept distinct from `bash`: runnable from a cloud monitor) |
| `screenshot` | Interceptor-captured image | UI rendering |
| `eval` | Suite pass^k ≥ threshold | Behavioral/quality/regression one direct probe can't close — multi-sample class only, elected by judgment, never default |
| `manual` | Principal-recognizes-on-encounter | Experiential ISCs — design, feel, "looks right" |

`anchors_to`: `literal` (the stated goal), `derived: <sub-claim>`, `cross: <slug>` (bridges). `severity`: `critical` (its probe failing = the thing is DOWN whatever else passes) or blank. `tier`: blank = fast (seconds; the only blocking surface) or `deep` (minutes–hours; scheduled when a schedule exists, alerts-and-opens on failure, never blocks).

**Verifier classes** (derived from `type`, no new field): **deterministic** (`bun-test`/`bun-property`/`test`/`bash`/`curl`/`screenshot` — a tool says no; the only blocking class) · **judged** (`eval` — rubric-bound model; failure reopens the claim, never blocks) · **attested** (`manual` — dated principal verdict + evidence pointer; tracked for staleness, never auto-failed). Prose sections have no class and can never fail. **No available verifier ⇒ DEFER** (`[DEFERRED-VERIFY]`), never fail, never substitute.

**On substantial work**, every pure-function ISC SHOULD carry a property row; on core/security surface it MUST name a probe stronger than one example. Anti-claims default to universal form (`∀ …`) over finite-and-small domains.

**Working conventions (no new structure):** **seam rule** — probes attach at the highest consumer boundary exercising the claim, agreed before building, never internals. **Pre-build probe run** — run deterministic probes before building; a pre-pass means the claim was already true (delete/sharpen) or the probe can't fail (fix it). Never applied to `manual`/experiential ISCs. **Blast-radius strictness** — high-blast ISCs (secrets, auth, money, public push, prod deploy) name deterministic probes and land in small diffs; low-blast work verifies empirically. **Async render-states** — an async-fed surface is four states (loading, error, empty, populated); enumerate or split. **Prototype-as-probe** — a design question's cheapest honest probe is a marked-disposable throwaway; only the decision folds back. **Unclaimed-work check** — at close, read the diff against the claims; unclaimed additions become retroactive claims or removals (advisory, never blocking).

## 8. Dependency edges and the frontier

Real execution ordering rides the claim line as a trailing parenthetical — `(after: ID, ID)` as the LAST parenthetical (backticked spans and mid-line parentheticals never bind). Takeable = open ∧ blockers resolved (checked or dropped) ∧ no fresh lock. The frontier is the takeable set — computed by `Tools/IsaFrontier.ts`, never re-derived by rereading.

```markdown
- [x] C1: Schema migrated with rollback script verified.
- [ ] C2: Import pipeline reads new rows (after: C1).
- [ ] C3: Docs page updated.                      ← no edge — takeable now
```

Locks: atomic per-claim files under `DEVOS/MEMORY/STATE/isa-locks/`, session-UUID ownership, 2h stale TTL. The tool never writes the ISA — the AI stays sole writer. Edges are **optional forever** — encode real ordering only; parallel claims coordinate by naming owners in `## Decisions`.

## 9. Closing conventions

- **The changelog is git.** No in-document changelog; `git log -- <isa-path>` is the record. The ISA keeps the living surface: `## Decisions` (dead ends included) and `## Learning` (only on changed understanding).
- **Evidence collapses on close.** Checked claims reduce to one-line stubs (commit hash, test name, probe ref). Proof lives in git/CI; the ISA points.
- **Brief verifiers blind.** Steps + evidence to return, never the expected result — a verifier told the pass rationalizes toward it.
- **Continuation:** a body edit on a `phase: complete` ISA rewinds to `learn`, `iteration+1` (hook-owned when wired; manual until then). Resume reads the ISA, never the conversation. New task → new slug.

## 10. Miniature

Task: add a `--json` flag to a CLI. The whole ISA, closed:

```markdown
---
task: "add --json output flag to the CLI"
slug: 20260101-000000_cli-json-flag
phase: complete
progress: 3/3
---

## Goal
The CLI accepts a `--json` flag printing one valid JSON object with the same data
as text output; default text output is unchanged.

## Claims
- [x] C1: `--json` prints output that parses as a single JSON object.
- [x] C2: The JSON carries the same fields the text output shows.
- [x] C3: Anti: running without `--json` produces byte-identical text to before.

## Test Strategy
| claim | type | check | threshold | tool | anchors_to |
| C1 | bash | `cli --json \| jq .` exits 0 | exit 0 | bash | literal |
| C2 | test | fields(json) == fields(text) | equal | pytest test/cli_test.py -k json_parity | literal |
| C3 | bash | `cli` output diff vs saved baseline is empty | empty | bash | derived: text-parity |
```

No empty sections, sequential IDs, one binary probe per claim, anti-claim present, evidence stubs collapsed to commit refs at close (omitted here).

## 11. Ownership

**The AI is the sole writer** (Write/Edit + Spec/Scaffold flows). Hooks and tools only read. `progress: M/N` reaching any surface is a faithful read of the file, never a second copy that can drift.
