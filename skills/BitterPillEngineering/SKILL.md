---
name: BitterPillEngineering
version: 1.0.11
description: "Trims bloated AI instruction sets through the smarter-model test — would a more capable model still need this rule? Scores each rule with Five Questions (already-default? contradictory? duplicate? one-off patch? vague?) plus a procedure-vs-outcome screen, and verdicts CUT/RESOLVE/MERGE/EVALUATE/SHARPEN/MOVE/KEEP. Workflows: Audit (whole setup, token savings), QuickCheck (one file). Guideline: less scaffolding = better output. USE WHEN BPE, bitter pill, audit setup, over-prompting, trim instructions, dead weight, simplify setup, clean up CLAUDE.md. NOT FOR attacking logical flaws in ideas (use RedTeam)."
---

## Customization

**Before running anything, look for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/BitterPillEngineering/`

When that folder exists, read any PREFERENCES.md or config files inside and let them take precedence over the defaults below. When it is absent, continue with the built-in behavior.

# BitterPillEngineering

## Purpose

Puts an instruction setup on a diet. Each rule is held up to five checks — is it already default behavior, does it fight another rule, does it repeat one, was it a patch for a single bad run, is it too fuzzy to follow — plus a sixth screen for methodology bloat. Every rule then gets a verdict of CUT, RESOLVE, MERGE, EVALUATE, SHARPEN, MOVE, or KEEP, alongside a rough count of tokens recovered. Two entry points: Audit for the full setup, QuickCheck for one file.

## Why setups bloat

Rules accrete. A model misbehaves once, somebody appends a guard, and after months the files are full of lines that echo built-in behavior, disagree with each other, or memorialize an incident that never repeated. The damage is quiet: each spare rule dilutes attention, so the rules that genuinely steer output get less of it, and a fat setup underperforms a lean one. Telling structural rules from dead weight, line by line, is the whole job here.

## The guiding test

The operating guideline is **less scaffolding = better output**. Hold every rule against one question: *"Would a smarter model make this unnecessary?"* A yes marks scaffolding rather than architecture — a removal candidate. The checks and the verdict table below turn that instinct into a repeatable call.

## Pick a workflow

| Say this | Workflow |
|---|---|
| "audit setup", "full audit", "check all rules" | `Workflows/Audit.md` |
| "quick check", "check this file", "check these rules" | `Workflows/QuickCheck.md` |

## Walkthroughs

**Whole-setup pass**
```
User: "Run BPE on my setup"
→ Audit workflow
→ Reads every force-loaded file named in settings.json
→ Scores each rule with the Five Questions
→ Hands back a grouped report with estimated token savings
```

**One file only**
```
User: "Quick check this CLAUDE.md"
→ QuickCheck workflow
→ Reads just that file
→ Hands back a short keep/cut/sharpen call
```

**After a manual trim**
```
User: "I trimmed my rules, check if anything's still redundant"
→ Audit workflow
→ Measures the survivors against model defaults
→ Calls out whatever dead weight remains
```

## The Five Questions

Score each rule, instruction, or preference on all five:

1. **Already default?** Would the model do this unprompted?
2. **Collision?** Does it fight another rule in this file or a different one?
3. **Echo?** Is some other rule or file already saying this?
4. **Incident patch?** Was it written to fix one particular bad output instead of lifting output quality in general?
5. **Fuzzy?** Will the model read it a new way each run? (e.g., "be more natural", numbered personality sliders)

## Procedure-vs-outcome check (sixth screen, full member)

Past the five, screen each rule for **methodology bloat**: does it choreograph how to think or act ("first analyze X, then weigh Y, then decide Z") rather than describing the finished state (WHAT good looks like) plus the tools? A rule that scripts the HOW instead of naming the WHAT is scaffolding — mark it **CUT**.

Four keep-classes — the kinds of HOW that are legitimate and never cut: **safety-gate** (confirmation / destructive-op guard / approval), **verified-gotcha** (a recorded non-obvious failure), **tool-contract** (exact CLI/API/path recipe), **output-format-contract** (mandated deliverable shape). Deterministic tools (`*.ts`) sit outside this check. Put positively, the core test reads: a rule that survives "would a smarter model make this unnecessary?" is either a keep-class or real architecture. Full doctrine: `DEVOS/RUNTIME/RULES/Philosophy.md` § Ideal-State Prompting.

## Verdict labels

| Signal | Call |
|---|---|
| Echoes built-in behavior | **CUT** — the model does this unasked |
| Fights another rule | **RESOLVE** — keep one, drop the other |
| Repeats another rule | **MERGE** — say it once, in one place |
| Patch for one past miss | **EVALUATE** — still earning its keep, or already absorbed? |
| Fuzzy / unmeasurable | **SHARPEN** — attach concrete DO/DON'T samples, or drop it |
| Loaded always, useful rarely | **MOVE to on-demand** — serve through the CLAUDE.md routing table instead |
| Concrete, actionable, non-default | **KEEP** — this is what a working instruction looks like |

## Sturdy vs brittle

**Keep (sturdy under stronger models):** check harnesses, ISC, data pipelines, concrete DO/DON'T samples, tool preferences, routing rules.

**Drop (brittle under stronger models):** reasoning choreographers, format parsers, retry cascades, numeric personality sliders, abstract value statements, process narration nobody follows.

## Report shape

```
## BitterPillEngineering Audit

**Scope:** [what was audited]
**Files read:** [count]
**Rules evaluated:** [count]

### CUT (echoing defaults)
- [rule] — [reason]

### RESOLVE (collisions)
- [rule A] vs [rule B] — [which survives and why]

### MERGE (echoes)
- [locations] — [merge target]

### EVALUATE (incident patches)
- [rule] — [still needed? call]

### SHARPEN or CUT (fuzzy)
- [rule] — [how to sharpen, or why to drop]

### MOVE to on-demand
- [content] — [how often it truly matters]

### KEEP (earning weight)
- [rule] — [why it matters]

**Estimated savings:** [lines] lines, ~[tokens] tokens
```

## Watch-outs

- Built-in model behavior shifts between releases — something "obviously default" three months back may not be today. When unsure, run a probe instead of assuming.
- A rule that parrots defaults may exist because the model followed the default unreliably. Review the failure record before deleting.
- "Incident patch" rules occasionally suppress repeat failures. Confirm the failure mode is truly gone before removal.
- The `loadAtStartup` list in settings.json and `postCompactRestore.fullFiles` travel together — drop a file from one and inspect the other.
- **Mechanical pre-scan available:** `bun DEVOS/Tools/SkillDriftLint.ts --dir skills/ [--strict] [--top N]` (ported from @rpriven, public issue #1523). Advisory-only pattern scan — run it to surface candidates cheaply, then rule on each with the keep-classes and the questions above. Drift regrows after every trim; the linter is the standing watch, this skill is the judgment.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"BitterPillEngineering","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
