# CMUX adoption design for DevOS

## The bet

cmux earns its place for one reason: **the terminal itself becomes scriptable** — stage text into any pane, read the screen back, open and retire surfaces, all over a socket. A wall of terminals turns into a cockpit the harness can drive. The price is bounded and known: macOS-only, a young codebase, and no push channel, so presence and completion are learned by polling loops the operator owns. The adopted path **replaces the watching layer only** — cmux surface state stands in for whatever terminal-tab painting existed before — while memory, planning, voice plumbing, and model routing stay exactly where they are. Land in phases, keep the old watching path alive until the new one proves itself, and never demolish working observability on a forecast.

## The substrate

cmux is a **Mac GUI terminal** (`com.cmuxterm.app`) spoken to over a Unix socket. The socket exists only while the app runs; invoking `cmux <path>` opens a directory and starts the app when needed. Entry passes via `--password`, `CMUX_SOCKET_PASSWORD`, or a Settings-stored socket password.

The containment tree reads:

```
window ⊃ workspace ⊃ pane ⊃ surface
```

- **window** — an OS window.
- **workspace** — a named tab group. House rule: **one workspace per agent team**.
- **pane** — a split region within a workspace.
- **surface** — a tab within a pane, either a **terminal** or an **in-app browser**.

The operative cycle is **stage / submit / read / retire**:

- `cmux send --surface <ref> "<text>"` stages text.
- `cmux send-key --surface <ref> Enter` submits it (staging alone frequently doesn't execute — confirm via read-back).
- `cmux read-screen --surface <ref>` returns the visible screen.
- `cmux new-surface` / `close-surface` / `new-pane` manage lifetime.

Two constraints color every downstream choice. **macOS-only**: remote machines are reached through SSH panes hosted locally, never by installing cmux remotely. **Poll, not push** (for agents without self-reporting hooks): no subscribe primitive exists, so "agent finished" is inferred by polling `surface-health` plus `read-screen` for idle and completion markers. The monitor is a poll loop by construction.

## Capability map — cockpit behaviors

Every wrapper invocation below means `bun DEVOS/skills/CMUX/Tools/cmux.ts <subcommand>`.

| # | Behavior | cmux mechanism | Wrapper spelling | Maturity |
|---|----------|----------------|------------------|----------|
| 1 | Scripted access (stage/read/retire) | `send` + `send-key` + `read-screen` + `new/close-surface` | `send`, `read` | staged |
| 2 | Tiered team layout (orchestrator→leads→workers) | one workspace, lead pane left, worker column right | `boot-team --tiers orchestrator,lead,worker,worker` | staged |
| 3 | Free-form addressing (any agent prompts any agent) | `send` aimed at any surface ref | `send --surface <role-ref>` | staged |
| 4 | Parallel race (first solver wins) | N surfaces in one workspace on one launch line | `race --feature <f> --agents N` | staged |
| 5 | Fleet grid (2x2, named multi-agent sets) | pane grid, one launch line per cell | `fleet --name <n> --grid 2x2 --cmds "a;b;c;d"` | staged |
| 6 | One-shot team boot | recipe over new-workspace plus splits | `boot-team` / `race` (bun recipes) | staged |
| 7 | Completion awareness → operator | poll `surface-health`, classify, act on transitions | `monitor` → `voice` | staged |
| 8 | Workspace identity (color/banner/ping) | `themes`, `workspace-action`, `trigger-flash` | `flash`; themes via `boot-team` | staged |
| 9 | Browser beside the agent | `new-pane --type browser --url <url>` | `boot-team` browser-pane option | staged |
| 10 | Repeatable sessions | cmux-persisted sessions; recipes as versioned boots | recipes = `boot-team`/`race`/`fleet` | staged |

No `just` runner exists here and none is wanted — `bun cmux.ts boot-team` and `race` are the one-tap boots. Same outcome, harness-native toolchain.

## Capability map — DevOS surfaces under cmux

| DevOS surface | Today | Under cmux | Disposition |
|---------------|-------|------------|-------------|
| Memory and state | `DEVOS/MEMORY/` trees plus execution logs | untouched; cmux reads and writes nothing there directly | **keep** |
| Spoken alerts | `voice` subcommand posting to `DEVOS_PULSE_BASE/notify` when set | `monitor` transitions call the same path; empty base means silent skip | **keep** (env-gated) |
| Planning and specs | `DEVOS/RUNTIME/` doctrine plus repo workflows | terminal-agnostic; nothing changes | **keep** |
| Model routing | harness-level selection | orthogonal to the terminal | **keep** |
| Remote boxes | operator-owned hosts over SSH | `mini-fleet` opens one SSH pane per host | **keep** + bridge |
| Learning capture | harness harvesters into memory | fires regardless of terminal | **keep** |
| Prior tab painting | whatever terminal-tab state existed before | cmux surface rename/flash/theme becomes the paint target | **replace** (staged) |

The structural observation: nearly everything load-bearing lives **above** the terminal. Memory reads files, voice hits an HTTP endpoint when configured, planning writes repo state. None of it cares which terminal hosts the agents. Exactly one seam is terminal-coupled — the visible-state painter — and that seam alone moves.

## The cut line, exactly

**Moving:** the visible-state painter — the code that today colors, icons, or titles terminal tabs to show working / completed / awaiting / error, plus any phase or mode token it renders. Under cmux the same signals map to surface operations: rename for titles and tokens, flash for attention, workspace actions and themes for color-by-state.

**Staying put:**

- Memory and state trees (`DEVOS/MEMORY/`), execution logs included.
- Voice path (`voice` → `DEVOS_PULSE_BASE/notify`, silent when unset).
- Planning, spec, and doctrine logic (only the *paint target* for their state changes).
- Model routing, learning capture, skill routing.

**Why staged.** The current watching path works and carries subtle contracts about who owns which field of the visible state. Replacing it in one move with a poll-only, Mac-only target invites silent observability loss. The safe sequence runs both painters in parallel — old and new writing side by side — until the cmux path demonstrates correct behavior across working, completed, awaiting, error, and every planning transition. Then the old painter retires. Painting twice is cheap; painting wrong once is expensive.

## Landing sequence

**Phase 0 — skill plus wrapper (this increment).**
Delivers the `CMUX/` skill, `Tools/cmux.ts` (ping, send, read, boot-team, race, fleet, mini-fleet, monitor, list/tree, flash, voice), auto-launch, and operator-owned config for fleet hosts plus socket secret.
Exposure: low — purely additive. Undo: delete the skill directory.

**Phase 1 — recipes in daily use.**
`boot-team` and `race` drive real coding teams by hand; `mini-fleet` watches remote hosts. No hook or painter changes.
Exposure: low — cmux runs alongside the existing terminal. Undo: stop invoking the recipes.

**Phase 2 — surface state into operator awareness.**
`monitor` classifies each surface idle/working/done/awaiting, voices transitions when `DEVOS_PULSE_BASE` is set, and exposes surface state for dashboards or logs to consume.
Exposure: medium — classifier noise spams attention when tuned hot. Undo: stop the monitor; consumers simply stop seeing cmux.

**Phase 3 — painter cutover.**
Visible-state signals paint cmux surfaces in parallel with the old terminal; after a proof window across all states and transitions, the old paint path retires behind a flag for one release before removal.
Exposure: medium-high — live, contract-adjacent code moves. Undo: flag flip, not a revert.

**Phase 4 — standing fleet plus browser cockpit.**
`mini-fleet` as the persistent multi-host view; agent-plus-browser panes (`new-pane --type browser`) for flows needing a live page beside the agent.
Exposure: medium — rests on SSH-pane and browser-surface stability. Undo: close the extra panes.

## Hazards and open questions

- **macOS-only.** Local cockpit is a Mac concern. Remotes are SSH panes hosted on the Mac; cmux never runs on the far side. Any future non-Mac workstation needs a tmux fallback, which argues for keeping the old painter recoverable even after retirement.
- **Youth and flakiness.** cmux is young and has visibly stalled orchestrators in demos. Every recipe needs a health check and a manual recovery path. Nothing load-bearing rests on it until Phase 1 banks real uptime.
- **Socket custody.** The socket exists only while the app runs; entry needs inherited context or the password from environment/operator config. The wrapper auto-launches, polls `ping` patiently, and fails loudly on missing credentials — never silently unauthenticated. Secrets stay in environment and operator config, never in skill files.
- **Poll cost.** Without a push channel, `monitor` polls on an interval. Tight intervals burn CPU and chatter; loose ones report late. The interval (default ~3s) is a tuning knob, and transitions need debouncing so single-frame flicker doesn't page the operator.
- **Heuristic completion.** Idle/done/awaiting derives from prompt strings and screen markers, brittle across shells and agent CLIs. Round-trip confirmation (stage → submit → read-back) is the only trustworthy proof; bake it into `send --enter` and transition logic.
- **Stage-without-submit.** Staged text frequently sits unexecuted until Enter. Every recipe that intends execution confirms via `read-screen` rather than assuming.

---

**Standing:** design only. Phase 0 (skill plus `Tools/cmux.ts`) is the buildable unit; everything beyond Phase 1 waits on cmux proving itself in daily use.

## Review addenda — risks not to underprice

**Session-file bridge fragility:**
- The cmux session JSON under `~/Library/Application Support/cmux/` is a private, unversioned interface. Schema drift breaks status mirroring *quietly*. Counter: pin the cmux version in `SKILL.md`, guard the parse, and **fail loudly** on schema mismatch — never degrade silently into the poll fallback.
- Torn reads (file rewritten mid-parse) yield partial JSON. Retry boundedly; never crash the monitor on a parse fault.

**Double-announce during parallel paint:** while old and new painters overlap — plus any agent self-reporting hooks — one event can voice several times. Until a dedup key or precedence rule exists, expect duplicate completion cues during staging. Resolve before Phase 2.

**Cutover blind spots:**
- **Liveness inversion.** A GUI app's socket dies on quit or crash where a plain terminal persists while logged in. Monitor flows need an explicit socket-gone state with relaunch, or post-cutover observability goes quietly deaf.
- **Identity continuity.** Anything in memory keyed to old terminal or session ids needs a mapping to cmux surface ids, or Phase 3 orphans history.
- **Rehearsed retreat.** Preserving the old path is not a rollback plan. Phase 3 needs a tested one-command retreat, not merely an intact fallback.

**Custody posture:** a socket password turns default-deny into password-holder-can-drive-the-fleet. Adopt it as a conscious posture change; the secret never enters skill files (point-in-time cleanliness proves nothing going forward).

**Proof bar:** hands-on driving is offline-verified only until an authenticated `ping` plus one stage/submit/read-back round-trip executes against a live socket. `SKILL.md` carries that status honestly until then.
