# DriveRichEditor

Steering a rich editor — Canva, Google Docs, Google Slides, Sheets, Figma, any canvas-painted surface where DOM refs run out. Stock `act` / `click` / `type` can't reach the content because the editor paints its own canvas and swallows events.

## Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

The weightiest trusted-input workflow here — dispatched events rewrite live editor content, so a mis-aimed run can spoil the operator's genuine documents. Non-zero → STOP, relay the message exactly. Never sink to Default. Each `interceptor` verb below carries `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` (the pinned isolated context from `preferences.env`); runnable blocks show it. Pixel needs travel `Tools/Capture.sh`.

## Call budget

**4 calls base + 1 per text write.**

1. `interceptor open <url>` → 1
2. `interceptor scene profile` → 1 (always first; never guess)
3. `interceptor scene <primitive>` (the task's named primitive — table below) → 1
4. Confirm via `interceptor scene text <ref>` or `interceptor scene render` → 1

Each further `scene insert "..."` costs 1. At budget sans answer, re-read once and commit.

## Fitting primitive to job

| Job | Primitive | Anti-shape |
|---|---|---|
| Read speaker notes | `interceptor scene notes` | Chaining `scene list` → `scene select` → `scene selected` → `text e3` |
| Read scene-held prose | `interceptor scene text <ref>` | Whole `interceptor read` — the tree is noise beside a scene ref |
| Prove a write landed | `scene text <ref>` or `scene render` | Reopening the page |
| Map scene shape | `scene profile` (once) | `scene profile`, then `scene profile --verbose`, then `scene list` — once suffices |

## Always first

```bash
interceptor scene profile --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

It names the scene model the page offers. **Never guess.** Hollow/unsupported profile means no scene support — fall back to DOM reads or `eval --main`. Carry `--context "$INTERCEPTOR_TEST_CONTEXT_ID"` on every `scene`/`eval`/`read`/`act` in this workflow, task and editor tables included.

## Per editor

### Google Docs
- Richest shaped target — paragraphs, lines, tables.
- Write prose: `interceptor scene insert "..."`
- Move selection: `interceptor scene cursor-to <scene-ref>`
- Read back: `interceptor scene text <scene-ref>`
- Table cells: "Canvas-painted editor input" below.

### Google Slides
- Scene serves navigation + selection.
- `interceptor scene slide list` / `slide current` / `slide goto 3`
- Writes and table growth commonly need `eval --main` dispatched events.
- Notes: `interceptor scene notes`
- Thumbnail: `interceptor scene render`

### Canva
- Partial scene coverage — settle with `scene profile --verbose`.
- Favor accessible menus + toolbar (DOM refs) ahead of scene clicks.
- Layer moves commonly need dispatched events.

### Figma / design tools
- DOM refs cover side panels.
- Canvas moves (layer pick, zoom, pan) need dispatched `MouseEvent` / `WheelEvent` carrying `event.__interceptor_trust = true`.

## Canvas-painted editor input (Docs / Slides / Sheets)

When `scene insert` under-reaches — cell-exact writes, paragraph restyles, shortcuts onto scene-less surfaces — take the pre-load trust-override road through `interceptor eval --main`:

1. **Caret landing:** fire `mousedown` / `mouseup` / `click` on `.kix-canvas-tile-content` with `event.__interceptor_trust = true` at the target pixel. Prove via `iwin.getSelection().anchorNode` parentage.
2. **Prose entry:** build `KeyboardEvent` from the iframe's OWN window (`new iwin.KeyboardEvent(...)`), fire on the iframe document (`idoc.dispatchEvent(ev)`).
3. **Printable keys** (letters, digits, symbols, Space, Enter): full `keydown` → `keypress` → `keyup`.
4. **Travel/control keys** (Tab, Arrow*, Home, End, Escape, Backspace, Delete, modifiers): `keydown` → `keyup` ONLY — never `keypress`. A `keypress` on travel keys types its ASCII ghost (Tab=`\t`, ArrowUp=`&`, ArrowLeft=`%`, ArrowRight=`'`).

**Trap:** Docs tables **birth a row on Tab past the last cell of the last row.** Fill row N with N writes and N−1 Tabs; leave via `ArrowDown`.

## Canvas camera apps (WebGL)

The same `userActivation` override + `__interceptor_trust` shape drives WebGL camera apps. Pan with dispatched `MouseEvent` (mousedown → mousemove sweep → mouseup) on the canvas; zoom with `WheelEvent { deltaY: ±120 }` or `Minus` / `Equal` strokes. Pin DOM overlays to lat/lng through a Web Mercator helper (`pixels per deg lng = 256 * 2^zoom / 360`).

## Native export lift (any client-rendered app)

Modern editors export client-side: WebGL/Canvas2D → `Blob` → `URL.createObjectURL` → `<a download>.click()`. Lift bytes sans Save dialog:

1. **Hook `URL.createObjectURL`** in MAIN world logging each blob the app stages.
2. **Hook `HTMLAnchorElement.prototype.click`** swallowing programmatic auto-downloads carrying `download` or `blob:` href.
3. **`fetch(blobUrl).then(r => r.arrayBuffer())`** ahead of app revocation.

## Prove

```bash
interceptor scene text <scene-ref> --context "$INTERCEPTOR_TEST_CONTEXT_ID"          # Re-read the surface
interceptor scene render --context "$INTERCEPTOR_TEST_CONTEXT_ID"                    # Thumbnail for eyeball proof
```

Re-read past each dispatched-event run. Selection/caret can drift where the dispatch script never predicted.
