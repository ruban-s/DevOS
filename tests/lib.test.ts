import { describe, test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  copyMissing, planCopy, substituteHarnessTokens,
  checkHarnessPlaceholders, isDevTreeCheckout, SOURCE_ROOT,
} from "../Tools/lib";

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "devos-lib-"));
}

describe("copyMissing", () => {
  test("copies missing, never overwrites", () => {
    const base = tmp();
    const src = join(base, "src"), dst = join(base, "dst");
    mkdirSync(join(src, "sub"), { recursive: true });
    writeFileSync(join(src, "a.txt"), "new");
    writeFileSync(join(src, "sub", "b.txt"), "b");
    mkdirSync(dst, { recursive: true });
    writeFileSync(join(dst, "a.txt"), "existing");

    const r1 = copyMissing(src, dst, base);
    expect(r1.added).toContain(join("dst", "sub", "b.txt"));
    expect(r1.skipped).toContain(join("dst", "a.txt"));
    expect(readFileSync(join(dst, "a.txt"), "utf-8")).toBe("existing");

    const r2 = copyMissing(src, dst, base);
    expect(r2.added).toHaveLength(0);
  });
});

describe("planCopy", () => {
  test("reports without writing", () => {
    const base = tmp();
    const src = join(base, "src"), dst = join(base, "dst");
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, "a.txt"), "x");
    const plan = planCopy(src, dst, base);
    expect(plan.wouldAdd.join(" ")).toContain("a.txt");
    expect(existsSync(dst)).toBe(false);
  });
});

describe("harness tokens", () => {
  test("substitutes known tokens; flags only harness survivors", () => {
    const root = tmp();
    writeFileSync(join(root, "a.md"), "v={{HARNESS_VERSION}} n={{HARNESS_NAME}} p={{PROJECT_NAME}}");
    const changed = substituteHarnessTokens(root, "0.1.0");
    expect(changed).toHaveLength(1);
    const after = readFileSync(join(root, "a.md"), "utf-8");
    expect(after).toContain("0.1.0");
    expect(after).toContain("{{PROJECT_NAME}}");
    const check = checkHarnessPlaceholders(root);
    expect(check.passed).toBe(true); // project/owner tokens are Spec-time, not flagged
  });
});

describe("isDevTreeCheckout", () => {
  test("source checkout detected; tmp is not", () => {
    expect(isDevTreeCheckout(SOURCE_ROOT)).toBe(true);
    expect(isDevTreeCheckout(tmp())).toBe(false);
  });
});
