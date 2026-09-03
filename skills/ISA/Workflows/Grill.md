# Grill

A relentless, checkpointed discovery pass that interrogates a half-formed idea until its shape is clear, then hands off to Scaffold. Grill DISCOVERS structure that doesn't exist yet; Interview FILLS structure that does. Human-invoked and exploratory — never automatic.

## When to run

- Direct request: `Skill("ISA", "grill me on <topic>")` or `/grill-me <topic>`
- Before Scaffold, when the idea is too unformed to draft a strong ISA
- Refresh pass: "grill me again on <slug>, here's new findings"

NOT for filling thin sections of an existing ISA — that's Interview.

## Inputs

| Input | Required | Meaning |
|---|---|---|
| topic | yes | The idea, plan, or decision under interrogation |
| slug | no | WORK dir to use; derived from the topic when absent |
| max_questions | no | Default 12 |

## Procedure

### 1 — Announce

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Grill workflow in the ISA skill"}' \
  > /dev/null 2>&1 &
```

### 2 — Open the WORK dir

Resolve the canonical work dir — **`DEVOS/MEMORY/WORK/{slug}/`** (absolute; the same dir Scaffold writes the ISA to, so the handoff stays co-located; not project-relative, even when `/grill-me` fires from another repo's cwd). Create `grill.md` there with three sections: **Shape & Key Decisions**, **Q&A Log**, **Open Flags**. That file is the checkpoint target.

### 3 — Shape check (only when the category is ambiguous)

When it's unclear what kind of thing this is (skill vs hook vs CLI vs doc…), propose 2–3 candidate shapes up front and ask discriminating questions to prune to one before walking the tree. Obvious shape → straight to the walk.

### 4 — Walk the decision tree

Resolve dependencies in order — never a leaf before its parent. Per decision:

- One question per AskUserQuestion call, never batched. Lead with your recommended answer as the first option (marked "(Recommended)") beside the real alternatives, so the user confirms or overrides in one step; "Other" always available for redirection. Free text only when the answer space is genuinely open and won't bound into options.
- Never a bare open ask — always lead with where you'd land and why.
- Prefer the codebase over the user: Grep/Read first when the answer is discoverable; ask only what code can't answer.
- On low-confidence or high-stakes calls, add a one-line strongest objection to your own recommendation before the user answers.

### 5 — Checkpoint every turn

Write to `grill.md` immediately: append the Q&A pair to the log, promote settled decisions into Shape & Key Decisions, record "needs external input" items under Open Flags. Long sessions degrade; the file survives that.

### 6 — Pre-mortem, then draft claims

Before closing, run one failure-mode pass: "imagine this shipped and failed — what went wrong?" Convert each failure mode into a draft binary claim under Shape & Key Decisions. This pass is what makes the resulting ISA hard to vary.

### 7 — Stop

End when the shape is clear enough to scaffold, `max_questions` is hit, or two consecutive answers are low-signal ("I don't know" / "skip").

### 8 — Hand off

In order: (1) feed the shape to Scaffold — `Skill("ISA", "scaffold from prompt: <Shape & Key Decisions + draft claims from grill.md>")`, same WORK dir; (2) `TaskCreate` per Open Flag; (3) sync any related skills or guides the session touched, via CreateSkill — Grill's job, not Interview's.

## Output shape (grill.md)

```
# Grill: <topic>
## Shape & Key Decisions
- <settled decision> — <rationale>
- ISC: <binary criterion from pre-mortem>
## Q&A Log
### Q1: <question>
**Recommended:** <rec>  **Answer:** <user answer>
## Open Flags
- [ ] <unknown> — needs <who/what>
```

## Failure modes

- **User abandons mid-grill:** the partial file still holds value; leave an Open Flag marking where it paused.
- **Answers stay aspirational:** push for the concrete ("what would prove that?"); what won't concretize becomes an Open Flag, never a settled decision.
- **Topic already well-formed:** say so and route straight to Scaffold — never manufacture questions to spend `max_questions`.

## How the handoff feeds Scaffold

Scaffold takes the grill.md content as its prompt — there is no dedicated grill mode. Shape & Key Decisions feed goal preservation (the stated goal carries through verbatim) and the Vision / Out of Scope / Constraints / Principles derivation; the pre-mortem draft claims carry into the claims section (`## Claims` on new ISAs, `## Criteria` on legacy ones). Grill's value is front-loading discovery so Scaffold's prompt is already hard to vary.

---

_Lineage: Matt Pocock's `grilling` / `grill-me` skills — [github.com/mattpocock/skills](https://github.com/mattpocock/skills) (MIT, © 2026 Matt Pocock). Independent implementation: per-turn checkpoints land in `DEVOS/MEMORY/WORK/{slug}/grill.md`, and a pre-mortem→claim pass runs before the Scaffold handoff._
