# ParallelAnalysis — RedTeam

## What Leaves the Room

One position, attacked from every side at once, resolved into the pair that matters:

**The fairest version of the case, and the toughest honest case against it.** Both told as 8-beat narratives, beats held to 12–16 words, aimed at load-bearing joints rather than effigies, ordered by damage potential. The rebuttal must beat the strong version — never a watered-down one. The author should recognize their own view in the first half and feel the second half land where they actually live.

**Not point-scoring.** The hunt is for the premise whose failure pulls the structure down with it.

---

## The Motion

**Split the position first.** Run `FirstPrinciples/Deconstruct` over the material to separate bedrock from assumption and expose what was claimed versus what is really there. Then cut the case into small standalone assertions, each concrete enough that a sharp reader could argue with it alone.

**Send the whole critic bench at once, in one message.** Field a broad cast — builders, system designers, hostile thinkers, fresh eyes — as parallel Task calls fired together. Each worker gets the full position, the assertion split, and one persona from the bench below, and hands back an even-handed read: what genuinely holds from their angle, and what genuinely gives.

**Keep what converges; grade by damage.** Objections that strangers reach independently are your headline findings; a lone sharp strike still earns its place. Order everything by severity, throw out noise, then call the verdict: sound at the core with repairable execution, or broken at the core despite good intent.

**Sort the limits before writing the rebuttal.** Run `FirstPrinciples/Challenge` and tag every constraint HARD (reality — leave it alone), SOFT (choice or policy — fair game), or ASSUMPTION (untested — the soft underbelly). The deepest cuts usually land where a SOFT limit was dressed up as HARD.

---

## The Bench

Pick a spread. Suggested angles below:

### Builders — does it hold technically

| Seat | Voice | Line of attack |
|-------|-------------|----------------|
| EN-1 | **The weathered systems hand** — three decades of outages, trusts nothing at scale | "Show me where this snaps under real load." |
| EN-2 | **The numbers-first reviewer** — no data, no deal | "Which measurement actually backs that claim?" |
| EN-3 | **The corner-case bloodhound** — lives in the 1% that sinks plans | "Name the condition where this premise quietly fails." |
| EN-4 | **The scar-tissue archivist** — has watched this movie before | "We ran this play years ago; here is how it ended." |
| EN-5 | **The complexity auditor** — simple stories hide hard problems | "This reads easy because the hard part is hidden." |
| EN-6 | **The assumption tracer** — follows premises down to bedrock | "That rests on X, which rests on Y, and Y is shaky." |
| EN-7 | **The breakage cataloguer** — thinks in failure inventories | "Here are five realistic ways this comes apart." |
| EN-8 | **The hidden-cost ledger** — prices what the pitch omits | "The true bill for this route looks like this." |

### System designers — does it hang together

| Seat | Voice | Line of attack |
|-------|-------------|----------------|
| AR-1 | **The whole-board reader** — watches how parts interact | "This ignores the larger machine it must live inside." |
| AR-2 | **The trade-off spotter** — every gain has a price | "You buy X by spending Y, and Y costs more." |
| AR-3 | **The category checker** — sorts unlike things apart | "Those two problems belong in different boxes." |
| AR-4 | **The motive follower** — tracks who gains from belief | "Ask who profits if everyone accepts this." |
| AR-5 | **The ripple tracer** — plays three moves ahead | "That move triggers A, which triggers B, which sinks C." |
| AR-6 | **The seam pessimist** — distrusts every interface | "It will break where it meets the world outside." |
| AR-7 | **The scale doubter** — ten versus ten thousand differ | "What survives the demo dies in production volume." |
| AR-8 | **The one-way-door watcher** — some choices don't unwind | "After this step there is no walk-back, and that matters." |

### Hostile thinkers — how would someone weaponize it

| Seat | Voice | Line of attack |
|-------|-------------|----------------|
| PT-1 | **The standing adversary** — thinks in exploits by habit | "If I wanted this to fail, I would start here." |
| PT-2 | **The weak-link finder** — hunts the single脆 point in the chain | "The chain holds except at X, and X is false." |
| PT-3 | **The opponent modeler** — grants the other side brains | "A clever rival answers with this one move." |
| PT-4 | **The workaround watcher** — knows people dodge friction | "Users will simply walk around this constraint." |
| PT-5 | **The rhyme detector** — recognizes old failures in new clothes | "This is a past debacle with a fresh coat." |
| PT-6 | **The mitigation tester** — assumes defenses leak | "That guardrail gives way under this pressure." |
| PT-7 | **The surface mapper** — charts what was left unguarded | "A whole flank of this plan has no cover." |
| PT-8 | **The asymmetry caller** — weighs attacker patience against defender bandwidth | "The other side has endless retries; you do not." |

### Fresh eyes — what the invested miss

| Seat | Voice | Line of attack |
|-------|-------------|----------------|
| IN-1 | **The relentless why-asker** — keeps pulling the thread | "But why was X ever assumed at all?" |
| IN-2 | **The cross-field linker** — borrows from far away | "Another discipline tried this shape and it collapsed." |
| IN-3 | **The instinctive inverter** — flips the thesis first | "Start from the opposite being true and see." |
| IN-4 | **The plain-sense check** — distrusts cleverness for its own sake | "This offends basic intuition, and here is why." |
| IN-5 | **The ground-truth reader** — knows what people actually do | "On the ground, nobody behaves the way this needs." |
| IN-6 | **The razor holder** — prefers the plainer story | "A simpler account fits the facts better." |
| IN-7 | **The absurdity pusher** — runs claims to their limit | "Taken seriously, this also forces an absurd result." |
| IN-8 | **The unsayable sayer** — voices what the room avoids | "The awkward fact nobody named is this." |

### Worker Brief

Give each worker this scaffold, fitted to their persona:

```
# BALANCED ANALYSIS - [AGENT ID]: [PERSONA NAME]

You are [PERSONA DESCRIPTION]. Your angle is: "[ANGLE]"

## THE POSITION UNDER REVIEW:
[Full original argument]

## SPLIT INTO ASSERTIONS:
[Assertion breakdown]

## YOUR ASSIGNMENT:
From your angle alone, give an INDEPENDENT even-handed read covering BOTH sides.

## RETURN SHAPE:
Return exactly this structure:

**[AGENT ID] ANALYSIS:**

**Strongest Point FOR the Position:** [Assertion #X]
[2-3 sentences on why it holds up]
Take seriously because: [1 sentence]

**Strongest Point AGAINST the Position:** [Assertion #Y]
[2-3 sentences on the crack]
Worrying because: [1 sentence]

**Overall Assessment:** [One sentence — your standalone call on the merits]

Stay honest. Credit genuine strengths; do not build effigies.
Name genuine cracks; do not file nits.
Your job is balance through your one lens.
```

---

## Return Shapes

### Fair statement (8 beats, 12–16 words each)

Lead with the strongest honest telling — this is what blocks caricature.

```
# STEELMAN

**The Position (Best Version):** [One sentence — the strongest telling]

**The Strongest Case FOR This Position:**

1. [12-16 words - the most compelling opening point]

2. [12-16 words - strong supporting evidence]

3. [12-16 words - historical precedent or analogy that supports]

4. [12-16 words - valid concern being addressed]

5. [12-16 words - what the critics get wrong]

6. [12-16 words - the real risk if ignored]

7. [12-16 words - why smart people believe this]

8. [12-16 words - the strongest single reason to take this seriously]

**Validity Assessment:** [One sentence on the legitimate core concern]
```

### Rebuttal (8 beats, 12–16 words each)

```
# RED TEAM VERDICT

**The Position:** [One sentence summary of what was reviewed]

**The Counter-Argument:**

1. [First key point - 12-16 words - establishes the fundamental flaw]

2. [Second point - 12-16 words - develops the core weakness]

3. [Third point - 12-16 words - provides historical precedent or analogy]

4. [Fourth point - 12-16 words - addresses the hidden assumption]

5. [Fifth point - 12-16 words - shows the counterexample or exception]

6. [Sixth point - 12-16 words - reveals what's conveniently ignored]

7. [Seventh point - 12-16 words - exposes the second-order effects]

8. [Eighth point - 12-16 words - delivers the knockout conclusion]

**Assessment:** [One sentence on the position's soundness after review]
```

Beats stand alone, use plain words, strike true joints, and climb in force so the reader thinks "I hadn't considered that."

---

## Worked Pass: First-Principles Read

**Position:** "Hold the launch six months to add features."

**First-principles cut:**
- **Shape:** recommendation ("we should do X")
- **Quiet bets:** extra features raise odds; rivals wait politely; timing bends to us
- **Past echoes:** overbuilt launches that missed windows; spare v1s that learned fast and won
- **Logic gap:** delay helps only with proof on the feature-value trade, which is missing

**Fair statement (8 beats, 12–16 words each):**

1. Rushed launches can wound trust in ways that need years to repair fully.
2. Acquisition spend burns fast when missing features drive early users away quickly.
3. Patient releases often beat hurried rivals on satisfaction and long-term retention scores.
4. Planned additions answer the three loudest complaints from our beta testers directly.
5. Skeptics forget rivals already ship these features as baseline buyer expectations today.
6. Half a year of building costs less than a year of apologizing afterward.
7. Teams lose heart shipping work they already know feels unfinished and fragile.
8. Delay stings, yet shipping something regrettable would sting far longer afterward always.

**Rebuttal (8 beats, 12–16 words each):**

1. Only paying users reveal which features truly matter, never internal debate alone.
2. Each delayed month hands rivals shelf space that rarely returns to us.
3. Many dominant products began as rough drafts that learned quickly in public.
4. Extra features often add complexity that quietly destroys the core product value.
5. Six-month forecasts routinely double, so the true wait could approach a year.
6. Features can ship after launch, but lost calendar time never comes back.
7. Live customer behavior teaches more than months of private reasoning ever will.
8. Treat launching as repeated learning, not one irreversible high-stakes wager placed blindly.

---

## Needs

**This path assumes:**
- Task dispatch for firing the parallel critic wave in one message
- Synthesis bandwidth to absorb many returns at once
- **FirstPrinciples skill** for the opening split (Deconstruct) and the limit sort (Challenge)

**Combines with:**
- `FirstPrinciples/Deconstruct` — cut the case into bedrock and guesswork
- `FirstPrinciples/Challenge` — tag limits HARD / SOFT / ASSUMPTION
- narrative-decomposition helpers for the first cut
- `extractalpha` for keeping the sharpest strikes
- `research` for counter-cases and precedents

---

**Last Updated:** 2026-07-09
