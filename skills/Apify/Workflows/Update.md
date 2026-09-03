# Update — keep the Apify layer current

Verifies the platform API and the pinned actor set still match reality.

## Announce (optional voice)

```bash
if [ -n "$DEVOS_PULSE_BASE" ]; then
  curl -s -X POST "$DEVOS_PULSE_BASE/notify" \
    -H "Content-Type: application/json" \
    -d '{"message": "Running the Update workflow in the Apify skill to check updates"}' \
    > /dev/null 2>&1 &
fi
```

Print: `Running **Update** in **Apify**...`

---

## Occasions

- Scheduled monthly capability pass
- Platform announces new surface
- Pinned actor calls start failing without local cause
- A newly popular actor deserves evaluation

## Canonical sources

- API Docs: https://docs.apify.com/api/v2
- Changelog: https://docs.apify.com/api/v2/changelog
- Actor Store: https://apify.com/store

## Pass

### 1. Read the platform changelog

```bash
open https://docs.apify.com/api/v2/changelog
```

Note new endpoints, breaking revisions, retirements, and quota adjustments.

### 2. Re-check the relied-upon actors

| Actor | Role | Watch for |
|-------|------|-----------|
| apify/instagram-scraper | Instagram posts and profiles | Output schema drift |
| apify/twitter-scraper | Twitter/X rows | Platform-side breakage |
| apify/google-maps-scraper | Business rows | Added or renamed fields |
| apify/web-scraper | Generic crawl | New run options |

### 3. Exercise the local layer

```bash
bun run ../scrape-instagram.ts --help 2>/dev/null || echo "Check script"
```

A clean help render plus one small pull confirms the wrapper chain.

### 4. Fold in what changed

When genuinely new surface appears:

1. Extend the `index.ts` platform wrapper
2. Add the actor script under the skill
3. Refresh the type declarations
4. Bring `SKILL.md` prose level with the code

### 5. Refresh the tested-actor ledger

| Actor | Last Tested | Status |
|-------|-------------|--------|
| instagram-scraper | 2026-01 | Working |
| twitter-scraper | 2026-01 | Working |
| google-maps | 2026-01 | Working |

## Ledger footer

```
# Last sync: 2026-01-03
# Apify API: v2
# Tested actors: 10+
# Known issues: None
```
