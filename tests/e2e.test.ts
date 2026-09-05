import { describe, test, expect, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { IMPORTS_START, GLOBAL_START } from "../Tools/lib";

// End-to-end through the real CLIs on throwaway fixtures (never the checkout).

const REPO = join(import.meta.dir, "..");

async function run(tool: string, args: string[]): Promise<{ json: unknown; code: number }> {
  const proc = Bun.spawn(["bun", join(REPO, "Tools", tool), ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  // exitCode is null only when the process died on a signal — surface that, never mask it as 0.
  return { json: JSON.parse(out), code: proc.exitCode ?? -1 };
}

const made: string[] = [];
afterAll(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function repo(): string {
  const d = mkdtempSync(join(tmpdir(), "devos-e2e-"));
  made.push(d);
  return d;
}

describe("Setup chain", () => {
  test("dry-run writes nothing; apply deploys; re-run idempotent", async () => {
    const target = repo();
    const dry = await run("DeployCore.ts", ["--target", target]);
    expect((dry.json as { ok: boolean }).ok).toBe(true);
    expect(existsSync(join(target, "DEVOS"))).toBe(false);

    const apply = await run("DeployCore.ts", ["--target", target, "--apply"]);
    const a = apply.json as { ok: boolean; added: string[]; survivingPlaceholders: { passed: boolean } };
    expect(a.ok).toBe(true);
    expect(a.added.length).toBeGreaterThan(0);
    expect(a.survivingPlaceholders.passed).toBe(true);
    expect(existsSync(join(target, "DEVOS", "RUNTIME", "SYSTEM_PROMPT.md"))).toBe(true);

    const again = await run("DeployCore.ts", ["--target", target, "--apply"]);
    expect(((again.json as { added: string[] }).added)).toHaveLength(0);
  }, 60_000);

  test("a skill's dev install never ships", async () => {
    const target = repo();
    await run("DeployCore.ts", ["--target", target, "--apply"]);
    const leaked = readdirSync(join(target, "DEVOS", "skills"), { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(target, "DEVOS", "skills", e.name, "node_modules")));
    expect(leaked.map((e) => e.name)).toEqual([]);
  }, 60_000);

  test("source checkout refused without --allow-dev", async () => {
    const r = await run("DeployCore.ts", ["--target", REPO]);
    expect(r.code).toBe(2);
    expect(existsSync(join(REPO, "DEVOS"))).toBe(false);
  }, 30_000);

  test("SeedSpec seeds once, then refuses", async () => {
    const target = repo();
    await run("DeployCore.ts", ["--target", target, "--apply"]);
    const seed = await run("SeedSpec.ts", ["--target", target, "--apply"]);
    expect(((seed.json as { written: string }).written)).toBe("ISA.md");
    const isa = readFileSync(join(target, "ISA.md"), "utf-8");
    expect(isa).toContain("phase: marking");
    expect(isa).not.toContain("{{PROJECT_NAME}}");
    const reseed = await run("SeedSpec.ts", ["--target", target, "--apply"]);
    expect(reseed.code).toBe(1);
  }, 60_000);

  test("ActivateImports creates, then refreshes", async () => {
    const target = repo();
    await run("DeployCore.ts", ["--target", target, "--apply"]);
    const create = await run("ActivateImports.ts", ["--target", target, "--apply"]);
    const c = create.json as { mode: string; pointer: string };
    expect(c.mode).toBe("created");
    // Pointer filename follows the detected harness — assert the contract, not this machine's answer.
    expect(["CLAUDE.md", "AGENTS.md"]).toContain(c.pointer);
    expect(readFileSync(join(target, c.pointer), "utf-8")).toContain("devos-managed:imports");
    const refresh = await run("ActivateImports.ts", ["--target", target, "--apply"]);
    expect(((refresh.json as { mode: string }).mode)).toBe("refreshed");
  }, 60_000);
});

describe("ISAGate + Frontier CLIs", () => {
  const BAD = `---
phase: complete
progress: 1/1
---

## Claims
- [ ] ISC-1: Thing works.

## Not yet specified
- fog: leftover — undecided
`;
  test("gate blocks bad close; frontier claim/release cycle", async () => {
    const target = repo();
    mkdirSync(join(target, "DEVOS", "MEMORY", "WORK", "w"), { recursive: true });
    const isa = join(target, "DEVOS", "MEMORY", "WORK", "w", "ISA.md");
    writeFileSync(isa, BAD);
    const gate = await run("ISAGate.ts", [isa]);
    expect(((gate.json as { blocks: boolean }).blocks)).toBe(true);

    const state = join(target, "DEVOS", "MEMORY", "STATE");
    const c1 = await run("IsaFrontier.ts", ["claim", isa, "--id", "ISC-1", "--session", "s1", "--state-dir", state]);
    expect(((c1.json as { taken: boolean }).taken)).toBe(true);
    const c2 = await run("IsaFrontier.ts", ["claim", isa, "--id", "ISC-1", "--session", "s2", "--state-dir", state]);
    expect(c2.code).toBe(2);
    const rel = await run("IsaFrontier.ts", ["release", isa, "--id", "ISC-1", "--session", "s1", "--state-dir", state]);
    expect(((rel.json as { released: boolean }).released)).toBe(true);
  }, 60_000);
});

interface Scan {
  target: string;
  devosPresent: boolean;
  isaPresent: boolean;
  agentsMd: { present: boolean; hasDevosPointer: boolean };
  claudeMd: { present: boolean; hasDevosPointer: boolean };
  skillCollisions: Array<{ payload: string; existing: string; exact: boolean }>;
  skillsScanned: string;
  needsReconciliation: boolean;
}

// A shipped skill whose name survives a case round-trip — picked from the payload, never hardcoded.
const MIXED_SKILL = readdirSync(join(REPO, "skills")).sort().find((e) => e !== e.toLowerCase())!;

describe("ScanConflicts", () => {
  test("collisions come from DEVOS/skills, not <target>/skills", async () => {
    const target = repo();
    mkdirSync(join(target, "DEVOS", "skills"), { recursive: true });
    mkdirSync(join(target, "skills", MIXED_SKILL), { recursive: true });

    const decoy = (await run("ScanConflicts.ts", ["--target", target])).json as Scan;
    expect(decoy.skillsScanned).toBe(join(target, "DEVOS", "skills"));
    expect(decoy.skillCollisions).toEqual([]);

    mkdirSync(join(target, "DEVOS", "skills", MIXED_SKILL), { recursive: true });
    const hit = (await run("ScanConflicts.ts", ["--target", target])).json as Scan;
    expect(hit.skillCollisions).toEqual([{ payload: MIXED_SKILL, existing: MIXED_SKILL, exact: true }]);
  }, 30_000);

  test("a case-different name still collides, flagged inexact", async () => {
    const target = repo();
    mkdirSync(join(target, "DEVOS", "skills", MIXED_SKILL.toLowerCase()), { recursive: true });
    const r = (await run("ScanConflicts.ts", ["--target", target])).json as Scan;
    expect(r.skillCollisions).toEqual([{ payload: MIXED_SKILL, existing: MIXED_SKILL.toLowerCase(), exact: false }]);
  }, 30_000);

  test("pointer detection needs the marker — a bare DEVOS/ mention is not one", async () => {
    const target = repo();
    writeFileSync(join(target, "AGENTS.md"), "Route harness work through DEVOS/SKILL.md.\n");
    writeFileSync(join(target, "CLAUDE.md"), `# c\n\n${IMPORTS_START}\n@DEVOS/SKILL.md\n`);
    const r = (await run("ScanConflicts.ts", ["--target", target])).json as Scan;
    expect(r.agentsMd).toEqual({ present: true, hasDevosPointer: false });
    expect(r.claudeMd).toEqual({ present: true, hasDevosPointer: true });

    const global = repo();
    writeFileSync(join(global, "AGENTS.md"), `# a\n\n${GLOBAL_START}\n`);
    expect(((await run("ScanConflicts.ts", ["--target", global])).json as Scan).agentsMd.hasDevosPointer).toBe(true);
  }, 30_000);

  test("a clean target needs no reconciliation, and nothing is written", async () => {
    const target = repo();
    const r = await run("ScanConflicts.ts", ["--target", target]);
    expect(r.code).toBe(0);
    const s = r.json as Scan;
    expect(s.target).toBe(target);
    expect(s).toMatchObject({ devosPresent: false, isaPresent: false, needsReconciliation: false });
    expect(s.agentsMd).toEqual({ present: false, hasDevosPointer: false });
    expect(readdirSync(target)).toEqual([]);
  }, 30_000);
});

interface Env {
  os: string;
  arch: string;
  bun: string;
  sourceRoot: string;
  harness: { name: string; confidence: string; configDir: string };
  target: {
    root: string; isSelf: boolean; isDevTree: boolean;
    devosPresent: boolean; isaPresent: boolean; agentsMdPresent: boolean; claudeMdPresent: boolean;
  };
}

describe("DetectEnv", () => {
  test("emits the shape Setup branches on, and exits 0", async () => {
    const target = repo();
    const r = await run("DetectEnv.ts", ["--target", target]);
    expect(r.code).toBe(0);
    const d = r.json as Env;
    expect(d.os).toBe(process.platform);
    expect(d.arch).toBe(process.arch);
    expect(d.bun).toBe(Bun.version);
    expect(d.sourceRoot).toBe(REPO);
    expect(["high", "assumed", "none"]).toContain(d.harness.confidence);
    expect(d.harness.configDir).toStartWith("/");
    expect(d.target).toEqual({
      root: target, isSelf: false, isDevTree: false,
      devosPresent: false, isaPresent: false, agentsMdPresent: false, claudeMdPresent: false,
    });
  }, 30_000);

  test("isSelf marks the checkout; isDevTree is the independent flag", async () => {
    const self = (await run("DetectEnv.ts", ["--target", REPO])).json as Env;
    expect(self.target.root).toBe(self.sourceRoot);
    expect(self.target).toMatchObject({ isSelf: true, isDevTree: true });

    // A dev-tree marker somewhere else is still a dev tree, and still not self.
    const clone = repo();
    writeFileSync(join(clone, ".devos-source"), "");
    const c = (await run("DetectEnv.ts", ["--target", clone])).json as Env;
    expect(c.target).toMatchObject({ isSelf: false, isDevTree: true });
  }, 30_000);

  test("presence flags track the target's files", async () => {
    const target = repo();
    mkdirSync(join(target, "DEVOS"), { recursive: true });
    writeFileSync(join(target, "ISA.md"), "---\nphase: marking\n---\n");
    writeFileSync(join(target, "AGENTS.md"), "x\n");
    const d = (await run("DetectEnv.ts", ["--target", target])).json as Env;
    expect(d.target).toMatchObject({
      devosPresent: true, isaPresent: true, agentsMdPresent: true, claudeMdPresent: false,
    });
  }, 30_000);
});

describe("Doctor", () => {
  test("reports live install on a deployed fixture", async () => {
    const target = repo();
    await run("DeployCore.ts", ["--target", target, "--apply"]);
    await run("ActivateImports.ts", ["--target", target, "--apply"]);
    const doc = await run("Doctor.ts", ["--target", target, "--json"]);
    const d = doc.json as Record<string, { state?: string }>;
    expect(d["devos-install"]?.state).toBe("live");
    expect(d["bun"]?.state).toBe("live");
  }, 60_000);
});
