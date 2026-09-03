# Monitor — watch surfaces, speak on transitions

Polls a workspace's surfaces, scores each agent idle / working / done / awaiting-input, and raises a voice cue the moment one lands or stalls awaiting the operator.

## Motive

Unwatched panes are black boxes — stalls, loops, and completions surface only when someone happens to look. `monitor` looks continuously so attention spends on the agent needing it, not on babysitting the ones that don't.

## Poll, not push

cmux exposes no subscribe primitive — no callback registration for "tell me on done". `monitor` therefore **polls**: every `--interval` seconds it walks the workspace, samples `surface-health` plus the screen tail per surface, and diffs against the previous pass. Alerts are transitions the loop notices, not events the app emits. That shape comes from the CLI surface, not the wrapper.

## Pass

1. **Open the loop on a workspace:**

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace beta --interval 3
   ```

   Per surface per pass, `surface-health` plus `read-screen` tail sorts into:
   - **idle** — shell prompt, nothing active
   - **working** — output advancing or a process held
   - **done** — completion markers in the tail (green suites, "done", returned prompt)
   - **awaiting-input** — a live prompt needs the operator (y/n, secret, confirmation)

2. **Act on edges.** A flip into `done` or `awaiting-input` calls the `voice` path — a background POST to `$DEVOS_PULSE_BASE/notify` carrying `{ message, voice_enabled: true }`. With `DEVOS_PULSE_BASE` empty the step skips silently (spoken alerts are a v2 surface); classification and logging continue regardless. When configured, `beta/worker-2 finished` or `beta/lead awaiting input` arrives audibly; eyes move only when summoned.

3. **Single sweep, no loop.** Scripted spot-checks (including from sibling workflows) pass `--once` for one classification round and exit:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace beta --once
   ```

## Relation to the harness

`monitor` extends observability; it replaces no harness surface. Classified states remain available to whatever dashboard or log consumes them, and completion cues reuse the existing voice route when configured. cmux is the newly watched substrate; memory, planning, and routing behave as before. State in, attention out.

## End-to-end — hands-free race watch

```bash
# a 5-agent race runs in workspace:7 (see AgentRace.md)
bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace workspace:7 --interval 2
# ... operator works elsewhere ...
# voice (when configured): "workspace:7 race-3 finished" — first done wins attention
```

Collect the winner:

```bash
bun DEVOS/skills/CMUX/Tools/cmux.ts read --surface surface:32 --lines 80
bun DEVOS/skills/CMUX/Tools/cmux.ts flash --workspace workspace:7
```

Watchable crews originate in BootTeam.md (tiered) and Fleet.md (grids); the race shape built for hands-free watching is AgentRace.md.
