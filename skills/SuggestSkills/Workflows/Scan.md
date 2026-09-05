# Scan — surface build-worthy gaps from history plus friction

Advisory only. Nominates; never constructs (construction belongs to CreateSkill once you approve).

## Gate Zero — is there enough to judge?

The bundle is the context. When the tool says the ratings store is absent, the friction channel is dark for this pass — state that in the report instead of dressing a topic-only read as whole. When the caller scoped a domain ("anything missing around deploys?"), group inside that scope and say so.

## Pass One — collect through the tool

```bash
bun DEVOS/skills/SuggestSkills/Tools/CollectSignals.ts --days 45 > /tmp/skill-scan-corpus.json
```

### What the caller meant, as flags

| Caller said | Flag | Meaning |
|-----------|------|---------|
| (default), "recently", "lately" | `--days 45` | trailing 45-day slice |
| "this quarter", "last few months" | `--days 90` | broader slice; expect a far longer session roll |
| "all time", "everything" | `--days 3650` | whole history (capped at 3650) |
| "only the really bad ones" | `--max-rating 2` | tighten the friction bar (default 4) |
| "scan another install / another tree" | `--root <dir>` | re-root every store under a different tree |
| a store sits off the beaten path | `--ratings <file>` `--work <dir>` `--skills <dir>` `--loops <dir>` | pin one store; a bad explicit path errors loudly, never quiets to default |

Resolution order per store: flag, then env (`SKILLSCAN_MEMORY_ROOT`, `SKILLSCAN_RATINGS_FILE`, `SKILLSCAN_WORK_DIR`, `SKILLSCAN_SKILLS_DIR`, `SKILLSCAN_LOOPS_DIR`), then the first conventional default under `--root` (`DEVOS/MEMORY/...`, then bare `MEMORY/...`). Loop catalogs stay opt-in: no default exists, so pass `--loops` (or env) when this install tracks one.

The bundle shape is `{ window, sessions[], frustrations[], registries[], warnings[], missing[], sources }`. Open `warnings` and `missing` before anything else. Never re-collect manually; the tool output is the shared evidence so repeated judgments compare like with like.

## Pass Two — gather into ache-themes

Fold `sessions` plus `frustrations` into repeats. Every theme keeps two tallies: how often it returned, and how much sting it drew (low scores, "broke again" markers). Sting outranks frequency.

## Pass Three — sort each theme

- **BEHAVIOR-FEEDBACK** — wordiness, brief misreads, nudge cadence. Steering matter, not skill matter; send to memory or preferences and drop from the slate.
- **COVERED** — a live skill, loop, or workflow genuinely teaches the *craft*. Prove it by quoting the covering body's guidance against the precise failure shape — a name overlap without that mapping is not coverage.
- **GAP** — repeats (severity-weighted; one sharp recurring ache qualifies even under ~3) with no true home, INCLUDING orphan crafts hiding beneath topics a builder or tester nominally owns.

## Pass Four — judge twice, keep everything either flags

Run two workers over the same bundle to classify the themes independently. Publish every theme either worker calls GAP, stamped `both` (firm) or `one` (needs a look). Requiring unanimity would filter out exactly the quiet discipline gaps this scan hunts.

## Pass Five — slate, never scaffold

Return an ordered nomination roll. Per nominee: working name, one-line sketch, and receipts (repeat count, sting count, the exact recurring break it would stop). Scrub secrets, project names, and private paths from anything persisted for review. Accepted nominees travel to `CreateSkill` under human approval in a separate step. This pass writes no skill files.

## Return Shape

```
## Skill-gap scan (last N days, M sessions; friction store: present/absent)
### Gaps worth building
- <Name> [confidence: both|one] — <sketch>. Evidence: N sessions, K friction hits, recurring break = "<...>". → CreateSkill?
### Covered (checked against bodies, no action)
- <theme> → <skill/loop/workflow>
### Behavior-feedback (send to memory, not a skill)
- <theme>
### Recommendation
<1-2 sentences; "nothing new" stands ONLY when friction reads clean too>
```
