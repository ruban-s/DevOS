---
name: ArXiv
version: 1.0.9
description: "A working channel into arXiv: pull the newest preprints by subject, hunt by theme, or open a single paper by id or URL — with AlphaXiv machine briefs layered on where they exist. Covers cs.AI/cs.LG/cs.CL/cs.CR/cs.MA/cs.SE/cs.IR through the Latest, Search, and Paper flows. USE WHEN arxiv, papers, latest papers, research papers, recent ML papers, paper lookup, summarize paper, latest LLM papers, AI safety papers, cs.AI latest. NOT FOR broad web research (Research), raw URL parsing, or annual reports."
---

# ArXiv

A keyless front door to the arXiv feed, dressed with AlphaXiv machine briefs: watch a field, hunt a theme, or take one paper apart — no accounts, no tokens.

## Announce (optional voice)

On entry, print:

```
Running the **WorkflowName** workflow in the **ArXiv** skill to ACTION...
```

Voice happens only when `DEVOS_PULSE_BASE` is set — the same sentence, POSTed to `$DEVOS_PULSE_BASE/notify` in the background. Unset means text only; continue without further ceremony.

## Three flows

| The ask sounds like | Flow |
|---------------------|------|
| "what's new in X", "latest papers in AI research" | `Workflows/Latest.md` |
| "find papers on X", "search arxiv for X" | `Workflows/Search.md` |
| an arXiv link, an id like `2401.12345`, "explain this paper" | `Workflows/Paper.md` |

## Coverage

Seven subject areas, all under cs: `cs.AI` (artificial intelligence), `cs.LG` (machine learning), `cs.CL` (language and LLMs), `cs.CR` (security and cryptography), `cs.MA` (multi-agent systems), `cs.SE` (software engineering), `cs.IR` (information retrieval). Discovery rides arXiv's Atom feed; per-paper briefs ride AlphaXiv's Markdown endpoints and fall back to the abstract when none exists (a 404 says "not generated yet," nothing worse).

## Why wrap the feed

The raw service works but taxes every caller: thousands of postings a day, Atom XML where JSON would be friendlier, a three-second courtesy pause between requests, field prefixes to memorize, and an update ordering that quietly seats re-edited classics beside genuine debuts. Triaging by opening PDFs is slower still. This skill absorbs the mechanics and puts machine briefs on top, so a relevance call costs seconds instead of a read-through.

## Mechanics

**Feed (no auth):**

- Endpoint: `https://export.arxiv.org/api/query`
- Field prefixes: `ti:` title · `au:` author · `abs:` abstract · `cat:` subject · `all:` everything
- Connectors: `AND`, `OR`, `ANDNOT`
- Freshness ordering: `sortBy=lastUpdatedDate&sortOrder=descending`
- Windowing: `start=0&max_results=10`, 2000 per call at most
- Courtesy gap: ~3s between calls

**Briefs (no auth):**

- Brief: `curl -s "https://alphaxiv.org/overview/{PAPER_ID}.md"`
- Long-form fallback: `curl -s "https://alphaxiv.org/abs/{PAPER_ID}.md"`
- A 404 means no machine brief exists yet — proceed on metadata and abstract

## Runs in practice

**Watching a field**

```
User: "what's new in AI safety this week"
→ Latest flow: subject query ordered by update time, screened on first-published dates
→ Back: titles, authors, abstracts, links
```

**Theme hunt**

```
User: "search arxiv for prompt injection defenses"
→ Search flow: full-text query refined with connectors
→ Back: ranked matches with abstracts
```

**One paper, opened**

```
User: "explain this paper: 2401.12345"
→ Paper flow: metadata plus the AlphaXiv brief, abstract on 404
→ Back: the brief with a PDF link
```

## Handling notes

- The feed **insists on HTTPS** with redirect-following (`-L`); plain HTTP just bounces.
- Answers arrive as **Atom XML** — shape them with text tooling, not a JSON parser.
- Update ordering folds edits in with debuts. For true novelty, read each entry's first-published stamp.
- Briefs are machine-written: fine for triage, but check against the paper itself before citing anything.
- Honor the ~3s gap; batch deliberately.
- `max_results` tops out at 2000 — widen sweeps by windowing with `start`.
- A `cat:` query matches primary and cross-listed placements alike.

## User overrides

Check `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/ArXiv/` before acting. `PREFERENCES.md` and companion configs there win; otherwise this file governs.

## Execution Log

Append one JSONL line per finished flow:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"ArXiv","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Substitute the flow that ran, a short input summary, and elapsed seconds; log `"error"` on failure.
