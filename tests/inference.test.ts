import { describe, test, expect, afterAll } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { normalizeLevel } from "../Tools/Inference";

// Pure surface only. Anything that could reach `inference()` runs in a child
// process with an empty PATH: mutating process.env.PATH does NOT restrict
// Bun.spawn's lookup, so only a real child environment is a safe guard.

const TOOL = join(import.meta.dir, "..", "Tools", "Inference.ts");

const made: string[] = [];
afterAll(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function mk(): string {
  const d = mkdtempSync(join(tmpdir(), "devos-inference-"));
  made.push(d);
  return d;
}

const NO_BINARIES = (() => {
  const p = join(mk(), "nopath");
  mkdirSync(p, { recursive: true });
  return p;
})();

describe("normalizeLevel", () => {
  test("every valid level round-trips", () => {
    for (const level of ["low", "medium", "high", "max"] as const) {
      expect(normalizeLevel(level)).toBe(level);
    }
  });

  test("an absent level defaults to medium", () => {
    expect(normalizeLevel(undefined)).toBe("medium");
    expect(normalizeLevel("")).toBe("medium");
  });

  test("an unknown level throws rather than quietly defaulting", () => {
    expect(() => normalizeLevel("ultra")).toThrow("[Inference] unknown level 'ultra' — use low | medium | high | max");
    expect(() => normalizeLevel("LOW")).toThrow(/unknown level/);
    expect(() => normalizeLevel("medium ")).toThrow(/unknown level/);
  });
});

describe("inference guards", () => {
  test("an invalid level rejects before any process is spawned", () => {
    const driver = join(mk(), "drive.ts");
    writeFileSync(driver, [
      `import { inference } from ${JSON.stringify(TOOL)};`,
      `try {`,
      `  await inference({ systemPrompt: "s", userPrompt: "u", level: "turbo" as never });`,
      `  console.log("RESOLVED");`,
      `} catch (e) { console.log("REJECTED " + String(e)); }`,
    ].join("\n"));

    const r = Bun.spawnSync([process.execPath, driver], { env: { PATH: NO_BINARIES } });
    expect(r.stdout.toString().trim()).toStartWith("REJECTED");
    expect(r.stdout.toString()).toContain("unknown level 'turbo'");
  }, 20_000);
});

describe("Inference CLI", () => {
  const run = (args: string[]): { code: number; out: string; err: string } => {
    const r = Bun.spawnSync([process.execPath, TOOL, ...args], { env: { PATH: NO_BINARIES } });
    return { code: r.exitCode, out: r.stdout.toString(), err: r.stderr.toString() };
  };

  test("too few positional arguments exits 2 with usage", () => {
    const r = run([]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("usage: bun Tools/Inference.ts");
    expect(r.out.trim()).toBe("");

    expect(run(["only-a-system-prompt"]).code).toBe(2);
  }, 20_000);

  test("an unknown --level fails loudly instead of falling back to medium", () => {
    const r = run(["--level", "turbo", "system", "user"]);
    expect(r.code).not.toBe(0);
    expect(r.err).toContain("unknown level 'turbo'");
    expect(r.out.trim()).toBe("");
  }, 20_000);
});
