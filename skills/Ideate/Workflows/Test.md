# Test — TEST Phase Only (Multi-Judge Fitness Evaluation)

**Reach for this when** candidates exist and need scores on the four standard dimensions (Feasibility, Novelty, Impact, Elegance). Scoring only — no breeding, no selection, no iteration.

**Phase invoked:** TEST only. Optionally invokes RedTeam for an adversarial pass.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Test workflow in the Ideate skill to score candidate ideas"}' \
  > /dev/null 2>&1 &
```

## Inputs

- **Candidates** (required): list of idea texts to score
- **Problem statement** (required): defines the fitness function
- **Judge count** (optional, default 3): number of judge agents per candidate
- **RedTeam pass** (optional, default true): adversarial attack on candidates before scoring
- **External validation hooks** (optional): see `../SKILL.md` § External Validation Hooks

## Steps

1. **Adversarial pass first (optional):** if `redteam_pass` is true, invoke `Skill("RedTeam")` to attack each candidate. Fatal flaws found are attached to the candidate metadata before scoring (judges read them).

2. **Launch `judge_count` Judge agents concurrently** via Task tool. Each judge scores ALL candidates independently.

3. **Each judge rates every candidate on 4 dimensions (0-100 each):**

   | Dimension | What it measures | 0 | 100 |
   |-----------|------------------|---|-----|
   | **Feasibility** | Can this actually be built/done? | Violates physics | Proven tech, clear path |
   | **Novelty** | Is this genuinely new? | Already exists as described | Never been tried |
   | **Impact** | If it works, how much does it matter? | Marginal | Paradigm shift |
   | **Elegance** | Is the solution beautiful/simple? | Rube Goldberg | Obvious in retrospect |

   Per dimension, the judge supplies:
   - Score (0-100)
   - 1-sentence supporting argument
   - 1-sentence counterargument

4. **Aggregate across judges:**
   - Final score per dimension = average across judges
   - Composite score = average of 4 dimension scores
   - Confidence = inverse of judge variance (high variance = low confidence)

5. **External validation (optional):** with hooks enabled, run each candidate through them. A hook returns `{ modifier: -20..+20, evidence: string }`. Adjusted composite = base composite + sum of modifiers (capped to ±20).

## Output

```json
[
  {
    "id": "candidate-001",
    "text": "Apply mycelial chemical-gradient signaling to API rate limiting",
    "scores": {
      "feasibility": 68,
      "novelty": 84,
      "impact": 72,
      "elegance": 79,
      "composite": 75.75,
      "confidence": 0.81,
      "judge_variance": 9.2
    },
    "arguments": {
      "supporting": "Mycelial networks solve consensus without coordinator using gradients — directly analogous to gossip protocols",
      "counter": "Chemical gradient propagation is O(n) — may not scale beyond biological distances"
    },
    "redteam_findings": ["Latency spikes under partition", "No clear primary for write path"],
    "external_validation": {
      "market_search": { "modifier": -5, "evidence": "Partial prior art in gossip protocols" }
    },
    "adjusted_composite": 70.75
  }
]
```

## Distinguishing Notes

- **Panels beat solo judges.** One judge's blind spots become the system's blind spots. Three-plus judges with averaging cancel individual bias.
- **Variance is data, not noise.** Wide inter-judge spread marks a genuinely polarizing idea — legitimate disagreement. Tight spread marks consensus. Read both.
- **Leave the hooks off for speed.** External validation adds real-world grounding at latency cost. Internal scoring alone suffices for brainstorming rounds.

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Ideate","workflow":"Test","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
