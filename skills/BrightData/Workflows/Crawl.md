# Crawl — sweep a site section or estate

**Yield:** linked pages walked, bodies extracted, results returned as a structured bundle. Two gears: **Light Crawl** (operator-driven batched scraping) and **Full Crawl** (Bright Data Crawl API for whole estates).

---

## What to bring

- Seed URL (required)
- Sweep bounds: a path prefix, a depth ceiling, or the whole estate
- Preferred body shape (markdown, HTML, JSON)
- Full Crawl additionally needs the Bright Data key in the environment

---

## Choosing the gear

| Gear | Span | Mechanism | Price | Suits |
|------|------|-----------|-------|-------|
| **Light Crawl** | 1–50 pages | MCP `scrape_batch` plus link-following loop | ~$0.006/page | one section, bounded content |
| **Full Crawl** | 50+ pages | Bright Data Crawl API over HTTP | $1.50/1K pages | maps, exhaustive extraction |

**Reading the ask:**

- "crawl this section", "all pages under /docs" → **Light Crawl**
- "the entire site", "map the whole estate" → **Full Crawl**
- Bare "crawl it" → ask for page count or section bounds, then choose

---

## Light Crawl (operator-driven)

Bathed scraping via MCP `scrape_batch` (ten URLs per call ceiling) with iterative discovery.

### Pass 1 — seed and harvest links

Take the seed URL through the FourTierScrape flow. Pull every internal anchor from the returned body.

```
Scrape seed → collect <a href="…"> targets → keep same-origin only
```

**Harvest rules:** same origin unless the caller asked outward; honor a caller-supplied path prefix (e.g. `/docs/` only); normalize (trailing slashes, query strings) and dedupe; skip fragments (`#`), `mailto:`, `tel:`, `javascript:`, and static assets (`.css`, `.js`, `.png`, `.jpg`, `.svg`, `.pdf`).

### Pass 2 — sweep in batches

Fetch discovered targets in groups of up to ten via `mcp__Brightdata__scrape_as_markdown` or `scrape_batch`:

```
For each batch of ≤10 unvisited URLs:
  1. Invoke scrape_batch
  2. Harvest fresh internal links from the returns
  3. Enqueue unseen links
  4. Accumulate page bodies
  5. Halt on: empty queue, page budget spent, or depth ceiling hit
```

**Depth accounting:** seed is depth 0; its outbound links depth 1; their outbound links depth 2. Default ceiling 3, caller-overridable.

**Page budget:** default 30; caller may raise ("up to 100 pages"); hard ceiling 50 per Light Crawl for cost and time containment.

### Pass 3 — bundle the returns

```markdown
## Crawl Results: [domain]
**Pages crawled:** [N]
**Depth reached:** [N]
**Starting URL:** [URL]

### Site Map
- [URL 1] (depth 0)
  - [URL 2] (depth 1)
  - [URL 3] (depth 1)
    - [URL 4] (depth 2)

### Page Contents

#### [URL 1]
[markdown content]

#### [URL 2]
[markdown content]
...
```

### Light Crawl fault handling

- A page exhausting all four rungs logs as failed; the sweep continues.
- Over half failing → warn and propose Full Crawl.
- Throttling observed → two-second pause between batches.

---

## Full Crawl (Crawl API)

Bulk extraction through Bright Data's dedicated crawl endpoint over HTTP.

### Pass 1 — launch

Shape the trigger call to the caller's bounds:

```bash
curl -X POST "https://api.brightdata.com/datasets/v3/trigger?dataset_id=CRAWL_DATASET_ID&format=json" \
  -H "Authorization: Bearer ${BRIGHT_DATA_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '[{
    "url": "[STARTING_URL]",
    "crawl_depth": [DEPTH],
    "url_filter": "[REGEX_PATTERN]",
    "format": "markdown"
  }]'
```

**Controls:** `url` (seed), `crawl_depth` (hop count, default 3), `url_filter` (scope regex, e.g. `"https://example\\.com/docs/.*"`), `format` (`markdown`, `html`, `json`, `ld_json`), `include_errors` (`true` for per-page diagnostics).

### Pass 2 — track

The trigger returns a `snapshot_id`. Poll it:

```bash
curl -X GET "https://api.brightdata.com/datasets/v3/progress/${SNAPSHOT_ID}" \
  -H "Authorization: Bearer ${BRIGHT_DATA_API_KEY}"
```

States: `running`, `ready`, `failed`. Poll roughly every ten seconds (five minutes' patience for small estates, fifteen for large), narrating progress: "crawl running… N pages banked".

### Pass 3 — collect

On `ready`:

```bash
curl -X GET "https://api.brightdata.com/datasets/v3/snapshot/${SNAPSHOT_ID}?format=json" \
  -H "Authorization: Bearer ${BRIGHT_DATA_API_KEY}"
```

Each element pairs a URL with its extracted body.

### Pass 4 — bundle the returns

Light Crawl's bundle shape, plus page total, cost estimate ($1.50/1K pages), error rollup, and a URL-derived map.

### Full Crawl fault handling

- Auth rejection → re-check `BRIGHT_DATA_API_KEY`.
- Poll timeout → offer a longer watch or a bounded Light Crawl.
- Partial return → deliver the banked pages with the failed URLs enumerated.

---

## Closing bundle (both gears)

1. Hierarchical map of walked URLs
2. Per-page bodies in the requested shape
3. Totals — pages, depth, elapsed time, spend
4. Quality flags — empty or error bodies called out
5. Export offer — file write when the bundle is large

---

## Spend guide

| Sweep | Spend | Wall time |
|-------|-------|-----------|
| Light, 10 pages | ~$0.06 | 30–60s |
| Light, 30 pages | ~$0.18 | 1–3 min |
| Light, 50 pages | ~$0.30 | 2–5 min |
| Full, 100 pages | ~$0.15 | 1–3 min |
| Full, 1000 pages | ~$1.50 | 5–15 min |
| Full, 10K pages | ~$15.00 | 15–60 min |

**Confirm first:** Light sweeps past 20 pages; any Full Crawl (metered API spend).

---

## Samples

- Section sweep: "all pages under docs.example.com/api/" → Light, prefix filter `/api/`, depth 3, budget 30.
- Estate sweep: "the whole of smallbusiness.com" → Full, cost confirmed first, depth 3, no filter.
- Scoped competitive read: "competitor.com's product pages" → Full, filter `"https://competitor\\.com/products/.*"`, depth 2.

---

## Kin

- **FourTierScrape.md** — single-URL extraction (seeds Light Crawl and backs per-page fallback).
