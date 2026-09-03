---
workflow: TestIdea
mode: single-run
---

# Test an Idea Against the Horizon Reads

Run any idea, strategy, investment, brand, or notion past all 11 durable horizon reads and judge how it ages.

## Fits When

- Caller says "test this idea," "how does this age," "test my strategy," "shake this down"
- A candidate arrives with its premises attached and wants a temporal verdict
- The question is really "when does this thrive or snap"

## Needs

- Horizon reads present at `DEVOS/MEMORY/RESEARCH/WorldModels/`
- Reads missing means prompting for the UpdateModels path first

## Gear Pick

Read the caller's words:

- **"fast"** or **"quick"** → Fast gear
- **"deep"**, **"thorough"**, or **"comprehensive"** → Deep gear
- **Bare call** → Standard gear (stock)

## The Pass

### Gate 0: Reads Present

```
Survey DEVOS/MEMORY/RESEARCH/WorldModels/ for the 11 horizon files.
Anything absent: "Horizon reads incomplete. Run 'update world models' first."
Reads older than 30 days: warn, then continue.
```

### Ping 1: Announce

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Testing your idea against all eleven world threat models at TIER tier"}'
```

### Move 2: State and Split the Idea

Before the horizons touch it, pin the idea down:

1. **Say it** in 1–2 sentences
2. **Name its bets** (market weather, technical state, norms, rules, rivalry)
3. **Name its load-bearers** — what must stay true for this to work?

For **Standard and Deep gears:** bring FirstPrinciples to sort the bets:
- Hard limits (physics, headcounts, math)
- Soft limits (policy, rules, norms)
- Guesses (untested beliefs the idea stands on)

### Move 3: Run the Horizons

Read the 11 horizon files from `DEVOS/MEMORY/RESEARCH/WorldModels/`.

#### Fast Gear (~2 min)
Solo fusion:
1. Read the 11 reads in sequence
2. Per horizon emit: Verdict (🟢/🟡/🔴) plus 2–3 bullets
3. Draft the lead call
4. Emit the short form from OutputFormat.md

#### Standard Gear (~10 min)
Parallel readers:
1. Fan out up to 11 readers (Task tool, `run_in_background: true`)
2. Per reader:
   - Open ONE horizon read
   - Test the idea's bets against that window's weather
   - Check every premise against the window
   - Return: Verdict, Key Factors, Analysis, Assumptions Tested
3. When readers land, bring **RedTeam**:
   - Ask: "Attack this idea across all windows. Here are the per-window reads: {results}"
   - Lift hostile findings per horizon
4. Fuse the Cross-Horizon Synthesis block
5. Emit the full form from OutputFormat.md

#### Deep Gear (up to 1 hr)
Full bench:
1. **FirstPrinciples** (unless already run): full split → sort → rebuild on the idea
2. **Freshness sweep**: per horizon, one quick Research check for developments that touch this idea
3. **Parallel horizon reads**: Standard's shape with deeper briefs and longer per-window work
4. **RedTeam** (full 32-voice wave): hostile read of the idea across every window
5. **Council**: multi-voice argument over long-horizon viability
   - Ask: "Debate the viability of {idea} across windows from 6 months to 50 years. Consider: {per-window results}"
   - Lift the Council Deliberation block
6. Fuse everything
7. Emit the complete form from OutputFormat.md (all blocks)

### Move 4: Shape the Answer

Follow the `OutputFormat.md` skeleton at the skill root. Keep:
- Every horizon fenced under its own header
- Verdict glyphs applied consistently
- Confidence as read-confidence times analysis-certainty
- Hostile findings tied to their window's weather

### Ping 5: Closing Note

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Analysis complete. SUMMARY_OF_EXECUTIVE_VERDICT"}'
```

## Answer Shape

See `OutputFormat.md` at the skill root.

## Neighbor Map

| Neighbor | Gears | Job |
|-------|------|---------|
| **FirstPrinciples** | Standard, Deep | Split the idea's bets ahead of testing |
| **RedTeam** | Standard, Deep | Hostile pass on the idea per window |
| **Council** | Deep only | Multi-voice argument over viability |
| **Research** | Deep only | Quick freshness sweep per window |

## Rough Edges

- A reader worker fails: continue on the survivors, name the missing window in the answer
- A neighbor call fails: degrade openly (skip its block, note the footer)
- Reads older than 90 days: warn prominently in the masthead, urge a refresh
