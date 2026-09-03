# OptimizeDescription Workflow

Tune a skill's YAML description so it fires when wanted and stays quiet otherwise.

The `description:` line in SKILL.md frontmatter is the main firing control. A superb skill that never loads is dead weight. This pass measures and lifts firing accuracy methodically.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the OptimizeDescription workflow in the CreateSkill skill to optimize skill triggering"}' \
  > /dev/null 2>&1 &
```

Running the **OptimizeDescription** workflow in the **CreateSkill** skill to optimize skill triggering...

---

## 1. Read the live skill

Open the target SKILL.md and note:
- The current `description:` line
- What the skill genuinely does
- Which workflows it fronts
- Which neighboring skills might contest the same calls

---

## 2. Build the probe set

Write 20 eval probes — 10 should-fire, 10 should-not-fire.

### Should-fire probes (10)

Vary the phrasing of one intent:
- Formal beside casual
- Operators needing the skill without naming it
- Odd-corner uses the skill covers
- Contested calls this skill should win

### Should-not-fire probes (10)

Weight **near-misses** heaviest — prompts sharing words or themes that truly belong elsewhere:
- Adjacent fields with overlapping vocabulary
- Fuzzy phrasings where naive keyword matching would fire wrongly
- Tasks brushing the skill's field but better served by another tool

**Skip gimmes** — "write a fibonacci function" as a negative for a PDF skill proves nothing.

### Probe realism

Every probe must read like a typed operator message:
- Paths, personal context, concrete details
- Mixed lengths and registers
- The odd typo or spoken aside
- Specific, never abstract

Weak: `"Format data"`, `"Create a chart"`
Strong: `"ok so I have this quarterly report from finance (its the xlsx in my downloads, Q4_revenue_final.xlsx) and my manager wants a comparison chart showing this quarter vs last quarter with the variance highlighted"`

Persist as JSON:
```json
[
  {"query": "realistic user prompt here", "should_trigger": true},
  {"query": "near-miss prompt here", "should_trigger": false}
]
```

---

## 3. Vet the probes with the operator

Show the set and ask them to:
1. Strike anything lifeless
2. Add edges they've hit
3. Flip any should/shouldn't labels they dispute

This gate matters — weak probes breed weak descriptions.

---

## 4. Score the current description

First gather every skill's name + description:

```bash
rg '^(name|description):' DEVOS/skills/*/SKILL.md DEVOS/skills/*/*/SKILL.md --no-filename 2>/dev/null | head -200
```

Then launch **one** Agent subagent judging ALL probes in a batch (one batched call beats 20+ spawns):

```
You have access to the following skills (name and description only):

[Paste the collected name/description pairs]

For each of the following user messages, decide if you would invoke a skill.
Reply with ONLY a JSON array — one entry per query:

[
  {"query": "...", "verdict": "TRIGGER: SkillName"},
  {"query": "...", "verdict": "NO_TRIGGER"}
]

Do not explain. Just the verdicts.

Queries:
1. [query 1]
2. [query 2]
...
```

Fire this batch **twice** (two parallel subagent calls) for stability — compare runs for agreement.

**Scoring:** should-fire probes count when the right skill fires; should-not-fire probes count on NO_TRIGGER (or a rival skill firing). Accuracy = correct calls / total calls. Mark probes where the two runs split (unstable firing).

---

## 5. Read the misses

Sort failures:

- **False negatives** (silent when wanted) — description lacks the words or ideas
- **False positives** (loud when unwanted) — description too wide or borrowing a foreign field's words
- **Territory fights** — description poaching a neighbor's ground

---

## 6. Rewrite the line

From the miss pattern:
- Gaps: fold the missing intent phrases or field concepts in
- Overreach: narrow with distinguishing detail
- Keep `USE WHEN` broad yet exact
- Hold under 1024 characters (hard ceiling from SkillSystem.md)

**Line craft:**
- Slightly "pushy" outperforms shy — silence costs more than noise
- State the job AND the concrete moments to call it
- Differentiate from rivals by pinning YOUR field precisely

---

## 7. Re-score and diff

Re-run the same probe set on the new line (Step 4 again).

Report the before/after:
```
### Description Optimization Results

**Before:** [old accuracy]%
  - False negatives: [N] ([which queries])
  - False positives: [N] ([which queries])

**After:** [new accuracy]%
  - False negatives: [N] ([which queries])
  - False positives: [N] ([which queries])

**Improvement:** [delta]%
```

---

## 8. Ship or loop

- **Better yet short:** loop Steps 5–7 (cap 3 rounds — past that lies overfitting)
- **Solid (>85%):** write the new line into the skill's SKILL.md
- **Regressed:** restore the prior line, try another tack

Let the operator eyeball the final line before writing it.

---

## Why firing behaves this way

Skills reach the model as name + description. The model consults that pair to decide. The bias to know: models **under-call** — they skip skills that would help. So descriptions lean slightly pushy, naming concrete moments to call even when the operator wouldn't name the skill.

Thin one-shot asks may skip a skill despite a perfect line, because the model answers directly. Keep probes meaty enough that guidance would genuinely pay.
