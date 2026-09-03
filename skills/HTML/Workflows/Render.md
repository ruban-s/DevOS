# Render Workflow

Convert what this session actually produced into a published, pixel-checked HTML artifact.

## Voice Notification

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Render workflow in the HTML skill to build a designed HTML artifact"}' \
  > /dev/null 2>&1 &
```

Running **Render** in **HTML**...

## Step 0 — Is There Anything Worth Rendering

When the session hasn't produced anything substantive yet (no analysis run, no research gathered, no artifact drafted), say so and ask what should be rendered — never hallucinate content to fill the page. When several candidate outputs are in play, name the one being rendered (`⚠️ Rendering X, not Y; redirect if wrong.`) and carry on.

## Done Looks Like This

- A single self-contained HTML file showing the session's real output — genuine content, quotes kept verbatim, sources and verification flags intact.
- Built by `Tools/Render.ts` from a content JSON. No bespoke one-off CSS. When the material truly won't fit the available block types, extend Render.ts (a new block type or a new register) so future runs inherit the improvement.
- Published as an Artifact and visually confirmed before anyone receives the URL.

## The Tool Contract

```bash
bun DEVOS/skills/HTML/Tools/Render.ts --schema      # content JSON shape + example
bun DEVOS/skills/HTML/Tools/Render.ts --registers   # available registers
bun DEVOS/skills/HTML/Tools/Render.ts \
  --json <content.json> \
  --register <dossier|ledger> \
  --out <artifact.html>
```

Block types: `prose`, `callout`, `quote` (id + badge + quote/text + note + source), `list` (bold lead-ins), `cut` (strikethrough + stamp — for disclosed rejections), `table`, `group` (era/category separators). Badges listed in the register's `badgeSolid` render filled; others outlined.

### Picking a register

| Content | Register |
|---------|----------|
| Evidence file, red team, investigation, claim testing | `dossier` |
| Report, plan, comparison, metrics, finance | `ledger` |
| Same register as the previous artifact this week | pick the other one |

## Publish + Verify (output contract)

1. Load the `artifact-design` skill (required before any Artifact publish), then publish the rendered file with the Artifact tool. Reuse the same file path to update an existing artifact's URL.
2. Verify BOTH legs before handing over the URL:
   - **Publication:** Artifact `list` action shows the artifact.
   - **Render:** serve the HTML file locally (`bunx serve`) and capture it with the Interceptor skill's sanctioned screenshot path; view the pixels. (The artifact URL itself 404s in any browser session not signed into the owner's account — see Gotchas.)
3. Hand over the artifact URL with a one-line description of what it contains.
