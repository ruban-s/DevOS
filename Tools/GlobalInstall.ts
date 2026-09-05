#!/usr/bin/env bun
/**
 * GlobalInstall — Phase 7. Installs DevOS into a harness config root
 * (default: ~/.claude) as a SIBLING of any existing predecessor install:
 * `<configRoot>/DEVOS/`. Never touches a predecessor `LIFEOS/` dir, skills/,
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
import { join, relative } from "node:path";
import {
  PAYLOAD, MEMORY_DIRS,
  parseArgs, emit, isDevTreeCheckout,
  readHarnessVersion, copyMissing, planCopy, substituteHarnessTokens,
  checkHarnessPlaceholders, detectHarness, detectAvailableAis,
  harnessInstallProfile, homeDir, SOURCE_ROOT,
  GLOBAL_START, GLOBAL_END, managedBlockMode, upsertManagedBlock,
} from "./lib";

function claudeBlock(): string {
  return `${GLOBAL_START}
## DevOS harness (global install)

DevOS lives at \`DEVOS/\` (sibling of any predecessor \`LIFEOS/\` install — neither touches the other). Harness contract: \`DEVOS/SKILL.md\`; constitution: \`DEVOS/RUNTIME/SYSTEM_PROMPT.md\`; spec format: \`DEVOS/RUNTIME/ISA_FORMAT.md\`. Route DevOS work (setup/spec/doctor/update) through \`DEVOS/SKILL.md\`; repo-local installs additionally carry their own \`DEVOS/\` plus an \`ISA.md\` spec.
${GLOBAL_END}`;
}

/**
 * Sorted path+size+mtime lines for a tree — the evidence behind the
 * sibling-safety claim. Unreadable entries digest to a stable marker so a
 * permission quirk reads as "unchanged", never as a spurious touch.
 */
function treeDigest(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    let entries: string[];
    try { entries = readdirSync(dir).sort(); } catch { out.push(`${relative(root, dir)}/<unreadable>`); return; }
    for (const e of entries) {
      const p = join(dir, e);
      const rel = relative(root, p);
      let st;
      try { st = statSync(p); } catch { out.push(`${rel}\t<unstattable>`); continue; }
      if (st.isDirectory()) { out.push(`${rel}/`); walk(p); }
      else out.push(`${rel}\t${st.size}\t${st.mtimeMs}`);
    }
  };
  if (existsSync(root)) walk(root);
  return out;
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

  // Sibling-safety preflight (both modes): a predecessor LIFEOS install must survive untouched.
  const predecessorDir = join(configRoot, "LIFEOS");
  const predecessorPresent = existsSync(predecessorDir);
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
  const claudeMdHasBlock = claudeMdPresent && readFileSync(claudeMdPath, "utf-8").includes(GLOBAL_START);

  if (!apply) {
    const deploy: string[] = [];
    for (const [src, rel] of PAYLOAD) {
      const plan = planCopy(join(SOURCE_ROOT, src), join(devosDir, rel), configRoot);
      deploy.push(...plan.wouldAdd.map((p) => (p.endsWith("/") ? `DIR ${p}` : p)));
    }
    emit({
      ok: true, dryRun: true, configRoot, harness, version,
      availableAis,
      siblingSafety: {
        predecessorPresent, predecessorPath: predecessorDir,
        predecessorEntries: treeDigest(predecessorDir).length,
        note: "dry run writes nothing — no predecessorTouched claim to verify here",
      },
      wouldDeploy: deploy.slice(0, 30), wouldDeployTotal: deploy.length,
      memoryDirs: MEMORY_DIRS.map((d) => `DEVOS/MEMORY/${d}`),
      claudeMd: {
        present: claudeMdPresent, hasBlock: claudeMdHasBlock,
        mode: wireClaudeMd ? `would-${managedBlockMode(claudeMdPath, GLOBAL_START, GLOBAL_END)}` : null,
      },
      settings: settingsPlan,
      note: wireHooks
        ? "dry run — settings.json untouched; --apply backs it up (rotation of 5) before merging"
        : "dry run — nothing written; re-run with --apply" + (claudeish ? "" : `; non-Claude harness: ${harnessInstallProfile(harness.name).pointer} pointer mode, hooks unavailable (by design)`),
    }, 0);
  }

  // --- apply ---
  // Snapshot the predecessor before any write, re-read after: predecessorTouched
  // is measured, never asserted.
  const predecessorBefore = treeDigest(predecessorDir);
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
  if (wireClaudeMd) {
    writes["claudeMd"] = upsertManagedBlock(claudeMdPath, GLOBAL_START, GLOBAL_END, claudeBlock(), "CLAUDE.md");
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
    const who = harness.name === "other" ? "this machine (no supported AI harness detected)" : harness.name;
    const pointer = `${GLOBAL_START}\n## DevOS harness (global install for ${who}, hooks unwired)\n\nDevOS lives at \`DEVOS/\`. Always-on hooks are a Claude-Code mechanism: no hook files were written here and none will fire. Route DevOS work through \`DEVOS/SKILL.md\`; enforcement gates run by hand (\`bun DEVOS/Tools/ISAGate.ts <isa>\`, \`bun DEVOS/Tools/Doctor.ts\`).\n${GLOBAL_END}`;
    const mode = upsertManagedBlock(join(configRoot, profile.pointer), GLOBAL_START, GLOBAL_END, pointer, profile.pointer);
    writes["pointerFile"] = `${profile.pointer}:${mode}`;
  }

  const predecessorAfter = treeDigest(predecessorDir);
  const beforeSet = new Set(predecessorBefore);
  const afterSet = new Set(predecessorAfter);
  const predecessorChanged = [
    ...predecessorBefore.filter((x) => !afterSet.has(x)),
    ...predecessorAfter.filter((x) => !beforeSet.has(x)),
  ];

  emit({
    ok: true, configRoot, harness, version,
    availableAis,
    siblingSafety: {
      predecessorPresent, predecessorPath: predecessorDir,
      predecessorEntries: predecessorBefore.length,
      predecessorTouched: predecessorChanged.length > 0,
      predecessorChanged: predecessorChanged.slice(0, 20),
      evidence: "path+size+mtime digest compared before and after this run's writes",
    },
    added, skippedExisting: skipped.length, substituted,
    survivingPlaceholders: placeholders, writes,
  }, 0);
}

main();
