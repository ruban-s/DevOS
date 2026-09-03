---
phase: marking
progress: 0/0
task: "{{PROJECT_NAME}} project ISA"
slug: {{PROJECT_SLUG}}
started: {{DATE_ISO}}
updated: {{DATE_ISO}}
principal_stated_goal: "{{STATED_GOAL}}"
current_state: "{{CURRENT_STATE_ONE_LINE}}"
ideal_state: "{{IDEAL_STATE_ONE_LINE}}"
---

# {{PROJECT_NAME}} — ISA

> Seeded by the Spec interview (`Workflows/Spec.md`). Format contract: `RUNTIME/ISA_FORMAT.md`.
> Fill Goal + Claims first; every claim needs one binary probe in Test Strategy before building.
> Omit every section with nothing to say. Delete this block once populated.

## Problem

{{WHAT_IS_BROKEN_OR_MISSING}}

## Vision

{{WHAT_EUPHORIC_SURPRISE_LOOKS_LIKE_HERE}}

## Out of Scope

- {{EXPLICITLY_NOT_INCLUDED}}

## Constraints

- {{IMMOVABLE_MANDATES}}

## Goal

{{1–3_SENTENCES_NAMING_VERIFIABLE_DONE}}

## Claims

- [ ] ISC-1: {{END_STATE_NOT_ACTION}}
- [ ] ISC-2: Anti: {{WHAT_MUST_NOT_HAPPEN}}

## Test Strategy

| claim | type | check | threshold | tool | anchors_to |
| ISC-1 | {{bash\|curl\|test\|bun-test\|screenshot\|manual}} | {{PROBE}} | {{PASS_CRITERION}} | {{EXACT_COMMAND}} | literal |
| ISC-2 | {{TYPE}} | {{PROBE}} | {{PASS_CRITERION}} | {{EXACT_COMMAND}} | literal |

## Decisions

- {{DATE}}: seeded from Spec interview — {{WHY_THIS_SHAPE}}
