---
name: Cortex
version: 2.1.2
description: "Runs Cortex, the DevOS typed knowledge archive — People, Companies, Ideas, Research notes joined by typed related: links — plus recall across prior sessions and conversations. Search, add, harvest, develop, ingest, distill, graph moves, recall. USE WHEN cortex, knowledge, knowledge base, search knowledge, what do we know about, archive, harvest, knowledge status, develop note, add to knowledge, ingest, contradictions, knowledge graph, retrieve, mine conversations, distill, weekly digest, cortex digest, context search, prior work, recall, remember, previous sessions, context recovery, what did we do, find session, search history, resume, pick up where we left off, cold start, yesterday's work, last week, the one about. NOT FOR broad published-content search across blogs and feeds, or one-shot URL ingestion through other harvester pipelines."
argument-hint: [search|add|harvest|develop|ingest|distill|recall|contradictions|graph|retrieve|mine|<query>]
context: fork
background: false
---

# Cortex

One entry point, two holdings: a curated archive of typed, durable notes, and a recall index over the sessions and conversations that came before.

## The Two Holdings

**Archive** — durable notes in four entity shapes (People, Companies, Ideas, Research), every one carrying typed `related:` edges so the collection behaves as a graph rather than a folder. The six historical domains collapse into these four going forward; existing Blogs and Books entries stay readable where they live.

**Recall** — prior sessions, spec documents, and conversation transcripts, reachable by theme or by date phrasing ("yesterday", "last week"). A deterministic Bun CLI fans out over five local sources; there is no persistent index, and each query rescans in about a second.

## Why Typed Edges

An unstructured pile of files decays quietly: contradictions stay hidden, updates never reach the notes they invalidate, and related claims never meet. Routing every note through a schema with mandatory cross-links moves that connection work to write time. Ingest then propagates — a new note proposes updates to its neighbors, conflicts get flagged as first-class `contradicts` edges, and retrieval can walk edges instead of guessing at keywords.

## Ground Rules

The archive lives at `DEVOS/MEMORY/KNOWLEDGE/`, its schema at `DEVOS/MEMORY/KNOWLEDGE/_schema.md`.

**Never write the archive by hand.** Every insertion and mutation routes through this skill's `add`, `harvest`, `ingest`, and `develop` flows — not `cp`, `mv`, `Write`, or `Edit` aimed at the directory. A hand write skips frontmatter validation, the edge requirements, and domain checks, and the resulting corruption is silent: dangling links fail quietly and retrieval simply misses them. Bulk imports call this skill per chunk.

State roots follow the harness chain — `$DEVOS_ROOT` when set, else a repo-local `./DEVOS` install, else the legacy machine-global tree. Recall's transcript store stays machine-global by design (see the header of `Tools/ContextSearch.ts` — implementation detail, not prose).

## Command Map

The workflows are the inline sections below; there is no `Workflows/` directory.

| Call | Flow | Effect |
|------|------|--------|
| `/knowledge` (bare) | **status** | archive health snapshot |
| `/knowledge <query>` | **search** | lexical plus frontmatter plus wikilink hunt |
| `/knowledge search <query>` | **search** | explicit hunt |
| `/knowledge add <type>` | **add** | hand-author one note (People, Companies, Ideas, Research) |
| `/knowledge harvest` | **harvest** | pull from configured sources |
| `/knowledge develop` | **develop** | grow seedlings into fuller notes |
| `/knowledge ingest <url-or-file>` | **ingest** | absorb a source and ripple to neighbors |
| `/knowledge contradictions` | **contradictions** | surface conflicting claims |
| `/knowledge graph` | **graph** | archive statistics |
| `/knowledge graph <slug>` | **graph** | walk edges from a note |
| `/knowledge retrieve <query>` | **retrieve** | compressed topical context |
| `/knowledge mine` | **mine** | propose memory candidates from recent chats |
| `/knowledge distill` | **distill** | weekly routed digest (router, not a store) |
| `/cortex recall <query>` (alias `/cs`) | **recall** | find prior sessions and conversations |

`/cortex <args>` and legacy `/knowledge <args>` dispatch identically — the subcommand governs. Bare text matching no subcommand is read as a search query.

---

## Reading Moves

### search <query>

Three sweeps over `DEVOS/MEMORY/KNOWLEDGE/`, deduplicated:

```bash
rg -i "$ARGUMENTS" DEVOS/MEMORY/KNOWLEDGE/ --type md -l
```

```bash
rg -i "title:.*$ARGUMENTS|tags:.*$ARGUMENTS" DEVOS/MEMORY/KNOWLEDGE/ --type md -l
```

```bash
rg "\[\[.*$ARGUMENTS.*\]\]" DEVOS/MEMORY/KNOWLEDGE/ --type md -l
```

For each hit, pull title, domain, status, and tags from the opening frontmatter lines and tabulate as `Note | Domain | Status | Tags | Relevance`. No hits: say so, and suggest widening to the full `MEMORY/` tree or running a harvest.

### retrieve <query>

Scored, compressed context over the archive:

```bash
bun DEVOS/Tools/MemoryRetriever.ts "<query>" --top 5
```

Ranking blends title affinity, tag overlap, and term frequency. For raw excerpts without compression:

```bash
bun DEVOS/Tools/MemoryRetriever.ts "<query>" --raw
```

### graph [slug]

Bare invocation reports the archive's shape:

```bash
bun DEVOS/Tools/KnowledgeGraph.ts stats
```

Node and edge totals, dominant clusters, hub notes, isolates. With a slug, walk outward:

```bash
bun DEVOS/Tools/KnowledgeGraph.ts traverse <slug> --hops 2
```

Two-hop neighborhood spanning tags, wikilinks, and typed edges. Typed edges only:

```bash
bun DEVOS/Tools/KnowledgeGraph.ts related <slug>
```

### recall <query>

Prior work by theme or date phrasing. The CLI fans out over five stores (work registry, session names, work directory names, spec bodies, conversation jsonl), scores token-overlap weighted by recency, applies date windows, and returns ranked snippets:

```bash
bun run DEVOS/skills/Cortex/Tools/ContextSearch.ts "$ARGUMENTS" --pretty --limit 10
```

Modifiers: `--limit N`, `--since YYYY-MM-DD`, `--json | jq '.results[0]'`. A phrase like "yesterday markdown" splits into a one-day window plus content tokens for `markdown`.

**Two postures:**

1. **Standalone** (`/cs <topic>` or an explicit recall ask) — show the pretty block, then: "Context loaded on [topic]. Most recent: [X]. What would you like to do?"
2. **Prefetch** — run quietly ahead of answering, anchor on the top hits, `Read` a hit's `path` for depth. Don't dump the block unasked.

**Recall behaviors worth knowing (carried over from the retired standalone recall notes):**

- Scoring is token-overlap, not substring — half-remembered wording still hits on shared non-stopword tokens.
- `today` / `yesterday` / `last week` / `N days ago` / `YYYY-MM-DD` carve bounded date filters; leftover tokens still score content.
- JSONL dating uses the first user-message timestamp, not file mtime (mtime shifts on re-read); session-name entries fall back to mtime.
- JSONL scope covers this install's own conversation directory only.
- No cached index — every query rescans (~1–2s); a cached index is the future scaling lever.

---

## Writing Moves

### The Edge Contract (binds every write)

Every new archive note ships with typed connections — graph membership is structural, never decorative. The schema file is normative.

**Required per write:**

1. **`related:` frontmatter** — 2–4 typed entries pointing at other archive notes (any domain).
2. **Body wikilinks** — 1–3 `[[slug]]` mentions where the prose naturally invokes them (evidence, implications, context).

**Edge vocabulary** (pick the tightest fit; `related` is the last resort):

| Edge | Sense |
|------|-------|
| `related` | loose association |
| `supports` | evidence for the target |
| `contradicts` | opposes the target |
| `extends` | builds on the target |
| `part-of` | component of the target |
| `instance-of` | example of the target's pattern |
| `caused-by` | outcome of the target |
| `preceded-by` | temporally after the target |
| `derived-from` | distilled out of the target (e.g. post → idea) |

```yaml
related:
  - slug: other-note-slug
    type: extends
  - slug: another-note-slug
    type: supports
```

**Finding neighbors before writing:**

```bash
rg -l "TOPIC" DEVOS/MEMORY/KNOWLEDGE/ --type md

rg "^tags:.*TAG" DEVOS/MEMORY/KNOWLEDGE/ --type md -l

rg -l "Person Name" DEVOS/MEMORY/KNOWLEDGE/
```

A write missing `related:` is incomplete — repair it before reporting success. Ingest bakes this into its ripple pass; automated capture flows honor it equally.

### add <type>

Hand-author one note.

1. Accept only People, Companies, Ideas, Research.
2. Take the title from trailing args or ask.
3. Slug it kebab-case (60-char ceiling).
4. **Locate 2–3 neighbors first** via the searches above — these become `related:`.
5. Draft with the domain schema from `_schema.md`. The validator (`DEVOS/Tools/KnowledgeSchema.ts` ENVELOPE) insists on all eight of `id` (mint with `mintId(slug, created)` — `kb_` plus 12 hex), `type`, `title`, `tags` (≥1), `quality` (0–10), `created`, `updated`, `convention: kb-v3`, plus the domain's body blocks. Older six-field drafts never validate. Stamp `created:` and `updated:` from `date +%Y-%m-%d` — archive-entry dates, never a source's publication date.
6. Save to `KNOWLEDGE/<Type>/<slug>.md`.
7. Confirm every `related:` slug resolves before saving.
8. Reindex the domain map:

```bash
bun DEVOS/Tools/KnowledgeHarvester.ts index
```

**Tags carry topics, not folders.** A security finding is an Idea tagged `security`; a security vendor is a Company tagged `security`. Shape picks schema; tag picks theme.

### ingest <url-or-file>

Absorb an outside source and ripple. Called without an operand, print `/knowledge ingest <url-or-file-path>`.

**Gather.** URLs via WebFetch (fallback `curl -sL`); paths via Read. Condense to 2–3 sentences naming entities, claims, and takeaways.

**Classify and draft.** Pick the domain via `_schema.md` (most sources land as Ideas). Slug kebab-case (≤60), save under `KNOWLEDGE/<Type>/<slug>.md`, stamp both dates from `date +%Y-%m-%d` — entry dates; a source's stated publication date belongs in `source_date:` and must never leak into `created:`, nor be guessed when unstated. Record `source_url:` or `source_path:`. **Bake 2–4 typed `related:` edges in at creation** — the ripple pass below identifies them.

**Ripple.** Hunt neighbors (cap ten):

```bash
rg -i "TAG1|TAG2|TAG3" DEVOS/MEMORY/KNOWLEDGE/ --type md -l --glob '!_*'

rg -i "ENTITY1|ENTITY2" DEVOS/MEMORY/KNOWLEDGE/ --type md -l --glob '!_*'
```

Read each, judge addition / context / contradiction, and table the plan:

```
📥 INGEST RIPPLE PLAN:
  PRIMARY: Ideas/new-note-slug — "Title" (created)
  PRIMARY related: frontmatter links (MANDATORY):
    → Ideas/existing-note-1 — type: extends
    → Ideas/existing-note-2 — type: supports
    → People/person-slug — type: related
  RIPPLE (reverse-direction updates to existing notes):
    → Ideas/existing-note-1 — add body [[new-note-slug]] wikilink + add to its related: array (type: extends)
    → Ideas/existing-note-2 — update Evidence section with new data point + add to related:
    → Ideas/existing-note-3 — ⚠️ CONTRADICTION: new source says X, note says Y — type: contradicts
  NO CHANGE: Ideas/tangentially-related — mentioned same tag but no substantive connection
```

**Apply.** On approval (or immediately for low-risk cross-links): enforce the primary's `related:`, add reverse edges to neighbors, weave `[[wikilinks]]` into existing prose where earned, bump neighbors' `updated:` via `date +%Y-%m-%d` (their `created:` stays frozen), and mark contradictions with `> ⚠️ **Contradiction:** [note] claims X — see [[new-note]] for counter-evidence` plus `type: contradicts` edges.

**Record and reindex.** Append to `KNOWLEDGE/_log.md`:

```
## [YYYY-MM-DD] ingest | Title
- Source: <url or path>
- Primary: <Type>/<slug>
- Ripple: N notes updated, N contradictions flagged
```

then:

```bash
bun DEVOS/Tools/KnowledgeHarvester.ts index
```

### harvest

Pull configured sources into the archive:

```bash
bun DEVOS/Tools/KnowledgeHarvester.ts harvest
```

Narrate the outcome; an empty run means sources are current — say so. Accepts an optional `--source` narrowing (`/knowledge harvest work`, `/knowledge harvest memory`).

### develop

Garden duty: mature thin notes.

1. List seedlings:

```bash
rg "^status: seedling" DEVOS/MEMORY/KNOWLEDGE/ --type md -l
```

2. Per seedling: read it, read its linked and tag-sharing neighbors, check recent work and auto-memory for fresh context, then enrich (context, links, substance).
3. Show the diff for approval.
4. On approval: save, promote `seedling` → `budding` (or `evergreen` when comprehensive), refresh `updated:` from `date +%Y-%m-%d` with `created:` frozen, rebuild affected maps.

No seedlings means a clean report.

---

## Maintenance Moves

### status (bare call)

```bash
bun DEVOS/Tools/KnowledgeHarvester.ts status
```

Plus: per-domain counts, orphan wikilinks, stale seedlings, time since last harvest.

### contradictions

1. Candidates from tag overlap:

```bash
bun DEVOS/Tools/KnowledgeHarvester.ts contradictions
```

Pairs sharing 2+ tags, ranked by overlap.

2. Semantic pass over the top ten pairs: read both, extract theses / evidence / facts, and sort into **direct conflicts** (A says X, B says not-X), **temporal supersessions** (B's newer evidence retires A's claim), and **scope collisions** (shared turf, divergent verdicts).
3. Report:

```
🔍 CONTRADICTION SCAN:
  Pairs checked: N
  Contradictions found: N
  Superseded claims: N

  ⚠️ CONTRADICTION:
    [[note-a]] claims: "X"
    [[note-b]] claims: "Y"
    Resolution: [which stands, or flag for operator]

  📅 SUPERSEDED:
    [[older-note]] (2026-01-15): "X was true"
    [[newer-note]] (2026-03-20): "X is no longer true because Y"
    Action: Update older note with correction
```

4. On approval: plant correction callouts, stamp superseded notes with `> 📅 **Updated:** See [[newer-note]] for current information`, refresh `updated:` dates, rebuild maps.

### mine

Propose memory candidates (decisions, preferences, milestones, snags) from recent chats:

```bash
bun DEVOS/Tools/SessionHarvester.ts --mine --recent 10
```

Candidates stage in `KNOWLEDGE/_harvest-queue/` for review — never straight into the archive; `/knowledge harvest` drains the queue. Preview shape:

```bash
bun DEVOS/Tools/SessionHarvester.ts --mine --recent 10 --dry-run
```

### distill

Weekly routed digest. **A router, never a store:** each item lands in the system of record that owns it, and the digest file is an index over those landings. It never creates or mutates archive notes (that belongs to `develop` / `contradictions` / `ingest`) and never re-surfaces an already-routed item.

**Complete means:** a dated digest at `DEVOS/MEMORY/DIGESTS/YYYY-MM-DD-distill.md` with ≤10 items across three lanes, each citing source notes and its routed destination; ≤5 content proposals filed; ≤5 upgrade proposals filed; surfaced items marked in state. Overflow is counted aloud, never silently cut.

**Gather (deterministic):**

```bash
bun DEVOS/Tools/KnowledgeDistill.ts gather --days 7
```

Yields in-window notes (created/updated minus previously surfaced), hot tag clusters (window rate vs archive baseline), seedling and contradiction tallies.

**Shape (model leg).** Cluster candidates into digest items. Bar per item: ≥2 source notes, a why-now line (freshness, cluster growth, or project-goal relevance), a plain-language one-sentence pitch. Three lanes:

- **Content candidates** — post, newsletter-section, or video seeds, weighted toward the operator's stated content aims.
- **System improvements** — anything shaped like a DevOS upgrade.
- **Archive health** — contradiction pairs and seedling counts, reported only; deeper work routes to `contradictions` or `develop`.

**Route.** Content lane (≤5): destination repo and label resolve from `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Cortex/DistillConfig.json` (`contentRepo`, `contentLabel`) — never hardcoded:

```bash
gh issue create --repo <contentRepo> --label <contentLabel> \
  --title "<pitch>" --body "<why-now + source note paths + suggested format>"
```

No config file means digest-listing only, no filing. System lane (≤5; claim-hash dedupe, duplicates exit 0 quietly):

```bash
bun DEVOS/Tools/Upgrades.ts add --claim "<one sentence>" --source autonomous \
  --recommendation "<proposed encoding>" --target <hook|doctrine|rule|skill|settings|context> \
  --evidence "<source note path>"
```

**Close.** Write the digest (lanes as sections; each item: pitch, sources, destination link or "empty — <reason>"), then:

```bash
bun DEVOS/Tools/KnowledgeDistill.ts mark --digest <digest-path>
```

recording surfaced slugs and item hashes in `MEMORY/STATE/distill.json`.

**Unattended.** `bun DEVOS/Tools/KnowledgeDistill.ts run --headless [--dry-run]` runs all four legs without operators (synthesis via `Inference.ts`, never a nested agent session). The weekly scheduler job runs exactly this; `--dry-run` prints the routing plan and writes nothing.

---

## Standing Cautions

- **Four shapes, no more.** People are humans, Companies are organizations, Ideas are theses and analyses, Research is multi-source investigation with methods. Content with no home belongs in the work or learning trees, not the archive.
- **The lookup test.** "Would the operator retrieve this by name?" No — then it isn't archive material.
- **Schema first.** Read `_schema.md` before drafting; each shape has required blocks.
- **Automated capture honors the same schema.** Scheduled and phase-driven writers use identical frontmatter and edges; harvester self-reflection stays off.
- **No silent deletions.** Seedling expiry (the harvester's 90-day sweep) prunes automatically; hand deletion needs operator approval.
- **Link spelling is strict kebab-case.** `[[prompt-injection]]`, never `[[Prompt Injection]]`.
- **Harvests land as seedlings.** Only `develop` promotes.
- **Validity windows are optional.** `valid_from` / `valid_until` bound when a fact held; contradiction scans skip pairs with non-overlapping windows.

## Illustrations

**Archive hunt**
```
User: "what do we know about prompt injection?"
→ search flow — lexical + frontmatter + wikilink sweeps over MEMORY/KNOWLEDGE/
→ tabulated hits with domain, status, tags
```

**Source absorb**
```
User: "/knowledge ingest https://example.com/article"
→ source fetched, domain classified, primary drafted with typed edges
→ ripple table proposed; on approval neighbors updated, maps rebuilt
```

**Health snapshot**
```
User: "knowledge status"
→ harvester status run
→ domain counts, orphan links, stale seedlings, harvest recency
```
