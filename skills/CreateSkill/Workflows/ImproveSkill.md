# ImproveSkill Workflow

Lift an existing skill on the back of test evidence, operator notes, or quality worries. This is the revision half of the test–iterate loop.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the ImproveSkill workflow in the CreateSkill skill to improve skill quality"}' \
  > /dev/null 2>&1 &
```

Running the **ImproveSkill** workflow in the **CreateSkill** skill to improve skill quality...

---

## 1. Pull the evidence together

Open everything available:

1. **The skill itself:** target SKILL.md plus the workflow(s) the notes touch
2. **Test artifacts** (TestSkill runs): outputs under `MEMORY/WORK/skill-test-[name]/`
3. **Operator notes:** the exact complaints or asks
4. **Transcripts** (when present): how the agent actually spent the skill — where it stalled or strayed

---

## 2. Name the disease, not the symptom

Sort each note:

| Note | Likely cause | Repair |
|----------|-----------|----------|
| "Output was wrong" | Foggy instructions | Rewrite for clarity |
| "Took too long" | Fruitless steps | Cut or compress steps |
| "Missed edge case" | Coverage hole | Add the handling |
| "Too rigid" | Over-pinned instructions | Explain the why instead |
| "Agents all wrote the same helper script" | Unbundled tool | Ship it in Tools/ |
| "Didn't trigger" | Description too tight | Run OptimizeDescription |

---

## 3. Rewrite by the prose doctrine

Hold these while revising:

### Reasons over orders

Current models reason well. Given the why, they overshoot rote compliance. Trade rigid edicts for rationale the model can apply.

Weak:
```
ALWAYS use exactly 3 bullet points. NEVER exceed 50 words per bullet.
MUST include a header. MUST NOT use passive voice.
```

Strong:
```
Use bullet points to make key findings scannable — readers are busy executives
who need to absorb the main message in under 30 seconds. Keep bullets concise
(aim for one clear idea each) and lead with the most important finding.
```

Orders yield compliant, flat output. Reasons yield output that serves the reader and bends sensibly across contents.

### Prune dead lines

Cut instructions that don't pay rent. The test transcripts show where: any step the agent hurries past without output gain goes.

Bloat tells:
- Steps the agent skips or rushes
- Lines producing identical results followed or ignored
- Just-in-case defensiveness that never fires

### Fix patterns, not incidents

A handful of probes generalize to many prompts. Resist narrow patches for single failures; address the shape beneath.

Weak: `"When the input contains a CSV with columns named 'Revenue' and 'Cost', always calculate margin as (Revenue-Cost)/Revenue"`
Strong: `"When performing financial calculations, identify the relevant columns by semantic meaning (revenue, cost, margin) rather than exact names, since naming conventions vary"`

### Ship the repeated work

When every test agent hand-builds the same helper or walks the same multi-step path, that helper belongs in Tools/. Write it once; stop every future run reinventing it.

---

## 4. Apply the edits

1. **Revise SKILL.md** — instructions, description, routing as the diagnosis demands
2. **Revise workflows** — rework the procedural prose
3. **Bundle Tools/** — when repeat work surfaced, ship the script
4. **Re-check shape** — mentally walk ValidateSkill: TitleCase intact, tree flat, frontmatter valid, routing rows resolving

---

## 5. Prove it and point onward

After editing:

- **Inside a TestSkill loop:** return to TestSkill Step 3 and re-race with the improved skill. Fresh `iteration-[N+1]/` folder.
- **Standalone pass:** propose a TestSkill run to confirm the lift is real.
- **Description touched:** propose OptimizeDescription to re-check firing accuracy.

---

## 4a. Bank the lesson in Gotchas

**Each failure or improvement earns a `## Gotchas` line.** That block is the densest part of any skill — it banks institutional memory of what breaks.

Missing the block? Add it after routing.

Record:
- The exact failure behind this pass
- API quirks surfaced in testing
- Mistakes the model repeats with this skill
- Edges that fail quietly

---

## 4b. BPE sweep

While revising, hold each instruction to the bitter question:

**"Would a smarter model make this instruction unnecessary?"**

- YES → it props up a model limit. Weigh removal.
- NO → it teaches what the model can't derive. Keep it.

Steer improvements toward banked failure knowledge (gotchas), tool wrappers (scripts), and run-to-run sameness — not toward narrating how to think.

---

## Reflexes to suppress

- **Louder MUSTs** — a miss rarely yields to volume. Reframe with reasoning.
- **Probe-fitting** — repairs that ace the test prompts and snap on fresh inputs.
- **Just-in-case padding** — lines for edges that never arrive in practice.
- **Reshuffling for substance** — weak instructions don't heal by re-filing.
- **Stating defaults** — skip what the model knows. Spend words where its defaults break.
- **Limit-propping** — scaffolds that offset model weakness rot into dead weight as models sharpen.
