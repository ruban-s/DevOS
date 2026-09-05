# TestSkill Workflow

Prove a skill earns its keep: run it against lifelike prompts and set the results beside a no-skill baseline.

Drawn from Anthropic's skill-creator practice: the only honest measure of a skill is side-by-side runs on genuine prompts, with and without it.

---

## 1. Frame the skill under test

Open the target's SKILL.md:

```
DEVOS/skills/[path]/SKILL.md
```

Record:
- Name and description
- Core workflows and their jobs
- Which behavior shifts to watch for

---

## 2. Draft the probes

Write 2–4 lifelike prompts — things a real operator would actually type that should summon this skill. Show them to the operator for a sanity read before spending runs.

Strong probes are:
- **Lifelike** — genuine operator phrasing, not abstract exercises
- **Meaty** — involved enough that guidance could matter (one-liners rarely summon skills)
- **Varied** — spanning the skill's facets
- **Concrete** — real paths, names, and context as actual requests carry

Weak: `"Format this data"`
Strong: `"I have a CSV in ~/Downloads/q4-sales.csv with revenue in column C and costs in column D — add a profit margin percentage column and highlight any margins below 15%"`

---

## 3. Race with-skill against baseline

**Workbench:** `MEMORY/WORK/skill-test-[skillname]/iteration-[N]/`

Per probe, launch TWO Agent subagents **in one turn** so they run side by side:

### Guided agent (with skill)

```
You are testing a skill. Read the following skill file FIRST, then use its instructions to accomplish the task.

Skill file: [absolute path to SKILL.md]

Task: [test prompt]

Save your final output to: [workspace]/test-[N]/with-skill/output.md

After completing the task, also save a brief transcript of your approach to: [workspace]/test-[N]/with-skill/transcript.md
Include: what steps you took, what tools you used, any decisions you made.
```

### Bare agent (no skill)

```
Accomplish this task using your general capabilities. Do NOT read any skill files.

Task: [test prompt]

Save your final output to: [workspace]/test-[N]/baseline/output.md

After completing the task, also save a brief transcript of your approach to: [workspace]/test-[N]/baseline/transcript.md
Include: what steps you took, what tools you used, any decisions you made.
```

Set `run_in_background: true` on all agents. Fire every with-skill + baseline pair together.

---

## 4. Judge the delta

Per probe once agents land:

1. **Read both artifacts** (guided and bare)
2. **Read both transcripts** for the path each took
3. **Call the gap** — did the skill move the needle?

Lay each comparison before the operator:

```
### Test [N]: "[prompt summary]"

**With Skill:**
- Approach: [how it handled the task]
- Quality: [assessment]

**Baseline (No Skill):**
- Approach: [how it handled the task]
- Quality: [assessment]

**Verdict:** [Skill helped significantly / Skill helped marginally / No meaningful difference / Baseline was better]
**Why:** [specific reasons]
```

---

## 5. Hear the operator

Ask:
1. Which outputs read better, and why?
2. Where did the skill misfire?
3. What should change?

Silence on a test counts as approval.

---

## 6. Loop or land

From the answers:

- **Needs work:** carry the notes into `Workflows/ImproveSkill.md`, then re-race into a fresh `iteration-[N+1]/` folder. Compare generations.
- **Reads well:** report out and propose `Workflows/OptimizeDescription.md` so the skill also fires reliably.
- **No lift over baseline:** the skill may be surplus for this use, or needs rethinking from the root. Talk it through with the operator.

---

**Prose doctrine:** when test findings drive rewrites, apply the full guidance in `Workflows/ImproveSkill.md` Step 3 (reason out loud, stay lean, generalize, bundle repeat work).
