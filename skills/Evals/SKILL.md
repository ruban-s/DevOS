---
name: Evals
version: 1.2.30
description: "Assertion-first framework for grading AI output — deterministic asserts plus a structured LLM judge over input-to-assert cases, pass^k/pass@k scoring, capability and regression suites, subscription-billed. USE WHEN eval, evaluate, benchmark, regression test, assertion, assert, llm-rubric, judge, pass@k, pass^k, grade output, compare prompts/models, test agent. NOT FOR scientific-method framing (use Science), property/mutation testing of code (use Hardening), or live UI verification (use Interceptor)."
context: fork
background: false
---

# Evals — grade the output, not the path

An eval hands an AI an input and checks its output with **assertions**. A case is `{id, prompt, assert:[...]}`; each assertion is **deterministic** (code — fast, free, objective) or **model-graded** (an LLM judge for what only a reader can see). Cases run several trials; the report carries **pass^k** (every trial passed — the honest number for reliability-critical behavior) and **pass@k** (any trial passed). Model calls go through `DEVOS/Tools/Inference.ts` at named levels (`low` / `medium` / `high` / `max`) — subscription-billed, no API-key path, no new dependencies.

The design tracks Anthropic's eval doctrine ([Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [Define success criteria / develop tests](https://platform.claude.com/docs/en/docs/build-with-claude/develop-tests)) and the `skill-creator` `{text, passed, evidence}` assertion convention. The typed-assert layer is promptfoo-shaped but our own TS.

**Freshness contract:** "aligned to Anthropic's doctrine" is a live claim, not a snapshot. When designing a new suite class or touching the doctrine below, re-fetch the Demystifying-evals doc and report where it has moved past what's encoded here. Advisory only — divergence gets reported, never auto-adopted, and an unreachable URL never blocks a run.

## Toolchain

| Tool | Job |
|---|---|
| `Tools/Assertions.ts` | Deterministic engine: `equals`, `contains`, `icontains`, `contains-all/any`, `regex`, `starts-with`, `ends-with`, `is-json`, `contains-json`, `max-length`, `min-length`, each with `not-` negation. Synchronous, no model call. |
| `Tools/Judge.ts` | Model-graded `llm-rubric` (1–5 → 0–1 against a threshold) and `llm-assert` (plain-language assertions → TRUE/FALSE/UNKNOWN). Forced-structured JSON verdict, reason-then-score, judge level distinct from generator, **Unknown scores as miss**. |
| `Tools/EvalRunner.ts` | Loads a suite, runs the agent-under-test per case (single-shot inference against the target system prompt), applies asserts, computes pass^k/pass@k, persists transcripts + `latest.json`. |
| `Tools/SuiteManager.ts` | Suite listing plus saturation tracking. |
| `Tools/FailureToTask.ts` | Turns real failures into cases — seed from 20–50 genuine failures. |

```bash
# Run a suite (user-customization suites resolve before the skill's own)
bun run ${DEVOS_SKILL_DIR}/Tools/EvalRunner.ts -s <suite> [-t trials] [--json]
# Sanity-check the assert engine / judge
bun run ${DEVOS_SKILL_DIR}/Tools/Assertions.ts     # 16-case self-test
bun run ${DEVOS_SKILL_DIR}/Tools/Judge.ts          # good-vs-bad discrimination
```

## Routing

| Sounds like | Workflow |
|---|---|
| "run the eval", "run suite", "evaluate this", "grade output" | `Workflows/RunEval.md` |
| "new eval", "create a suite", "eval for X", "what should I test" | `Workflows/CreateUseCase.md` |
| "write a judge", "llm-rubric", "grading criteria", "judge prompt" | `Workflows/CreateJudge.md` |
| "compare prompts", "which prompt is better", "A/B this prompt" | `Workflows/ComparePrompts.md` |
| "compare models", "which model is better", "is the cheaper rung enough" | `Workflows/CompareModels.md` |
| "eval results", "how did it score", "show the last run", "saturation" | `Workflows/ViewResults.md` |
| "create a scenario", "multi-turn eval", "scenario test" | `Workflows/CreateScenario.md` |
| "run the scenario", "run multi-turn" | `Workflows/RunScenario.md` |

## Suite file anatomy

```yaml
name: my-suite
type: regression            # or capability
pass_threshold: 0.75
agent_level: medium         # agent-under-test inference level
judge_level: high           # judge runs hotter than the generator — never the same rung
trials: 3
# system_prompt: optional override; default = the live system prompt
cases:
  - id: descriptive_name
    prompt: "the user turn sent to the agent-under-test"
    assert:
      - type: not-contains       # deterministic
        value: "should work"
        weight: 1
      - type: llm-rubric         # model-graded, weighted for partial credit
        weight: 2
        value: "Does the output tie any done-claim to verification evidence?"
      - type: llm-assert
        weight: 1
        value: ["The output does not claim success without evidence"]
  - id: should_not_case          # balance: probe should-do AND should-not
    negative: true
    prompt: "..."
    assert: [...]
```

Suites bound to a particular operator identity (personal dispositions and the like) belong in `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Evals/Suites/` — the shared skill ships only generic suites and examples.

## Reading a score

- **Outcome over path.** Tool-call-sequence asserts are brittle; the everyday suite grades what the agent produced. The legacy `core-behaviors` suite (tool-sequence graded, v1 `tasks:` format) stays on disk purely as a worked example of that anti-pattern — `EvalRunner` reports it as a named error instead of attempting it.
- **Capability starts low** (a hill to climb); **regression targets ~100%**; passing capability cases **graduate** into regression.
- **pass^k for reliability**, pass@k where a single success suffices.
- **Partial credit** through assert weights. **Balanced** should-do and should-not cases — a one-sided suite trains one-sided behavior.
- **Judge discipline:** distinct judge rung, reason before score, forced structured verdict, an **Unknown** escape hatch that counts as a miss.
- **Transcripts before scores.** Never trust a number until you've read the run — every execution persists full case transcripts to `DEVOS/MEMORY/STATE/Evals-Results/<suite>/<run>/run.json`.

## Harness wiring

- **Config-change regression:** `Suites/Regression/core-dispositions.yaml` is the runnable v2 suite for behaviour-defining changes. No hook fires it automatically — run it through `RunEval.md` after editing config, skills, or the system prompt. Identity-bound suites live in `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Evals/Suites/`, never in the shared tree.
- **ISA bridge:** a suite is the executable form of an ISA claim's falsifier (the integration map lives with the maintainer — session notes, not shipped).

## What v1 left behind

The old grader stack (`Graders/`, `TrialRunner.ts`) and the `@langwatch/scenario` path (`ScenarioRunner.ts`, `DevosAgentAdapter.ts`) predate the assertion-first rewrite — prefer the v2 toolchain above. Multi-turn scenario runs additionally need `ANTHROPIC_API_KEY` in the environment (simulator and judge agents call the API directly) — keep principal work on the subscription-billed single-shot path.

## Traps

- **Single-shot subjects narrate tool calls.** The full agentic system prompt through tool-less inference makes the agent defer and pantomime tool use instead of answering — which tanks "lead with the answer" style cases. EvalRunner appends an `[EVALUATION CONTEXT] no tools, answer directly` suffix to counter this; keep it when authoring output-graded disposition cases.
- **`judge_level` must differ from `agent_level`.** Default subject=medium, judge=high.
- **Unknown is a miss.** A judge that can't verify an assertion returns UNKNOWN, scored as fail — conservative for regression, correct for gates.
- **Deterministic asserts cost nothing; spend them first.** Reserve model asserts (`llm-rubric`/`llm-assert`) for nuance no code check can catch.
- **`is-json` wants the whole output; `contains-json` wants an embedded fragment.** Never `is-json` prose that merely mentions JSON.

## Execution log

After any workflow, append one JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Evals","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
