# ViewResults

Read back completed eval runs: list them, open the latest summary, drill into trials and grader detail, check saturation.

## Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the ViewResults workflow in the Evals skill to display eval results"}' \
  > /dev/null 2>&1 &
```

Running the **ViewResults** workflow in the **Evals** skill to display eval results...

---

## Where results live

Per-run output is the source of truth:

```
DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run-id>/results.json
```

Each file holds the run summary, per-trial scores, grader outputs, and failure detail. Query the canonical store with standard tools (`jq`, `rg`).

---

## Execution

### 1 — List a suite's runs

```bash
# Newest first
ls -1t DEVOS/MEMORY/STATE/Evals-Results/<suite>/

# Or through the manager
bun run DEVOS/skills/Evals/Tools/SuiteManager.ts list
```

### 2 — Open the latest summary

```bash
# Newest run's summary
LATEST=$(ls -1t DEVOS/MEMORY/STATE/Evals-Results/<suite>/ | head -1)
cat DEVOS/MEMORY/STATE/Evals-Results/<suite>/$LATEST/results.json | jq '.summary'

# A specific run
cat DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run-id>/results.json | jq '.summary'
```

### 3 — Check saturation (capability → regression graduation)

```bash
bun run DEVOS/skills/Evals/Tools/SuiteManager.ts check-saturation <suite-name>
```

A saturated capability suite graduates its passing cases into regression — that's the promotion path, not a number to admire.

### 4 — Drill into trials

```bash
# Per-trial verdicts
cat .../results.json | jq '.trials[] | {trial: .trial_id, pass: .passed, score: .score}'

# Failures only
cat .../results.json | jq '.trials[] | select(.passed == false)'

# Every grader output on one trial
cat .../results.json | jq '.trials[0].graders'
```

### 5 — Report

```markdown
📋 SUMMARY: Evaluation results for <suite>

📊 STATUS:
| Metric | Value |
|--------|-------|
| Run ID | <run-id> |
| Date | <date> |
| Model | <model> |
| Pass Rate | X% |
| Mean Score | X.XX |

📖 STORY EXPLANATION:
1. Retrieved evaluation run from <date>
2. <N> trials evaluated against <suite> criteria
3. <Key finding>
4. <Recommendation>

🎯 COMPLETED: Results retrieved for <suite>, <pass-rate>% pass rate.
```

---

## Trends and comparisons

No built-in CLI covers trend analysis, regression detection, or cross-run comparison yet — those are authored against the `results.json` files with `jq` or a small ad-hoc script when needed. A recurring need here justifies proposing a `Tools/TrendReport.ts` (not on disk) and wiring it into the routing table.

---

## Done

Results read from `DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run-id>/results.json`, saturation surfaced where graduation is on the table.
