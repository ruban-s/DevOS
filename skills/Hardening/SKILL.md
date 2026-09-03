---
name: Hardening
version: 1.0.7
description: "Hardens existing tests, claims, and code via property-based testing and planned mutation/complexity/duplication analysis. USE WHEN harden, hardening, property test, property based testing, PBT, fast-check, universal quantified claim, shrink counterexample, mutation test, mutation testing, Stryker, CRAP score, DRY scan, jscpd, acceptance test mutation, strengthen tests, sharpen ISCs, find bugs example tests miss, test the tests. NOT FOR writing new feature tests (use the repo's test runner directly), grading agent output quality (use Evals), UI verification with real Chrome (use Interceptor), finding security vulnerabilities, or building new functionality."
---

# Hardening

## The premise

A green suite proves only what the author thought to check. The bugs that survive a green run are the ones living in inputs nobody sampled, and the claims that read crisp but constrain nothing. You cannot see either weakness by rereading the tests — you have to attack them. This skill attacks: property tests state the universal claim and shrink any failure to a minimal counterexample; mutation testing injects bugs and demands the suite notice; acceptance mutation perturbs ISC wording and demands the probe care.

Everything here strengthens what already exists. None of it adds functionality.

## Workflow Routing

| Trigger | Workflow |
|---|---|
| property test, PBT, fast-check, universal claim, shrink counterexample — pure functions, parsers, serializers, transforms, invariants | `Workflows/PropertyTest.md` |
| mutation test, Stryker, "do the tests catch injected bugs" | stub — see Status |
| CRAP score, risky undertested code | stub — see Status |
| DRY scan, jscpd, duplication rot | stub — see Status |
| acceptance test mutation, sharpen ISCs, fluff detection | stub — see Status |

## Doctrine

Properties and examples are not rivals: a property states the universal (`∀ x: parse(serial(x)) ≡ x`), examples sample it, and `bun-property` rows in the Test Strategy carry the universal while `bun-test` rows carry the instances. Mutation testing grades the graders — it never writes tests, it proves the existing ones earn their keep. CRAP and duplication scans don't add coverage; they rank where the next hour of it buys the most. Acceptance mutation is the "would anything fail?" test applied to the spec itself — the mechanized form of the over-prompting audit in the BitterPillEngineering skill, pointed at claims instead of rules.

The unifying frame: **test the things that test the system.**

## Status

| Workflow | State | Next leg |
|---|---|---|
| **PropertyTest** | Built (v1) | ready |
| **MutationTest** | stub | Stryker harness |
| **CrapAnalysis** | stub | AST walker (oxc or `bun build --print-ir`) |
| **DryAnalysis** | stub | jscpd wrapper |
| **AcceptanceTestMutation** | stub | ISC perturbation generator |

## Integration points

- Test Strategy contract: `bun-property` rows per `RUNTIME/ISA_FORMAT.md` §7 — substantial pure-function claims SHOULD carry one, core/security surface MUST.
- The Loop: hardening is elected during VERIFY when claims warrant it; spend is discovered from the work, never pre-declared.
- Constitution: the verification core (`RUNTIME/SYSTEM_PROMPT.md`) — hardening is its mechanized extension.

## Gotchas

- Pin the seed when a property fails — `// fc seed: 0xdeadbeef` — or the shrink is unreproducible.
- `numRuns: 1000` default; 10000 for invariant-critical, 100 for generators slow enough to starve the budget.
- Over-constrained generators hide bugs (`min: 0, max: 100` on code that takes any int); under-constrained ones produce invalid inputs the function never promised to accept. Constrain exactly to the real domain.
- Properties must be deterministic given the input. Disk, network, clock — mock them or extract the pure core; fast-check only generates inputs.
- A property that never fails is suspect the same way a probe that can't fail is: run the pre-build probe check from `RUNTIME/ISA_FORMAT.md` §7.

## Examples

- "Property-test the slug parser" → PropertyTest: round-trip and idempotence as fast-check properties, 1000 runs, seed pinned on failure.
- "What are my example tests missing?" → candidate scan: pure functions with example-only coverage become property rows.
- "Mutation-test the suite" → still a stub; don't promise kill-rate numbers.
