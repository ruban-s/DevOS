# Postmortem — RootCauseAnalysis

## Job

Write the structured, **blameless** record of a break — impact, timeline, contributors, repair, follow-through. Drawn from Google SRE habit, Etsy's facilitation craft (John Allspaw), and Dekker's *Field Guide to Understanding Human Error*.

The postmortem frames the other motions. Within it, run 5 Whys, Fishbone, or Kepner-Tregoe wherever each thread calls for it.

**Learning is the product — never individual blame.** Blame-drifted postmortems teach less, not more.

## Fits When

- "Postmortem," "incident review," "blameless review"
- Live break with user-facing hurt
- Security event
- Data loss or near-loss
- First-seen failure shape (even sans customer pain, when it could have bitten harder)
- Any break that paged a human

## SRE Tripwires

Open one when any holds:

- User-visible outage or sag past threshold
- Any data loss
- Human intervention paged
- First-seen failure shape
- A watcher miss (should have tripped sooner)
- Anything the setup's own design says should not happen

**Default to writing.** Skipping costs learning; writing costs an afternoon.

## The Blameless Bar

**SRE definition:** a written break record — impact, response moves, causes, follow-ups — assembled **without charging any person with misbehavior.**

**Why blameless pays:** fear throttles candor. Engineers under blame shade timelines, bury context, and launder reasoning. Blameless buys the full picture, including what the responder believed under thin information.

**Blameless still assigns.** Remedies carry owners and dates. What blameless bans: personal verdicts, punitive voice, "why did you do that?" aimed at a human.

**Etsy line:** "Once you welcome people into the room and set expectations about the mindset they should be in (blameless) and the outcome (learning), there's really only one thing to focus on: discovering the story behind the story."

### Room Rules

- No "why did you do that?" aimed at humans
- Instead: "What did you see? What did you know? What were you chasing?"
- Rebuild the timeline *forward*, never backward — starve hindsight
- Study Dekker's "sharp end" — the on-call seat, that minute, that information
- Never share the room with performance talk. Separate meetings, separate contracts.

## The Run

### Move 1: Rebuild the Timeline (ahead of theorizing)

Lay events in order. Keep:

- Every signal visible to responders
- Every move taken
- Every message (channel, call, page)
- Per decision point — what was knowable then?

**Sources:** incident channel, page history, deploy logs, on-call notes, chat scrolls.

**Order matters:** timeline before theories. A theory held early silently edits the timeline to flatter itself.

### Move 2: Hunt Causes (stacked motions inside)

Per thread, run the fitting sub-motion:

- Plain single thread → **5 Whys** (`FiveWhys.md`)
- Several suspect families → **Fishbone** (`Fishbone.md`)
- "Fine on X, broken on Y" shyness → **Kepner-Tregoe** (`KepnerTregoe.md`)
- Branching multi-road collapse → **Fault Tree** (`FaultTree.md`)

**Plural is the default.** Current SRE postmortems bank *contributors*, never a lone root. (Gallego's 2018 "Root Cause is a Fallacy" fixed the vocabulary.)

### Move 3: Sort the Failure Kinds

Per contributor, file it:

- **Trigger** — the immediate trip
- **Contributor** — conditions that armed the trip or fattened its blast
- **Detection miss** — why the knowing came late
- **Response drag** — why the healing took long

Each kind earns separate remedies. Trigger patched, watchers sharpened, runbook greased — independently.

### Move 4: Lay the Layered Defense (Reason)

Most breaks are not one slip — they are **holes lining up across defensive sheets at once**.

Chart the sheets that stood:

```
LAYERED-DEFENSE CHART:

Sheet 1: [what should have stopped this]
- Hole: [why it missed]

Sheet 2: [next sheet]
- Hole: [why it missed]

Sheet 3: [next sheet]
- Hole: [why it missed]

[Break arrived where holes aligned]
```

**Sharp-end slips** (human moves) plus **quiet weaknesses** (setup frailty) both count. Weight the quiet ones — they waited years for their trigger, and fixing them blocks a family of future breaks.

### Move 5: Forge Follow-Throughs

Per follow-through, set:

- **Owner** — one human (never a crew)
- **Date** — one calendar mark
- **Proof** — how done gets recognized
- **Strength** — how much return odds fall

**Remedy strength ladder** (strongest first):

| Strength | Kind | Sample |
|----------|------|---------|
| **Strongest** | Remove | Delete the ability to take the wrong road |
| Strong | Gate | Add a step that bars the wrong road |
| Strong | Automate | Swap human watchfulness for a check |
| Medium | Simplify | Shrink the ways to err |
| Medium | Standardize | Make the right road the default |
| Weak | Teach | Brief people on the hazard |
| **Weakest** | Remind | Mail, poster, doc note |

**Rule:** when the headline remedies read "training" and "docs," return to the hunt. They lean on the same watchfulness that just failed.

### Move 6: Draft the Paper

```
# Postmortem: [Break title]

**Date:** YYYY-MM-DD
**Authors:** [names]
**Status:** Draft / Final
**Handling:** Internal / Confidential

## Summary

[1–2 paragraphs a non-specialist can follow.]

## Impact

- Users: [N hurt, M% of traffic, X minutes]
- Revenue: [$ when countable]
- Data: [loss, corruption, or spillage]
- On-call: [who carried the pager, how long]

## Timeline

**All times UTC.**

- `23:47` — Push D-1234 to live
- `23:49` — Traffic cut to the fresh build
- `23:51` — First p99 trip fires
- `23:52` — Page to on-call (Alice)
- `23:53` — Alice acks; opens the hunt
- `23:55` — 500s isolated to payments
- `23:58` — Rollback starts
- `00:01` — Rollback lands; graphs heal
- `00:05` — Break closed

## Contributors

### Trigger
[The immediate trip]

### Systemic Conditions
[What armed the trigger or made it likely]

1. **[Condition 1]**
   - Evidence: ...
   - Why it stood: ...

2. **[Condition 2]**
   - ...

### Detection Misses
[Why the knowing came late]

### Response Drag
[Why the healing took long]

## Layered-Defense Read

Sheets that stood and their holes:

- **Sheet 1 — CI gate:** greens across; hole — no load shape, missed this query pattern
- **Sheet 2 — Canary:** skipped for this push; hole — payments pushes don't require one
- **Sheet 3 — Pre-push sheet:** no p99 line; hole — sheet predates p99 watchers
- **Sheet 4 — Watchers:** p99 tripped but slow; hole — evaluation window overlong

## What Held

[Always keep this chapter. Name what worked — morale and memory both need it.]

- Rollback ran clean
- Ack beat the SLA
- Incident-channel traffic stayed legible

## What Sagged

[Blameless. Setup misses, never personal ones.]

- Full-cut push permitted sans canary
- Sheet out of date
- Trip window too wide for this break class

## Follow-Throughs

| # | Move | Strength | Owner | Date | Proof |
|---|--------|----------|-------|----------|--------------|
| 1 | Canary (10/50/100 behind p99 gate) on payments pushes | Automate (Strong) | Platform-eng | Apr 30 | Merged + ridden on next 3 pushes |
| 2 | Pre-push sheet gains a p99 line | Standardize (Medium) | Payments-oncall | Apr 18 | Sheet diff merged; crew sign-off |
| 3 | p99 trip window 5m → 1m on payments | Simplify (Medium) | SRE | Apr 22 | Pager config diff merged |
| 4 | Backfill the missing index | Remove (Strongest) | Payments | Today | Index live; plan proves use |
| 5 | Migration sheet demands EXPLAIN ANALYZE | Gate (Strong) | Platform-eng | Apr 25 | Sheet live; next 3 migrations carry it |

## Learnings

[What today taught that yesterday lacked]

- Deploy greens never covered plan regression — a latent bet stood exposed.
- Trips fired yet too slowly to spare users. Trip latency matters as much as trip truth.
- The structural hole sat in migration review — not in the engineer, not in the push.

## Trail

- [ ] Follow-throughs tracked in [tracker]
- [ ] 30-day revisit: did the moves actually shut the family?
- [ ] Resemblance sweep: sibling services rhyming? (escalate to SystemsThinking when yes)
```

### Move 7: Publish and Chase

- Publish where the org reads (visibility feeds learning)
- Tag in the incident tracker
- **Chase follow-throughs to done** — unchased postmortems are theatre
- Revisit at 30 days: did the family actually stay shut?

## Ruts

- **Singleton framing.** Bank "contributors" (plural). Lone-root is near-always wrong.
- **Blame drift.** The instant "why did Alice…?" centers, rewind the room.
- **Frail remedies.** "Training" and "reminders" lean on human watchfulness. Order by strength; prefer automation and gates.
- **Skipping "what held."** Not garnish — it cements the moves that kept a bad break from worse.
- **Ownerless or dateless remedies.** Unowned means undone.
- **Merging review with ratings.** Never. Unlike rooms, unlike attendees, unlike contracts.
- **Reading history backward.** "Alice should have seen X" — with what she held at 23:55, would *you*? Rebuild knowability per minute, not discoverability in retrospect.

## Nests

- **Frames:** 5 Whys, Fishbone, Kepner-Tregoe, Fault Tree — whichever each thread earns
- **Toward SystemsThinking** — rhyming postmortem-worthy breaks escalate to Iceberg / FindArchetype
- **Toward FMEA** — the early-screening sibling; postmortem finds reveal modes FMEA should henceforth watch
- **Tracker linkage** — SRE habit: every break links its paper

## Lineage

Google SRE volume (2016), ch. 15. Etsy facilitation craft (Allspaw, 2016). Dekker, *Field Guide to Understanding Human Error* (2014, 3rd ed.). Blameless roots in Reason's *Human Error* (1990). Remedy ladder adapted from care-safety sheets (ISMP). "Root cause is a fallacy" framing: Gallego, 2018.
