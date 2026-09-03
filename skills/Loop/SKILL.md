---
name: Loop
version: 1.0.9
description: "Supervised multi-pass refinement — carry a target through repeated DevOS Loop cycles toward its ideal state, with review between rounds. USE WHEN loop, iterate, refine, multiple passes, keep improving, revisit, rework."
disable-model-invocation: true
---

# /loop — Iterative Improvement

## The Move

`/loop` drives the DevOS Loop in rounds: several complete cycles against a single target, each round picking up where the last one stopped. By default a person reads each result and steers the next round. The contrast with `/optimize` is the seam — `/optimize` is an autonomous mutation loop with nobody in it, while `/loop` runs full DevOS Loop cycles with human judgment threaded between them.

## Why Rounds Beat Re-runs

Plenty of targets won't converge in one pass — a skill, a prompt, a diagram, a piece of prose. A full cycle can lift each of them a level, but only if the next cycle inherits what the last one learned and which avenues already failed. Re-run cycles by hand and that inheritance snaps: dead ends get re-explored, rejected approaches resurface, and nothing can say whether the score actually moved. `/loop` carries ISC criteria and a dead-ends ledger across rounds so each pass starts from the last one's endpoint, never from zero.

## The Shape of a Round

A round is one complete DevOS Loop cycle (OBSERVE → LEARN). Round N's LEARN phase seeds round N+1's OBSERVE. The ISA records the round count and the cumulative gains, and a human approves or redirects between rounds — unless autoresearch mode is on.

## Invocation

```
/loop --target "path/to/target" --iterations 5
/loop --target "DEVOS/skills/Webdesign/Workflows/DirectDesign.md" --goal "make direct design more consistent"
/loop --resume       # Resume a previous loop
/loop --status       # Show iteration history
```

## What Each Round Carries

- ISC criteria that sharpen round over round
- The previous round's learnings shaping the next round's scaffold
- ISA tracking of round count and cumulative improvement
- Human approval or redirection between rounds

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `--target PATH` | yes | | What to improve (file, directory, skill) |
| `--goal TEXT` | | inferred | What "better" means for this target |
| `--iterations N` | | 3 | Maximum number of DevOS Loop cycles |
| `--resume` | | | Resume a previous loop |
| `--status` | | | Show iteration history |
| `--autoresearch` | | off | Opt-in autonomous mode — see below |

## Loop Integration

The ISA's `iteration` field tracks the cycle count. (`mode:` is retired — never write it.) Each cycle re-enters the DevOS Loop carrying accumulated context from prior iterations.

## Autoresearch Mode (opt-in)

`--autoresearch` flips /loop from supervised refinement into autonomous iteration, importing three patterns from pi-autoresearch (davebcn87, MIT):

1. **No human review between cycles.** Each round's LEARN feeds the next OBSERVE directly, and the loop runs until `--iterations` is reached, the target is met, or an explicit interrupt lands.
2. **Dead-ends ledger.** The ISA carries a `## Dead Ends` section; every failed round appends one line naming the rejected approach and the reason. Resumes read it first, so a rejected path stays rejected.
3. **MAD confidence on iteration score.** Wherever the target yields a measurable score, compute `|delta|/MAD(iteration_scores)` per cycle. Rounds below 1.0× (red) sit at the noise floor: log `marginal`, leave the baseline alone. See `DEVOS/RUNTIME/ALGORITHM/optimize-loop.md` → Confidence Gating.

Invocation:
```
/loop --target "path" --goal "X" --iterations 20 --autoresearch
```

Default /loop behavior is untouched — autoresearch exists only as an opt-in, built for overnight runs on targets where between-cycle human review costs more than it buys.

## Examples

```
/loop --target "DEVOS/skills/Research" --goal "improve output quality" --iterations 5
/loop --target "prompts/summarize.md" --goal "more concise, less filler"
```

## Gotchas

- **Loop runs multiple full DevOS Loop cycles.** Each one is a complete OBSERVE→LEARN pass; the time and token cost is real.
- **Set a clear exit condition.** Without one, a loop can run indefinitely.
- **Human review happens between cycles by default.** Don't skip it — that review is the feedback mechanism.
