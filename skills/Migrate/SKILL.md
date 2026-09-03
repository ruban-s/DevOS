---
name: Migrate
version: 1.0.11
description: "Takes external content, classifies each chunk against the DevOS taxonomy, and commits it with provenance. Sources: .md/.txt, stdin, DevOS dirs, CLAUDE.md/Cursor/OpenAI Custom Instructions, Obsidian/Notion/Apple Notes exports. MigrateScan classifies → routing table. MigrateApprove with --approve-all/--approve-target/--review/--dry-run. Confidence ≥70% auto, 40-70% confirm, <40% walk-through. USE WHEN /migrate, migrate content, import from other DevOS, bring in old notes, import Cursor rules, import CLAUDE.md, bulk import, Obsidian/Notion/Apple Notes import. NOT FOR single-file edits, conversational interviews, identity edits."
disable-model-invocation: true
---

# Migrate — external-content intake and classification

## 🚨 MANDATORY: Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Starting the migration. Scanning source and classifying chunks."}' \
  > /dev/null 2>&1 &
```

## The Job

Migrate absorbs outside material — old notes, rule files, vault exports — sorts every chunk against the DevOS taxonomy, and files it at the right destination with its provenance attached. Classification confidence steers the flow: confident chunks auto-approve, middling ones ask for a nod, weak ones get walked through line by line. Two v2 tools back the procedure: MigrateScan (classify into a routing table) and MigrateApprove (commit per the chosen path); the workflow prose below stays intact while their execution legs remain deferred.

## Why Intake Needs Its Own Skill

Adopting DevOS usually means arriving with years of accumulated text — a CLAUDE.md, a markdown vault, journal dumps, rules from another harness — none of it shaped to DevOS's tree. Hand-sorting hundreds of chunks into doctrine sections, knowledge notes, and operating rules is exactly the chore that never gets done, so the old material idles forever. Migrate mechanizes the sorting: it reads what already exists, nominates a destination per chunk with a confidence score, and offers bulk approval for the confident ones plus careful review for the rest — stamping provenance on arrival so nothing lands unattributed.

## How It Differs From Interview

`/interview` starts empty and asks questions to fill gaps. `/migrate` starts full — the content already exists and only needs classifying and routing. MigrateScan produces the routing table; MigrateApprove commits it down the user's chosen path.

### V1 source coverage

- **Files:** `.md`, `.markdown`, `.txt` (single file or directory recursion)
- **Stdin:** piped content or pasted directly
- **Other DevOS installs:** point at their `USER/TELOS/` or `MEMORY/KNOWLEDGE/` directories
- **Agent-harness rule files:** `CLAUDE.md`, `.cursorrules`, OpenAI Custom Instructions export
- **Exports:** Obsidian vaults (markdown), Notion exports (markdown), Apple Notes exports (.txt), raw journal dumps

### Classification targets

| Category | Destinations |
|---|---|
| **Foundational TELOS** | MISSION, GOALS, PROBLEMS, STRATEGIES, CHALLENGES, BELIEFS, WISDOM, MODELS, FRAMES, NARRATIVES, SPARKS |
| **IDEAL_STATE dimensions** | HEALTH, MONEY, FREEDOM, RELATIONSHIPS, CREATIVE, RHYTHMS |
| **Preference files** | BOOKS, AUTHORS, MOVIES, BANDS, RESTAURANTS, FOOD_PREFERENCES, LEARNING, MEETUPS, CIVIC |
| **Identity** | USER/PRINCIPAL/PRINCIPAL_IDENTITY.md |
| **Knowledge** | MEMORY/KNOWLEDGE/{Ideas,People,Companies,Research} |
| **AI collaboration rules** | Walk-through to a constitutional surface — CLAUDE.md operational rules, a hook, `settings.json`, or the relevant skill's Gotchas ("always do X" / "never Y" patterns are system patches, never harness `memory/feedback_*.md` memos) |
| **Unclear** | Flagged for the user's manual routing |

## Workflow Routing

No `Workflows/` directory — the single migration procedure runs inline through Phases 1–6 below, backed by two tools in `DEVOS/Tools/`.

| Trigger | Workflow | File |
|---------|----------|------|
| /migrate, migrate content, bulk import, import from other DevOS, import CLAUDE.md / Cursor rules / Obsidian / Notion / Apple Notes export, bring in old notes | Inline Phases 1–6 (identify → scan → route → approve → UNCLEAR → summary) | `DEVOS/Tools/MigrateScan.ts` + `DEVOS/Tools/MigrateApprove.ts` |

## Workflow

### Phase 1 — Identify the source

Ask the user what he wants to migrate:

- "Paste the content here and I'll work from stdin"
- "Point me at a file path"
- "Point me at a directory and I'll scan everything inside"
- "I have a Cursor rules file at ~/Projects/X/.cursorrules"
- "My old DevOS install has TELOS at ~/old-claude/TELOS/"

Collect the source path. If content is pasted, write it to a temp file first.

### Phase 2 — Scan

Run the scanner:

```bash
bun DEVOS/Tools/MigrateScan.ts --source <path>
# or
echo "$CONTENT" | bun DEVOS/Tools/MigrateScan.ts --stdin
```

Scanner output includes:
- Total chunks found
- Proposed routing table (how many chunks per target)
- Average classification confidence
- Count of UNCLEAR chunks
- Count of low-confidence (<40%) chunks

### Phase 3 — Present routing summary

Show the user the routing proposal in a scannable format:

```
Found 47 chunks from 3 files. Proposed routing:

  📂 TELOS/GOALS.md              12 chunks  (78% avg confidence)
  📂 TELOS/WISDOM.md              8 chunks  (65% avg confidence)
  📂 TELOS/BELIEFS.md             6 chunks  (71% avg confidence)
  📂 MEMORY/KNOWLEDGE/Ideas      15 chunks  (52% avg confidence)
  🧠 AI collaboration rules       4 chunks  (walk-through: CLAUDE.md / hook / skill)
  ❓ UNCLEAR                      2 chunks  (needs your call)

Options:
  - Approve everything trusted (confidence ≥60%)?
  - Walk through the low-confidence and UNCLEAR chunks one by one?
  - Review specific categories?
  - Review everything?
```

### Phase 4 — Approval loop

Based on the user's preference:

**Fast path** (he says "approve all trusted"):
```bash
bun DEVOS/Tools/MigrateApprove.ts --approve-all
```
Commits everything non-UNCLEAR. Then walk through UNCLEAR chunks conversationally.

**Category path** (he says "approve goals and wisdom, skip knowledge"):
```bash
bun DEVOS/Tools/MigrateApprove.ts --approve-target TELOS/GOALS.md
bun DEVOS/Tools/MigrateApprove.ts --approve-target TELOS/WISDOM.md
```

**Walk-through path** (he wants careful review):
```bash
bun DEVOS/Tools/MigrateApprove.ts --review
```
Show each pending chunk. For each:
- Show preview + proposed target + confidence + alternatives
- Ask: approve / modify target / reject
- Commit decision

### Phase 5 — Handle UNCLEAR chunks

UNCLEAR chunks are ones where no classification rule matched strongly. For each:
- Display full content (not just preview)
- Ask the user: "This one's unclear — what is it? Could be X, Y, Z, or maybe Knowledge/Ideas as a catch-all?"
- the user chooses → commit via `--modify <id> --target <chosen>`

### Phase 6 — Completion summary

After approval pass:
- Report total chunks committed, per-target count
- Flag any remaining UNCLEAR
- Recommend next step: run `/interview` to interview around anything the migration left sparse

## Rules

- **Every commit carries provenance.** The committed content includes an HTML comment noting source file + section + timestamp. Nothing gets dropped into TELOS without attribution.
- **Never bulk-approve UNCLEAR.** Those require the user's explicit routing.
- **Confidence thresholds:** ≥70% = trusted (auto-approve eligible). 40-70% = medium (show for confirmation). <40% = low (walk-through required).
- **Ask before touching identity.** PRINCIPAL_IDENTITY.md commits always prompt — that file is load-bearing.
- **Don't duplicate.** If the same content already exists in the target (substring match), flag it and ask before appending.
- **Respect private paths.** Never migrate content into IDEAL_STATE/ without the user's per-dimension call (Decision #3: IDEAL_STATE is fully private and curated).
- **Rules never go to harness memory.** AI collaboration rule chunks are always walked through one by one and routed to a constitutional surface: an operational rule in CLAUDE.md, a hook, a `settings.json` permission, or the relevant skill's Gotchas. Writing them to the harness `memory/feedback_*.md` directory is forbidden — every feedback memo is a missed system patch (see the system prompt's "Override of harness auto-memory").
- **Knowledge gets new files too.** Each `MEMORY/KNOWLEDGE/*` chunk becomes a new typed note with source metadata.

## Examples

### User: `/migrate ~/old-claude/TELOS/`

The agent scans the old TELOS directory, classifies every chunk, presents the routing summary, offers fast-path vs. walk-through approval.

### User: `/migrate` (then pastes CLAUDE.md content)

The agent reads from stdin, classifies most chunks as AI collaboration rules (walked through to CLAUDE.md / hooks / skill Gotchas) plus maybe PRINCIPAL_IDENTITY (if identity lines are mixed in), walks through approval.

### User: "migrate my Cursor rules at ~/.cursor/rules"

The agent scans the rules dir, surfaces likely rule classifications, walks each through to its constitutional destination with extra care (Cursor rules often have tool-specific stuff that doesn't translate to DevOS).

### User: "import the stuff I dumped in /tmp/journal.md"

The agent scans the journal, expects a lot of UNCLEAR + WISDOM, walks through each section.

## Related

- `/interview` — fills gaps by asking questions (not by intaking existing content)
- `/Telos` Update workflow — edit a single TELOS file directly
- `/Knowledge` — manage the Knowledge Archive
- an identity-profile skill — manage PRINCIPAL_IDENTITY

## Gotchas

- **Low average confidence (<40%):** the source is probably genre-mismatched (e.g., code comments, logs, raw data). Consider pre-filtering to remove non-prose chunks before scanning.
- **Everything goes to UNCLEAR:** the source probably has no recognizable DevOS-taxonomy patterns. Either add the content manually via `/Telos` or write it as general Knowledge notes.
- **Duplicate content warnings:** the scanner doesn't dedupe against existing files yet. Run `--dry-run` first to preview before committing.
