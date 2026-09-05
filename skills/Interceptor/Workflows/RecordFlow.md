# RecordFlow Workflow

Bottle a user journey as browser moves become a replayable script. Interceptor's monitor watches clicks, typing, navigation, and requests, then exports a replay plan on semantic selectors.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. Recording inside the operator's main profile would bottle their genuine session events and credentials — record solely in the pinned isolated context. Each `interceptor` verb below carries `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (from `preferences.env`).

## Suits

- Bottling a critical journey for regression runs (signup, payment, onboarding)
- Minting a repeatable QA check from a hand walkthrough
- Baselining API contracts (which endpoints a journey fires)
- Documenting a tangled multi-step interaction for later replay

## Run

### 1. Stage the start page

```bash
interceptor open "<START_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Confirm the start page ahead of recording.

### 2. Roll recording

```bash
interceptor monitor start --instruction "<FLOW_DESCRIPTION>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

The instruction travels with the session into exports. Write it sharp: "Signup flow from landing page through onboarding" beats "signup test".

### 3. Walk the journey

Drive it with interceptor verbs:

```bash
interceptor act e5 --context "$INTERCEPTOR_TEST_CONTEXT_ID"                    # Click a button
interceptor act e12 "user@example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"  # Type into a field
interceptor act e8 --keys "Enter" --context "$INTERCEPTOR_TEST_CONTEXT_ID"     # Press Enter
```

Or walk it by hand in Chrome — the monitor sees genuine user moves too (clicks, typing, scrolling, posts).

The monitor bottles:
- Each click, double-click, right-click (element ref, role, accessible name)
- Each input/change event (values — passwords self-mask)
- Shortcuts (Enter, Tab, Escape, arrows)
- Form posts
- Network requests tied to their triggering move
- DOM mutations per move

### 4. Cut recording

```bash
interceptor monitor stop --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Answers a session tally (events, mutations, requests, duration).

### 5. Export the replay plan

```bash
interceptor monitor list --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Take the session ID from the list, then:

```bash
interceptor monitor export <SESSION_ID> --plan --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

The export writes a replayable script on semantic selectors (`role:name` shape) that outlast DOM churn better than ref IDs. `wait-stable` moves ship between mutation-bearing actions.

With network proof cues:

```bash
interceptor monitor export <SESSION_ID> --plan --with-bodies --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 6. File the plan

Store the export at `DEVOS/skills/Interceptor/Flows/<flow-name>.sh` for later ReplayFlow runs. (Today `Flows/` holds solely a README — recorded plans are its first citizens.)

### 7. Read the plan

Scan the generated script for:
- `# TODO` notes where password fields masked — hand-substitute values
- `# ref eN (no accessible name)` fallbacks — brittle; weigh accessible names in the UI
- Commented network cues tying API calls to moves

## Notes

- The monitor listens from Chrome's content script — genuine user events land, not just interceptor-fired ones.
- Password and card fields self-mask in recordings (`***N***` shape).
- Recordings persist as JSONL at the interceptor events path. `interceptor monitor export <sid> --json` serves the raw feed.
- Session recordings survive interceptor restarts but stay per-machine (unsynced).
- Live watch mid-recording: `interceptor monitor tail` streams events real-time.
