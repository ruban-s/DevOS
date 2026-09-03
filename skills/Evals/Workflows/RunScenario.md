# RunScenario

Execute a multi-turn scenario: the simulated user drives the conversation, the subject agent responds, the judge grades the criteria, results flow into the pass@k pipeline beside single-shot runs.

## When to use

- A realistic user flow needs end-to-end verification
- An agent must hold its criteria across turns, not just nail one reply
- Interactive assistants (refunds, onboarding, dialogs) need regression cover
- Prompts must prove themselves against adversarial or edge-case users

**NOT for:** single-shot output grading → `RunEval` on an existing suite.

## Prerequisites

- `ANTHROPIC_API_KEY` in the environment (simulator and judge agents call the API directly)
- A scenario file at `Scenarios/<name>.scenario.ts` exporting a `ScenarioConfig` — absent → run **CreateScenario** first

## Steps

1. **Confirm the scenario path.** No file → route to `CreateScenario`; never improvise the config inline.

2. **Run once** for fast iteration:

   ```bash
   cd ${DEVOS_SKILL_DIR}
   bun run Tools/ScenarioRunner.ts --scenario Scenarios/<name>.scenario.ts
   ```

3. **Read the output** under `DEVOS/MEMORY/STATE/Evals-Results/<scenario-id>/<run-id>/`:
   - `run.json` — the full `EvalRun`: pass rates, pass@k, pass^k
   - `transcripts/trial_N.json` — per-trial `Trial` with `Transcript` plus the judge's `GraderResult`

4. **Scale up for reliability** when iterating on a prompt or config:

   ```bash
   bun run Tools/ScenarioRunner.ts --scenario Scenarios/<name>.scenario.ts --trials 3
   ```

   pass@3 measures capability (did any trial succeed); pass^3 measures consistency (did all three).

5. **Summarize to the user:** pass rate, pass@k, unmet criteria (from the last failing trial's `GraderResult.details.unmet_criteria`), and the `run.json` path.

## Exit codes

- `0` — pass@k = 1 (at least one trial cleared the judge)
- `1` — every trial failed the judge
- `2` — usage error (no `--scenario` flag)
- `3` — missing `ANTHROPIC_API_KEY`
- `4` — scenario file not found
- `5` — scenario module invalid (missing `name`/`description`/`agents`)
- `10` — fatal runtime error

## Flags

| Flag | Default | Purpose |
|---|---|---|
| `--scenario <path>` | required | Path to the `.scenario.ts` file |
| `--trials <n>` | 1 | Trial count for pass@k statistics |
| `--suite <name>` | none | Tag the run under a named eval suite |
| `--json` | false | Also print the full `EvalRun` JSON to stdout |

## Notes

- Single trials debug scenarios; regression cover wants 3+ trials.
- `ScenarioRunner` reuses the shared `Transcript`/`Trial`/`EvalRun` types directly — scenario runs sit beside traditional eval runs in `ViewResults`.
- The judge's verdict maps to a synthetic `llm_rubric` `GraderResult` (score = met_criteria / total_criteria), so scenario results compose with other graders later.
