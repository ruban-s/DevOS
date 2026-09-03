---
name: ThreatModel
version: 1.0.1
description: Defensive review of your own systems — chart where sensitive data sits across your asset inventory, walk through compromise stories (what a taken asset leaks, how far damage travels, how you would answer), and keep a living risk ledger with likelihood-times-impact grades, owners, countermeasures, and review rhythm through a deterministic CLI. Real findings stay in your private profile tree; this skill ships code only. USE WHEN threat model, threat modeling, risk register, risk assessment, what if X got hacked, compromise scenario, blast radius, sensitive data map, where is our sensitive data, data classification, risk review, add a risk, accept a risk, security risk posture. NOT FOR active pentesting or exploitation (use an offensive-security skill), world-scale futures stress-testing of ideas (use WorldThreatModel), or executing incident response (use your incident-response runbooks — this skill plans them).
---

# ThreatModel

A defensive lens on the estate you actually operate. Three moves: name where the sensitive material rests, rehearse what its capture would cost, and keep every resulting risk somewhere it gets revisited instead of buried.

## Tailoring

**Before running anything, check for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/ThreatModel/`

When present, honor `PREFERENCES.md` inside (data spots, which data classes matter most, runbook cross-links). Otherwise proceed on defaults.

## Code Versus Data (safety rail)

**This skill folder is shareable code. It never holds findings.**

- Everything a run produces — scenario notes, classifications, ledger rows — lands in the private data folder, never in this tree.
- Stock data folder: `DEVOS/PROFILE/SECURITY/THREATMODEL/` (a release-excluded profile branch). Set `THREATMODEL_DATA_DIR` to point elsewhere.
- `Tools/RiskRegister.ts` structurally rejects any data folder resolving inside a `skills/` path.
- Ledger rows name credentials by env-var NAME alone — never values. Tokens, keys, and cookies have no place in threat-model output.

## Voice Notification

**On every run, do BOTH:**

1. **Spoken ping**:
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running WORKFLOWNAME in ThreatModel"}' \
     > /dev/null 2>&1 &
   ```

2. **Printed line**:
   ```
   Running **WorkflowName** in **ThreatModel**...
   ```

## Pick Your Path

| Path | Fits when | Doc |
|------|-----------|-----|
| **SensitiveDataMap** | "where does our sensitive material live", "classify our data", "which assets carry what" | `Workflows/SensitiveDataMap.md` |
| **CompromiseScenario** | "what if this box fell", "walk me through a breach of X", "how far does X reach" | `Workflows/CompromiseScenario.md` |
| **ThreatModelTarget** | "model this service", "assess the whole estate", "risk picture for X" | `Workflows/ThreatModelTarget.md` |
| **RiskRegister** | "show the ledger", "log a risk", "review overdue risks", "retire a risk" | `Workflows/RiskRegister.md` |

## Inventory Hookup

Where the install carries Atlas (`DEVOS/ATLAS/Atlas.ts`), paths treat it as the live inventory:

```bash
bun DEVOS/ATLAS/Atlas.ts blast <key>     # what leans on this asset
bun DEVOS/ATLAS/Atlas.ts owns <key>      # what this asset owns / would strand
bun DEVOS/ATLAS/Atlas.ts exposed <key>   # which credentials it would spill, worst first
bun DEVOS/ATLAS/Atlas.ts sql "SELECT ..."  # read-only census questions
```

`exposed` settles the "one trust hop" question mechanically: it lists credentials the asset carries, transitively through owned items, worst-tier first. Match it with a DEPENDS_ON lookup for reachable data stores:

```bash
bun DEVOS/ATLAS/Atlas.ts sql "SELECT a.kind, a.canonical_key FROM edge e JOIN asset a ON a.id=e.dst WHERE e.kind='DEPENDS_ON' AND e.status='active' AND e.src=(SELECT id FROM asset WHERE canonical_key='<key>')"
```

No Atlas means working from what the operator names plus repo and config reading — and saying so on the page. Never fabricate an inventory.

## Grading

`score = likelihood (1-5) × impact (1-5)` → **Low** 1-4 · **Medium** 5-9 · **High** 10-14 · **Critical** 15-25.

Impact follows data classes and reach rather than gut feel: an asset whose fall spills credentials or customer records opens at impact 4+. Likelihood follows exposure (public route, auth edge strength, patch posture, credential hygiene).

## Traps

- **The ledger markdown is a printout.** The JSON store decides; drive changes through the CLI and never hand-edit the exported `RiskRegister.md` — the next export overwrites it.
- **Unsorted is not safe.** An asset without a data tag reads *unclassified*, never *clean*. Missing classification proves nothing about missing data (the absence-metric rule). SensitiveDataMap must enumerate the unclassified explicitly.
- **Graph reach is derived testimony.** Inventory queries report what the graph currently knows; ahead of a high-stakes call, re-check the decisive edges against the provider's authoritative API (graphs lag and under-model).
- **Reach counts alongside holdings.** A bare box with keys or bindings into data-bearing systems inherits their weight. Walk trust with `atlas exposed` (credentials) plus the DEPENDS_ON lookup (stores) before grading impact; never eyeball it.
- **Stacked credentials are a standalone result, not arithmetic.** One asset holding two credential sets into two separate domains breaks a boundary that was meant to hold — write that collapse up on its own, since the remedy differs (split the holdings, not just rotate them).
- **A ledger without review is decoration.** Every risk carries a `review_by` date from birth; the `review` command surfaces the overdue. An unreviewed ledger manufactures false calm.

## Worked Invocations

**Sweep for sensitive holdings:**
```
User: "Which of our assets have sensitive data?"
→ SensitiveDataMap: census the inventory, tag each data-bearing asset
→ EstateDataMap.md lands in the private data folder
→ Answer returns the tagged map plus the explicit unclassified roll
```

**Rehearse a fall:**
```
User: "What happens if our analytics worker gets popped?"
→ CompromiseScenario: reach via the inventory, material at stake, attacker follow-ons,
  detection posture, answer sketch
→ Scenario note lands in the private data folder; risks land in the ledger with grades
```

**Run the review:**
```
User: "Run a risk review"
→ RiskRegister: overdue plus open risks by grade, walked to a disposition
  (counter / accept / retire), review dates moved
```
