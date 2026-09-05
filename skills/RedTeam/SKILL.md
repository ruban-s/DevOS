---
name: RedTeam
version: 1.1.17
description: "Adversarial review that sends parallel expert critics after an idea, plan, or strategy — splitting it into small claims, attacking each, then returning a ranked severity report with fixes. USE WHEN red team, attack idea, counterarguments, critique, stress test, devil's advocate, find weaknesses, break this, poke holes, strongest objection. NOT FOR collaborative debate to find best path (use Council)."
---

## Tailoring

**Before running anything, look for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/RedTeam/`

When that folder exists, honor any PREFERENCES.md, configs, or extra material inside it. Those settings win over the defaults below. When it is absent, carry on with the standard behavior.

# RedTeam Skill

## Why This Exists

Plans feel solid from the inside. Once someone commits to a direction, attention narrows to supporting evidence and the awkward questions never get asked — colleagues stay polite, reviewers stay aligned, and the flaw ships. This skill supplies the awkward questions on purpose, at volume, while fixes are still cheap.

## What You Get

A hostile-yet-fair reading of any proposal: the claim set pulled apart, hit from many specialist angles at once (builders, system designers, security minds, outside eyes), then reassembled as two artifacts — the fairest possible statement of the case, and the hardest honest case against it.

## How It Operates

Parallel critics, shared evidence, severity-ranked synthesis. The target is always the reasoning — never infrastructure, never people. Decompose the position into bite-size assertions, set diverse reviewers on each one, keep what survives, and grade the rest by how much damage it would do if ignored.

## Pick Your Path

Decide which motion fits the ask, then announce it with the line above.

| Path | Fits when | Doc |
|------|-----------|-----|
| ParallelAnalysis | There is already a position to batter | `Workflows/ParallelAnalysis.md` |
| AdversarialValidation | There is a decision to make and rival options should fight it out | `Workflows/AdversarialValidation.md` |

---

## At a Glance

| Path | Job | Hands back |
|------|-----|------------|
| **ParallelAnalysis** | Put existing material under fire | Strongest fair statement + strongest honest rebuttal (8 beats apiece) |
| **AdversarialValidation** | Let candidate solutions compete | One fused recommendation built from the winners |

**Shape of a ParallelAnalysis answer:** two 8-beat narratives, each beat held to 12–16 words, aimed at genuine weak joints rather than caricatures, ordered worst-first.

---

## Companion Docs

- `Philosophy.md` — guiding bets, what good looks like, the critic roster
- `Integration.md` — how this combines with neighboring capabilities, plus the output shape

---

## Worked Invocations

**Grill an architecture call:**
```
User: "red team this microservices migration plan"
--> Workflows/ParallelAnalysis.md
--> Hands back the fair statement plus the rebuttal that hurts (8 beats each)
```

**Play skeptic on a commercial move:**
```
User: "poke holes in my plan to raise prices 20%"
--> Workflows/ParallelAnalysis.md
--> Isolates the single load-bearing crack that could sink it
```

**Settle a build choice by combat:**
```
User: "battle of bots - which approach is better for this feature?"
--> Workflows/AdversarialValidation.md
--> Fuses the rival drafts into one sturdier answer
```

---

**Last Updated:** 2025-12-20

## Traps

- **Arguments, not networks.** This reviews reasoning and plans — it does not probe hosts or exploit systems.
- **Volume needs triage.** Dozens of critics produce plenty of noise; grade by impact and drop the rest.
- **Toughen, don't torch.** Every weakness ships with a repair direction.

## Execution Log

After any path finishes, record one JSONL line:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"RedTeam","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Swap in the real path name for `WORKFLOW_USED`, a short input sketch for `8_WORD_SUMMARY`, and the elapsed seconds for `SECONDS`. Mark `status: "error"` when the run failed.
