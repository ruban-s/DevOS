import { describe, test, expect, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { GLOBAL_START, GLOBAL_END } from "../Tools/lib";

// GlobalInstall against throwaway config roots (never ~/.claude, never the checkout).

const REPO = join(import.meta.dir, "..");
const TOOL = join(REPO, "Tools", "GlobalInstall.ts");

const made: string[] = [];
afterAll(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function mk(prefix: string): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  made.push(d);
  return d;
}

interface Box { configRoot: string; env: Record<string, string> }

/**
 * A machine with no AI binaries on PATH, so harness identity follows the fake
 * HOME alone — otherwise the answer would depend on what the dev box has installed.
 */
function box(harness: "claude" | "other"): Box {
  const base = mk("devos-install-");
  const home = join(base, "home");
  const nopath = join(base, "nopath");
  const configRoot = join(base, "root");
  mkdirSync(harness === "claude" ? join(home, ".claude") : home, { recursive: true });
  mkdirSync(nopath, { recursive: true });
  mkdirSync(configRoot, { recursive: true });
  return { configRoot, env: { HOME: home, PATH: nopath } };
}

interface InstallJson {
  ok: boolean;
  dryRun?: boolean;
  error?: string;
  refused?: string;
  configRoot?: string;
  version?: string;
  harness?: { name: string; confidence: string; configDir: string };
  availableAis?: Array<{ id: string; confidence: string; configDir: string; binsFound: string[] }>;
  wouldDeploy?: string[];
  wouldDeployTotal?: number;
  memoryDirs?: string[];
  claudeMd?: { present: boolean; hasBlock: boolean; mode: string | null };
  settings?: { present: boolean; wouldBackup: boolean; entriesToAdd: number; alreadyWired: number };
  siblingSafety?: {
    predecessorPresent: boolean; predecessorPath: string; predecessorEntries: number;
    predecessorTouched?: boolean; predecessorChanged?: string[]; note?: string;
  };
  added?: string[];
  skippedExisting?: number;
  substituted?: string[];
  survivingPlaceholders?: { passed: boolean; survivors: Array<{ file: string; token: string }> };
  writes?: Record<string, string>;
}

function gi(env: Record<string, string>, args: string[]): { code: number; json: InstallJson; stderr: string } {
  // process.execPath rather than "bun": PATH is deliberately empty in these fixtures.
  const r = Bun.spawnSync([process.execPath, TOOL, ...args], { env });
  const out = r.stdout.toString();
  return { code: r.exitCode, json: JSON.parse(out) as InstallJson, stderr: r.stderr.toString() };
}

const hookNames = (settings: Record<string, unknown>): string[] => {
  const hooks = (settings["hooks"] || {}) as Record<string, Array<{ hooks?: Array<{ command?: string }> }>>;
  return Object.values(hooks).flatMap((bucket) => bucket.flatMap((b) => (b.hooks || []).map((h) => String(h.command).split("/").pop())))
    .filter((n): n is string => n !== undefined).sort();
};

describe("GlobalInstall dry run", () => {
  test("reports a plan and writes nothing", () => {
    const { configRoot, env } = box("claude");
    const r = gi(env, ["--config-root", configRoot]);

    expect(r.code).toBe(0);
    expect(r.json.ok).toBe(true);
    expect(r.json.dryRun).toBe(true);
    expect(r.json.harness?.name).toBe("claude");
    expect(r.json.availableAis?.map((a) => a.id)).toEqual(["claude"]);
    expect(r.json.wouldDeployTotal ?? 0).toBeGreaterThan(0);
    expect(r.json.memoryDirs).toEqual(["DEVOS/MEMORY/WORK", "DEVOS/MEMORY/STATE", "DEVOS/MEMORY/KNOWLEDGE", "DEVOS/MEMORY/LEARNING"]);

    expect(readdirSync(configRoot)).toEqual([]);
  }, 60_000);

  test("--wire-claude-md previews a refresh without touching the file", () => {
    const { configRoot, env } = box("claude");
    const md = join(configRoot, "CLAUDE.md");
    const before = `# notes\n\n${GLOBAL_START}\nstale\n${GLOBAL_END}\n`;
    writeFileSync(md, before);

    const r = gi(env, ["--config-root", configRoot, "--wire-claude-md"]);
    expect(r.json.claudeMd).toEqual({ present: true, hasBlock: true, mode: "would-refresh" });
    expect(readFileSync(md, "utf-8")).toBe(before);
  }, 60_000);
});

describe("GlobalInstall apply", () => {
  test("deploys the payload, then is idempotent on re-run", () => {
    const { configRoot, env } = box("claude");
    const first = gi(env, ["--config-root", configRoot, "--apply"]);

    expect(first.code).toBe(0);
    expect(first.json.added?.length ?? 0).toBeGreaterThan(0);
    expect(first.json.survivingPlaceholders?.passed).toBe(true);
    expect(existsSync(join(configRoot, "DEVOS", "RUNTIME", "SYSTEM_PROMPT.md"))).toBe(true);
    expect(existsSync(join(configRoot, "DEVOS", "MEMORY", "STATE"))).toBe(true);
    const version = first.json.version ?? "";
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
    expect(readFileSync(join(configRoot, "DEVOS", "RUNTIME", "VERSION"), "utf-8").trim()).toBe(version);

    const again = gi(env, ["--config-root", configRoot, "--apply"]);
    expect(again.json.added).toHaveLength(0);
    expect(again.json.skippedExisting ?? 0).toBeGreaterThan(0);
  }, 120_000);

  test("source checkout refused without --allow-dev", () => {
    const { env } = box("claude");
    const r = gi(env, ["--config-root", REPO, "--apply"]);
    expect(r.code).toBe(2);
    expect(r.json.refused).toBe("dev-tree");
    expect(existsSync(join(REPO, "DEVOS"))).toBe(false);
  }, 30_000);

  test("non-Claude harness gets an AGENTS.md pointer and no settings.json", () => {
    const { configRoot, env } = box("other");
    const r = gi(env, ["--config-root", configRoot, "--apply"]);

    expect(r.json.harness?.name).toBe("other");
    expect(r.json.writes?.["pointerFile"]).toBe("AGENTS.md:created");
    expect(readFileSync(join(configRoot, "AGENTS.md"), "utf-8")).toContain("hooks unwired");
    expect(existsSync(join(configRoot, "CLAUDE.md"))).toBe(false);
    expect(existsSync(join(configRoot, "settings.json"))).toBe(false);
  }, 60_000);
});

describe("GlobalInstall hook wiring", () => {
  test("--wire-hooks refused on a non-Claude harness, before anything deploys", () => {
    const { configRoot, env } = box("other");
    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-hooks"]);

    expect(r.code).toBe(1);
    expect(r.json.ok).toBe(false);
    expect(r.json.error).toContain("refusing --wire-hooks");
    expect(readdirSync(configRoot)).toEqual([]);
  }, 30_000);

  test("--wire-hooks refuses to create a missing settings.json", () => {
    const { configRoot, env } = box("claude");
    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-hooks"]);

    expect(r.code).toBe(1);
    expect(r.json.error).toContain("refusing to create one");
    expect(readdirSync(configRoot)).toEqual([]);
  }, 30_000);

  test("an unparseable settings.json is refused, never clobbered", () => {
    const { configRoot, env } = box("claude");
    const settings = join(configRoot, "settings.json");
    const junk = '{ "hooks": { broken,,, }';
    writeFileSync(settings, junk);

    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-hooks"]);
    expect(r.code).toBe(1);
    expect(r.json.error).toContain("not valid JSON");
    expect(readFileSync(settings, "utf-8")).toBe(junk);
    expect(existsSync(join(configRoot, "DEVOS"))).toBe(false);
    expect(existsSync(join(configRoot, "backups"))).toBe(false);
  }, 30_000);

  test("merge backs up first, skips an already-wired entry, and keeps foreign keys", () => {
    const { configRoot, env } = box("claude");
    const settings = join(configRoot, "settings.json");
    // Same hook file at a different absolute path — must count as already wired.
    const before = JSON.stringify({
      model: "opus",
      hooks: { Stop: [{ hooks: [{ type: "command", command: "bun /elsewhere/hooks/StopGates.hook.ts" }] }] },
    }, null, 2);
    writeFileSync(settings, before);

    const dry = gi(env, ["--config-root", configRoot, "--wire-hooks"]);
    expect(dry.json.settings).toEqual({ present: true, wouldBackup: false, entriesToAdd: 4, alreadyWired: 1 });

    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-hooks"]);
    expect(r.json.writes?.["settingsMerged"]).toBe("4 entries");

    const backup = r.json.writes?.["settingsBackup"] ?? "";
    expect(backup).toStartWith("backups/settings.json.devos-");
    expect(readFileSync(join(configRoot, backup), "utf-8")).toBe(before);

    const after = JSON.parse(readFileSync(settings, "utf-8")) as Record<string, unknown>;
    expect(after["model"]).toBe("opus");
    expect(hookNames(after)).toEqual([
      "AlgorithmNudge.hook.ts", "AlgorithmNudge.hook.ts", "CheckpointPerISC.hook.ts",
      "ISASync.hook.ts", "StopGates.hook.ts",
    ]);
    const stop = (after["hooks"] as Record<string, unknown[]>)["Stop"] as Array<{ hooks: unknown[] }>;
    expect(stop).toHaveLength(1);
    expect(stop[0].hooks).toHaveLength(1);
    expect(stop[0].hooks[0]).toEqual({ type: "command", command: "bun /elsewhere/hooks/StopGates.hook.ts" });

    const rerun = gi(env, ["--config-root", configRoot, "--apply", "--wire-hooks"]);
    expect(rerun.json.writes?.["settingsMerged"]).toBe("0 entries");
    expect(rerun.json.writes?.["settingsBackup"]).toBeUndefined();
    expect(readdirSync(join(configRoot, "backups"))).toHaveLength(1);
  }, 120_000);

  test("--wire-claude-md refreshes an existing block in place", () => {
    const { configRoot, env } = box("claude");
    const md = join(configRoot, "CLAUDE.md");
    writeFileSync(md, `# my notes\n\nKEEP-THIS-USER-LINE\n\n${GLOBAL_START}\nSTALE-BLOCK-BODY\n${GLOBAL_END}\n\nTRAILING-USER-LINE\n`);

    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-claude-md"]);
    expect(r.json.writes?.["claudeMd"]).toBe("refreshed");

    const after = readFileSync(md, "utf-8");
    expect(after).toContain("KEEP-THIS-USER-LINE");
    expect(after).toContain("TRAILING-USER-LINE");
    expect(after).not.toContain("STALE-BLOCK-BODY");
    expect(after).toContain("DevOS harness (global install)");
    expect(after.split(GLOBAL_START)).toHaveLength(2);
    expect(after.split(GLOBAL_END)).toHaveLength(2);
  }, 60_000);
});

describe("GlobalInstall sibling safety", () => {
  function predecessor(configRoot: string): string {
    const dir = join(configRoot, "LIFEOS");
    mkdirSync(join(dir, "DOCUMENTATION"), { recursive: true });
    writeFileSync(join(dir, "CLAUDE.md"), "# predecessor\n");
    writeFileSync(join(dir, "DOCUMENTATION", "notes.md"), "untouched\n");
    return dir;
  }

  test("predecessorTouched is false when the predecessor tree really is left alone", () => {
    const { configRoot, env } = box("claude");
    const pred = predecessor(configRoot);

    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-claude-md"]);
    expect(r.json.siblingSafety?.predecessorPresent).toBe(true);
    expect(r.json.siblingSafety?.predecessorEntries).toBe(3);
    expect(r.json.siblingSafety?.predecessorTouched).toBe(false);
    expect(r.json.siblingSafety?.predecessorChanged).toEqual([]);

    expect(readFileSync(join(pred, "CLAUDE.md"), "utf-8")).toBe("# predecessor\n");
    expect(readFileSync(join(pred, "DOCUMENTATION", "notes.md"), "utf-8")).toBe("untouched\n");
    expect(readFileSync(join(configRoot, "CLAUDE.md"), "utf-8")).toContain(GLOBAL_START);
  }, 60_000);

  test("predecessorTouched is true when a write reaches the predecessor tree", () => {
    const { configRoot, env } = box("claude");
    const pred = predecessor(configRoot);
    // A symlinked CLAUDE.md routes the pointer write straight into LIFEOS/.
    symlinkSync(join(pred, "CLAUDE.md"), join(configRoot, "CLAUDE.md"));

    const r = gi(env, ["--config-root", configRoot, "--apply", "--wire-claude-md"]);
    expect(r.json.writes?.["claudeMd"]).toBe("appended");
    expect(r.json.siblingSafety?.predecessorTouched).toBe(true);
    expect(r.json.siblingSafety?.predecessorChanged?.join("\n")).toContain("CLAUDE.md");
    expect(readFileSync(join(pred, "CLAUDE.md"), "utf-8")).toContain(GLOBAL_START);
  }, 60_000);
});
