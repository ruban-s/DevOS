# Audit Workflow

One full pass over every force-loaded instruction, hunting over-prompting.

## Flow

### 1. Map what loads

Open `settings.json` and note:
- `loadAtStartup.files` — pulled in each session
- `postCompactRestore.fullFiles` — re-pulled after compaction
- `dynamicContext` sections — relationship, learning, work summaries
- CLAUDE.md — the native instruction file

Inside a specific project, pick up its project-level CLAUDE.md files too.

### 2. Read the whole set

Open each mapped file end to end. Tally lines and rules — the savings estimate later needs the baseline.

### 3. Score every rule against the Five Questions

Run each rule through the five checks in SKILL.md, measuring against what the harness model already does unprompted.

**The usual false additions — the model handles these alone:**
- Opening files before changing them
- Confirming before destructive steps (rm, reset --hard, force push)
- Keeping edits tight, skipping unasked extras
- Leaving quoted/user text untouched
- Preferring safer options ahead of destructive git moves
- Offering structured options when asking questions

### 4. Hunt cross-file friction

Lay the files side by side and look for:
- One idea phrased two ways in two places
- Rules pulling in opposite directions
- Stale pointers — skill names, file paths, tool names that moved on

### 5. Weigh load cost against payoff

For every force-loaded file, gauge:
- Rough token weight
- How often its contents genuinely shift output quality
- Whether it could drop to on-demand (via the CLAUDE.md routing table) instead of always-on

### 6. Write the report

Follow the SKILL.md report shape; attach the estimated token savings.

### 7. Offer the trimmed files

On operator approval, produce cleaned copies with the dead weight removed.
