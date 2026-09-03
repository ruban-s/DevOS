# UpdatePatterns Workflow

Pull the newest Fabric patterns from upstream and sync them into this skill's local `Patterns/` copy, then confirm the sync landed cleanly.

---

## Prerequisites

**The Fabric CLI has to be installed for the primary path.** Pattern updates come from the official fabric repository.

If it isn't installed yet:
```bash
go install github.com/danielmiessler/fabric@latest
```

(If the CLI can't be installed, skip to the manual-git fallback near the end.)

---

## Workflow Steps

### Step 1: Announce the Update

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Updating Fabric patterns from upstream repository"}' \
  > /dev/null 2>&1 &
```

### Step 2: Record the Starting Count

```bash
CURRENT_COUNT=$(ls -1 DEVOS/skills/Fabric/Patterns/ 2>/dev/null | wc -l | tr -d ' ')
echo "Current patterns: $CURRENT_COUNT"
```

### Step 3: Pull Upstream Through the Fabric CLI

The fabric CLI knows how to refresh its own pattern store:

```bash
fabric -U
```

Fresh patterns land in `~/.config/fabric/patterns/`.

### Step 4: Mirror Them Into the Skill

Copy the refreshed store over this skill's local copy:

```bash
rsync -av --delete ~/.config/fabric/patterns/ DEVOS/skills/Fabric/Patterns/
```

### Step 5: Report the Delta

```bash
NEW_COUNT=$(ls -1 DEVOS/skills/Fabric/Patterns/ 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "Pattern update complete!"
echo "Previous count: $CURRENT_COUNT"
echo "New count: $NEW_COUNT"
if [ "$NEW_COUNT" -gt "$CURRENT_COUNT" ]; then
  ADDED=$((NEW_COUNT - CURRENT_COUNT))
  echo "Added: $ADDED new patterns"
fi
```

### Step 6: Confirm the Load-Bearing Patterns Survived

Spot-check the patterns other workflows reach for by name:

```bash
for pattern in extract_wisdom summarize create_threat_model analyze_claims; do
  if [ -d DEVOS/skills/Fabric/Patterns/$pattern ]; then
    echo "✓ $pattern"
  else
    echo "✗ $pattern MISSING"
  fi
done
```

---

## Fallback: Straight Git Sync

When the fabric CLI isn't available, sync from the fabric repository directly:

```bash
# Clone or update fabric repo
cd /tmp
if [ -d fabric ]; then
  cd fabric && git pull
else
  git clone https://github.com/danielmiessler/fabric.git
  cd fabric
fi

# Sync patterns
rsync -av --delete patterns/ DEVOS/skills/Fabric/Patterns/

# Cleanup
cd /tmp && rm -rf fabric
```

---

## Verification

Sanity-check the result after either path:

```bash
# Count patterns
ls -1 DEVOS/skills/Fabric/Patterns/ | wc -l

# List recent additions (if patterns have dates)
ls -lt DEVOS/skills/Fabric/Patterns/ | head -10
```

---

## Output

Report back to the user:
- Previous pattern count
- New pattern count
- Number of patterns added (if any)
- Confirmation that sync completed successfully
