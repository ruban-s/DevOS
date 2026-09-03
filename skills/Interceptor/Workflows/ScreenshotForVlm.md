# ScreenshotForVlm

Framing a page shot a vision-language model (VLM) will read. Reach here when pixels genuinely hold the answer — layout, color, chart artifacts, painted glyphs — and no shaped read (`read`, `text`, `inspect`, `scene text`, `canvas log`, `macos tree`) yields the same fact.

**Pixels are the last-read surface.** Shaped reads spend ~10× fewer tokens per turn and outlive DOM churn better than frames. Exhaust the other reads first.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Non-zero → STOP, relay the message exactly. Never sink to Default. Captures travel `Tools/Capture.sh`, which re-gates, aims `INTERCEPTOR_TEST_CONTEXT_ID`, and lands review artifacts in `$DEVOS_DOWNLOADS_DIR` (default `~/Downloads/` when unset) — never bare `interceptor screenshot`.

## Call budget

**1 call.** The house recipe below IS the budget.

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

When the first frame misses, resist a second scouting shot — re-ask whether pixels truly answer. The "scout then re-shoot" loop is the exact failure this budget bars. A needed second capture narrows hard via the underlying `--selector`, `--element <ref>`, or `--region X,Y,W,H` flags — still 1 call, not a retake.

## The house recipe

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

`Capture.sh` fires `interceptor screenshot` underneath with the DOM-render road, the pinned `--context`, `--save`, and a `$DEVOS_DOWNLOADS_DIR` (default `~/Downloads/` when unset) landing, then prints the saved frame's absolute path as its sole stdout line. Bytes on disk, no inline base64; the path re-reads whenever and never fattens context. Its defaults carry weight:

- **`--save`** — bytes to disk (Capture.sh resolving into `$DEVOS_DOWNLOADS_DIR` (default `~/Downloads/` when unset), the OPERATIONAL_RULES review home) with `dataUrl` stripped from the answer. Without it the WebP rides inline.
- **`--format webp`** — re-encode at the SW edge via OffscreenCanvas. ~5–8× lighter than PNG at q=85, no measured VLM accuracy cost. Stock WebP quality is 85; PNG/JPEG stock 92.
- **`--target-max-long-edge 1568`** — clamp the raster long edge to 1568 px, Anthropic Sonnet's auto-resize ceiling. Pixels past the ceiling get API-downscaled regardless. Vendor ceilings:
  - Sonnet — 1568 px
  - Opus — 2576 px
  - OpenAI — normalizes to 2048-then-768
- **`--quality 85`** — WebP quality. No measured VLM accuracy loss against PNG in practice.

## Departing from default

Forward these through Capture.sh (it passes extras to `interceptor screenshot`):

- `--target-max-long-edge 2576` — Opus or keener-eyed consumers.
- `--selector <css>` — one matching element. Off-screen tolerated.
- `--element <ref>` — a refRegistry-tracked node (`e5`, `e2_7`).
- `--region X,Y,W,H` — free page rectangle (`--clip` deprecated alias).
- `--scale <n>` — pixel-ratio override. `--target-max-long-edge` prevails when both ride.
- `--pixel` — abandon DOM-render for legacy `captureVisibleTab` compositing. Shoots the window's *live* tab, so aiming a background tab briefly foregrounds and restores it — **the flash is intentional**. Demands an un-minimized, on-screen window; minimized → quick honest failure. Solely where DOM-render fidelity collapses (compositor effects, hardware video frames, browser chrome itself). `--pixel --tab` can shoot the WRONG page (it trails the live tab) — re-read the saved frame and confirm the target before trusting.
- `--pixel --full` — stitched full-page scroll. ~1100ms per viewport strip honoring Chrome's 2/sec `captureVisibleTab` ceiling; stitched in the SW.

Stock DOM-render serves a backgrounded Chrome on a far Space — focus-free. That is the engineered-hardy road; `--pixel` is the brittle, flash-costing opt-out.

## Ahead of any shot

Run these first:

- `interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — cheapest read.
- `interceptor read --tree-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — actionable refs.
- `interceptor inspect --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — tree + prose + passive network.
- `interceptor scene text <ref> --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — prose inside a rich editor.
- `interceptor canvas log <n> --context "$INTERCEPTOR_TEST_CONTEXT_ID"` — observer log of canvas paints.
- `interceptor macos tree --app "X"` — target outside the page (macOS computer-use road; no browser context).

Any answer among them voids the pixels.

## Answer shape

Report:
- Written path (Capture.sh's sole stdout line, e.g. `"${DEVOS_DOWNLOADS_DIR:-$HOME/Downloads}"/interceptor-capture-<ts>-<rand>.png`)
- Dimensions plus on-disk weight
- What the frame showed (the genuine visual finding, not "the page painted")
- Whether pixels closed the question, or another read is still owed
