# ReadAndExtract

Pull a structured answer off a page — a fact, value, list, table body. The answer may sit in DOM, an XHR payload, or painted prose; hand it back as data.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. Each browser verb in this workflow carries `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (the pinned isolated context from `preferences.env`) — samples below drop it for brevity, but append it per call. Any captures travel `Tools/Capture.sh`, never bare `interceptor screenshot`.

## Call budget

**3 calls, 4 at most.**

1. `interceptor open <url>` — preflight; tree + flat prose arrive by default
2. **One** narrowing read (solely when step 1 fell short): exactly ONE of `read --text-only`, `read --markdown --text-only`, or `read --tree-only --tree-format compact`. Never two content surfaces.
3. As needed: `read <ref>` into a sub-element OR `find "<text>"` when the first pass missed.

At call 4 without the value, commit to what's in hand. No fifth read.

**Mode-swap rule:** when step 2 wants shape (exact-text jobs, tables, decoy-heavy pages), take `--markdown --text-only` *in place of* plain `--text-only`. Same content, other rendering — never both.

## Which surface

1. **Plain page prose?** → `read --text-only` (lightest surface).
2. **One element?** → `find "<text>"` or `read e<ref>`.
3. **A subtree?** → `read e<ref>` to fence it.
4. **An iframe?** → `read --include-frames`, refs shaped `e2_7`.
5. **Client SPA state?** → `inspect` (tree + network) or `state` for framework internals.
6. **An API payload?** → `net log --filter <pattern>` or `inspect --net-only`.
7. **None fit?** → `eval --main "expression"` as the hatch.

## When `read` under-delivers

`read` appends `... (truncated: showed X of Y chars ...)` at its cap. Spot the marker before declaring data absent.

One-call remedies:

- `read e<ref> --text-only` — fence a known region (cheapest)
- `read --text-only --full` — widen to 200K chars
- `find "<target>"` — leap to the node (cheapest with known prose)

**Never fetch `?action=raw`, `view-source:`, or markup-grade URLs.** Painted prose beats source.

## Take `--markdown` when

- The job says "report the exact X" / "the summary text" / "the exact phrasing" — hierarchy disambiguates.
- Emphasized prose neighbors plain copy that could impersonate the answer.
- A clean table render is owed (markdown pipes beat scraped prose).

## Skip `--markdown` when

- The prize is atomic (date, name, number) — flat prose is quicker.
- `--text-only` already answered. Never re-read another mode.

## SPA state / XHR payloads

```bash
interceptor state --context "$INTERCEPTOR_TEST_CONTEXT_ID"                              # Common framework probes
interceptor eval --main "window.__APP_STATE__" --context "$INTERCEPTOR_TEST_CONTEXT_ID"  # Targeted page-world read
interceptor net log --filter graphql --limit 10 --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor inspect --net-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

## Iframes

```bash
interceptor read --include-frames --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor act e2_7 --context "$INTERCEPTOR_TEST_CONTEXT_ID"    # Framed ref directly
```

## Answer shape

- **Atomic value:** quote exactly, no padding prose.
- **List:** bullets, exact strings, source order.
- **Table:** markdown table, columns kept.
- **Network payload:** exact JSON path + value.

Value missing or hollow: answer "not found" naming the exact selector or filter that came back empty. Never invent a fallback.
