# FourTierScrape — one URL to Markdown

## Announce (optional voice)

```bash
if [ -n "$DEVOS_PULSE_BASE" ]; then
  curl -s -X POST "$DEVOS_PULSE_BASE/notify" \
    -H "Content-Type: application/json" \
    -d '{"message": "Running the FourTierScrape workflow in the BrightData skill to scrape URL content"}' \
    > /dev/null 2>&1 &
fi
```

Print: `Running **FourTierScrape** in **BrightData**...`

---

**Yield:** the page's readable body as Markdown, tagged with the rung that produced it. Ascend until something works — the first succeeding rung is the answer. Rung costs live in `SKILL.md`.

## Gate: Cloudflare Markdown probe

Ahead of the ladder, test for server-rendered Markdown via Cloudflare's Markdown-for-Agents convention. Non-Cloudflare origins ignore the header and answer HTML — harmless.

```bash
curl -sL -H "Accept: text/markdown" "[URL]" | head -5
```

**Markdown confirmed (any signal) → take the body as-is, skip the ladder:**

1. Response `Content-Type` mentions `text/markdown`
2. An `x-markdown-tokens` header arrives (retain it as token-count metadata)
3. The body opens with YAML frontmatter (`---`) or a Markdown heading (`# `) rather than `<!DOCTYPE` / `<html` — the CDN occasionally labels Markdown bodies as `text/html`

Server Markdown costs ~1–3s, nothing metered, and roughly 80% fewer tokens than HTML conversion. HTML or an error proceeds to rung 1.

## Rung 1 — direct fetch

Fetch the URL via WebFetch with an instruction to extract the full body as Markdown. Readable output ends the climb; blocks or timeouts ascend.

## Rung 2 — header-dressed curl

The `Sec-Fetch-*` set does the heavy lifting against naive screens; `--compressed` answers gzip/br like a browser.

```bash
curl -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: text/markdown, text/html;q=0.9, application/xhtml+xml;q=0.8, */*;q=0.7" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "DNT: 1" \
  -H "Connection: keep-alive" \
  -H "Upgrade-Insecure-Requests: 1" \
  -H "Sec-Fetch-Dest: document" \
  -H "Sec-Fetch-Mode: navigate" \
  -H "Sec-Fetch-Site: none" \
  -H "Sec-Fetch-User: ?1" \
  -H "Cache-Control: max-age=0" \
  --compressed \
  "[URL]"
```

Returned HTML converts to Markdown and ends the climb. Empty, blocked, or script-required output ascends.

## Rung 3 — Interceptor real-Chrome render

Covers script-executed and session-sensitive pages with a genuine browser fingerprint. Scripted headless frameworks are out of scope here.

```bash
interceptor open "<url>"        # renders JS, returns tree + flat text
interceptor read --text-only    # extract rendered text
```

Rendered text converts to Markdown and ends the climb. CAPTCHAs or hardened fingerprinting ascend.

## Rung 4 — Bright Data proxied retrieval

Residential egress plus automatic challenge handling plus headless render. Final resort — metered.

```
mcp__Brightdata__scrape_as_markdown  with URL: [user-provided URL]
```

Success ends the climb. Failure at this rung is unusual and diagnostic: the origin is down, login-walled, paywalled, or geo-fenced — report that plainly with the URL for the caller to verify.

## Yield mold

Lead with provenance (plus a one-line escalation reason at rungs 3–4), then the body. Confirm readability, URL correspondence, and absence of gutted sections.

```markdown
Successfully retrieved content from [URL] using Tier [1/2/3/4]

[Content in markdown format...]
```

## Kin

- `Crawl.md` — multi-page sweeps (leans on this flow for its seed URL and as per-page fallback).
