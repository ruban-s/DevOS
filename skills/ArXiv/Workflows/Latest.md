# Latest — survey fresh arrivals by subject

Collects the newest preprints across one or several subject areas.

## Ask

A theme ("AI agents", "LLM security", "machine learning"). Translate it to subjects; stack several with OR when the theme straddles areas.

## Pass

### 1. Translate theme to subjects

| Theme | Query fragment |
|-------|----------------|
| AI, artificial intelligence | `cs.AI` |
| machine learning, deep learning | `cs.LG` |
| LLMs, NLP, language models | `cs.CL` |
| security, cybersecurity | `cs.CR` |
| agents, multi-agent | `cs.MA+OR+cs.AI` |
| software engineering | `cs.SE` |
| robotics | `cs.RO` |
| computer vision | `cs.CV` |
| retrieval, RAG | `cs.IR` |

A caller-supplied subject code passes through verbatim.

### 2. Pull the feed

```bash
curl -sL "https://export.arxiv.org/api/query?search_query=cat:CATEGORY&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=15"
```

Several subjects:

```bash
curl -sL "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.MA&sortBy=lastUpdatedDate&sortOrder=descending&start=0&max_results=15"
```

### 3. Shape the XML

From every `<entry>` keep: `<title>` (unwrap newlines), the identifier parsed out of `<id>` (e.g. `2603.12345`), `<published>` for the debut date, the opening sentences of `<summary>`, up to three `<author><name>` values plus "et al." beyond that, and `<arxiv:primary_category>`.

### 4. Brief the standouts

For the three to five entries most germane to the operator's work (agents, security, LLM infrastructure, personal tooling):

```bash
curl -s "https://alphaxiv.org/overview/PAPER_ID.md"
```

A 200 yields a usable brief; a 404 means falling back to the abstract.

### 5. Lay out the list

Lead with relevance, not recency:

```markdown
## Latest in {Category} — {Date}

### {Paper Title}
**{Authors}** | {Date} | `{paper_id}`
{2-3 sentence abstract or brief condensation}
**Why it matters:** {one sentence of relevance}
```

Attach per paper the canonical `https://arxiv.org/abs/{paper_id}` link and, where a brief resolved, `https://alphaxiv.org/abs/{paper_id}`.

### 6. Name the reads

Close with a short "papers worth reading" shelf — two or three entries closest to the operator's interests, each with a line on why it earned the slot.
