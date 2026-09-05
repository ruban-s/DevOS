# UpdateSkill Workflow

**Job:** extend or adjust a live skill — new workflows, retuned triggers, doc refreshes — without breaking canonical shape or TitleCase.

---

## 1. Open the canon

**First and required:** read the shape definition:

```
DEVOS/SkillSystem.md
```

---

## 2. Study the live skill

```bash
DEVOS/skills/[SkillName]/SKILL.md
```

Absorb the current:
- Description (one line with USE WHEN)
- Routing block (in the markdown body)
- TitleCase naming in place

---

## 3. Scope the change

Name what moves:
- A workflow being added?
- Description/triggers being retuned?
- Docs being refreshed?

---

## 4. Apply it

### Adding a workflow:

1. **Settle the TitleCase name:**
   - ✓ `Create.md`, `UpdateDaemonInfo.md`, `SyncRepo.md`
   - ✗ `create.md`, `update-daemon-info.md`, `SYNC_REPO.md`

2. **Mint the file:**
```bash
touch DEVOS/skills/[SkillName]/Workflows/[WorkflowName].md
```

   Concrete:
```bash
touch DEVOS/skills/_MYSKILL/Workflows/UpdatePublicRepo.md
```

3. **Route it in SKILL.md's `## Workflow Routing`:**
```markdown
## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ExistingWorkflow** | "existing trigger" | `Workflows/ExistingWorkflow.md` |
| **NewWorkflow** | "new trigger" | `Workflows/NewWorkflow.md` |
```

4. **Author the workflow body**

### Retuning triggers:

Edit the one-line `description` in YAML frontmatter:
```yaml
description: [What it does]. USE WHEN [updated intent triggers using OR]. [Capabilities].
```

### Adding a tool:

1. **Mint TitleCase tool files:**
```bash
touch DEVOS/skills/[SkillName]/Tools/ToolName.ts
touch DEVOS/skills/[SkillName]/Tools/ToolName.help.md
```

2. **Guarantee the folder exists:**
```bash
mkdir -p DEVOS/skills/[SkillName]/Tools
```

---

## 5. Re-confirm TitleCase

After edits, list:

```bash
ls DEVOS/skills/[SkillName]/Workflows/
ls DEVOS/skills/[SkillName]/Tools/
```

Every file TitleCase:
- ✓ `WorkflowName.md`
- ✓ `ToolName.ts`, `ToolName.help.md`
- ✗ `workflow-name.md`, `tool_name.ts`

---

## 6. Run the list

### Naming
- [ ] Fresh workflow files TitleCase
- [ ] Fresh tool files TitleCase
- [ ] Routing rows equal filenames exactly

### Shape
- [ ] YAML keeps its one-line USE WHEN description
- [ ] No `triggers:` or `workflows:` arrays in YAML
- [ ] Body keeps `## Workflow Routing`
- [ ] All rows resolve to real files
- [ ] Fresh workflows all routed

---

## 7. Grade the version bump

Classify the change (patch / feature / major — see `## Versioning` in SKILL.md). The skill's own `version:` and the OS roll-up both land at private-sync through the `UpdateKaiRepo` ship flow (per-skill through `BumpSkillVersions.ts`) — do NOT hand-bump `version:` here, and CreateSkill never touches `DEVOS/VERSION` directly. (No ship flow on this box — it is maintainer machinery absent from public installs? Then hand-bump the skill's `version:` per the grade; leave `DEVOS/VERSION` alone.) A rename or a dropped/broken workflow is **major** — halt and confirm first.

## Done

Skill extended with canonical shape and TitleCase naming intact.
