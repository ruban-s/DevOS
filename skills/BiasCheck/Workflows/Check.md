# Check — run the three-stratum audit

A single artifact, examined end to end: retrieve, ground in methods, score across strata, split supported from stretched.

## Announce (optional voice)

```bash
if [ -n "$DEVOS_PULSE_BASE" ]; then
  curl -s -X POST "$DEVOS_PULSE_BASE/notify" \
    -H "Content-Type: application/json" \
    -d '{"message": "Running the Check workflow in the BiasCheck skill to audit the source"}' \
    > /dev/null 2>&1 &
fi
```

Print:

```
Running the **Check** workflow in the **BiasCheck** skill to audit the source...
```

## Gate 0 — is this auditable here

Before fetching, confirm the ask fits:

1. **An artifact exists.** A URL, a path, or a substantive paste (roughly 50+ words) must be present. A sourceless assertion ("is X biased?") fails the gate — request the artifact or reroute.
2. **The lens fits.** Evidence-free opinion goes elsewhere (author-lens skills); claims about a person's character go to investigation or Research paths. Studies, datasets, surveys, statistical claims, or reporting on any of those proceed.
3. **Resolve pairing ambiguity.** A lone URL proceeds under the default reading (audit it). Two bare URLs need one clarifying question — is the second analyzing the first, or are these two independent artifacts to compare? Then proceed.

When the gate fails, ask at most three questions with a `proceed` override and halt.

## Pass 1 — normalize the input

| Shape | Treatment |
|-------|-----------|
| Lone URL | Fetch it; harvest embedded citations |
| File path | Read it (page-scoped reads for long PDFs) |
| Pasted prose | Take as given |
| URL plus commentary | URL stays primary; commentary is context |
| Two URLs | Confirm pairing per Gate 0, then audit both |

End with two piles: **the given artifact** plus **the sources it cites** (retrieved next).

## Pass 2 — chase the primary (non-negotiable)

When the given artifact reports on, cites, or summarizes a study, report, dataset, or paper, retrieve that underlying primary. Grading commentary while the cited work sits unopened is the characteristic failure — do not repeat it.

**Recognition cues:** "according to a study by X", "X's research found", "a new survey from X", "X report shows", "data from X"; linked PDFs or research landing pages; suspiciously precise statistics ("99% of CEOs…"); DOIs, preprint ids, journal names.

**Retrieval order:**

1. Follow a direct link when one exists.
2. When it lands on marketing or a table of contents, drill toward the methods PDF or dataset.
3. With no link, one round of search by producer plus author plus theme.
4. Still unlocated after one round: stop and record it — "primary not publicly reachable" enters the methods block as an availability finding.

One search round, then write. Documenting absence is legitimate output.

## Pass 3 — pin the methods facts

For the primary (or the artifact itself when no separate primary exists), capture:

- **Panel** — who was measured (population, roles, geography, recruitment channel)
- **Size** — total N plus any consequential sub-N
- **Timing** — fieldwork window and publication date
- **Backing** — funder and producer, plus what they sell where relevant
- **Instrument access** — full items or dataset public, toplines only, or undisclosed
- **Design** — survey, observational, RCT, retrospective, cross-section, longitudinal

"Not disclosed" is itself data — record it rather than skipping it.

## Pass 4 — score the strata

Load the shelf with `Read DEVOS/skills/BiasCheck/BiasTaxonomy.md`. Apply selectively.

### Inside the evidence

Producer pull, panel skew, loaded wording, respondent performance, intent-behavior distance, correlation-as-cause, baseless superlatives, gated methods, survivor sampling, snapshot-mismatched trends. Each hit gets two to four sentences tied to a concrete fact of this artifact — no generic "funded work is suspect" without the mechanism named.

### Behind the producer

What the outfit sells; whether this verdict feeds its pipeline; whether its serial reports converge suspiciously; whether the tie is disclosed in-artifact. Name the multiplier precisely (a workforce consultancy concluding firms need workforce consulting is structurally compromised — yet its numbers may still carry information). Multiply, don't auto-void.

### Inside the retelling

Headline-versus-source drift (commonly the highest-leverage flaw); body-level inflation; hop-by-hop amplification; causal verbs on correlational figures; missing confounds; topline-only citation. When the input IS the primary, skip this stratum with a one-line note saying so.

## Pass 5 — split supported from stretched

The core deliverable, two short lists:

- **Carries:** the charitable, defensible reading — what follows directly from design, panel, and reported findings. Be generous; surface the strongest honest version.
- **Doesn't carry:** claims the artifact makes (or implies) that the evidence cannot bear, each paired to its stratum finding above.

This split is what lets a reader rewrite the original claim correctly.

## Pass 6 — bottom line and provenance

Two to three plain sentences: what the artifact is, the honest form of its claim, and the multiplier sitting on top. Then a **Sources** list with URLs for every primary, intermediary, and methods document opened.

## Report contour

```markdown
# Bias Analysis: {short topic-based title}

**Source(s) examined**
- Reporting source: {URL or file path}
- Underlying primary source: {URL, citation, or "not publicly accessible"}

**Methodology of the underlying study**
- Sample frame: {description}
- Sample size: {N}
- Fieldwork dates: {dates}
- Funding/producer: {org + what they sell, if relevant}
- Instrument availability: {public / topline-only / not disclosed}
- Methodology type: {survey/observational/etc}

---

## Layer 1 — Biases inside the data

- **{Category name}.** {2–4 sentence specific finding tied to this study.}
- **{Category name}.** {finding}

## Layer 2 — Source-organization biases

- **{Category name}.** {finding}

## Layer 3 — Biases added by the journalism/commentary

- **{Category name}.** {finding}

*(Skip Layer 3 entirely with a one-line note if the input IS the primary source.)*

---

## What the data actually supports

- {Defensible claim 1}
- {Defensible claim 2}

## What the data does NOT support

- {Overclaim 1, tied to a Layer 1/2/3 finding}
- {Overclaim 2}

---

## Bottom line

{2–3 sentences. Honest reframe in plain language.}

**Sources**
- [Reporting source]({URL})
- [Primary source]({URL or note about unavailability})
- [Additional context]({URL})
```

## Pre-send checklist

- [ ] Methods block complete ("not disclosed" stated where applicable)
- [ ] Primary retrieved or its absence documented — never silently skipped
- [ ] Every charge anchored to an artifact tell, no atmosphere calls
- [ ] Strata kept disjoint; the third skipped only for primary-as-input
- [ ] Supported/stretched split present and concrete
- [ ] Bottom line reframes the artifact, not merely faults it
- [ ] Source URLs listed
- [ ] Hedge vocabulary ("could potentially", "may suggest") removed — diagnose or withhold

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"BiasCheck","workflow":"Check","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
