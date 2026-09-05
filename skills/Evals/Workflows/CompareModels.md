# CompareModels

Run several inference rungs against one prompt on one suite, then recommend a rung with the quality/cost/latency trade-off stated explicitly.

---

## Prerequisites

- A suite with cases plus the one prompt under test
- A decision criterion ranked ahead of the others (quality first? cost first? latency first?)

## Execution

### 1 — Frame the comparison

Ask the user:

1. Which suite?
2. Which rungs? (`low` / `medium` / `high` / `max` via `DEVOS/Tools/Inference.ts`)
3. What decides — raw quality, quality-per-cost, latency ceiling?
4. Any cost or latency constraints that disqualify a rung outright?

### 2 — Note the rungs in the suite file

The subject rung is the suite's `agent_level`:

```yaml
agent_level: medium   # vary per run: low, medium, high, max
```

### 3 — Record the comparison

Create `DEVOS/skills/Evals/Suites/<name>/model-comparisons/<comparison-name>.yaml`:

```yaml
model_comparison:
  name: "low vs medium vs high on this suite"
  hypothesis: |
    Testing which inference rung carries this task.
    Expect diminishing returns above medium for style,
    continued gains for accuracy.

  prompt: "prompts/v1.0.0.md"  # Same prompt for every rung

  levels:
    - id: "low"
      name: "Low rung"
    - id: "medium"
      name: "Medium rung"
    - id: "high"
      name: "High rung"

  test_cases: all

  judges:
    - name: "Primary Judge"
      focus: "accuracy"

  settings:
    runs_per_model: 1
    confidence_level: 0.95

  track_costs: true
  track_latency: true
```

### 4 — Run once per rung

Vary `agent_level` across runs of the same suite, then compare the persisted `results.json` files with `jq` — no cross-rung comparison CLI ships with this skill; the JSON is the interface:

```bash
# Sequential — one run per rung
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-low
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-medium
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-high

# Parallel — the same three runs in the background
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-low &
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-medium &
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-high &
wait
```

Each run's `results.json` lands at `DEVOS/MEMORY/STATE/Evals-Results/<suite>-<rung>/<run-id>/results.json`.

### 5 — Collect results

Runs persist under:

- `DEVOS/MEMORY/STATE/Evals-Results/<suite>/models/<run-id>/`
- `DEVOS/MEMORY/STATE/Evals-Results/<suite>/models/<run-id>/comparison.json`

### 6 — Render the report

```bash
bun run DEVOS/skills/Prompting/Tools/RenderTemplate.ts \
  -t Evals/Report.hbs \
  -d DEVOS/MEMORY/STATE/Evals-Results/<suite>/models/<run-id>/summary.yaml \
  -o DEVOS/MEMORY/STATE/Evals-Results/<suite>/models/<run-id>/report.md
```

### 7 — Tabulate

**Overall table:**

| Rung | Pass Rate | Mean Score | Std Dev | Cost/1K | Latency |
|---|---|---|---|---|---|
| high | 92% | 4.3 | 0.5 | $$$ | 1.2s |
| medium | 88% | 4.1 | 0.6 | $$ | 0.8s |
| low | 78% | 3.7 | 0.8 | $ | 0.5s |

**Per-dimension table:**

| Rung | Accuracy | Style | Format | Speed |
|---|---|---|---|---|
| high | 4.5 | 4.6 | 4.0 | 1.2s |
| medium | 4.4 | 3.9 | 4.2 | 0.8s |
| low | 4.2 | 3.8 | 3.8 | 0.5s |

### 8 — Test the gaps

Per rung pair: p-value, effect size, confidence interval.

```markdown
### Pairwise Comparisons

| Comparison | Winner | p-value | Significant? |
|------------|--------|---------|--------------|
| high vs medium | high | 0.04 | Yes |
| high vs low | high | 0.01 | Yes |
| medium vs low | medium | 0.12 | No |
```

### 9 — Recommend with trade-offs explicit

| Deciding factor | Weight | Leading rung |
|---|---|---|
| Quality | 50% | high |
| Cost | 25% | low |
| Latency | 25% | low |

```markdown
## Recommendation

**Primary use**: medium rung
- Near-top quality (4.1 mean) at a fraction of high's cost
- 88% pass rate clears the locked threshold

**Budget option**: low rung
- Acceptable quality where latency matters more than polish
- Fastest, cheapest — verify against the threshold first

**Fallback**: high rung
- For the cases where medium demonstrably fails
- Route hard cases up, not everything
```

### 10 — Record it

Append to the suite README:

```markdown
## Model Comparison History

### low vs medium vs high (2024-01-15)

**Purpose**: Determine the cheapest rung that clears the threshold.

**Results**:
1. high rung - 92% pass rate, 4.3 mean score
2. medium rung - 88% pass rate, 4.1 mean score
3. low rung - 78% pass rate, 3.7 mean score

**Decision**:
- Production: medium rung
- Budget fallback: low rung
```

## Running fairly

1. **Same prompt** for every rung.
2. **Same trial count** — variance differs by rung; don't let sample size decide.
3. **Same judge configuration** — the grader must not move while the subject does.
4. **Multiple trials** where the decision is close.

## Judge selection

A judge sharing the subject's rung flatters it. Keep `judge_level` distinct from every `agent_level` under test — and for close quality calls, prefer an ensemble across rungs over a single judge, weighting non-self judgments higher.

## Rung-selection heuristics

| Situation | Direction |
|---|---|
| Quality-critical, cost flexible | Best raw performer |
| Quality-critical, cost-sensitive | Best quality-per-cost |
| Latency-critical | Fastest rung clearing the threshold |
| High volume | Cheapest rung clearing the threshold |

## Report skeleton

```markdown
# Model Comparison Report: <Suite>

## Executive Summary

**Best Overall**: <Rung>
**Best Value**: <Rung>
**Fastest**: <Rung>

## Detailed Results

### Performance Metrics

[Table of metrics]

### Statistical Analysis

[Pairwise comparisons with p-values]

### Cost Analysis

[Cost per 1K tokens, total run cost]

### Latency Analysis

[Average response time, p95 latency]

## Recommendation

[Final recommendation with rationale]

## Raw Data

[Link to full results JSON]
```

## Done

Rungs compared on identical ground, trade-offs tabulated, decision recorded. Best rung identified, not assumed.
