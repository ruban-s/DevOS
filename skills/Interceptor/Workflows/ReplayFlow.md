# ReplayFlow Workflow

Re-drive a bottled user journey to prove it holds past a deploy or edit. Each plan move executes in order, each stage's outcome is captured, regressions get named.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. Each `interceptor` verb below — the `batch` sample included — carries `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (from `preferences.env`). Captures travel `Tools/Capture.sh`, never bare `interceptor screenshot`.

## Suits

- Post-deploy runs over pages owning a recorded journey
- Regression gates ahead of UI merges
- Fix proofs by re-driving the journey that caught the bug
- Deploy pipelines beside VerifyDeploy

## Run

### 1. Fetch the plan

Recorded journeys live in `DEVOS/skills/Interceptor/Flows/`. Survey them:

```bash
ls DEVOS/skills/Interceptor/Flows/
```

Or mint fresh from a monitor session:

```bash
interceptor monitor export <SESSION_ID> --plan --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 2. Stage the start URL

Plans open with `interceptor tab new "<url>"` or `interceptor navigate "<url>"`. Run the equivalent:

```bash
interceptor open "<START_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 3. Walk the plan move by move

Read the plan file and fire moves in order. Per move:

```bash
# Example: click a button
interceptor act "button:Sign In" --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# Example: type into a field
interceptor act "textbox:Email" "user@example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# Example: settle the page
interceptor wait-stable --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Past each page-shifting move, confirm the owed state:

```bash
interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Absent nodes or shifted copy count as regressions — flag them.

### 4. Check network contracts (as needed)

Where the plan comments network cues (`# correlated fetch GET /api/...`), prove those endpoints still fire:

```bash
interceptor net log --json --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Set against the recording's baseline log. Watch for:
- Silenced endpoints (dropped API calls)
- Shifted status codes
- Surprise fresh requests

### 5. Freeze the finale

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

Read the printed frame path and set the end state against the journey's owed finale.

### 6. Grade the run

Per plan move, call:
- PASS: move landed, owed state confirmed
- FAIL: move broke or state surprised
- REGRESSION: conduct shifted from baseline

## Batched runs for trusted journeys

Well-worn journeys may fire batched:

```bash
interceptor batch '[
  {"type": "navigate", "url": "https://example.com"},
  {"type": "wait_stable"},
  {"type": "click", "ref": "button:Sign In"},
  {"type": "wait_stable"},
  {"type": "type", "ref": "textbox:Email", "value": "user@example.com"},
  {"type": "click", "ref": "button:Submit"}
]' --stop-on-error --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

`--stop-on-error` halts at the first break so diagnosis starts at the exact regression point.

## Notes

- Semantic selectors (`role:name`) outlast ref IDs (`e5`) — favor them in plans.
- On selector misses, `interceptor find "<name>"` re-locates nodes under fresh names.
- Journeys bottled per environment may want URL swaps (staging vs production).
- Password-bearing plans carry `# TODO` notes — substitute ahead of replay.
- Replay frames set against baseline frames double as visual regression proof.
