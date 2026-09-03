---
name: IterativeDepth
version: 1.1.16
description: "Multi-angle structured exploration that makes 2-8 sequential passes over one problem through different scientific lenses, exposing hidden requirements and edge cases no single angle catches; every pass banks new ISC criteria. USE WHEN iterative depth, explore deeper, multi-angle analysis, surface hidden requirements, blind spot check, what am I missing. NOT FOR scope/zoom analysis (use ApertureOscillation)."
---

## Customization

**Before executing, check for user customizations at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/IterativeDepth/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

# IterativeDepth

## The Move

Don't stare at the problem — walk around it. This skill examines one question through a series of structurally distinct lenses (literal, stakeholder, failure, temporal, and others), and each lens deposits what it alone reveals as ISC criteria. A single angle, however careful, has a fixed blind spot; the next angle over stands somewhere else. Twenty established techniques across cognitive science, AI/ML, requirements engineering, and design thinking back the pattern — `ScientificFoundation.md` has the survey.

## What a Run Yields

- **A deduplicated ISC set** — criteria that are binary-testable, 8–12 words, and phrased as states rather than actions, with no two saying the same thing.
- **Refinements** to existing criteria, each noting what changed and what prompted the change.
- **Anti-criteria** — the failure modes that must not come to pass.
- **At least one cross-angle surprise** — a requirement that only exists because two lenses collided. A run that surfaces nothing beyond single-pass reach has earned nothing.

Angles stop earning their keep the moment a fresh lens starts echoing its predecessors. Distinct viewpoints pay; head count does not.

## Picking Lenses

`TheLenses.md` catalogs the eight exploration angles. It is a menu, not a prescribed sequence — take the lenses the problem calls for, in whatever order, as many as justify themselves. A security question pulls on the failure and adversary angles; a UX question pulls on the experiential one. Let the problem choose.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| Explore | "iterative depth", "explore deeper", "multi-angle" | `Workflows/Explore.md` |

## Reference

- Lens catalog: `TheLenses.md`
- Scientific grounding: `ScientificFoundation.md`

## Gotchas

- **2–8 lens passes, not unlimited.** For most topics returns diminish after ~5.
- **Every pass must surface genuinely NEW requirements.** Passes that restate earlier findings mean it's time to stop.
- **This is a BPE-fragile skill.** Watch whether smarter models make it unnecessary; retest quarterly.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"IterativeDepth","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.
