---
name: Interceptor
description: "Drives the real Chrome/Brave plus macOS Computer Use from inside the browser — no CDP fingerprint, genuine sessions; the sanctioned path for visual deploy checks. Do the clickwork instead of narrating it. USE WHEN verify deploy, confirm UI, screenshot verification, computer use, macos automation, debug web, troubleshoot, visual check, motion/animation bug, jank, transition stutter, scrub a flow, console logs/errors, runtime/JS/react errors, mismatch warning, network traffic/log, HAR/pcapng export, hydration/blank-page debug, flash then blank/page broken, why is this not working/what's happening on the page, authenticated page, bot detection bypass, reproduce bug, drive native app, about to ask the operator to click/navigate/fill a form/log in/approve OAuth, OAuth consent flow, complete a web login, do this in your browser. NOT FOR residential-proxy crawling (BrightData) or social actor scraping (Apify)."
version: 4.3.19
---

## Customization

**Before running anything, look for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/`

When that folder exists, read any PREFERENCES.md or config files inside and let them take precedence over the defaults below. When it is absent, continue with the built-in behavior.

# Interceptor — genuine-browser driving + macOS Computer Use

> **Standing order, outranking everything else:** the moment you're about to ask the operator to touch a browser — open a link, click, fill a field, sign in, paste a value, clear an OAuth screen — treat that impulse as the signal to drive it yourself with Interceptor. The only carve-out is a step that demands a secret you genuinely lack (an unknown password, a hardware 2FA tap); even then, carry the flow all the way to that gate and hand over only the single human-only move. Narrating clickwork for a human to perform is the exact failure this skill exists to eliminate.

## What it is

Interceptor pilots the actual Chrome/Brave build from inside, plus native macOS apps where the bridge is installed. Six verb families cover the ground: visual capture, DOM reads, JS evaluation, network capture, input, and record/replay. Sessions stay signed in, major bot checks pass, and every visual deploy claim in DevOS routes through here. It is the ONLY sanctioned browser-automation path — raw CDP scripts and headless drivers (Playwright included) are not substitutes.

**Why headless tooling falls short.** Detached automation speaks CDP, which sites fingerprint and refuse — the robot sees a different page than a signed-in person, or none at all. It also launches a bare profile with zero logins, so anything behind auth is unreachable. And when a page dies — empty mount, hydration mismatch, cards flashing away — pixels alone never say why. Interceptor answers all three: it drives through the live browser UI (no CDP fingerprint), borrows your real signed-in sessions, and reads the living DOM, console stream, and network log to explain what a screenshot cannot.

**Composition.** An extension steering through the live browser UI, with an optional macOS bridge carrying the same control language to native apps, OS-grade input, and on-device VMs.

- **Binary:** `interceptor` CLI — extension-driven command of the real browser, plus a macOS bridge for native apps, OS-level input, and full VM lifecycle.
- **Upstream:** https://github.com/Hacker-Valley-Media/Interceptor
- **Setup:** take the signed `Interceptor-Browser-<v>.pkg` / `Interceptor-Full-<v>.pkg` from upstream releases, or `interceptor upgrade --full` over an existing install. Source builds stay optional — see `Workflows/Update.md`.
- **Extension wiring:** the signed installer registers it. On a source build, `Tools/Pin.sh` copies the built `extension/dist` into `DEVOS/skills/Interceptor/Extension/` — that folder is **born from `Pin.sh`, never shipped** — and Chrome takes it via "Load unpacked". Lineage lands in `Extension/PINNED_FROM.txt` (source path, manifest version, content SHA256, timestamp). Chrome drops unpacked extensions at each manifest bump, so every source rebuild ends with **re-pin plus reload**. Nothing auto-tracks upstream.
- **Floor version:** any `interceptor >= 0.23.16` pairs with this skill. (Maintainer-machine footnote — not public-install behavior: the maintainer binary grows from a local branch `local-0.23.16`, upstream tag `v0.23.16` with a cherry-picked `screenshot --save` fix honoring `--out` and defaulting to `~/Downloads`; re-apply at each upgrade until upstream absorbs it, and prefer source builds over `interceptor update` since the self-updater sheds the patch. Stock installs write `screenshot --save` to cwd — always pass `--out`.)
- Upstream spans **three surfaces**: **Browser** + **macOS** + **iOS** (steer an owned Developer-Mode iPhone via an on-device XCUITest runner over WiFi — `interceptor ios *`).
- **Tab Lifecycle Policy (0.23.3+):** named-group reuse ships default-on and quiet managed groups self-close after 10 min — details under Standing Rules.

### Six verb families

Rows are independent capability groups. Each speaks a distinct WebSocket message type across the daemon→extension link, so one wedged family seldom takes the others down. **A dead page offers six separate diagnostic doors — a stuck `screenshot` never excuses skipping `eval`, `net log`, or `monitor`.**

| Family | Headline verbs | Yield |
|-----------|-----------------|--------------|
| **VISUAL** | `screenshot` (DOM-render default — background-safe), `screenshot --region`, `screenshot --pixel --full` (window must show) | PNG/WebP at any scale, selector, region, or stitched full page. Always via `Tools/Capture.sh`, never bare `interceptor screenshot`. Fine detail via `Tools/Zoom.ts`. |
| **DOM READ** | `read [--markdown]`, `tree`, `text`, `html <ref>`, `find` | Accessibility tree, shaped markdown, raw markup, refs |
| **JS EVAL** | `eval <code>`, `eval --main` | JavaScript in an isolated or the main world — **the channel for console errors, runtime exceptions, hydration warnings, live DOM state** |
| **NETWORK** | `net log`, `net headers`, `net export --format har\|pcapng\|json`, `override`, `headers add/remove` | Silent request capture with zero CDP fingerprint; HAR 1.2 plus pcapng for Wireshark |
| **INPUT** | `click`, `type`, `keys`, `act <ref> [--trusted]`, `drag`, `scroll`, `select`, `focus` | Browser plus native macOS input; `--trusted` for OS-grade HID source state. `click --selector <css>` clicks by CSS selector (0.23.6+), hands back the clickable `e<ref>`, and climbs to an OS-level click when the synthetic one bounces |
| **RECORD/REPLAY** | `monitor start/stop`, `monitor export --plan`, `monitor export --format har` | Faithful user-flow capture as deterministic replay scripts; multi-session, browser + macOS AX events |

**Console-error reading** is a recipe over `eval`, not its own verb: plant a `console.error` / `window.error` hook with `eval --main`, park events on `window.__errs`, then `eval` again to collect them. Serves hydration mismatches, React boundaries, load-time JS throws, every quiet runtime death. **A reload between planting and collecting wipes the harvest** — capture starts at load, so reload-to-reproduce helps nothing; instead capture forward from the next interaction, or question `getEventListeners(window)` / DOM-mutation watchers for traces.

**In the field.** Astro hydration deaths, blank post-mount React pages, "cards flash then vanish" — all yield to `eval` over live DOM plus console captures, not to pixels. A wedged `screenshot` leaves diagnosis wide open through every sibling family.

### Fresh surfaces & verbs (0.17 → 0.22.37)

Shipped across the 0.22.2 → 0.22.37 window (2026-07 releases):

- **Capture auto-fallback (0.22.37)** — a failed DOM-render attempt retries as `--pixel` on its own (result notes the detour; `--no-fallback` declines). Covers render *breakdowns* (injection-blocked pages, mid-navigation), NOT quiet mis-composites — the animated-page `--pixel`/DOM-geometry cross-check in OPERATIONAL_RULES still binds.
- **Half-open socket watch (0.22.37)** — daemon keepalive-ack exposes extension links that died while looking open, formerly silent hangs.
- **Pinned tab addressing (0.22.9–10)** — `tab close <id>` / `tab switch <id>` hit the passed id (strictly numeric), never the working tab.
- **Upload rebuild (0.22.21)** — unbounded sizes, dropzones, native pickers.
- **Safari surface (0.22.32)** and **MCP server (0.22.35, `interceptor mcp install`)** — both intentionally idle here: this skill drives the Chrome test profile over CLI.
- **a11y widening (0.22.37)** — zero-area inline wrappers survive tree pruning.

The six browser families above remain the core. The 0.16.9 → present leap also brought:

- **iOS** (`interceptor ios *`) — steer an owned, unlocked Developer-Mode iPhone over WiFi through an on-device XCUITest runner (not WebDriverAgent). Verbs: `tree`, `find`, `click`, `type`, `scroll`, `screenshot`, `app launch|activate|terminate`. Provisioning is Xcode self-serve or a no-Xcode `login` re-signing the runner with your Apple ID.
- **`interceptor diagnose`** — one post-failure frame: daemon (true exec path), each linked context probed in parallel, monitor state. **Exposes daemon split-brain** — Chrome birthing one daemon binary while the CLI speaks to another, once a silent 15s timeout. Lead with it whenever anything feels wedged.
- **`interceptor manifest`** — machine-readable specs for 50+ verbs (flags, returns). Learn the contract without scraping help.
- **Per-agent tab groups** (`--group <label>` / `INTERCEPTOR_GROUP`) — fence each agent in its own colored, hard-separated tab group so agents share one browser without cross-talk. `interceptor group list|close <label>`. Second fence beside `--context`.
- **`interceptor save`** — lift raw bytes (Blob / ArrayBuffer / `blob:`) off a live page to disk past the downloads folder; answers with a sha256.
- **`interceptor ocr`** / **`canvas ocr`** — offline Tesseract pixel OCR inside the extension (no bridge, no macOS needed).
- **`interceptor macos cdp *`** — steer web views inside Electron / Chromium desktop apps (Slack, VS Code, Notion, Descript) like browser tabs.

**CLI shape (0.22.1):** flag order no longer matters (`open --text-only <url>` parses), and browser-only installs conceal macOS/iOS verbs (`--all-surfaces` / `INTERCEPTOR_ALL_SURFACES` reveals). Bare `interceptor` / `--help` print a compact capability card; `help <cmd>` or `interceptor manifest` carry the full contract.

### Interceptor vs Apify vs BrightData — scale × auth decides

Three tools touch "page data" with little true overlap. Choose by **page count** and **login weight**, not habit.

- **Interceptor** — one genuine signed-in browser under your hand. Right when the login matters, the target hunts bots, or the task is hands-on: a deploy to confirm, an OAuth/login/form run, a debug pass, extraction across a *few* gated pages. Signature: you could open each page yourself and it would look like you.
- **Apify** — cloud actors for **bulk** pulls off a named platform (Instagram, LinkedIn, TikTok, YouTube, Facebook, Google Maps, Amazon). Right for hundreds-to-thousands of items, parallel, shaped, proxy-rotated. Signature: hand-opening is unthinkable, and a per-platform actor exists.
- **BrightData** — 4-stage progressive scrape of an *arbitrary* site (no named actor), climbing to residential proxy for stiff bot walls/CAPTCHA at crawl scale.

Pocket rule: **one page you'd log into → Interceptor; N items on a named platform → Apify; a whole arbitrary site behind stiff bot walls → BrightData.** Interceptor is a single Mac browser — no managed parallelism, no proxy pools, no per-platform extractors; herding thousands of profiles through it runs serial, slow, and endangers real accounts. Never Apify where you must *be* the logged-in user on a page or two, never Interceptor for Apify's scale.

### Absolute bans — live on every call

**Pixels ship through Interceptor alone. These are FORBIDDEN without exception:**

- **`screencapture`** — the stock macOS capture binary. Not primary, not fallback when Interceptor sticks, not "a single shot." Forbidden.
- **`osascript` steering Chrome** — no `tell application "Google Chrome" to activate`, no `set frontmost of process`, no `set bounds of window`, no `set active tab index`, no `set index of window`, no other window fiddling. Forbidden.
- **`osascript` System Events typing** — no `key code`, no `keystroke`, no `key down`. Input lands wherever focus sits — the operator's desk. Forbidden.
- **Any focus grab for automation's sake** — foregrounding Chrome (or anything) so a capture lands is forbidden. Bridge CGS / DOM-render paths capture focus-free.
- **Any window reshaping** — shifting, sizing, moving, restacking Chrome windows is forbidden. Window layout belongs to the operator; agents leave it.
- **Scripted tab flipping** — `set active tab index of window N` is doubly out: it steals focus AND swaps what the operator reads.

**Breakdowns change nothing.** A stuck Interceptor never licenses raw OS paths. Recovery is repairing Interceptor (WebSocket-wedge ladder in Field Notes) or halting with word that evidence can't be captured this run — never the fallback.

**Bridge-routed Computer Use stands apart.** `interceptor macos open <app>`, `interceptor macos act <ref>`, `interceptor act <ref> --trusted` (once `--os`) and sibling bridge-routed moves travel the sanctioned bridge and are welcome where a workflow explicitly orders native control. Banned are (a) raw OS routes around Interceptor entirely AND (b) focus grabs purely to feed a screenshot.

### Preflight isolation gate (MANDATORY)

**Opens every browser workflow. Zero skips.**

Ahead of any `interceptor open|read|act|inspect|screenshot|navigate|tab|monitor|net|cookies|scroll|click|type` reaching Chrome, the gate runs. Favor the **self-healing front door** — it gates and, when the test window is merely shut, opens it and re-checks before returning:

```bash
bash DEVOS/skills/Interceptor/Tools/EnsureTestProfile.sh   # gates; auto-opens the test profile on exit 5/6; prints READY on success
```

`EnsureTestProfile.sh` wraps `PreflightIsolation.sh` (the bare gate — call it straight when auto-open is unwanted). Both die non-zero on any unhealable state; non-zero means STOP and report — never Default. The gate pins these facts:

1. **Binary at >= 0.16.0** — older builds blank `--context` and drift onto whichever Chrome link the daemon finds. That drift plants tabs in the operator's Default window.
2. **Pinned test context linked** — whole-field match on the UUID column (no substring grep, so headers and partial hits can't fake a pass). Absent it, Default is the only target left.
3. **Target outside Default.** The upcoming command's context resolves first and is screened against Default plus the `INTERCEPTOR_WORKING_PROFILE_IDS` deny-list before any tab is touched. A Default/working hit halts hard (exit 7).
4. **Extension freshness (lenient).** `Extension/PINNED_FROM.txt` (manifest version + content SHA256) is set against upstream `$INTERCEPTOR_SRC/extension/dist` **when present**. Skew → fail with re-pin orders. Upstream missing (true today) → WARN and proceed. This never keys on `status --verbose` (no extension-build field there).

A failing gate exits non-zero with a structured fix note on stderr. **Workflows halt on non-zero.** Relay the note. **Never slide to the Default profile.** Never "try anyway." Never `screencapture` or `osascript` around it.

Discriminator exits (for handlers):
- `2` — interceptor missing from PATH
- `3` — version string unreadable
- `4` — version under floor (heal via `Workflows/Update.md`)
- `5` — zero browser contexts linked (Chrome shut or extension dead)
- `6` — pinned test context absent (one-time profile setup due)
- `7` — resolved target is Default or a working profile (hard halt)

The gate is doctrine. It fronts everything — casual public-page reads, signed-in tooling checks, captures, all of it. No "safe skip" exists, because each quiet slide to Default violates the operator's window.

### Isolation doctrine (CRITICAL — hard rule, code-backed)

**Every browser verb hits the pinned, isolated Interceptor test context — that one, always; never the operator's Default, never their working/monitoring profiles.** Constitutional, not preferential.

- **Target reads `INTERCEPTOR_TEST_CONTEXT_ID`** from `preferences.env`. Often pinned today as a raw context UUID. Lasting repair: swap the raw UUID for the friendly `interceptor-test` name assigned in the extension popup — friendly names outlive reloads; raw UUIDs decay per extension reload (UUID-rot, below).
- **The fence is the Chrome PROFILE, not the user-data-dir.** The test profile shares the operator's Chrome install and root certs yet keeps its own cookies, tabs, and window. It IS logged into the operator's accounts (Google, GitHub, Cloudflare, blog admin, other dashboards) — the entire point. A `--user-data-dir` sandbox carries zero auth and reaches none of the operator's signed-in tooling.
- **Default stays read-only unless invited.** No tab opens, clicks, types, navigations, or recordings there without explicit operator words ("verify in my Default profile", "use the main window"). When invited, travel `--context <default-id>` after `interceptor contexts` proves the link.
- **"Another app" is no shield — the operator may browse in Chrome too.** With the operator elsewhere, a misfire self-corrects. With both parties in Chrome, ONLY the profile pin separates their tabs from automation — so treat each unknown Chrome context as theirs, and hand them URLs via `open -a "Google Chrome" "<url>"` (their normal profile) instead of steering a context you own.
- **One-time build-out sits in `Workflows/LaunchTestProfile.md`** — operator opens Chrome's avatar menu → Add profile → signs in → loads the Interceptor extension → names the context in the popup.

**RETIRED, never revive.** The former "sink to first-available / Default when the pin is missing" rule is DELETED. A missing or stale pin is a **halt with fix orders**, never a fallback. No path auto-routes to Default.

**Why naked verbs endanger.** With 2+ contexts linked the daemon fails loud — `multiple extensions connected, use --context <id>` — today's only guard for bare verbs. The instant the operator shuts their spare browser window (one context left), a bare verb quietly lands on whatever remains. Hence `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (or `Tools/Capture.sh`) rides every browser verb, mandatorily.

**UUID rot ��� lasting repair.** Context IDs are profile-steady `chrome.storage.local` UUIDs, changing ONLY across extension reinstall/reload (Chrome restarts spare them). Assign the friendly `interceptor-test` name in the extension popup once and pin the name. Meanwhile `Tools/Capture.sh` runs a **guarded** auto-rebind — solely when exactly one non-Default test context links AND Default is provably out. A stale pin NEVER sinks to Default.

**Why doctrine-grade.** Default holds the operator's live tabs plus tabs other agents drive. One extra flag per command costs nothing. One stray test tab in their window — a click, a surprise redirect — costs permanently.

**Sanctioned self-heal for context-not-linked runs through `EnsureTestProfile.sh`, never a naked launch.** When the test window is simply shut (`PreflightIsolation.sh` exits 5 = no contexts, or 6 = pin unlinked), `Tools/EnsureTestProfile.sh` opens the CONFIGURED test profile and re-gates in a poll loop until the pin links. Safety comes from one fact: **it returns solely after `PreflightIsolation.sh` itself exits 0** — whole-field pin match plus Default/working denial. Opening the wrong `--profile-directory` therefore can never be driven; preflight keeps failing and `EnsureTestProfile` keeps halting. Protection lives in the post-open re-check loop, NOT in trusting the profile argument. **Exit 7 (target IS Default/working) and exit 8 (test context unconfigured) NEVER open anything** — they surface and halt. And lone `LaunchTestProfile.sh` without re-check stays unsafe solo: always enter via `EnsureTestProfile.sh`. When the open succeeds yet the pin never links (UUID rot past an extension reload), `EnsureTestProfile` surfaces the lasting repair (name the context `interceptor-test` in the popup) and halts — never guessing.

### Rendering-lifecycle gate — the hidden-tab trap (MANDATORY for motion/responsive claims)

**Chrome freezes a tab's whole render lifecycle while its window stays unseen** — minimized, fully covered, or parked on a dead Space. Then:

| Keeps running (numbers look sane) | Quietly dead |
|---|---|
| `setTimeout` / `setInterval` (dragged to ~1/s) | `requestAnimationFrame` |
| `getBoundingClientRect()` — layout on demand | `ResizeObserver` |
| CSS media queries / static layout | `IntersectionObserver` |
| DOM reads, `screenshot` (DOM-render route) | CSS transitions + animations, lazy-load, scroll-reveal |

The peril: zero errors. A responsive or animated page returns crisp, well-shaped zeros, inviting "the feature never fires" or "clean, no change." Measured live 2026-07-30: across 5s with two genuine resizes, the pinned test context showed `visibilityState: hidden`, **0 rAF ticks, 0 ResizeObserver fires**, while `setInterval` ticked 5 times.

**The standing order: animation, transition, ResizeObserver/IntersectionObserver, lazy-load, scroll-reveal, or viewport-responsive claims come ONLY from `Tools/VerifyViewport.ts`, never the shared test context.** Hand-driving a component's recompute to "prove" it is grading your own homework, not the browser.

```bash
bun DEVOS/skills/Interceptor/Tools/VerifyViewport.ts check
bun DEVOS/skills/Interceptor/Tools/VerifyViewport.ts probe <url> --widths 1440,1100,880 --expr @probe.js
bun DEVOS/skills/Interceptor/Tools/VerifyViewport.ts shot  <url> --width 880 --out ~/Downloads/x.png
bun DEVOS/skills/Interceptor/Tools/VerifyViewport.ts stop
```

**Why only this route works.** The anti-throttle switches (`--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-background-timer-throttling`) bite solely at **browser-process birth**, and one process serves one `--user-data-dir`. They can never reach a running Chrome, and `--profile-directory` shares that process — profile juggling fixes nothing in the operator's browser. VerifyViewport boots a **separate headless Chrome in its own `--user-data-dir`** with those switches. Headless opens no window, so the operator's desktop stays untouched and no window state enters the claim — same renderer, full lifecycle alive. `INTERCEPTOR_VERIFY_HEADFUL=1` raises a real (tucked-aside) window for eyeball runs.

It travels **CDP** (`interceptor macos cdp`) over the extension, because `--load-extension` is inert in current Chrome (silently skipped — verified on 152, flag workarounds included) and a bespoke `--user-data-dir` owns an empty `NativeMessagingHosts`. Viewport sizing uses `Emulation.setDeviceMetricsOverride`, a true layout-viewport shift firing the page's own observers **without moving, sizing, or foregrounding any window** — the point being verification must not hinge on parked windows.

`check` and every `probe`/`shot` **assert** a live lifecycle (`visibilityState === visible` AND rAF genuinely ticking), exiting non-zero otherwise. No limp mode exists; a lifecycle failure halts, never whispers.

**Purely additive — nothing working moved.** Operator Chrome, pinned test profile, isolation gate, zero-CDP-fingerprint stealth route all stand. Signed-in pages, genuine sessions, bot-sensitive jobs stay on the extension-driven test context — the verification instance carries no logins and no stealth promise. Spend it on public pages whose *conduct over time* is under test.

### Install shapes (0.16.x)

One binary, two shapes. Confirm via `interceptor status`, reading `mode:`:

| Shape | Installed | Unlocks |
|------|------------------|--------------|
| **`mode: full`** (this skill's default) | CLI + daemon + extension + Swift bridge `.app` + LaunchAgent | Browser driving **plus** Computer Use: AX tree, OS-grade trusted input, ScreenCaptureKit, Vision OCR, Speech, NLP, Apple Events, OSLogStore, file watching, container runtime, **VM lifecycle** |
| **`mode: browser-only`** | CLI + daemon + extension | Browser driving alone. `interceptor macos *` answers structured `setup_required` in under 1s. No TCC prompts. |

Climb browser-only → full with `interceptor upgrade --full`. Step down with `bash scripts/uninstall.sh --bridge-only`.

**Delivery channels** (pkg installers from v0.11+):
- `Interceptor-Browser-<v>.pkg` → `mode: browser-only`
- `Interceptor-Full-<v>.pkg` → `mode: full`
- `bash scripts/install.sh --browser-only|--full` → dev route
- Linux browser-only supported (Edge + Vivaldi recognized since v0.13.4)

Standing answer: asked for native on `mode: browser-only`, reply *"I'm on a browser-only install. Run `interceptor upgrade --full` to enable that."* Never run the macos verb "to see" — preflight short-circuits, but burns turns.

### What must exist first

- Chrome or Brave (Edge/Vivaldi on supported platforms) alive with the Interceptor extension loaded — signed `.pkg` registers it; source builds load once via `chrome://extensions/` → Developer Mode → "Load unpacked" → the `Extension/` folder `Tools/Pin.sh` births
- `interceptor` CLI on PATH (`/opt/homebrew/bin/interceptor`)
- `interceptor-daemon` on PATH (`/opt/homebrew/bin/interceptor-daemon`)
- Native-messaging manifest registered (signed `.pkg` handles it; from source, `bash "$INTERCEPTOR_SRC"/scripts/install.sh --chrome --skip-extension`)
- **macOS bridge** as a LaunchAgent (full shape only) — see `Workflows/Update.md`
- **Sparkle.framework** at `/usr/local/Frameworks/Sparkle.framework` (full shape, v0.10.0+) — bridge auto-update leans on it

Fast health pass:

```bash
interceptor --version          # → "interceptor 0.23.16 (<hash>, <date>)" — 0.23.16+ is what matters
interceptor status             # → daemon: running, bridge: running, mode: full|browser-only
interceptor status --verbose   # → adds extension reachability (NO extension-build field; with 2+ contexts it nags "multiple extensions connected" even with --context)
interceptor contexts           # → linked browser contexts (multi-profile)
interceptor init               # → one-time write of ~/.config/interceptor/config.toml
```

### Background-first promise (0.16.x)

The product never steals focus for routine work.

| Surface | Verbs allowed to foreground | All others |
|---|---|---|
| **Browser** | `open --activate`, `tab new --activate`, `tab switch <id>`, `window focus <id>` | Hold whatever the operator views — `click`, `type`, `read`, `inspect`, `screenshot`, `net`, `cookies`, `scroll`, `act`. Fresh tabs open behind by default. |
| **macOS** | `app activate <app>`, `open <app> --activate` | Hold whatever fronts — `open` (bare), every input verb, AX reads, capture, menu, intent dispatch, vision, overlays. |

A non-listed verb shifting frontmost is a bug.

**Reuse shape:** `open --reuse` steers the existing managed tab instead of littering dead ones. It keeps the reused tab's focus state — add `--activate` only when the operator explicitly wants it forward.

### Multi-context addressing (0.16.x)

Several linked profiles (personal Chrome + isolated test + work Brave) force explicit addressing:

```bash
interceptor contexts                                          # List linked context IDs
interceptor open <url> --context "$INTERCEPTOR_TEST_CONTEXT_ID"  # Steer the isolated test profile (DEFAULT)
interceptor open <url> --context <main-id>                    # Steer personal Chrome (only when explicitly invited)
```

Sans `--context`, verbs self-route solely at exactly one linked context — and down to one context that means a bare verb quietly strikes whatever survives. Zero or 2+ contexts fail loud with a shaped error. Always carry `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (or ride `Tools/Capture.sh`); never trust self-route.

Context IDs are assigned in the Interceptor extension popup (toolbar icon → Context ID field → Save). Once set, the daemon remembers across restarts. Giving the friendly `interceptor-test` name here ends UUID rot.

**Standing default:** `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`. One-time build-out: `Workflows/LaunchTestProfile.md`.

### Computer Use — the macOS bridge

A Swift LaunchAgent running as the operator, supplying what the extension alone cannot:

- **OS-grade trusted input** (`interceptor act <ref> --trusted`, `macos type --trusted`, `macos keys --trusted` — clears `isTrusted` gates via HID source state)
- **Native app steering** (`interceptor macos open/read/act/inspect` — the browser surface, against any live app)
- **Accessibility trees** of any live app, screenshot-free
- **Capture past Chrome** (full screen, off-tab, multi-display, occluded windows)
- **VM lifecycle** (`interceptor macos vm create/clone/start/exec/snapshot/restore/stop/delete` — Linux + macOS guests, supersedes Lume/Tart/UTM)
- **Clipboard r/w**, audio listen + speech recognition, notifications, Vision OCR, NLP, Apple Intelligence, HealthKit, display facts
- **Apple Events** to named bundle IDs sans activation
- **OSLogStore predicate queries**, filesystem search/watch, URL fetch
- **Monitor** (cross-app flow recording with optional clipboard/files/network/log/notifications/speech channels plus `--frames` capture)

**Liveness:** `interceptor status` prints `bridge: running` with PID + socket when live, `bridge: not running` with a hint when not.

**Bridge build/verify/fix/uninstall all live in `Workflows/Update.md`.** It orders binary placement, Sparkle install, LaunchAgent plist, `launchctl bootstrap`, and TCC prompts correctly.

**Threat shape — read before installing:**

- Wire is a **UNIX-domain socket** at `/tmp/interceptor-bridge.sock`. Local-only; zero network listeners.
- **Socket carries no auth.** Any same-user local process can connect and fire every bridge move. macOS TCC grants (Accessibility, Screen Recording, Microphone — `trust` keys read `accessibility` / `screenRecording` / `microphone`, no `inputMonitoring` field) attach to the bridge once and extend to every socket client.
- **Marginal exposure is supply-chain:** hostile local code gains a one-hop road to OS-grade input/screen/clipboard sans its own grant prompts.
- Single-user Mac: acceptable, since same-user code reaches this with effort anyway. Multi-user Macs want socket hardening.

---

## Compound verbs (preferred)

Single calls swallowing multi-step chains — fewer calls, fewer tokens:

```bash
interceptor open <url>                              # Open + wait + return tree + text
interceptor open <url> --reuse                      # Steer the existing managed tab
interceptor open <url> --activate                   # Foreground the fresh/reused tab (explicit opt-in)
interceptor open <url> --tree-only|--text-only|--full|--no-wait|--include-frames
interceptor read                                    # Tree + text of the live tab
interceptor read <ref>                              # Subtree
interceptor read --markdown                         # Page as markdown (headings/tables/emphasis kept)
interceptor read --markdown --text-only             # Markdown prose alone, no tree
interceptor read --tree-only --tree-format compact  # Actionable refs alone
interceptor read --include-style|--include-frames
interceptor act <ref>                               # Click + wait + return fresh tree + diff
interceptor act <ref> "value"                       # Type + wait + return fresh tree
interceptor act <ref> --trusted                     # OS-grade HID-sourced input (was --os; --os is deprecated alias)
interceptor act <ref> --keys "Enter"                # Keyboard shortcut
interceptor act <ref> --no-read                     # Skip the post-move tree read
interceptor inspect                                 # Tree + text + network log + headers
interceptor inspect --net-only|--filter <pattern>
```

**`--trusted` vs `--os`:** v0.13.3 crowned `--trusted` canonical. `--os` lingers as a deprecated alias that warns. New code leads `--trusted`.

## Verb catalog (moved)

The exhaustive per-verb CLI roll — macOS Native (Computer Use), VM Lifecycle, Core Browser, Network/Exports, Recording (Session Monitor), Canvas, Scene Graph, LinkedIn, ChatGPT Agentic Bridge, Batch + Meta — now lives in `References/CommandReference.md`. Fast map:

| Family | Catalog section |
|-----------|-------------------|
| `interceptor macos *` (native apps, AX, trusted input, Vision/Speech/NLP, Apple Events, logs, fs, overlay) | macOS Native (Computer Use) |
| `interceptor macos vm *` (Linux + macOS guests, gold image, clone/snapshot) | VM Lifecycle — plus `Workflows/VmLifecycle.md` |
| `state`, `tree`, `find`, `click`, `type`, `navigate`, `tabs`, `screenshot`, `eval`, `style`, `cookies` | Core Browser Commands |
| `net log/headers/export`, `override`, `network *`, `sse *`, `headers *` | Network — Passive, CDP, and Exports |
| `monitor *` (record/replay) | Recording (Session Monitor) |
| `canvas *`, `scene *` | Canvas / Scene Graph |
| `linkedin *`, `chatgpt *`, `batch`, `status`, `contexts`, `init`, `upgrade` | LinkedIn / ChatGPT Bridge / Batch + Meta |

## Standing rules

- **Chrome/Brave must be alive** for browser verbs — an extension, not a lone binary.
- **Bridge must be alive** for `act --trusted`, `macos *`, full-screen capture, VM lifecycle — `interceptor status` settles it.
- **Refs read eN** — `e12`, never `@e12`. Refs decay fast; re-`read`/`find` past navigations, rerenders, DOM churn.
- **Framed refs** — `read --include-frames` yields `e<frameId>_<n>` outside the top frame.
- **Prose by default.** `--json` only for script pipes. Prose-shaped models parse tree/text better than packed JSON.
- **Daemon self-births** — first verb wakes it; manual starts unneeded.
- **Compounds over chains** (`open`, `read`, `act`, `inspect` beat `tab new` + `wait` + `tree` sequences).
- **Structured reads over pixels** unless the ask is genuinely visual — tree/text/network/scene/AX read faster, smaller, steadier.
- **`--trusted` canonical; `--os` deprecated alias.** v0.13.3+. New code writes `--trusted`.
- **`--markdown` is the shaped-prose surface** — headings, tables, emphasis survive. Prefer it over `--text-only` where hierarchy disambiguates.
- **Background-first by contract.** Solely `--activate` / `app activate` / explicit `tab switch` foreground.
- **Prove it with `frontmost` around.** Native runs pledging no focus shift show before/after.
- **No `screencapture`. No `osascript` for Chrome focus, bounds, tabs, windows.** Banned under Absolute Bans. Holds through Interceptor outages.
- **Lifecycle-bound claims ride `Tools/VerifyViewport.ts`** — animation, transitions, ResizeObserver/IntersectionObserver, lazy-load, scroll-reveal, responsive layout. The shared test context reports clean zeros for all of these whenever its window hides. See the Rendering-Lifecycle Gate.
- **Captures ride `Tools/Capture.sh`, never bare `interceptor screenshot`.** Capture.sh gates preflight, bars Default targets, heals UUID-rot, favors DOM-render, and lands review artifacts in `$DEVOS_DOWNLOADS_DIR` (default `~/Downloads/` when unset).
- **Tab tidiness — upstream now self-cleans (Tab Lifecycle Policy, 0.23.3+); `CleanupTabs.sh` is the backstop, not the broom.** Two popup-configured habits (the popup alone writes them): **(1) named-group reuse (default on)** — `interceptor open <url> --group <label>` steers that group's freshest tab rather than minting one (address-bar semantics), so a 40-step run leaves one tab, not forty. Named groups only: inside the shared default group "freshest tab" might be another agent's, so bare `open` still mints — `--reuse` opts in anywhere, `--no-reuse` forces fresh, `tab new` (the ⌘T verb) always mints. **(2) idle group close (default 10 min)** — a group no verb touched self-closes (0 disables), sparing the focused window's live tab, pinned tabs, sounding tabs, and each window's last tab; every sweep logs and closed tabs answer to ⌘⇧T / `interceptor session restore`. Read the live policy in `interceptor status --verbose` (`tabLifecycle` field). **Favor `open --group <label>` mid-task** so reuse cleans as you go. Still close with `bash DEVOS/skills/Interceptor/Tools/CleanupTabs.sh` once at the END — it shuts non-live tabs in the PINNED test context only, spares the live tab (window survives), honors `--keep-url <substr>`, refuses Default/working profiles, and exits 0 with the context unlinked. Belt-and-braces for ungrouped tabs the idle sweep hasn't met.

## Handing work to agents

Spawned agents doing Interceptor jobs get this preamble:

```
Agent(subagent_type="general-purpose", prompt="
  Use interceptor CLI for all browser and macOS automation work.
  Browser: open <url> --context \"$INTERCEPTOR_TEST_CONTEXT_ID\", read [--markdown], act eN, inspect. Screenshots go through Tools/Capture.sh, never raw screenshot.
  Native (macOS): macos open <app>, macos read, macos act <ref>, macos inspect, macos vm *.
  Compound commands preferred — they return tree + text in one call.
  Refs use eN syntax (no @ prefix) from tree output. Treat refs as short-lived.
  Background-first: only --activate and app activate move focus.
  PROFILE ISOLATION (MANDATORY GATE): the FIRST action of this task is
    bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
  If that script exits non-zero, STOP and surface the message verbatim — do NOT
  fall back to operating against the Default profile, and do NOT use screencapture
  or osascript as substitutes. After the preflight returns OK, every browser
  command carries `--context \"$INTERCEPTOR_TEST_CONTEXT_ID\"`. Never operate in the
  operator's main profile unless the parent agent explicitly says so.
  `act --trusted` for OS-level HID input (was --os).
  FINAL action after your work is done and evidence captured: run
    bash DEVOS/skills/Interceptor/Tools/CleanupTabs.sh
  to close the tabs you opened in the test profile (keeps the active tab).
  [your specific task instructions here]
")
```

## Workflow map

| Workflow | Trigger | File | Notes |
|----------|---------|------|-------|
| LaunchTestProfile | "test profile", "launch test profile", "isolated browser", "isolated browser profile", "separate Chrome window", "start interceptor-test" | `Workflows/LaunchTestProfile.md` | One-time setup + daily launch of the isolated Chrome profile via `--profile-directory`, extension load, context-ID naming |
| VerifyDeploy | "verify deploy", "check deploy", "confirm deploy", "deploy verification" | `Workflows/VerifyDeploy.md` | Open URL in real Chrome (via `--context interceptor-test`), structured read, check errors, evidence |
| ScrubFlow | "scrub flow", "record flow to video", "motion bug", "animation jank", "transition stutter", "flicker", "flow gallery", "catch motion a screenshot misses" | `Workflows/ScrubFlow.md` | Record a web flow to video, extract SSIM-scored frames (survey/scrub via `Tools/FrameScrub.ts`), catch motion/animation/flow bugs a still screenshot misses |
| Reproduce | "reproduce", "reproduce bug", "debug page", "check page", "blank screen" | `Workflows/Reproduce.md` | Open affected page BEFORE code analysis, capture console errors and network 404s |
| ReadAndExtract | "extract value", "read page", "pull a fact", "SPA state" | `Workflows/ReadAndExtract.md` | Compound read + SPA state extraction; right surface per task; mode-swap rule |
| DriveRichEditor | "drive Canva", "drive Docs", "drive Slides", "rich editor", "scene", "scene graph", "canvas-rendered" | `Workflows/DriveRichEditor.md` | Scene graph + dispatched-event recipes for canvas-rendered editors |
| OverrideXhr | "override request", "request override", "force 500", "rewrite response", "mutate XHR" | `Workflows/OverrideXhr.md` | Install passive override, trigger, verify, clear |
| ScreenshotForVlm | "screenshot for VLM", "VLM screenshot", "agent screenshot", "WebP 1568" | `Workflows/ScreenshotForVlm.md` | VLM-budgeted screenshot recipe; 1-command budget; --save --format webp --target-max-long-edge |
| MultiPageCompare | "compare pages", "multi-page compare", "facts across N pages", "designed by X vs Y" | `Workflows/MultiPageCompare.md` | Sequential `open --text-only` per page, no tab thrashing |
| CaptureBackgroundedApp | "screenshot of Brave / Signal / Mail / X", "capture backgrounded app", "capture occluded window" | `Workflows/CaptureBackgroundedApp.md` | CGS capture of named app's window without activating it |
| DriveBackgroundedApp | "scroll Mail / type into TextEdit", "drive backgrounded app", "click without focus" | `Workflows/DriveBackgroundedApp.md` | AX press + value-set + `postToPid` for non-frontmost input |
| DispatchAppleEvent | "open URL in Brave", "Apple Event", "apple events", "intent dispatch", "named app open" | `Workflows/DispatchAppleEvent.md` | `intent dispatch --bundle <id> --script` — no `activate` in scripts |
| ReadAxTree | "AX tree", "accessibility tree", "what's in Cursor / Slack", "find a button in app" | `Workflows/ReadAxTree.md` | `macos tree` with Electron wake-up via `AXManualAccessibility` |
| TrustedInputGate | "trusted input", "OS-level input", "isTrusted", "site rejects synthetic input", "HID-source state" | `Workflows/TrustedInputGate.md` | `--trusted` escalation; browser-side `__interceptor_trust` marker; when to use which |
| VmLifecycle | "create VM", "VM lifecycle", "linux VM", "macos VM", "gold image", "clone VM", "snapshot VM" | `Workflows/VmLifecycle.md` | `interceptor macos vm *` full lifecycle + Lume migration table |
| RecordFlow | "record flow", "record workflow", "capture flow", "monitor start" | `Workflows/RecordFlow.md` | Record browser actions via monitor system, export replayable plan script |
| RecordAndReplayMacFlow | "record mac flow", "record native flow", "watch me do X in Cursor/Mail/Finder" | `Workflows/RecordAndReplayMacFlow.md` | `macos monitor` AX-event recording + export + replay |
| ReplayFlow | "replay flow", "replay", "regression check", "run flow" | `Workflows/ReplayFlow.md` | Execute a recorded plan script step-by-step, verify each step, report regressions |
| TestForm | "test form", "fill form", "form test", "check form" | `Workflows/TestForm.md` | Discover form fields, fill with test data, submit, verify result |
| Update | "update", "check version", "rebuild", "install bridge", "enable computer use" | `Workflows/Update.md` | Pull, rebuild, reinstall, install bridge for Computer Use, verify end-to-end |

## Walkthroughs

- "Verify the blog deploy" → VerifyDeploy: isolation preflight, `interceptor open <url> --context "$INTERCEPTOR_TEST_CONTEXT_ID"`, `read --markdown`, capture via `Tools/Capture.sh`, evidence-backed report.
- "The menu animation looks off / does the checkout flow render clean" → ScrubFlow: film the flow, `bun Tools/FrameScrub.ts <recording> scrub --at <sec>`, Read the flagged frame, cite the manifest. Motion/interaction ISCs close on this or a flow-gallery, never one still (verification rule V1).
- "Why is this page blank after deploy?" → Reproduce: page first, `eval --main` console-error harvest, `net log` for dead requests, code theories after.
- "Record me approving this flow, then replay it nightly" → RecordFlow + ReplayFlow: `monitor start`, operator moves, `monitor export <sid> --plan`, replay the plan later.

## Field notes

*Incident log — dated entries are factual records; keep them when editing.*

- **`interceptor` exiting on signal 137 with no output means a dead code signature, not a wedge.** The kernel SIGKILLs adhoc-signed binaries whose signature decayed (seen 2026-06-10 after a system event; both binaries hit). Confirm: copy the binary to /tmp, `codesign -s - -f` the copy, run it — a working copy indicts the signature, so re-sign the live pair: `codesign -s - -f /opt/homebrew/bin/interceptor && codesign -s - -f /opt/homebrew/bin/interceptor-daemon`. BOTH need it — the CLI births `interceptor-daemon --standalone`, and a still-broken daemon answers "daemon failed to start. Check /tmp/interceptor.log" with the log never born. *(2026-06-10.)*
- **Capture mechanics underneath `Tools/Capture.sh` (0.22.2).** Always capture through the wrapper; the raw facts below explain what it hides.
  - **Bare `interceptor screenshot` rides DOM-render** — a **dependency-free native renderer since v0.18.3** (`html-to-image` retired; injected per demand via `executeScript`). It paints from the live DOM and **skips any foreground/visible-tab demand** — a backgrounded tab on a far Space passes, and it fails fast instead of hanging a full timeout there.
  - **`--pixel` opts out** → legacy `captureVisibleTab`. It shoots the window's *live* tab, so aiming a background tab means a brief foreground-and-restore — **the flash is intentional**. `--pixel` insists on an un-minimized, on-screen window; minimized → quick honest failure. Full-page `--pixel` spaces strips 1100ms apart (Chrome's 2/sec ceiling), stitched in the service worker.
  - **Steadiness is the default road, not a switch.** No "reliable mode" flag exists. Today's steadiness is the in-extension minimized-window pre-check (fast fail over ~30s hangs) plus the CLI's 45s screenshot ceiling. The `cli/lib/screenshot-selfheal.ts` wrapper sits **dormant/unwired** — never cite it.
  - **`--save` lands in the CLI's current working directory** and answers `filePath` (no `dataUrl`). It does NOT write to `/tmp/devos-screenshots/` — workflows `cd` there precisely because `--save` targets CWD. No `--output <path>` flag exists; positional path arguments die silently. Per OPERATIONAL_RULES, review artifacts live in `$DEVOS_DOWNLOADS_DIR` (default `~/Downloads/` when unset), pipeline scratch in `/tmp/`; `Tools/Capture.sh` normalizes this.
  - **Sans `--save`, `screenshot` inlines the whole base64 `dataUrl`** — 10MB+ of PNG into the transcript. From agents, always `--save`.
  - `--target-max-long-edge N` (long-edge clamp, sidesteps the 16384 Skia ceiling), `--scale`, `--selector`, `--element N`, `--region X,Y,W,H` all run inside DOM-render; `--clip` is the deprecated `--region` alias.
- **DOM-render capture skips UA widget chrome — native button/input contrast faults slip through.** A naked `<button>` without CSS `background` shows the UA's white/#efefef face in the true browser (harshest on iOS Safari), while DOM-render paints it near-transparent, so white-on-white passes looking fine (2026-08-07: Surface share buttons shipped unreadable on mobile off a clean capture). Contrast verdicts on controls demand `getComputedStyle(...).backgroundColor` (transparent ⇒ UA face will render) or a `--pixel` shot, never the DOM-render default. Textarea/input *values* assigned by property likewise never paint.
- **DOM-render capture sheds pseudo-element content.** `::before`/`::after` output — CSS counters first — paints live yet disappears from default DOM-render shots, so pages can photograph broken while rendering fine. Settle via `eval --main` geometry/computed-style before "repairing" the page; authored content prefers real DOM text over CSS counters. *(2026-07-11, via a vanished numbered rail eval proved alive.)*
- **DOM-render capture starts at document y=0 regardless of scroll.** `window.scrollTo` / `scrollIntoView` / `keys End` never shift the frame. Tall pages want `--region X,Y,W,H`, `--selector <css>`, `--element <ref>`, or `--pixel --full` (stitched scroll, window must show). *(2026-04-27, still true 2026-06-17.)*
- **A reported checkbox `click` may never flip it.** Seen twice on live forms (2026-07-18): label-wrapped `<input type="checkbox">` — `click` cheered `clicked [eN]`, the post carried unchecked, and `act <ref>` on the same node errors "unsupported input type". Re-check state post-click (`eval --main '...checked'`); when unstuck, flip `checked=true` via `eval --main` and post the GENUINE form (`form.submit()`) — session/CSRF/POST path intact. Never trust a click report for toggle state.
- **Two agent sessions sharing one test context make `--current` and bare `read`/`eval` chase the LIVE tab — the other session keeps retargeting it.** Sibling of the `--pixel` wrong-page trap (2026-06-11), re-hit 2026-07-18: `Capture.sh --current` photographed the neighbor session's tab. Always hand `Capture.sh <url>` its URL (navigate-then-shoot is atomic in the managed tab) and re-`open --reuse` ahead of each read/eval burst; skip `CleanupTabs.sh` while a neighbor's tabs share the window — closing theirs outranks leaving your one managed tab.
- **Twin tabs on one URL muddle routing sans `--context`.** Two tabs on `localhost:5180/` let `tab switch <id>` answer `ok` while Chrome's visible tab never moves. Either close the double, work a fresh lone tab, or scope with `--context <id>`.
- **`eval` meets CSP on most sites.** `eval --main` runs in the page's own world. Under strict CSP (`script-src 'self'`) even `--main` string-eval dies; keep expressions small, shun `Function`-constructor shapes.
- **Bridge wants Sparkle.framework.** Source rebuilds on Apple Silicon stall until `Sparkle.framework` sits at `/usr/local/Frameworks/`. The live bridge is the `.app`-bundle binary at `~/.local/share/interceptor/interceptor-bridge.app/Contents/MacOS/interceptor-bridge` (LaunchAgent `com.interceptor.bridge`, plist `~/Library/LaunchAgents/com.interceptor.bridge.plist`), NOT `/usr/local/bin/interceptor-bridge` (stale twin). The Update workflow sequences this; the tell is `bridge: not running` plus `dyld[*]: Library not loaded: @rpath/Sparkle.framework/...` in `/tmp/interceptor-bridge.stderr.log`. *(2026-05-03, topology corrected 2026-06-17.)*
- **Manifest bumps demand manual extension reload + re-pin (source installs).** Chrome never auto-refreshes unpacked extensions, and the pinned `Extension/` twin never trails upstream alone. Post-rebuild, re-pin per the Update workflow, drop the old card in `chrome://extensions`, and Load Unpacked fresh from the pinned folder. The deterministic extension `key` holds the ID steady across reloads. Signed-`.pkg` installs let the installer do this.
- **"native port disconnected" is daemon chatter, not a capture fault.** It logs Chrome's Native-Messaging stdio port dropping (extension SW recycled / Chrome quit); the daemon endures and falls over to WebSocket transport. With neither WS nor relay up, commands queue (cap 50) then time out. **Remedy = reconnect the extension** (reload the tab / reopen the configured browser), not daemon restarts.
- **"screenshot-runner.js could not load" means per-frame injection died.** (The retired "html-to-image library not loaded" text is history — v0.18.3's native renderer replaced the library.) Either the page bars script injection (`chrome://`, Web Store, PDF viewer, strict-CSP frame), the tab moved mid-inject, OR — likeliest after a binary bump — a **stale loaded extension** whose bundled runner mismatches the daemon. Since 0.22.37 failed DOM-render attempts **self-retry as `--pixel`** so an image usually still arrives (result admits the detour; `--no-fallback` refuses) — but the stale-extension root still wants fixing: **reload the extension** — signed `.pkg` reinstall, or source installs re-pin plus Load Unpacked from the pinned `Extension/` folder.
- **Daemon↔extension sockets half-die — exhaust sibling families BEFORE pronouncing Interceptor dead.** Signature: `status`/`contexts`/`tabs` answer (control-plane types) while `screenshot`/`eval` hang to timeout (data-plane types). Each verb family rides its own WebSocket type, so a `screenshot` wedge rarely touches `eval`, `net log`, `tree`, `read --markdown`, `monitor`, or `inspect`. Climb: (1) **trade capture roads** (pixel↔DOM-render — a fresh type often clears) or borrow another family — `read --markdown` / `eval --main document.body.innerText` for `screenshot`, `net log` for dead requests; (2) a single `pkill -f interceptor-daemon` plus one retry; (3) extension reload (surface: *"Interceptor extension is wedged — please reload it from chrome://extensions/."*) and halt. Past all three, report evidence uncapturable — **never `screencapture` / `osascript`.** **The standing blunder this stops: calling "Interceptor down" off one `screenshot` timeout when a single `eval` held the answer.** *(2026-05-13, tightened 2026-06-17.)*
- **Dead-bridge revival (macOS `macos_*` roads only — browser capture never needs the bridge).** "Loaded" ≠ "live" — ask `interceptor status` for the process, not `launchctl list`:
  ```bash
  interceptor status | grep -A2 '^bridge:'                         # running + pid/socket, or not running
  launchctl print "gui/$(id -u)/com.interceptor.bridge" 2>&1 | grep -E 'state|program|pid'
  launchctl kickstart -k "gui/$(id -u)/com.interceptor.bridge"     # restart (loaded-but-dead)
  ```
  Agents run the `.app`-bundle binary (`~/.local/share/interceptor/interceptor-bridge.app/Contents/MacOS/interceptor-bridge`), NOT `/usr/local/bin/interceptor-bridge` (stale twin). A SIGKILLed bridge under a decayed ad-hoc signature loops restarts ~5s (`ThrottleInterval`) — re-sign the `.app` MacOS binary, not the `/usr/local/bin` twin. `Tools/HealBridge.sh` bundles loaded-but-dead detection plus one kickstart. *(2026-06-17.)*
- **`AXEnhancedUserInterface` left the bridge** (it raised AppKit apps as a "VoiceOver active" side effect). The bridge wakes Electron solely through `AXManualAccessibility`. Old code setting `AXEnhancedUserInterface` is stale — disregard.
- **`screenshot --pixel --tab <id>` can shoot the WRONG page — `--pixel` trails the live tab.** `--pixel` is `captureVisibleTab`; it photographs the visually live tab, and when the preceding activation missed, that is the operator's foreground page, not the target (seen 2026-06-11: asked a localhost build, received the operator's unrelated foreground site). Always Read the returned frame and confirm the page before citing — `Tools/Capture.sh` re-reads on the `--pixel` fallback road for this reason. Bleed can even frame a SENSITIVE operator window (2026-07-18: a `--pixel` re-shot mid-verification returned a live private admin dashboard — forbidden to capture; deleted on re-read). For re-shoots of a page already open in the test tab, favor DOM-render default plus asset byte-compare over fresh `--pixel` rolls. AppleScript tab forcing stays banned under Absolute Bans — answer through a non-visual family (`read --markdown`, `eval --main`, `net log`) or climb the WebSocket-wedge ladder. *(2026-06-11; AppleScript detour removed 2026-06-13.)*
- **A full-page still cannot close a fine-detail appearance claim — magnify first.** Frames shrink near 1568px long-edge before models view them, so a 40px logo on a 2000px page arrives mush. Cropping the delivered file recovers nothing; detail died upstream. `bun Tools/Zoom.ts <image> --x N --y N --w N --h N` crops the full-resolution original and enlarges that patch to budget, landing pixels on the claim. Reach for it on logos, glyphs, font rendering, icons, few-pixel spacing — the wrong-logo run (2026-07-19), where "present" passed while "correct" failed. Coordinates are absolute source-image pixels; a DOM read (`eval`) supplies the patch. Backends: `magick`, else `ffmpeg`. *(public PR #1657, @elhoim.)*
- **Sensitive-app gate.** The bridge refuses `type`/`keys`/`click x,y`/`drag` with a denylisted bundle frontmost (Keychain, 1Password, Dashlane, LastPass, Bitwarden, System Settings, Chase, Bank of America, Wells Fargo). Relay the refusal — never route around it.
- **VM `paused-state` snapshots gate.** `--paused-state` needs `validateSaveRestoreSupport()` true on the VM config. macOS guests qualify; some Linux shapes don't. `--disk-only` always passes.
- **TCC dues for VM hosts:** the bridge wants the `com.apple.security.virtualization` entitlement. Relocate the bridge out of `~/Documents` / `~/Desktop` when `setup_required` faults the path.
- **Local extract.ts patching is retired.** The pre-v0.13 slice-limit bump to 10M is surplus — upstream's `withTruncationMarker` + `--full` + per-action `maxChars` handles it with explicit markers (`... (truncated: showed X of Y chars ...)`).
- **Stale binaries silently sink to Default — the fallback incident (2026-05-23).** A rebuild landing in `$INTERCEPTOR_SRC/dist/` but never copied to `/opt/homebrew/bin/` leaves the CLI ancient. Old binaries don't know `--context` or `contexts` — they swallow the flag silently and drive whichever Chrome link the daemon finds, normally the operator's Default window. Signature: `interceptor open <url> --context "$INTERCEPTOR_TEST_CONTEXT_ID"` plants a tab in the operator's working window. Detect: `interceptor --version` older than `0.16.0`, AND/OR `interceptor open --help` hiding `--context`, AND/OR `interceptor contexts` answering "unknown command". Defense: the **Preflight Isolation Gate** (above) fails hard on version skew with exit 4 — every workflow gates at step zero. Heal via `Workflows/Update.md` then `pkill -f interceptor-daemon` so the next call births the fresh daemon.
- **Cloud-synced checkouts break bridge signatures — the full re-signing order.** A source tree inside (or symlinked into) iCloud Drive, Dropbox, or Google Drive loses the built `.app`'s signature envelope to sync (`codesign -v` → "code has no resources but signature indicates they must be present"). Installing that bundle spreads the break and the bridge SIGKILL-loops (`launchctl print` → `last exit reason = OS_REASON_CODESIGNING`). **Lasting cure: move the checkout to local disk.** To mend an already-broken bundle, operate on the LOCAL staged copy (`~/.local/share/interceptor/interceptor-bridge.app`), in order: `xattr -cr` it → `codesign --force --deep --sign - .../Contents/Frameworks/Sparkle.framework` → `codesign --force --sign - --entitlements "$INTERCEPTOR_SRC"/scripts/entitlements-bridge.plist` on **the MacOS binary first, then the .app** (mirrors build-bridge.sh's dev-signing fallback). Never `codesign --deep` the whole app — it mis-signs nested Sparkle so `codesign -v` passes while the kernel still kills.
- **`bash scripts/install.sh --chrome` re-tramples a mended bridge.** It chains install-bridge.sh, which re-copies the still-broken bundle over the fix. Re-sign AFTER it — or stop re-running it once signed.
- **launchd `job state = spawn failed` after burst `kickstart -k`.** Tight restart loops throttle launchd into failure (`runs` climbs; direct binary runs fine). Heal with `launchctl bootout "gui/$(id -u)/com.interceptor.bridge"` then fresh `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.interceptor.bridge.plist` — NOT another kickstart.
- **The daemon persists as a LaunchAgent (`com.interceptor.daemon`, since 2026-07-04) — the lasting cure for the extension's "native keepalive ping failed / forcing reconnect" log spam.** That noise fires while the daemon is briefly *down* (upgrade, crash, `pkill`): the drop kills the extension's native-messaging relay port, and the SW logs `ping failed` till reconnect. Relay shape is otherwise sound — one singleton owns the socket, each Chrome profile spawns a thin relay bridging to it (`relay: registered with singleton` → `received ping, sending pong`). An ALWAYS-up singleton (`RunAtLoad` + `KeepAlive`, plist `~/Library/LaunchAgents/com.interceptor.daemon.plist` → `/opt/homebrew/bin/interceptor-daemon --standalone`) means relays always meet a live singleton, so reconnects land instantly. **Across daemon-binary upgrades, `launchctl kickstart -k "gui/$(id -u)/com.interceptor.daemon"`** to adopt the new binary (bridge pattern). Prove: `interceptor status` daemon pid equals the launchd pid, and a steady `/tmp/interceptor.log` window shows zero `ping failed` / `forcing reconnect`.
- **Ad-hoc bridge re-signs void TCC grants.** A fresh ad-hoc signature is a fresh code identity, so Accessibility / Screen Recording / Microphone fall to `denied` and Computer Use stops till re-granted (`interceptor macos trust --walkthrough`, or System Settings → Privacy & Security). The browser road is untouched (extension-based, TCC-free). The notarized `Interceptor-Full-<v>.pkg` holds a stable Developer-ID identity across Sparkle updates and dodges this — prefer it for the bridge where TCC churn bites.
- **A hidden tab reports zero animation/observer life without complaint — reading exactly like "feature broken."** Before judging a ResizeObserver, transition, lazy-load, or scroll-reveal dead, check `document.visibilityState`; `hidden` suspends every scheduled-render API and voids the reading. Re-run through `Tools/VerifyViewport.ts` (Rendering-Lifecycle Gate). The bite marks: internally coherent numbers, counters pinned at 0 or 1, and hand-invoking the page's own callback "repairing" it. *(2026-07-30, caught verifying a responsive nav; the pinned test window sat on a dead area of a second display.)*
- **`interceptor macos cdp raw <method> '<json>'` reads params POSITIONALLY** — `--params`/`--param` both die `error: Invalid parameters`. Past one CDP context you must also hand `--context`; the daemon mints a URL-named alias per navigation, so pin the stable host-derived id (`cdp:127-0-0-1`) and prune aliases. Every CLI answer prefixes a `[id] → verb` trace line to strip before JSON parsing — and it holds a `[`, so naive `indexOf('[')` finds the trace, not the payload.
- **`interceptor macos windows --app "Google Chrome"` lists solely the primary Chrome process's windows.** A second Chrome on its own `--user-data-dir` shares the bundle id yet its windows never list, so AX can't drive or watch it — use CDP.
- **`interceptor diagnose` leads any wedge hunt (0.22.2+).** It spotlights daemon **split-brain**: the socket daemon (CLI's partner) vs the NMH manifest path (Chrome's spawn). Heal by aiming the manifest `path` at the canonical binary — `jq '.path="/opt/homebrew/bin/interceptor-daemon"'` over `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.interceptor.host.json` (+ Brave twin) — then `pkill -f interceptor-daemon` and one live verb (`interceptor contexts`) to respawn correctly. Two live traps from the 0.22.37 climb *(2026-07-28)*: the Chrome NMH manifest is a **symlink into `$INTERCEPTOR_SRC/daemon/.generated/`** (install.sh re-points it at the repo tree — swap in a real file aimed at `/opt/homebrew/bin`), and a **stale standalone daemon from the old iCloud checkout** can outlive `pkill -f interceptor-daemon`; kill it by pid from diagnose output.
- **In-place overwrites of `/opt/homebrew/bin/interceptor{,-daemon}` trip `OS_REASON_CODESIGNING`** — `cp` over live binaries exposes half-signed bytes to the `com.interceptor.daemon` LaunchAgent's 5s respawns, and taskgated SIGKILL-loops each try (`launchctl print` → `last exit reason = OS_REASON_CODESIGNING`) till the copy settles — 92 crash reports in one 77-minute window on 2026-08-10. Re-sign installed copies in place (`codesign --force --sign - /opt/homebrew/bin/interceptor-daemon` and `.../interceptor`), then `launchctl kickstart "gui/$(id -u)/com.interceptor.daemon"`. *(2026-07-28 climb; repeat 2026-08-10. Update workflow step 4 now holds the lasting cure: stage → sign → atomic `mv`, never `cp` onto the live path.)*
- **Source bridge rebuilds void TCC — and re-flipping the old rows heals nothing.** The ad-hoc signature shifts, so macOS drops Accessibility + Screen Recording for `interceptor-bridge` — signature is a *running* bridge answering **empty a11y trees and `windows: []`** everywhere, with `macos script run` dying on the Apple Events prompt. Probe `interceptor macos trust`. Stale System Settings rows key to the OLD signature; toggling them is inert (verified live: 5 stale rows banked). Heal: `tccutil reset Accessibility com.interceptor.bridge && tccutil reset ScreenCapture com.interceptor.bridge`, kickstart the bridge, fire one `macos windows` to re-register, then the human flips the FRESH rows ON in System Settings → Privacy & Security → Accessibility and Screen Recording (absent rows: + add `~/.local/share/interceptor/interceptor-bridge.app`). Lasting cure: export `INTERCEPTOR_SIGNING_IDENTITY` with a real Developer ID pre-build so signatures — and TCC — survive rebuilds. *(2026-07-28 climb.)*
- **Post-bump extension reloads can be hands-free.** Against the "drop card + Load Unpacked" standing order, a **full Chrome quit + relaunch** re-armed the pinned unpacked extension at the new manifest (0.22.2 → 0.22.37) with zero GUI labor — contexts re-linked solo. Try the restart first; manual reload only when the card returns disabled. *(2026-07-28 climb.)*
- **`Tools/Pin.sh` under bash 5.2+ — the tilde scrub silently no-opped (fixed 2026-07-04).** `${SRC/#$HOME/~}` started tilde-re-expanding the replacement to `/Users/<name>`, so `PINNED_FROM.txt` carried an absolute home path and Pin.sh's own leak guard FATALed. Repaired as quoted `~${SRC#$HOME}` (`rel_home()`). When a re-pin FATALs on "absolute home path survived the scrub," inspect bash version and that helper.
- **Self-heal opens (`EnsureTestProfile.sh`) — safety is the re-check loop, not the profile argument (2026-07-07).** With the test window shut, `EnsureTestProfile.sh` opens the configured `--profile-directory` and polls `PreflightIsolation.sh` till the PINNED context links, then proceeds. It can open the *wrong* profile risk-free, because exit 0 demands preflight's whole-field `INTERCEPTOR_TEST_CONTEXT_ID` match plus Default-denial — a wrong open just keeps failing preflight, so agents never drive it. Two genuine edges: (1) macOS `open -a "Google Chrome" --args --profile-directory=…` **no-ops its args against a running Chrome** (merely foregrounds) — `LaunchTestProfile.sh` routes around via its direct-`CHROME_BIN` branch, which raises a fresh profile window even over a live Chrome; a "successful" open with no fresh window is the `open`-while-running case, and the direct-binary road is the true fix. (2) An open linking a FRESH context UUID (extension reloaded → UUID rot) never matches the pin, so `EnsureTestProfile` HALTS with the lasting cure (name the context `interceptor-test` in the popup) — never rebinding to an unidentified UUID. Solely exits 5/6 self-open; exit 7 (Default/working target) and 8 (unconfigured) never do.

### Linux + Flatpak browser — the four-hour family (2026-07-19, Fedora)

All four bit in one Fedora session with Flatpak Chrome
(`com.google.Chrome`, reached through a `~/.local/bin/google-chrome` shim adding
`--filesystem=/tmp --filesystem=home --die-with-parent`). Read this block
before faulting a Linux install; the first symptom-feels like a dead extension
is not one. *(public PR #1682, @pkumaschow.)*

- **A daemon socket born INSIDE a Flatpak sandbox never answers the host CLI, though the socket file sits plainly visible.** `/tmp` genuinely shares both ways (a host-written marker reads inside the sandbox and back), so `ls -la /tmp/interceptor.sock` shows the file — while `interceptor status` reports `daemon: not running` in the same breath. The endpoint lives in the sandbox's namespace; the visible file is a shadow. **The cure is an unsandboxed browser**, not Flatpak permission tuning. Native Vivaldi — one Interceptor honors — relays on a host-reachable socket and the CLI connects at once. Copy the NMH manifest to that browser's own folder first (e.g. `~/.config/vivaldi/NativeMessagingHosts/`).
- **A windowless orphaned Flatpak instance can squat port 19222 invisibly, and `pkill` on the visible PID never frees it.** No Chrome window shows and the operator fairly says "no Chrome is open" while `bwrap --args N -- chrome --profile-directory=X` still breathes with its daemon owning the port, starving every later relay — even another browser's. `kill <pid>` on the visible child never crosses `bwrap`. **`flatpak kill com.google.Chrome` is the dependable clear.** Suspect this whenever a relay cries held-port with no browser visibly up.
- **Relays wed solely to self-spawned singletons; a losing double unlinks the winner's socket on exit.** Log fingerprints read `spawning detached standalone daemon` → `ws port 19222 already held ... exiting this duplicate` → `detached standalone daemon did not become ready before timeout` → `falling back to in-process singleton` → `exiting so the existing daemon serves everyone`. It never degrades to plain-ws client. So: **CLI calls self-harm while a rival daemon holds the port** — each spawns a double that deletes the live socket, so probing re-inflicts the fault. When the socket keeps evaporating, stop firing CLI verbs and settle ownership first. (Upstream-worthy: daemons should never unlink sockets they didn't birth.)
- **`--load-extension` is inert (Chrome 137+; verified skipped on 150).** The profile rises with only the five stock component extensions. The `chrome://extensions` → Load unpacked picker is the sole road — and inside a Flatpak browser it crosses the XDG Document Portal, so picks surface as `/run/flatpak/doc/<id>/...` in errors. That prefix is normal, never the fault. **`~/.claude` is dot-hidden and GTK pickers hide dotfiles: Ctrl+H in the picker** or the operator can't reach the extension at all.

**Agent footgun from the same session:** `pkill -f interceptor-daemon` fired from Bash matches the firing shell's own command line and kills it — the command dies at exit 144 with clipped output, mimicking a wedge. Split the literal (`PAT="intercep""tor-daemon"; pkill -f "$PAT"`) or kill by PID.

**Doctrine footnote.** The operator's Default window holds their live tabs and tabs other agents steer. One flag per verb costs nothing; one stray tab in their window costs for good. That asymmetry is why `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` is constitutional.

## Stealth record

Clears the major bot gates:

| Gate | Standing |
|-------|--------|
| BrowserScan | Normal |
| Pixelscan | Definitely Human |
| Sannysoft | All pass |
| CreepJS | 0% headless |
| Fingerprint.com | notDetected |
| AreyouHeadless | Not headless |

---

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Interceptor","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
