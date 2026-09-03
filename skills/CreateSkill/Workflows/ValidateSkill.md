# ValidateSkill Workflow

**Job:** measure an existing skill against canonical shape and TitleCase naming.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the ValidateSkill workflow in the CreateSkill skill to validate skill structure"}' \
  > /dev/null 2>&1 &
```

Running the **ValidateSkill** workflow in the **CreateSkill** skill to validate skill structure...

---

## 1. Open the canon

**First and required:** read the shape definition:

```
DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md
```

---

## 2. Open the skill under test

```bash
DEVOS/skills/[SkillName]/SKILL.md
```

---

## 3. Grade TitleCase naming

### Skill folder
```bash
ls DEVOS/skills/ | grep -i [skillname]
```

Pass marks:
- ✓ `Blogging`, `Daemon`, `CreateSkill`
- ✗ `createskill`, `create-skill`, `CREATE_SKILL`

### Workflow files
```bash
ls DEVOS/skills/[SkillName]/Workflows/
```

Pass marks:
- ✓ `Create.md`, `UpdateDaemonInfo.md`, `SyncRepo.md`
- ✗ `create.md`, `update-daemon-info.md`, `SYNC_REPO.md`

### Tool files
```bash
ls DEVOS/skills/[SkillName]/Tools/
```

Pass marks:
- ✓ `ManageServer.ts`, `ManageServer.help.md`
- ✗ `manage-server.ts`, `MANAGE_SERVER.ts`

---

## 4. Grade the YAML frontmatter

The header must read:

### One-line description carrying USE WHEN
```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
---
```

**Fail on sight:**
- Multi-line `|` description (WRONG)
- No `USE WHEN` keyword (WRONG)
- Standalone `triggers:` array (OLD FORMAT — WRONG)
- Standalone `workflows:` array (OLD FORMAT — WRONG)
- `name:` not TitleCase (WRONG)

---

## 5. Grade the markdown body

The body must carry:

### Routing block
```markdown
## Workflow Routing

**When executing a workflow, output this notification:**

```
Running **WorkflowName** in **SkillName**...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |
```

**Fail on sight:**
- No `## Workflow Routing` block
- Routing names not TitleCase
- Row paths diverging from real filenames

### Walkthroughs block
```markdown
## Examples

**Example 1: [Use case]**
```
User: "[Request]"
→ [Action]
→ [Result]
```
```

**Fail when absent:** walkthroughs are required (WRONG if missing)

### Gotchas block
```markdown
## Gotchas

[Known failure modes, API quirks, common mistakes]
```

**Fail when absent:** the gotchas block is required (WRONG if missing). Per Anthropic practice it holds the densest information in the skill.

### Disambiguation (skills with confusable neighbors)

**Fail when absent:** where vocabularies collide, the description needs a `NOT FOR` line:
```yaml
description: ... USE WHEN [triggers]. NOT FOR [what this ISN'T for (use SkillName instead)].
```

Watch research-flavored pairs (Research vs investigation skills), security-flavored pairs (assessment vs reconnaissance), publishing-flavored pairs (blog vs newsletter).

---

## 5a-prelude: Publish-clean gate

Every body — public `TitleCase` AND private `_ALLCAPS` (2026-07-23 separation directive) — must read publish-clean, sensitive data cited from `DEVOS/PROFILE/`. Run the deterministic gate, never a hand-rolled grep (hardcoded patterns decay and skip most of the deny-list):

```bash
bun DEVOS/Tools/SkillHygieneGate.ts --skill <SkillName>
```

The gate consults the canonical `DEVOS/PROFILE/SECURITY/DENY_LIST.txt` (the release pipeline's own source) and flags identity strings, home-path literals, and git-tracked vendored deps. It also runs inside `/ic`, and the write-time SystemFileGuard stops deny-listed tokens at edit time.

**Exit 0 = PASS.** Any hit = FAIL: relocate the material to `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/` (or its canonical USER home) and cite it by path. Extra checks outside the gate's reach:
- Hardcoded secrets, API keys, tokens, bearer credentials (zero tolerance) — env-var *names* only, values in `~/.claude/.env`.
- Bare first-names the deny-list skips for attribution: grep the skill for the principal's and partner's first names (from the identity files) and neutralize any that aren't a public citation or a working detection pattern.

---

## 5a: BPE fit check

Hold the skill's instructions to the bitter test:

- [ ] Each line teaches what the model can't derive alone
- [ ] Nothing compensates for model limits (format nagging, reasoning scaffolds)
- [ ] Repeatable mechanics live in deterministic scripts, not prompt workarounds
- [ ] SKILL.md stays under 500 lines (overflow belongs in References/ or root context files)

---

## 5b: Official-spec drift scan (advisory)

The local canon sits in `SkillSystem.md`, but the format it encodes is Anthropic's — and Anthropic revises it. Check the upstream surface so home doctrine can't quietly part from what the harness parses:

- **Agent Skills docs:** https://code.claude.com/docs/en/skills
- **Reference skills repo:** https://github.com/anthropics/skills

Pull the docs page and set its frontmatter contract (known fields, description caps, loading behavior) beside what `SkillSystem.md` and this workflow claim. Log any split as a finding with both sides quoted — drift here indicts OUR doctrine, not the skill under test.

Advisory only: an unreachable URL earns a `⏳ skipped (unreachable)` note and validation rolls on; drift is reported, never auto-adopted. Send confirmed drift to the principal or an Upgrade-skill recommendation.

---

## 6. Grade the workflow files

```bash
ls DEVOS/skills/[SkillName]/Workflows/
```

Confirm:
- Every filename TitleCase
- Every file routed in `## Workflow Routing`
- Every routing row resolving to a real file
- Row names matching filenames exactly

---

## 7. Grade the tree

```bash
ls -la DEVOS/skills/[SkillName]/
```

Confirm:
- `tools/` exists (even empty)
- No `backups/` inside the skill
- Reference prose at the skill root (not inside Workflows/)

---

## 7a: CLI-first wiring (skills with CLI tools)

**When `tools/` holds CLI tools:**

### Flag-driven configuration

Probe each tool:
```bash
bun DEVOS/skills/[SkillName]/Tools/[ToolName].ts --help
```

The tool should configure behavior through flags:
- Mode flags (--fast, --thorough, --dry-run) where fitting
- Output flags (--format, --quiet, --verbose)
- Resource flags (--model, etc.) where fitting
- Post-processing flags where fitting

### Intent tables in calling workflows

Look for the mapping tables:

```bash
grep -l "Intent-to-Flag" DEVOS/skills/[SkillName]/Workflows/*.md
```

**Required shape in CLI-calling workflows:**
```markdown
## Intent-to-Flag Mapping

| User Says | Flag | When to Use |
|-----------|------|-------------|
| "fast" | `--model haiku` | Speed priority |
| (default) | `--model sonnet` | Balanced |
```

**Reference:** `DEVOS/RUNTIME/DOCS/Tools/CliFirstArchitecture.md`

---

## 8. Deliver the verdict

**COMPLIANT** when everything passes:

### Naming (TitleCase)
- [ ] Skill folder TitleCase
- [ ] Workflow files TitleCase
- [ ] Reference docs TitleCase
- [ ] Tool files TitleCase
- [ ] Routing rows match filenames

### YAML frontmatter
- [ ] `name:` TitleCase
- [ ] `description:` single line with `USE WHEN`
- [ ] No `triggers:` or `workflows:` arrays
- [ ] Under 1024 characters

### Markdown body
- [ ] `## Workflow Routing` present
- [ ] `## Gotchas` present with known failure modes
- [ ] `## Examples` with 2–3 patterns
- [ ] All workflows routed
- [ ] SKILL.md under 500 lines

### Prose quality (Anthropic practice)
- [ ] `NOT FOR` present where neighbors confuse
- [ ] Lines target what breaks model defaults (nothing obvious stated)
- [ ] No model-limit compensation (BPE gate)
- [ ] Latitude fits the task (exact where fragile, loose where safe)

### Release readiness
- [ ] No sensitive material (API keys, tokens, credentials, private URLs)
- [ ] No personal pointers (author name, project names, personal domains, per-user absolute paths)
- [ ] `SkillHygieneGate.ts --skill <SkillName>` exits 0 (publish-clean, public and private alike)
- [ ] Per-user content (if any) in `CUSTOMIZATIONS/SKILLS/`, never the body

### Tree
- [ ] `Tools/` exists
- [ ] No `backups/` inside
- [ ] `References/` used sensibly for big skills

### CLI-first wiring (skills with CLI tools)
- [ ] Tools configure through flags (nothing hardcoded)
- [ ] Calling workflows carry intent-to-flag tables
- [ ] Tables span mode, output, and resource choice where relevant

**NON-COMPLIANT** on any failure. Point at the CanonicalizeSkill workflow.
