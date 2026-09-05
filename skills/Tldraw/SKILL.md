---
name: Tldraw
version: 1.0.1
description: Read, create, and edit tldraw .tldr canvas files deterministically — sketch hand-drawn-style diagrams (boxes, arrows, sticky notes, frames, text) straight into a canvas file the user opens in any tldraw surface, and read a rough canvas back as structured data to organize it. USE WHEN tldraw, .tldr file, whiteboard, canvas, sketch a diagram, hand-drawn diagram, draw this on a canvas, put this on the whiteboard, structure my canvas, organize my whiteboard, read my canvas, cluster my sticky notes. NOT FOR polished static images, infographics, or mermaid diagrams (use Art), web UI design (use Webdesign), programmatic video (use Remotion).
---

# Tldraw

Predictable read and write for tldraw canvases. A `.tldr` file is plain JSON (`{tldrawFileFormatVersion: 1, schema, records}`); `Tools/Tldr.ts` emits records that clear tldraw's own validator, so outputs open cleanly in the web editor, the VS Code tldraw extension, or the desktop app. Two directions: thought → canvas (sketch what was described) and canvas → thought (read a messy human board and give it shape).

## Tailoring

**Before running anything, check for operator overrides at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Tldraw/`

When present, honor any PREFERENCES.md inside (stock canvas folder, favored colors and register, preferred opening surface). Otherwise proceed on defaults.

## Pick Your Path

| Path | Fits when | Doc |
|------|-----------|-----|
| **SketchDiagram** | "sketch this", "put it on a canvas", "tldraw diagram" | `Workflows/SketchDiagram.md` |
| **StructureCanvas** | "tidy my board", "make sense of this canvas", "read my canvas" | `Workflows/StructureCanvas.md` |

## Cheat Sheet

- Instrument: `bun DEVOS/skills/Tldraw/Tools/Tldr.ts <create|inspect|add|remove|move|settext|validate> <file.tldr> [flags]`
- Shape grammar, file grammar, coordinate habits: `References/TldrFormat.md`
- Pinned schema (tldraw 5.2.5): `References/SchemaSnapshot.json`

## Worked Invocations

**Diagram for a post:**
```
User: "Sketch the three-stage pipeline as a hand-drawn diagram"
→ Runs the SketchDiagram path
→ Drafts a spec JSON, runs Tldr.ts create plus add, validates
→ Returns the .tldr path and opening steps; user nudges shapes and exports
```

**Tidy an ideation sprawl:**
```
User: "I dumped ideas on my canvas — structure them"
→ Runs the StructureCanvas path
→ Tldr.ts inspect --json reads every shape's text and placement
→ Groups kin, adds frames plus arrows, seats shapes together
→ User reopens the same file onto the organized version
```

## Traps

- **zsh `echo` corrupts spec JSON** — it turns `\n` inside strings into live newlines and the JSON dies. Write the spec to a file (or `printf '%s'`) and hand `--spec <file>`; the instrument also takes `--spec -` on stdin, but only from a feeder that leaves escapes alone.
- **Labels ride as `richText`, never bare strings** — geo, text, note, and arrow labels are ProseMirror doc JSON (`{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"..."}]}]}`). A raw string prop fails the validator. `Tldr.ts` assembles this; never hand-author a `text` prop.
- **Arrow bindings insist on `terminal: "start"|"end"`** — tldraw's own `ArrowBindingUtil.getDefaultProps()` skips it, yet the schema validator demands it (confirmed against 5.2.5). The instrument sets it; preserve it when hand-editing bindings.
- **Raw records get no editor defaults** — records on disk skip the editor's fill-in pass, so a missing prop (say `growY` on geo) fails on load. Always route through `Tldr.ts add`; never splice hand-built records.
- **Fractional `index` strings order paint** — `index` values (`a1`, `a2`, …) sort base62 lexicographically and must never end in `0`. The instrument mints them; duplicates glitch stacking in the editor.
- **Desktop `.tldraw` saves are a different animal** — the desktop app's native save is a zip (sqlite plus assets plus scripts), not this JSON. This skill targets portable `.tldr` JSON, which the web editor, the VS Code extension, and the desktop app all open or import.
- **Open editors pin files in memory** — when the user holds the canvas open during a disk edit, their surface may skip reload (or clobber the edit on save). Work while closed, or ask for a reopen after the write.

## Opening a Canvas

- **VS Code / Cursor**: the official tldraw extension opens `.tldr` files inside the editor — fully local, the right call for private material.
- **tldraw.com**: File → Open. Pixels travel to a third-party web app — reserve for material already bound for public eyes.
- **Still export**: from any tldraw surface, select all → Export as SVG or PNG. (No headless export ships with this skill.)

## Execution Log

After any path finishes, record one JSONL line:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Tldraw","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```
