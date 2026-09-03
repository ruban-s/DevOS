#!/usr/bin/env bun
/**
 * GlobalInstall — Phase 7. Installs DevOS into a harness config root
 * (default: ~/.claude) as a SIBLING of any existing LifeOS install:
 * `<configRoot>/DEVOS/`. Never touches LIFEOS/, skills/, or settings.json
 * content — except the two explicitly permissioned, separately-gated writes:
 *   --wire-claude-md : refresh the DevOS pointer block in <configRoot>/CLAUDE.md
 *   --wire-hooks     : merge DEVOS hook entries into <configRoot>/settings.json
 *                      (timestamped backup first, rotation of 5)
 *
 * Harness branching: the tool scans the machine for available AIs (binaries +
 * config dirs, no network) and reports them in every run. On `claude` (high
 * confidence) both wirings are offered; on any other harness the tool writes a
 * pointer file per the harness profile (AGENTS.md) + degrade note and REFUSES
 * --wire-hooks (Claude hooks don't exist there). Pointer files live at the
 * install root, never inside IDE-owned dirs.
 *
 * Dry-run by default. --apply writes. Refuses the source checkout (exit 2).
 *
 * Usage:
 *   bun Tools/GlobalInstall.ts [--config-root <dir>] [--apply] [--allow-dev]
 *                              [--wire-claude-md] [--wire-hooks]
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import {
  PAYLOAD, MEMORY_DIRS, HARNESS_NAME,
  parseArgs, emit, isDevTreeCheckout,
  readHarnessVersion, copyMissing, substituteHarnessTokens,
  checkHarnessPlaceholders, detectHarness, detectAvailableAis,
  harnessInstallProfile, homeDir, SOURCE_ROOT,
} from "./lib";

const CLAUDE_START = "<!-- devos-managed:global:start -->";
const CLAUDE_END = "<!-- devos-managed:global:end -->";

function claudeBlock(): string {
  return `${CLAUDE_START}
## DevOS harness (global install)

DevOS 0.1 lives at \`DEVOS/\` (sibling of LIFEOS — neither touches the other). Harness contract: \`DEVOS/SKILL.md\`; constitution: \`DEVOS/RUNTIME/SYSTEM_PROMPT.md\`; spec format: \`DEVOS/RUNTIME/ISA_FORMAT.md\`. Route DevOS work (setup/spec/doctor/update) through \`DEVOS/SKILL.md\`; repo-local installs additionally carry their own \`DEVOS/\` plus an \`ISA.md\` spec.
${CLAUDE_END}`;
}

function hookEntries(devosDir: string): Array<{ event: string; matcher?: string; command: string; timeout?: number }> {
  const H = join(devosDir, "hooks");
  const bun = (f: string) => `bun ${join(H, f)}`;
  return [
    { event: "PreToolUse", matcher: "Bash", command: bun("AlgorithmNudge.hook.ts") },
    { event: "PostToolUse", matcher: "Write|Edit", command: bun("ISASync.hook.ts") },
    { event: "PostToolUse", matcher: "Write|Edit", command: bun("CheckpointPerISC.hook.ts"), timeout: 30 },
    { event: "UserPromptSubmit", command: bun("AlgorithmNudge.hook.ts") },
    { event: "Stop", command: bun("StopGates.hook.ts") },
  ];
}

/** Same hook if identical command or same hook filename (catches rewires across absolute paths). */
function isSameHook(existing: string, want: string): boolean {
  if (existing === want) return true;
  const file = (c: string): string => {
    const parts = c.trim().split(/\s+/);
    const last = parts[parts.length - 1] || "";
    return last.split("/").pop() || "";
  };
  const f = file(want);
  return f !== "" && file(existing) === f;
}

function main(): void {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const configRoot = get("--config-root") || process.env.CLAUDE_CONFIG_DIR || join(homeDir(), ".claude");
  const apply = flags.has("--apply");
  const allowDev = flags.has("--allow-dev");
  const wireClaudeMd = flags.has("--wire-claude-md");
  const wireHooks = flags.has("--wire-hooks");
  const harness = detectHarness(homeDir());
  const availableAis = detectAvailableAis(homeDir()).filter((h) => h.confidence !== "none");
  const claudeish = harness.name === "claude";
  const devosDir = join(configRoot, "DEVOS");

  if (isDevTreeCheckout(configRoot) && !allowDev) {
    emit({ ok: false, refused: "dev-tree", detail: `${configRoot} is the DevOS source checkout.` }, 2);
  }
  if (wireHooks && !claudeish) {
    emit({ ok: false, error: `refusing --wire-hooks on harness "${harness.name}" — Claude hooks don't exist there (AGENTS.md pointer is the supported mode)` }, 1);
  }

  const missing = PAYLOAD.map(([s]) => s).filter((s) => !existsSync(join(SOURCE_ROOT, s)));
  if (missing.length > 0) emit({ ok: false, error: `source checkout incomplete — missing: ${missing.join(", ")}` }, 1);
  let version = "0.0.0";
  try { version = readHarnessVersion(); } catch (e) { emit({ ok: false, error: String(e) }, 1); }

  // Sibling-safety preflight (both modes): LIFEOS must survive untouched.
  const lifeosPresent = existsSync(join(configRoot, "LIFEOS"));
  const settingsPath = join(configRoot, "settings.json");
  const claudeMdPath = join(configRoot, "CLAUDE.md");
  const settingsExists = existsSync(settingsPath);

  // --- settings.json merge preview (never parses blindly) ---
  let settingsPlan: Record<string, unknown> = { present: settingsExists, wouldBackup: false, entriesToAdd: 0, alreadyWired: 0 };
  let settingsParsed: Record<string, unknown> | null = null;
  if (settingsExists) {
    try {
      settingsParsed = JSON.parse(readFileSync(settingsPath, "utf-8")) as Record<string, unknown>;
    } catch {
      emit({ ok: false, error: `${settingsPath} is not valid JSON — refusing to merge (back up and repair by hand first)` }, 1);
    }
    const hooks = (settingsParsed!["hooks"] || {}) as Record<string, unknown[]>;
    let add = 0, have = 0;
    for (const e of hookEntries(devosDir)) {
      const bucket = (hooks[e.event] || []) as Array<{ matcher?: string; hooks?: Array<{ command?: string }> }>;
      const found = bucket.some((b) => (e.matcher === undefined || b.matcher === e.matcher) &&
        (b.hooks || []).some((h) => typeof h.command === "string" && (isSameHook(h.command, e.command))));
      if (found) have++; else add++;
    }
    settingsPlan = { present: true, wouldBackup: wireHooks && apply, entriesToAdd: add, alreadyWired: have };
  } else if (wireHooks) {
    emit({ ok: false, error: `no settings.json at ${settingsPath} — refusing to create one (create it by hand, then re-run)` }, 1);
  }

  const claudeMdPresent = existsSync(claudeMdPath);
  const claudeMdHasBlock = claudeMdPresent && readFileSync(claudeMdPath, "utf-8").includes(CLAUDE_START);

  if (!apply) {
    const deploy: string[] = [];
    for (const [src, rel] of PAYLOAD) {
      const walk = (s: string, d: string): void => {
        if (!existsSync(s)) return;
        const stat = statSync(s);
        if (stat.isDirectory()) {
          if (!existsSync(d)) deploy.push(`DIR ${d.replace(configRoot + "/", "")}/`);
          for (const e of readdirSync(s).sort()) walk(join(s, e), join(d, e));
        } else if (!existsSync(d)) deploy.push(d.replace(configRoot + "/", ""));
      };
      walk(join(SOURCE_ROOT, src), join(devosDir, rel));
    }
    emit({
      ok: true, dryRun: true, configRoot, harness, version,
      availableAis,
      siblingSafety: { lifeosPresent, lifeosTouched: false },
      wouldDeploy: deploy.slice(0, 30), wouldDeployTotal: deploy.length,
      memoryDirs: MEMORY_DIRS.map((d) => `DEVOS/MEMORY/${d}`),
      claudeMd: { present: claudeMdPresent, hasBlock: claudeMdHasBlock, wouldWrite: wireClaudeMd && (!claudeMdPresent || !claudeMdHasBlock) },
      settings: settingsPlan,
      note: wireHooks
        ? "dry run — settings.json untouched; --apply backs it up (rotation of 5) before merging"
        : "dry run — nothing written; re-run with --apply" + (claudeish ? "" : "; non-Claude harness: AGENTS.md pointer mode, hooks unavailable (by design)"),
    }, 0);
  }

  // --- apply ---
  const added: string[] = [];
  const skipped: string[] = [];
  for (const [src, rel] of PAYLOAD) {
    const rep = copyMissing(join(SOURCE_ROOT, src), join(devosDir, rel), configRoot);
    added.push(...rep.added);
    skipped.push(...rep.skipped);
  }
  for (const d of MEMORY_DIRS) mkdirSync(join(devosDir, "MEMORY", d), { recursive: true });
  const substituted = substituteHarnessTokens(devosDir, version);
  const placeholders = checkHarnessPlaceholders(devosDir);

  const writes: Record<string, string> = {};
  if (wireClaudeMd && (!claudeMdPresent || !claudeMdHasBlock)) {
    const want = claudeBlock();
    if (!claudeMdPresent) {
      writeFileSync(claudeMdPath, `# CLAUDE.md\n\n${want}\n`);
      writes["claudeMd"] = "created";
    } else {
      const cur = readFileSync(claudeMdPath, "utf-8");
      writeFileSync(claudeMdPath, cur.endsWith("\n") ? `${cur}\n${want}\n` : `${cur}\n\n${want}\n`);
      writes["claudeMd"] = "appended";
    }
  } else if (wireClaudeMd) {
    writes["claudeMd"] = "already-wired";
  }

  if (wireHooks && settingsParsed) {
    const hooks = (settingsParsed["hooks"] || {}) as Record<string, Array<{ matcher?: string; hooks?: Array<Record<string, unknown>> }>>;
    const pending = hookEntries(devosDir).filter((e) => {
      const bucket = hooks[e.event] || [];
      return !bucket.some((b) => (e.matcher === undefined || b.matcher === e.matcher) &&
        (b.hooks || []).some((h) => typeof h.command === "string" && isSameHook(h.command, e.command)));
    });
    if (pending.length === 0) {
      writes["settingsMerged"] = "0 entries";
    } else {
      // Timestamped backup first, rotation of 5. Permission for the merge itself
      // comes from the --wire-hooks flag + the workflow's human gate.
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = join(configRoot, "backups");
      mkdirSync(backupDir, { recursive: true });
      copyFileSync(settingsPath, join(backupDir, `settings.json.devos-${stamp}`));
      const existing = readdirSync(backupDir).filter((f) => f.startsWith("settings.json.devos-")).sort();
      for (const old of existing.slice(0, Math.max(0, existing.length - 5))) {
        try { unlinkSync(join(backupDir, old)); } catch { /* best-effort rotation */ }
      }
      writes["settingsBackup"] = `backups/settings.json.devos-${stamp}`;

      let merged = 0;
      for (const e of pending) {
        if (!hooks[e.event]) hooks[e.event] = [];
        const bucket = hooks[e.event];
        const sibling = bucket.find((b) => (e.matcher === undefined || b.matcher === e.matcher) && Array.isArray(b.hooks));
        const entry: Record<string, unknown> = { type: "command", command: e.command };
        if (e.timeout) entry["timeout"] = e.timeout;
        if (sibling) sibling.hooks!.push(entry);
        else bucket.push(e.matcher === undefined ? { hooks: [entry] } : { matcher: e.matcher, hooks: [entry] });
        merged++;
      }
      settingsParsed["hooks"] = hooks;
      writeFileSync(settingsPath, JSON.stringify(settingsParsed, null, 2) + "\n");
      writes["settingsMerged"] = `${merged} entries`;
    }
  }

  if (!claudeish) {
    // Non-Claude harness: pointer file per the harness profile + honest degrade
    // (never hooks). Pointer lives at the install root, never in IDE-owned dirs.
    const profile = harnessInstallProfile(harness.name);
    const agents = join(configRoot, profile.pointer);
    const start = "<!-- devos-managed:global:start -->";
    if (!existsSync(agents) || !readFileSync(agents, "utf-8").includes(start)) {
      const who = harness.name === "other" ? "this machine (no supported AI harness detected)" : harness.name;
      const pointer = `${start}\n## DevOS harness (global install for ${who}, hooks unwired)\n\nDevOS lives at \`DEVOS/\`. Always-on hooks are a Claude-Code mechanism: no hook files were written here and none will fire. Route DevOS work through \`DEVOS/SKILL.md\`; enforcement gates run by hand (\`bun DEVOS/Tools/ISAGate.ts <isa>\`, \`bun DEVOS/Tools/Doctor.ts\`).\n<!-- devos-managed:global:end -->\n`;
      if (!existsSync(agents)) writeFileSync(agents, `# ${profile.pointer}\n\n${pointer}`);
      else {
        const cur = readFileSync(agents, "utf-8");
        writeFileSync(agents, cur.endsWith("\n") ? `${cur}\n${pointer}` : `${cur}\n\n${pointer}`);
      }
      writes["pointerFile"] = `${profile.pointer}:written`;
    } else writes["pointerFile"] = `${profile.pointer}:already-wired`;
  }

  emit({
    ok: true, configRoot, harness, version,
    availableAis,
    siblingSafety: { lifeosPresent, lifeosTouched: false },
    added, skippedExisting: skipped.length, substituted,
    survivingPlaceholders: placeholders, writes,
  }, 0);
}

main();
