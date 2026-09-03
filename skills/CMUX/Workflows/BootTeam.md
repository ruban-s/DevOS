# BootTeam — raise one tiered team in one workspace

Stands up an orchestrator → lead → worker crew in a fresh cmux workspace, then works it through the stage/submit/read cycle.

## Occasion

A hands-on crew is wanted on one screen: a lead pane left, a worker column right, the whole team addressable by surface ref.

## Pass

1. **Raise the workspace.** One invocation lays out the crew:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts boot-team \
     --name auth-fix --cwd ~/Projects/App \
     --tiers orchestrator,lead,worker,worker
   ```

   A workspace `auth-fix` appears with a lead pane left and one surface per listed `worker` right. Refs and roles return as JSON. The app starts itself when down.

2. **Keep the address book.** The reply JSON is the routing table — one `surface` ref per agent:

   ```json
   {"ok":true,"workspace":"workspace:3",
    "surfaces":[
      {"role":"orchestrator","surface":"surface:10"},
      {"role":"lead","surface":"surface:11"},
      {"role":"worker","surface":"surface:12"},
      {"role":"worker","surface":"surface:13"}]}
   ```

3. **Task the lead.** Stage and submit atomically with `--enter`:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts send --surface surface:11 --enter \
     "You lead this team. Break the JWT refresh bug into two tasks, hand one to each worker."
   ```

   Bare `send` only stages — text sits unsent. `--enter` is what executes.

4. **Fan out to workers.** Same gesture per worker surface:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts send --surface surface:12 --enter \
     "Fix the token expiry check in src/auth/refresh.ts. Report back when green."
   ```

5. **Read back.** Confirm what any agent produced or awaits:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts read --surface surface:12 --lines 40
   ```

   Returns `{ok:true,text:"..."}` — the tail of that surface's screen.

## Lateral addressing

Tiers describe layout and default flow, not plumbing limits. Any surface can stage into any other — a finished worker may report sideways to a peer or upward to the lead directly:

```bash
# from worker-1's own shell, nudging the lead
cmux send --surface surface:11 --enter "Task A merged, tests green. Free for more."
```

Orchestrator → lead → worker is convention; peer and upward sends always work.

## End-to-end — failing suites

```bash
# 1. raise a lead plus three workers over the repo
bun DEVOS/skills/CMUX/Tools/cmux.ts boot-team \
  --name testfix --cwd ~/Projects/App --tiers lead,worker,worker,worker

# 2. charge the lead with triage (refs from the boot reply)
bun DEVOS/skills/CMUX/Tools/cmux.ts send --surface surface:21 --enter \
  "Read the 3 failing suites, assign one per worker (surfaces 22/23/24), track their status."

# 3. spot-check the crew without leaving the current window
bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace workspace:5 --once
```

Sustained watching belongs to `monitor` (see Monitor.md); parallel standing teams belong to Fleet.md.
