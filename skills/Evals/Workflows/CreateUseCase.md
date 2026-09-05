# CreateUseCase

Build a new eval suite from scratch: requirements, directory, suite file, versioned prompts, cases, golden references, docs, validation, first run.

---

## Prerequisites

- A clear picture of what's under evaluation (prompt, model, task)
- Example inputs with a sense of what good output looks like
- Quality criteria, at least roughly

## Execution

### 1 — Gather requirements

Ask the user:

1. What is this suite evaluating — which prompt, model, or task?
2. What does good output look like? (a golden example beats a paragraph of adjectives)
3. Which criteria decide quality — accuracy, format, style, something else?
4. Do example inputs and outputs already exist anywhere?

### 2 — Create the directory

```bash
mkdir -p DEVOS/skills/Evals/Suites/<name>/{cases,prompts}
```

Personal or identity-bound suites go under `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Evals/Suites/<name>/` instead — the shared tree ships only generic suites. (`UseCases/` holds legacy v1 fixtures in the old grader schema; they document intent but are not runnable by the v2 runner.)

### 3 — Write the suite file

Create `Suites/<name>/<name>.yaml` in the assertion-first schema (see SKILL.md's anatomy section):

```yaml
name: <suite_name>
description: |
  <What this suite evaluates and why it matters>
type: regression            # or capability
pass_threshold: 0.75
agent_level: medium         # subject rung via DEVOS/Tools/Inference.ts
judge_level: high           # judge rung — always distinct from the subject
trials: 3
cases:
  - id: 001_basic
    prompt: |
      <The user turn sent to the agent-under-test>
    assert:
      - type: contains
        value: "expected phrase"
        weight: 1
      - type: llm-rubric
        weight: 2
        value: |
          <What the judge scores 1–5, reasoning first>
  - id: 002_should_not
    negative: true          # balance: should-do AND should-not
    prompt: |
      <Input where restraint is the virtue>
    assert:
      - type: not-contains
        value: "unwanted phrase"
        weight: 1
```

Deterministic asserts carry the objective checks; model asserts carry what only a reader can see. Weights encode consequence — sum them deliberately, not decoratively.

### 4 — Version the prompt under test

Create `Suites/<name>/prompts/v1.0.0.md`:

```markdown
# <Task Name> Prompt v1.0.0

## System Context

<System prompt or context>

## Task Instructions

<Specific instructions for the task>

## Output Format

<Expected output format specification>

## Examples (Optional)

<Few-shot examples if applicable>
```

Semantic versions: patch for wording fixes, minor for added sections, major for rewrites.

### 5 — Cover the distribution with cases

Aim for a spread, not a pile:

- 2–3 **easy** cases (standard inputs, clear expectations)
- 3–4 **medium** cases (typical edge cases)
- 2–3 **hard** cases (ambiguous inputs, the ones that broke things before)

Include hostile inputs — empty, very long, malformed. Every should-do family wants a should-not sibling, or the suite rewards hedging.

### 6 — Add golden outputs (optional, recommended)

Reference "perfect" outputs beside the cases they anchor. Goldens serve triple duty: judge calibration material, comparison baseline, documentation of intent.

### 7 — Document the suite

Create `Suites/<name>/README.md`:

```markdown
# <Suite Name>

## Purpose

<What this suite evaluates and why it matters>

## Target

<What's under test — prompt, model, agent>

## Assert Mix

### Deterministic (~60% by weight)
- **Phrasing** — required/forbidden strings
- **Format** — length bounds, JSON shape

### Model-graded (~40% by weight)
- **Accuracy** — factual correctness, reasoning first
- **Style** — voice and concision

## Cases

| ID | Name | Priority | Description |
|----|------|----------|-------------|
| 001 | Basic | High | Standard input |
| 002 | Edge | Medium | Edge-case handling |

## Running

```bash
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <name>
```

## Version History

- v1.0.0: Initial version
```

### 8 — Validate, then run once

```bash
# Structure present?
ls -la DEVOS/skills/Evals/Suites/<name>/

# Suite resolves and lists?
bun run DEVOS/skills/Evals/Tools/SuiteManager.ts show <name>

# First run to verify the wiring
bun run DEVOS/skills/Evals/Tools/EvalRunner.ts -s <name>
```

Inspect the first run's `results.json` under `DEVOS/MEMORY/STATE/Evals-Results/<name>/`: do the asserts parse, do judges return valid verdicts, do the scores move sensibly between an obviously-good and an obviously-bad output? Fix the suite, not the threshold, when the answer is no.

## Layout

```
Suites/<name>/
├── <name>.yaml        # Suite file: cases, asserts, thresholds, levels
├── README.md          # Purpose, target, assert mix, history
├── prompts/           # Versioned prompts under test
│   ├── v1.0.0.md
│   └── v1.1.0.md
└── golden-outputs/    # Reference outputs (optional)
    └── 001-basic.md
```

## Done

Suite created, validated, and run once. Thresholds locked at creation — later runs judge against them, never renegotiate them.
