# Dream — DREAM Phase Only (Free-Association Recombination)

**Reach for this when** the goal is raw unconstrained recombination of input material with ZERO awareness of the problem. Connecting the output back to the problem belongs to a downstream consumer (you, or a follow-up Mate/Test run).

**Phase invoked:** DREAM only (noise=0.9). No CONSUME (the caller brings inputs), no scoring, no iteration.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Dream workflow in the Ideate skill to free-associate inputs"}' \
  > /dev/null 2>&1 &
```

## Inputs

- **Input pool** (required): a list of atomic ideas, facts, patterns. 10-30 items recommended.
- **Agent count** (optional, default 3): how many Dreamer agents run in parallel
- **Subset ratio** (optional, default 0.33): each agent gets `pool_size × ratio` random items

## Steps

1. **Deal the subsets structurally:** for each Dreamer agent, draw `floor(pool_size × subset_ratio)` items via Fisher-Yates shuffle under a cryptographic seed (NOT LLM-selected). Every agent sees a different slice.

2. **Launch `agent_count` Dreamer agents concurrently** via Task tool. Each gets:
   - Its random subset
   - The hard constraint: NO problem-awareness. Free-associate on the subset — surface connections nobody has made.
   - Invoke `Skill("BeCreative")` MaximumCreativity workflow inside each agent

3. **Each agent returns 3-5 dream fragments** as markdown:
   - Fragment text (1-3 sentences each)
   - Source-input IDs that contributed (provenance)
   - No fitness evaluation — dreams are not judged here

## Output

```markdown
## Dream Fragments

### Agent 1 — The Dreamer (subset: ideas 3, 7, 12, 19, 24)

1. [Fragment text]
   Provenance: ideas 7+12

2. [Fragment text]
   Provenance: ideas 3+24

...

### Agent 2 — The Dreamer (subset: ideas 1, 5, 11, 18, 22)

...
```

## Distinguishing Notes

- **DREAM never sees the problem.** For gentle problem-tethering, use `Daydream.md` instead (noise=0.5, problem held loosely).
- **The shuffled deal IS the technique.** Two agents reading identical input converge; two agents reading genuinely different random subsets diverge. Randomness lives in WHICH ideas each sees, not in LLM temperature.
- **Fragments are feedstock, not answers.** Mate, Test, or a human reviewer decides what applies.

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Ideate","workflow":"Dream","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
