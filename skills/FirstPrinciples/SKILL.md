---
name: FirstPrinciples
version: 1.1.15
description: "Bedrock-up reasoning in the Musk tradition: reduce a problem to its irreducible truths, sort every element into hard constraint, soft constraint, or assumption, then rebuild the best solution from the bedrock alone. USE WHEN first principles, fundamental truths, challenge assumptions, real constraint, rebuild from scratch, start over, physics first, question everything, reasoning by analogy. NOT FOR structural feedback loops (use SystemsThinking)."
---

## Customization

**Before executing, check for user customizations at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/FirstPrinciples/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# FirstPrinciples

## The Move

Break the problem down until the pieces can't break further, discard whatever turns out to be inherited habit rather than real limit, and design from what remains. Three movements carry the work: **DECONSTRUCT** — separate the thing into its actual constituents and true costs; **CHALLENGE** — sort every element into hard constraint, soft constraint, or untested assumption, with physics alone genuinely immovable; **RECONSTRUCT** — derive the solution from that bedrock, disregarding how it's currently done. The deliverable set is a parts breakdown, a classified constraint table, and a rebuilt solution.

## The Trap of Copied Answers

Untreated, reasoning defaults to analogy: find something that looks similar, borrow it, adjust at the margins. Borrowed solutions smuggle their predecessors' assumptions along — policy and convention arrive dressed as laws of nature, and the effort goes to polishing the suitcase instead of asking whether wheels exist. Bedrock reasoning redraws the line between what is fixed and what was merely inherited, then builds exclusively on the fixed part.

- **Analogy** (the default, frequently wrong): clones prior solutions with cosmetic variation.
- **Bedrock** (this skill): asks what the thing is actually made of and rebuilds from the undecomposable facts.

Run it directly, or accept the call when sibling skills bring it in because inherited assumptions may be shrinking the solution space — Architects pressing on "constraint or convention?", RedTeam and pentesters testing assumed boundaries, engineers looking for the exit from a local maximum.

## Workflow Routing

Route to the appropriate workflow based on the request.

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow in the **FirstPrinciples** skill to ACTION...
```

- Break problem into fundamental parts → `Workflows/Deconstruct.md`
- Challenge assumptions systematically → `Workflows/Challenge.md`
- Rebuild solution from fundamentals → `Workflows/Reconstruct.md`

## Sorting Constraints

Every element in the analysis lands in exactly one bucket:

| Type | Definition | Example | Can Change? |
|------|------------|---------|-------------|
| **Hard** | Physics/reality | "Data can't travel faster than light" | No |
| **Soft** | Policy/choice | "We always use REST APIs" | Yes |
| **Assumption** | Unvalidated belief | "Users won't accept that UX" | Maybe false |

**Rule**: only the hard bucket is immovable in fact. Everything else is negotiable or possibly untrue — and deserves the challenge.

## How Sibling Skills Call In

Other skills invoke FirstPrinciples like this:

```markdown
## Before Analysis
→ Use FirstPrinciples/Challenge on all stated constraints
→ Classify each as hard/soft/assumption

## When Stuck
→ Use FirstPrinciples/Deconstruct to break down the problem
→ Use FirstPrinciples/Reconstruct to rebuild from fundamentals

## For Adversarial Analysis
→ RedTeam uses FirstPrinciples/Challenge to attack assumptions
→ Pentester uses FirstPrinciples/Deconstruct on security model
```

## A Run in Miniature

**Problem**: "Cloud hosting costs $10,000/month — that's just what it costs."

- **Deconstruct**: What actually sits inside that number? (compute, storage, bandwidth, managed services)
- **Challenge**: Is managed Kubernetes genuinely required? Is that region mandatory? $10K is a market quote, not a physical constant.
- **Reconstruct**: Real compute need = $2,000. The remaining $8,000 is convenience bought month after month.

## Output Format

When using FirstPrinciples, output should include:

```markdown
## First Principles Analysis: [Topic]

### Deconstruction
- **Constituent Parts**: [List fundamental elements]
- **Actual Values**: [Real costs/metrics, not market prices]

### Constraint Classification
| Constraint | Type | Evidence | Challenge |
|------------|------|----------|-----------|
| [X] | Hard/Soft/Assumption | [Why] | [What if removed?] |

### Reconstruction
- **Fundamental Truths**: [Only the hard constraints]
- **Optimal Solution**: [Built from fundamentals]
- **Form vs Function**: [Are we optimizing the right thing?]

### Key Insight
[One sentence: what assumption was limiting us?]
```

## Rules That Carry Weight

- **Quoted prices and industry best practices are not bedrock.** "Batteries cost $600/kWh" and "hosting runs $10K/mo" are convention posing as physics — decompose to material and compute cost before believing either.
- **Optimize the function, not the form** — the outcome being pursued, not the traditional way of pursuing it (invent the wheel; skip the suitcase polish).
- **Rebuild rather than patch.** Once inherited assumptions fail, start over from the hard constraints — and expect the useful answer to immigrate from an unrelated field now and then.

---

**Attribution**: Framework derived from Elon Musk's first principles methodology as documented by James Clear, Mayo Oshin, and public interviews.

## Gotchas

- **Decompose to AXIOMS — fundamental truths, not merely simpler components.** The value is in finding the irreducible elements.
- **Challenge INHERITED assumptions specifically.** What does everyone assume that might be wrong?
- **This is analysis/reasoning, not implementation.** "Analyze" = FirstPrinciples. "Fix" = do the work directly.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"FirstPrinciples","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.
