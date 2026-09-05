# SensitiveDataMap

Chart which estate assets carry sensitive material. Output lands in the private data folder.

## Gate Zero — scope

When the boundary is fuzzy (whole estate versus one app versus one provider) and the choice reshapes the answer, raise one ambiguity flag and continue on "whole estate through the inventory graph." `proceed` accepts.

## Done Looks Like

An `EstateDataMap.md` inside the data folder where **every data-bearing asset carries its classes plus the reasoning**, and **every unsortable asset appears by name as unclassified — never skipped, never presumed innocent.** (The name is `EstateDataMap` on purpose: `DOCUMENTATION/Security/DataClassification.md` is a separate paper two enforcement hooks read, and sharing the name once hid both.) The map feeds impact grading in scenarios and the ledger.

Working class set (widen per `PREFERENCES.md`): `credentials` · `pii` · `financial` · `health` · `customer-data` · `source-private` · `internal-only` · `public`.

## Where Truth Comes From

With an inventory graph available, start there:

```bash
bun DEVOS/ATLAS/Atlas.ts sql "SELECT kind, key, attrs FROM asset WHERE kind IN ('worker','domain','d1','r2','kv','repo','project')"
bun DEVOS/ATLAS/Atlas.ts sql "SELECT key FROM asset WHERE kind IN ('d1','r2','kv')"   # stores first
```

Graphless runs enumerate from operator-named assets plus repo and config reading, and the output says plainly that coverage is operator-enumerated rather than graph-complete.

## Rails

- **Secret values never appear** — name credential stores by key alone.
- **Unclassified is a verdict, not an omission.** Whatever cannot be sorted from evidence is tagged `unclassified` and queued for follow-up.
- Stores (databases, buckets, KV) and credential-bearing assets sort FIRST — they anchor every later impact grade.
- Persist inside the data folder only (`THREATMODEL_DATA_DIR`, stock `DEVOS/PROFILE/SECURITY/THREATMODEL/`). Nothing enters the skill tree.

## Close

Report tallies per class, the most sensitive assets, and the unclassified roll by name. Offer a CompromiseScenario pass over the heaviest data-bearers, and offer to land durable items in the ledger.
