# Template Integration

Judge prompts, rubrics, cases, comparisons, and reports render from Handlebars templates through the Prompting skill's renderer. Templates keep grading language consistent across suites; data files keep each suite's specifics separate.

## Template inventory

```
~/.claude/Templates/Evals/
├── Judge.hbs       # Configurable LLM-as-Judge prompts
├── Rubric.hbs      # Scoring-criterion definitions
├── TestCase.hbs    # Test-case specifications
├── Comparison.hbs  # A/B test setups
└── Report.hbs      # Result reports with statistics
```

## Rendering a custom judge prompt

Write the judge's specifics as data, then render:

```bash
bun run DEVOS/skills/Prompting/Tools/RenderTemplate.ts \
  -t Evals/Judge.hbs \
  -d DEVOS/skills/Evals/UseCases/<name>/judge-config.yaml \
  -o DEVOS/skills/Evals/UseCases/<name>/judge-prompt.md
```

Data-file shape:

```yaml
judge:
  name: Content Quality Judge
  focus: accuracy
  scale:
    type: 1-5
  criteria:
    - name: Factual Accuracy
      description: Information matches source material
      weight: 0.4
    - name: Completeness
      description: Covers all key points
      weight: 0.3
    - name: Clarity
      description: Easy to understand
      weight: 0.3
  reasoning_required: true
  position_swap: true
output:
  format: json
```

## Rendering a rubric

```bash
bun run DEVOS/skills/Prompting/Tools/RenderTemplate.ts \
  -t Evals/Rubric.hbs \
  -d DEVOS/skills/Evals/UseCases/<name>/rubric.yaml \
  -o DEVOS/skills/Evals/UseCases/<name>/rubric.md
```

## Judge design rules

1. **Reasoning before scoring** — explanation first, number second, always.
2. **Five-point scale** — the reliable default; binary only for true gates, never 0–100.
3. **Judge ≠ subject** — different inference rung than the agent under test.
4. **Position swapping** — average both presentation orders for comparisons.
5. **Panels for contested calls** — several independent judgments beat one expensive one.
