import { describe, test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readIsa, gateReport, validateEdges, frontier } from "../Tools/isa";
import { deriveAscent, strip } from "../Tools/ascent";

const GOOD = `---
phase: climbing
progress: 1/3
task: "widget"
slug: t-widget
principal_stated_goal: "ship it"
---

## Goal

Ship it.

## Claims
- [x] ISC-1: Flag parses as JSON.
- [ ] ISC-2: Fields match text output (after: ISC-1).
- [ ] ISC-3: Anti: default output byte-identical.

## Test Strategy
| isc | type | check | threshold | tool | anchors_to |
| ISC-1 | bash | \`cli --json \| jq .\` exits 0 | exit 0 | bash | literal |
| ISC-2 | bash | parity exits 0 | exit 0 | bash | derived: parity |
| ISC-3 | bash | diff empty | empty | bash | literal |
`;

function fixture(name: string, body: string): string {
  const dir = mkdtempSync(join(tmpdir(), "devos-isa-"));
  const p = join(dir, name);
  writeFileSync(p, body);
  return p;
}

describe("readIsa", () => {
  test("parses frontmatter, claims, edges, rows", () => {
    const isa = readIsa(fixture("ISA.md", GOOD));
    expect(isa.phase).toBe("climbing");
    expect(isa.progress).toBe("1/3");
    expect(isa.statedGoal).toBe("ship it");
    expect(isa.claims.map((c) => c.id)).toEqual(["ISC-1", "ISC-2", "ISC-3"]);
    expect(isa.claims[0].checked).toBe(true);
    expect(isa.claims[1].after).toEqual(["ISC-1"]);
    expect(isa.claims[2].anti).toBe(true);
    expect(isa.tsRows).toHaveLength(3);
    expect(isa.tsHasAnchorsCol).toBe(true);
  });

  test("counts fog lines, ignores prose checkboxes", () => {
    const p = fixture("ISA.md", `---
phase: marking
progress: 0/1
---

## Claims
- [ ] ISC-1: Thing works.
- [ ] remember to ask about scope

## Not yet specified
- fog: what about scope — needs a decision
`);
    const isa = readIsa(p);
    expect(isa.claims).toHaveLength(1);
    expect(isa.fogLines).toBe(1);
  });
});

describe("gateReport", () => {
  test("passes a clean ISA", () => {
    const r = gateReport(fixture("ISA.md", GOOD));
    expect(r.blocks).toBe(false);
    expect(r.hard).toHaveLength(0);
  });

  test("blocks non-mechanical progress + fog-at-complete", () => {
    const p = fixture("ISA.md", `---
phase: complete
progress: 2/2
---

## Claims
- [x] ISC-1: Thing works.

## Not yet specified
- fog: leftover — undecided

## Test Strategy
| isc | type | check | threshold | tool |
| ISC-1 | bash | probe exits 0 | exit 0 | bash |
`);
    const r = gateReport(p);
    expect(r.blocks).toBe(true);
    expect(r.hard.map((h) => h.code).sort()).toEqual(["FOG_AT_COMPLETE", "PROGRESS_FORMAT"]);
    expect(r.advisory.map((h) => h.code)).toContain("NO_ANTI");
  });

  test("blocks missing anchors_to when a stated goal exists", () => {
    const p = fixture("ISA.md", `---
phase: climbing
progress: 0/1
principal_stated_goal: "goal here"
---

## Claims
- [ ] ISC-1: Thing works.

## Test Strategy
| isc | type | check | threshold | tool |
| ISC-1 | bash | probe exits 0 | exit 0 | bash |
`);
    const r = gateReport(p);
    expect(r.blocks).toBe(true);
    expect(r.hard[0].code).toBe("ANCHORS_MISSING");
  });
});

describe("validateEdges", () => {
  test("catches unknown blockers, self-refs, cycles", () => {
    const p = fixture("ISA.md", `---
phase: climbing
progress: 0/3
---

## Claims
- [ ] C1: First (after: C2).
- [ ] C2: Second (after: C1).
- [ ] C3: Third (after: GHOST).
`);
    const isa = readIsa(p);
    const problems = validateEdges(isa);
    expect(problems.some((m) => m.includes("GHOST"))).toBe(true);
    expect(problems.some((m) => m.startsWith("cycle:"))).toBe(true);
  });
});

describe("frontier", () => {
  test("closed blockers unblock; locks hold", () => {
    const isa = readIsa(fixture("ISA.md", GOOD));
    const f = frontier(isa, {});
    expect(f.takeable.map((c) => c.id).sort()).toEqual(["ISC-2", "ISC-3"]);
    expect(f.blocked).toHaveLength(0);
    const locked = frontier(isa, { "ISC-2": { session: "s1", ts: new Date().toISOString() } });
    expect(locked.takeable.map((c) => c.id).sort()).toEqual(["ISC-3"]);
    const stale = frontier(isa, { "ISC-2": { session: "s1", ts: new Date(Date.now() - 3 * 3600_000).toISOString() } });
    expect(stale.takeable.map((c) => c.id)).toContain("ISC-2");
  });
});

describe("ascent derivation (single table)", () => {
  test("known phases resolve; legacy stations map; unknown falls back", () => {
    expect(deriveAscent("climbing")).toEqual({ icon: "🧗", label: "Climbing" });
    expect(deriveAscent("verify").label).toBe("Climbing");
    expect(deriveAscent("complete")).toEqual({ icon: "✅", label: "Complete" });
    expect(strip("marking")).toBe("════ DevOS | Algorithm | 🔭 Marking ════");
  });
});

describe("findIsas helper surface", () => {
  test("project + work ISAs discovered", async () => {
    const { findIsas } = await import("../Tools/isa");
    const dir = mkdtempSync(join(tmpdir(), "devos-find-"));
    writeFileSync(join(dir, "ISA.md"), GOOD);
    mkdirSync(join(dir, "DEVOS", "MEMORY", "WORK", "w1"), { recursive: true });
    writeFileSync(join(dir, "DEVOS", "MEMORY", "WORK", "w1", "ISA.md"), GOOD);
    expect(findIsas(dir)).toHaveLength(2);
  });
});
