---
name: Science
version: 1.1.19
description: "The scientific method run as a general-purpose problem-solving loop — fix the goal first, hold several falsifiable hypotheses at once, design experiments that can actually fail, measure honestly against that goal, and iterate — scaling from a TDD micro-cycle through feature validation up to MVP launch. USE WHEN think about, figure out, experiment, iterate, optimize, hypothesis, science, full cycle, quick diagnosis, structured investigation, how do we test, analyze results. NOT FOR multi-angle lens passes (use IterativeDepth)."
---

## Customization

**Before executing, check for user customizations at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Science/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


# Science

## Why Guessing Fails

Most problem-solving is guessing wearing a work uniform. The first plausible idea gets built, something gets tweaked, and the effort stops when the result "seems better" — which is confirmation bias dressed as progress. With no definition of success you cannot tell improvement from noise, so you either tweak forever or quit early. And with a single hypothesis, the only idea ever tested is the one you already believed. The discipline this skill imposes repairs all three failures at once: a stated goal, at least three competing hypotheses, tests built so they *can* fail, and numbers compared against the goal rather than against your hopes.

## The Operating Cycle

One loop, anchored by the goal — without success criteria the rest of the cycle has nothing to judge results against:

```
GOAL ──────── what would count as success?
   │
OBSERVE ───── what is actually true right now?
   │
HYPOTHESIZE ─ what might work? (several candidates, never one)
   │
EXPERIMENT ── design and run a test that could fail
   │
MEASURE ───── collect the data
   │
ANALYZE ───── how does the data compare to the goal?
   │
ITERATE ───── revise the hypothesis, re-enter the loop
```

The answer is produced by the loop, never by the first guess.

Seven workflows carry the cycle end to end, plus two diagnostic shortcuts: a 15-minute debugging sprint and a structured pass for multi-factor investigations. The same loop runs at three altitudes — minutes (TDD), days (feature validation), months (MVP launch).

## Workflow Routing

**Output when executing:** `Running the **WorkflowName** workflow in the **Science** skill to ACTION...`

### Core Workflows

| Workflow | Trigger | File |
|----------|---------|------|
| **DefineGoal** | "define the goal", "what are we trying to achieve" | `Workflows/DefineGoal.md` |
| **GenerateHypotheses** | "what might work", "ideas", "hypotheses" | `Workflows/GenerateHypotheses.md` |
| **DesignExperiment** | "how do we test", "experiment design" | `Workflows/DesignExperiment.md` |
| **MeasureResults** | "what happened", "measure", "results" | `Workflows/MeasureResults.md` |
| **AnalyzeResults** | "analyze", "compare to goal" | `Workflows/AnalyzeResults.md` |
| **Iterate** | "iterate", "try again", "next cycle" | `Workflows/Iterate.md` |
| **FullCycle** | Full structured cycle | `Workflows/FullCycle.md` |

### Diagnostic Workflows

| Workflow | Trigger | File |
|----------|---------|------|
| **QuickDiagnosis** | Quick debugging (15-min rule) | `Workflows/QuickDiagnosis.md` |
| **StructuredInvestigation** | Complex investigation | `Workflows/StructuredInvestigation.md` |

## Reference Material

| File | Contents |
|------|----------|
| `Methodology.md` | Phase-by-phase deep dive |
| `Protocol.md` | How other skills embed the Science loop |
| `Templates.md` | Goal / Hypothesis / Experiment / Results templates |
| `Examples.md` | Worked examples at every scale |

## Where the Loop Applies

The cycle is domain-neutral — only its costume changes:

| Domain | The loop looks like | Paired skill |
|--------|--------------------|--------------|
| **Code** | TDD: red → green → refactor | Development |
| **Products** | MVP → measure → iterate | Development |
| **Research** | question → study → analysis | Research |
| **Prompts** | prompt → eval → revise | Evals |
| **Decisions** | options → Council → choice | Council |

And it stretches or compresses in time:

| Altitude | Cycle length | Instance |
|----------|-------------|----------|
| **Micro** | minutes | TDD: test, code, refactor |
| **Meso** | hours–days | feature: spec, build, validate |
| **Macro** | weeks–months | product: MVP, launch, measure PMF |

## Handoffs

| Cycle phase | Bring in |
|-------------|----------|
| **Goal** | Council to validate it |
| **Observe** | Research for context |
| **Hypothesize** | Council for candidates, RedTeam to stress them |
| **Experiment** | Development (Worktrees) to run tests in parallel |
| **Measure** | Evals for structured measurement |
| **Analyze** | Council for multi-perspective reading |

## Anti-Patterns

| Sounds like | Instead |
|-------------|---------|
| "Make it better" | "Cut load time from 3s to 1s" |
| "I think X will work" | "Three candidates — X, Y, Z — and how each could fail" |
| "Prove me right" | "Build the test that could prove me wrong" |
| "That failure doesn't count" | "What did the failure teach us?" |
| "One more experiment…" | "Ship it — production runs the next cycle" |

## Gotchas

- **Three hypotheses minimum before any test.** A single-hypothesis test is trial-and-error with extra steps — and confirmation bias with none.
- **A measurement is specific and reproducible, or it isn't a measurement.** "Feels faster" is a mood.
- **FullCycle is for systematic investigations.** A quick bug hunt belongs in QuickDiagnosis mode, not the full ceremony.

## Examples

**Example 1: Quick diagnosis**
```
User: "figure out why Surface time filters show stale items"
→ QuickDiagnosis mode
→ Hypothesis: timestamp format mismatch in D1
→ Test: query D1 for the actually-stored format
→ Analyze: stored vs expected
→ Result: ISO string vs Unix epoch mismatch
```

**Example 2: Full systematic investigation**
```
User: "experiment with different prompt structures for better output"
→ FullCycle mode
→ 3+ hypotheses on the table
→ Controlled experiments, each with measurements
→ Analysis names the winner
→ Iterate until results converge
```

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Science","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.
