# Fleet — standing grids at home, SSH panes abroad

Raises named, reusable agent sets: a local grid (2x2 and beyond) in one workspace, or a remote mini-fleet with one SSH pane per operator-owned host.

## Occasion

Several agents deserve a persistent, named home — `alpha` / `beta` / `gamma` — either colocated in a grid on this machine or spread across remote boxes behind SSH.

## Local grid

1. **Raise a 2x2.** One launch line per cell, semicolon-joined:

   ```bash
   bun DEVOS/skills/CMUX/Tools/cmux.ts fleet \
     --name alpha --grid 2x2 \
     --cmds "claude 'watch src/api';claude 'watch src/web';bun test --watch;btop"
   ```

   Workspace `alpha` appears as a 2x2 surface grid running one line per cell; refs return. Short `--cmds` leave spare cells as empty shells; larger grids (`--grid 3x3`) compose identically.

2. **Make it recognizable.** Color, banner, and ping separate workspaces at a glance:

   ```bash
   # attention pulse
   bun DEVOS/skills/CMUX/Tools/cmux.ts flash --workspace alpha
   # named look via the raw CLI when desired
   cmux workspace-action --action set-theme --workspace alpha --title "ALPHA · API team"
   ```

3. **Seat a browser beside the agent.** Edit left, live result right:

   ```bash
   cmux new-pane --type browser --direction right --workspace alpha --url http://localhost:5173
   ```

## Remote mini-fleet

One workspace watching every remote box — each host an SSH pane:

```bash
bun DEVOS/skills/CMUX/Tools/cmux.ts mini-fleet
```

Hosts resolve from `DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/CMUX/fleet.json`
(shape `{"hosts":[{"name":"box-a","ssh":"user@box-a"}]}`). Skill files never carry hostnames — that config is operator-private. One-off overrides via `--hosts`:

```bash
bun DEVOS/skills/CMUX/Tools/cmux.ts mini-fleet --hosts "user@box-a,user@box-b"
```

Remote panes accept `send` / `read` exactly like local surfaces.

## Recipes as code

A fleet invocation IS the boot recipe — keep the exact `fleet` / `mini-fleet` line as a shell alias or one-line script; rerunning rebuilds the team. cmux additionally persists sessions, so a rebuilt workspace can reattach rather than cold-start. No external task runner is involved: the bun line is the one-tap boot.

## End-to-end — full-stack crew

```bash
# 1. local 2x2: api agent, web agent, test watcher, logs
bun DEVOS/skills/CMUX/Tools/cmux.ts fleet \
  --name beta --grid 2x2 \
  --cmds "claude 'implement /orders API';claude 'build orders UI';bun test --watch;tail -f dev.log"

# 2. brand it and add live preview
bun DEVOS/skills/CMUX/Tools/cmux.ts flash --workspace beta
cmux new-pane --type browser --direction right --workspace beta --url http://localhost:5173

# 3. mirror the feature onto remote boxes
bun DEVOS/skills/CMUX/Tools/cmux.ts mini-fleet

# 4. watch the local grid
bun DEVOS/skills/CMUX/Tools/cmux.ts monitor --workspace beta --interval 3
```

Tiered lead/worker layouts: BootTeam.md. The watching loop: Monitor.md.
