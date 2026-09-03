# Apify Code-First API

A programmatic front for the Apify platform that keeps bulk filtering in TypeScript, out of model context.

## Starting shape

```typescript
import { Apify } from 'DEVOS/skills/Apify'

const apify = new Apify(process.env.APIFY_TOKEN)

// Locate an actor
const actors = await apify.search("instagram scraper")

// Run it
const run = await apify.callActor(actors[0].id, {
  profiles: ["target"],
  resultsLimit: 100
})

// Read the dataset and narrow it in code
const dataset = await apify.getDataset(run.defaultDatasetId)
const items = await dataset.listItems()

const relevant = items
  .filter(item => item.likesCount > 1000)
  .filter(item => item.timestamp > Date.now() - 86400000)
  .slice(0, 10)

console.log(relevant) // ten kept rows, not a hundred raw ones
```

## Rationale

A protocol round-trip (locate actor, invoke, fetch full output) can spend tens of thousands of tokens on rows the operator will discard. Running the same three steps in code and slicing before returning keeps the model-side cost near a thousand tokens — roughly a 98% reduction on typical social pulls.

## Client surface

### Apify

Primary handle on the platform.

```typescript
new Apify(token?: string)
```

Falls back to `process.env.APIFY_TOKEN` when no token is passed.

#### `search(query, options?)`

Finds actors by keyword.

```typescript
const actors = await apify.search("instagram scraper", {
  limit: 10,
  offset: 0
})
```

Takes a keyword string plus optional `limit` (default 10) and `offset` (default 0). Returns actor records carrying id, name, title, description, and usage stats.

#### `callActor(actorId, input, options?)`

Starts an actor run.

```typescript
const run = await apify.callActor("apify/instagram-scraper", {
  profiles: ["target"],
  resultsLimit: 100
}, {
  memory: 2048,
  timeout: 300
})
```

Takes an actor id (`username/name` form accepted), the actor's input object, and optional `memory` (128 through 8192 MB), `timeout` (seconds), and `build` (number or tag). Returns the run record including `defaultDatasetId`.

#### `getDataset(datasetId)`

Opens a dataset handle for reading and narrowing.

```typescript
const dataset = await apify.getDataset(run.defaultDatasetId)
```

Returns an `ApifyDataset`.

#### `getRun(actorId, runId)`

Reads a run's current status.

```typescript
const run = await apify.getRun(actorId, runId)
```

#### `waitForRun(actorId, runId, options?)`

Blocks until the run settles.

```typescript
const finalRun = await apify.waitForRun(actorId, runId, {
  waitSecs: 120
})
```

Returns the terminal run record.

### ApifyDataset

Reading end of a run. The standing rule: narrow here, before model context.

#### `listItems(options?)`

Paginated row access.

```typescript
const items = await dataset.listItems({
  offset: 0,
  limit: 100,
  fields: ['username', 'likesCount', 'text']
})
```

Supports `offset`, `limit`, `fields` (allowlist), `omit` (denylist), and `clean` (strip markup). Returns the requested rows.

#### `getAllItems()`

Drains the dataset with automatic pagination. Prefer `listItems` with a bound for large runs.

```typescript
const allItems = await dataset.getAllItems()
const filtered = allItems.filter(item => item.score > 0.8)
```

#### `filter(predicate)`

Keeps rows matching a test.

```typescript
const relevant = await dataset.filter(item =>
  item.likesCount > 1000 &&
  item.timestamp > Date.now() - 86400000
)
```

#### `top(sortFn, limit)`

Returns the leading N rows under an ordering.

```typescript
const topPosts = await dataset.top(
  (a, b) => b.likesCount - a.likesCount,
  10
)
```

## Recurring compositions

### Locate, run, then narrow

```typescript
const actors = await apify.search("web scraper")
const actor = actors[0]

const run = await apify.callActor(actor.id, {
  startUrls: ["https://example.com"],
  maxPages: 50
})

await apify.waitForRun(actor.id, run.id)

const dataset = apify.getDataset(run.defaultDatasetId)
const items = await dataset.listItems({ limit: 100 })

const relevant = items
  .filter(item => item.price < 100)
  .filter(item => item.inStock)
  .slice(0, 10)
```

### Drain a large dataset in batches

```typescript
const dataset = apify.getDataset(datasetId)

let offset = 0
const limit = 1000
const results = []

while (true) {
  const batch = await dataset.listItems({ offset, limit })
  if (batch.length === 0) break

  const filtered = batch.filter(item => item.relevant === true)
  results.push(...filtered)

  offset += limit
}

console.log(results)
```

### Keep only the head of a ranking

```typescript
const dataset = apify.getDataset(datasetId)

const topPosts = await dataset.top(
  (a, b) => b.likesCount - a.likesCount,
  10
)

console.log(topPosts)
```

## Environment

```bash
APIFY_TOKEN=apify_api_xxxxx...

APIFY_API_BASE_URL=https://api.apify.com/v2
```

The base URL is optional. Tokens come from https://console.apify.com/account/integrations.

## Types

Shared shapes export from the package root:

```typescript
import { Actor, ActorRun, DatasetOptions } from 'DEVOS/skills/Apify'
```

## Failure handling

```typescript
try {
  const run = await apify.callActor(actorId, input)
  await apify.waitForRun(actorId, run.id)

  const finalRun = await apify.getRun(actorId, run.id)

  if (finalRun.status !== 'SUCCEEDED') {
    console.error('Actor run failed:', finalRun.status)
    return
  }
} catch (error) {
  console.error('Apify error:', error.message)
}
```

## Trying the examples

```bash
cd DEVOS/skills/Apify
bun run examples/instagram-scraper.ts

bun examples/instagram-scraper.ts
```

## Sizing the savings

```typescript
function estimateTokens(data: any): number {
  const str = JSON.stringify(data)
  return Math.ceil(str.length / 4)
}

const allItems = await dataset.getAllItems()
console.log('Protocol tokens:', estimateTokens(allItems))

const filtered = allItems.filter(...).slice(0, 10)
console.log('Code-first tokens:', estimateTokens(filtered))
```

Expect order-of-magnitude drops (illustrative 50,000 → 500) wherever bulk rows narrow to a kept head.

## Which layer for which ask

**Reach for this code layer when:** narrowing or reshaping bulk results, keeping a top-N from 100+ rows, chaining locate-run-narrow steps, branching on values, or keeping sensitive rows out of context.

**Reach for raw protocol calls when:** the ask is one small lookup, exploration is throwaway, or a wrapper would be ceremony.

## Links

- Apify Platform: https://apify.com
- Apify Console: https://console.apify.com
- Actor Store: https://apify.com/store
- API Docs: https://docs.apify.com/api/v2
- Parent README: `~/.claude/`
