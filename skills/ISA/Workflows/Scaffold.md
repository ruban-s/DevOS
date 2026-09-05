# Scaffold

Draft a fresh ISA from a prompt. The product is a populated file at the canonical location, carrying exactly the sections the work's substance calls for — substance judged from the work itself, never from a caller-supplied label.

## When to run

- Run start on work with no ISA yet: `Skill("ISA", "scaffold from prompt: <user message>")`
- Direct request: `Skill("ISA", "scaffold from prompt: <prompt>")`
- Feature-slice mode: `Skill("ISA", "extract feature <name> as ephemeral file from <master-isa-path>")`

## Inputs

| Input | Required | Meaning |
|---|---|---|
| prompt | yes | The request — verbatim or distilled |
| substance | no | Depth steer ("trivial" / "substantial" / "deepest", or plain words like "go heavy"); default is judged from the prompt |
| project | no | A known project → extend its project ISA; absent → task ISA at `DEVOS/MEMORY/WORK/{slug}/ISA.md` |
| ephemeral_feature | no | Set → emit a feature-slice excerpt instead of a full ISA |

## Outputs

- `<project-root>/ISA.md` — `project` supplied (read-extend the existing file, never overwrite)
- `DEVOS/MEMORY/WORK/{slug}/ISA.md` — no project (slug = `YYYYMMDD-HHMMSS_kebab-task-description`)
- `DEVOS/MEMORY/WORK/{slug}/_ephemeral/<feature>.md` — `ephemeral_feature` set

## Procedure

### 1 — Read an example first

Open `DEVOS/skills/ISA/Examples/canonical-isa.md` for headers and tone. The minimal floor is `e1-minimal.md`; the deepest shape is `e5-enterprise.md`. (`eN-` prefixes are retired tier vocabulary kept as filenames; legacy frontmatter or headings in examples never override the current SKILL.md shape.)

### 2 — Preserve the stated goal before deriving anything

Populate `principal_stated_goal` (frontmatter) AND the first quoted sentence of `## Goal` from the same byte-for-byte literal BEFORE writing any derived section. Derivation — Out of Scope, Constraints, Principles, distilled Goal prose, claims — comes second, anchored to the preserved literal through the `anchors_to` column. Preserve first, derive second.

#### 2a — Detect the literal

Four signals, run over the prompt:

| # | Signal | Looks like | Examples |
|---|---|---|---|
| 1 | Named metric + threshold | a quantitative target | "get p95 latency under 200ms" · "open rate above 35%" |
| 2 | Explicit outcome assertion | "I want X" / "achieve X" / "do this" | "I want the dashboard showing all four horizons" |
| 3 | Completion condition | "until X" / "such that X" | "refactor until tests pass" · "ship such that no critical findings remain" |
| 4 | Structural directive | explicit verb-object on the system | "unify three skills into one" |

**Fail-closed content floor:** a candidate under 6 tokens or without propositional content ("make it good", "do better", "refactor this") → `principal_stated_goal: null`, candidate logged to a Decisions row. Silence beats anchoring on noise.

**Multi-literal:** "do X and Y by Z" → first wins as `principal_stated_goal:`; the rest demote to derived Constraints annotated `derived_from: principal_stated_goal compound`.

On a hit that clears the floor, write the frontmatter quartet:

```yaml
principal_stated_goal: "the verbatim user quote, byte-for-byte"
principal_stated_goal_source: prompt   # prompt | conversation | explicit-revision
principal_stated_goal_signal: <1-4>
principal_stated_goal_locked: <ISO-8601>
```

Copy the verbatim quote into `## Goal` as the first sentence, in quotes, ahead of any derived prose.

#### 2b — Derive the residue

Distill what remains: explicit wants beyond the literal (→ Vision + derived Goal prose); explicit not-wants (→ Out of Scope); implied not-wants from domain context (→ Out of Scope); domain-implied mandates (→ Constraints); standing truths the principal's past work shows they hold (→ Principles).

### 3 — Ambiguity check: could I be wrong about what done means?

One rule. If the goal supports ≥2 interpretations leading to materially different builds, or required content can't be drafted without speculation → ask up to 3 targeted questions on substantial work; on trivial fast-path work prepend the flag instead: `⚠️ Picking X over Y because R; redirect if wrong.` A literal whole-response `proceed` accepts reasoned defaults.

**Skip when:** trivial fast-path (the flag suffices); ephemeral mode (the master is already scaffolded).

**Record the outcome** — the only two keys this check carries:

```yaml
context_sufficient: true    # false when ambiguity was flagged or proceed accepted defaults
interview_invoked: false    # true when targeted questions were actually asked
```

| Path | `context_sufficient` | `interview_invoked` |
|---|---|---|
| No material ambiguity | true | false |
| Questions asked, principal answered | true | true |
| Questions asked, principal said `proceed` | false | true |
| Trivial-path flag prepended | false | false |

On `proceed`: append a Decisions row (`ambiguity check fired, principal invoked proceed — reasoned defaults: <named>`), set `context_sufficient: false`, and surface the accepted defaults as a known risk at verification rather than a surprise.

**Asking, when questions fire.** Emit ONE message before drafting anything past Goal:

```
I have N questions before I scaffold this. The goal is clear on X but underdetermined on Y.
Say `proceed` to scaffold on reasoned defaults; otherwise answer one at a time:

1. <Q1>
2. <Q2>
3. <Q3>
```

Draw questions from the thinnest sections: Vision/Goal → what the user feels at 9–10; Out of Scope → tempting-but-distracting additions; Constraints → mandates and must-nevers; Test Strategy → the probe that would prove it; Goal → the smallest version that still counts; Features → parallel vs sequential units; Principles → truths regardless of build. Max 3 per fire, one per turn, answers written back into the ISA as they land. Stop early on two contentless answers in a row or an explicit done. `proceed` counts only as a whole-response match (trim + lowercase equality — "I want to proceed with X" answers question 1).

**Re-check later:** information arriving after scaffold that would have changed Goal, Vision, or Out of Scope (a premortem result, a mid-build discovery) → re-run the one rule and log a Decisions row naming the shift. Never blocks a phase transition.

### 4 — Frontmatter

```yaml
---
task: "8 word task description"
slug: YYYYMMDD-HHMMSS_kebab-description
project: <name>            # only when targeting a known project
phase: scoping
progress: 0/<claim-count>
started: <ISO-8601>
updated: <ISO-8601>
principal_stated_goal: "verbatim quote"   # only when detection fired + floor passed
principal_stated_goal_source: prompt
principal_stated_goal_signal: 2
principal_stated_goal_locked: <ISO-8601>
context_sufficient: true
interview_invoked: false
---
```

### 5 — Sections the substance calls for

| Substance | Owes |
|---|---|
| Trivial (mechanical, single-probe, minutes) | Goal, Claims (flat) |
| Substantial (multi-claim build, real blast radius) | Problem, Vision, Out of Scope, Constraints, Goal, Features (or flat Claims), Test Strategy |
| Deepest (frontier multi-component work) | All seventeen minus inapplicable conditionals + Interview before building |

**Claims layout — exactly one of:**

- **Flat `## Claims`** when the work has no distinct features (most task ISAs). IDs `ISC-N` (short `C1` also parses); anti-claims inline with the `Anti:` prefix or in `## Anti-claims`.
- **`## Features` blocks** when it does (most project ISAs). Each feature: `### F<n> · <name>` + a one-line `Why:` (its ideal-state — why it exists) + its claims nested underneath; `F0 · Cross-cutting` holds spanning claims (security, deploy, data integrity). IDs stay **global and stable** across the whole ISA so Test Strategy and Reconcile resolve. Write a real `Why:` — one that says what the name and claims don't.

```markdown
### F1 · Billing
Why: a visitor becomes a paying subscriber and can self-serve cancel, without support.

- [ ] ISC-12: Checkout creates a session with server-side pricing.
- [ ] ISC-13: Anti: the webhook is idempotent on event.id.
```

Project-ISA override: a `<project>/ISA.md` target always owes full substantial-grade sections, whatever the current task's size. Stated once — binds every time.

**No changelog section, ever.** The scaffold never emits one — `git log -- <isa-path>` is the change record. The conjecture/refuted-by/learned/criterion-now trail lives in `## Learning`, written at close and only when understanding changed. A closed claim's `## Verification` entry is a **one-line provenance stub** (commit hash, test name, probe ref) — proof lives in git and CI; the ISA points.

### 6 — Hold fog as fog

A surface named in Vision/Goal whose shape is genuinely unknown at scaffold gets no speculative claims. Each such question goes to `## Not yet specified` in its sharpest statable form: `- fog: <question> — <what must resolve before it sharpens>`. Graduation test: statable-with-falsifier → a claim (even a blocked one); statable-but-not-probe-able → fog; beyond the vision → Out of Scope. The gate judges coverage at close — `phase: complete` requires fog empty (every entry graduated or killed via Decisions). Omit the section when there is no fog.

### 7 — Splitting Test on every claim

One binary tool probe per claim:

| Split when… |
|---|
| "And"/"with"/"including" joins two verifiable things |
| Part A can pass while B fails |
| Scope words ("all", "every", "complete") — enumerate |
| A UI/API/data/logic boundary is crossed — one per boundary |
| A shared symbol changes — enumerate consumers, one probe each |
| No probe is nameable — not atomic yet |

### 8 — Anti-claims, then antecedents

Ask what must NOT happen — at least one anti-claim, typically derived from Out of Scope plus regression concerns. Then: an experiential goal (art, design, content — anything that has to "land") earns at least one `Antecedent:` claim naming a precondition that reliably produces the target experience. Verifiable goals don't need antecedents.

### 9 — Gate, then return the path

Invoke `Workflows/CheckCompleteness.md` against the new ISA (substantial and up; a trivial minimal ISA logs its shape check inline). Fill any missing required section before declaring the scaffold done. Output the absolute path of the created file.

## Ephemeral feature mode

With `ephemeral_feature` set:

1. Read the master ISA at `master_isa_path`.
2. Locate the `## Features` block whose `name == ephemeral_feature`.
3. Extract: `## Vision` + `## Goal` (read-only context); the relevant `## Constraints`; the block's claims with their stable IDs; matching `## Test Strategy` rows; optionally Decisions entries mentioning those claim IDs; an empty `## Verification` ready to populate.
4. Write `DEVOS/MEMORY/WORK/{slug}/_ephemeral/<feature>.md`.
5. Header comment: `<!-- EPHEMERAL FEATURE FILE — derived from <master-isa-path>. Reconcile via Skill("ISA", "reconcile <this-path> → <master-path>"). Do not hand-edit master from this file. -->`

## Failure modes

- **Substance mismatch:** caller steers "trivial" but the request is deep multi-component work (or the reverse). Surface it — the principal's explicit call outranks judgment, but the break is never silent.
- **Missing required section:** CheckCompleteness blocks the return until filled.
- **Coverage gap:** every Vision/Goal subsystem needs a container claim decomposed to single-probe leaves — never split to hit a number. A subsystem without a container claim is the failure: decompose it, hold it as fog (only when the shape is genuinely unknown), or document the deliberate omission in Decisions.
- **ID collision in ephemeral mode:** feature claim IDs absent from master → abort and surface. That's a master-side error, not a Scaffold error.
