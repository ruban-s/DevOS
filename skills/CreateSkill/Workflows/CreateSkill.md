# CreateSkill Workflow

Raise a new skill in canonical shape with TitleCase naming throughout.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CreateSkill workflow in the CreateSkill skill to create new skill"}' \
  > /dev/null 2>&1 &
```

Running the **CreateSkill** workflow in the **CreateSkill** skill to create new skill...

## Phase 1: Study the canon first

**Non-skippable opening moves:**

1. Read the skill system doctrine: `DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md`
2. Open one healthy public skill under `DEVOS/skills/` (e.g. `Research/SKILL.md`, `Daemon/SKILL.md`) and note how its frontmatter, voice notice, routing table, and walkthroughs fit together.

## Phase 2: Pin down the ask

Draw out of the operator:
1. What the skill does
2. Which phrases should summon it
3. Which workflows it needs

## Phase 2a: Set the skill type

Sort the skill into the 9 Anthropic types (type table in SKILL.md):

| # | Type | Structural accent |
|---|------|----------------------|
| 1 | Library/API Reference | Gotcha-dense, reference snippets |
| 2 | Product Validation | Browser/tmux, state assertions |
| 3 | Data Fetching | Credentials, query patterns |
| 4 | Business Process | Execution logs, consistency |
| 5 | Code Scaffolding | Templates, project-aware scripts |
| 6 | Code Quality | Deterministic scripts, hook integration |
| 7 | CI/CD & Deployment | Safety gates, rollback, smoke tests |
| 8 | Operations Runbook | Phenomenon → diagnosis → report |
| 9 | Infrastructure Ops | Safety guardrails, audit logging |

Structure follows type — a Type 1 skill is mostly gotchas, a Type 7 leans on safety gates.

## Phase 2b: Run the BPE gate

Before building, hold the idea against the bitter test: **"Would a smarter model make this skill unnecessary?"**

- Knowledge the model can't derive (API quirks, org decisions) → **build**
- Powers the model can't replicate (API calls, automation) → **build**
- Mere choreography of the model's own reasoning → **challenge the need**

## Phase 3: Fix TitleCase names

**Every name ships TitleCase (PascalCase).**

| Piece | Shape | Example |
|-----------|--------|---------|
| Skill directory | TitleCase | `Blogging`, `Daemon`, `CreateSkill` |
| Workflow files | TitleCase.md | `Create.md`, `UpdateDaemonInfo.md` |
| Reference docs | TitleCase.md | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | TitleCase.ts | `ManageServer.ts` |
| Help files | TitleCase.help.md | `ManageServer.help.md` |

**Never ship:**
- `create-skill`, `create_skill`, `CREATESKILL` → `CreateSkill`
- `create.md`, `CREATE.md`, `create-info.md` → `Create.md`, `CreateInfo.md`

## Phase 4: Raise the directories

```bash
mkdir -p DEVOS/skills/[SkillName]/Workflows
mkdir -p DEVOS/skills/[SkillName]/Tools
```

**Concrete shape:**
```bash
mkdir -p DEVOS/skills/_MYSKILL/Workflows
mkdir -p DEVOS/skills/_MYSKILL/Tools
```

## Phase 5: Draft SKILL.md

Build it to this skeleton:

```yaml
---
name: SkillName
version: 1.0.0
description: [What it does]. USE WHEN [intent triggers using OR]. NOT FOR [confusable alternatives]. [Additional capabilities].
---

# SkillName

[Brief description]

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running WORKFLOWNAME in SKILLNAME"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running **WorkflowName** in **SkillName**...
   ```

**Full documentation:** `DEVOS/RUNTIME/DOCS/Notifications/NotificationSystem.md`

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "another trigger" | `Workflows/WorkflowTwo.md` |

## Examples

**Example 1: [Common use case]**
```
User: "[Typical user request]"
→ Invokes WorkflowOne workflow
→ [What skill does]
→ [What user gets back]
```

**Example 2: [Another use case]**
```
User: "[Different request]"
→ [Process]
→ [Output]
```

## Gotchas

[Known failure modes, API quirks, common mistakes — accumulate over time]

## [Additional Documentation]

[Any other relevant info]
```

**Big skills (>500 lines):** park deep API docs, long samples, or troubleshooting in a `References/` subdirectory. SKILL.md stays the router.

### Phase 5a: Sufficiency gate (Algorithm v6.7.0 — REQUIRED for new skills yielding substantive artifacts)

Skills producing a substantive artifact (neither pure lookup nor pure transform) MUST carry a Step 0 in their primary workflow:

```markdown
## Step 0 — Sufficiency Check (v6.7.0)

Before executing this skill's substantive workflow, verify context sufficiency:

1. Read the user-prompt arguments and recent conversation.
2. Ask: *do I have what I need to produce a hard-to-vary artifact, or am I about to speculate?*
3. If speculating but workable: emit a one-line NATIVE-form ambiguity flag (`⚠️ Picking X over Y because R; redirect if wrong.`); ship the best-effort version; let the user redirect.
4. If clearly insufficient (would produce structurally wrong output): emit ≤3 questions, `proceed` override available, halt until answered or override given.

Skip Step 0 when the skill is a pure transform (input → deterministic output, no interpretation) or a pure lookup.
```

Template-level default — fresh skills include it. Backfitting older skills (Sales, WriteStory, Webdesign, etc.) is tracked follow-up work on the maintainer machine — does not ship. Re-open trigger: first concrete skill-author commit of a Step 0 (then add `skills_with_step0: []` migration ledger).

## Phase 5b: Release readiness (MANDATORY)

**Each skill under `DEVOS/skills/` travels with the DevOS public release.** Draft generic on day one — never count on a release-time scrub.

### Must-haves

1. **Nothing sensitive** — no API keys, tokens, credentials, private URLs, auth secrets, private data
2. **Nothing personal** — no author name, no specific project names, no personal domains, no first-person war stories, no per-user absolute paths like `/Users/<name>/...`
3. **Neutral framing** — "someone reports a bug" over a named reporter; "your web project" over a personal site; "a common root cause" over a ticket-coded one

### Personal context has one home

Per-user preferences, project names, domain lists, and war stories belong in `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/` — the body loads them at run time through the Customization block. True for **all** skills, public and private (2026-07-23 separation directive): a private `_ALLCAPS` body is publish-clean code, its sensitive data sits under `DEVOS/PROFILE/`.

### Deterministic gate

Finalize nothing by hand-rolled grep (hardcoded patterns decay and miss most of the deny-list) — run the gate:
```bash
bun DEVOS/Tools/SkillHygieneGate.ts --skill <SkillName>
```

Exit 0 = ready. Any hit = move the data to `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/` (or its canonical USER home) and cite it by path. The gate reads `DEVOS/PROFILE/SECURITY/DENY_LIST.txt`, so it tracks the release pipeline exactly. The write-time SystemFileGuard separately blocks deny-listed tokens at edit time. For bare first-names the deny-list deliberately skips (attribution contexts), additionally grep the skill for the principal's and partner's first names (from the identity files) and neutralize any that aren't a public citation or a working detection pattern.

## Phase 6: Add the workflow files

One file per routing-table entry:

```bash
touch DEVOS/skills/[SkillName]/Workflows/[WorkflowName].md
```

### Workflows that call CLI tools MUST map intent to flags (REQUIRED)

**A workflow fronting a CLI tool carries intent-to-flag tables.**

The pattern converts plain user language into exact CLI flags:

```markdown
## Intent-to-Flag Mapping

### Model/Mode Selection

| User Says | Flag | When to Use |
|-----------|------|-------------|
| "fast", "quick", "draft" | `--model haiku` | Speed priority |
| (default), "best", "high quality" | `--model opus` | Quality priority |

### Output Options

| User Says | Flag | Effect |
|-----------|------|--------|
| "JSON output" | `--format json` | Machine-readable |
| "detailed" | `--verbose` | Extra information |

## Execute Tool

Based on user request, construct the CLI command:

\`\`\`bash
bun ToolName.ts \
  [FLAGS_FROM_INTENT_MAPPING] \
  --required-param "value"
\`\`\`
```

**Why the tables exist:**
- Tools configure richly through flags
- Workflows should surface that range, not pin one call shape
- Operators speak loosely; workflows render it precise

**Reference:** `DEVOS/RUNTIME/DOCS/Tools/CliFirstArchitecture.md` (Workflow-to-Tool Integration section)

**TitleCase touch targets:**
```bash
touch DEVOS/skills/MyDaemon/Workflows/UpdateDaemonInfo.md
touch DEVOS/skills/MyDaemon/Workflows/UpdatePublicRepo.md
touch DEVOS/skills/MyBlog/Workflows/Create.md
touch DEVOS/skills/MyBlog/Workflows/Publish.md
```

## Phase 7: Confirm TitleCase

Inspect:
```bash
ls DEVOS/skills/[SkillName]/
ls DEVOS/skills/[SkillName]/Workflows/
ls DEVOS/skills/[SkillName]/Tools/
```

Everything TitleCase:
- `SKILL.md` ✓ (standing exception — always uppercase)
- `WorkflowName.md` ✓
- `ToolName.ts` ✓
- `ToolName.help.md` ✓

## Phase 8: Ship checklist

### Naming (TitleCase)
- [ ] Skill folder TitleCase (e.g., `Blogging`, `Daemon`)
- [ ] Workflow files TitleCase (e.g., `Create.md`, `UpdateInfo.md`)
- [ ] Reference docs TitleCase (e.g., `ProsodyGuide.md`)
- [ ] Tool files TitleCase (e.g., `ManageServer.ts`)
- [ ] Routing rows name files exactly

### YAML frontmatter
- [ ] `name:` TitleCase
- [ ] `description:` single line with embedded `USE WHEN`
- [ ] `NOT FOR` line present where confusable neighbors exist
- [ ] No standalone `triggers:` or `workflows:` arrays
- [ ] Intent-led wording
- [ ] Under 1024 characters

### Markdown body
- [ ] `## Voice Notification` present (skills with workflows)
- [ ] `## Workflow Routing` table present
- [ ] Every workflow file routed
- [ ] `## Gotchas` present with known failure modes
- [ ] `## Examples` with 2–3 concrete runs
- [ ] SKILL.md under 500 lines (overflow to References/ or root files)

### Tree
- [ ] `Tools/` exists (even empty)
- [ ] No `backups/` inside the skill
- [ ] `References/` carrying the overflow for big skills

### BPE fit
- [ ] Skill teaches what the model can't derive alone
- [ ] No compensating for model limits
- [ ] Type recorded (type table in SKILL.md)

### Release readiness
- [ ] No sensitive material (API keys, tokens, credentials, private URLs)
- [ ] No personal pointers (author name, project names, personal domains, per-user paths)
- [ ] Neutral framing throughout ("someone", "your project", never personal identifiers)
- [ ] `SkillHygieneGate.ts --skill <SkillName>` exits 0 (publish-clean, public and private alike)

### CLI-first wiring (skills with CLI tools)
- [ ] Tools configure through flags (see CliFirstArchitecture.md)
- [ ] Calling workflows carry intent-to-flag tables
- [ ] Tables span mode, output, and resource choice where relevant

## Phase 9: Propose proving it

Once the shape is up, offer the operator:

> "The skill structure is ready. Want me to **test it** to see if it actually improves outcomes? I can run it against real prompts and compare with a no-skill baseline using the TestSkill workflow."

On yes, run `Workflows/TestSkill.md`.

On trigger trouble, offer `Workflows/OptimizeDescription.md`.

## Phase 10: Version note

A fresh skill scaffolds at `version: 1.0.0` in frontmatter (its own per-skill semver line) and counts as a **feature**-level OS change too (see `## Versioning` in SKILL.md). Touch neither `DEVOS/VERSION` nor the skill's `version:` here — both bumps land at private-sync via the `UpdateKaiRepo` ship flow (per-skill through `BumpSkillVersions.ts`, OS roll-up through the version-bump workflow). (On a box without that maintainer machinery, the scaffolded `version: 1.0.0` is already right — later edits hand-bump per semver.)

## Done

Skill raised in canonical shape with TitleCase naming end to end.
