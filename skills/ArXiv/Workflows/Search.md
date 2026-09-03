# Search — hunt preprints by theme or name

Finds papers matching a topic, keyword set, or author.

## Ask

Any combination of theme words, title fragments, or author names.

## Pass

### 1. Render the query

Convert intent into feed syntax:

- Theme or keywords → `all:{query}`, tightening to `ti:{query}+AND+abs:{query}` when precision matters
- Author → `au:{name}`
- Mixtures → join with `AND` / `OR`

Encode blanks as `+`, reserved characters as `%XX`.

Samples: theme "prompt injection" → `all:prompt+injection`; author-plus-theme "agent papers by Shunyu Yao" → `au:Yao+AND+all:agent`; title-plus-abstract "retrieval augmented generation security" → `ti:retrieval+augmented+generation+AND+abs:security`.

### 2. Pull the feed

```bash
curl -sL "https://export.arxiv.org/api/query?search_query=QUERY&sortBy=submittedDate&sortOrder=descending&start=0&max_results=15"
```

Submission ordering fits hunting (the freshest relevant work first) where update ordering fits browsing (which also resurfaces edited elders).

### 3. Sift

Keep the Latest flow's field extraction, then drop entries older than a year unless the caller asked for history, plus anything whose title and abstract miss the intent.

### 4. Brief the head

Request AlphaXiv briefs for the top three to five:

```bash
curl -s "https://alphaxiv.org/overview/PAPER_ID.md"
```

### 5. Lay out the list

Same scannable mold as the Latest flow, but ordered by fit rather than date. When the query invites iteration, append follow-ups:

```markdown
## Related Searches
- Try `cat:cs.CR+AND+all:prompt+injection` for security-angled matches
- Try `au:Smith+AND+cat:cs.CL` to narrow by author and area
```
