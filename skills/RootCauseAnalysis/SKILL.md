---
name: RootCauseAnalysis
version: 1.0.7
description: "Structured incident investigation using Five Whys, Fishbone, blameless Postmortem, Fault Tree, Kepner-Tregoe, and FMEA — traces failures to systemic root causes rather than blaming humans. USE WHEN root cause, RCA, 5 whys, fishbone, postmortem, incident analysis, fault tree, why does this keep failing, blameless, recurring bug. NOT FOR systemic loops (use SystemsThinking)."
context: fork
background: false
---

## Tailoring

**Before running anything, check for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/RootCauseAnalysis/`

When present, honor any `PREFERENCES.md`, configs, or extra material inside. Those settings win over the defaults. When absent, proceed on standard behavior.


## MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**Send this announcement BEFORE any other step once the skill fires.**

1. **Spoken ping:**
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the RootCauseAnalysis skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Printed line:**
   ```
   Running the **WorkflowName** workflow in the **RootCauseAnalysis** skill to ACTION...
   ```

**No skipping. Fire the curl the moment the skill engages.**

---

# RootCauseAnalysis Skill

## What Leaves the Room

An account of why something broke that travels past the trigger event into the enabling conditions and quiet weaknesses that made the break possible. Five structured motions (5 Whys, Fishbone, Postmortem, Fault Tree, Kepner-Tregoe) close on changes that block a whole failure family, not one instance. Roots run through Toyota shop-floor practice, Ishikawa quality work, Reason's layered-defense picture, Gano's evidence-first charting, and the blameless review culture of Google SRE and Etsy.

## Operating Bet

There is rarely "the" cause — that singular framing misleads more often than it helps. **A finished RCA names 3 or more fixable, systemic contributors, blamed on nobody, that shut a failure class down — never one throat to choke.** Every structure below exists to drag the inquiry past the first convenient answer, past the person, halting only at ground you can actually reshape.

## Standing Bets

Five axioms steer every motion:

1. **Trigger is not source.** "The deploy died because X crashed" is usually where the real inquiry *opens*, not where it shuts.
2. **Singles are rare.** Breaks carry several contributors — sharp-end slips (what someone did) stacked on quiet weaknesses (what the setup permitted). Reason's layered-defense picture.
3. **People are never the terminal answer.** "Operator slip" halts inquiry; it never completes it. When a human could err, the setup allowed it. Dig on.
4. **Fixability sets the floor.** A cause is "deep enough" when it suggests a change you can ship. Shallower misses the remedy; deeper ("physics") leaves you nothing to hold.
5. **Bias hunts the hunter.** Hindsight, confirmation, single-cause, and outcome biases all rot inquiries from inside. The scaffolding exists to fight them.

## When It Pays

**Reach for it:**

- **Any break or breach** — dead service, security event, deploy gone sideways.
- **Repeat offenders** — same-shaped defects returning despite patches.
- **Quality drift** — metrics sagging, users reporting one family of hurt.
- **Formal reviews** — blameless causal accounting after an incident.
- **Pre-launch probing** — run RCA in reverse with FMEA to catch modes early.
- **Security tracing** — event chain plus enabling controls plus quiet conditions.
- **Process misses** — a person or crew chronically off mark. The setup is probably the author.

**What it hands back:**

- **Contributors, plural** — fixable and systemic, never one scapegoat.
- **Quiet weaknesses exposed** — the aligned holes nobody charted.
- **Structural repairs** — changes to the machine, not bandages on the symptom.
- **Blameless pages** — crews can speak plainly without self-censorship tax.
- **Cross-break patterns** — after a few RCAs the repeat weaknesses glow.
- **Bias armor** — method forces the inquiry past the first cozy story.

**Standing test:** when the same failure family could return tomorrow morning, triage happened — not RCA.

## Pick Your Path

Match the motion to the ask.

| Path | Fits when | Doc |
|----------|---------|------|
| **FiveWhys** | "5 whys", "five whys", fast causal walk, keep asking why | `Workflows/FiveWhys.md` |
| **Fishbone** | "fishbone", "ishikawa", category-sorted cause chart, 6 M's / 4 P's / 8 M's | `Workflows/Fishbone.md` |
| **Postmortem** | "postmortem", "incident review", "blameless review", production break | `Workflows/Postmortem.md` |
| **FaultTree** | "fault tree", "fta", top-down deduction, safety-critical, AND/OR reasoning | `Workflows/FaultTree.md` |
| **KepnerTregoe** | "kepner tregoe", "is/is-not", "what moved", distinction work, elusive defects | `Workflows/KepnerTregoe.md` |

## Cheat Sheet

- **5 motions** — FiveWhys, Fishbone, Postmortem, FaultTree, KepnerTregoe
- **5 Whys:** straight or branching causal walk. Sharpest on single-thread breaks.
- **Fishbone:** 6 M's (Manpower, Machine, Method, Material, Measurement, Mother-Nature) for build contexts; 4 P's (People, Process, Policies, Procedures) for service contexts. Reach for it when several cause families smell involved.
- **Postmortem:** timeline plus contributors plus follow-through. Blameless voice is mandatory.
- **Fault Tree:** AND/OR gate reasoning, deductive, top-down. Sharpest where safety matters and paths multiply.
- **Kepner-Tregoe IS/IS-NOT:** contrast where the hurt lands against where it doesn't. Sharpest on shy, hard-to-repeat defects.

**On-demand background (load when depth is owed):**
- `Foundation.md` — Toyoda, Ishikawa, Reason, Gano, Google SRE; canonical methods
- `MethodSelection.md` — which motion fits which break

## Which Motion When

| Shape | Lead motion |
|-----------|---------------------|
| Single thread, one clear break point | **FiveWhys** |
| Several suspect families (people, process, tooling) | **Fishbone** |
| Live outage or security event owed a formal record | **Postmortem** |
| Branching multi-path break, safety-critical, needs Boolean rigor | **FaultTree** |
| Shy defect, "why here and nowhere else?" | **KepnerTregoe** |

For weighty breaks: **let Postmortem wrap the rest.** Open the Postmortem frame, then run 5 Whys, Fishbone, or FTA inside it as the investigative engine.

## Neighbors

**Needs:** nothing — self-contained analytic skill.

**Combines with:**
- **SystemsThinking** — RCA halts at contributors; SystemsThinking descends into structure and shared beliefs. Stack them when breaks rhyme across incidents.
- **FirstPrinciples** — split a contributor into bedrock truths before designing the repair.
- **RedTeam** — "how would we re-cause this?" is hostile RCA. Aim RedTeam at the remedies.
- **Science** — RCA *is* lab method aimed at failures. Borrow Science for hypothesis discipline mid-inquiry.

## Worked Invocations

**Overnight outage:**
```
User: "the payments service went down for 14 minutes last night"
→ Postmortem path
→ Timeline: deploy 23:47 → health green → traffic cut 23:49 → p99 climb 23:51 → auto-rollback 00:01
→ 5 Whys inside: p99 climbed on cold cache. Cold because fresh pods. No warming because the deploy script skips it. Skipped because the checklist predates caching.
→ Contributors: stale deploy template (quiet); missing warm step (sharp-end); no cold-cache canary (quiet)
→ Repairs: refresh the template, add warming, gate on a cold-cache canary
```

**Repeat defect:**
```
User: "users keep reporting the same kind of auth failure, we've fixed it 3 times"
→ Fishbone path
→ 6 M's sweep: People (ops rotates keys silently), Method (no rotation runbook), Machine (secret cache outlives rotation), Material (one shared key), Measurement (no expiry board), Mother-Nature (nil)
→ Several roots (Method plus Material plus Measurement). One-spot patching will not hold.
```

**Shy defect:**
```
User: "this flaky test only fails in CI, not locally"
→ KepnerTregoe path
→ IS/IS-NOT grid: dies on CI / lives locally; dies Tuesdays / survives other days; dies on shared runners / lives on dedicated; dies parallel / lives serial
→ Contrasts point at: zone plus concurrency plus shared disk
→ Bet: zone assumption plus /tmp race — both armed only inside CI's weather.
```

## Traps

- **"Human slip" opens inquiry; it never closes it.** Every slip stands on a setup that permitted or invited it.
- **First cozy cause is rarely the whole story.** Confirmation bias adores RCA. Keep walking after one find.
- **Halting at the trigger is failure.** "X crashed because Y returned null." Why did Y return null? Why did null pass through? Why did no test catch it? Descend.
- **Depth without grip is not virtue.** "The true cause is entropy" fixes nothing. Halt at the deepest fixable tier.
- **Past five whys, suspect a fork.** Asking "why" beyond ~5 usually means the chain branched. Redraw as a tree, not a line.
- **Coincidence is a hypothesis, not a verdict.** Two events co-occurring earns a test with a mechanism — never a conclusion.
- **Outcome tint is quiet poison.** Calls that ended badly read as foolish even when sound on the evidence available then. Judge the process apart from the ending.

---

**Lineage:** Sakichi Toyoda (5 Whys, Toyota shop-floor system), Kaoru Ishikawa (*Guide to Quality Control*, 1968; Fishbone), James Reason (*Human Error*, 1990; layered-defense picture), Dean Gano (*Apollo Root Cause Analysis*, 2008), Charles Kepner & Benjamin Tregoe (*The Rational Manager*, 1965), Google SRE volumes, Etsy blameless review culture (John Allspaw).

## Execution Log

After any path finishes, record one JSONL line:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"RootCauseAnalysis","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
