---
name: CreateSkill
version: 1.1.32
description: "Owns every DevOS skill job end to end — scaffold a skill, edit or extend it with a workflow or tool, rename it, validate it, canonicalize it, then prove it works. Hand-rolled skill files are forbidden; this skill runs the whole arc. USE WHEN create skill, new skill, make a skill, build a skill, set up a skill, private skill, make a X skill, add a workflow, add a tool, edit/change/update/rename a skill, skill frontmatter, validate skill, check skill, canonicalize, scaffold skill, test skill, improve skill, optimize description, skill not triggering, overtriggering. NOT FOR TypeScript CLI generation (use CreateCLI)."
---

## Customization

**Before running anything, look for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/CreateSkill/`

When that folder exists, read any PREFERENCES.md or config files inside and let them take precedence over the defaults below. When it is absent, continue with the built-in behavior.

# CreateSkill

One orchestrator owns another skill's entire life. The **shape half** — scaffold, validate, canonicalize — holds skills inside DevOS conventions. The **performance half** — test, improve, tune triggers — draws on Anthropic's skill-creator practice and proves a skill actually works and fires when it should. Writing skill files by hand, outside this orchestrator, is the forbidden path.

## Before Any Build

Two reads, every time:

1. **The doctrine:** `DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md` — the canonical shape rules this skill enforces.
2. **A healthy model:** any well-formed public skill under `DEVOS/skills/` — `Research/SKILL.md`, `Daemon/SKILL.md`, or this `CreateSkill/SKILL.md` itself.

## Anatomy of a Skill

Three parts, no more: a `SKILL.md` (frontmatter plus routing body), a `Workflows/` directory of procedures, and a `Tools/` directory of deterministic scripts — present even when empty. The layers divide the labor: the frontmatter description decides whether the harness loads the skill at all; the body's routing table aims a request at the right workflow file; the gotchas section carries the failure knowledge no model could derive on its own. Depth stays shallow (Flat Trees, below) and the frontmatter stays lean — a single-line description, no legacy arrays.

## Pick a Workflow

### Shape workflows (scaffolding and conventions)

| Workflow | Say this | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill" | `Workflows/CreateSkill.md` |
| **ValidateSkill** | "validate skill", "check skill" | `Workflows/ValidateSkill.md` |
| **UpdateSkill** | "update skill", "add workflow" | `Workflows/UpdateSkill.md` |
| **CanonicalizeSkill** | "canonicalize", "fix skill structure" | `Workflows/CanonicalizeSkill.md` |

### Performance workflows (testing and trigger tuning)

| Workflow | Say this | File |
|----------|---------|------|
| **TestSkill** | "test skill", "does this skill work", "skill not working" | `Workflows/TestSkill.md` |
| **ImproveSkill** | "improve skill", "skill quality", "fix skill instructions" | `Workflows/ImproveSkill.md` |
| **OptimizeDescription** | "optimize description", "skill not triggering", "trigger accuracy" | `Workflows/OptimizeDescription.md` |

## Nine Types — Classify Before Building

The type steers structural and testing choices, so settle it first (taxonomy after Anthropic's internal skill survey, Thariq Shihipar, Mar 2026).

| Type | What it's for | Structural signature | Example |
|------|---------------|----------------------|---------|
| 1. Library/API Reference | Pitfalls and edge cases the model gets wrong | Lean, gotcha-dense, snippet-led | HonoReference, D1Reference |
| 2. Product Validation | Proving code runs | State assertions, browser automation, recorded output | Browser |
| 3. Data Fetching | Reaching data systems | Credential refs, query shapes, dashboard pointers | USMetrics, a business-metrics skill |
| 4. Business Process | Repeating a workflow reliably | Run logs, consistency tracking | a task-tracker skill, a syndication skill |
| 5. Code Scaffolding | Emitting framework boilerplate | Template files, project-aware scripts | CreateCLI, CreateSkill |
| 6. Code Quality | Holding standards, reviewing | Deterministic checks, hook wiring | /simplify, /code-review |
| 7. CI/CD & Deployment | Shipping safely | Pre-deploy gates, smoke probes, rollback | (gap — needs Deploy skill) |
| 8. Operations Runbooks | Symptom to diagnosis | Phenomenon → tool → query → report | a site-health skill |
| 9. Infrastructure Ops | Upkeep with guardrails | Safety gates, audit trails, orphan scans | a system-management skill, a dotfiles skill |

## Naming — Public or Private, Exactly Two Forms

**A skill's name declares its audience. Two shapes are legal; nothing between them.**

| Audience | Directory shape | Example | What may live inside |
|------------|------------------|---------|-----------------|
| **Public** | `TitleCase` | `Blogging`, `Daemon`, `CreateSkill` | Templated, safe, generic, release-ready |
| **Private** | `_ALLCAPS` (leading underscore, all caps) | `_MYSKILL`, `_MYINBOX`, `_MYINFRA` | Personally-scoped *function*; body stays publish-clean, sensitive values referenced from `DEVOS/PROFILE/` |

**The underscore is the release boundary.** Shipping tooling ignores `_*` entirely — a private skill never leaves the machine's harness home (`~/.claude`). Public skills (bare names) are mirrored into the DevOS public release, so they must hold nothing but generic, templated material.

**File naming inside the folder (both audiences):**

| Piece | Shape | Example |
|-----------|--------|---------|
| Workflow files | `TitleCase.md` | `Create.md`, `UpdateDaemonInfo.md` |
| Reference docs | `TitleCase.md` | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | `TitleCase.ts` | `ManageServer.ts` |
| Help files | `TitleCase.help.md` | `ManageServer.help.md` |

**Never:**
- Skill dirs: `createskill`, `create-skill`, `CREATE_SKILL` (public takes bare caps-joined; private takes underscore + caps; kebab/snake nowhere)
- Files: `create.md`, `update-info.md`, `SYNC_REPO.md`

### Public or private — the one question

Ask: **"Could a stranger drop this skill into their own `DEVOS/skills/` and have it just work?"**

- **Yes** → public (`TitleCase`). Keep the body generic; per-user flavor layers in through `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/`.
- **No — it leans on my identity, contacts, business, customers, paid APIs, private infra, domains, private repos, partners, or financial/health/security data** → private (`_ALLCAPS`).

**Unsure, start private (`_ALLCAPS`).** Promoting `_FOO` → `Foo` later is cheap. Learning a public skill leaked your life is forever.

---

## Release Readiness (MANDATORY)

**Public skills (`TitleCase`) go to the world. Private skills (`_ALLCAPS`) stay on this machine.** The name decides sensitivity up front — never a per-file scrub at share time.

### The bright line

**Public skill (`TitleCase`) — body rule:**

Templated, safe, public, finished. Nothing else.

- ✅ Generic steps any DevOS operator could follow
- ✅ Templated patterns with placeholders for per-user values
- ✅ Public API references and public-tool dependencies
- ❌ Real names (people, products, companies, customers)
- ❌ Real domains, hostnames, IPs, internal URLs
- ❌ API keys, tokens, credentials, session cookies, OAuth secrets — even plausible-looking samples
- ❌ Private repo paths or pointers (`github.com/<org>/<private-repo>`)
- ❌ Customer data, customer-tied workflows, customer engagement context
- ❌ First-person incident stories bound to a specific event, project, or person
- ❌ Per-user filesystem paths (`/Users/<name>/...`, `/home/<name>/...`)
- ❌ Identity-tied preferences (assistant name, principal name, partner name, pet name, financial figures, health data)

**Private skill (`_ALLCAPS`) — body rule (2026-07-23 separation directive):**

Identical publish-clean bar as public. The underscore still decides where a skill ships (release tooling skips `_*` — that net stays up), but it no longer excuses embedded personal material. A private body — SKILL.md, workflows, tools — carries only generic code and instructions; anything sensitive is read by path from `DEVOS/PROFILE/`:

- Personal material (corpora, inventories, preferences, registries, state) → `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/` — unless a canonical USER home already owns it (`GEAR.md`, `FINANCES/`, `CONTACTS.md`); then link there, never copy.
- Personal config (domains, account IDs, repo paths, endpoints) → a `Config.md`/`.yaml` in that same CUSTOMIZATIONS dir, loaded at run time.
- Credentials → env var *names* in the skill, values in `~/.claude/.env`. Never values, never tokens inside URLs.
- Prose says "the principal," never a real name; no home-path literals (`~`-relative or config-resolved paths only).

Why: held this way, a private skill promotes to public with a rename, the whole tree clears one hygiene gate, and a leak of the skills tree leaks no life data. Privacy comes from the skill's *function* being personal (your inbox, your customer, your infra) — not from secrets sitting in its files.

**Enforcement:** `DEVOS/Tools/SkillHygieneGate.ts` (deny-list clean, runs inside `/ic`) plus the SystemFileGuard write gate. A skill the gate flags is an unfinished skill.

### The routing test

When any of the following wants to go into a skill body, that skill MUST be `_ALLCAPS`:

| The skill names… | So the skill is |
|------------------------|---------------|
| A real person (you, partner, team, customer) | `_ALLCAPS` |
| A product you own or sell | `_ALLCAPS` |
| A customer or client | `_ALLCAPS` |
| A paid API account, billing realm, or subscription | `_ALLCAPS` |
| A private domain, hostname, internal IP, or VPN | `_ALLCAPS` |
| A private repo, dotfile spot, or local infra | `_ALLCAPS` |
| A company-bound business process | `_ALLCAPS` |
| A financial, health, security, or legal context | `_ALLCAPS` |
| A specific incident or one-off war story | `_ALLCAPS` |
| Anything wrong, embarrassing, or unsafe in a stranger's `~/.claude/` | `_ALLCAPS` |

None of the above, fully generic — `TitleCase` (public) is fine.

### Personal layering on public skills

Tune a public skill per operator at run time with `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/PREFERENCES.md`. Body stays generic; the customization file overlays instance context. Reach for this when a skill is fundamentally shared but gains from per-user taste (voice, default formats, style).

**Never use CUSTOMIZATIONS/SKILLS to sneak private material into a public body.** When the skill *needs* private context to run (real customer name, real API account, real internal infra), it is private — name it `_ALLCAPS` and stop.

### Fine inside public skills

- Generic `~/` paths (`DEVOS/skills/`, `~/Projects/<tool>/`) — resolved per user
- Public repo URLs for depended-on tools
- Public API endpoints that are convention, not secret (e.g., `http://localhost:3000` for a local dev server)
- Sample values flagged as placeholders (`<url>`, `<SESSION_ID>`, `test@example.com`)
- Generic env var *names*, never values: `STRIPE_API_KEY`, `OPENAI_API_KEY`

### Pre-flight gate (EVERY skill — public and private)

Ahead of shipping or changing ANY skill, run the hygiene gate:
```bash
bun DEVOS/Tools/SkillHygieneGate.ts --skill <SkillName>
```

It reads the canonical deny-list (`DEVOS/PROFILE/SECURITY/DENY_LIST.txt` — identity DATA, so it lives in the USER tree) plus home-path shapes. Exit 0 = clean. Any hit = relocate the data to `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/<SkillName>/` (or its canonical USER home) and point at it by path. Since 2026-07-23 no private-skill exemption exists — `_ALLCAPS` decides where a skill *ships* (nowhere), not what its files may hold.

---

## Flat Trees (MANDATORY)

**Keep the tree FLAT — two levels, no more.**

### The rule

**Deepest allowed:** `DEVOS/skills/SkillName/Category/`

### ✅ Fine (≤ 2 levels)

```
DEVOS/skills/SkillName/SKILL.md                    # Skill root
DEVOS/skills/SkillName/Workflows/Create.md         # Workflow — one level down — GOOD
DEVOS/skills/SkillName/Tools/Manage.ts             # Tool — one level down — GOOD
DEVOS/skills/SkillName/QuickStartGuide.md          # Context file — in root — GOOD
DEVOS/skills/SkillName/Examples.md                 # Context file — in root — GOOD
```

### ❌ Out (too deep OR misplaced)

```
DEVOS/skills/SkillName/Resources/Guide.md              # Context files live in root, NOT Resources/
DEVOS/skills/SkillName/Docs/Examples.md                # Context files live in root, NOT Docs/
DEVOS/skills/SkillName/Workflows/Category/File.md      # THREE levels — NO
DEVOS/skills/SkillName/Templates/Primitives/File.md    # THREE levels — NO
DEVOS/skills/SkillName/Tools/Utils/Helper.ts           # THREE levels — NO
```

### Folders that may exist

**Permitted subdirectories:**
- **Workflows/** — runnable procedures ONLY
- **Tools/** — executable scripts/tools ONLY
- **References/** — long-form reference for big skills (API docs, deep guides)

**Prose context (guides, references) belongs in the skill ROOT or in References/.**

**Reach for References/ when:** SKILL.md passes ~500 lines and carries encyclopedic weight (API signatures, long samples, troubleshooting). Keep SKILL.md the router; move the encyclopedia out.

### Why flat wins

1. **Findability** — every file is one glance away
2. **Simplicity** — no directory spelunking
3. **Speed** — faster reads and writes
4. **Uniformity** — each skill looks like the last

**Many workflows to sort? Use sharper filenames, not deeper folders:**

**See:** `DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md` (Flat Folder Structure section)

---

## Slim Entry, Rich Detail (Big Skills)

**Skills whose SKILL.md tops 100 lines:** keep the entry slim and load the rest on demand.

### Loading order

**At session start:** frontmatter only, for routing
**At skill call:** the full SKILL.md
**Later:** context files, only as workflows cite them

### The shape

**SKILL.md** = lean (30–50 lines) — read at invocation
- YAML frontmatter with triggers
- Short description
- Routing table
- Quick reference
- Links to context files

**Sibling .md files** = working SOPs per facet (read on demand)
- Genuine procedures, not decoration
- Concrete handling for their facet
- Free to cite Workflows/, Tools/, etc.

### 🚨 CRITICAL: NO Context/ Folder 🚨

**Never invent Context/ or Docs/ folders.**

Sibling .md files ARE the context layer. They sit **directly in the skill root**.

**WRONG:**
```
DEVOS/skills/Art/
├── SKILL.md
└── Context/              ❌ NEVER CREATE THIS
    └── Aesthetic.md
```

**RIGHT:**
```
DEVOS/skills/Art/
├── SKILL.md
├── Aesthetic.md          ✅ Context file in skill root
├── Examples.md           ✅ Context file in skill root
└── Tools.md              ✅ Context file in skill root
```

**The skill folder IS the context.**

### Worked layout

```
DEVOS/skills/Art/
├── SKILL.md              # 40 lines — lean router
├── Aesthetic.md          # Context file — SOP for aesthetic
├── Examples.md           # Context file — SOP for examples
├── Tools.md              # Context file — SOP for tools
├── Workflows/            # Workflows
│   └── Essay.md
└── Tools/                # CLI tools
    └── Generate.ts
```

### Lean SKILL.md shape

```markdown
---
name: SkillName
description: Create, test, and optimize DevOS skills — scaffolding, effectiveness testing, description optimization. USE WHEN create skill, new skill, validate skill, test skill, improve skill, optimize description.
---

# SkillName

Brief description.

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| "trigger" | `Workflows/WorkflowName.md` |

## Quick Reference

**Key points** (3-5 bullet points)

**Full Documentation:**
- Detail 1: `SkillSearch('skillname detail1')` → loads Detail1.md
- Detail 2: `SkillSearch('skillname detail2')` → loads Detail2.md
```

### Slim-or-not calls

✅ **Split it out when:**
- SKILL.md passes 100 lines
- Several doc facets compete
- API surface is wide
- Samples run long

❌ **Keep it whole when:**
- The skill is small (< 50 lines)
- It is a thin utility wrapper (those belong in `DEVOS/Tools/` instead)

### Payoff

- **Tokens:** 70%+ lighter at invocation (when the deep docs stay unloaded)
- **Shape:** SKILL.md routes, context files carry each facet's SOP
- **Cost:** workflows pull only what they run
- **Upkeep:** each facet edits alone

**See:** `DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md` (Dynamic Loading Pattern section)

---

## Writing Rules for Skill Prose

Assembly guidance from Anthropic's skill-creator practice and Thariq Shihipar's "Lessons from Building Claude Code" (Mar 2026), restated for DevOS authors:

### Bedrock habits

- **Skip the obvious.** The model writes code competently and reads repos well. Spend words on what **breaks its defaults** — the moves it flubs unprompted. Test each line: "Would it get this wrong unprompted?" If not, delete it.
- **Give reasons, not just orders.** Models with a clear why plus room to reason beat models under rigid orders. Prefer "bullets because busy readers skim" over "ALWAYS 3 bullets".
- **Stay lean.** The context window is shared infrastructure. Drop lines that don't move output. When transcripts show the agent burning turns on fruitless steps, remove those steps. Hold SKILL.md under 500 lines.
- **Drop shout-only lines.** One plain statement is the instruction. `MANDATORY`, `CRITICAL`, "not optional", plus a third restatement add noise, not force — the model follows precision and code, not volume. Cut any line whose whole content is yelling a rule stated nearby. Audit `## Best Practices` / `## Tips` blocks hardest: they gather default-echo filler ("be thorough", "keep it simple", "validate carefully"). Run the delete-test in `Prompting/Standards.md` § Signal-to-Noise per line: remove it, and reinstate only when you can name the exact non-default behavior it compels.
- **Generalize past the incident.** Fix the pattern underneath, not the one failed test. The skill will meet prompts far outside your test set.
- **Ship the repeated work.** When test agents each hand-roll the same helper, promote that helper into Tools/ so later runs inherit it.
- **Calibrate latitude.** Fragile work (migrations) earns exact commands; safe work (reviews) earns direction.
- **Leave slack.** Skills run for many prompts. State what matters, leave the rest flexible.

### Description craft

- **Descriptions address the model, not people.** The description ships into the system prompt. The model reads it to choose skills.
- **Lean slightly pushy.** Models under-call skills. Name concrete situations even when the user wouldn't name the skill.
- **Disambiguate confusable neighbors.** Add "NOT FOR" lines where vocabularies collide: `"NOT FOR web pentesting (use WebAssessment)"`.
- **Starving signals:** the skill should have loaded but didn't; operators call it manually.
- **Spamming signals:** it loads on unrelated queries; operators mute it.

### Gotchas block (MANDATORY)

Every skill carries `## Gotchas` right after routing. Thariq: "The highest information density in any Skill comes from gotchas sections."

Stock it with:
- API quirks the model can't know
- Mistakes seen in real runs
- Order dependencies that surprise
- Quiet-failure edge cases

**Gotchas grow forever.** Each skill failure earns a line here.

### Ideal-state authoring (WHAT, not HOW) — MANDATORY voice

**Draft each new body and workflow as an outcome spec: WHAT done means (checkable results), the CONSTRAINTS, and the TOOLS — then trust the model with the HOW.** Numbered reasoning choreography for open-ended thinking is BPE-flagged scaffolding: it throttles a strong model and decays as models sharpen. Four HOW classes stay legitimate: **safety-gate**, **verified-gotcha** (the `## Gotchas` job), **tool-contract** (exact call recipes in Workflows), **output-format-contract**. Deterministic Tools (`*.ts`) sit outside the rule. While drafting or improving, strip method narration; keep outcomes, constraints, tools, and the four keep-classes. Full standard: `DEVOS/RUNTIME/DOCS/Skills/SkillSystem.md` § Authoring Standard.

### BPE (Bitter-Pilled Engineering) gate

Before calling a skill finished, ask: **"Would a smarter model make this skill unnecessary?"**

- **Sturdy (keep):** check harnesses, data pipelines, tool wrappers, banked gotchas, deterministic scripts
- **Brittle (challenge):** reasoning choreographers, format parsers, retry cascades, elaborate thinking scaffolds

Aim skills at what the model can't derive (failure modes, API quirks), what it can't do (API calls, automation), and flows that gain from sameness.

### Layered loading (after Anthropic)

Three tiers — use them to bound big skills:
1. **Tier 1 (YAML frontmatter):** always in the system prompt. Trigger data only.
2. **Tier 2 (SKILL.md body):** read at invocation. Routing plus core guidance.
3. **Tier 3 (Reference files):** root `.md` files or a `References/` folder, read on demand.

Name the files that exist; the model fetches them when relevant. Keep SKILL.md under 500 lines — past that, carve reference files out.

### Testing shape (after Anthropic)

Three depths:
1. **By hand** — run prompts, watch what happens
2. **Scripted** — automate cases (the TestSkill workflow)
3. **Programmatic** — build scoring suites (the Evals skill)

**State done before building:** write down what "this skill working" means first. Work one hard task until the model clears it, then distill the winning moves.

### Session hooks, on demand (after Anthropic)

Skills may ship hooks that wake only at invocation and hold for the session:
- `/careful` — gate risky commands (rm -rf, DROP TABLE, force-push)
- `/freeze` — fence edits to chosen directories
- `/audit` — record tool calls for later review

*All guidance above descends from Thariq Shihipar's "Lessons from Building Claude Code" (Mar 2026), Anthropic's official skill guide, and platform documentation.*

## Versioning

Each skill owns a `version:` semver in SKILL.md frontmatter (`Major.Feature.Patch` — the middle slot is **Feature**, not "minor"), independent of the OS release and of sibling skills. Fresh scaffolds open at `version: 1.0.0`. A skill edit is ALSO an OS edit — `skills/` belongs to the core-file surface the DevOS version system watches — so changing a skill moves its own version AND (rolled up) the canonical `DEVOS/VERSION`. Separate lines, separate lineages: the skill's `version:` tracks itself; `DEVOS/VERSION` tracks the umbrella. CreateSkill never touches `DEVOS/VERSION` directly.

Grade the change so both bumps land right (one rubric serves the per-skill bump and the roll-up):

- **patch** — gotcha appended, typo, description touch-up, doc sync. No new power.
- **feature** — a new workflow or a new tool (a brand-new skill opens at 1.0.0 rather than counting as a feature bump on itself). Additive, compatible.
- **major** — skill renamed or removed, or its public contract / routing broken. Human gate: halt and confirm before any major; never call major solo.

**Per-skill bumps land at private-sync, not at edit time.** The `UpdateKaiRepo` ship flow runs `BumpSkillVersions.ts` — for each `skills/<name>/` touched since the last OS tag it scopes `ClassifyChange --path skills/<name>` and bumps that skill's `version:` (major held for confirm), logging each in the SYSTEMUPDATES registry. That sweep catches workflow-body edits that bypass CreateSkill. So do NOT hand-bump `version:` here; the ship flow owns it. (That ship flow is maintainer machinery absent from public installs — on a box without it, hand-bump `version:` per the rubric above as part of the edit.) A skill edit is a **private-sync** change — never a release **cut** (staging only) or **publish** (public repo). Keep the three moves apart.

Public skills carry no second version line — the release/emit forwards each skill's private `version:` untouched.

(Concrete commands/paths for this install layer in through the Customization block above, when present.)

## Walkthroughs

**Walkthrough 1: skill from zero**
```
User: "Create a skill for managing my recipes"
→ Starts the CreateSkill workflow
→ Reads SkillSystem.md for shape rules
→ Raises the TitleCase directory
→ Drafts SKILL.md, Workflows/, Tools/
→ Proposes a TestSkill run to prove it helps
```

**Walkthrough 2: routing repair**
```
User: "The research skill isn't triggering - validate it"
→ Starts the ValidateSkill workflow
→ Measures SKILL.md against canonical shape
→ Checks TitleCase naming and USE WHEN triggers
→ Reports gaps with fixes
```

**Walkthrough 3: effectiveness proof**
```
User: "Test the Blogging skill to see if it's effective"
→ Starts the TestSkill workflow
→ Drafts 3 lifelike test prompts
→ Races with-skill against baseline agents side by side
→ Compares, reports, iterates via ImproveSkill
```

**Walkthrough 4: silent skill**
```
User: "The Security skill doesn't trigger when I ask about pentesting"
→ Starts the OptimizeDescription workflow
→ Drafts 20 should/shouldn't-fire probes
→ Scores description accuracy with subagents
→ Rewrites, re-scores, reports the gain
```

**Walkthrough 5: weak prose**
```
User: "The research skill output is too verbose — improve it"
→ Starts the ImproveSkill workflow
→ Reads the skill plus the complaint
→ Diagnoses the cause (over-pinned instructions)
→ Rewrites with reasons instead of rigid MUSTs
→ Proposes a TestSkill run to confirm
```

## Gotchas

- **The frontmatter description has a hard 1024-char cap.** Any edit that lengthens it must re-measure before saving (audit origin 2026-06-13).
- **Two `## Workflow Routing`-family headers live here** — one inside the embedded lean-template sample, one the genuine routing section (titled "Pick a Workflow"). Header scanners must take the LAST match, not the first.
- **Running this skill's workflows by reading the files and acting them out manually is the handrolling anti-pattern** — `skills/CLAUDE.md` demands invoking the skill, not pantomiming it. The skill that requires Gotchas blocks shipped without one until 2026-06-13; treat checklist items as binding on this skill first.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"CreateSkill","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Swap in the real workflow name for `WORKFLOW_USED`, a short input sketch for `8_WORD_SUMMARY`, and wall-clock seconds for `SECONDS`. Record `status: "error"` when the run failed.
