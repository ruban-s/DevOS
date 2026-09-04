# Skills port — DevOS v0.2

Curated from `temp/reference/LifeOS/install/skills/` (upstream). Kept skills arrived via mechanical path rewrites (v0.1), then all 37 SKILL.md files were rewritten in original DevOS prose (v0.2 — same capabilities and triggers, restructured sections, own voice; conventions blocks like voice-notify/customization kept as DevOS standards). The v0.2.x debrand program then rewrote all deep reference/workflow docs and skill tools in DevOS prose (branding, user-agent strings, example agent names, and DevOS-inaccurate specifics reframed; behavior unchanged). Upstream `version:` lines were kept through the port and bumped +1 patch on rewrite. Remaining `LifeOS`/`LIFEOS` strings are functional or provenance, not branding: the `ContextSearch.ts` legacy-namespace migration read path, `GlobalInstall.ts`/`lib.ts` sibling-safety interop with on-disk LIFEOS installs, provenance headers in `RUNTIME/ALGORITHM/` and lineage notes in `RUNTIME/*`, and Fabric upstream URLs (third-party project). LICENSE attribution to LifeOS is KEPT (decision locked — MIT "substantial portions" condition applies to this tree; see review 2026-09-04).

## Kept (37)

ApertureOscillation, Apify, ArXiv, BiasCheck, BitterPillEngineering, BrightData, CMUX, Cortex, Council, CreateCLI, CreateSkill, Evals, ExtractWisdom, Fabric, FirstPrinciples, Hardening, HTML, Ideate, Interceptor, ISA, IterativeDepth, Loop, Migrate, Novelty, Optimize, Prompting, RedTeam, Research, RootCauseAnalysis, Science, SuggestSkills, SystemsThinking, ThreatModel, Tldraw, Upgrade, Webdesign, WorldThreatModel.

## Dropped (19)

Aphorisms, Art, AudioEditor, BeCreative, Daemon, DetectAI, Interview, LifeOS, LocalIntelligence, PrivateInvestigator, Remotion, Sales, SecurityMarketData, Teach, Telos, Trim, USMetrics, Vitals, WriteStory.

- Life/personal/content verticals (no dev mapping): Aphorisms, Art, AudioEditor, BeCreative, Daemon, LocalIntelligence, PrivateInvestigator, Remotion, Sales, SecurityMarketData, Teach, USMetrics, Vitals, WriteStory.
- Superseded by DevOS workflows: Interview + Telos (replaced by `Workflows/Spec.md`), LifeOS (the old installer), DetectAI (no mapping to professional software work).
- Trim: orchestrates `ProposalGC.ts` + a USER_DATA repo that don't exist here — port with the v2 memory system.

## Mechanical rewrites applied

`~/.claude/skills/` → `DEVOS/skills/` · `~/.claude/LIFEOS/TOOLS/` → `DEVOS/Tools/` ·
`~/.claude/LIFEOS/RULES/` → `DEVOS/RUNTIME/RULES/` · `~/.claude/LIFEOS/ALGORITHM/` → `DEVOS/RUNTIME/ALGORITHM/` ·
`~/.claude/LIFEOS/MEMORY/` → `DEVOS/MEMORY/` · `~/.claude/LIFEOS/DOCUMENTATION/` → `DEVOS/RUNTIME/DOCS/` (unported — dangling until docs land) ·
`~/.claude/LIFEOS/USER/` → `DEVOS/PROFILE/` (nearest equivalent) · other `~/.claude/LIFEOS/` → `DEVOS/` ·
bare `LIFEOS/TOOLS|RULES|ALGORITHM|MEMORY|DOCUMENTATION|USER/` → same DEVOS targets ·
`skills/<Name>/` → `DEVOS/skills/<Name>/` · env idiom `LIFEOS_DIR|DOWNLOADS|SKILL|CONFIG_DIR` → `DEVOS_*` ·
`{{DA_NAME}}` (no DevOS equivalent) → "the assistant" / "DevOS" by context · `/tmp/pai-screenshots/` → `/tmp/devos-screenshots/`.

## Code fixes (behavior-preserving)

- New `Tools/Inference.ts`: minimal `inference()`/`InferenceLevel` surface for Evals judges (level→model via `DEVOS_MODEL_*`, `claude -p` subprocess). No billing ladder, no executed-model verification — those arrive with multi-rung dispatch.
- Evals tools resolve roots via `$DEVOS_ROOT` → `./DEVOS` → legacy global; results under `DEVOS/MEMORY/STATE/Evals-Results`; user suites under `DEVOS/PROFILE/CUSTOMIZATIONS/…`; live prompt from `RUNTIME/SYSTEM_PROMPT.md` + `PROFILE/OWNER.md`.
- Cortex `ContextSearch.ts`: same root chain (`$DEVOS_ROOT` → repo-local → legacy `LIFEOS` namespace); transcript store stays machine-global.
- ThreatModel `RiskRegister.ts`: `THREATMODEL_DATA_DIR` → `$DEVOS_ROOT` → repo-local `DEVOS/PROFILE/SECURITY/THREATMODEL` → legacy default.
- CMUX `cmux.ts`: Pulse import replaced with `DEVOS_PULSE_BASE` env (empty = voice notify silently skipped; Pulse is v2).

## Known seams (deferred, not broken)

- Cortex references Knowledge tools (`KnowledgeHarvester.ts` etc.) that don't exist yet — doc pointers for the v2 memory system.
- Migrate references `MigrateScan.ts`/`MigrateApprove.ts` (unported) — workflow prose is intact; deterministic approval tooling is v2.
- Upgrade references `Upgrades.ts`/`Reflect.ts`/`GetTranscript.ts` (unported) — source-mining workflows still read; execution legs are v2.
- CreateSkill references `SkillHygieneGate.ts` (unported) — validate by hand until then.
- BitterPillEngineering references `SkillDriftLint.ts` (unported) — audit by hand until then.
- Evals references `ConfigEvalOnChange.ts` (unported) — config-change eval firing is v2.
- Fabric/CreateCLI reference example CLI dirs (`fabric/`, `data/`, `ghcli/`, `md*/`, `notioncli/`) — generated-artifact examples, not missing code.
- CreateSkill doc examples use placeholder skill names (`SkillName`, `MyBlog`, `MyDaemon`, `OSINT`) and dropped-skill paths (`Art/`) — illustrations, not imports.
- `DEVOS/RUNTIME/DOCS/` doesn't exist — doc pointers there dangle until subsystem docs port.
- CreateSkill/Upgrade still speak "OS version"/"OS roll-up" prose — true of DevOS, left as-is.
- Skill `package.json` scopes renamed `@pai/*` → `@devos/*` (v0.2.x debrand).
- Skill `version:` lines are upstream's, not DevOS's — diverge deliberately after 0.1.
