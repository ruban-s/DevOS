# CompromiseScenario

Answer "what breaks if asset X falls" against real reach data, then land the findings as ledger risks.

## Announce

```bash
curl -s -X POST http://localhost:31337/notify -H "Content-Type: application/json" \
  -d '{"message": "Running CompromiseScenario in ThreatModel"}' > /dev/null 2>&1 &
```

Running **CompromiseScenario** in **ThreatModel**...

## Gate Zero — target

One concrete asset is required (inventory key, app, domain, worker). When none is given and none can be inferred, ask which asset. Otherwise continue.

## Done Looks Like

A scenario note `Scenarios/<asset-slug>.md` in the data folder that a responder could actually use:

1. **Asset plus trust** — what it is, what it holds (per SensitiveDataMap or fresh classification), what it can TOUCH (credentials, bindings, deploy keys — one trust hop at minimum).
2. **Reach** — dependents and owned items from the inventory, read as derived testimony.
3. **Fall narrative** — believable entry, what the intruder reads, writes, and pivots into, worst plausible outcome.
4. **Spillage** — concrete classes exposed and rough record or system counts.
5. **Sightings** — which signal would catch this (logs, scanners, anomalies), and whether that signal runs today.
6. **Answer** — containment moves, rotation pointers (gesture at the incident-response runbook, never duplicate it), recovery sketch.
7. **Remainder** — what stays at risk after the planned answer.

## Measuring Reach (inventory graph)

```bash
bun DEVOS/ATLAS/Atlas.ts blast   <key>  # inbound: what leans on X
bun DEVOS/ATLAS/Atlas.ts owns    <key>  # outbound: what X owns / would strand
bun DEVOS/ATLAS/Atlas.ts exposed <key>  # credentials X would spill, worst-tier first
```

Plus the stores X can touch — the second half of trust inheritance:

```bash
bun DEVOS/ATLAS/Atlas.ts sql "SELECT a.kind, a.canonical_key FROM edge e JOIN asset a ON a.id=e.dst WHERE e.kind='DEPENDS_ON' AND e.status='active' AND e.src=(SELECT id FROM asset WHERE canonical_key='<key>')"
```

`exposed` together with the DEPENDS_ON lookup settles the "one trust hop" mechanically. Run both ahead of grading impact — a dataless worker routinely inherits a 5 through its bindings.

**When `exposed` shows several worst-tier classes on one asset, that stacking is its own result.** Two credential sets reaching two trust domains from a single box breaks a boundary; file it as a separate risk rather than folding it into the asset's headline grade, because the remedy differs (separate the holdings, not merely rotate them).

**Graph output informs; it does not rule.** For a high-stakes scenario, confirm decisive edges against the provider's authoritative API before treating reach as whole. Graphless, build reach from config and binding inspection and say so. Name the graph's blind spots — vendor-only grants, SSH keys, browser sessions, password vaults — inside the scenario, not as footnotes.

## Grading Into the Ledger

Impact (1-5) follows what the fall SPILLS plus what it TOUCHES, not the asset's footprint:

- 5: keys into many systems, customer records at volume, or financial and health PII
- 4: keys into one data-bearing system, or a private store
- 3: internal-only material, or write access onto a public face
- 2: narrow internal spillage
- 1: public-only material, no pivot

Likelihood (1-5) follows exposure: public route, auth edge strength, patch and credential posture, live detection.

## Landing the Risks

For every genuine risk the scenario exposes:

```bash
bun DEVOS/skills/ThreatModel/Tools/RiskRegister.ts add \
  --title "<short risk>" --threat "<threat>" \
  --assets "<atlas-key>" --data-classes "<classes>" \
  --likelihood <1-5> --impact <1-5> \
  --response "Scenarios/<asset-slug>.md" --review-by <YYYY-MM-DD> \
  --mitigation "<control>"
```

## Rails

- **Read-only.** Rehearse the fall; never run an exploit, probe, or destructive move from a threat-model pass. Live testing belongs to an offensive-security skill.
- No secret values in the note or the ledger.
- Scenario notes and ledger rows persist in the data folder only.

## Close

State the worst plausible outcome, the headline classes at stake, whether detection runs today, and the landed risks (IDs plus grades). Escalate anything critical on the spot.
