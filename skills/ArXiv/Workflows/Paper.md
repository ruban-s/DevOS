# Paper — open one preprint fully

Builds a structured brief for a single paper, preferring the machine overview with feed metadata as the spine.

## Ask

One of: an arXiv page or PDF URL (`https://arxiv.org/abs/2603.12345`), an AlphaXiv page (`https://alphaxiv.org/abs/2603.12345`), or a bare id (`2603.12345`, optionally versioned like `2603.12345v2`).

## Pass

### 1. Isolate the id

Reduce any URL to the numeric id (e.g. `2603.12345`). Strip version suffixes for brief lookup, which tracks the latest revision.

### 2. Attempt the machine brief first

```bash
curl -s "https://alphaxiv.org/overview/PAPER_ID.md"
```

A 200 returns model-oriented Markdown analysis — the preferred primary source.

### 3. Pull feed metadata regardless

```bash
curl -sL "https://export.arxiv.org/api/query?id_list=PAPER_ID"
```

Retain title, author roster, abstract, subject tags, debut and revision dates, and DOI when present.

### 4. Fall back to full text when the brief is missing

```bash
curl -s "https://alphaxiv.org/abs/PAPER_ID.md"
```

A second 404 means working from the abstract alone; point the caller at `https://arxiv.org/pdf/PAPER_ID` for the complete document.

### 5. Present the paper

```markdown
# {Paper Title}

**Authors:** {full author list}
**Published:** {date} | **Categories:** {cats}
**Links:** [arXiv](https://arxiv.org/abs/ID) | [PDF](https://arxiv.org/pdf/ID) | [AlphaXiv](https://alphaxiv.org/abs/ID)

## Overview
{Machine brief or abstract-derived condensation}

## Key Contributions
{3-5 bullets on what is new or load-bearing}

## Relevance to Our Work
{How it touches developer tooling, agents, security, LLM infrastructure, or the operator's stated interests}

## Worth Reading?
{Candid call — skim, read, or skip — with the reason}
```
