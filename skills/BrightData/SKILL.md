---
name: BrightData
version: 1.2.20
description: "Pulls resistant web pages by escalating through four rungs — plain fetch, curl in browser dress, real-Chrome render, then metered Bright Data proxy — in single-page and whole-site modes, everything returned as Markdown. USE WHEN Bright Data, scrape URL, web scraping, bot detection, crawl site, CAPTCHA, can't access, site blocking, extract page content, scrape whole site, spider domain, convert URL to markdown, getting blocked. NOT FOR straightforward public pages (use WebFetch directly), named social-platform pulls (use Apify), or logged-in real-Chrome sessions with computer use (use Interceptor)."
---

# BrightData — escalate only as far as the block forces

Two doors in: one URL rendered to Markdown (`FourTierScrape`), or a site section walked page by page (`Crawl`). Both climb the same ladder one rung at a time and stop at the first rung that yields — leading with the metered proxy on an easy page just burns credits.

## Announce (optional voice)

Print on routing:

```
Running the **WorkflowName** workflow in the **BrightData** skill to ACTION...
```

Voice fires only when `DEVOS_PULSE_BASE` is set — a background POST to `$DEVOS_PULSE_BASE/notify`. Otherwise proceed silently.

## The ladder (standing contract)

| Rung | Instrument | Clears | Price / pace |
|------|------------|--------|--------------|
| 1 | WebFetch | open pages, no countermeasures | free · ~2–5s |
| 2 | curl with browser headers | agent and header screens | free · ~3–7s |
| 3 | Interceptor (real Chrome) | script-rendered and app-shell pages | free · ~10–20s |
| 4 | Bright Data `mcp__Brightdata__scrape_as_markdown` | CAPTCHAs, fingerprinting, residential-IP demands | metered credits · ~5–15s |

A Cloudflare Markdown-negotiation probe runs ahead of rung 1 (recipe in `Workflows/FourTierScrape.md`). Scripted render engines other than Interceptor are out of scope — rung 3 means Interceptor. Fast-paths: an explicit "use Bright Data" enters at rung 4; "use [a] browser" enters at rung 3; a domain with a known rung-1 failure starts at rung 2. Header blocks, the probe, and Interceptor invocations are spelled out in `Workflows/FourTierScrape.md`.

## Routing

| Ask shape | Flow | File |
|-----------|------|------|
| "scrape / fetch / pull / get [URL]", "can't access this site", "site is blocking me", "use Bright Data to fetch" | FourTierScrape | `Workflows/FourTierScrape.md` |
| "crawl this site", "spider this domain", "map this website", "get all pages from", "scrape the whole site", "crawl all pages under /docs" | Crawl | `Workflows/Crawl.md` |

The crawl flow forks by size: Light Crawl (batched MCP scraping plus link-following, up to ~50 pages, roughly $0.006/page) for sections; Full Crawl (Bright Data Crawl API at `api.brightdata.com/datasets/v3/trigger`, $1.50 per 1K pages) for whole estates.

## Handling notes

- **Climb in order — fetch, dressed curl, real Chrome, proxied retrieval — and escalate on evidence, never habit.**
- **Metered rungs spend real credits.** Rung 4 is for pages the free rungs demonstrably cannot take.
- **Challenge-solving adds latency.** Budget extra wall time at rung 4.
- **Keys stay outside the repo** — `BRIGHTDATA_API_KEY` in the shell environment (conventionally `~/.claude/.env`).

## User overrides

Inspect `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/BrightData/` before acting. `PREFERENCES.md` and sibling configs there win; otherwise follow this file.

## Execution Log

One JSONL line per finished flow:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"BrightData","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Swap in the flow name, a short input summary, and elapsed seconds; mark `status: "error"` when a run fails.
