---
name: ApertureOscillation
version: 1.0.9
description: "Pins one design question in place and shifts the viewing distance three times — component-close, system-wide, then a synthesis of the two frames — to surface scope mismatches, sizing calls, and coherence verdicts no single framing produces. USE WHEN aperture oscillation, oscillate scope, zoom in and out, tactical vs strategic, scope framing, design tension, system coherence check, local vs global design, wrong scope, scope negotiation. NOT FOR rotating analytical angles (use IterativeDepth)."
---

# ApertureOscillation

One question, held still, viewed from two distances — plus a reading of whatever differs between the views.

## The mismatch it preempts

Ask "how should this be built?" with the component filling the frame, and the answer comes back in the component's native terms: the idioms it likes, the interface it deserves, a tidy standalone shape. Ask the same question from the system's height and the answer bends toward the whole: shared conventions, neighboring constraints, coherence over distance. Each answer is honest on its own ground, and each misleads when it travels. Rework gets expensive precisely when this divergence survives undetected into mid-build — a piece that is elegant in isolation and abrasive in place, or loyal to the plan and wrong for its own grain. A single framing never shows which of those you are getting; two framings, compared, do.

## The sweep

The skill works by controlling framing on purpose. It neither invents alternatives nor rotates critique lenses; it freezes the brief and walks the scope envelope through three locked positions:

1. **Close-up — part first.** The component fills the frame; system context recedes. Capture what the piece wants to be when treated as the whole story: shape, interfaces, idioms, the sound standalone build.
2. **Pulled back — whole first.** The surrounding intent fills the frame; the component is derived from it. Capture what the larger purpose imposes: alignment, shared machinery, obligations that do not exist from inside the part.
3. **Gap read — synthesis.** The two captures become input to each other. Name every point where they diverge, sketch a resolution for each, and close with a coherence verdict. Finding no divergence is itself a result — it certifies the two scopes already fit.

## The line against IterativeDepth

Both skills run multiple passes over one thing; what moves between passes is the difference:

| Axis | IterativeDepth | ApertureOscillation |
|------|----------------|---------------------|
| What moves per pass | the analytical angle (failure modes, stakeholders, time, …) | the viewing distance (close, far, combined) |
| Pass count | 2–8, sized to the problem | exactly 3 |
| Inputs | one problem statement | two — build target plus surrounding intent |
| Yields | fuller requirements from many angles | the named frictions between part logic and whole logic |
| Home ground | mapping a problem, hunting blind spots | sizing calls, placement decisions, coherence review |
| Sequencing | map the problem with IterativeDepth first, then sweep scope to seat the solution | |

## Where it pays

Any build in which a concrete piece must serve both itself and something larger without either side collapsing.

- **Sizing** — service, library, or inline function: the honest call flips with distance, and the gap read states which distance should win.
- **Feature shaping** — the behavior requested and the behavior the product needs often differ by one degree that only the double view makes visible.
- **Coherence review** — an addition to live infrastructure owes its neighbors contracts a close-up framing never surfaces.
- **Pre-commit check** — before an approach locks, confirm the tactical plan and the strategic intent describe the same thing.
- **Scope arbitration** — when "build X" could mean an afternoon or a quarter, the gap read names the honest size.

Payoff: frictions surface while they are still cheap; the size that survives both views replaces the guessed one; agreement between zooms licenses conviction, and divergence produces a precise tradeoff list.

## Contract

- **Inputs:** the build target (the concrete thing) and the surrounding intent (the purpose it serves). If the two collapse into one sentence, there is no delta to expose — prefer IterativeDepth.
- **Outputs:** enumerated divergences, a resolution sketch per divergence, a sizing recommendation, a coherence verdict.
- **Shape:** three passes every run, two inputs, best used before requirements freeze or before an approach commits.

| Call | File |
|------|------|
| "aperture oscillation", "oscillate scope", "zoom in/out", "tactical vs strategic" | `Workflows/Oscillate.md` |
| A planning run that picks scope-coherence analysis | `Workflows/Oscillate.md` |

## Field notes

- **Two genuinely different inputs, or nothing.** Identical target and intent leaves no room to sweep.
- **Three is structural.** A fourth pass is lens rotation — IterativeDepth's territory, not a deeper sweep.
- **The third pass is the product.** Passes one and two stage material; a silent gap read still reports — the scopes agree.
- **Re-verify occasionally.** As models get better at shifting zoom unprompted, spot-check that the explicit sweep still earns its keep.

## Worked examples

**Example 1 — where a retry mechanism belongs**

```
Build target: "Wrap our flaky vendor API calls in retries with backoff"
Surrounding intent: "A platform where every background job already flows through one shared queue with its own dead-letter handling"

Close-up: a self-contained retry worker — backoff policy, attempt cap, private dead-letter store.
Pulled-back: retry semantics belong to the shared queue; a second delivery path splits monitoring and ops tooling in two.
Gap read: two delivery systems where the platform expects one. Resolution: express the backoff policy as options on shared-queue jobs and retire the private worker.
```

**Example 2 — how big an export really is**

```
Build target: "Let users export their project data"
Surrounding intent: "The product's pitch is user ownership of data, import included"

Close-up: a JSON dump endpoint over current table shapes — fast, internal, schema-shaped.
Pulled-back: an ownership promise implies a documented, versioned format other tools can read, plus the matching import path.
Gap read: internal debug dump versus public contract. Resolution: ship a versioned export format and treat it as an interface, not an artifact.
```

## User overrides

Before running, check `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/ApertureOscillation/`. If it exists, `PREFERENCES.md` and sibling configs there outrank everything below; if it doesn't, skill defaults govern.

## Execution Log

When a workflow finishes, append one line:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"ApertureOscillation","workflow":"Oscillate","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

`8_WORD_SUMMARY` becomes a short description of the input and `SECONDS` the wall-clock duration; log `"error"` when the run fails.
