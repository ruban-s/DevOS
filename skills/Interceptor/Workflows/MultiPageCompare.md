# MultiPageCompare

Answering a spanning question from N pages — "who designed Python vs JavaScript", "which year did each paper land", "stack these three pricing pages". Answers sit in plain prose per page; structure (refs, tree) is irrelevant. Fast sequential fact-lifting with lean context.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (the pinned isolated context from `preferences.env`) is doctrine on each `open` below, never optional — and sits outside the call budget.

## Call budget

**2 + 1 per page.** Three calls for two pages, four for three, five for four:

1. `interceptor open <url-1> --text-only` → 1 (open + prose in one move)
2. `interceptor open <url-2> --text-only` → 1
3. (... one more per page ...)
4. Answer from the harvested facts.

When a page serves the wrong slice (TOC over article body), spend 1 extra call on a fenced `read e<ref> --text-only` — once, never twice. Then commit.

## Why fenced

Unguided agents thrash multi-page comparisons — open A, open B, re-open A "going back," shuffling `tab new` against `navigate`. Tab-state fog. This workflow bars it.

## Run

1. **One `open --text-only` per page.** `--text-only` serves prose sans the actionable-element tree — the sole need for fact-lifting. Trims ~70% of per-page token weight.

   ```bash
   interceptor open "https://en.wikipedia.org/wiki/Python_(programming_language)" --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   interceptor open "https://en.wikipedia.org/wiki/JavaScript" --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```

2. **Read each answer in place.** Prose already arrived with the `open` — no trailing `read`. Each `open` bundles open + settle + read in one round-trip.

3. **Answer from the prose.** Quote each page's exact fact, naming its source. When a page's prose lacked the fact, say so for that page and answer from the pages that held it. No re-opens.

## Anti-shapes

- **No `tab new`** — `interceptor open` already mints the tab. `tab new` then `navigate` is the costliest habit on this job.
- **No `navigate` post-`open`** — `open` already steered. `navigate` serves page shifts *inside an already-managed tab*.
- **No re-opens** — context still holds the first call's prose. The second call is twin bytes.
- **No full `interceptor read`** — the tree is noise where prose facts are the prize.
- **No chained `open`s pre-read** — read each before opening next, so sufficiency is judged live.

## Context addressing

`--context "$INTERCEPTOR_TEST_CONTEXT_ID"` rides each `open` mandatorily (set by the top gate), never conditionally on multi-browser states. At one surviving context, bare verbs quietly land on whatever remains — Default included. Always pin:

```bash
interceptor open <url> --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

## Outside this workflow

- **Lone-page jobs** — take `ReadAndExtract.md`. This road starts at ≥ 2 pages.
- **Per-page clicking owed** — take `ReadAndExtract.md` or `VerifyDeploy.md` with `--tree-only --tree-format compact`.
- **Authed or heavy-JS pages** — `--text-only` can miss post-paint content. Full `read` for those pages only, still sequential.

## Answer shape

```
Page 1 (Python wiki): Guido van Rossum, released 1991.
Page 2 (JavaScript wiki): Brendan Eich, released 1995.

Answer: Python was designed by Guido van Rossum (1991); JavaScript by Brendan Eich (1995). Python predates JavaScript by 4 years.
```

On a miss, name the page and the attempt:

```
Page 1: extracted (Guido van Rossum, 1991).
Page 2: page text did not include the creator's name; the byline was rendered post-load.
```

Never invent the absent fact. Never retry without end.
