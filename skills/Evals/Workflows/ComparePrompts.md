# ComparePrompts

A/B (preferably A/B/C) test prompt versions against each other on one suite. **This workflow runs the Science loop for prompt experiments — the pre-commitment section below is mandatory, not decorative.**

## Voice notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the ComparePrompts workflow in the Evals skill to A/B test prompts"}' \
  > /dev/null 2>&1 &
```

Running the **ComparePrompts** workflow in the **Evals** skill to A/B test prompts...

---

## Pre-commitment (BEFORE any run)

- [ ] Success criterion written (which score or metric counts as "better"?)
- [ ] Threshold locked (how large a difference matters?)
- [ ] Hypothesis falsifiable (which result would DISPROVE it?)

For every hypothesis, answer aloud:

> *"What result would prove variant B is NOT better than variant A?"*

Worked form:

- Hypothesis: "v1.1.0 improves accuracy through source-verification instructions"
- Falsified if: "v1.1.0 accuracy ≤ v1.0.0 accuracy, or the gap lands under 5%"

No disproving result statable → no scientific hypothesis yet → **stop** and sharpen it.

**Prefer three variants.** A/B invites attachment to the first alternative; A/B/C explores the space and sometimes reveals the right direction was neither A nor B.

---

## Prerequisites

- A suite with cases covering the behavior in question
- Two or more prompt versions under `prompts/`
- A working definition of "better" plus the falsifier above

## Execution

### 1 — Frame the comparison (Science: Goal + Hypothesize)

Ask the user:

1. Which suite?
2. Which prompt versions? (nominate three when possible)
3. What's the hypothesis — why might one win?
4. **What would disprove it?**
5. Which metrics carry the decision?
6. What margin counts as genuinely better?

### 2 — Confirm both prompts exist

```bash
ls DEVOS/skills/Evals/Suites/<name>/prompts/
# Expect the versions under test, e.g. v1.0.0.md and v1.1.0.md
```

### 3 — Record the comparison

Create `DEVOS/skills/Evals/Suites/<name>/comparisons/<comparison-name>.yaml`:

```yaml
comparison:
  name: "v1.0.0 vs v1.1.0"
  hypothesis: |
    v1.1.0 should produce more accurate summaries due to
    added context about source verification.

  variants:
    a:
      name: "v1.0.0 (Baseline)"
      description: "Original prompt without source instructions"
      prompt: "prompts/v1.0.0.md"
    b:
      name: "v1.1.0 (Candidate)"
      description: "Added source verification instructions"
      prompt: "prompts/v1.1.0.md"

  test_cases: all  # or a subset: ["001-basic", "002-edge", "003-hard"]

  judges:
    - name: "Accuracy Judge"
      focus: "accuracy"
    - name: "Style Judge"
      focus: "style"

  settings:
    position_swap: true      # Mitigate presentation bias
    num_runs: 1              # Runs per test case
    confidence_level: 0.95   # Bar for significance claims
```

Judge rungs stay distinct from the subject rung throughout (see SKILL.md's judge discipline).

### 4 — Run once per variant

The suite file names the prompt under test, so swap it between runs:

```bash
# v1.0.0 first, then v1.1.0
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-v1.0.0
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <suite>-v1.1.0
```

Presentation-order protection for pairwise judges lives in the judge configuration (`position_swap: true`) — the grader randomizes; the runner needs no extra flag.

### 5 — Position-swap protocol

With swapping enabled, each case runs twice — A presented first, then B presented first — and scores average. This exists because judge models measurably favor whichever option they meet first.

### 6 — Collect results

```bash
ls DEVOS/MEMORY/STATE/Evals-Results/<suite>/comparisons/<comparison-name>/
```

Per-run `results.json` files carry variant scores side by side:

```json
{
  "comparison_name": "v1.0.0 vs v1.1.0",
  "run_id": "2024-01-15-143022",
  "variants": {
    "a": { "name": "v1.0.0", "wins": 5, "avg_score": 4.2 },
    "b": { "name": "v1.1.0", "wins": 7, "avg_score": 4.5 }
  },
  "per_test_case": [],
  "statistical_significance": {
    "p_value": 0.03,
    "significant": true,
    "confidence_interval": [0.15, 0.45]
  }
}
```

### 7 — Report

```markdown
## A/B Test Results: v1.0.0 vs v1.1.0

### Summary

| Metric | v1.0.0 (A) | v1.1.0 (B) |
|--------|------------|------------|
| Win Rate | 42% | 58% |
| Avg Score | 4.2 | 4.5 |
| Std Dev | 0.8 | 0.6 |

### Statistical Significance

- **p-value**: 0.03
- **Significant at 95%**: Yes
- **Confidence Interval**: [0.15, 0.45]

### Per-Dimension Breakdown

| Dimension | A Wins | B Wins | Tie |
|-----------|--------|--------|-----|
| Accuracy | 3 | 7 | 2 |
| Style | 5 | 4 | 3 |
| Format | 6 | 6 | 0 |

### Conclusion

**Winner**: v1.1.0 (Candidate)
**Confidence**: High (p < 0.05)
**Recommendation**: Deploy v1.1.0 to production
```

### 8 — Decide

| Outcome | Move |
|---|---|
| B genuinely better | Deploy B, archive A |
| A genuinely better | Keep A, iterate on B |
| No real difference | Keep the simpler prompt, or gather more data |
| Split dimensions | Consider a hybrid |

### 9 — Record the decision

Append to the suite README:

```markdown
## Comparison History

### v1.0.0 vs v1.1.0 (2024-01-15)

**Hypothesis**: v1.1.0 improves accuracy with source verification.

**Result**: v1.1.0 significantly better (p=0.03)
- Accuracy: +15%
- Style: No change
- Format: No change

**Decision**: Deployed v1.1.0 as new baseline.
```

## Running well

**Sample size.** Ten cases is the floor and statistically thin; twenty to thirty carries decent power; fifty-plus carries confidence.

**Always swap positions** on pairwise judgments. The bias is documented, not theoretical.

**Judge with a different rung** than the subject — cross-family where the stakes justify it. Self-grading flatters.

**Significance before deployment.**

| p-value | Reads as |
|---|---|
| < 0.01 | Strong evidence |
| 0.01–0.05 | Moderate evidence |
| 0.05–0.10 | Weak evidence |
| > 0.10 | Not significant |

Weak evidence deploys only behind a large effect size.

## Recurring shapes

**Instruction changes** — hypothesis names the mechanism ("explicit section headers improve structure"), focus narrows to format.

**Few-shot changes** — zero-shot baseline vs exemplars added, focus on accuracy.

**Persona changes** — generic assistant vs domain-expert framing, focus on depth.

Comparison scaffolding renders from a template when the setup grows elaborate:

```bash
bun run DEVOS/skills/Prompting/Tools/RenderTemplate.ts \
  -t Evals/Comparison.hbs \
  -d DEVOS/skills/Evals/Suites/<name>/comparisons/<name>.yaml \
  -o DEVOS/skills/Evals/Suites/<name>/comparisons/<name>-setup.md \
  --preview
```

## Stall protocol (three fruitless rounds → stop comparing)

| Signal | Question |
|---|---|
| Every variant scores alike | Is the metric measuring what matters? |
| Scores high, output still feels wrong | Which dimension goes unmeasured? |
| Gains never compound | Is the base prompt the ceiling? |
| Cases behave identically | Are the cases diverse and hard enough? |

Stuck means the frame may be wrong — criteria, cases, or the whole approach. Escalate to the Science skill's structured investigation (`Science/Workflows/StructuredInvestigation.md`) rather than running round four.

---

## Done

Comparison executed, decision recorded in the suite README. Winner deployed or iteration re-scoped.
