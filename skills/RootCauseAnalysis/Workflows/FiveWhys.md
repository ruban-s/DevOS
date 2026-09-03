# FiveWhys — RootCauseAnalysis

## Job

Walk one causal thread from symptom to shippable source by asking "why?" until the answer names a systemic, fixable condition — usually 4–7 rounds with at least one fork. Toyoda's 1930s shop-floor drill, carried into the Toyota Production System by Ohno as "the basis of Toyota's scientific approach." Cheap, fast, low-ceremony. The right opener for most breaks.

## Fits When

- "5 whys," "five whys," "run the whys"
- One thread, trigger already known
- Clock is short and triage must move
- Sitting inside Fishbone (each family bone earns its own Whys run)

## The Walk

"Why?" descends the thread until it names a fixable systemic condition. The `Return Shape` below is the handoff — WHY 1..N, forks, source(s), remedies, forward-read check. Four rails decide where the walk opens, forks, and halts:

**Open precisely — observable, measurable.** Fog in, fog out.
- Weak: "Reliability is down."
- Strong: "Checkout returned HTTP 500 for 14 minutes from 2026-04-12 23:51 UTC, failing 3,412 checkouts."

**Halt on fixable AND systemic — both, never one.**
- Fixable yet shallow ("patch this line") → halted early.
- Systemic yet unshippable ("people err") → overshot; climb one rung.

**Fork where reality forks.** A ruler-straight 5 Whys is the signature failure — it means the coziest answer won and siblings went unrecorded. Per "why?", list every true answer and keep the forks. **Forks rejoining at one ancestor mark a high-leverage systemic source: one remedy shuts several failure roads.**

**Read back upward.** Recite base-to-symptom as "because X, therefore Y, …, therefore the break." A wobble in the forward read means a logic leap — repair it before signing off.

**Optional — Five Hows.** Once the source lands, ask "how do we block this?" five times, so the remedy matches the diagnosis in rigor.

## Return Shape

```
🔍 5 WHYS ANALYSIS: [break, 12 words]

PROBLEM: [exact statement]

CHAIN:
- WHY 1: [cause]
- WHY 2: [cause of WHY 1]
- WHY 3: [cause of WHY 2]
- WHY 4: [cause of WHY 3]
- WHY 5: [cause of WHY 4 — root]

BRANCHES: [when present]
- At WHY N:
  ├─ Branch A: ...
  └─ Branch B: ...

ROOT CAUSE(S): [systemic, shippable]
- [Source 1]
- [Source 2]  ← when forks rejoined

CORRECTIVE ACTIONS:
- [Concrete move — owner — date]
- [Concrete move — owner — date]

VALIDATION (read forward):
Because [root], therefore [WHY 4], therefore [WHY 3], ..., therefore [problem].
```

## Worked Pass — Service Break

```
PROBLEM: Checkout API returned HTTP 500 on 1,200 calls across 2026-04-12 14:00–14:14 UTC.

CHAIN:
- WHY 1: The payments pool ran dry.
- WHY 2: Query latency leapt from 40ms p99 to 3,800ms p99.
- WHY 3: Orders-table reads went to full scans.
- WHY 4: The (customer_id, created_at) join pair carried no index.
- WHY 5: The migration adding that join shape shipped indexless.
- (WHY 6): The migration sheet never demanded EXPLAIN ANALYZE on fresh join shapes.

ROOT CAUSE: Migration review omits query-plan inspection.

CORRECTIVE ACTIONS:
- Attach EXPLAIN ANALYZE to the migration sheet — owner: platform — date: Apr 18
- Add the missing index now — owner: payments oncall — date: today
- Watch for newborn full scans with an alert — owner: observability — date: Apr 25

VALIDATION: Plan-less migrations miss indexes, which force scans, which spike latency, which drain the pool, which return 500s.
```

## Ruts

- **Halting on a person.** A chain ending at "someone slipped" owes one more why. Setups permit slips; sources live in the setup.
- **Leaping tiers.** Symptom-to-slogan jumps ("deploys are bad!") sound deep and skip mechanism. Each why must directly cause its parent.
- **Forcing one line.** Most breaks fork. A perfectly straight Whys usually means siblings went unasked.
- **Accepting unactionable ends.** An answer suggesting nothing shippable is not the source.
- **Judging from the future.** The responder lacked your hindsight. Ask what a reasonable reader of that moment would have believed — not why they missed your future.
- **Prescribing vigilance.** "Train harder" and "remind everyone" are the frailest remedies. Prefer automation, gates, or setup changes that make return hard.

## Reach Elsewhere Instead

- **Safety-critical frames.** Run Fault Tree; Whys cannot price odds.
- **Tangled cross-service breaks.** Run Apollo/RealityCharting or Fishbone + Postmortem. One-thread walking snaps.
- **"Fine there, broken here" shyness.** Run Kepner-Tregoe IS/IS-NOT.
- **Thin domain grip.** The drill cannot outrun its room. Seat experts, or run Fishbone so several experts contribute.

## Nests

- **Within Fishbone** — each heavy family bone earns its own Whys descent
- **Within Postmortem** — the "sources" chapter usually runs Whys underneath
- **Toward SystemsThinking/Iceberg** — when threads keep rejoining at structural notes, escalate to Iceberg

## Lineage

Sakichi Toyoda (1930s). Set in Taiichi Ohno's *Toyota Production System: Beyond Large-Scale Production* (1988). Minoura's single-line critique bounds it. "Five Hows" from lean shop practice.
