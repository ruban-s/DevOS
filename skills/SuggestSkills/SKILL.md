---
name: SuggestSkills
version: 1.0.0
description: "Spot candidate skills worth building from your own recent work and friction signals. Read-only and advisory: it finds repeated pain no current skill, loop, or workflow truly covers, then returns a ranked build list for CreateSkill. It never builds or edits anything itself. Rough edges count as evidence even under 'covered' topics, so it weighs low ratings and repeat-incident markers alongside session themes. USE WHEN should I create a skill, what skills do I need, suggest skills, skill gap, based on my recent work, am I missing a skill, what should I build. NOT FOR creating/validating/testing/optimizing an individual skill (use CreateSkill) — this only decides WHAT to build, not how."
---

# SuggestSkills — which capability deserves to exist?

A read-only look backward that answers a forward question: given what you actually did lately and where it stung, is there a repeatable problem with no real home that merits its own skill? This skill nominates; you approve; `CreateSkill` constructs. It cannot write a skill even when pressed — that boundary is structural, not polite.

## Tailoring

**Before running anything, check for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/SuggestSkills/`

When PREFERENCES.md exists there (default window, store locations, review spot), honor it. Otherwise use the defaults below.

## The One Path

| Path | Fits when | Doc |
|------|-----------|-----|
| **Scan** | "which skills are missing", "where are my gaps", "suggest builds", "do I lack a skill" | `Workflows/Scan.md` |

Scan in brief:

1. **Collect with the tool, not by hand.** `Tools/CollectSignals.ts` emits one normalized bundle — recent sessions, low-score friction with tone, the live skill/loop/workflow catalog for dedup, plus notices for absent or broken stores. Judgment reads the bundle; it never re-gathers, so repeats stay comparable.
2. **Group by ache.** Fold the bundle into recurring motifs, each carrying volume AND sting.
3. **Test coverage for real.** For every contender, open the bodies of the skills, loops, or workflows that supposedly cover it. A shared keyword is not coverage; the text must actually handle the failure mode.
4. **Check twice, keep the union.** Two separate passes classify the same motifs; surface everything either pass flags, labeled by agreement (both = firm, one = review-worthy).
5. **Nominate, never build.** Return an ordered slate with receipts (session volume, friction volume, the exact recurring break). Approved items move to `CreateSkill`. Strip secrets, client names, and private paths from anything persisted.

## Why Discovery Stands Apart From Building

Spotting is read-only; building mutates. Housing them in different skills turns "never auto-creates" from a sentence into a shape: there is simply no write path here for skill files.

## The Two Traps This Exists to Spring

1. **Friction hides under covered labels.** A build-and-test skill can nominally own a topic while the same wall keeps getting hit inside it. Star ratings and "broke again" markers are the loudest evidence a skill is missing. Rank them above bare topic counts.
2. **Missing disciplines masquerade as covered topics.** "App work" points at a builder skill, yet the ache may be an orphaned craft — state design, failure handling, migration care — that the builder never teaches. Coverage means the craft is genuinely taught, not that a keyword overlaps.

## Worked Invocations

**Routine sweep:**
```
User: "What skills should I build based on my recent work?"
→ Runs the Scan path
→ CollectSignals.ts reads the trailing 45 days
→ Sessions plus low scores get grouped, checked against live skills and workflows
→ Returns an ordered slate with receipts; builds nothing
```

**Friction-led sweep:**
```
User: "I keep hitting the same wall — am I missing a skill?"
→ Runs Scan with the friction store leading
→ Lifts discipline gaps out from under topics that look handled
→ One accepted nominee moves to CreateSkill as its own step
```

## Traps

- **A tidy topic map over messy friction scores is a FALSE all-clear.** When scores show repeat pain inside an area marked handled, reopen it — the craft underneath the label is the gap. (Catching exactly this is the skill's reason to exist.)
- **Repeats are severity-weighted, not tallied.** Three trivial sessions weigh less than one long painful migration that keeps returning. A sharp ache recurring across a few sessions qualifies below any fixed bar.
- **Conduct is not a capability.** "Too wordy", "misread the brief", "repeated a nudge" steer memory and preferences; they do not justify skills. Sort them out toward memory and preferences, away from CreateSkill.
- **Deterministic gathering is load-bearing.** Hand-searching stores mid-run makes repeats incomparable and reviews meaningless — run the tool.
- **Locations resolve; they are not presumed.** Flags, env, and root decide store paths so the scan travels across installs; never bake in a home directory.
- **A deep store widens the list, not the insight.** The 45-day default window is the dial — open it on purpose, and expect the grouping step to absorb the cost.
