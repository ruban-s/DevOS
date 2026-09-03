# Evals as Science

An eval suite is the scientific method pointed at agent behavior — not as metaphor, but as the same loop with different nouns.

| Science move | Eval form |
|---|---|
| **Goal** | The suite's success criteria and locked pass threshold |
| **Observe** | Baseline measurement of the current prompt or model |
| **Hypothesize** | "Variant X beats baseline because…" — falsifiable, written down first |
| **Experiment** | Controlled runs: same cases, one variable changed |
| **Measure** | Scores with standard errors, not bare verdicts |
| **Analyze** | Variant comparison with a significance bar for declaring winners |
| **Iterate** | Refine and re-run, or graduate the passing cases to regression |

## Non-negotiables

**Falsifiability.** Every comparison states upfront what would disprove it: *"what result would show variant X is NOT better?"* No answer → no experiment yet.

**Pre-commitment.** Criteria and thresholds lock at suite creation, before any result exists. Moving goalposts after data arrives voids the run.

**Plurality.** Two variants invite confirmation bias toward the first alternative; three or more explore the space. Prefer A/B/C over A/B when the cost allows.

**Bias countermeasures.** Position swapping for pairwise judgments, a judge rung distinct from the subject, multi-judge panels for contested calls, significance required before a deploy decision.

## When to make the Science loop explicit

Most eval work runs the loop implicitly. Pull in the full Science skill when:

- Three or more iterations show no movement (paradigm check — see ComparePrompts' stall protocol)
- Results contradict each other and need structured untangling
- Stakes justify formal documentation of the experiment
- The suspicion forms that the suite probes the wrong thing entirely
