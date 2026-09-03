---
name: CreateCLI
version: 1.1.25
description: "Generates production-ready TypeScript CLIs via a 3-tier template system (manual arg parsing, Commander.js, oclif), each shipping full implementation, docs, package.json, strict config, JSON output, and exit-code compliance. USE WHEN create CLI, build CLI, command-line tool, wrap API, add command, upgrade tier, TypeScript CLI. NOT FOR DevOS skill scaffolding (use CreateSkill)."
---

## Customization

**Before executing, check for user customizations at:**
`DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/CreateCLI/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the CreateCLI skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **CreateCLI** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# CreateCLI

## What It Does

Produces production-ready TypeScript CLIs in one pass — full implementation, README and QUICKSTART, a Bun package.json, strict tsconfig, deterministic JSON output, correct exit codes. Complexity is matched to the job through three tiers: Tier 1 manual argument parsing with zero dependencies (the right answer most of the time), Tier 2 Commander.js when subcommands arrive, Tier 3 oclif held as a reference point for enterprise scale.

## The Problem

The same arc repeats endlessly: a bash script grows error handling, then help text, then a need for type safety, and finally gets rewritten in TypeScript with docs bolted on afterward. Every lap re-pays the same boilerplate and remakes the same mistakes. This skill collapses the whole arc — one pass, clean and typed and documented, at the tier the job actually needs and no higher.

## Workflow Routing

Route to the appropriate workflow based on the request.

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow in the **CreateCLI** skill to ACTION...
```

| Workflow | Trigger | File |
|----------|---------|------|
| CreateCli | Create a new CLI tool from scratch | `Workflows/CreateCli.md` |
| AddCommand | Add a new command to existing CLI | `Workflows/AddCommand.md` |
| UpgradeTier | Upgrade CLI to higher tier | `Workflows/UpgradeTier.md` |

## When to Activate

**Direct requests:** "Create a CLI for [API/service/tool]", "Build a command-line interface for X", "Make a CLI that does Y", "Generate a TypeScript CLI", "I need a CLI tool for Z".

**Context clues worth acting on:**
- Repetitive API calls being typed out → suggest a CLI
- "I keep typing this command" → suggest a wrapper
- A bash script doing complex work → suggest a TypeScript replacement
- An API with no official CLI → suggest writing one

## The Three Tiers

**Tier 1: llcli-style (DEFAULT — roughly 80% of cases)**
- Manual argument parsing (`process.argv`)
- Zero framework dependencies
- Bun + TypeScript, type-safe interfaces
- ~300-400 lines total
- Fits: API clients, data transformers, simple automation — 2-10 commands, simple flags/values, JSON output, no subcommands

**Tier 2: Commander.js (ESCALATION — roughly 15% of cases)**
- Framework-based parsing, subcommands and nested options
- Auto-generated help, plugin-ready
- Fits: 10+ commands needing grouping, complex nested options, plugin architecture, multiple output formats

**Tier 3: oclif (REFERENCE ONLY — the rare remainder)**
- Documentation only, no templates
- Enterprise-grade plugin systems — Heroku CLI, Salesforce CLI scale

## What Every Generated CLI Ships

1. **Complete implementation** — TypeScript source with full type safety, all commands functional and tested, error handling with proper exit codes, configuration management.
2. **Documentation** — README covering philosophy, usage, and examples; QUICKSTART for common patterns; inline `--help`; API response docs.
3. **Development setup** — package.json (Bun configuration), tsconfig.json (strict), `.env.example`, file permissions configured.
4. **Quality standards** — type-safe throughout, deterministic JSON output, composable (pipes to jq, grep), error messages with context, exit-code compliance.

## DevOS Stack Alignment

Generated CLIs follow DevOS conventions:
- **Runtime:** Bun (NOT Node.js)
- **Language:** TypeScript (NOT JavaScript or Python)
- **Package manager:** Bun (NOT npm/yarn/pnpm)
- **Testing:** Vitest (when tests are added)
- **Output:** deterministic JSON, composable with other tools
- **Docs:** README + QUICKSTART (the llcli pattern)

### Repository Placement

Generated CLIs go to:
- `DEVOS/Tools/[cli-name]/` — personal CLIs (like llcli)
- `~/Projects/[project-name]/` — project-specific CLIs
- `${PROJECTS_DIR}/DEVOS/Examples/clis/` — example CLIs (PUBLIC repo)

**SAFETY:** Always verify repository location before git operations.

### CLI-First Architecture Principles

1. **Deterministic** — same input, same output
2. **Clean** — single responsibility
3. **Composable** — JSON output pipes into other tools
4. **Documented** — comprehensive help and examples
5. **Testable** — predictable behavior

## Extended Context

For detail beyond this file, read:
- `Workflows/CreateCli.md` — main generation workflow (decision tree, 10-step process)
- `Workflows/AddCommand.md` — extending an existing CLI
- `Workflows/UpgradeTier.md` — migrating simple → complex
- `FrameworkComparison.md` — manual vs Commander vs oclif (with research)
- `Patterns.md` — common CLI patterns (from llcli analysis)
- `TypescriptPatterns.md` — type-safety patterns (from tsx, vite, bun research)

## Examples

### Example 1: API Client CLI (Tier 1)

**Request:** "Create a CLI for the GitHub API that can list repos, create issues, and search code"

```
DEVOS/Tools/ghcli/
├── ghcli.ts              # 350 lines, complete implementation
├── package.json          # Bun + TypeScript
├── tsconfig.json         # Strict mode
├── .env.example          # GITHUB_TOKEN=your_token
├── README.md             # Full documentation
└── QUICKSTART.md         # Common use cases
```

```bash
ghcli repos --user exampleuser
ghcli issues create --repo myrepo --title "Bug fix"
ghcli search "typescript CLI"
ghcli --help
```

### Example 2: File Processor (Tier 1)

**Request:** "Build a CLI to convert markdown files to HTML with frontmatter extraction"

```
DEVOS/Tools/md2html/
├── md2html.ts
├── package.json
├── README.md
└── QUICKSTART.md
```

```bash
md2html convert input.md output.html
md2html batch *.md output/
md2html extract-frontmatter post.md
```

### Example 3: Data Pipeline (Tier 2)

**Request:** "Create a CLI for data transformation with multiple formats, validation, and analysis commands"

```
DEVOS/Tools/data-cli/
├── data-cli.ts           # Commander.js with subcommands
├── package.json
├── README.md
└── QUICKSTART.md
```

```bash
data-cli convert json csv input.json
data-cli validate schema data.json
data-cli analyze stats data.csv
data-cli transform filter --column=status --value=active
```

## Quality Gates

Every generated CLI passes these before delivery:

1. **Compilation** — TypeScript compiles clean; strict mode on; no `any` without justification.
2. **Functionality** — every command works as specified; error handling comprehensive; exit codes correct (0 success, 1 error).
3. **Documentation** — README explains philosophy and usage; QUICKSTART has common examples; `--help` comprehensive; all flags and options documented.
4. **Code quality** — type-safe throughout; clean function separation; actionable error messages; configuration externalized.
5. **Integration** — DevOS stack (Bun, TypeScript); CLI-First principles; deterministic output; composable with other tools.

## Philosophy

The skill exists because "I need a CLI for X" should not cost an afternoon. Start at the simplest tier that fits, escalate only with justification, ship complete rather than scaffolded, document the why alongside the how, and keep strict typing non-negotiable. The llcli CLI proved the pattern (327 lines of TypeScript, zero dependencies, complete error handling, production-ready on day one — Limitless.ai API, retired 2026-07-15 when the backend moved to Bee); this skill replicates that result on demand.

## Related Skills

- **development** — complex feature development (not CLI-specific)
- **mcp** — web-scraping CLIs (Bright Data, Apify wrappers)
- **a lifelog skill** — example of a skill built on an official vendor CLI (bee)

## Gotchas

- **Always use bun, never npm/npx.** Zero exceptions per system prompt.
- **TypeScript only.** Never generate Python CLIs unless the user explicitly approves.
- **3-tier system:** start at the simplest tier that fits. Don't over-engineer a Tier 3 CLI when Tier 1 suffices.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"CreateCLI","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> DEVOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.
