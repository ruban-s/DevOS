---
workflow: ViewModels
mode: single-run
---

# Inspect the Horizon Reads

Read back the live state of the horizon set.

## Fits When

- Caller says "view world models," "show the reads," "current reads," "read status"
- Someone wants the substance of today's reads
- Someone wants a freshness check ahead of a TestIdea run

## The Pass

### Ping 1: Announce

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Checking current world model state"}'
```

### Move 2: Open the Index

Read `DEVOS/MEMORY/RESEARCH/WorldModels/INDEX.md`.
Absent: "No horizon reads on disk. Run 'update world models' to seed them."

### Move 3: Choose the Aperture

**Survey** (stock — no window named):
- Show the INDEX grid with windows, dates, versions, confidence
- Per read, quote 2–3 sentences from its opening brief
- Mark anything past 30 days as aging

**Single window** (caller names "the 5-year read"):
- Print that window's full read, chapters intact

**Contrast** (caller says "near versus far"):
- Set key motifs from chosen windows side by side
- Call out where short-arc and long-arc trends pull apart

### Move 4: Freshness Grades

Per read, compare `last_updated` against today:
- **Under 7 days**: 🟢 Fresh
- **7–30 days**: 🟡 Current
- **30–90 days**: 🟠 Aging — refresh advised
- **Over 90 days**: 🔴 Stale — refresh strongly advised

### Move 5: Emit

```markdown
# 🌍 World Threat Model Status

| Horizon | Last Updated | Version | Confidence | Freshness |
|---------|-------------|---------|------------|-----------|
| 6 months | YYYY-MM-DD | N | HIGH | 🟢 Fresh |
| 1 year | YYYY-MM-DD | N | MEDIUM | 🟡 Current |
| ... | ... | ... | ... | ... |

## Summaries

### 6-Month Horizon
{2-3 sentence opening-brief excerpt}

### 1-Year Horizon
{2-3 sentence opening-brief excerpt}

...

## Recommendations
- {Reads owed a refresh}
- {Notable drift since last refresh}
```

## Neighbors

None — this path only reads.
