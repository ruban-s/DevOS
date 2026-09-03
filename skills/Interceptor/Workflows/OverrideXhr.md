# OverrideXhr

Bending an HTTP request pre-server, or rewriting a response pre-page. Reach here when:
- The page behaves, but the API answering 500 / 404 / slow needs a rehearsal.
- Request parameters must shift sans UI rebuild.
- The backend can't mint the test data.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. This workflow rewrites live traffic; a mis-aimed run would bend requests inside the operator's genuine session. Each `interceptor` verb below carries `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (the pinned isolated context from `preferences.env`). **Obligatory janitor:** arm cleanup so overrides always lift, even mid-failure:

```bash
trap 'interceptor override clear --context "$INTERCEPTOR_TEST_CONTEXT_ID" 2>/dev/null' EXIT
```

Overrides outlive `open` calls and crashed runs — a lingering override quietly bends the next session's traffic. The trap backs the explicit `override clear` step.

## Call budget

**5 calls.**

1. `interceptor net log --filter <pattern> --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — watch genuine traffic first; never override blind
2. `interceptor override "<pattern>" status=... --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — plant
3. Fire the request (`act`, `click`, `type`, `navigate` — each carrying `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`)
4. `interceptor net log --filter <pattern> --since 30s --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — prove the override bit (NOT a fresh `read` — response truth sits in the network log)
5. `interceptor override clear --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — always lift; overrides outlive `open` calls

When step 4 shows a miss, sharpen the pattern and retry 2–4 once. No fresh `read` "page check" before the network proves the bend.

## Run

1. **Open the page.**
   ```bash
   interceptor open <url> --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```

2. **Watch genuine traffic first.**
   ```bash
   interceptor net log --filter <pattern> --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   interceptor net headers --filter <pattern> --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```
   A unique URL substring becomes your override key.

3. **Plant the override.**
   ```bash
   interceptor override "*api/search*" status=500 --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   interceptor override "*api/search*" delay=1000 --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   interceptor override "*api/search*" status=200 body='{"results":[]}' --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   interceptor override "*api/items*" params=count:5 --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```

4. **Fire the request** — click, type, navigate, whatever summons the call (each verb carrying `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`).

5. **Prove.**
   ```bash
   interceptor net log --filter <pattern> --since 30s --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```
   The answer should wear your forcing. Otherwise the pattern likely missed.

6. **Lift (always — the EXIT trap above backs this explicit move).**
   ```bash
   interceptor override clear --context "$INTERCEPTOR_TEST_CONTEXT_ID"
   ```

## CDP `network` instead, when

`interceptor override` rides the extension's declarativeNetRequest road — no debugger banner, no DevTools fingerprint. Climb to `interceptor network on` + `interceptor network override` (each carrying `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`) solely when:
- Request-body rewriting is owed (extension overrides stay URL/header-bound on some sites).
- WebSocket frames need watching (passive `net` skips WS — see canvas notes for the MAIN-world WS hook).
- Pre-decode raw bytes are owed.

CDP attach raises a "DevTools is debugging this tab" banner. Banner-watching pages behave apart. Default to extension overrides.

## Traffic exports (0.16.9)

For debrief / regression keepsakes, export the harvest:

```bash
interceptor net export --format har --context "$INTERCEPTOR_TEST_CONTEXT_ID"                  # HAR 1.2 (any HAR viewer / DevTools import)
interceptor net export --format pcapng --context "$INTERCEPTOR_TEST_CONTEXT_ID"               # pcapng for Wireshark
interceptor net export --format json --out trace.json --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

## Traps

- **Over-wide patterns.** Lone `*` bends everything including extension traffic — pages can seize. Key a substring unique to the request.
- **Skipped `override clear`.** Rules outlive `open` calls till explicitly lifted. A run that "passed last time" may be reading a stale bend.
- **Override vs cache.** Browsers cache. Overriding `GET /api/foo` while the page serves a `Cache-Control: max-age` copy never fires. Bust with `?cb=<timestamp>` or `interceptor navigate`.

## Answer shape

Report:
- Override key (URL pattern + bent fields)
- Observed answer post-trigger
- Whether page conduct met expectation
- Whether `override clear` ran
