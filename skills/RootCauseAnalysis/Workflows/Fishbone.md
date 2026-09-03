# Fishbone — RootCauseAnalysis

## Job

Draw a **fishbone (Ishikawa) chart** — contributors sorted into named families around one break. Where 5 Whys walks one line deep, Fishbone sweeps **wide first**: every family gets heard before anything gets drilled.

Sharpest when several heads bring several expertises, when the break plausibly spans families, or when a disciplined harvest must precede narrowing.

## Fits When

- "Fishbone," "Ishikawa," "cause-and-effect chart"
- "What could all be feeding this?"
- Several stakeholders must contribute
- Ahead of 5 Whys — so one family doesn't hog the inquiry early
- Defect hunts where the mode could arrive from several quarters

## The Skeleton

```
                   People              Process             Material
                      │                   │                   │
                ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
                │           │       │           │       │           │
                │           │       │           │       │           │
         ─ ─ ─ ─┴─ ─ ─ ─ ─ ─┴─ ─ ─ ─┴─ ─ ─ ─ ─ ─┴─ ─ ─ ─┴─ ─ ─ ─ ─ ─┼─ ─ ─ ─ ▶ PROBLEM
                                                                     │
                │           │       │           │       │           │
                │           │       │           │       │           │
                └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
                      │                   │                   │
                   Machine           Measurement         Environment
```

Break at the head (right). Families ride the big bones. Concrete causes hang as barbs off each bone.

## Picking Families

Ishikawa's own counsel: **bend families to context.** Stock sets:

### 6 M's — build and technical shops (software default)

| Family | Holds |
|----------|--------|
| **Manpower (People)** | Skill, training, tenure, fatigue, drive, staffing |
| **Machine (Equipment)** | Iron, software, tooling, calibration, versions, config |
| **Method (Process)** | Procedures, flows, instructions, algorithms, runbooks |
| **Material** | Inputs, deps, third-party libs, data health |
| **Measurement** | Gauges, watchers, tests, instrument truth |
| **Mother Nature (Environment)** | Net weather, load, ambient quirks, seasonal beats |

### 4 P's — service and customer-facing work

| Family | Holds |
|----------|--------|
| **People** | Crew, customers, stakeholders |
| **Process** | Flows, procedures, SLAs |
| **Policies** | Rules, standards, governance |
| **Procedures** | Concrete runbooks, scripts |

### 8 M's — wide build

6 M's plus **Management** (calls, priorities, resourcing) plus **Maintenance** (upkeep, patching, lifecycle).

### 8 P's — commercial and marketing

Product/Service, Price, Place, Promotion, People, Process, Physical Evidence, Partners.

**Software breaks** open on 6 M's almost always. When the shape clearly refuses the set (pure policy break → 4 P's), switch or blend.

## The Run

### Pass 1: Pin the Break

Seat it at the head. Measurable and exact.

```
PROBLEM: [Exact, observable statement]
```

### Pass 2: Name the Families

Fit to the break. Record the choice in the output.

### Pass 3: Harvest Causes Per Family

**Room rules:**
- **No judging during harvest.** Every nominee lands on the board.
- **Several voices.** Unlike expertises surface unlike families.
- **Draw it.** Boards and stickies beat bullet lists.
- **Bare families talk.** A People bone with nothing on it either rules People out or rules the room's makeup out — seat different experts.

Per family, probe:
- What here could have fed the break?
- What here looks strained, odd, or freshly moved?
- What would have to hold for this family to be guilty?

### Pass 4: Barb the Bones (Whys Within)

Per cause, ask "why does this hold?" 2–3 times. **This is 5 Whys nesting inside Fishbone** — each family fork earns its own short descent.

```
Family: Process
  ├─ Cause: Deploy sheet missing
  │    └─ Why: Sheet predates the current shape
  │         └─ Why: Nobody owns sheet upkeep
  ├─ Cause: Rollback drill never rehearsed
  │    └─ Why: Never run live
  │         └─ Why: Dread of triggering a second break
```

### Pass 5: Order With Pareto

Not all nominees weigh alike. Run the ordering:

1. **Weigh** each cause — count from break history, estimated blast, or expert gauge.
2. **Sort** heaviest first.
3. **Cumulate** percentages.
4. **Keep the vital few** (usually the top 3–5 carrying ~80% of weight). Park the tail.
5. Remedy the few; shelve the rest.

**To respect:** Pareto orders *attention*; it never explains *mechanism*. Trail it with Whys depth on the vital few.

### Pass 6: Confirm the Shortlist

**Charted is not proven.** Per vital-few nominee, plan confirmation:

```
CAUSE: [statement]
CONFIRMATION PLAN: [how we test the link]
- Evidence owed: [readings or sightings required]
- Test: [trial or history query]
- Pass mark when true: [forecast]
```

## Return Shape

```
🐟 FISHBONE ANALYSIS: [break]

PROBLEM: [exact statement]
FAMILY SET: [6M / 4P / 8M / 8P / blended]

CAUSE CHART:

People:
- [Cause A1]
  └─ Why: [depth]
- [Cause A2]

Machine:
- [Cause B1]
- [Cause B2]

Method:
- [Cause C1]
  └─ Why: [depth]
    └─ Why: [depth]

Material:
- [Cause D1]

Measurement:
- [Cause E1]

Environment:
- [Cause F1]

PARETO (heaviest first):
| Cause | Weight | Cumulative % |
|-------|--------|--------------|
| [C1]  | 45%    | 45%          |
| [B2]  | 25%    | 70%          |
| [A1]  | 15%    | 85%          |  ← 80% line above here
| [D1]  | 10%    | 95%          |
| ...   | ...    | ...          |

VITAL FEW (focus):
1. [Cause] — confirmation: [...]
2. [Cause] — confirmation: [...]
3. [Cause] — confirmation: [...]

REMEDIES: [per confirmed cause, after confirmation]
```

## Worked Pass — p99 Climb After a Push

```
PROBLEM: Checkout p99 leapt 200ms → 3,200ms after the 2026-04-10 push.

FAMILY SET: 6 M's

CHART:

Manpower:
- Pushing engineer new to this service; missed the async-only rule
- Reviewer merged without running benches

Machine:
- Terraform sized the fleet at t3.small (light for the fresh shape)
- Pool sized for yesterday's traffic

Method:
- No canary — full traffic cut at once
- No pre-push perf smoke

Material:
- Fresh dep introduced a blocking vendor call (prior shape was async)
- Shared lib bump retired the async entry

Measurement:
- Pre-push sheet watches means, never p99
- No p99 excursion trip during rollout

Environment:
- Push landed in peak window (14:00 UTC)
- The vendor itself ran hot that day

PARETO:
| Cause | Share | Cumulative |
|-------|-------------|------------|
| Blocking vendor call (Material) | 65% | 65% |
| No canary (Method) | 15% | 80% |
| t3.small fleet (Machine) | 10% | 90% |
| Peak-window push (Environment) | 5% | 95% |
| Tail | 5% | 100% |

VITAL FEW:
1. Blocking vendor call — confirm: diff review; bench sync versus async locally
2. Missing canary — confirm: history — did past full-cut pushes also spike?
3. Fleet size — confirm: re-push to t3.medium; compare

REMEDIES:
- Restore the async call — owner: checkout — date: Apr 15
- Ship canary (10% → 50% → 100% behind a p99 gate) — owner: platform — date: Apr 30
- Per-service fleet sizing pass in Terraform — owner: infra — date: May 5
```

## Ruts

- **Shoving causes into wrong families.** When a cause fits nowhere, mint a family — never bend the cause.
- **Waving past bare families.** Bare usually means the wrong room. Seat new expertise.
- **Skipping Pareto.** Without ordering, everything gets fixed and nothing does.
- **Skipping confirmation.** A charted cause is a nominee, not a verdict. Test the shortlist before remedying.
- **Wrong family set.** 6 M's on a pure policy break warps the chart. Pick or blend correctly.
- **One-and-done.** Tangled breaks earn draft 2. Fresh evidence reshapes the skeleton.

## Nests

- **Whys within** — each barb can grow its own Whys descent
- **Pareto within** — numeric ordering pass
- **Postmortem around Fishbone** — Postmortem borrows Fishbone for its "contributors" chapter
- **Toward SystemsThinking** — when barbs converge on structural notes, escalate to Iceberg

## Lineage

Kaoru Ishikawa, first drawn at Kawasaki Steel (1943), shown formally 1945, canonized in *Guide to Quality Control* (1968) among the seven basic quality instruments. Family variants via ASQ training lines and AIAG shop standards.
