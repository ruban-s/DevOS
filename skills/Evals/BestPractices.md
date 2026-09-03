# Evals Best Practices

Short version: deterministic checks first, model judgment only for what code can't see, every comparison pre-committed before it runs.

## Judge construction

- **Reasons precede scores.** The verdict format forces explanation first, number second — skipping this measurably degrades discrimination.
- **Five-point scale.** 1–5 calibrates; 0–100 doesn't. Binary only for true pass/fail gates.
- **Never self-grade.** The judge runs on a different rung than the subject (`judge_level` ≠ `agent_level`; default subject medium, judge high).
- **Swap positions on comparisons.** Run A-first and B-first, average — presented-first bias is real.
- **Panels over oracles.** Several independent judgments beat one expensive one for contested calls.

## Suite construction

- **Open with a golden example.** One real, verified-good output anchors what "good" means before any criterion is written.
- **Mix assert kinds.** Deterministic asserts for the objective parts, model asserts for the rest — roughly 60/40 by weight, adjusted to what the suite actually probes.
- **Lock the threshold at creation.** 0.75 is the recommended default; whatever it is, it's fixed before the first run, not after the first disappointment.
- **Version the prompts under test.** Semantic versions, so comparisons name exact pairs.
- **Document the suite.** Its README states what it probes, why it matters, and how to run it.

## Running

- **Deterministic gate first.** Free checks run before billed ones — fail fast, spend late.
- **Enough cases to mean something.** Five to ten minimum per suite; more for comparisons that will drive deploy decisions.
- **Include hostile inputs.** Edge cases, ambiguous phrasings, the inputs that broke things last time.
- **Re-run on a cadence.** Regression suites earn their name by running repeatedly — especially after behaviour-defining file changes (see the config-change wiring in SKILL.md).
- **Report distributions, not just verdicts.** Means with standard errors, confidence intervals where a decision rides on them.

## Reading results

- **Open the transcripts.** The per-trial detail outweighs the headline pass rate — always read runs before acting on them.
- **Interrogate the failures.** Which assert failed, and what in the output tripped it? A failing brittle string check teaches something different than a failing rubric.
- **Compare against baseline.** A score means little without the previous score beside it.
- **Spot-check with human eyes.** Model judges err; high-stakes calls get human confirmation.
- **Re-weight by consequence.** Weights encode what matters — revisit them when the suite's failures stop matching your priorities.

## Rigor checklist

- Standard Error of the Mean reported alongside means
- 95% confidence intervals where a decision depends on the margin
- Significance testing before declaring a variant the winner
- Pass/fail rates stated against the locked threshold
