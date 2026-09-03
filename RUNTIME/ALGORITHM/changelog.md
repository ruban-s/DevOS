# Algorithm changelog

## 0.2.0 — Original DevOS doctrine

- Full rewrite: same run-contract semantics (the gates enforce them), original
  structure and prose (D1–D16 grouped Articulate/Ground/Prove/Preserve).
- Repo-local semantics throughout (`DEVOS/MEMORY/WORK`, `DEVOS/MEMORY/STATE`);
  frontier, gates, and harness matrix folded in as built, not deferred.
- Spend section without rung lineups (those arrive with multi-rung dispatch).

## 0.1.0 — Initial DevOS port

- Ported from LifeOS Algorithm 8.20.2. Rebrand (LifeOS→DevOS) plus path remap only; all 16 claims intact.
- Path map applied: `LIFEOS/TOOLS/*` → `Tools/*`, `LIFEOS/RULES/*` → `RUNTIME/RULES/*`,
  `LIFEOS/DOCUMENTATION/*` → subsystem docs (upstream in the reference snapshot until ported),
  `~/.claude/LIFEOS/ALGORITHM` → repo-local `RUNTIME/ALGORITHM`.
- Identity tokens remapped: `{{PRINCIPAL_NAME}}` → `{{OWNER_NAME}}`, `{{DA_NAME}}` dropped
  (no named-assistant ceremony in DevOS v1).
- Ascent-delta block renamed `<lifeos-ascent-delta>` → `<devos-ascent-delta>`,
  strip `LifeOS | Algorithm` → `DevOS | Algorithm`.
- Dropped: model-rung lineup specifics (MAX/HIGH/MEDIUM, Forge/Max agents, tier aliases,
  `models.ts`/`Inference.ts` contracts) — reintroduce with the harness's own model config
  when multi-rung dispatch lands. Spend doctrine (discovered, not predicted) unchanged.
- Deferred seams (referenced, not yet built): ISA skill workflows
  (Scaffold/Grill/Check/Reconcile), hook auto-wiring (Phase 7), skills
  curation (Phase 6). Built in Phase 5: `Tools/ascent.ts` derivation table,
  `Tools/ISAGate.ts` + `Tools/IsaFrontier.ts`, `hooks/ISASync.hook.ts`
  (work.json mirror + ascent deltas), Stop gates, `Tools/Doctor.ts`.
