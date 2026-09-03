import { describe, test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// End-to-end through the real CLIs on throwaway fixtures (never the checkout).

async function run(tool: string, args: string[]): Promise<{ json: unknown; code: number }> {
  const proc = Bun.spawn(["bun", join("/Users/else/LifeOS/Tools", tool), ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return { json: JSON.parse(out), code: proc.exitCode };
}

function repo(): string {
  return mkdtempSync(join(tmpdir(), "devos-e2e-"));
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

  test("source checkout refused without --allow-dev", async () => {
    const r = await run("DeployCore.ts", ["--target", "/Users/else/LifeOS"]);
    expect(r.code).toBe(2);
    expect(existsSync("/Users/else/LifeOS/DEVOS")).toBe(false);
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
    expect(((create.json as { mode: string }).mode)).toBe("created");
    expect(readFileSync(join(target, "AGENTS.md"), "utf-8")).toContain("devos-managed:imports");
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
