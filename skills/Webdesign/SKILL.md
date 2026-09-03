---
name: Webdesign
version: 1.2.4
description: "Design and integrate web interfaces along three paths: DirectDesign (the assistant writes the design inline, guided by the mirrored Anthropic frontend-design doctrine — the default workhorse), native /design + /design-sync Claude Code commands (preferred when the job is code integration and design-system sync), or ClaudeDesign (drive claude.ai/design through Interceptor — experimental visual-review fallback). USE WHEN web design, UI design, create prototype, design system, design sync, redesign site, mockup, landing page, dashboard design, design-to-code, frontend design, polish UI, design audit, brutalist/editorial/retro UI. NOT FOR illustrations/logos (use Art) or video (use Remotion)."
license: Complete terms in LICENSE.txt
---

## Voice Notification (REQUIRED FIRST ACTION)

```bash
curl -s -X POST http://localhost:31337/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Webdesign skill", "voice_enabled": true}' > /dev/null
```

## What It Does

Three routes to finished web UI, one skill. **DirectDesign** has the assistant write the design inline, steered by Anthropic's open-source frontend-design philosophy loaded from a local mirror. **NativeDesignSync** drives Anthropic's first-party `/design` and `/design-sync` Claude Code commands. **ClaudeDesign** drives the `claude.ai/design` web product through the Interceptor skill and folds the result back into the codebase. Default routing: quick in-codebase work → DirectDesign; code-bound integration and design-system sync → the native CLI; explicit web-canvas review → ClaudeDesign.

## Why This Exists

Good web UI normally costs you one of two ways. Visual-first tools deliver polish you then can't get into your real codebase — a handoff gap. Hand-coding integrates cleanly but converges on the same generic defaults every time — flat aesthetics. The failure modes point in opposite directions, and most workflows force you to eat one or the other. This skill keeps both prizes in reach: an inline path with a real aesthetic doctrine loaded when speed and in-codebase iteration matter, a deterministic CLI path when code is the destination, and a visual round-trip when review matters — routed by the shape of the ask.

## How It Works

**Three paths. Pick the one that fits; when intent is ambiguous, name the options and let the user choose — never silently route.** Whatever version of Claude Design is live is the version we drive; nothing is pinned.

### Path 1 — DirectDesign (default workhorse; the assistant writes the design inline)

The assistant writes the design directly with Anthropic's open-source `frontend-design` doctrine in context. The load-bearing content — register list, anti-default rules, type-pair recipes, motion vocabulary, color discipline — is mirrored (MIT-licensed) from `github.com/anthropics/skills/tree/main/skills/frontend-design` into `References/FrontendDesignPhilosophy.md`. Fully self-contained: no browser, no auth, no runtime dependency. This is the path behind every real design this skill has shipped. Workflow: `DirectDesign`.

### Path 2 — Native Claude Design CLI (preferred for code integration + design-system sync)

Anthropic's first-party `/design` and `/design-sync` commands ship inside Claude Code (GA June 2026 on Pro/Max/Team/Enterprise — official: support.claude.com/en/articles/14604416). `/design` creates and edits designs from the terminal; `/design-sync` pulls a codebase's real design system into Claude Design and pushes built changes back. Deterministic and first-party, they supersede the hand-rolled Interceptor handoff-bundle apparatus for anything code-bound. Workflow: `NativeDesignSync`.

### Path 3 — ClaudeDesign via Interceptor (EXPERIMENTAL visual-review fallback)

⚠️ Unverified, currently non-functional. Drives the `claude.ai/design` web canvas through the Interceptor skill for visual-first review. Requires an authenticated claude.ai session in the `interceptor-test` Chrome profile — **not currently logged in** — and the path has **never run end-to-end** (every real run of this skill went through DirectDesign). Use only when the visual web canvas is specifically wanted *and* the one-time login is done first. Workflows: `CreatePrototype`, `ExtractDesignSystem`, `RefinePrototype`, `WebsiteToRedesign`, `ExportToCode`, `IntegrateIntoApp`, `DeployDesign`. Tool: `DriveClaudeDesign.ts`.

### Routing rule

The ask is "a nice design" / "design something" and no path is named:

- **DirectDesign by default** — short, ad-hoc, in-codebase work wants speed and in-context iteration.
- **Native CLI (`/design-sync`)** when the job is syncing a real codebase design system or otherwise code-bound, and the commands are available.
- **ClaudeDesign (Path 3) only** when visual web-canvas review is explicitly requested — and remember the login prerequisite and the unproven status.

## Integration-Aware Operation (CRITICAL)

This skill often runs as a **sub-step of larger site work** — a blog post, an admin dashboard, a marketing page. Invoked from a parent context, it:

- Takes existing-project context as input: framework, token file, component directory, deployment target.
- Emits **diffs / patches against the existing app**, never isolated HTML files.
- Respects existing design tokens and component patterns — overwriting them requires an explicit full-redesign request.
- Routes integration work through `Workflows/IntegrateIntoApp.md`.

Invoked standalone for a greenfield design, it produces a self-contained prototype and optionally scaffolds a new app.

## Customization

User-specific design preferences (color palette, typography, spacing grid, animation timing, framework defaults) live at:

```
DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Webdesign/
├── PREFERENCES.md     # Design tokens, preferred frameworks
├── README.md
└── EXTEND.yaml
```

The skill reads PREFERENCES.md if present and passes those tokens into Claude Design's brief and any downstream handoff bundle. Without a customization layer, the skill defaults to Claude Design's own system-extraction output.

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running **WorkflowName** in **Webdesign**...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **DirectDesign** *(Path 1 — default, the assistant writes inline)* | "make a nice design", "design this directly", "do the design yourself", "design something cool", "frontend aesthetics", "brutalist/editorial/retro/maximalist UI", any short ad-hoc design ask without "prototype" / "mockup" / "claude design" | `Workflows/DirectDesign.md` |
| **NativeDesignSync** *(Path 2 — preferred for code work)* | "/design", "/design-sync", "design sync", "sync design system", "pull design system into Claude Design", "push code back to Claude Design", "native design command" | `Workflows/NativeDesignSync.md` |
| **CreatePrototype** *(Path 3 — experimental, drives claude.ai/design)* | "design a prototype", "create prototype", "mockup", "build a design", "claude design", "use claude.ai/design" | `Workflows/CreatePrototype.md` |
| **ExtractDesignSystem** *(Path 3)* | "extract design system", "pull tokens from", "extract brand" | `Workflows/ExtractDesignSystem.md` |
| **RefinePrototype** *(Path 3)* | "iterate on", "refine", "adjust spacing", "change color" | `Workflows/RefinePrototype.md` |
| **WebsiteToRedesign** *(Path 3)* | "redesign this site", "rebuild this URL", "modernize" | `Workflows/WebsiteToRedesign.md` |
| **ExportToCode** *(Path 3 fallback — prefer `/design-sync`)* | "export to code", "ship to code", "send to Claude Code", "process handoff" | `Workflows/ExportToCode.md` |
| **IntegrateIntoApp** *(Path 3 fallback — prefer `/design-sync`)* | "integrate this into", "patch into the app", "land in existing codebase" | `Workflows/IntegrateIntoApp.md` |
| **DeployDesign** *(Path 3)* | "deploy the design", "ship to production" | `Workflows/DeployDesign.md` |

For code-bound work — export, integration, design-system extraction/sync — **prefer Path 2 (`NativeDesignSync` → `/design-sync`)**. The Path 3 bundle workflows above remain a documented fallback for when you're working from the web canvas, but they are unproven and need the test-profile login.

## Prerequisites (PREFLIGHT)

Path 1 (DirectDesign) needs nothing — no browser, no auth. Path 2 (native CLI) needs a Claude subscription that includes Claude Design plus a current Claude Code (`/update` if the commands don't show). **The checks below apply ONLY to Path 3 (ClaudeDesign via Interceptor):**

1. **Interceptor skill available** — `which interceptor` returns a path. If not, walk the user through `Skill("Interceptor")` setup first.
2. **Authenticated claude.ai session** — the `interceptor-test` Chrome profile must be logged into claude.ai. Verify at run time: an unauthenticated profile hits the marketing wall, not the app. If it isn't logged in, a one-time headed login is required before any Path 3 workflow can run.
3. **Claude Design access** — the subscription must include Claude Design (Pro, Max, Team, or Enterprise with admin opt-in).
4. **For `IntegrateIntoApp`**: the parent-project path and a framework identifier (next, astro, vitepress, vite-react, vue, vanilla) passed in context.

Missing prerequisite → halt with a clear remediation step. Never silently fall back.

## Gotchas

Accumulate lessons here. Information density is highest in gotchas.

- **Three paths, one skill.** DirectDesign writes inline from `References/FrontendDesignPhilosophy.md`; NativeDesignSync uses the first-party CLI; ClaudeDesign (CreatePrototype et al.) drives `claude.ai/design`. Don't conflate them — when intent is ambiguous, surface the choices by name and let the user pick. Never silently route.
- **Native-first — code and tokens are the source of truth; Figma is not a dependency.** Import a design system by linking the repo (Claude Design reads real components and tokens from code) or uploading token/component files — never a `.fig` export. No Figma round-trip in either direction (design → `.fig`, or code → editable Figma frames). The bet: design lives in the codebase, not in an interchange file. A no-repo visual-review need is solved with a URL/screenshot share, not by coupling this skill to Figma.
- **DirectDesign is self-contained.** The aesthetic doctrine lives in `References/FrontendDesignPhilosophy.md` (mirrored from the anthropics/skills MIT source). No runtime dependency on the upstream `frontend-design` Claude Code plugin — DirectDesign works in any DevOS environment.
- **Native `/design` + `/design-sync` are the code-bound path now (CONFIRMED).** Both commands are documented officially (support.claude.com/en/articles/14604416), GA on Pro/Max/Team/Enterprise as of June 2026. `/design-sync` syncs codebase↔design-system bidirectionally — use it instead of the Interceptor handoff-bundle apparatus for anything code-bound. Still no public REST API or MCP server; the CLI commands are the programmatic surface. If they don't appear, run `/update`.
- **Path 3 is unproven and currently blocked.** Never run end-to-end — every real run used DirectDesign. The `interceptor-test` profile isn't logged into claude.ai, so `DriveClaudeDesign.ts` reaches the marketing wall, not the app. The tool targets controls by accessibility-tree heuristics (composer by `role=textbox`/contenteditable, send by `/send|submit/`, export by `/export/`), so a moved button is NOT the blocker — the missing auth and the native-CLI supersession are. To vet Path 3: log the test profile in once, then one supervised run.
- **Real Chrome required.** Use the Interceptor skill — the only sanctioned browser automation in DevOS. Claude Design's UI depends on claude.ai's full session state; CDP-based automation trips bot detection and drops session cookies.
- **Handoff bundles are directories, not files.** A bundle holds `PROMPT.md`, optional `tokens.json`, `components/`, `assets/`, and framework-specific scaffolding. The whole directory is the unit.
- **The `frontend-design` plugin auto-activates.** When a handoff bundle is fed to Claude Code, the plugin (already in the official marketplace) picks up the frontend work on its own — do NOT invoke it manually.
- **Design-system extraction happens during onboarding.** For a codebase you want Claude Design to understand, run `ExtractDesignSystem` FIRST, before `CreatePrototype` — otherwise Claude Design falls back to generic defaults and overrides your tokens.
- **Integration ≠ overwrite.** `IntegrateIntoApp` produces diffs on top of existing code. A full redesign that replaces existing UI must be flagged explicitly and confirmed.
- **Canva exports are editable.** Routing a design to a non-developer (marketer, founder) goes through `Workflows/ExportToCode.md` with `--format canva`.
- **No real-time collaboration.** Unlike Figma there is no multiplayer editing — share via URL export for async review.
- **Enterprise gate.** An admin must enable Claude Design in Organization settings before the palette icon appears in claude.ai.
- **Session quotas.** Generation is token-heavy. Since the June 2026 update, usage draws from one pool shared with claude.ai chat, Claude Code, and Cowork — no separate quota. Pro runs thin for sustained design work; Max recommended.
- **Design-system-first is the token fix.** The biggest sink is re-inferring the brand on every pass and then correcting it. Run `ExtractDesignSystem` once; every later generation reuses the fixed reference instead of guessing. Fewer correction cycles = far fewer tokens over a project's life — the single highest-leverage move against quota burn.
- **Output fidelity ≠ production-ready.** Claude Design produces polished visuals; the hand-off code usually still needs a verification and a11y pass. Run `Tools/VerifyDesign.ts` after integration.
- **Vision doesn't guess.** If the brief doesn't state responsive breakpoints, contrast requirements, or dark-mode behavior, Claude Design picks defaults that may not match the target app. Be explicit.

## Examples

**Example 1: Create a prototype from a brief**
```
User: "Design a pricing page for an AI security startup — editorial aesthetic, dark only"
→ Invokes CreatePrototype workflow
→ Preflight: Interceptor + authenticated claude.ai session
→ Composes brief with explicit aesthetic, constraints, differentiation
→ Drives claude.ai/design via Tools/DriveClaudeDesign.ts
→ Screenshots output, verifies a11y via Tools/VerifyDesign.ts
→ Returns bundle path + preview URL
```

**Example 2: Land a Claude Design prototype inside an existing Astro app**
```
User: "Integrate this prototype into ~/Projects/landing — it's an Astro site"
→ Invokes IntegrateIntoApp workflow
→ Audits target project (framework, tokens, components)
→ Runs ExtractDesignSystem first to prime Claude Design with app's real tokens
→ Translates prototype to Astro conventions via frontend-design plugin
→ Produces unified diff against the working tree
→ Pauses for human review before applying
→ Applies patch on a branch, runs tests, screenshots in-context
```

**Example 3: Redesign an existing live site**
```
User: "Redesign example.com — modernize, keep the copy, make it brutalist"
→ Invokes WebsiteToRedesign workflow
→ Captures current state (screenshot + HTML + tokens)
→ Writes critique (what works, what's dated, what to preserve)
→ Composes rebuild brief with explicit aesthetic and preserve list
→ Drives Claude Design with critique + original screenshot as input
→ Iterates via RefinePrototype until satisfied
→ Hands off to IntegrateIntoApp or ExportToCode
```

## File Organization

```
DEVOS/skills/Webdesign/
├── SKILL.md                          # This file — routing + gotchas
├── README.md                         # Public-facing intro
├── Workflows/
│   ├── DirectDesign.md               # Path 1 — the assistant writes inline (no claude.ai round-trip)
│   ├── CreatePrototype.md            # Path 3 — drives claude.ai/design
│   ├── ExtractDesignSystem.md
│   ├── RefinePrototype.md
│   ├── WebsiteToRedesign.md
│   ├── ExportToCode.md
│   ├── IntegrateIntoApp.md
│   └── DeployDesign.md
├── Tools/
│   ├── DriveClaudeDesign.ts          # Interceptor wrapper for claude.ai/design
│   ├── ProcessHandoffBundle.ts       # Parse bundle → structured brief
│   └── VerifyDesign.ts               # Screenshot + a11y probe
└── References/
    ├── FrontendDesignPhilosophy.md   # Aesthetic doctrine — load-bearing for DirectDesign (MIT-attributed mirror)
    ├── ClaudeDesignCapabilities.md   # What Claude Design does / doesn't do
    ├── InputFormats.md               # Prompt patterns, codebase prep
    ├── ExportFormats.md              # html / pdf / pptx / canva / url / bundle
    └── HandoffBundleSpec.md          # Bundle structure for Claude Code handoff
```

## Execution Log


```json
{"ts":"ISO8601","workflow":"CreatePrototype","brief":"one-line","outputs":["path1","path2"],"duration_s":42}
```

This log is read-only metadata; it is not part of the public skill distribution.
