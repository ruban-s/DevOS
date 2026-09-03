---
name: BiasCheck
version: 1.0.3
description: "A three-stratum bias audit over any URL, file, or pasted text — retrieves the piece plus whatever study it leans on, then separates flaws in the evidence, interests of the producer, and distortions of the retelling into supported versus stretched claims. USE WHEN bias analysis, analyze bias, bias check, check this study, who funded this, is this source biased, fact-check article, methodological flaws, source credibility, what's wrong with this claim. NOT FOR character reads of authors, broad research briefs (use Research), or entity background checks."
disallowed-tools: Edit, Write, NotebookEdit
---

# BiasCheck

One artifact at a time, through the same audit every time.

## Announce (optional voice)

At workflow start, print:

```
Running the **Check** workflow in the **BiasCheck** skill to audit the source...
```

Speak it only if `DEVOS_PULSE_BASE` is set — a background POST to `$DEVOS_PULSE_BASE/notify`. Unset means work in silence.

## What gets examined

The input is a URL, a file path, pasted text, or a mix; the skill retrieves the artifact and, wherever it cites a study, the study too. Three strata, always in the same order:

1. **Inside the evidence** — what the study, dataset, or survey carries in itself: sponsorship pull, unrepresentative panels, loaded wording, respondents performing for the asker, the distance between what people say and what they do, correlation dressed as cause, superlatives with nothing behind them, methods kept out of reach.
2. **Behind the producer** — the outfit that paid for or published the work: what it sells, which finding would embarrass it, whether its conclusions ever vary, whether the tie is disclosed, whether its "independent experts" draw a salary.
3. **Inside the retelling** — what intermediaries layered on top: headlines beyond their bodies, reframes that run hotter than the source, amplification that drops the methods at every hop, causal verbs bolted onto correlational numbers, confounds gone missing, toplines picked clean.

The report closes by splitting what the evidence can carry from what was stretched on top of it. Confidence always hangs on a quoted tell — never on atmosphere.

## Why a fixed mold

Off-the-cuff bias calls run on impression: a hunch about an outlet, no cited mechanism, no way to re-run the judgment. The twin failure is grading the headline while the cited study stays sealed — the data may be sound while the framing fails, or the reverse, and impressions cannot tell the two apart. A stable category set and a stable report shape cure both. The audit becomes repeatable, the gaps become visible, and every charge stands on a tell.

## Routing

| Call | File |
|------|------|
| "bias check", "analyze bias on", "check this study/source/article" | `Workflows/Check.md` |

## Ground rules

- **One input, several shapes:** URL, path, pasted prose, or URL with commentary attached — the URL stays the artifact under audit.
- **Chase the primary.** Journalism pointing at a study means fetching the study; if it cannot be located, the failure is recorded as a finding, never skipped past.
- **Strata never merge.** Distortion hides in whichever stratum is least transparent; collapsing them buries it.
- **The supported/stretched split is the deliverable.** Everything funnels there.
- **Category catalog:** `BiasTaxonomy.md`, loaded when needed rather than memorized.

## Worked cases

**A vendor study behind a tech article**

```
User: "bias check https://futurism.com/some-article-citing-a-mercer-survey"
→ Check flow opens the article, spots the cited survey, retrieves the producer's own source
→ Audits producer interest, panel and wording flaws, headline-versus-source inflation
→ Returns the structured report with the supported/stretched split
```

**A bare abstract, pasted**

```
User: "bias check this abstract: [four pasted paragraphs]"
→ Check flow recognizes the paste IS the primary — no retelling stratum applies
→ Audits funding disclosure, panel, design, and producer interest from the top two strata
→ Says plainly when an abstract alone cannot ground a methods verdict
```

**A local file**

```
User: "bias check ~/Downloads/some-report.pdf"
→ Check flow reads the file, traces the upstream sources it cites, fetches what is reachable
→ Returns the three-stratum audit with specifics
```

## Report contract

- **Shape:** markdown, following the fixed contour in `Workflows/Check.md`.
- **Length:** matched to the artifact — a single-claim post earns ~200 words; a funded study wrapped in a viral retelling earns 800–1500.
- **Voice:** plain and pointed. Every charge quotes a phrase, cites a panel fact, or names a missing disclosure.
- **Required:** a methods line (panel, dates, instrument access), all applicable strata, the supported/stretched split, a bottom-line paragraph, a source list with URLs.
- **Barred:** hedge-padding ("could potentially be biased"). Diagnose or withhold — the reader may disagree, but must know the call.

## Judgment calls

- **Reach the primary or record why not.** Auditing commentary over a study that was never opened is the cardinal failure; an unlocatable primary enters the report as an availability finding.
- **Near-unanimous agreement indicts the item.** A substantive question clearing ~95% almost always rides a low-bar yes/no wording — flag it even with the instrument hidden.
- **Funded research is still research.** A consultancy's commercial interest multiplies scrutiny; it does not void the work. A specific mechanism beats a blanket dismissal.
- **Keep strata disjoint.** A sloppy headline doesn't taint clean data; shaky data doesn't convict honest reporting. Score each on its own record.
- **Headlines outrun bodies.** Most readers stop at the headline, so headline-versus-source drift is the highest-leverage retelling flaw — flag it whenever present.
- **Grant the charitable read first.** State what the data can honestly carry before showing where it fails; the critique then rests on specifics.
- **Stay inside the fetched artifact.** Nothing about the producer's other output, no "they always" — only what is in hand.
- **Opinion without evidence needs a different lens.** Pure commentary with no empirical scaffolding is not this audit's material.
- **Biography stays out of frame.** The artifact is graded, not the writer's history; background work goes to Research or a dedicated investigation path.

## User overrides

Look in `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/BiasCheck/` first. `PREFERENCES.md` and companion references there take precedence; otherwise proceed as written.

## Execution Log

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"BiasCheck","workflow":"Check","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
