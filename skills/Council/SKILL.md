---
name: Council
version: 1.1.20
description: "Convenes a multi-agent debate of topic-briefed custom agents that argue to find the best path — visible round-by-round transcripts with real intellectual friction — as a 3-round DEBATE or a 1-round QUICK check. USE WHEN council, debate, multiple perspectives, weigh options, deliberate, get different views, what would experts say, pros and cons. NOT FOR pure adversarial attack (use RedTeam)."
context: fork
background: false
---

## Customization

**Before executing, check for user customizations at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Council/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Council skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Council** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# Council

## What It Does

A council is a panel of custom-briefed agents convened to argue one question. Members hold genuinely different positions, respond to what the others actually said, and keep at it round after round — the transcript of that friction is the product, capped by a synthesis. Two formats: **DEBATE**, the full three-round treatment for decisions that deserve it, and **QUICK**, a single round for a fast read on where perspectives fall.

## Why Briefed Members, Not Built-ins

Ask one model for an opinion and you get one frame with its particular blind spots. Ask for "pros and cons" and you get a flat list nobody defends and nobody attacks. Deliberation that actually exposes weak spots needs experts who disagree on the merits — and a bare built-in agent type with no persona agrees blandly with everything. So every member is a short brief written for the topic at hand: a name, a role, a stance, and the thing they'll push on, launched with `subagent_type: "general-purpose"`. Four *different* briefs, each with real domain depth and its own analytical angle, are what make the friction genuine. `CouncilMembers.md` holds the slot guidance and an example brief.

**Where Council ends and RedTeam begins:** Council is collaborative-adversarial — the panel debates to find the best path, and the output is a visible conversation transcript plus synthesis. RedTeam is purely adversarial — it attacks the idea and returns steelman plus counter-argument. Pure attack requests route to RedTeam, not here.

## Workflow Routing

Route to the appropriate workflow based on the request.

| Trigger | Workflow |
|---------|----------|
| Full structured debate (3 rounds, visible transcript) | `Workflows/Debate.md` |
| Quick consensus check (1 round, fast) | `Workflows/Quick.md` |

Pure adversarial analysis is not a Council workflow — redirect to the RedTeam skill.

## Quick Reference

| Workflow | Purpose | Rounds | Output |
|----------|---------|--------|--------|
| **DEBATE** | Full structured discussion | 3 | Complete transcript + synthesis |
| **QUICK** | Fast perspective check | 1 | Initial positions only |

Reach for QUICK on sanity checks; save DEBATE for the questions where the transcript itself is worth having.

## Context Files

| File | Content |
|------|---------|
| `CouncilMembers.md` | How to write council member briefs inline |
| `RoundStructure.md` | Three-round debate structure and timing |
| `OutputFormat.md` | Transcript format templates |

## How a Debate Runs

Members within a round execute in parallel; rounds run sequentially. A 3-round debate of 4 agents is 12 agent calls but only 3 sequential waits — a complete DEBATE lands in roughly 40–90 seconds. The underlying bet: good decisions come from diverse perspectives challenging each other directly, not from opinions collected side by side and averaged.

## Examples

```
"Council: Should we use WebSockets or SSE?"
→ four briefs (real-time architect, frontend-DX, ops skeptic, researcher)
→ DEBATE workflow → 3-round transcript

"Quick council check: Is this API design reasonable?"
→ four API-relevant briefs
→ QUICK workflow → initial positions

"Council: Is AI overhyped?"
→ AI builder, security skeptic, pragmatic engineer, evidence analyst
→ DEBATE workflow → 3-round transcript
```

## Works Well With

- **RedTeam** — pure adversarial attack after the collaborative round
- **Research** — gather context before convening the panel

## Gotchas

- **Council members are inline briefs launched with `general-purpose` — there is no composition tool.** Write four different topic-specific briefs; a bare built-in type with no persona produces bland agreement.
- **Debates need genuine disagreement to be valuable.** If every agent agrees, the topic probably doesn't warrant Council.
- **More agents ≠ better debate.** 4–6 well-briefed members outperform 12 generic ones.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Council","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.
