# CreateJudge

Design a custom model-graded judge for a suite: requirements, data file, rendered prompt, integration, calibration.

## Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CreateJudge workflow in the Evals skill to create LLM judge"}' \
  > /dev/null 2>&1 &
```

Running the **CreateJudge** workflow in the **Evals** skill to create LLM judge...

---

## Prerequisites

- A suite that exists or is being created
- Written-down criteria for what "good" means
- A golden example of good output, ideally

## Execution

### 1 — Gather requirements

Ask the user:

1. What's under evaluation — which content type, which task?
2. Which criteria decide it — accuracy, style, format, something else?
3. Which scale — 1–5 for graded nuance (the default), binary for true gates?
4. Reasoning required? (Yes — reasoning-first verdicts discriminate measurably better.)

### 2 — Write the judge data file

Create `DEVOS/skills/Evals/UseCases/<name>/judge-config.yaml`:

```yaml
judge:
  name: <Descriptive Name> Judge
  focus: <accuracy | style | completeness | custom>
  scale:
    type: 1-5  # Recommended, or "binary"
  criteria:
    - name: <Criterion 1>
      description: <What this measures>
      weight: 0.4  # Weights sum to 1.0
    - name: <Criterion 2>
      description: <What this measures>
      weight: 0.3
    - name: <Criterion 3>
      description: <What this measures>
      weight: 0.3
  reasoning_required: true  # Always true for accuracy judgments
  position_swap: false  # True for A/B comparisons
context:
  task_description: |
    <What the original task asked for>
  golden_output: |
    <Optional reference "perfect" output for comparison>
output:
  format: json  # or "structured"
```

### 3 — Render the judge prompt

```bash
bun run DEVOS/skills/Prompting/Tools/RenderTemplate.ts \
  -t Evals/Judge.hbs \
  -d DEVOS/skills/Evals/UseCases/<name>/judge-config.yaml \
  -o DEVOS/skills/Evals/UseCases/<name>/judge-prompt.md \
  --preview
```

### 4 — Review the render

Read `judge-prompt.md` and check: every criterion present, scale unambiguous, reasoning demanded before the number, output format specified. Fix the data file and re-render — never hand-patch the rendered prompt, or the two drift.

### 5 — Wire it into the suite

Reference the judge from the suite's model-graded asserts (`llm-rubric` / `llm-assert` in the case `assert:` blocks), with the suite's `judge_level` set to a rung distinct from `agent_level`:

```yaml
judge_level: high   # never the same rung as the subject
```

### 6 — Calibrate the judge

Run the suite and inspect verdicts directly:

```bash
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>
cat DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run-id>/results.json | jq '.trials[0].graders'
```

While iterating, scope the suite to a single case so each cycle is cheap. Check: valid structured output, coherent reasoning, scores inside the expected range, graceful behavior on edge inputs. Iterate on the criteria wording until the judge's pass/fail calls match expert human judgment — vague criteria breed flaky judges; specific, testable statements settle them.

## Design rules

**Criteria.** Three to five, non-overlapping, weighted by consequence (summing to 1.0), each with concrete high/low indicators — not adjectives.

**Reasoning first.** Always:

```yaml
reasoning_required: true
```

**Scale choice.**

| Scale | Fits |
|---|---|
| 1-5 | Graded nuance — the reliable default |
| Binary | True pass/fail gates |
| 1-3 | Coarse bands where finer steps carry no meaning |

Never 0–100 — it calibrates poorly.

**Position swapping.** For pairwise comparisons:

```yaml
position_swap: true
```

Both presentation orders run; scores average. Presented-first bias is strong enough to flip close calls.

## Worked shapes

### Accuracy judge

```yaml
judge:
  name: Factual Accuracy Judge
  focus: accuracy
  scale:
    type: 1-5
  criteria:
    - name: Factual Correctness
      description: All claims match source material
      weight: 0.5
    - name: Completeness
      description: Covers all key points from source
      weight: 0.3
    - name: No Hallucinations
      description: No invented or fabricated information
      weight: 0.2
  reasoning_required: true
```

### Style judge

```yaml
judge:
  name: Voice Authenticity Judge
  focus: style
  scale:
    type: 1-5
  criteria:
    - name: Tone Match
      description: Matches the target casual, conversational style
      weight: 0.4
    - name: Word Choice
      description: Vocabulary consistent with the target voice
      weight: 0.3
    - name: Personality
      description: Captures the author's distinct perspective
      weight: 0.3
  reasoning_required: true
```

## Done

Judge designed, rendered, wired, and calibrated against human judgment. The suite runs it from here.
