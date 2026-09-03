# Reconstruct Workflow

**Purpose**: Design the best solution from a blank page, admitting only the fundamental truths and hard constraints that Deconstruct and Challenge left standing.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Reconstruct workflow in the FirstPrinciples skill to build optimal solution"}' \
  > /dev/null 2>&1 &
```

Running the **Reconstruct** workflow in the **FirstPrinciples** skill to build optimal solution...

---

**When to Use**:
- Once Deconstruct and Challenge have done their work
- When the incumbent solution is plainly suboptimal
- When the team needs to escape a local maximum
- To produce genuine alternatives to the conventional approach

---

## The Guiding Question

> "If we had never seen how anyone does this today, and knew only the fundamental truths, what would we build?"

Optimize the **function** — the outcome actually wanted — never the **form**, the customary way of getting there.

---

## What Counts as Done

Design admitting only hard constraints, as if the current solution had never existed. A finished reconstruction demonstrates:

- **Hard constraints only** (physics, mathematics, verified fact, truly immovable requirements) — soft constraints, assumptions, and "how it's always been done" left outside the room.
- **Function stated as outcome, not method** — "persist and retrieve user data reliably," never "we need a database"; "deploy and scale components independently," never "we need microservices."
- **Three or more blank-page designs** sketched with feasibility filtering suspended, each checked on: does it satisfy the hard constraints, does it achieve the function, is it simpler than the incumbent. The winner maximizes simplicity.
- **Borrowed machinery** — a parallel problem already solved in an unrelated field, transplanted here. (The snowmobile: tank treads plus boat motor plus bicycle seat, fused into a new category.)
- **A measured delta** against the current approach: which complexity gets deleted (it was never bedrock), what is genuinely new, what the old approach had right all along.

---

## Output Template

```markdown
## Reconstruction: [Subject]

### Hard Constraints Only
1. [Immutable constraint 1]
2. [Immutable constraint 2]
3. [Immutable constraint 3]

### Function to Optimize
[What we're actually trying to accomplish - outcome, not method]

### Blank Slate Solutions

**Option A: [Name]**
- Approach: [Description]
- How it satisfies constraints: [Explanation]
- Pros: [Benefits]
- Cons: [Drawbacks]

**Option B: [Name]**
- Approach: [Description]
- How it satisfies constraints: [Explanation]
- Pros: [Benefits]
- Cons: [Drawbacks]

**Option C: [Name]**
- Approach: [Description]
- How it satisfies constraints: [Explanation]
- Pros: [Benefits]
- Cons: [Drawbacks]

### Cross-Domain Insights
- From [Field 1]: [Applicable concept]
- From [Field 2]: [Applicable concept]

### Recommended Solution
**[Option X]** because [reasoning]

### Comparison to Current Approach

| Aspect | Current | Reconstructed | Delta |
|--------|---------|---------------|-------|
| Complexity | [X] | [Y] | [Simpler/Same/More] |
| Cost | [X] | [Y] | [Lower/Same/Higher] |
| Performance | [X] | [Y] | [Better/Same/Worse] |
| Flexibility | [X] | [Y] | [More/Same/Less] |

### What We're Eliminating
- [Thing that wasn't fundamental]
- [Complexity from soft constraints]

### What We're Adding
- [New approach from first principles]
- [Cross-domain technique]

### Implementation Path
1. [First step to move toward reconstructed solution]
2. [Second step]
3. [Third step]
```

---

## Example: Reconstructing "File Storage System"

### Hard Constraints Only
1. Must durably persist bytes (physics: data must survive power loss)
2. Must be retrievable by identifier (math: need addressing scheme)
3. Must handle N bytes total capacity (requirement: known data volume)

### Function to Optimize
"Durably store and retrieve files for a web application"

### Blank Slate Solutions

**Option A: Object Storage (S3-style)**
- Approach: Flat namespace, HTTP API, eventual consistency
- Satisfies constraints: Yes - durable, addressable, scalable
- Pros: Infinitely scalable, cheap at scale, no servers to manage
- Cons: Latency, eventual consistency

**Option B: SQLite + Backups**
- Approach: Single file database, blob storage, periodic backup to cloud
- Satisfies constraints: Yes - durable (with backups), addressable (by key), handles capacity
- Pros: Dead simple, single file, ACID, fast reads
- Cons: Single machine limit, backup complexity

**Option C: Content-Addressed Storage**
- Approach: Hash-based addressing, deduplication, distributed
- Satisfies constraints: Yes - immutable = durable, hash = address, scales horizontally
- Pros: Deduplication, integrity verification, cacheable everywhere
- Cons: More complex, no in-place updates

### Cross-Domain Insights
- From Git: Content-addressed storage is brilliant for integrity
- From CDNs: Edge caching solves latency, not origin storage
- From Databases: Sometimes ACID matters more than scale

### Recommended Solution
**For most web apps: Option B (SQLite + Backups)**

Why: 90% of applications never exceed single-machine capacity. SQLite is simpler, faster for reads, requires no infrastructure. Only reconstruct to Option A/C when you actually hit limits.

### Comparison to Current Approach

| Aspect | Current (S3 + CDN) | Reconstructed (SQLite) | Delta |
|--------|-------------------|------------------------|-------|
| Complexity | High (3 services) | Low (1 file) | Much simpler |
| Cost | $500/mo | $0 + backup ($5/mo) | 99% reduction |
| Performance | 50ms p50 | 1ms p50 | 50x faster |
| Flexibility | High | Medium | Slightly less |

### What We're Eliminating
- S3 configuration and IAM complexity
- CDN setup and cache invalidation logic
- Network latency for every file operation
- $495/month in unnecessary infrastructure

### What We're Adding
- Simple backup script to cloud storage
- Monitoring for file size approaching limits
- Migration path document for when we actually need to scale

---

## Recurring Reconstruction Moves

### Move: "Do We Even Need This?"
Frequently the rebuilt solution deletes whole components:
- "We need a message queue" → Direct function calls work fine at our scale
- "We need Kubernetes" → A single server handles our load
- "We need a SPA framework" → Server-rendered HTML is simpler and faster

### Move: "Same Function, Different Form"
The function survives; the form changes entirely:
- "Web app" → "CLI tool" (if users are technical)
- "Mobile app" → "PWA" (if native features aren't needed)
- "Custom solution" → "Spreadsheet" (if that's actually sufficient)

### Move: "Fold Steps Together"
Dropping soft constraints often lets separate steps merge:
- "Microservices" → "Modular monolith" (one deployment, multiple modules)
- "ETL pipeline" → "Query on read" (if data volume permits)
- "Async workflow" → "Synchronous" (if latency isn't critical)

---

## Integration Notes

**The full bedrock sequence**:
```
Deconstruct → Challenge → Reconstruct
      ↓            ↓            ↓
   (Parts)    (Classify)    (Build new)
```

**Solo use**:
Reconstruct stands alone whenever the hard constraints are already known:
```
→ FirstPrinciples/Reconstruct given constraints [X, Y, Z]
```

**Called from elsewhere**:
- Architect invokes after Challenge to generate alternatives
- Engineer invokes when stuck to escape local maxima
- RedTeam invokes to construct counter-proposals
