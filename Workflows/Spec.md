# Spec — project-spec interview

Replaces the TELOS life interview. Turns a repo (plus whatever sources the principal offers) into a seeded project `ISA.md` and a `DEVOS/PROFILE/` — current codebase state → ideal state, with claims that name their falsifiers. Runs AFTER Setup; refuse to seed when `DEVOS/SKILL.md` is absent (Setup first).

Produces:

```
<repo>/ISA.md                          # project ISA (system of record for the thing)
<repo>/DEVOS/PROFILE/OWNER.md          # who decides, how steering works
<repo>/DEVOS/PROFILE/CONVENTIONS.md    # stack, runners, boundaries, glossary
```

No life questions. No assistant naming. No DA/TELOS ceremony.

## Steps

1. **Preconditions** — `DEVOS/SKILL.md` resolves (else Setup first). Read `DEVOS/RUNTIME/ISA_FORMAT.md` if the format isn't resident. Confirm `ISA.md` is absent — SeedSpec refuses to overwrite; an existing ISA means continue/resume, not re-seed.
2. **Repo scan (read-only)** — manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, …), runners (`scripts`, CI workflows, Makefile/justfile), top-level structure, existing docs (`README`, `AGENTS.md`, `CLAUDE.md`). One paragraph: what the thing is, what stack it runs, how it's verified today. This is the current-state evidence — never skip it, never infer past it.
3. **External sources** — ask what else defines done (tickets, designs, RFCs, ADRs, prior art). Pull them in read-only; merge `existsSync`-guarded. Sources enrich context; they never override the principal's stated goal.
4. **Interview** — up to 3 targeted questions, ONLY where the answer changes what gets built (goal shape, scope boundary, done criteria). A reasoned default that's safe gets an inline ambiguity flag instead of a question. The principal's whole-response `proceed` accepts reasoned defaults. Then stop asking.
5. **Seed** — `bun Tools/SeedSpec.ts --target <repo>` (dry run — shows resolved vs remaining tokens), then `--apply` with permission. Then fill the seed conversationally: Goal (1–3 sentences), Claims (flat or `## Features` blocks per `ISA_FORMAT.md`), Test Strategy rows with exact `tool` commands, Decisions rows for non-obvious calls.
   - Every claim: one binary probe, `anchors_to` traced, ≥1 `Anti:` claim. Experiential goals get ≥1 `Antecedent:`.
   - Resolve EVERY remaining `{{TOKEN}}` — a seeded ISA carries zero placeholders. Re-run the seed only by deleting `ISA.md` first.
   - Frontmatter: `phase: marking`, `progress: 0/N`, `principal_stated_goal` verbatim when goal-detection fired.
6. **Profile** — write `DEVOS/PROFILE/OWNER.md` + `DEVOS/PROFILE/CONVENTIONS.md` from `DEVOS/templates/PROFILE_*.seed.md`, `existsSync`-guarded (never overwrite populated files), with permission. Facts discovered in steps 2–4 only — no aspirations, no invented glossary (entry on confusion).
7. **Verify** — (a) `ISA.md` meets the trivial floor at minimum (Goal + Claims + Test Strategy; substantial work earns the full set per the Completeness Gate); (b) zero `{{TOKENS}}` survive in `ISA.md` or `PROFILE/`; (c) every claim traces to the goal or a named derivation; (d) `progress: 0/N` is a mechanical count. Report what was checked, then flip `phase:` to `climbing` only when building starts — never at seed time.

## Notes

- A second Spec run on the same repo resumes the existing `ISA.md` (tighten claims, graduate fog) — seeding is one-shot by design.
- Fog (`## Not yet specified`) is legitimate output: sharp-but-unprobeable questions wait there, never forced into speculative claims.
- `MEMORY/WORK/{slug}/ISA.md` task ISAs (repo-local: `DEVOS/MEMORY/WORK/…`) are seeded the same way at smaller scope — Goal + Claims minimum, no profile step.
