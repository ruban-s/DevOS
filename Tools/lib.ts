#!/usr/bin/env bun
/**
 * DevOS Tools/lib.ts — shared helpers for the repo-local Setup tools.
 * Convention (mirrors upstream): JSON to stdout, exit 0 = ok (possibly noop),
 * exit 1 = error, exit 2 = dev-tree refusal. No tool writes without `--apply`.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { homedir } from "node:os";

/** The DevOS distribution checkout this tool was loaded from. */
export const SOURCE_ROOT = resolve(join(import.meta.dir, ".."));

export const HARNESS_NAME = "DevOS";

/** Payload entries copied by DeployCore: [sourceRel, destRel-under-DEVOS]. */
export const PAYLOAD: Array<[string, string]> = [
  ["SKILL.md", "SKILL.md"],
  ["RUNTIME", "RUNTIME"],
  ["Tools", "Tools"],
  ["Workflows", "Workflows"],
  ["skills", "skills"],
  ["hooks", "hooks"],
  ["templates", "templates"],
];

/** MEMORY subdirs scaffolded (runtime state, no content). */
export const MEMORY_DIRS = ["WORK", "STATE", "KNOWLEDGE", "LEARNING"];

/** Managed-block markers. Sole definition — pointer detection matches these, never a bare "DEVOS/" mention. */
export const IMPORTS_START = "<!-- devos-managed:imports:start -->";
export const IMPORTS_END = "<!-- devos-managed:imports:end -->";
export const GLOBAL_START = "<!-- devos-managed:global:start -->";
export const GLOBAL_END = "<!-- devos-managed:global:end -->";

const TEXT_EXT = new Set([".md", ".json", ".ts", ".toml", ".sh", ".txt", ".yml", ".yaml", ".py"]);

/** Minimal `--flag` / `--key value` parser. */
export function parseArgs(argv: string[]): { flags: Set<string>; get: (k: string) => string | undefined } {
  const flags = new Set<string>();
  const vals = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) { vals.set(a, next); i++; }
    else flags.add(a);
  }
  return { flags, get: (k: string) => vals.get(k) };
}

export function emit(obj: unknown, code = 0): never {
  console.log(JSON.stringify(obj, null, 2));
  process.exit(code);
}

/** True when `dir` is a DevOS source checkout (never an install target). */
export function isDevTreeCheckout(dir: string): boolean {
  if (existsSync(join(dir, ".devos-source"))) return true;
  // Legacy: snapshot-era checkouts detect via the in-repo reference tree.
  return existsSync(join(dir, "reference", "LifeOS", "install", "install.sh"));
}

export function resolveTarget(raw: string | undefined): string {
  return resolve(raw || process.cwd());
}

export function readHarnessVersion(): string {
  const f = join(SOURCE_ROOT, "RUNTIME", "VERSION");
  if (!existsSync(f)) throw new Error(`harness VERSION missing at ${f} — source checkout incomplete`);
  return readFileSync(f, "utf-8").trim();
}

export interface CopyReport { added: string[]; skipped: string[]; dirsMade: string[] }

interface PairEntry { rel: string; isDir: boolean; exists: boolean; src: string; dest: string }

/** Never deployed: skills carry their own package.json, so a dev install must not ship. */
const NEVER_COPY = new Set(["node_modules", ".git", ".DS_Store"]);

/**
 * The one src→dest recursive walk (copy, dry-run plan, and install preview all
 * ride on it). `exists` is sampled just before each visit, so a visitor that
 * creates dest dirs still sees accurate state for the children below it.
 */
function walkPair(srcRoot: string, destRoot: string, base: string, visit: (e: PairEntry) => void): void {
  const walk = (src: string, dest: string): void => {
    if (!existsSync(src)) return;
    const st = statSync(src);
    if (st.isDirectory()) {
      visit({ rel: relative(base, dest) || ".", isDir: true, exists: existsSync(dest), src, dest });
      for (const e of readdirSync(src).sort()) {
        if (NEVER_COPY.has(e)) continue;
        walk(join(src, e), join(dest, e));
      }
    } else if (st.isFile()) {
      visit({ rel: relative(base, dest), isDir: false, exists: existsSync(dest), src, dest });
    }
  };
  walk(srcRoot, destRoot);
}

/** Recursive existsSync-guarded copy. Never overwrites. Returns repo-relative paths. */
export function copyMissing(srcRoot: string, destRoot: string, base: string = destRoot): CopyReport {
  const rep: CopyReport = { added: [], skipped: [], dirsMade: [] };
  walkPair(srcRoot, destRoot, base, (e) => {
    if (e.isDir) {
      if (!e.exists) { mkdirSync(e.dest, { recursive: true }); rep.dirsMade.push(e.rel); }
    } else if (e.exists) {
      rep.skipped.push(e.rel);
    } else {
      mkdirSync(dirname(e.dest), { recursive: true });
      copyFileSync(e.src, e.dest);
      rep.added.push(e.rel);
    }
  });
  return rep;
}

/** Non-writing dry-run twin of copyMissing: reports would-add vs would-skip. */
export function planCopy(srcRoot: string, destRoot: string, base: string = destRoot): { wouldAdd: string[]; wouldSkip: string[] } {
  const out = { wouldAdd: [] as string[], wouldSkip: [] as string[] };
  walkPair(srcRoot, destRoot, base, (e) => {
    if (e.isDir) { if (!e.exists) out.wouldAdd.push(`${e.rel}/`); }
    else (e.exists ? out.wouldSkip : out.wouldAdd).push(e.rel);
  });
  return out;
}

/** What upsertManagedBlock would do to `path`, without writing. */
export function managedBlockMode(path: string, start: string, end: string): "create" | "refresh" | "append" {
  if (!existsSync(path)) return "create";
  const cur = readFileSync(path, "utf-8");
  return cur.includes(start) && cur.includes(end) ? "refresh" : "append";
}

/** Write `want` between start/end markers: refresh in place, else append, else create with an `# title` heading. */
export function upsertManagedBlock(path: string, start: string, end: string, want: string, title: string): "created" | "refreshed" | "appended" {
  const mode = managedBlockMode(path, start, end);
  if (mode === "create") { writeFileSync(path, `# ${title}\n\n${want}\n`); return "created"; }
  const cur = readFileSync(path, "utf-8");
  if (mode === "refresh") {
    const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`${esc(start)}[\\s\\S]*?${esc(end)}`);
    // Function replacement: block text is data, never a $-pattern for the replacer.
    writeFileSync(path, cur.replace(re, () => want));
    return "refreshed";
  }
  writeFileSync(path, cur.endsWith("\n") ? `${cur}\n${want}\n` : `${cur}\n\n${want}\n`);
  return "appended";
}

/** True when the file carries a DevOS managed pointer block — not merely a mention of the path. */
export function hasDevosPointerBlock(path: string): boolean {
  if (!existsSync(path)) return false;
  try {
    const s = readFileSync(path, "utf-8");
    return s.includes(IMPORTS_START) || s.includes(GLOBAL_START);
  } catch { return false; }
}

/** Substitute known harness tokens in text files under root. Returns changed files (root-relative). */
export function substituteHarnessTokens(root: string, version: string): string[] {
  const vars: Record<string, string> = {
    "{{HARNESS_NAME}}": HARNESS_NAME,
    "{{HARNESS_VERSION}}": version,
  };
  const changed: string[] = [];
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir).sort()) {
      const p = join(dir, e);
      const st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      if (!st.isFile()) continue;
      const dot = e.lastIndexOf(".");
      if (dot < 0 || !TEXT_EXT.has(e.slice(dot))) continue;
      let s = readFileSync(p, "utf-8");
      let hit = false;
      for (const [k, v] of Object.entries(vars)) {
        if (s.includes(k)) { s = s.split(k).join(v); hit = true; }
      }
      if (hit) { writeFileSync(p, s); changed.push(relative(root, p)); }
    }
  };
  walk(root);
  return changed;
}

/** Harness-token survivors under root ({{PROJECT_*}}/{{OWNER_*}} resolve at Spec time — not flagged). */
export function checkHarnessPlaceholders(root: string): { passed: boolean; survivors: Array<{ file: string; token: string }> } {
  const tokens = ["{{HARNESS_NAME}}", "{{HARNESS_VERSION}}"];
  const survivors: Array<{ file: string; token: string }> = [];
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir).sort()) {
      const p = join(dir, e);
      const st = statSync(p);
      if (st.isDirectory()) { if (e !== "reference") walk(p); continue; }
      if (!st.isFile()) continue;
      const dot = e.lastIndexOf(".");
      if (dot < 0 || !TEXT_EXT.has(e.slice(dot))) continue;
      const s = readFileSync(p, "utf-8");
      for (const t of tokens) if (s.includes(t)) survivors.push({ file: relative(root, p), token: t });
    }
  };
  walk(root);
  return { passed: survivors.length === 0, survivors };
}

/** Harness detection for Doctor/Setup branching. Confidence: binary > config-dir > none. */
export function detectHarness(home: string): { name: string; confidence: "high" | "assumed" | "none"; configDir: string } {
  const found = detectAvailableAis(home).filter((h) => h.confidence !== "none");
  // Priority: explicit env override, then Claude (hooks live there), then first hit.
  if (process.env.CLAUDE_CONFIG_DIR && found.some((h) => h.id === "claude")) {
    const c = found.find((h) => h.id === "claude")!;
    return { name: "claude", confidence: c.confidence, configDir: process.env.CLAUDE_CONFIG_DIR };
  }
  const first = found.find((h) => h.id === "claude") || found[0];
  if (!first) return { name: "other", confidence: "none", configDir: join(home, ".claude") };
  return { name: first.id, confidence: first.confidence, configDir: first.configDir };
}

export interface HarnessHit {
  id: string;
  confidence: "high" | "assumed" | "none";
  configDir: string;
  binsFound: string[];
}

/**
 * Machine-wide AI scan: which harnesses are actually available here, by binary
 * on PATH (high) or config dir on disk (assumed). No network — the matrix
 * below encodes what each harness supports (hooks vs pointer file).
 * Pointer files are written at the install root, never into IDE-owned dirs.
 */
export function detectAvailableAis(home: string): HarnessHit[] {
  const has = (bin: string): boolean => { try { return Bun.which(bin) !== null; } catch { return false; } };
  const matrix: Array<{ id: string; bins: string[]; dir: string; pointer: string; hooks: boolean }> = [
    { id: "claude", bins: ["claude"], dir: process.env.CLAUDE_CONFIG_DIR || join(home, ".claude"), pointer: "CLAUDE.md", hooks: true },
    { id: "codex", bins: ["codex"], dir: join(home, ".codex"), pointer: "AGENTS.md", hooks: false },
    { id: "cursor", bins: ["cursor"], dir: join(home, ".cursor"), pointer: "AGENTS.md", hooks: false },
    { id: "copilot", bins: ["copilot", "gh-copilot"], dir: join(home, ".copilot"), pointer: "AGENTS.md", hooks: false },
    { id: "gemini", bins: ["gemini"], dir: join(home, ".gemini"), pointer: "AGENTS.md", hooks: false },
    { id: "cline", bins: ["cline"], dir: join(home, ".cline"), pointer: "AGENTS.md", hooks: false },
    { id: "windsurf", bins: ["windsurf"], dir: join(home, ".windsurf"), pointer: "AGENTS.md", hooks: false },
    { id: "opencode", bins: ["opencode"], dir: join(home, ".config", "opencode"), pointer: "AGENTS.md", hooks: false },
  ];
  return matrix.map((m) => {
    const binsFound = m.bins.filter(has);
    const dirFound = existsSync(m.dir);
    return {
      id: m.id,
      confidence: (binsFound.length > 0 ? "high" : dirFound ? "assumed" : "none") as HarnessHit["confidence"],
      configDir: m.dir,
      binsFound,
    };
  });
}

/** Install pointer filename + hook support for a harness id. Unknown ids degrade to AGENTS.md, no hooks. */
export function harnessInstallProfile(id: string): { pointer: string; hooks: boolean } {
  if (id === "claude") return { pointer: "CLAUDE.md", hooks: true };
  return { pointer: "AGENTS.md", hooks: false };
}

export function homeDir(): string {
  return process.env.HOME || homedir();
}
