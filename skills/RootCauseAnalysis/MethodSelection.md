# RootCauseAnalysis — Choosing the Motion

The instrument shapes the answer — 5 Whys on a safety-critical break and FTA on a trivial blemish both waste the room.

## Routing Sketch

```
Break or blemish?
│
├─ Break (live outage, security event, data loss)
│    │
│    └─ Open a Postmortem frame
│         ├─ One thread, plain mechanism → 5 Whys within
│         ├─ Several suspect families → Fishbone within
│         ├─ "Fine there, broken here" shyness → Kepner-Tregoe within
│         └─ Safety/security weight → Fault Tree within
│
└─ Blemish (repeat bug, quality sag, process miss)
     │
     ├─ Plain, single-thread → 5 Whys
     ├─ Wide or brainstorm-shaped → Fishbone + Pareto
     ├─ Drift off known-good → Kepner-Tregoe IS/IS-NOT
     ├─ Never-seen-before → Apollo/RealityCharting
     └─ Tangled interacting faults → Fault Tree
```

## Fast Compare

| Lens | 5 Whys | Fishbone | FTA | Apollo | KT |
|-----------|--------|----------|-----|--------|-----|
| Break size | Small–mid | Mid–large | Large–very large | Mid–large | Mid |
| Cause shape | One line | Several families side by side | Branching, probabilistic | Branching, evidence-gated | Drift contrast |
| Room | Solo or pair | Group harvest | Engineers + analysts | Formal panel | Solo or pair |
| Clock | Minutes–hours | Hours | Days–weeks | Hours–days | Hours |
| Safety weight | No | No | Yes | Yes | No |
| Odds wanted | No | No | Yes | No | No |
| Novelty fit | Fair | Good | Good | Good | Fair |
| Regulatory spine | No | Partial | Yes | Yes | Partial |
| Leaves | Chain + fix | Family chart + Pareto | Break sets + odds | Evidence graph | Contrast + change |

## Stacking Motions

Motions nest — never treat them as exclusive.

### Shop-ops stack

**Postmortem** (frame) → **5 Whys** (per thread) → **layered-defense review** → **remedy strength ordering**

### Quality-desk stack

**Fishbone** (span) → **Pareto** (vital few) → **5 Whys** (depth on the few) → **confirmation**

### Shy-defect stack

**Kepner-Tregoe** (IS/IS-NOT finds the change) → **5 Whys** (why the change slipped past) → **remedy**

### Safety-critical stack

**FTA** (deductive chart) → **FMEA** (modes ordered by RPN/AP) → **Postmortem** (when metal already bent) → **multi-sheet remedies**

## Misapplications

**Whys where Fishbone belonged.**
- Tell: every "why?" returns three true answers
- Move to Fishbone and harvest all forks

**Fishbone where Whys belonged.**
- Tell: the family is known; depth is missing
- Run Whys straight

**FTA with no odds.**
- Tell: the numbers never arrive; the tree is decoration
- Fall back to Fishbone + Whys

**Kepner-Tregoe with no baseline.**
- Tell: no "last known good" exists; contrast has nothing to grip
- Run Apollo or Fishbone

**Skipping the Postmortem frame for "small" breaks.**
- Tell: exceptions for "it wasn't big"
- Run it anyway — the habit compounds; the skipped lesson never returns

## Domain Starts

| Terrain | Open with | Keep handy |
|--------|----------------|-----------|
| Live software outage | Postmortem + 5 Whys | Layered defense, Fishbone |
| Distributed tangle | Postmortem + Apollo | FTA |
| Security event | Postmortem + layered defense | KT for shy defects |
| Build defect | Fishbone + Pareto | 5 Whys |
| Flaky / environment-bound | Kepner-Tregoe | 5 Whys |
| Safety-critical build | FTA | FMEA, Apollo |
| Pre-launch screen | FMEA (early) | FTA |
| Process / org miss | Fishbone (4 P's) | 5 Whys |
| Regulatory inquiry | Apollo / RealityCharting | FTA |

## Clock Versus Rigor

| Clock | Motion |
|-----------|--------|
| 10 minutes | Fast 5 Whys |
| 1 hour | 5 Whys + Fishbone |
| Half day | Postmortem + stacked motions |
| Days | Postmortem + FTA + FMEA |
| Regulatory bar | Apollo with full evidence |

## Cross-Skill Handoffs

- **SystemsThinking** — repeat postmortems rhyming on one structural note escalate to Iceberg / FindArchetype. RCA banks contributors; SystemsThinking names structure and belief.
- **FirstPrinciples** — split a contributor to bedrock before shaping the fix.
- **RedTeam** — "how would we re-cause this?" is hostile RCA. Aim it at remedies.
- **Science** — RCA *is* lab method on failures. Borrow Science for hypothesis hygiene mid-hunt.
