# CanonicalizeSkill Workflow

**Job:** reshape an existing skill into canonical form with correct naming.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the CanonicalizeSkill workflow in the CreateSkill skill to restructure skill"}' \
  > /dev/null 2>&1 &
```

Running the **CanonicalizeSkill** workflow in the **CreateSkill** skill to restructure skill...

---

## 1. Open the canon

**First and required:** read the shape definition:

```
DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md
```

That document is what "canonicalize" means.

---

## 2. Survey the current skill

```bash
DEVOS/skills/[skill-name]/SKILL.md
```

Catalog the defects:
- Multi-line `|` description?
- Standalone `triggers:` array? (OLD FORMAT)
- Standalone `workflows:` array? (OLD FORMAT)
- `USE WHEN` missing from the description?
- Routing absent from the markdown body?
- **Workflow files off TitleCase?**
- **Skill folder off TitleCase?**

---

## 3. Snapshot first

```bash
cp -r DEVOS/skills/[skill-name]/ ~/.claude/History/Backups/[skill-name]-backup-$(date +%Y%m%d)/
```

**Note:** snapshots land in `~/.claude/History/Backups/`, NEVER inside skill folders.

---

## 4. Fix TitleCase naming

**All names go TitleCase (PascalCase).**

### Skill folder
```
✗ WRONG: createskill, create-skill, create_skill, CREATESKILL
✓ CORRECT: Createskill (or CreateSkill for multi-word)
```

### Workflow filenames
```
✗ WRONG: create.md, CREATE.md, create-skill.md, create_skill.md
✓ CORRECT: Create.md, UpdateDaemonInfo.md, SyncRepo.md
```

### Reference filenames
```
✗ WRONG: prosody-guide.md, PROSODY_GUIDE.md
✓ CORRECT: ProsodyGuide.md, SchemaSpec.md, ApiReference.md
```

### Tool filenames
```
✗ WRONG: manage-server.ts, MANAGE_SERVER.ts
✓ CORRECT: ManageServer.ts (with ManageServer.help.md)
```

**Rename as needed:**
```bash
# Example: repair workflow filenames
cd DEVOS/skills/[SkillName]/Workflows/
mv create.md Create.md
mv update-info.md UpdateInfo.md
mv sync_repo.md SyncRepo.md
```

---

## 5. Flatten the tree

**Hard ceiling: 2 levels — `DEVOS/skills/SkillName/Category/`**

### Find over-deep folders

Look for anything at 3+ levels:

```bash
# Find any folders 3+ levels deep (FORBIDDEN)
find DEVOS/skills/[SkillName]/ -type d -mindepth 2 -maxdepth 3
```

### ❌ Recurring violations and their repairs

**Buried workflows:**
```
✗ WRONG: Workflows/Company/DueDiligence.md
✓ FIX: Workflows/CompanyDueDiligence.md
```

**Buried templates:**
```
✗ WRONG: Templates/Primitives/Extract.md
✓ FIX: Move to DEVOS/skills/Prompting/Extract.md (templates belong in Prompting)
```

**Buried tools:**
```
✗ WRONG: Tools/Utils/Helper.ts
✓ FIX: Tools/Helper.ts (or delete if unneeded)
```

### Flattening moves

1. **Spot nested files**: anything 3+ levels down
2. **Fold the path into the name**: `Category/File.md` → `CategoryFile.md`
3. **Lift to the parent**: move up to its proper slot
4. **Repoint citations**: search old paths, update callers

**Concrete repair:**
```bash
# Before (3 levels - WRONG)
DEVOS/skills/OSINT/Workflows/Company/DueDiligence.md

# After (2 levels - CORRECT)
DEVOS/skills/OSINT/Workflows/CompanyDueDiligence.md
```

**Rule:** many files get clearer names, NOT deeper folders.

---

## 6. Convert the YAML header

**Old shape (WRONG):**
```yaml
---
name: skill-name
description: |
  What the skill does.

triggers:
  - USE WHEN user mentions X
  - USE WHEN user wants to Y

workflows:
  - USE WHEN user wants to A: Workflows/a.md
  - USE WHEN user wants to B: Workflows/b.md
---
```

**New shape (CORRECT):**
```yaml
---
name: SkillName
description: What the skill does. USE WHEN user mentions X OR user wants to Y. Additional capabilities.
---
```

**What moved:**
- Skill name to TitleCase
- Description + triggers fused into one-line `description` with `USE WHEN`
- `triggers:` array deleted
- `workflows:` array out of YAML (down into the body)

---

## 6b. Plant routing in the body

Add the `## Workflow Routing` block to the markdown body:

```markdown
# SkillName

[Description]

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running **WorkflowName** in **SkillName**...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase one" | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "trigger phrase two" | `Workflows/WorkflowTwo.md` |

## Examples

[Required examples section]

## [Rest of documentation]
```

**Note:** routing names must equal filenames exactly (TitleCase).

---

## 7. Collapse duplicate routing

When the body already routes in some other idiom, fold it all into the one standard `## Workflow Routing` block. Delete the doubles.

---

## 8. Route every workflow

Enumerate:
```bash
ls DEVOS/skills/[SkillName]/Workflows/
```

Per file:
1. Confirm TitleCase (rename when off)
2. Confirm a `## Workflow Routing` row exists
3. Confirm the row names the exact filename

---

## 9. Plant the Gotchas block

**Required:** each skill gets `## Gotchas` after routing.

```markdown
## Gotchas

- [Known failure mode or API quirk]
- [Common mistake the model makes with this skill]
- [Ordering/sequencing demand that surprises]
```

For a fresh skill with no scars yet, stake the section with a placeholder:
```markdown
## Gotchas

_No gotchas documented yet. Add failures here as they're discovered._
```

Per Anthropic: "The highest information density in any Skill comes from gotchas sections."

---

## 9a. Disambiguate where needed

Where the skill shares words with neighbors, append `NOT FOR` to the description:
```yaml
description: ... USE WHEN [triggers]. NOT FOR [confusable alternative (use SkillName instead)].
```

---

## 9b. Run the BPE pass

Read each instruction asking whether the model could derive it alone. Strip lines that merely restate what it already knows. Keep what breaks its defaults.

---

## 9c. Weigh SKILL.md length

Past 500 lines, carve reference prose out into:
- Root-level context files (standing DevOS pattern)
- `References/` subdirectory for heavy reference material

SKILL.md stays a slim router.

---

## 10. Plant the walkthroughs block

**Required:** each skill gets `## Examples` with 2–3 concrete runs.

```markdown
## Examples

**Example 1: [Common use case]**
```
User: "[Typical user request]"
→ Invokes WorkflowName workflow
→ [What skill does]
→ [What user gets back]
```

**Example 2: [Another use case]**
```
User: "[Different request]"
→ [Process]
→ [Output]
```
```

Seat the block after Workflow Routing.

---

## 10b. Confirm

Walk the list:

### Naming (TitleCase)
- [ ] Skill folder TitleCase (e.g., `Blogging`, `Createskill`)
- [ ] Workflow files TitleCase (e.g., `Create.md`, `UpdateInfo.md`)
- [ ] Reference docs TitleCase (e.g., `ProsodyGuide.md`)
- [ ] Tool files TitleCase (e.g., `ManageServer.ts`)
- [ ] Routing rows equal filenames exactly

### YAML frontmatter
- [ ] `name:` TitleCase
- [ ] `description:` single line with embedded `USE WHEN`
- [ ] No `triggers:` or `workflows:` arrays
- [ ] Intent-led wording
- [ ] Under 1024 characters

### Markdown body
- [ ] `## Workflow Routing` present
- [ ] Table shape with Workflow, Trigger, File columns
- [ ] Every workflow file routed
- [ ] `## Examples` with 2–3 concrete runs

### Tree
- [ ] `tools/` exists (even empty)
- [ ] Workflows hold ONLY run procedures
- [ ] Reference prose at the skill root (not in Workflows/)
- [ ] No `backups/` inside the skill

---

## TitleCase crib

| Kind | Wrong | Right |
|------|-------|---------|
| Skill folder | `createskill`, `create-skill` | `Createskill` |
| Multi-word skill | `create_skill`, `CREATE_SKILL` | `CreateSkill` |
| Workflow file | `create.md`, `CREATE.md` | `Create.md` |
| Multi-word workflow | `update-info.md`, `UPDATE_INFO.md` | `UpdateInfo.md` |
| Reference doc | `api-reference.md` | `ApiReference.md` |
| Tool file | `manage-server.ts` | `ManageServer.ts` |

---

## Done

Skill reshaped to the SkillSystem.md canon with TitleCase naming end to end.
