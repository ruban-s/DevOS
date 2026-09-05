# Append

The canonical writer for the ISA's three append-only sections: `## Decisions`, `## Learning`, `## Verification`. The four-piece learning shape is opinionated and easy to dilute with free-form edits — this workflow owns the entry shapes so they hold across projects. Two conventions ride along: the ISA carries **no changelog section** (`git log -- <isa-path>` is the change record), and each `## Verification` entry is a **one-line provenance stub**, never a retained evidence paragraph.

## When to run

- A non-obvious decision lands, any phase: `Skill("ISA", "append decision to <isa-path>: <text>")`
- Understanding shifted, learning time: `Skill("ISA", "append learning to <isa-path>: <conjecture> / <refutation> / <learning> / <criterion-now>")`
- A claim closed, execute/verify time: `Skill("ISA", "append verification to <isa-path>: <ISC-N> <evidence>")`
- Direct hand-authoring of any of the three sections

## Entry shapes

### Decisions

Timestamped log lines. `refined:` marks Goal or claim-set restructures.

```
- YYYY-MM-DD HH:MM: <decision text>
- YYYY-MM-DD HH:MM: refined: <what was refined and why>
- YYYY-MM-DD HH:MM: ❌ DEAD END: Tried <X> — failed because <Y> (don't retry)
```

Inputs: `text` (required), `kind` (`decision` | `refined` | `dead-end`).

### Learning (four-piece, non-negotiable)

How thinking evolved, in `## Learning`. Not a changelog — no changelog section exists.

```
- YYYY-MM-DD | conjectured: <what we believed>
  refuted by: <evidence that broke the belief>
  learned: <what the evidence taught us>
  criterion now: <which claim was added/changed/dropped as a result>
```

Inputs: all four required (`conjectured`, `refuted_by`, `learned`, `criterion_now`). A missing piece demotes the entry to a Decision — Append refuses partials and names what's missing.

### Verification (one-line stub)

Claim-keyed provenance, written as claims close. The entry is a **single line** — commit hash, test name, or probe ref. Proof lives in git and CI; this line points.

```
- ISC-N: <probe type> — <one-line provenance stub: commit hash | test name | probe ref>
```

Inputs: `isc_id` (must exist in the claims), `probe_type`, `provenance` (one line — a paragraph gets refused with a request for the stub).

## Procedure

### 1 — Resolve target and section

Read `isa_path`. Find `## Decisions` | `## Learning` | `## Verification`; create a missing one in canonical position (Decisions after Features, Learning after Decisions, Verification last). Never create a changelog section.

### 2 — Validate shape

| Type | Owes | Refuse when… |
|---|---|---|
| Decision | text + timestamp | text empty |
| Learning | conjectured + refuted_by + learned + criterion_now + date | any of the four pieces missing |
| Verification | existing isc_id + probe_type + one-line provenance | unknown ID, empty provenance, or a paragraph instead of a stub |

Refusal writes nothing — silent partials are exactly what this workflow exists to prevent.

### 3 — Format, 4 — append, 5 — progress, 6 — return

Format per the schemas verbatim (Learning in the four-line indented form; Verification exactly one line). Append to the section end, preserving prior entries; bump frontmatter `updated:`. When a Verification entry closes a previously-open claim, flip it to `[x]` in the claims and recompute `progress: M/N`. Return the appended text plus the path.

## Why a canonical writer

The Learning shape degrades three ways without one: prose creep ("we changed our minds about X"), half-entries (conjecture plus new criterion, refutation missing), and per-project drift that breaks cross-project search and tooling. Every Decisions, Learning, and Verification entry passes through here — including Reconcile's staged entries, so merges can't smuggle malformed shapes or evidence paragraphs past the same validation direct writes face.

## Failure modes

- **Concurrent edits:** read-decide-write races under contention. Serialize structural ISA edits; treat Append as best-effort when racing.
- **Ambiguous canonical position:** malformed file → abort and surface the structural problem instead of creating the section.
- **Unknown claim ID on Verification:** refuse. Same ID-stability contract Reconcile relies on.
