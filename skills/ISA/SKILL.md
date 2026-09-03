---
name: ISA
version: 1.1.3
description: "Owns the Ideal State Artifact — the single document that pins what finished means for a project or task; drafts it, sharpens it through grilling and interview, scores it against the completeness gate, merges feature slices back to master, seeds it from a repo, and extends its decision/learning/verification trail across a fixed seventeen-section order. USE WHEN ISA, ISC, ideal state, ideal state criteria, project specification, hill-climb, articulating done, fog, not yet specified, grill me, discovery interview. NOT FOR creating new skills (use CreateSkill)."
---

# ISA — the Ideal State Artifact

One file that answers three questions before any code exists: what does finished mean, how will each part be proven, and what was learned getting there. It carries five loads at once — statement of the ideal, test plan, verification record, done condition, system of record — and this skill owns its shape plus the workflows that draft, sharpen, score, and merge it.

Above every specific ideal sits the same universal one: the principal delighted — right output, right time, right spend. `## Vision` is where that universal takes local shape for this piece of work.

## Routing

Match the request's verb. New artifact → Scaffold. Vague idea needing interrogation → Grill. Thin sections needing depth → Interview. Audit → CheckCompleteness. Feature slice back to master → Reconcile. Existing repo, no ISA → Seed. Single log entry → Append. Ambiguous between new and audit: Scaffold drafts, CheckCompleteness audits.

| Sounds like | Workflow |
|---|---|
| "scaffold", "create", "draft from this prompt", "extract feature as ephemeral" | `Workflows/Scaffold.md` |
| "grill me", "shape this idea", "figure out the shape" | `Workflows/Grill.md` |
| "interview me", "deepen", "fill in", "ask me questions" | `Workflows/Interview.md` |
| "check", "audit", "score", "is it complete" | `Workflows/CheckCompleteness.md` |
| "reconcile", "merge back", "ephemeral → master" | `Workflows/Reconcile.md` |
| "seed", "bootstrap from this repo" | `Workflows/Seed.md` |
| "append decision / learning / verification" | `Workflows/Append.md` |

## The artifact on one page

The contract is `RUNTIME/ISA_FORMAT.md`. Section order, frontmatter field names, Test Strategy column order, the `(after:)` edge syntax, and ID rules are parser truth — `Tools/isa.ts`, `Tools/ISAGate.ts`, and `Tools/IsaFrontier.ts` read exactly those shapes. If this skill's prose ever disagrees with that file, the format file wins and this skill gets corrected.

**Two homes, one shape.** Projects keep `<project>/ISA.md` across tasks; tasks live one run at `DEVOS/MEMORY/WORK/{slug}/ISA.md`. Frontmatter stays thin: `phase` (`marking` while articulating, `climbing` on the wall, `learn` on reopen, `complete` at close), `progress` as a recomputed `M/N`, plus `task`, `slug`, `started`, `updated`. A verbatim `principal_stated_goal` is recorded when goal detection fires; `parent:`/`children:` mark hierarchy — a child inherits every ancestor Constraint, and overriding one is a parent-level renegotiation, never a silent departure.

**Seventeen sections, fixed order, omit-when-empty.** No placeholder sections — the completeness gate decides what a given piece of work owes.

| # | Section | Carries |
|---|---|---|
| 1 | `## Problem` | What is broken or missing right now |
| 2 | `## Vision` | Experiential intent — what delight looks like here |
| 3 | `## Out of Scope` | Anti-vision in prose — what this is not |
| 4 | `## Language` | Ubiquitous language, one block per term with an `Avoid:` line; enters only after a term caused a real confusion; project ISAs only |
| 5 | `## Principles` | Substrate-independent truths the work respects |
| 6 | `## Constraints` | Immovable mandates, inherited ones included |
| 7 | `## Dependencies` | Cross-ISA needs, one `requires: <slug> — <contract>` line each |
| 8 | `## Goal` | The spine — 1–3 sentences naming verifiable done |
| 9 | `## Claims` | Flat home for atomic ISCs; omit when using Features |
| 10 | `## Not yet specified` | Fog — `- fog:` lines too dim for claims; graduates or dies via Decisions; empty at close |
| 11 | `## Bridge Criteria` | `Bridge:`-prefixed integration claims, verified after leaf claims |
| 12 | `## Test Strategy` | Per-claim verification contract (column order is parser truth) |
| 13 | `## Features` | `### F<n> · <name>` blocks with a one-line `Why:` + ISCs; `F0 · Cross-cutting` reserved; this OR flat Claims |
| 14 | `## Decisions` | Timestamped log with dead ends (`❌ DEAD END`), `refined:` rows, `[arch]` calls |
| 15 | `## Learning` | Conjecture / refuted-by / learned / criterion-now — only when understanding changed |
| 16 | `## Verification` | One-line provenance stub per claim (`## Log` also parses); collapsed on close |
| 17 | `## Remaining Work` | Owed work that was never this run's claim; listing here IS a complete disposition; advisory, never gated |

`## Dependencies` and `## Bridge Criteria` appear only with cross-ISA relations; `## Language` only after a real confusion. Backlog = unchecked claims ∪ unchecked Remaining Work, computed from the artifact alone.

## Claim discipline

Every ISC is one binary probe. The Splitting Test: "and"/"with" joining two verifiable things → split; one half passable while the other fails → split; "all"/"every" → enumerate; crossing a UI/API/data/logic boundary → one per boundary; no nameable probe → not atomic yet. Coverage is judged at close, not scaffold: every subsystem named in Vision/Goal carries a container claim decomposed to single-probe leaves — never split to hit a number, never invent speculative claims to cover surface that is still fog.

Three flavors share one ID space: `Anti:` claims bind the test surface — how Out of Scope, Constraints, and Principles become probe-able (at least one on every real build); `Antecedent:` claims name preconditions for experiential goals (required when the goal has to land); `Bridge:` claims hold across ISA seams (`anchors_to: cross: <slug>`).

**Fog graduation.** Statable with a nameable falsifier → a claim, even a blocked one. Statable but not probe-able yet → fog. Outside the vision → Out of Scope. At `phase: complete` the fog section is empty — graduated or killed via Decisions.

**IDs never renumber.** Splits become `ISC-N.M` (parent preserved); drops become tombstones (`- [ ] ISC-N: [DROPPED — see Decisions …]`). Short IDs (`C1`, `A3`) and legacy `## Criteria` / `## ISC Criteria` / `## Log` headings still parse. Reconcile keys on stable IDs — renumbering breaks merges silently, surfacing as "the worker's checkmarks didn't land."

## Test Strategy — the contract

Column order is parser truth: `isc | type | check | threshold | tool | anchors_to | severity`, optional eighth `tier`. Any other order mis-probes; drop `threshold` only as an empty cell, never by removing the column.

| Type | Probe | For |
|---|---|---|
| `bun-test` | `bun test <file> -t "<pattern>"` exits 0 | Example-based correctness in TS |
| `bun-property` | `fc.assert(fc.property(gen, pred), { numRuns })` | Universal claims — pure functions, parsers, serializers, transforms |
| `test` | Repo-native runner named in `tool` (`pytest`, `go test`, …) exits 0 | Non-TS stacks |
| `bash` | Shell exits 0 / output matches | grep, diff, jq probes |
| `curl` | Status/headers/body match | Reachability + contract (kept distinct: monitor-runnable) |
| `screenshot` | Interceptor-captured image | UI rendering |
| `eval` | Suite pass^k ≥ threshold | Behavioral classes one probe can't close — elected by judgment, never default |
| `manual` | Principal-recognizes-on-encounter | Experiential claims — feel, "looks right" |

`anchors_to`: `literal`, `derived: <sub-claim>`, `cross: <slug>`. `severity`: `critical` (its probe failing = the thing is DOWN whatever else passes) or blank. `tier`: blank = fast/blocking; `deep` = scheduled, never blocking.

Conventions with no new structure: the seam rule — probes attach at the highest consumer boundary exercising the claim, agreed before building, never internals; prefer existing boundaries, fewer is stronger. Pre-build probe run — run deterministic probes first; a pre-pass means the claim was already true (delete or sharpen) or the probe can't fail (fix the probe). High-blast claims (secrets, auth, money, public push, prod deploy) name deterministic probes and land in small diffs. A design question's cheapest honest probe is a marked-disposable throwaway — only the decision folds back.

## Ordering edges and parallel work

Execution ordering rides the claim line as a trailing parenthetical — `(after: ID, ID)` as the LAST parenthetical; backticked spans and mid-line parentheticals never bind. Takeable = open ∧ blockers resolved (checked or dropped) ∧ no fresh lock. `Tools/IsaFrontier.ts` computes the frontier — never re-derive it by rereading. Edges stay optional forever: encode real ordering only; most ISAs need none, no gate requires them, and edging everything for thoroughness is decoration the frontier then has to walk.

Concurrent sessions claim before building and release at close; locks are atomic per-claim files under `DEVOS/MEMORY/STATE/isa-locks/` with session ownership and a stale TTL. The tool never writes the ISA — the AI stays sole writer. Solo runs skip the protocol.

Feature slices for isolated workers are derived views at `DEVOS/MEMORY/WORK/{slug}/_ephemeral/<feature>.md`: Vision + Goal as read-only context, relevant Constraints, the feature's claims with stable IDs, matching Test Strategy rows, empty Verification. Workers operate against the slice; Reconcile merges checkmarks, stubs, Decisions, and Learning back to master deterministically — an ID present in the slice but absent in master aborts the merge — then archives the slice. Never hand-edit master from a slice.

## Completeness gate (substance-scaled)

Sections exist because content exists; substance is judged from the work, never declared as a label.

| Substance | Owes |
|---|---|
| **Trivial** (mechanical, single-probe, minutes) | Goal, Claims — minimal direct-written ISA, shape check logged inline |
| **Substantial** (multi-claim build, real blast radius) | Problem, Vision, Out of Scope, Constraints, Goal, Claims, Test Strategy, Features |
| **Deepest** (frontier multi-component work) | All seventeen (minus conditionals that don't apply) + spec interview before building |

Project-ISA override: any `<project>/ISA.md` owes full substantial-grade structure however small the current task. `CheckCompleteness` enforces the gate; a miss blocks `phase: complete` until filled. The mechanical close gate (`Tools/ISAGate.ts`, wired via `hooks/StopGates.hook.ts`) hard-blocks on non-mechanical `progress:`, unresolved fog, and Test Strategy rows missing `anchors_to` while a stated goal exists. Count-gameable checks stay advisory — a count-block manufactures the count.

## Standing rules

- **Empty sections never appear.** The seventeen-section body is capacity, not a per-task requirement; one sentence can be exactly right.
- **The changelog is git.** No in-document changelog section, ever — `git log -- <isa-path>` is the change record. What persists is the living surface: Decisions and the four-piece Learning trail.
- **Learning entries carry all four pieces** (`conjectured`, `refuted by`, `learned`, `criterion now`) in that order; anything missing one is a Decision, not Learning, and Append refuses partials.
- **Verification entries are one-line stubs** — commit hash, test name, probe ref. Proof lives in git and CI; the ISA points. Paragraphs collapse on close.
- **Anti-claims derive from the prose guardrails plus regression concerns.** A real build missing one fails the gate.
- **Feature blocks are vertical slices.** Each cuts end-to-end to an independently verifiable increment (≥1 claim) — not "the data layer" then "the API layer." The one exception is the wide sweep: a single mechanical change fanning across the artifact (rename, retype, convention migration), sequenced expand → verifiable batches → contract.
- **`Why:` must say what the name and claims don't.** A restating `Why:` is noise.
- **Reconcile is deterministic — no conflicts to resolve.** Either the ID exists in master (mechanical merge) or the run aborts. Structural changes land in master by direct edit before Reconcile runs.
- **Guardrails bind different things.** Principles bind thinking; Constraints bind the solution space; Out of Scope binds the vision; anti-claims bind the test surface. The first three are declared; anti-claims are derived into probe-able form.

## Closing

At close: fog empty, `progress` recomputed and mechanical, Verification collapsed to stubs, Remaining Work holding anything owed that was never a claim. A body edit on a `phase: complete` ISA rewinds it to `learn` with `iteration+1`; resume reads the ISA, never the conversation; a new task gets a new slug. Brief verifiers blind: steps plus where to return evidence, never the expected result.

## Examples

`Examples/` holds reference ISAs across scale × domain (the `eN-` filename prefixes are retired tier vocabulary kept as filenames only; older files may show legacy frontmatter keys and headings — the seventeen-section order and current frontmatter above win on shape). Start from the showpiece, then pick the closest domain + scale.

| File | Purpose |
|---|---|
| `Examples/canonical-isa.md` | **BeanLine** — peer-to-peer specialty-coffee marketplace. Every section populated with real-feeling Decisions and four-piece Learning. Read first. |
| `Examples/e1-minimal.md` | `--no-color` flag on a CLI. Minutes-long task, Goal + claims only — the fast-path floor. |
| `Examples/e2-backup-verify.md` | SHA-256 verification on a backup CLI's `--verify` mode. Single-domain. |
| `Examples/e2-rotate-credential.md` | Production credential rotation in CI — the ISA primitive applied to runbook work. |
| `Examples/e3-essay.md` | 1500-word essay on a thesis. Antecedent claims, post-publish reception probes. |
| `Examples/e3-help-redesign.md` | CLI `--help` redesign for first-encounter clarity. Antecedents + usability probes. |
| `Examples/e3-project.md` | arXiv metadata extractor CLI. Mid-size project shape. |
| `Examples/e4-api-migration.md` | Public API migration with backwards-compat window. Cross-cutting, every section populated. |
| `Examples/e4-brand-identity.md` | **Cardinal** — fintech brand identity (logo, type, color, voice, first surfaces). |
| `Examples/e5-desktop-app.md` | **WattWatch** — open-source home-energy desktop app. Single-user app pattern. |
| `Examples/e5-album.md` | **Mariner Frequencies** — 12-track instrumental album over 6 months. Long-form experiential. |
| `Examples/e5-enterprise.md` | **Beacon Health Alliance** — multi-region compliant patient portal. Compliance anti-claims, parallelizable features. The deepest-scale reference. |
