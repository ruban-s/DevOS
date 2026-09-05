# Interview

A spec interview: adaptive questions that deepen an ISA's prose sections when the prompt alone underdetermines them, or when the principal wants to deliberately strengthen an existing ISA. Fills known structure — for discovering unknown structure, see Grill.

## When to run

- Scaffold's ambiguity check fired on substantial work (up to 3 targeted questions, `proceed` override, answers written back per question)
- After Scaffold on deepest-grade work (required before building, per the completeness gate)
- After any Scaffold where CheckCompleteness reports gaps
- Direct request: `Skill("ISA", "interview me on <isa-path>")`
- Section-scoped: `Skill("ISA", "interview me on the Vision section of <isa-path>")`

## Inputs

| Input | Required | Meaning |
|---|---|---|
| isa_path | yes | The ISA to deepen |
| section | no | Set → interview that section only; absent → walk every thin section |
| max_questions | no | Default 8; keeps the session tight |

## Procedure

### 1 — Read the ISA

Load `isa_path`. Mark each section populated, thin, or missing.

### 2 — Queue questions for thin sections only

Walk in priority order. A populated section gets zero questions.

| Section | Ask when thin |
|---|---|
| **Problem** | "What's broken right now?" / "Who feels it most?" / "What does the broken state cost?" |
| **Vision** | "When this lands, what does the user feel?" / "What would make them tell a friend?" |
| **Out of Scope** | "What would tempt you to add but distract from the core?" / "Which scope calls should we lock so they don't drift?" |
| **Principles** | "What truths must this respect regardless of how it's built?" / "What would you tell a future maintainer about how to think here?" |
| **Constraints** | "Which mandates bound the solution space?" / "What should nobody ever try?" |
| **Goal** | "In one or two sentences, what is the verifiable done state?" |
| **Claims** | "Walk me through the probe that would prove this claim." / "One binary probe, or should it split?" |
| **Test Strategy** | "How would you actually verify this claim — which command, tool, or probe?" |
| **Features** | "How does this split into units?" / "What runs parallel, what blocks the path?" |

### 3 — One question per turn

Plain conversation, no form formatting, no "Question N of M". Foundational questions first. Each answer goes straight into the ISA via Edit — prior content preserved, appended or replaced as fits — so the principal watches the document fill.

Borrow the principal's own earlier words when framing later questions. When time is short, drop to the substantial core (Problem, Goal, Claims, Test Strategy) and flag the rest as fill-in-later.

### 4 — Stop conditions

End on any: every section the substance calls for is populated past thin; `max_questions` reached; explicit done ("that's enough" / "skip the rest"); two consecutive contentless answers ("I don't know" / "skip").

### 5 — Closing pass

Run `Workflows/CheckCompleteness.md`. Surface remaining gaps without blocking — iteration stays open.

## Failure modes

- **Abandoned mid-interview:** partial depth still counts. Save it; log a Decisions entry noting where it paused and how many questions landed.
- **Answers contradict the ISA:** new answers win as canonical. Log the contradiction with a `refined:` prefix.
- **Answers stay aspirational:** push once — "what would a probe proving that look like?" What won't concretize isn't a hard claim yet; flag it in Decisions rather than writing fluff.
