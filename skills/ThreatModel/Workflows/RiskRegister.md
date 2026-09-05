# RiskRegister

Drive the durable risk ledger — record, browse, rescore, review, retire — through the deterministic CLI.

## The Instrument

The ledger is a deterministic CLI (no model judgment in the storage path). Stock data folder is `DEVOS/PROFILE/SECURITY/THREATMODEL/`; `THREATMODEL_DATA_DIR` overrides.

```bash
T="bun DEVOS/skills/ThreatModel/Tools/RiskRegister.ts"
$T init                    # scaffold data dir + empty register
$T stats                   # posture snapshot
$T list                    # open risks, highest score first
$T review                  # risks overdue or missing a review date
$T show R-001
$T export                  # regenerate the RiskRegister.md view
```

## What the Caller Meant, as Commands

| Caller said | Command |
|---|---|
| "add a risk", "log this risk" | `add --title … --threat … --likelihood N --impact N [--assets a,b --data-classes x,y --owner O --mitigation M --response REF --review-by DATE]` |
| "what are our risks", "show the register" | `list` (append `--all` for closed rows, `--level Critical` to narrow) |
| "run a risk review", "what's overdue" | `review` |
| "update / rescore R-001" | `update R-001 [--likelihood N --impact N --status S --add-mitigation M --owner O --review-by DATE]` |
| "accept R-001" | `update R-001 --status accepted --notes "accepted by <owner>: <rationale>"` |
| "close / retire R-001" | `close R-001 --reason "…"` |
| "posture snapshot", "how many criticals" | `stats` |

## Grade Reminder

`score = likelihood(1-5) × impact(1-5)` → Low 1-4 · Medium 5-9 · High 10-14 · Critical 15-25. Anchors for both axes live in CompromiseScenario.

## Rails (safety gates)

- **JSON decides; markdown illustrates.** `RiskRegister.md` regenerates from the store — never hand-edit it; the next write discards edits. Mutate through the CLI alone.
- **No secret values.** Credential pointers by env-var name only.
- **Every row carries a `review_by`.** An unreviewed ledger sells false calm; run `review` on rhythm and push dates forward on everything touched.
- Accepting is a ruling, not a deletion — `--status accepted` with the reasoning inside `--notes`, kept visible.

## Review Rhythm

On a review pass: pull `review`, walk each due row (still true? countered? acceptable?), move status and push `review_by` ahead. Call out any Critical or High row missing an owner or a countermeasure.

## Close

Report mutations (added, rescored, retired IDs), the live Critical and High tallies from `stats`, and whatever overdue rows still await a ruling.
