---
name: CMUX
version: 1.0.5
description: "Drives cmux as a live cockpit for agent teams — raising named workspaces, racing parallel agents on one problem, and keeping every surface watchable. Mac-only. USE WHEN cmux, agent cockpit, boot an agent team, orchestrate agents, three-tier orchestration, agent race, needle-in-haystack hotfix, agent fleet, 2x2 fleet, watch/monitor my agents, tell me when they're done, scale compute to scale impact, send a prompt to a running agent, multiplexer, terminal cockpit, orchestrator lead worker. NOT FOR single headless subagents with no terminal to observe (use Agent/Workflow), deploy verification in a browser (use Interceptor), or Linux/Windows (cmux is Mac-only — use tmux)."
---

# CMUX — every agent on a surface you can watch

cmux hosts agents in named, color-tagged workspaces that stay visible: prompt them, read them back, steer them mid-flight. An agent you cannot watch is an agent you cannot tune, so nothing here runs out of sight.

Every command passes through one wrapper: `bun DEVOS/skills/CMUX/Tools/cmux.ts <subcommand>`. It brings the cmux app up on demand — but the app's socket turns outsiders away by default, so authentication is the first wall (handling notes below).

> **Readiness:** the wrapper type-checks clean and `voice` fires when configured. Hands-on driving (boot-team, race, fleet, monitor) still needs one live socket-auth handshake before it counts as proven: run the wrapper from inside a cmux surface (auth inherited) or export a socket password via `CMUX_SOCKET_PASSWORD`. **Custody warning:** whoever holds that password can drive the entire fleet from any local process — set it deliberately and keep it out of committed files.

## Routing

| Ask shape | Flow |
|-----------|------|
| "boot a team", "3-tier team", "orchestrator/lead/workers" | `Workflows/BootTeam.md` |
| "race agents", "hotfix race", "throw N agents at this", "needle in a haystack" | `Workflows/AgentRace.md` |
| "fleet", "2x2 fleet", "named teams", "mini-fleet" | `Workflows/Fleet.md` |
| "watch/monitor my agents", "tell me when they're done", "observe to improve" | `Workflows/Monitor.md` |

## Command compact

```bash
CT=DEVOS/skills/CMUX/Tools/cmux.ts
bun $CT ping                                             # bring cmux up if it isn't
bun $CT boot-team --name debug --tiers orchestrator,lead,worker,worker
bun $CT race --feature login-500 --agents 4             # first credible solver keeps the win
bun $CT fleet --name alpha --grid 2x2 --cmds "claude;codex;claude;bun test --watch"
bun $CT mini-fleet                                       # SSH panes from operator fleet.json
bun $CT send --surface workspace:1/surface:2 "run the tests" --enter
bun $CT read --surface workspace:1/surface:2 --lines 40
bun $CT monitor --workspace workspace:1                  # poll; voice on completion if configured
bun $CT flash --workspace workspace:1                    # visual ping
```

**The primitive underneath every recipe:** `send` stages text in the surface → `send-key Enter` (or `--enter` for both at once) submits it → `read` reports what happened → `close-surface` retires the surface. Recipes are that cycle, composed.

**What cmux does not displace:** project memory under `DEVOS/MEMORY/`, planning and spec flows in `DEVOS/RUNTIME/` and `DEVOS/Workflows/`, model routing, skill routing — all of it lives above the terminal and stays. cmux replaces the watching layer only. `DESIGN.md` holds the full map plus the staged adoption plan.

## Handling notes

- **`send` stages; it does not submit.** Text arrives in the surface unexecuted. Add `--enter` (or a trailing `send-key Enter`) whenever execution is the point, then `read` back to prove it ran. A bare `send` followed by "the agent is on it" is an unverified claim.
- **Socket default-deny is the first wall.** A running app still rebuffs outside processes with an access-denied style refusal. Two legitimate crossings: (a) **work from inside a cmux surface** — the orchestrator inherits access through the tagged `CMUX_SOCKET_PATH` environment, no password involved; (b) **set a socket password** in cmux Settings and export it as `CMUX_SOCKET_PASSWORD` (the wrapper forwards it). The socket exists only while the app runs (`cmux.sock` is absent while closed). Prefer (a) for agent-driven work, (b) for external scripting.
- **Prefer push where available; poll otherwise.** Claude-driven agents launched via `cmux claude-teams` self-report lifecycle transitions through injected hooks (`SessionStart/Stop/Notification/UserPromptSubmit/… → cmux claude-hook <event>`); tmux-style `set-hook`, blocking `wait-for -S`, `pipe-pane --command`, and OSC escapes also exist. The `monitor` poll (`surface-health` plus `read-screen`) is the fallback for agents that cannot self-report, not the default.
- **Sidebar state doubles as a no-auth read path.** `report_meta` / `report_meta_block` / `set-status` / `set-progress` / `log` publish agent posture into the workspace sidebar and persist under `~/Library/Application Support/cmux/session-*.json` — readable without socket access for status mirroring.
- **Mac-only.** cmux ships as a macOS app. Remote boxes are driven through local SSH panes, never by installing cmux remotely. Linux/WSL stays on tmux.
- **Positional refs drift.** `workspace:1/surface:2` numbering moves as surfaces open and close. For durable handles, resolve UUIDs (`--id-format uuids`) from `tree` and keep those.
- **Private specifics stay in operator config.** Fleet hosts live in `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/CMUX/fleet.json` (`{"hosts":[{"name","ssh"}]}`), never in skill prose. The socket secret lives in `CMUX_SOCKET_PASSWORD`. Voice delivery sits behind `DEVOS_PULSE_BASE` (empty means voice steps skip silently).

## Illustrations

**Raise a debugging team and steer its lead:**

```
User: "boot a cmux team to chase the flaky test"
→ bun $CT boot-team --name flaky --tiers orchestrator,lead,worker,worker
→ bun $CT send --surface <lead-ref> "find why auth.test.ts flakes; delegate repro to a worker" --enter
→ bun $CT monitor --workspace <ws>   # spoken cue when the lead answers, if voice is configured
```

**Race a production failure:**

```
User: "prod login is 500ing — race it"
→ bun $CT race --feature login-500 --agents 4
→ (four agents work the same checkout; first credible root cause takes it)
→ bun $CT read --surface <winner> ; retire the rest
```

**Adoption map and feature inventory:** `DESIGN.md`.
