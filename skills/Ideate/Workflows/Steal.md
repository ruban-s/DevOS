# Steal — STEAL Phase Only (Cross-Domain Pattern Transfer)

**Reach for this when** the need is scavenged solutions: borrow what foreign domains already know and map it onto your problem. Pure cross-pollination — no scoring, no breeding, no iteration.

**Phase invoked:** STEAL only.

## Inputs

- **Problem statement** (required): defines what to look for in foreign domains
- **Domains** (optional): explicit list of domains to scavenge from. If omitted, drawn via weighted random lottery from the standard 50+ candidate pool.
- **Patterns per domain** (optional, default 3): how many patterns each agent extracts from its assigned domain
- **Agent count** (optional, default 3-5): one agent per domain

## Steps

1. **Settle the domains:**
   - User supplied domains → use those
   - Otherwise → weighted random lottery from the 50+ candidate pool (defined in `../SKILL.md` § Beating Model Bias With Structure)
   - Hard floor: at least 1 domain must be DISTANT from the problem's native field (biology for software, jazz for military, etc.)

2. **Launch one Thief agent per domain concurrently** via Task tool. Each receives:
   - Problem statement
   - Its assigned foreign domain
   - Deliverable: 2-3 patterns from the domain that solve analogous problems, each written as the mapping `In [foreign domain], they solve [analogous problem] by [technique]. Applied to our problem: [mapping].`
   - Each agent invokes `Skill("Research")` to gather domain-specific material

3. **Collect the borrowed patterns** into one output. Each pattern carries:
   - Foreign domain name
   - The analogous problem in the foreign domain
   - The technique that solves it
   - The mapped application to our problem
   - Strength of analogy (1-5, agent's self-assessment)

## Output

```markdown
## Borrowed Patterns

### From Mycology (Agent: The Thief)

1. **Mycelial network consensus** (analogy strength: 5)
   - Foreign problem: distributed nutrient allocation across forest floor
   - Foreign technique: chemical gradient signaling, no central coordinator
   - Mapped: distributed system consensus via gossip protocol with bias-vector signals

2. **Sclerotia dormancy** (analogy strength: 3)
   - ...

### From Jazz Performance (Agent: The Thief)

1. **Trading fours** (analogy strength: 4)
   - ...
```

## Distinguishing Notes

- **The lottery picks the domains, not the model.** Asking the LLM for "interesting domains" reintroduces exactly the training-distribution bias the lottery exists to defeat.
- **The mapping is where novelty happens.** The pattern is old; its application here is new. A pattern with no mapping isn't borrowed — it's noise.
- **Nothing gets scored here.** Steal yields cross-pollination feedstock. Test (or FullCycle) scores it against fitness criteria.

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Ideate","workflow":"Steal","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
