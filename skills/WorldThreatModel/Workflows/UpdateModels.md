---
workflow: UpdateModels
mode: loop-compatible
---

# Refresh the Horizon Reads

Build or rebuild horizon documents from fresh research plus operator-supplied analysis.

## Fits When

- Caller says "update world models," "refresh reads," "new analysis in"
- Operator hands fresh material to fold into the reads
- Reads read stale (>30 days since refresh)
- First seeding (no reads on disk yet)

## Needs

- Read skeleton at `DEVOS/skills/WorldThreatModel/ModelTemplate.md`
- Research path available for web evidence

## The Pass

### Gate 0: Survey the Shelf

```
Open DEVOS/MEMORY/RESEARCH/WorldModels/INDEX.md (when present)
List which windows exist and their last_updated stamps
Rule: full seeding versus targeted refresh
```

### Move 1: Set the Scope

**Full seeding** (shelf empty or caller says "rebuild all"):
- Draft all 11 reads from scratch
- Parallel research workers carry the load

**Targeted refresh** (reads exist, fresh material arrives OR routine aging):
- Operator material in: treat it as primary, research as backup
- Routine pass: research what moved since the read's last_updated stamp
- Touch only the affected windows

**Single window** (caller names "the 5-year read"):
- Research and rewrite that window alone

### Move 2: Gather Fresh Weather

Per read under construction or refresh:

1. **Bring Research** (Standard or Extensive depth per scope):
   - Ask: "Current global posture and projections for the {WINDOW} window: power, machine-intelligence arc, markets, society, environment, security. Weight developments since {last_updated or 'baseline'}."
   - Near windows (6mo–3yr): live events, dated forecasts, named incidents
   - Middle windows (5yr–10yr): trajectory math, structural drift, rising shapes
   - Far windows (15yr–50yr): deep forces, headcount physics, paradigm turns

2. **Operator material in**: fold the operator's read first, research second

3. **Parallelize multi-window work**:
   - Near batch: 6mo, 1yr, 2yr, 3yr (4 workers)
   - Middle batch: 5yr, 7yr, 10yr (3 workers)
   - Far batch: 15yr, 20yr, 30yr, 50yr (4 workers)
   - Every worker runs Research for its own window

### Move 3: Draft the Reads

Per read, following `ModelTemplate.md`:

1. Header block (horizon, last_updated: today, version bumped, confidence graded)
2. All 9 chapters at or above their length floors
3. Predictions hedged
4. Named places, firms, systems, figures with reasoning attached
5. Wildcards with likelihood guesses

Persist to: `DEVOS/MEMORY/RESEARCH/WorldModels/{horizon}.md`

### Move 4: Rebuild the Index

Write or refresh `DEVOS/MEMORY/RESEARCH/WorldModels/INDEX.md`:

```markdown
# World Threat Models — Index

Last full update: {date}

| Horizon | File | Last Updated | Version | Confidence |
|---------|------|-------------|---------|------------|
| 6 months | 6-month.md | YYYY-MM-DD | N | high/med/low |
| 1 year | 1-year.md | YYYY-MM-DD | N | high/med/low |
| ... | ... | ... | ... | ... |

## Update History

- YYYY-MM-DD: {what moved and why}
```

## Worker Brief (for parallel drafting)

When fanning workers to draft reads, brief them thus:

```
CONTEXT: You are drafting a horizon read for the {WINDOW} window.
Today is {TODAY}. This read will age-test ideas, strategies,
and investments against the projected world of that window.

TASK: Draft the full read following this skeleton:
{INSERT ModelTemplate.md CONTENT}

REQUIREMENTS:
- Floor 4,000 words across chapters
- Hedge predictions ("likely," "projected," "if trends hold")
- Name names: countries, firms, systems, figures with numbers
- Near windows: heavier on live-data extrapolation
- Far windows: heavier on deep forces and megatrends
- At least 4 wildcards with likelihood guesses
- Grade overall confidence with reasoning

RESEARCH: Use WebSearch for live data, forecasts, and analysis
touching this {WINDOW} window across every chapter (power, tech,
markets, society, environment, security).

SLA: Land within 5 minutes.

OUTPUT: Full markdown read following the skeleton exactly.
Header block with horizon, last_updated, version: 1, confidence grade.
```

## Neighbor Map

| Neighbor | Job |
|-------|---------|
| **Research** | Core evidence-gathering behind read content |
| **WebSearch** | Live events and projections |

## Shelf as State (loop fit)

- Disk reads ARE the state
- Gate 0 reads current state to decide what moves
- Every window refreshes alone
- INDEX.md carries the rollup
