# Interceptor Command Reference

> The exhaustive verb roll, lifted from SKILL.md under progressive disclosure. The six families, compound verbs, absolute bans, and isolation gates stay in SKILL.md — this page is the per-verb encyclopedia. Reference binary: `0.16.9`.
>
> **Addressing rule behind every browser sample below:** carry `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`, and send captures through `Tools/Capture.sh`, never bare `interceptor screenshot`. Bare browser verbs fail safe only while 2+ contexts link (the daemon errors loud: `multiple extensions connected, use --context <id>`); down to one surviving context, a bare verb quietly lands on it. `--context` is mandatory, never optional.
>
> Daemon wire: `/tmp/interceptor.sock` (bridge wire: `/tmp/interceptor-bridge.sock`).

## macOS Native (Computer Use)

One compound vocabulary against any native app the bridge sees:

```bash
interceptor macos open "Safari"                     # Return AX tree (background — does NOT raise app)
interceptor macos open "Safari" --activate          # Bring to front (explicit opt-in)
interceptor macos read                              # AX tree of front-most app
interceptor macos read <ref>                        # Subtree
interceptor macos act <ref>                         # AX press — pure AX, no event posting
interceptor macos act <ref> "value"                 # AX value-set on text-bearing roles
interceptor macos type <ref> "text"
interceptor macos type "text" --trusted             # HID-sourced typing to current frontmost
interceptor macos keys "Cmd+Shift+T"
interceptor macos keys "Cmd+S" --trusted            # HID-sourced keys
interceptor macos click <ref>
interceptor macos click <ref> --app "X"             # Per-PID delivery (CGEvent.postToPid)
interceptor macos scroll down 400 --app "Mail"      # Backgrounded scroll
interceptor macos drag --from X,Y --to X,Y --app "X"
interceptor macos screenshot --app "Brave Browser" --save --target-max-long-edge 1568
interceptor macos windows --app "X"                 # List windows of an app (occluded too)
interceptor macos frontmost                         # Current frontmost (proof-of-no-focus-change pattern)
interceptor macos focused --app "X"                 # Currently-focused AX element of an app
interceptor macos apps                              # All running apps + bundle IDs
interceptor macos menu --app "X"                    # Menu-bar AX tree
interceptor macos tree --app "X" --filter interactive --depth 6
interceptor macos find "Send" --app "Slack" --role button
interceptor macos value <ref>                       # Current AX value of a field
interceptor macos trust                             # Probe TCC grants (fields: accessibility, screenRecording, microphone — camelCase, no inputMonitoring)
interceptor macos trust --walkthrough               # Deep-link to System Settings for missing grants
interceptor macos intent dispatch --bundle <id> --script '<applescript>'   # Apple Events
interceptor macos intent warmup <bundle1> <bundle2> ...                    # Pre-prompt TCC for several apps
interceptor macos vision text|faces|hands|bodies [--app <name>]   # On-device Vision; `text` is the OCR path (returns regions)
interceptor macos nlp entities|language|sentiment|tokens "<text>"   # On-device NLP (also: nlp embed "<text>")
interceptor macos nlp similar "<word1>" "<word2>"   # Word-similarity (two-arg form)
interceptor macos log query --predicate "<NSPredicate>" [--since <ts>] [--limit N]   # OSLogStore query — bare `log` errors, the `query` subcommand is required
interceptor macos fs read|write|search <path|query>   # Spotlight-backed file ops (no `--in` flag)
interceptor macos files watch <path>                # Filesystem event stream (also: files recent | files open)
interceptor macos overlay start|stop|list|status|eval|ctl|verbs   # NSPanel overlay (no `show` verb)
```

Audio travels `listen`, `vad`, `audio`, and `sounds` (`interceptor macos listen|vad|sounds status|start|stop`) — no `macos speech` subcommand exists.

A missing grant from `interceptor macos trust` resolves at first exercise: macOS prompts once, accepted under **System Settings → Privacy & Security**.

## VM Lifecycle (Computer Use only)

`interceptor macos vm *` stands in for Lume / Tart / UTM across Linux (Apple Containerization package) and macOS (raw Virtualization.framework) guests. State defaults to `~/Library/Application Support/Interceptor/vms/<name>.bundle/` — Apple's `VM.bundle` shape, readable by outside tools. Override per call with `--state-dir` or globally with `INTERCEPTOR_VM_STATE_DIR`.

```bash
interceptor macos vm create lin1 --kind linux --cpu 2 --memory 1G --disk 4G \
    --image docker.io/library/alpine:3 --network nat
interceptor macos vm start lin1 --wait-for-vsock
interceptor macos vm exec lin1 -- uname -a
interceptor macos vm stop lin1
interceptor macos vm delete lin1 --force

# macOS guest: install gold once, clone many
interceptor macos vm install macos-gold --from-latest --cpu 4 --memory 8G --disk 60G
interceptor macos vm snapshot macos-gold baseline --paused-state
interceptor macos vm clone macos-gold macos-test                # APFS clonefile, instant, inherits TCC
interceptor macos vm start macos-test --wait-for-vsock --headless
interceptor macos vm screenshot macos-test --out /tmp/before.png
interceptor macos vm read-ax macos-test --filter 'AXButton'
interceptor macos vm click macos-test 800 600
interceptor macos vm type macos-test "hello"
interceptor macos vm cp <src> macos-test:<dst>
interceptor macos vm port-forward macos-test 8080:80
interceptor macos vm stop macos-test
interceptor macos vm delete macos-test --force
```

Full lifecycle plus the Lume migration table: `Workflows/VmLifecycle.md`.

## Core Browser Commands

```bash
# State + discovery
interceptor state [--full]              # DOM tree + metadata
interceptor tree [--filter all] [--depth N] [--max-chars N]
interceptor diff                         # Changes since last state/tree read
interceptor find "query" [--role button]
interceptor text [<index|ref>] [--markdown]
interceptor html <index|ref>

# Element interaction
interceptor click <ref>                  # Click by ref (eN)
interceptor click <ref> --at X,Y
interceptor dblclick <ref> --at X,Y
interceptor rightclick <ref> --at X,Y
interceptor type <ref> <text> [--append]
interceptor type "role:name" <text>      # Semantic selector
interceptor select <ref> <value>         # Dropdown
interceptor focus|hover <ref>
interceptor drag <ref> --from X,Y --to X,Y [--steps N] [--duration MS]
interceptor keys "<combo>"               # e.g. "Control+A"

# Navigation + tabs
interceptor navigate <url>
interceptor back | forward
interceptor scroll <up|down|top|bottom>
interceptor wait <ms> | wait-stable [--ms N] [--timeout N]
interceptor tabs
interceptor tab new [url] [--activate]   # Background by default; --activate to foreground
interceptor tab close [id] | tab switch <id>

# Capture — route through Tools/Capture.sh, never raw `interceptor screenshot`
interceptor screenshot --save --format webp --target-max-long-edge 1568 --quality 85    # DOM-render (default — works WITHOUT focus; backgrounded tab is fine)
interceptor screenshot --selector <css>|--element <ref>|--region X,Y,W,H
interceptor screenshot --clip X,Y,W,H    # deprecated alias for --region
interceptor screenshot --pixel [--full]  # legacy captureVisibleTab compositor capture — REQUIRES Chrome focused/visible; --save writes filePath, omits dataUrl
interceptor eval <code> [--main]         # JS in isolated or main world
interceptor capture start | frame | stop # tabCapture stream

# Style injection (test redesigns live)
interceptor style inject --css "<rules>" [--top-only]
interceptor style remove <handle>

# Cookies
interceptor cookies <domain>
interceptor cookies set <json>
interceptor cookies delete <url> <name>
```

## Network — Passive, CDP, and Exports

```bash
# Passive capture (always-on, no CDP fingerprint)
interceptor net log [--filter <pat>] [--limit N] [--since <ts>] [--json]
interceptor net headers [--filter <pat>]       # CSRF, auth headers
interceptor net export --format har             # HAR 1.2 export
interceptor net export --format pcapng          # pcapng for Wireshark
interceptor net export --format json            # JSON dump
interceptor net export --out <path>             # Write to file
interceptor net clear

# Request override (passive, no CDP banner)
interceptor override "*pattern*" status=500 [delay=1000] [body='<json>'] [params=k:v]
interceptor override clear

# CDP-attached interception (explicit opt-in — leaves debugger banner)
interceptor network on [patterns...]
interceptor network off
interceptor network log
interceptor network override on '<json>'
interceptor network override off

# SSE streams (LLM responses, live feeds)
interceptor sse log [--filter <pat>] [--limit N]
interceptor sse streams
interceptor sse tail [--filter <pat>]

# Header rewriting
interceptor headers add <name> <value>
interceptor headers remove <name>
interceptor headers clear
```

## Recording (Session Monitor)

Real user moves on the live tab become a deterministic plan script. Concurrent recordings across tabs hold up.

```bash
interceptor monitor start ["instruction"]   # Start recording (returns sid)
interceptor monitor pause <sid> | resume <sid>
interceptor monitor stop <sid>               # End + emit summary
interceptor monitor status [--all]
interceptor monitor list                     # All sessions, active + ended
interceptor monitor tail <sid> [--raw]       # Live pretty stream
interceptor monitor export <sid>             # Aligned text
interceptor monitor export <sid> --plan      # Replay script (highest-value artifact)
interceptor monitor export <sid> --json
interceptor monitor export <sid> --format har|pcapng           # Network-tab export
interceptor monitor export <sid> --with-bodies                 # Include request/response bodies
```

macOS-side recording: `interceptor macos monitor *` — AX events, optional `--frames N`, `--vision-text`, `--include clipboard|files|network|log|notifications|speech`, `--watch-path <p>`, `--log-predicate "<NSPredicate>"`. See `Workflows/RecordAndReplayMacFlow.md`.

## Canvas (Rich Web Apps)

For `<canvas>`-painted apps (Figma, Excalidraw, bespoke editors):

```bash
interceptor canvas list | status
interceptor canvas log [N] [--kind fillText]
interceptor canvas objects [N] [--kind text]
interceptor canvas model | routes
interceptor canvas ocr N [--region X,Y,W,H]
interceptor canvas read N [--format png] [--region X,Y,W,H] [--webgl]
interceptor canvas diff <url1> <url2> [--threshold 10] [--image]
```

## Scene Graph (Rich Editors — Google Docs/Slides, Canva)

```bash
interceptor scene profile [--verbose]
interceptor scene list [--type shape|text|image|page|embed|slide]
interceptor scene click <id> | dblclick <id> | select <id>
interceptor scene hit <x> <y>                # ID object at coordinates
interceptor scene selected | text [--with-html]
interceptor scene insert "<text>"
interceptor scene cursor-to <x> <y>
interceptor scene slide list | current | goto <index> | notes [--slide N]
interceptor scene render <id> [--save]
interceptor scene zoom
interceptor scene ... --profile <name>       # Force profile, bypass detection
```

## LinkedIn

```bash
interceptor linkedin event [url]             # Event + post data via DOM + network
interceptor linkedin attendees [url]         # Attendees with override + enrichment
```

## ChatGPT Agentic Bridge

Chatgpt.com from CLI, no API key involved:

```bash
interceptor chatgpt send "<prompt>" [--stream]
interceptor chatgpt read | status
interceptor chatgpt conversations | switch <id>
interceptor chatgpt model [name]
interceptor chatgpt stop
```

## Batch + Meta

```bash
interceptor batch '<json_array>' [--stop-on-error] [--timeout MS]
interceptor status [--verbose]        # Daemon + bridge state, mode, browser config, extension probe
interceptor contexts                   # List connected browser contexts
interceptor --version                  # Build SHA + date
interceptor --help                     # Top-level help
interceptor <cmd> --help               # Per-command help
interceptor init                       # Write starter config to ~/.config/interceptor/
interceptor upgrade --full             # Promote browser-only to full
```
