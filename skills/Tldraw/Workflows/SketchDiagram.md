# SketchDiagram

Draw a diagram as a `.tldr` canvas in the hand-drawn tldraw register — the sketchy counterpart to polished generated art.

## Gate Zero — brief

Before placing anything, settle: what the diagram must say, roughly how many pieces, and where the file belongs (stock: a `Canvases/` folder per operator taste, else the live project). When a reading fork would reshape the drawing, flag it in one line (`⚠️ Picking X over Y because R; redirect if wrong.`) and continue on the best default.

## Done Looks Like

- A `.tldr` file sits at the agreed path, clears `Tldr.ts validate`, and carries the whole diagram — every named concept is a shape, every relationship an arrow, nothing spare.
- Flow reads left-to-right or top-to-bottom in sequence; shapes keep clear of each other; kin sit visibly together (nearness or a frame).
- The reply gives the file path plus opening steps (SKILL.md § Opening a canvas), local-first for private material.

## Instrument Shape

```bash
T=DEVOS/skills/Tldraw/Tools/Tldr.ts
bun $T create <file.tldr> [--title "Heading"]
bun $T add <file.tldr> --spec <spec.json>     # spec: JSON array, kinds: box, ellipse, text, note, frame, arrow
bun $T validate <file.tldr>
bun $T inspect <file.tldr>                    # confirm what truly landed
```

Spec grammar plus the full prop tables: `../References/TldrFormat.md`.

## Placement Habits (confirmed practice)

- Stock boxes run 220×120; hold ≥140 px sideways and ≥100 px vertical clearance so bound arrows breathe.
- Arrows name shapes by `name` and attach on their own — seat the boxes first (or earlier in the same spec array, boxes ahead of arrows).
- Color carries meaning: hold to 2–4 values from the TldrFormat enum; reserve `fill: "solid"` for the shapes meant to shout.
- A `frame` titles a neighborhood; one frame per cluster beats stray labels.

## Closing Gate

`validate` green plus `inspect` matching the intended shape-and-edge roll settles the claim. Rendered pixels stay out of reach here — say it outright: report "validated structurally; open it to eyeball the layout", never "it looks good".
