# RunEval

Execute an eval suite end to end: validate it exists, run it through `EvalRunner`, collect the persisted results, report the summary.

## Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the RunEval workflow in the Evals skill to execute evaluation"}' \
  > /dev/null 2>&1 &
```

Running the **RunEval** workflow in the **Evals** skill to execute evaluation...

---

## Prerequisites

- The suite exists under `Suites/` (or the user layer at `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Evals/Suites/`)
- Its cases carry prompts plus asserts, and the suite file names its thresholds and trial count

Missing suite → hand off to `CreateUseCase.md` instead of inventing one inline.

## Execution

### 1 — Confirm the suite resolves

```bash
# Shipped suites live here; user suites resolve first
ls DEVOS/skills/Evals/Suites/<suite>/
```

### 2 — Run it

```bash
# Canonical entry point
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>

# Override the trial count for pass^k / pass@k depth
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite> -t 5

# Machine-readable output
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite> --json

# Saturation is a separate question, asked separately
bun run DEVOS/skills/Evals/Tools/SuiteManager.ts check-saturation <suite>
```

### 3 — Collect results

Per-run output is the source of truth:

- `DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run-id>/results.json` — summary, per-trial scores, grader outputs, failure detail

Query it with standard tools (`jq`, `rg`).

### 4 — Report the summary

```markdown
📋 SUMMARY: Evaluation completed for <suite>

📊 STATUS:
| Metric | Value |
|--------|-------|
| Pass Rate | X% |
| Mean Score | X.XX |
| Failed Tests | X |

📖 STORY EXPLANATION:
1. Ran evaluation against <N> test cases
2. Deterministic asserts completed first, free
3. Model judges graded accuracy and style where code checks couldn't reach
4. Weighted scores computed per case, aggregated per suite
5. Compared against the locked pass threshold
6. <Key finding 1>
7. <Key finding 2>
8. <Recommendation>

🎯 COMPLETED: Evaluation finished with X% pass rate.
```

## When it fails

1. Model access misconfigured — single-shot runs route through `DEVOS/Tools/Inference.ts`, so check that path and its subscription auth first
2. Cases with malformed inputs or assert blocks
3. Threshold or level misconfiguration in the suite file
4. Terminal error output for the rest

## Done

Evaluation executed, results persisted under `DEVOS/MEMORY/STATE/Evals-Results/`, summary reported.
