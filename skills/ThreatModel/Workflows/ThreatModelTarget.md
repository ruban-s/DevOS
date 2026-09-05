# ThreatModelTarget

Model one target end to end — an app, a service, a data flow, or the full estate.

## Gate Zero — boundary

The target plus its trust edge is required. A wide target ("the whole estate") is legitimate — the pass becomes a portfolio sweep over the heaviest data-bearers. Scope ambiguity that reshapes the work gets one flag, then the pass continues.

## Done Looks Like

One threat picture for the target: **what it is and where trust ends → what material crosses those edges → who would come for it and why → the believable threats (STRIDE reads well as a checklist: spoofing, tampering, repudiation, disclosure, denial, elevation) → which controls already hold → where the holes sit → graded risks waiting in the ledger.** Persisted to the data folder; risks landed with grades.

This path wraps the other two: **SensitiveDataMap** establishes what the target carries, **CompromiseScenario** rehearses each heavy component. ThreatModelTarget binds data plus scenarios plus controls into one ordered picture.

## The Pass (WHAT, not a script)

- Sketch the edge: what sits inside the target, what it trusts, what trusts it (inventory edges).
- Walk threats against every edge crossing and every store. STRIDE per element keeps the pass honest; the `Fabric` skill's `create_threat_model` and STRIDE shapes are available when a structured sweep helps.
- Per believable threat, rule: control holds, control needed, or openly accept. Held threats get noted. The rest become ledger rows with likelihood-times-impact.
- Order by grade. Critical and High rows leave with a named owner and a `review_by`.

## Rails

- Read-only review. No exploitation, no probing, no destructive moves.
- No secret values anywhere. Credentials by name alone.
- Every artifact lands in the data folder (`THREATMODEL_DATA_DIR`).
- Never invent holdings — graphless, state plainly that coverage is operator-enumerated.

## Close

Report the target's trust edges, the headline threats by grade, which stand covered versus open, and the ledger IDs created. Gesture at the scenario notes for the deep cuts.
