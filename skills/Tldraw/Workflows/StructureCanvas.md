# StructureCanvas

Take a human's scattered board — loose notes, boxes, fragments — and write back the organized twin: grouped, framed, linked, nothing dropped.

## Gate Zero — target

Pin the file path and whether the SAME file should change (stock) or a tidy copy should sit beside it. When their editor holds the canvas open, ask for a close or warn of a reopen (SKILL.md Traps — in-memory editors).

## Done Looks Like

- Every human word survives: no shape text is erased or rephrased — organizing means shifting, grouping, framing, and linking, never rewriting their lines. (Fresh summary or label shapes are welcome additions.)
- Kin share titled neighborhoods (frames), set apart from other neighborhoods; cross-group ties draw as labeled arrows.
- The file still clears `Tldr.ts validate`, and `inspect` before and after agrees on user text.
- The reply sketches what was found (groupings, the board's one-line story) — the reading itself counts as output, not just the file change.

## Instrument Shape

```bash
T=DEVOS/skills/Tldraw/Tools/Tldr.ts
bun $T inspect <file.tldr> --json              # full read: shapes, text, positions, edges
bun $T move <file.tldr> --id <id> --x N --y N  # reseat existing shapes
bun $T add <file.tldr> --spec <spec.json>      # frames, arrows, summary labels
bun $T validate <file.tldr>
```

## Safety Rail

Ahead of the first mutation, duplicate the file to `<file>.bak.tldr` alongside and say so — this is someone's authored artifact, and the duplicate is the undo.

## Privacy

A brainstorm board is personal. Read and write locally throughout; never steer a private canvas toward a web surface.
