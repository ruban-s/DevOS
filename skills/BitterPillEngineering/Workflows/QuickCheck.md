# QuickCheck Workflow

A rapid verdict on one file or rule batch.

## Input

The operator hands over one of:
- A file path to score
- A pasted block of rules/instructions
- "check this file" with the file already in context

## Flow

### 1. Take in the target

A path means read the file; pasted text means work from what was given.

### 2. Run the Five Questions

Score each rule or instruction against the five checks in SKILL.md, weighting three angles hardest:
- Does it restate what the model does by default?
- Is it fuzzy enough to drift between runs?
- Does it read like a patch for one specific bad output?

### 3. Answer briefly

Keep the reply tight:

```
**File:** [path or "inline"]
**Rules found:** [count]
**Verdict:** [X] keep, [Y] cut, [Z] sharpen

### Cut
- [rule] — [reason]

### Sharpen
- [rule] — [how]

### Keep
- [rule] — [why]
```
