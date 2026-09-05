# Mate — MATE Phase Only (Genetic Recombination)

**Reach for this when** a pool of ideas exists and the job is breeding offspring from it via crossover + mutation. No fresh research, no scoring — recombination only.

**Phase invoked:** MATE only.

## Inputs

- **Idea pool** (required): list of existing ideas to breed (typically 8-30 items)
- **Phase tags** (optional): mark each input idea with its origin phase (e.g. "Dream", "Steal", "Contemplate") to enable cross-phase pairing enforcement
- **Offspring count** (optional, default 10): minimum number of offspring to produce
- **Cross-phase ratio** (optional, default 0.2): proportion of pairings forced cross-phase

## Steps

1. **Pair via Fisher-Yates shuffle:**
   - Bucket inputs by phase tag (if provided)
   - Reserve `cross_phase_ratio × offspring_count` slots — forced cross-phase pairs (one input from each of two different phase buckets, randomized within bucket)
   - Remaining slots: shuffle the full pool, pair adjacent items
   - Critical: do NOT ask the LLM to pick "interesting pairs" — structural randomness defeats LLM bias toward training-distribution-favored pairings

2. **Launch Matchmaker agents concurrently** via Task tool. Each receives a subset of the pairs. For each pair, the agent performs THREE operations:

   - **Crossover:** "Take element A from idea 1, element B from idea 2. Combine into a new idea."
   - **Mutation:** Roll an 8-sided die. Apply the corresponding mutation operation:
     1. Flip one assumption
     2. Invert the constraint
     3. Change the scale (10× bigger or smaller)
     4. Change the time horizon
     5. Merge with a random element from another idea in the pool
     6. Apply a constraint from a random domain
     7. Remove the most complex component
     8. Add an adversarial requirement
   - **Cloning with drift:** "Copy one parent idea with small random modifications."

3. **Demand BAD ideas alongside good ones** — no selection happens here, so pre-filtering is forbidden. Diversity now matters more than quality.

4. **Collect offspring with full provenance:**
   - Parent IDs
   - Operation type (crossover / mutation / clone)
   - Mutation die-roll (if mutation was applied)
   - Phase-bucket origins of parents

## Output

```json
[
  {
    "id": "offspring-001",
    "text": "Apply mycelial chemical-gradient signaling to API rate limiting",
    "provenance": {
      "parents": ["idea-007", "idea-019"],
      "operation": "crossover",
      "mutation_die_roll": null,
      "parent_phases": ["Steal", "Contemplate"],
      "is_cross_phase": true
    }
  },
  {
    "id": "offspring-002",
    "text": "...",
    "provenance": { "parents": ["idea-003"], "operation": "clone-with-drift", ... }
  }
]
```

## Distinguishing Notes

- **Random pairing beats curated pairing.** LLM-chosen "interesting pairs" regress to training-distribution patterns. Shuffled pairs produce the surprises.
- **Cross-phase enforcement keeps the gene pool wide.** Without the 20% floor, offspring converge on one phase's flavor. The floor is empirical.
- **Weak offspring are welcome.** Selection runs downstream. Filtering at MATE strangles diversity early.

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Ideate","workflow":"Mate","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
