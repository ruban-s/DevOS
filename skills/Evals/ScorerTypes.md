# Assert Kinds

Two families. Deterministic asserts are code — synchronous, free, exact. Model-graded asserts are judgment — billed, nuanced, approximate. Every suite spends the first family first.

## Deterministic asserts (spend these first)

Implemented in `Tools/Assertions.ts`; every kind has a `not-` negation.

| Assert | Settles in | Good for |
|---|---|---|
| `equals` | <5ms | Exact-output contracts |
| `contains` / `icontains` | <5ms | Required (or forbidden) phrasing; case-insensitive variant included |
| `contains-all` / `contains-any` | <5ms | Multi-phrase requirements |
| `regex` | <5ms | Pattern-shaped requirements |
| `starts-with` / `ends-with` | <5ms | Leading-verdict checks, closing-format checks |
| `is-json` | <5ms | Outputs that must parse whole |
| `contains-json` | <20ms | JSON fragments embedded in prose |
| `max-length` / `min-length` | <5ms | Concision and completeness bounds |

```yaml
assert:
  - type: not-contains
    value: "should work"
    weight: 1
  - type: max-length
    weight: 1
    threshold: 1400
```

## Model-graded asserts (nuance only a reader can catch)

Implemented in `Tools/Judge.ts`, routed through `DEVOS/Tools/Inference.ts` at the suite's `judge_level`.

| Assert | Round-trip | Good for |
|---|---|---|
| `llm-rubric` | ~2s | Graded quality — 1–5 reasoning-first score mapped to 0–1 against a threshold |
| `llm-assert` | ~2s | Plain-language claims checked TRUE/FALSE/UNKNOWN, Unknown scored as miss |

```yaml
assert:
  - type: llm-rubric
    weight: 2
    value: "Does the output tie any done-claim to verification evidence?"
  - type: llm-assert
    weight: 1
    value: ["The output does not claim success without evidence"]
```

## Choosing between them

1. **Code check whenever the property is mechanical.** Length, presence, format, exact JSON — no model needed.
2. **Roughly 60% deterministic / 40% model-graded by weight** as a starting posture; move the split toward whatever the suite genuinely probes.
3. **Five-point scale for rubrics**, reasoning mandatory before the number.
4. **Whole vs fragment matters.** `is-json` rejects prose that merely mentions JSON — that's `contains-json` territory.
