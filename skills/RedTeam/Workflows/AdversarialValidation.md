# AdversarialValidation — RedTeam

## Announce

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the AdversarialValidation workflow in the RedTeam skill to validate decisions"}' \
  > /dev/null 2>&1 &
```

Running the **AdversarialValidation** workflow in the **RedTeam** skill to validate decisions...

**Job:** let rival drafts fight under a harsh judge so the fused answer comes out stronger than any single entry.

**Fits:**
- Specs that need a beating before they harden
- Architecture forks still open before code lands
- Reviews where honest alternatives exist
- Writing that must survive contact with skeptics
- Any call where getting it right beats getting it fast

**Lineage:** a 2025 prompting talk — models critique and revise better than they draft cold.

---

## The Three Passes

### Pass 1: Rival Drafts

Field 2–3 specialists, each arguing for a different priority set:

```
<instructions>
ADVERSARIAL VALIDATION - ROUND 1 (COMPETING PROPOSALS):

You are [PERSONA]. Draft your strongest answer to this brief.

Weigh hardest:
- [Key concern 1]
- [Key concern 2]
- [Key concern 3]

Deliver a complete answer tuned to YOUR weights.
Be concrete — this draft meets opponents next.
</instructions>

[Brief / task]
```

**Casts that work:**

**Architecture forks:**
- Builder (ships cleanly, maintains cheaply)
- System designer (scales, patterns well, ages gracefully)
- Security mind (shrinks surface, distrusts input)

**Feature shape:**
- Product voice (user value, simplicity)
- Builder (can we actually ship and test this)
- Quality voice (edge cases, verifiability)

**Prose:**
- Domain authority (correctness, depth)
- Reader stand-in (clarity, momentum)
- Structural editor (shape, flow)

### Pass 2: Hostile Read

One judge reads every draft and refuses to be kind:

```
<instructions>
ADVERSARIAL VALIDATION - ROUND 2 (BRUTAL CRITIQUE):

You are the Harsh Critic. You hold [N] drafts for [brief].

For EACH draft:

1. **What holds up:**
   - Credit real strengths (name them)

2. **What gives way:**
   - Name gaps, soft spots, blind corners
   - Call out what the draft politely skipped
   - Show where its home priority blinds it

3. **The awkward fact:**
   - What is nobody saying out loud?
   - Which real problem did every draft circle around?

4. **If forced to keep one:**
   - Which foundation is load-bearing?
   - Why?

Hard but honest. Truth over demolition.
</instructions>

[Drafts from Pass 1]
```

### Pass 3: Fused Answer

The original drafters read the verdict and build one shared answer:

```
<instructions>
ADVERSARIAL VALIDATION - ROUND 3 (COLLABORATIVE SYNTHESIS):

You are [PERSONA]. You have read the critic's verdict.

With your fellow drafters, produce ONE shared answer that:
- Repairs the valid hits
- Keeps the best material from every draft
- Settles the tensions between priorities openly
- Names the trade-offs that survive honestly

This is fusion, not averaging. The result should beat
every solo draft — not merely blend them.
</instructions>

[Drafts + critic verdict]
```

---

## One-Shot Form

When a single prompt must carry all three passes:

```
<instructions>
ADVERSARIAL VALIDATION - FULL PROTOCOL:

ROUND 1 - COMPETING PROPOSALS:
Draft 3 standalone answers from clashing stances:

Draft A (Pragmatist): favors shipping speed and quick wins
Draft B (Idealist): favors craft and long-horizon quality
Draft C (Skeptic): favors containing downside and failure modes

Each draft must stand on its own.

ROUND 2 - BRUTAL CRITIQUE:
As a severe but fair judge, score all three:
- What each one gets right
- What each one gets wrong
- The awkward fact none of them faced
- Which foundation is sturdiest

ROUND 3 - COLLABORATIVE SYNTHESIS:
Fuse the strongest material into one answer that:
- Repairs the valid hits
- Keeps each draft's best move
- Settles priority clashes openly
- Names surviving trade-offs plainly

OUTPUT:
- Short sketch of the three drafts
- The decisive critique hits
- Final fused recommendation with its reasoning
</instructions>

[Brief to resolve]
```

---

## How It Relates to ParallelAnalysis

**Different jobs:**
- The 32-critic wave (`ParallelAnalysis.md`) goes DEEP — one position, many attackers
- This pass goes toward SYNTHESIS — rivalry that manufactures a better answer

**Which to reach for:**
- **ParallelAnalysis:** "Take this position apart" — pressure-test what exists
- **AdversarialValidation:** "Help me choose or shape X" — build something new through rivalry

**Chain them:**
1. Fuse a candidate with this pass
2. Hammer the fused result with the 32-critic wave
3. Loop again when load-bearing cracks appear

---

## Tells

**Healthy signs:**
- Every draft genuinely argues its corner (no straw entries)
- The judge lands real hits instead of styling advice
- The fused answer visibly outruns each solo draft
- Surviving tensions are stated, not smoothed over
- The result invites further attack and holds

**Rotten signs:**
- Drafts read as the same answer in costume (no real spread)
- The judge is either gentle or purely destructive
- "Fusion" is one draft with cosmetic edits
- Trade-offs get waved away
- The whole exercise feels staged

---

## Worked Pass: API Auth Shape

**Brief:** "Shape the auth story for our new API."

**Pass 1 sketches:**

**Draft A (Pragmatist):** JWTs, day-long life, refresh rotation, standard claims. Ships fast on a known shape.

**Draft B (Idealist):** OAuth 2.0 with PKCE, quarter-hour tokens, sealed storage, full audit trail. Heavier lift, textbook posture.

**Draft C (Skeptic):** Scoped keys plus throttles, allowlisted origins, hand rotation. Tiny surface, trivial revocation.

**Pass 2 verdict:**

- A moves fast but day-long secrets rotate badly and live too long
- B is the reference posture but the current crew cannot carry its weight yet
- C locks down well but collapses once the API opens publicly
- Awkward fact: nobody answered "how do we kill every live token right now?"

**Pass 3 fusion:**

Keep A's JWT chassis (shippable), borrow B's short token life (quarter-hour) plus audit trail, adopt C's emergency kill-list for instant revocation. Hold full OAuth until the public launch forces it.

---

## Standing Rules

1. **Real rivalry** — entries must argue live alternatives, not padded stand-ins
2. **Severe but fair judging** — credit what holds, break what doesn't
3. **Fusion beats averaging** — the goal is STRONGER, not SMOOTHER
4. **Say what survives unresolved** — never claim tensions vanished when they didn't
5. **Stopping is allowed** — when no fused answer beats the field, report that

---

## When to Skip

- Calls with an obvious answer (machinery outweighs the stakes)
- Clocks running out (this pass is slow by design)
- Open-ended making where several good answers may coexist
- Questions the field already settled

**Rule of thumb:** spend this machinery where the cost of being wrong dwarfs the cost of deliberation.

---

**See also:**
- `ParallelAnalysis.md` — for hammering positions that already exist

**Last Updated:** 2025-11-27
