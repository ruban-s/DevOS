# Explore Workflow — Iterative Depth

## Purpose

Make N structured passes over one problem, each through a different lens, and bank richer ISC criteria than any single pass could yield.

## Invocation

This workflow fires:

1. **Directly** by the user: "use iterative depth on this problem"
2. **By the Algorithm** during OBSERVE phase when the Capability Audit selects IterativeDepth
3. **By other skills** that need deeper requirement extraction

## Inputs

- **Problem/Request:** The original user request or problem statement
- **Context:** Any available context (conversation history, codebase state, prior work)
- **Lenses:** drawn from `TheLenses.md` — pick the ones the problem calls for

## Execution

Open `TheLenses.md` and draft the lenses that fit. Walk the problem through each in turn, carrying the criteria bank forward so later passes compound on earlier ones. Demand genuinely new criteria from every pass; retire the lens list the moment a pass restates established findings. Passes may run inline or as parallel background agents.

## Synthesize

Once the passes complete:

1. **Deduplicate:** strike criteria that say the same thing across lenses.
2. **Merge refinements:** where several lenses sharpened one criterion, keep the sharpest version.
3. **Prioritize:** criteria corroborated by multiple lenses outrank loners.
4. **Format:** every criterion in ISC form — 8-12 words, state not action, binary testable.

Hand the enriched set to whoever called: feed TaskCreate calls directly when running inside Algorithm OBSERVE, or present the set to the user when running standalone.

## Output Format

```
🔍 ITERATIVE DEPTH COMPLETE ({N} lenses applied)

📊 Coverage:
- Lenses used: {list of lens names}
- New criteria discovered: {count}
- Existing criteria refined: {count}
- Anti-criteria discovered: {count}

📋 NEW ISC CRITERIA:
[Use TaskCreate for each, prefixed "ISC-"]

📋 REFINED ISC CRITERIA:
[Use TaskUpdate for each, with evidence of what changed]

📋 NEW ANTI-CRITERIA:
[Use TaskCreate for each, prefixed "ISC-A"]

💡 Key Insight: [The most surprising finding across all lenses — the thing single-pass analysis would have missed]
```

## Integration with Algorithm OBSERVE Phase

When the Capability Audit selects IterativeDepth, it runs after Reverse Engineering and before ISC CREATION, so ISC criteria are informed by multi-angle exploration before they're written rather than corrected after the fact.
