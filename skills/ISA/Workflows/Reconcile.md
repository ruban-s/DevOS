# Reconcile

Deterministic merge of a feature-slice excerpt back into the master ISA, keyed on stable claim IDs. This is what keeps isolated feature work (parallel sessions, fresh-context workers) from drifting off-spec — without it, slices and master diverge into the same "code drifts from spec" failure the ISA exists to prevent.

## When to run

- A worker operating on a feature slice finishes
- At learning time: `Skill("ISA", "reconcile <ephemeral-path> → <master-path>")`
- Direct request: `Skill("ISA", "reconcile <ephemeral-path> → <master-path>")`

## Inputs

| Input | Required | Meaning |
|---|---|---|
| ephemeral_path | yes | The feature slice (`DEVOS/MEMORY/WORK/{slug}/_ephemeral/<feature>.md`) |
| master_path | yes | The master ISA the slice derived from |
| dry_run | no | Default false. True → report planned changes, write nothing |

## Output

```yaml
status: applied | dry_run | aborted
ephemeral: <path>
master: <path>
applied:
  iscs_checked: [ISC-12, ISC-13, ISC-14, ISC-15, ISC-31]   # claims flipped to [x]
  verification_added: 5                                     # provenance stubs appended
  decisions_added: 2                                        # Decisions entries appended
  learning_added: 1                                         # Learning entries appended
archived_to: DEVOS/MEMORY/WORK/.../_ephemeral/.archive/AuthSystem-2026-04-15.md
errors:
  - isc: ISC-99
    reason: not present in master — slice references unknown ID
```

## Procedure

### 1 — Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Reconcile workflow in the ISA skill"}' \
  > /dev/null 2>&1 &
```

### 2 — Read both files

Load slice and master. Confirm the slice carries the canonical header marker (`<!-- EPHEMERAL FEATURE FILE — derived from ... -->`); anything else aborts — only Scaffold's slice mode produces mergeable input.

### 3 — Plan the claim merge

Per claim in the slice:

- `[x]` in slice, `[ ]` in master → stage the flip
- `[x]` in both → no-op
- `[ ]` in slice → no-op (work not done there)
- ID in slice, absent in master → ERROR, ID-stability violation
- Renumbered sequence, shifted tombstone → ERROR, ID-stability violation

### 4 — Stage Verification entries

Every staged flip needs the slice's `## Verification` entry for that claim. Stage them for master's `## Verification`. Each must be a **one-line provenance stub** — commit hash, test name, or probe ref. A full evidence paragraph in the slice collapses to the stub before staging; proof lives in git and CI, not in master.

### 5 — Stage Decisions entries

Append the slice's `## Decisions` to master's, prefixed `[from <feature>]:` with timestamps preserved.

### 6 — Stage Learning entries

New four-piece entries (conjectured / refuted-by / learned / criterion-now) append to master's `## Learning` with a `[surfaced in <feature>]:` note. No changelog section exists to merge — git is the change record.

### 7 — Refresh master frontmatter

- `progress: M/N` recomputed from the new `[x]` count
- `updated:` set to now
- `phase:` untouched — unless every claim is `[x]`, then `verify` (the close transition belongs to the principal, not to Reconcile)

### 8 — Apply or dry-run

`dry_run: true` → emit the YAML, stop. Otherwise apply via Edit/Write in order: frontmatter → `## Claims` checkmarks → `## Verification` append → `## Decisions` append → `## Learning` append.

### 9 — Archive the slice, 10 — report

Move the slice to `<slice-dir>/.archive/<feature>-<YYYY-MM-DD>.md` (permanent — forensics, never deleted). Emit the YAML report.

## Conflict policy

There are no conflicts — the merge is deterministic. An ID exists in master (mechanical merge) or it doesn't (abort). Structural slice edits (splitting ISC-7 into ISC-7.1/ISC-7.2) land in master by direct edit BEFORE Reconcile runs; Reconcile mints no IDs, it only flips checkmarks on existing ones. A slice gone stale against master aborts with the divergence surfaced — re-extract fresh or back-port by hand.

## Failure modes

- **ID-stability violation:** slice references an ISC master doesn't know. Abort, never silently drop. Master is truth; slices can't mint IDs.
- **Missing canonical header:** abort. Only Scaffold-produced slices merge.
- **Flipped claim with no Verification entry:** soft warning. The flip stands (the worker marked it done) but evidence is missing — the verify pass catches it.
- **Concurrent edits:** single-threaded by design. A second Reconcile landing on an already-merged claim reports "already checked" — correct behavior.

## Idempotency

Re-running the same slice against the same master changes nothing after the first run and reports zero applied changes. Safe to retry.
