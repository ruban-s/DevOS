---
name: Apify
version: 1.1.22
description: "Collects social, business, and storefront data through hosted Apify actors — Instagram, LinkedIn, TikTok, YouTube, Facebook, Google Maps, Amazon, plus general web crawls — with in-code filtering. USE WHEN scrape Instagram, scrape LinkedIn, scrape TikTok, scrape YouTube, scrape Facebook, Google Maps leads, Amazon reviews, business intelligence, multi-platform social listening, competitive analysis, lead generation, social monitoring, Apify actors, web crawl, extract contacts. NOT FOR X/Twitter posting, threads, or bookmarks (those need a dedicated X API client), 4-tier progressive scraping with proxy escalation (use BrightData), or real-Chrome bot bypass and computer use (use Interceptor)."
---

# Apify — hosted actors with code-first filtering

A code-first scraping layer over the Apify platform: invoke a named actor wrapper, trim and reshape the payload in TypeScript, and hand only the kept slice to the model.

## Announce (optional voice)

When this skill starts work, print:

```
Running the **WorkflowName** workflow in the **Apify** skill to ACTION...
```

Spoken notification is gated: only when `DEVOS_PULSE_BASE` is set (Pulse v2), fire-and-forget a POST to `$DEVOS_PULSE_BASE/notify` with the same sentence. Unset means silent — proceed without voice.

## Why filtering belongs in code

Unfiltered scrapes flood context. A hundred-post profile can cost tens of thousands of tokens, nearly all of it destined for the bin — the operator usually wants the ten best posts, the week's negative reviews, the leads carrying contact details. Trimming after the payload reaches the model pays full price; trimming inside the wrapper pays for the kept slice only. That placement is the source of the 90–99% savings cited throughout.

## How the layer is organized

Not a protocol integration but a file-based one. Actor wrappers live under `actors/`; each hardcodes its actor identity, runs it, and returns typed data the caller filters, sorts, and slices. Cross-platform listening runs wrappers concurrently; enrichment chains them (Maps results feeding follow-up lookups).

## Catalog

### Social (five networks)

- **Instagram** — profiles, posts, hashtags, comments
- **LinkedIn** — profiles, jobs, posts
- **TikTok** — profiles, videos, hashtags, comments
- **YouTube** — channels, videos, comments, search
- **Facebook** — page posts, group posts, comments

### Places and storefronts

- **Google Maps** — business search with contact, review, and image extraction; the usual lead-generation entry point
- **Amazon** — product detail, reviews, pricing

### Open web

- **Web Scraper** — configurable crawl over arbitrary sites

## Routing

| Call | File |
|------|------|
| update Apify skill, refresh actors, actor calls failing unexpectedly, monthly capability check | `Workflows/Update.md` |
| any scrape, lead, or crawl ask — Instagram/LinkedIn/TikTok/YouTube/Facebook, Maps leads, Amazon reviews, site crawl | Actor wrappers under `actors/` (function index below) |

## Minimal shape

```typescript
import { scrapeInstagramProfile, searchGoogleMaps } from 'actors'

// Run the hosted actor
const profile = await scrapeInstagramProfile({
  username: 'target_username',
  maxPosts: 50
})

// Keep only what matters — before the model ever sees it
const viral = profile.latestPosts?.filter(p => p.likesCount > 10000)

console.log(viral) // a handful of posts, not fifty
```

## Everyday recipes

### Watching social engagement

**Instagram — recent standouts:**

```typescript
import { scrapeInstagramProfile, scrapeInstagramPosts } from 'actors'

const profile = await scrapeInstagramProfile({
  username: 'competitor',
  maxPosts: 100
})

const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
const topRecent = profile.latestPosts
  ?.filter(p =>
    new Date(p.timestamp).getTime() > thirtyDaysAgo &&
    p.likesCount > 5000
  )
  .sort((a, b) => b.likesCount - a.likesCount)
  .slice(0, 10)
```

**LinkedIn — role hunt:**

```typescript
import { searchLinkedInJobs } from 'actors'

const jobs = await searchLinkedInJobs({
  keywords: 'AI engineer',
  location: 'San Francisco',
  remote: true,
  maxResults: 200
})

const topJobs = jobs.filter(j =>
  j.seniority?.includes('Senior') &&
  parseInt(j.applicants || '0') > 50
)
```

**TikTok — breakout clips:**

```typescript
import { scrapeTikTokHashtag } from 'actors'

const videos = await scrapeTikTokHashtag({
  hashtag: 'ai',
  maxResults: 500
})

const viral = videos
  .filter(v => v.playCount > 1000000)
  .sort((a, b) => b.playCount - a.playCount)
  .slice(0, 20)
```

### Building lead lists

**Maps — qualified local leads:**

```typescript
import { searchGoogleMaps } from 'actors'

const places = await searchGoogleMaps({
  query: 'restaurants in Austin',
  maxResults: 500,
  includeReviews: true,
  maxReviewsPerPlace: 20,
  scrapeContactInfo: true
})

const qualifiedLeads = places
  .filter(p =>
    p.rating >= 4.5 &&
    p.reviewsCount >= 100 &&
    (p.email || p.phone)
  )
  .map(p => ({
    name: p.name,
    rating: p.rating,
    reviews: p.reviewsCount,
    email: p.email,
    phone: p.phone,
    website: p.website,
    address: p.address
  }))

console.log(`Found ${qualifiedLeads.length} qualified leads`)
```

**Maps — recent complaints:**

```typescript
import { scrapeGoogleMapsReviews } from 'actors'

const reviews = await scrapeGoogleMapsReviews({
  placeUrl: 'https://maps.google.com/maps?cid=12345',
  maxResults: 1000
})

const recentNegative = reviews
  .filter(r => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    return (
      r.rating <= 2 &&
      new Date(r.publishedAtDate).getTime() > thirtyDaysAgo &&
      r.text.length > 50
    )
  })

const complaints = recentNegative.map(r => r.text)
```

### Reading storefronts and the open web

**Amazon — price plus recent pain:**

```typescript
import { scrapeAmazonProduct } from 'actors'

const product = await scrapeAmazonProduct({
  productUrl: 'https://www.amazon.com/dp/B08L5VT894',
  includeReviews: true,
  maxReviews: 200
})

const recentNegative = product.reviews
  ?.filter(r => {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    return (
      r.rating <= 2 &&
      new Date(r.date).getTime() > weekAgo
    )
  })

console.log(`Price: $${product.price}`)
console.log(`Rating: ${product.rating}/5`)
console.log(`Recent issues: ${recentNegative?.length} complaints`)
```

**Arbitrary site — shaped extraction:**

```typescript
import { scrapeWebsite } from 'actors'

const products = await scrapeWebsite({
  startUrls: ['https://example.com/products'],
  linkSelector: 'a.product-link',
  maxPagesPerCrawl: 100,
  pageFunction: `
    async function pageFunction(context) {
      const { request, $, log } = context

      return {
        url: request.url,
        title: $('h1.product-title').text(),
        price: $('span.price').text(),
        inStock: $('.in-stock').length > 0,
        description: $('.description').text()
      }
    }
  `
})

const affordable = products.filter(p =>
  p.inStock &&
  parseFloat(p.price.replace('$', '')) < 100
)
```

## Composition plays

**Parallel listening across networks:**

```typescript
import {
  scrapeInstagramHashtag,
  scrapeTikTokHashtag,
  searchYouTube
} from 'actors'

const [instagramPosts, tiktokVideos, youtubeVideos] = await Promise.all([
  scrapeInstagramHashtag({ hashtag: 'ai', maxResults: 100 }),
  scrapeTikTokHashtag({ hashtag: 'ai', maxResults: 100 }),
  searchYouTube({ query: '#ai', maxResults: 100 })
])

const allViral = [
  ...instagramPosts.filter(p => p.likesCount > 10000),
  ...tiktokVideos.filter(v => v.playCount > 100000),
  ...youtubeVideos.filter(v => v.viewsCount > 50000)
]

console.log(`Found ${allViral.length} viral posts across 3 platforms`)
```

**Maps-to-profile enrichment:**

```typescript
import { searchGoogleMaps, scrapeLinkedInProfile } from 'actors'

const restaurants = await searchGoogleMaps({
  query: 'restaurants in SF',
  maxResults: 100,
  scrapeContactInfo: true
})

const qualified = restaurants.filter(r =>
  r.rating >= 4.5 &&
  r.email &&
  r.reviewsCount >= 50
)

const enriched = await Promise.all(
  qualified.map(async (restaurant) => {
    return restaurant
  })
)
```

**Competitor dashboard:**

```typescript
import {
  scrapeInstagramProfile,
  scrapeYouTubeChannel,
  scrapeTikTokProfile
} from 'actors'

async function analyzeCompetitor(username: string) {
  const [instagram, youtube, tiktok] = await Promise.all([
    scrapeInstagramProfile({ username, maxPosts: 30 }),
    scrapeYouTubeChannel({ channelUrl: `https://youtube.com/@${username}`, maxVideos: 30 }),
    scrapeTikTokProfile({ username, maxVideos: 30 })
  ])

  return {
    username,
    instagram: {
      followers: instagram.followersCount,
      avgLikes: average(instagram.latestPosts?.map(p => p.likesCount) || []),
      engagementRate: calculateEngagement(instagram)
    },
    youtube: {
      subscribers: youtube.subscribersCount,
      avgViews: average(youtube.videos?.map(v => v.viewsCount) || [])
    },
    tiktok: {
      followers: tiktok.followersCount,
      avgPlays: average(tiktok.videos?.map(v => v.playCount) || [])
    }
  }
}
```

## Cost arithmetic

A hundred-post profile through a raw protocol round-trip (search, call, unfiltered fetch) runs on the order of fifty thousand tokens. The same pull through a wrapper that keeps ten posts lands in the hundreds. Same source data; the difference is purely where the filter sits.

```typescript
const profile = await scrapeInstagramProfile({
  username: 'user',
  maxPosts: 100
})

const top = profile.latestPosts
  ?.sort((a, b) => b.likesCount - a.likesCount)
  .slice(0, 10)

// ~500 tokens reach the model instead of ~52,000
```

## Function index

### Instagram

- `scrapeInstagramProfile(input)` — profile plus posts
- `scrapeInstagramPosts(input)` — posts by user
- `scrapeInstagramHashtag(input)` — posts by hashtag
- `scrapeInstagramComments(input)` — comments on a post

### LinkedIn

- `scrapeLinkedInProfile(input)` — profile, experience, email
- `searchLinkedInJobs(input)` — job listings
- `scrapeLinkedInPosts(input)` — posts by profile or company

### TikTok

- `scrapeTikTokProfile(input)` — profile plus videos
- `scrapeTikTokHashtag(input)` — videos by hashtag
- `scrapeTikTokComments(input)` — comments on a video

### YouTube

- `scrapeYouTubeChannel(input)` — channel plus videos
- `searchYouTube(input)` — video search
- `scrapeYouTubeComments(input)` — comments on a video

### Facebook

- `scrapeFacebookPosts(input)` — page posts
- `scrapeFacebookGroups(input)` — group posts
- `scrapeFacebookComments(input)` — post comments

### Google Maps

- `searchGoogleMaps(input)` — place search with contact extraction
- `scrapeGoogleMapsPlace(input)` — single place detail
- `scrapeGoogleMapsReviews(input)` — place reviews

### Amazon

- `scrapeAmazonProduct(input)` — product detail plus reviews
- `scrapeAmazonReviews(input)` — reviews only

### General web

- `scrapeWebsite(input)` — multi-page crawl with custom extraction
- `scrapePage(url, pageFunction)` — single-page extraction

## Setup

Required token from https://console.apify.com/account/integrations:

```bash
APIFY_TOKEN=apify_api_xxxxx...
```

Per-run actor options:

```typescript
{
  memory: 2048,
  timeout: 300,
  build: 'latest'
}
```

## File layer versus protocol calls

**Prefer these wrappers when:** result sets exceed ~100 rows, aggregation or reshaping belongs in code, several dependent steps chain, branching logic applies, or token frugality dominates.

**Prefer raw protocol calls when:** the ask is a single small lookup, exploration is one-off, or no code should be written.

## Cautions

- **Match actor to platform.** Dedicated social actors beat generic crawlers on their home networks.
- **Respect plan limits.** Quotas differ by network and tier; confirm before queuing bulk pulls.
- **Read each actor's schema.** Output shapes vary; check field names before filtering.

## Illustrations

**Example 1 — profile pull**

```
User: "get the recent posts from this Instagram account"
→ Instagram Profile actor with the profile URL
→ Structured posts (text, engagement, dates)
```

**Example 2 — company page**

```
User: "scrape this company's LinkedIn page"
→ LinkedIn Company actor
→ Company facts, headcount, recent posts
```

## References

- Apify Platform: https://apify.com
- Actor Store: https://apify.com/store
- API Docs: https://docs.apify.com/api/v2

**Standing rule: narrow the dataset in code before it enters model context — that ordering is the savings.**

## User overrides

Check `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Apify/` first. `PREFERENCES.md` and sibling configs there override these defaults. Otherwise proceed as written.

## Execution Log

One JSONL line per completed workflow:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Apify","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Fill `WORKFLOW_USED`, a brief input summary, and elapsed seconds; mark `status: "error"` on failure.
