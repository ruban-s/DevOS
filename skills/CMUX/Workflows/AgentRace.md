# AgentRace — N agents, one problem, first credible win keeps it

Fans several agents onto the same fault in one workspace and banks the first sound fix. The pattern for faults where the right framing is unknowable in advance: pay compute in parallel to save wall-clock in series.

## Occasion

A production fault any single agent *might* crack, with no way to predict whose framing lands. Serial retries bill full latency per miss; a race bills one attempt's latency and lets the fault select its own solver.

## Pass

1. **Open the race.** One workspace, N surfaces, one launch line each:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts race \
     --feature checkout-500 --agents 4 --cwd ~/Projects/App \
     --cmd "claude 'The /checkout endpoint 500s on empty cart. Find and fix it.'"
   ```

   Tabs arrive named `race-1`…`race-4` with `--cmd` started in each; refs return as JSON. Without `--cmd`, surfaces wait empty for staged prompts.

2. **Keep the address book.**

   ```json
   {"ok":true,"workspace":"workspace:7",
    "surfaces":[
      {"tab":"race-1","surface":"surface:30"},
      {"tab":"race-2","surface":"surface:31"},
      {"tab":"race-3","surface":"surface:32"},
      {"tab":"race-4","surface":"surface:33"}]}
   ```

3. **Watch for the winner.** `monitor` scores every surface idle/working/done/awaiting and voices the first `done` when `DEVOS_PULSE_BASE` is set:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace workspace:7 --interval 3
   ```

4. **Bank the winning answer.** Read the finisher's screen tail:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts read --surface surface:32 --lines 80
   ```

   The diff and rationale inside `text` are the keeper.

5. **Retire the field.** Release machines via per-surface close or one workspace close once the winner's work is banked:

   ```bash
   cmux close-surface --surface surface:30
   cmux close-surface --surface surface:31
   cmux close-surface --surface surface:33
   ```

## Why parallel beats serial here

Serial attempts learn nothing until each miss completes. Parallel attempts let divergent framings compete — the agent whose model of the fault fits finishes first. The spend moves from waiting time to machine time.

## End-to-end — lockout hotfix

```bash
# 1. six agents on the login regression, theories unconstrained
bun DEVOS/skills/CMUX/Tools/cmux.ts race \
  --feature login-lockout --agents 6 --cwd ~/Projects/App \
  --cmd "claude 'Prod: all logins fail with 401 since the last deploy. Root-cause and patch.'"

# 2. hands-free watch; voice marks first done when configured
bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace workspace:9 --interval 2

# 3. race-4 finished first — collect it
bun DEVOS/skills/CMUX/Tools/cmux.ts read --surface surface:44 --lines 100

# 4. mark the winner, retire the rest
bun DEVOS/skills/CMUX/Tools/cmux.ts flash --workspace workspace:9
```

Watching mechanics: Monitor.md. Standing parallel teams on *different* problems: Fleet.md.
