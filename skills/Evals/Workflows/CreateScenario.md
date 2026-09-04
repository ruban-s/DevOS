# CreateScenario

Author a multi-turn scenario file: a simulated user drives a multi-turn conversation against the agent under test, and a judge grades the outcome. For interaction flows no single-shot case can cover.

## When to use

- The behavior only shows across turns (escalation handling, information gathering, multi-stage flows)
- A production failure needs a regression test shaped like the conversation that caused it
- A capability probe needs sustained quality over 2+ turns

**NOT for:** single-shot output grading → `CreateUseCase`.

## Inputs — confirm all six with the user

1. **Scenario name** (kebab-case, e.g. `refund-dispute`)
2. **Description** (what happens — the user simulator reads this to steer the conversation)
3. **System prompt** for the agent under test (or "use the default")
4. **Success criteria** (1–5 plain-English bullets the judge will score)
5. **Max turns** (default 6)
6. **Inference level** for the subject: `low` | `medium` | `high` | `max` (default `medium`, via `DEVOS/Tools/Inference.ts`)

## Steps

1. **Draft the file** at `Scenarios/<name>.scenario.ts`:

   ```ts
   import { anthropic } from '@ai-sdk/anthropic';
   import scenario, { type ScenarioConfig } from '@langwatch/scenario';
   import { DevosAgentAdapter } from '../Tools/DevosAgentAdapter.ts';

   const judgeModel = anthropic('claude-sonnet-4-6');

   const config: ScenarioConfig = {
     name: '<scenario-name>',
     description: '<what happens in plain English>',
     agents: [
       new DevosAgentAdapter({
         name: '<agent-name>',
         systemPrompt: '<system prompt for the agent under test>',
         level: 'medium',
       }),
       scenario.userSimulatorAgent({ model: judgeModel }),
       scenario.judgeAgent({
         model: judgeModel,
         criteria: [
           '<criterion 1>',
           '<criterion 2>',
         ],
       }),
     ],
     script: [scenario.user(), scenario.agent(), scenario.judge()],
     maxTurns: 6,
   };

   export default config;
   ```

2. **Save it** under `Scenarios/<name>.scenario.ts` — kebab-case with the `.scenario.ts` suffix, so `ScenarioRunner` identifiers derive cleanly.

3. **Smoke-test** with a single trial:

   ```bash
   bun run ${DEVOS_SKILL_DIR}/Tools/ScenarioRunner.ts --scenario ${DEVOS_SKILL_DIR}/Scenarios/<name>.scenario.ts
   ```

   Needs `ANTHROPIC_API_KEY` in the environment — simulator and judge agents call the API directly.

4. **Calibrate the criteria** until the judge's pass/fail calls match expert human judgment. Vague criteria breed flaky judges; specific, testable statements settle them.

5. **Hand off to `RunScenario`** for regression running (trials ≥ 3) once stable.

## Authoring rules

- **Criteria narrow and testable.** "Assistant is helpful" fails everything and proves nothing. "Assistant offers human escalation when the user expresses frustration" is gradable.
- **maxTurns is a ceiling.** Most scenarios should resolve in 2–4 turns; a high ceiling with a tight script beats a low ceiling with a wandering one.
- **Deterministic openers when the start matters.** `scenario.user("exact starting message")` pins the first turn; bare `scenario.user()` lets the simulator invent it from the description.
- **Cheapest sufficient rung.** `low` covers most testing; `high` or `max` only when the subject genuinely needs deep reasoning.
- **Mid-script checkpoints for staged flows.** `scenario.judge({ criteria: [...] })` mid-script fails early when a stage's criteria go unmet — no point simulating turn five of a flow that broke at turn two.

## Layout

```
DEVOS/skills/Evals/
├── Scenarios/                       # authored scenarios live here
│   └── <name>.scenario.ts
├── Tools/
│   ├── DevosAgentAdapter.ts           # wraps Inference.ts as scenario AgentAdapter
│   ├── ScenarioRunner.ts            # CLI entrypoint
│   └── ScenarioToTranscript.ts      # result → Evals types
```

## See also

- `Workflows/RunScenario.md` — execute the scenario once authored
- `Workflows/CreateUseCase.md` — the single-turn alternative
- `Workflows/ViewResults.md` — inspect scenario runs beside other evals
