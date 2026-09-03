---
name: WorldThreatModel
version: 1.0.18
description: "Durable world-model rig that tests ideas, strategies, and investments against 11 horizons from 6 months to 50 years, each a deep read on geopolitics, tech, economics, society, and security, in Fast/Standard/Deep gears. USE WHEN threat model, world model, test idea, future analysis, time horizon, stress test against future, long-term risk. NOT FOR single-shot idea attack (use RedTeam)."
---

# World Threat Model Harness

## What Leaves the Room

Any idea, strategy, or investment held up against 11 horizons from half a year to half a century. Every horizon carries a deep (~10-page) world read spanning politics, technology, markets, society, environment, security, and wildcards. Three gears: Fast (~2 min, one synthesizer), Standard (~10 min, 11 parallel readers plus RedTeam and FirstPrinciples), Deep (~1 hr, adds Research and Council). Three motions: TestIdea returns a probability-weighted grid across all 11 horizons; UpdateModels and ViewModels cover the rest. (A standalone TestScenario motion for named alternate futures is still ahead — scenario pages under `Scenarios/` feed TestIdea today.)

## Why It Exists

Most plans face only the present, or the next year or two — then a horizon nobody modeled arrives and snaps them. A thesis glowing at year one can turn lethal by year ten, while a fifty-year wager can miss the near-term cascade that kills it first. No single pass holds eleven horizons with real geopolitical, economic, and technical reasoning behind each. This rig keeps eleven world reads warm and runs the idea past all of them together, with hostile review on top.

## How It Holds Together

Eleven durable horizon reads, 6 months through 50 years. Every read is a deep (~10-page) treatment of politics, technology, markets, society, environment, security, and wildcards for its window. Candidate ideas meet ALL horizons in one motion, argued over by hostile (RedTeam), foundational (FirstPrinciples), and deliberative (Council) help.

## Pick Your Path

| Path | Fits when | Doc |
|------|-----------|-----|
| **TestIdea** | "test this", "how does it age", "stress this against the future" — run anything past all 11 reads | `Workflows/TestIdea.md` |
| **UpdateModels** | "refresh the reads", "new analysis in" — rebuild horizon content from fresh research | `Workflows/UpdateModels.md` |
| **ViewModels** | "show the reads", "how fresh are the models" — inspect current horizon state | `Workflows/ViewModels.md` |

## Gears

Every path runs in three gears:

| Gear | Pace | Shape | Reach for when |
|------|-------------|----------|-------------|
| **Fast** | ~2 min | One reader fuses across all reads | Quick gut-check, loose exploring |
| **Standard** | ~10 min | 11 parallel readers plus RedTeam plus FirstPrinciples | Most calls, depth-per-minute sweet spot |
| **Deep** | Up to 1 hr | 11 readers plus per-horizon Research plus RedTeam plus Council plus FirstPrinciples | High-stakes calls, large commitments |

**Stock gear:** Standard. The caller names "fast" or "deep" to move off it.

## Where the Reads Live

Horizon store: `$DEVOS_DIR/MEMORY/RESEARCH/WorldModels/`

### Horizon Reads (base views)

| File | Window |
|------|---------|
| `INDEX.md` | Rollup of all reads with freshness dates |
| `6-month.md` | Half-year view |
| `1-year.md` | One-year view |
| `2-year.md` | Two-year view |
| `3-year.md` | Three-year view |
| `5-year.md` | Five-year view |
| `7-year.md` | Seven-year view |
| `10-year.md` | Ten-year view |
| `15-year.md` | Fifteen-year view |
| `20-year.md` | Twenty-year view |
| `30-year.md` | Thirty-year view |
| `50-year.md` | Fifty-year view |

### Scenario Reads (alternate futures)

Store: `$DEVOS_DIR/MEMORY/RESEARCH/WorldModels/Scenarios/`

| File | Sketch |
|------|----------|
| `great-correction-2027.md` | Hard US drawdown (2027 ± 12mo) — AI capex pop plus housing plus credit chain |

## Companion Docs

| File | Job |
|------|---------|
| `ModelTemplate.md` | Skeleton every horizon read follows |
| `OutputFormat.md` | Skeleton every TestIdea answer follows |

## Neighbor Capabilities

This rig conducts several DevOS muscles:

- **RedTeam** — hostile pressure on the idea inside each horizon
- **FirstPrinciples** — split the idea's premises into hard, soft, and assumed
- **Council** — multi-voice argument over viability across horizons
- **Research** — fresh evidence when building or refreshing reads

## Announce

Ahead of any path:

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the WORKFLOWNAME workflow in the WorldThreatModel skill to ACTION"}' \
  > /dev/null 2>&1 &
```

Then print: `Running the **WorkflowName** workflow in the **WorldThreatModel** skill to ACTION...`

## Tailoring Check

Before running, look for operator overrides at:
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/WorldThreatModel/`

## Traps

- **Eleven windows, 6mo–50yr.** Resist overweighting the near reads — the long structural view is where the value concentrates.
- **Reads are scenarios.** Present likelihood bands, never prophecies.
- **Stale reads mislead.** Refresh the set when the world moves decisively.

## Worked Invocations

**Pressure-test a thesis:**
```
User: "threat model my bet on AI-first content creation"
→ Read across all 11 horizons (6mo through 50yr)
→ Name structural hazards per window
→ Return the probability-weighted grid
```

**Shake a strategy:**
```
User: "what could go wrong with our newsletter business model?"
→ Trace hazard families: market, technology, regulatory, competitive
→ Return ordered risks with counters
```

## Execution Log

After any path finishes, record one JSONL line:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"WorldThreatModel","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Swap in the real path name for `WORKFLOW_USED`, a short input sketch for `8_WORD_SUMMARY`, and elapsed seconds for `SECONDS`. Mark `status: "error"` when the run failed.
