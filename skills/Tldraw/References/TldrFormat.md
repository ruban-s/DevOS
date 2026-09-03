# .tldr Shape Notes

Numbers below were checked against tldraw 5.2.5: records shaped this way clear `parseTldrawJsonFile` (the loader tldraw itself uses). Canonical container source: `packages/tldraw/src/lib/utils/tldr/file.ts` in the tldraw repo.

## The Wrapper

```json
{
  "tldrawFileFormatVersion": 1,
  "schema": { "schemaVersion": 2, "sequences": { "...": 0 } },
  "records": [ ... ]
}
```

- `schema` steers migrations at load; this skill pins a serialized copy (`SchemaSnapshot.json`) captured from tldraw 5.2.5. Older tldraw surfaces refuse files carrying a NEWER schema; newer surfaces migrate older ones forward. When generated files stop opening after a tldraw major bump, re-capture the schema (see Care below).
- Smallest loadable set: one `document:document` plus one `page:page`. Editors conjure `instance` and `camera` records themselves on open — leave them out.

## The Envelope (all shapes)

```json
{ "id": "shape:<name>", "typeName": "shape", "type": "geo|text|note|frame|arrow",
  "parentId": "page:page", "x": 0, "y": 0, "rotation": 0, "index": "a1",
  "isLocked": false, "opacity": 1, "meta": {}, "props": { ... } }
```

- `index` is a fractional-order token (base62 `0-9A-Za-z`, paint order lexicographic, trailing `0` forbidden).
- Disk records skip editor fill-in — every prop in the table below is mandatory.

## Props Per Kind (tldraw 5.2.5 `getDefaultProps()` values)

| Kind | Props |
|------|-------|
| `geo` | geo, w, h, color, labelColor, fill, dash, size, font, align, verticalAlign, growY, url, scale, richText |
| `text` | color, size, w, font, textAlign, autoSize, scale, richText |
| `note` | color, richText, size, font, align, verticalAlign, labelColor, growY, fontSizeAdjustment, url, scale, textLastEditedBy |
| `frame` | w, h, name, color |
| `arrow` | kind ("arc"), elbowMidPoint, dash, size, fill, color, labelColor, bend, start {x,y}, end {x,y}, arrowheadStart, arrowheadEnd, richText, labelPosition, font, scale |

One binding record per attached end:

```json
{ "id": "binding:<name>", "typeName": "binding", "type": "arrow",
  "fromId": "shape:<arrow>", "toId": "shape:<target>",
  "props": { "isPrecise": false, "isExact": false, "terminal": "start",
             "normalizedAnchor": { "x": 0.5, "y": 0.5 }, "snap": "none" }, "meta": {} }
```

`terminal` (`"start"` or `"end"`) is validator-mandatory even though `ArrowBindingUtil.getDefaultProps()` leaves it out.

## richText

ProseMirror document JSON; one `paragraph` node per line. Bare paragraphs drop `content`.

```json
{ "type": "doc", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "line 1" } ] } ] }
```

## Value Sets

- **color / labelColor**: black, grey, light-violet, violet, blue, light-blue, yellow, orange, green, light-green, light-red, red, white
- **fill**: none, semi, solid, pattern, fill
- **dash**: draw, solid, dashed, dotted
- **size**: s, m, l, xl
- **font**: draw (hand-drawn), sans, serif, mono
- **geo**: rectangle, ellipse, triangle, diamond, pentagon, hexagon, octagon, star, rhombus, oval, trapezoid, arrow-right, arrow-left, arrow-up, arrow-down, x-box, check-box, heart, cloud
- **arrowheadStart / arrowheadEnd**: none, arrow, triangle, square, dot, pipe, diamond, inverted, bar

## What Tldr.ts Accepts as Spec

`add --spec` consumes a JSON **array**; each row:

| kind | Must carry | May carry |
|------|----------|----------|
| `box` | text or name; x, y | w, h, color, fill, geo, dash, size, font, url, name |
| `ellipse` | same as box (geo pinned to ellipse) | — |
| `text` | text; x, y | size, font, color, w (a set w switches autoSize off), textAlign, name |
| `note` | text; x, y | color (stock yellow), size, font, name |
| `frame` | title; x, y, w, h | color, name |
| `arrow` | from, to (names or ids of shapes that already exist) | text, color, bend, dash, size, arrowheadStart, arrowheadEnd, name |

`name` becomes the record id (`shape:<name>`); omit it and one derives from the text. Arrows must trail the shapes they touch (later in the same spec array is fine).

## Placing Things

Page space, y pointing down, origin free. `x,y` marks the shape's top-left. Bound arrows recompute their route off the bound shapes, so their `start` and `end` only matter pre-render.

## Care

After a tldraw upgrade, re-capture the schema: in a scratch folder, `bun add tldraw`, then
`createTLStore({shapeUtils: defaultShapeUtils, bindingUtils: defaultBindingUtils}).schema.serialize()` → overwrite `SchemaSnapshot.json`, and push a generated file through `parseTldrawJsonFile` to confirm.
