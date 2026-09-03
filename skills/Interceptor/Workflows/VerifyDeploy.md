# VerifyDeploy Workflow

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the VerifyDeploy workflow in the Interceptor skill to verify a deployment"}' \
  > /dev/null 2>&1 &
```

Running **VerifyDeploy** in **Interceptor**...

---

Confirm a deploy by opening the URL in genuine Chrome and assembling a **four-probe evidence bundle**: DOM read, console errors, network failures, screenshot. Genuine browser sessions carry both public and signed-in pages.

**The bundle is all-or-nothing.** Four probes run on every verification — one body of evidence, not a menu. Pixels alone never close it: no screenshot exposes a hydration mismatch, a quiet JS throw, or a 404 on a lazy chunk. Clean logs alone never close it either — the page must visibly render. Four probes, one bundle, each run. Side benefit: the three non-visual probes ride independent WebSocket types, so a wedged screenshot no longer starves the evidence.

## Fits

- Any web-project deploy, fresh or touched-up
- The Algorithm's Verification Doctrine Rule 1 demanding live-probe evidence
- CSS/layout/content edits wanting eyeball confirmation
- Pages agent-browser can't enter (auth walls, bot gates)

## Run

### 0. Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/EnsureTestProfile.sh
```

`EnsureTestProfile.sh` both gates and self-heals: on a merely-shut test window (exit 5/6) it opens the configured profile, polls till the pinned context links, and prints `READY`. It succeeds solely past the gate (pinned-UUID match + Default refusal), so a mis-aimed open can never be driven. Non-zero → STOP, relay the message exactly; never sink to Default. (Call `PreflightIsolation.sh` directly for the gate with NO self-open.) `INTERCEPTOR_TEST_CONTEXT_ID` is the pinned isolated context; each browser verb below carries it. Captures travel `Tools/Capture.sh`, never bare `interceptor screenshot`.

### 1. Open the deploy URL (isolated profile)

```bash
interceptor open "<DEPLOY_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

One move navigates, settles on DOM calm, and returns tree + visible text. `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` pins the move to the isolated test window; the operator's main Chrome goes untouched. Never the bare literal `interceptor-test` — that friendly name resolves on this box only after assignment in the extension popup; the pinned UUID sits in `preferences.env`.

Slow loaders (heavy SPAs, SSR hydration):

```bash
interceptor open "<DEPLOY_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID" --timeout 10000
```

Pages **needing the operator's own login** (checking their signed-in tooling): say so outright and travel `--context <main-id>` to their main profile after `interceptor contexts` proves it — never quietly.

### 2. Probe A — DOM content

```bash
interceptor read --markdown --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Settle that shipped content truly stands: the heading/copy/component released, no error banners, no hollow regions where content belongs, no "404"/"500"/"not found" in visible prose.

### 3. Probe B — console errors (plant, exercise, collect)

No collector preinstalls — plant one, then harvest FORWARD. (`window.__interceptor_errors` is fiction until you build it; a cold read returning `[]` proves zero.)

```bash
# 3a. Plant the collector (page already loaded)
interceptor eval "window.__errs=[];window.addEventListener('error',e=>window.__errs.push({m:e.message,s:(e.error&&e.error.stack||'').slice(0,300)}));window.addEventListener('unhandledrejection',e=>window.__errs.push({m:String(e.reason).slice(0,300)}));(function(o){console.error=function(){window.__errs.push({c:[...arguments].map(String).join(' ').slice(0,300)});return o.apply(console,arguments)}})(console.error);'installed'" --main --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# 3b. Work the page — main nav click, changed feature, lazy-load wait
interceptor wait-stable --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# 3c. Collect
interceptor eval "JSON.stringify(window.__errs||[])" --main --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

**Edge:** reloads erase collector AND quarry. Never plant-then-reload — plant post-load and harvest forward from the next move. Load-time throws surface only through Probe A symptoms (hollow regions) and Probe C (dead requests). Planting on `about:blank` pre-navigation is unsupported — accept the forward boundary and lean on sibling probes for load-time deaths.

**Noise line:** standing third-party chatter (ad blockers, extensions, known-benign warnings) is logged, never failing; throws from YOUR origin's scripts fail.

### 4. Probe C — network deaths

```bash
interceptor net log --context "$INTERCEPTOR_TEST_CONTEXT_ID" --limit 100
```

Failing marks:
- 404s on same-origin JS/CSS chunks (absent build outputs)
- 4xx/5xx on same-origin API routes
- CORS breaks on resources you own

Third-party 4xx (trackers, ads) is noted, never failing.

### 5. Probe D — pixels

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh "<DEPLOY_URL>"
# long pages:
bash DEVOS/skills/Interceptor/Tools/Capture.sh "<DEPLOY_URL>" --full
```

`Capture.sh` re-gates isolation, aims the pinned context, prefers DOM-render (no foreground), and prints the saved frame's absolute path as its sole stdout line. Read the frame to confirm paint. Never bare `interceptor screenshot` here — it drops the deny-Default guard and CWD handling.

**Flow gallery (optional, multi-step journeys).** One end-state frame proves the last screen painted, not the three before — a mid-flow break (failed validation, hollow middle step, wrong redirect) hides. For stepped journeys (signup, checkout, vote, onboarding), shoot an ORDERED gallery instead: `Capture.sh` per step, ordered and labeled (`01-landing`, `02-form-filled`, `03-confirm`, …). Read front to back, clearing every state, not just the finale. Gallery extends Probe D; probes A–C still run. Breaks living in *motion* (animation, transition, flicker) want `ScrubFlow` — stills, however many, can't hear a stutter.

### 6. Call it — the bundle verdict

Closed verification = ALL FOUR probes harvested and clean (under the noise lines above). Tick the ISC `[x]` citing the bundle: content confirmed + console clean (or noise-only) + network clean (or noise-only) + frame path.

- Screenshot stuck past one self-heal retry? Probes A–C still ship — report them, tag visuals `[DEFERRED-VERIFY]`, surface the wedge. Never abandon A–C over D.
- Any probe failing genuinely: lead with the concrete evidence (console, network, visual) ahead of any repair. No code theories — browser evidence rules.

### 7. Tidy tabs (closer)

Evidence banked, shut the tabs this run opened:

```bash
bash DEVOS/skills/Interceptor/Tools/CleanupTabs.sh
```

Touches the pinned test context only, spares the live tab. `--keep-url <substr>` preserves a tab a follow-up needs.

## Notes

- Signed-in pages ride your real Chrome logins. No profile rituals.
- Public pages where pace beats depth and auth is absent — WebFetch (or the BrightData ladder) suffices.
- Local dev URLs always `http://localhost:PORT`, never bare `localhost:PORT`.
- Chrome shut means start it. Interceptor wants a live Chrome with the extension loaded.

## Gotchas

- **Content/archive sites: clear the CONTENT routes, not the shell.** An SPA 200s every path with the full shell, and list/tab views paint from metadata — so homepage pixels plus tab reads can all clear while each detail page ships raw markup. Seen live: a homepage cleared while all 21 essay pages rendered tag soup. The sweep opens at least one page of EVERY route/template kind (detail/content pages first) in the genuine browser, and content sites additionally pass a deterministic render gate over the full built payload ahead of any done-claim. That gate is a build-time script in the site's own repo failing on escaped tags, raw markdown residue, relative URLs, and missing paragraph shape.
