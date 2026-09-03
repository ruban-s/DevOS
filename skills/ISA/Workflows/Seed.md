# Seed

Draft a project ISA from what a repository already says about itself — README, code layout, recent commits, any pre-existing PRD-shaped artifacts. For projects that predate the ISA practice and need onboarding without invented fiction.

## When to run

- Run start on a non-trivial task whose project has no `<project>/ISA.md`: `Skill("ISA", "seed <project-path>")`
- Direct onboarding: `Skill("ISA", "seed ~/Projects/<repo>")`
- First-task lazy migration: a project's first task Seeds before anything else runs

## Inputs

| Input | Required | Meaning |
|---|---|---|
| project_path | yes | Repo root (the new `ISA.md` lands here) |
| name | no | Project name; defaults to the directory basename |
| depth | no | Default: the substantial-grade project-ISA minimum. Ask explicitly for a fully-fleshed deepest bootstrap |
| dry_run | no | Default false. True → print the proposed ISA, write nothing |

## Output

`<project_path>/ISA.md` plus a status report:

```yaml
status: created | dry_run | exists
path: <project_path>/ISA.md
sources_consulted:
  - README.md
  - package.json
  - tsconfig.json
  - last 30 git commits
  - existing PRD.md / SPEC.md / acceptance.yaml (if found)
sections_drafted: [Problem, Vision, Out of Scope, Constraints, Goal, Claims, Test Strategy, Features]
sections_skipped: [Principles, Decisions, Learning, Verification]   # left for the author
isc_count: 18
review_required: true
```

## Procedure

### 1 — Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Seed workflow in the ISA skill"}' \
  > /dev/null 2>&1 &
```

### 2 — Refuse when an ISA exists

`<project_path>/ISA.md` present → abort with `status: exists`. Seed never overwrites — deepen via Interview or extend via Scaffold instead.

### 3 — Inventory the repo, in this order

1. `README.md` — primary signal for Vision, Goal, sometimes Problem
2. `package.json` — name, description, dependencies (→ Constraints: runtime, frameworks)
3. `tsconfig.json` / lockfile / `wrangler.toml` / `vite.config.*` (→ Constraints: runtime, deploy target)
4. Most recent 30 commits (→ Features: what's actively being built)
5. Pre-existing PRD-shaped artifacts — `PRD.md`, `SPEC.md`, `SPECS.md`, `acceptance.yaml`, `requirements.md` (source material; cite in Decisions)
6. Top-level directory layout (→ Features: `auth/`, `ui/`, `api/` suggest units)

### 4 — Draft from sources

- **Problem:** lift the README's Why/Motivation when present; otherwise infer one tight answer to "what does this repo solve that wasn't solved?" Keep 1–3 sentences.
- **Vision:** lift the headline pitch plus any "what it feels like" prose. Dry README → stub with `<!-- TODO: author Vision — what does delight look like for this project? -->`.
- **Out of Scope:** mine explicit "not" / "non-goals" / "we don't" statements. Nothing found → TODO stub.
- **Constraints:** read off package.json, tsconfig, deploy configs — runtime, framework, deploy target, dependency pins.
- **Goal:** the clear deliverable in 1–3 sentences, else the README headline.
- **Claims:** walk existing test files (each test name is a candidate source) and any acceptance checklist; convert to atomic claims through the Splitting Test. No suite and no checklist → 6–10 conservative claims covering build/deploy/typecheck plus the most obvious README outcomes, all `[ ]`, with a Decisions entry noting they were seeded from the README and await refinement. Always include ≥1 anti-claim from Out of Scope.
- **Test Strategy:** fill rows for claims with obvious probes (build, typecheck, deploy commands); `# TODO` markers elsewhere.
- **Features:** one per top-level source dir, cross-checked against commit messages for what's active. Claims keep global stable IDs.
- **Skip** Principles, Decisions, Learning, Verification — author-owned. Empty sections never appear. Close with a Decisions TODO: seed-generated draft; run `Skill('ISA', 'interview me on <path>')` for Principles, Vision/Goal refinement, and claim audit.

### 5 — Write and flag for review

Frontmatter:

```yaml
---
project: <name>
task: "Project ISA — <name>"
phase: scoping
progress: 0/<claim-count>
started: <ISO-8601>
updated: <ISO-8601>
---
```

Emit `review_required: true`. Seed output is a draft — a human pass is mandatory before the ISA counts as authoritative, and the project's first real task should run Interview over it.

## What Seed won't do

- **Invent fiction.** Empty README → empty Vision. Never fabricate to look complete.
- **Score generated content.** Seed stubs; Interview deepens.
- **Run CheckCompleteness.** Fresh seeds are explicitly partial — the gate would fail by design.
- **Commit.** Writes the file; the principal decides when it lands.

## Failure modes

- **No README:** abort. Seed needs at least one prose source; otherwise Scaffold from a prompt.
- **Huge history:** past ~5000 commits, sample the most recent 100 for Features inference.
- **Pre-existing ISA:** abort with `status: exists`; suggest Interview.
