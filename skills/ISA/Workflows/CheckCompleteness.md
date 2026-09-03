# CheckCompleteness

Score an ISA against the substance-scaled completeness gate. Returns a structured pass/fail plus the gap list. The bar comes from the work's substance — never from a caller-declared label.

## When to run

- After Scaffold: confirm the fresh ISA meets the gate for its substance
- Before close: confirm the ISA still meets it after structural edits
- Direct request: `Skill("ISA", "check completeness of <isa-path>")`
- Internal call from Scaffold or Interview

## Inputs

| Input | Required | Meaning |
|---|---|---|
| isa_path | yes | The ISA to score |
| substance | no | Bar to score against (`trivial` / `substantial` / `deepest`); default judged from Goal/Vision scope and blast radius |
| strict | no | Default true. False downgrades hard failures to warnings |

## Output

```yaml
status: pass | fail
substance: substantial
required_sections:
  Problem: present
  Vision: present
  Out of Scope: missing
  Principles: present
  Constraints: present
  Dependencies: absent     # conditional — owed only with cross-ISA relations
  Goal: present
  Claims: present            # `## Claims` current, `## Criteria` legacy — either satisfies
  Bridge Criteria: absent  # conditional — owed only with cross-ISA relations
  Test Strategy: present
  Features: present
  Decisions: present
  Learning: missing        # the four-piece trail (legacy `## Changelog` heading accepted as alias, soft warn to rename)
  Verification: empty    # `## Verification` or `## Log`; empty acceptable until claims start closing
gaps:
  - section: Out of Scope
    severity: hard
    reason: required for substantial work, missing entirely
  - section: Learning
    severity: hard
    reason: required for deepest-grade work, missing entirely
isc_quality:
  total: 24
  coverage_gaps: 0             # Vision/Goal subsystems with no container claim
  granularity_violations: 0
  anti_criteria_count: 2
  antecedent_present: true
  test_strategy_orphans: 0     # leaf claims with no Test Strategy row naming a probe
  id_stability_violations: 0
```

## Procedure

### 1 — Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CheckCompleteness workflow in the ISA skill"}' \
  > /dev/null 2>&1 &
```

### 2 — Read the ISA

Load `isa_path`. Parse frontmatter and section headers.

### 3 — Set the bar

| Substance | Owes |
|---|---|
| Trivial | Goal, Claims |
| Substantial | Problem, Vision, Out of Scope, Constraints, Goal, Claims, Test Strategy, Features |
| Deepest | All seventeen minus inapplicable conditionals + spec interview ran before building |

Project ISA (`<project>/ISA.md`) — always scored substantial or above, whatever the current task's size.

### 4 — Classify each owed section

| Verdict | Test |
|---|---|
| `present` | Header exists with content — length ungraded; one sentence can be exactly right |
| `missing` | Header absent |
| `empty` | Header present, body whitespace — acceptable only for `Verification`/`Log` before claims start closing |

### 5 — Audit claim quality

Walk every claim in `## Claims` (legacy `## Criteria` also parses; `ISC-N` and short `C1`/`A3` IDs both count; a dedicated `## Anti-claims` section counts toward the anti-claim check):

- **Granularity** — each claim names one binary tool probe (or one is inferable from phrasing). Compound "and/with" claims fail.
- **Coverage** — every Vision/Goal subsystem carries a container claim decomposed to single-probe leaves; never split to hit a number. A subsystem with no container claim is a gap UNLESS held as fog in `## Not yet specified` before `phase: complete`. Coverage judges at close: **non-empty fog at `phase: complete` is a HARD fail** — every entry graduated or killed via Decisions. Speculative scaffold-time claims covering fog-shaped surface are themselves a quality failure (no honest probe exists for them).
- **Backlog (advisory, never a gate)** — unchecked claims ∪ unchecked `## Remaining Work`. Recording an item in Remaining Work is a complete disposition — no card required, never required, never counted toward coverage. Report the size for visibility; never fail on it. Unchecked claims stay in Claims (ID-stability forbids moving them into Remaining Work).
- **Anti-claims (HARD on substantial+)** — ≥1 (`Anti:` inline, `A`-prefixed short ID, or `## Anti-claims` entry). The check with teeth: unenforced anti-claims get skipped in practice.
- **Test Strategy coverage (HARD on substantial+)** — every leaf claim owns a row naming its probe. Orphans fail (trivial minimal ISAs carry no Test Strategy section — exempt).
- **Antecedent** — experiential goals need ≥1 `Antecedent:`-prefixed claim.
- **ID stability** — unique IDs, no renumbering gaps. Tombstones (`ISC-7: [DROPPED — see Decisions 2026-04-15]`) are valid.
- **No changelog section** — any iter-by-iter narrative changelog is a HARD fail; git is the change record. A legacy-titled `## Changelog` holding the four-piece trail passes as a `## Learning` alias with a SOFT rename nudge. The trail itself lives in `## Learning`.
- **Evidence collapsed on close** — every closed (`[x]`) claim's Verification entry is a one-line stub (commit hash, test name, probe ref). A retained multi-line evidence paragraph is a soft fail — collapse it.
- **Anchoring** — with frontmatter `principal_stated_goal:` set, every claim needs an `anchors_to` value in Test Strategy (`literal` or `derived: <sub-claim>`). Orphans fail hard.

### 5a — Goal-signal consistency (only on ISAs carrying the key)

This check fires ONLY when frontmatter explicitly contains `principal_stated_goal` (any value, including `null`). Older ISAs without the key predate the mechanism and are exempt — presence of the key is the marker.

- Recorded detector signal set but literal empty/null → hard fail: detection fired, preservation didn't.
- Literal set but under 6 tokens or proposition-free → hard fail: should have been `null` per the minimum-content rule.

### 5b — Artifact presence (deepest grade, keyed ISAs only)

Same marker rule as 5a. For every `[x]` claim asserting a named design surface ("the proposal includes X", "a table appears"), scan the ISA body for that surface textually: asserted-complete but textually absent → hard fail. The artifact holds its own design surface; it never references ephemeral chat context.

### Legacy frontmatter — inert, never graded

Retired ceremony keys (density/divergence/acknowledgment families, `effort:` / `effort_source:` / `mode:`) still sit on archived ISAs. Presence is never a failure, values never validated, and new ISAs never write them. The only ambiguity keys graded on current ISAs are `context_sufficient` and `interview_invoked`. Don't invert deleted checks.

### 6 — Compose the report, 7 — gate the close

Emit the YAML above. `status: pass` only with zero hard gaps; `strict: false` softens hard to warnings (mid-interview use). Pre-close, hard gaps block `phase: complete` until filled.

## Severity table

| Gap | Trivial | Substantial | Deepest |
|---|---|---|---|
| Goal missing | hard | hard | hard |
| Claims missing | hard | hard | hard |
| Problem missing | — | hard | hard |
| Test Strategy missing | — | hard | hard |
| Vision missing | — | hard | hard |
| Out of Scope missing | — | hard | hard |
| Constraints missing | — | hard | hard |
| Features missing | — | hard | hard |
| Principles missing | — | — | hard |
| Decisions missing | — | — | hard |
| Learning missing (four-piece trail) | — | — | hard |
| Narrative `## Changelog` section present (git is the changelog — convert to `## Learning`) | hard | hard | hard |
| Verification entry keeps an evidence paragraph instead of a stub | soft | soft | soft |
| Spec interview skipped before building | — | — | hard |
| Anti-claim count = 0 (≥1 owed) | soft | hard | hard |
| Leaf claim with no Test Strategy row naming its probe | — | hard | hard |
| Antecedent missing (experiential goal) | hard | hard | hard |
| ID-stability violation | hard | hard | hard |
| Coverage gap (subsystem with no container claim) | — | hard | hard |
| Non-empty `## Not yet specified` at `phase: complete` | hard | hard | hard |
| Granularity violation | hard | hard | hard |
| Anchoring violation (orphan claim, keyed ISAs only) | hard | hard | hard |
| Goal-signal mismatch (recorded signal vs recorded literal, keyed ISAs only) | hard | hard | hard |
| Artifact-presence violation (keyed ISAs only) | — | — | hard |
| `context_sufficient` missing (current scaffolds only; legacy-keyed and trivial inline ISAs exempt) | — | hard | hard |

## Failure modes

- **Frontmatter missing or malformed:** abort explicitly. `phase:` and `progress:` are non-negotiable; `slug`/`task` may derive from directory name / H1.
- **Project ISA scored trivial:** override to substantial; report the override.
- **Claim-body parse failure:** treat as zero claims, surface the parse error.
