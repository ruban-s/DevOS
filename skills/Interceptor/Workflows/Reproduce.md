# Reproduce Workflow

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Reproduce workflow in the Interceptor skill to reproduce a bug"}' \
  > /dev/null 2>&1 &
```

Running **Reproduce** in **Interceptor**...

---

Meet a reported bug in genuine Chrome BEFORE opening any source. Console throws, network deaths, and visual state are the primary exhibits; code theories wait their turn.

## Fits

- Every UI/page report ("blank screen", "broken layout", "page won't load")
- The mandatory opener ahead of any web-facing fix
- Post-deploy "something looks off" notes
- The Algorithm's Diagnostic preflight gate

## Run

### 0. Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Prefer `bash DEVOS/skills/Interceptor/Tools/EnsureTestProfile.sh` — same gate plus self-open of a shut test profile (exit 5/6), proceeding solely past the pinned-UUID match. Non-zero → STOP, relay the message exactly; never sink to Default. `INTERCEPTOR_TEST_CONTEXT_ID` is the pinned isolated context; each browser verb below carries it. Reproduce isolated by default; visit the main profile solely when the bug clings to the operator's signed-in session (and they said so). Captures travel `Tools/Capture.sh`, never bare `interceptor screenshot`.

### 1. Open the broken page (isolated profile)

```bash
interceptor open "<BUG_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

No code first. No theories. Open and look.

### 2. Freeze the visual state

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh "<BUG_URL>"
```

Read the printed frame path. Is the report visible? Log seen-vs-expected.

### 3. Sweep console and requests

```bash
interceptor eval "(() => {
  const entries = performance.getEntriesByType('resource').filter(e => e.name.includes('.js') || e.name.includes('.css'));
  const failed = entries.filter(e => e.transferSize === 0 && e.decodedBodySize === 0);
  return JSON.stringify({ consoleCheck: 'done', failedResources: failed.map(e => e.name) });
})()" --main --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Plus the request log:

```bash
interceptor net log --json --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Watch for:
- 404s on JS/CSS bundles (absent build outputs — the classic blank-screen deploy)
- Dying API calls (500s, timeouts)
- CORS breaks
- Mixed-content warnings

### 4. Read the page prose

```bash
interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Set visible prose against expectation. Hollow or missing regions flag render deaths.

### 5. Log findings ahead of code

Before any source opens, write down:
- What the page truly shows (frame evidence)
- Console throws captured (exact messages)
- Network deaths (exact URLs + statuses)
- Expected-vs-actual gap

ONLY then open code, carrying hypotheses the browser exhibits back.

## Notes

- This workflow exists because real incidents burned hours on source-diving and shipped wrong-theory fixes to prod — while the true cause (missing JS chunks, bundle 404s, CORS breaks) sat visible in the browser console inside a minute. Reproduce first, theorize after.
- "curl answers 200" is NOT reproduction. The rendered page must be SEEN.
- Code-first debugging is speculation, not diagnosis.
- Signed-in pages ride your real Chrome sessions automatically.
- Session closed (bug met and exhibits banked — never between probes), run `bash DEVOS/skills/Interceptor/Tools/CleanupTabs.sh` to shut the test profile's leftover tabs.
