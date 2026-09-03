# Apify cross-skill usage

**Maturity:** ready for daily use.
**Typical savings:** 90–98% versus protocol-style pulls.
**Typical wall time:** around ten seconds.

## How sibling skills call it

### Social-style pulls

Fetching recent posts for a handle now goes through a small script rather than a protocol tool.

**Ask-to-script shape:**

| User phrasing | Command to run |
|---------------|----------------|
| "get tweets from @user" | `skills/get-user-tweets.ts user 5` |
| "what has @user been talking about" | `skills/get-user-tweets.ts user 10` |

**Walkthrough:**

1. User: "Turn @user's recent posts into a LinkedIn post"
2. Operator runs: `bun DEVOS/skills/Apify/skills/get-user-tweets.ts user 5`
3. Script returns post text plus metadata (roughly 800 tokens per post)
4. Operator reshapes the kept posts into LinkedIn form
5. **Observed savings: 90–95%** against unfiltered profile fetches

### Research-style monitoring

Watching a handful of technical voices:

```bash
bun DEVOS/skills/Apify/skills/get-user-tweets.ts ThePrimeagen 10

bun DEVOS/skills/Apify/skills/get-user-tweets.ts paulg 20

bun DEVOS/skills/Apify/skills/get-user-tweets.ts simonw 15
```

Cost contrast: ten unfiltered posts near eighty thousand tokens; ten filtered posts near eight thousand — **about 90% saved**.

### Writing-style expansion

Turning recent posts into longer-form drafts:

```bash
bun DEVOS/skills/Apify/skills/get-user-tweets.ts <username> 10
```

Only the kept post bodies enter context before expansion.

## Script inventory

### skills/get-user-tweets.ts

Fetches one handle's recent posts.
Run: `bun DEVOS/skills/Apify/skills/get-user-tweets.ts <username> [limit]`.
Yields recent posts with metadata at roughly 800 tokens each — about 90–95% below unfiltered cost.

While authoring a new wrapper, print the raw dataset rows ahead of the narrowing step to inspect the actor's true shape; keep that inspection local rather than shipping a separate debug entry point.

## Protocol shape versus code shape

### Protocol round-trip

```typescript
mcp__Apify__search-actors("twitter scraper")

mcp__Apify__call-actor(actorId, input)

mcp__Apify__get-actor-output(runId)

// Illustrative total: ~57,000 tokens
```

### Equivalent script call

```typescript
bun DEVOS/skills/Apify/skills/get-user-tweets.ts <username> 1

// Kept result only: ~800 tokens — about 98% below
```

## Operating habits

**Do:** pick the script matching the ask; let the script narrow before returning; trust the reported savings; invoke from `DEVOS/skills/Apify/` or by full path; expect roughly ten seconds.

**Don't:** retreat to protocol tools for these pulls; admit unfiltered payloads into context; reimplement narrowing the scripts already perform; bypass their error paths; disregard the token figures they print.

## Budgets to expect

**Wall time:** actor lookup eliminated via pinned ids; platform run near ten seconds; in-code narrowing under a second — **about ten seconds end to end**.

**Tokens:** one post near 500 (versus ~57,000 unfiltered); five-post thread near 5,500 (versus ~60,000); ten posts near 8,000 (versus ~80,000).

**Quotas:** free tier around a hundred actor runs daily; paid tiers unmetered; current use sits comfortably inside limits.

## Failure surface

Wrappers absorb the common faults:

1. **Absent `APIFY_TOKEN`** — points at setup steps and exits.
2. **Actor-side failure** — reports status and exits cleanly.
3. **Empty result** — states so without crashing.
4. **Network stall** — bounded wait (120s default).

Hands-on recovery is rarely needed.

## Candidate extensions

1. **Topical search within a handle** — `search-tweets.ts <username> <query> <limit>`, e.g. a handle's posts on one theme from the past month.
2. **Thread fidelity** — stronger quote-tweet handling, reply-chain tracing, continuity checks.
3. **Engagement gating** — minimum-engagement filters, engagement ordering, trend reads.
4. **Export shapes** — JSON for programs, Markdown for docs, CSV for sheets.

Further actors on the same narrowing pattern — Instagram, LinkedIn, YouTube, generic crawl — should see comparable 90%+ savings.

## Where things live

- Skill entry and workflows: `DEVOS/skills/Apify/SKILL.md`
- Code-first reference: `DEVOS/skills/Apify/README.md`
- Actor wrappers: `DEVOS/skills/Apify/actors/`
- Runnable samples: `DEVOS/skills/Apify/examples/`

## Operator FAQ

Q: Why scripts over protocol tools?
A: Roughly 90–98% fewer tokens, faster runs, explicit control.

Q: A script fails — first checks?
A: `APIFY_TOKEN` in `${DEVOS_DIR}/.env`, network path, Apify status page.

Q: Adding an actor?
A: Mirror `actors/` — pin the actor id, narrow in code.

Q: Debugging a new wrapper?
A: Log raw dataset rows ahead of the filter and read console output.

## Standing result

- 90–98% token reduction against protocol pulls
- Roughly ten-second runs
- Script path adopted for handle-post operations
- Reference material covering wrappers, samples, and this guide

**Handle-post work defaults to this code path.**
