import { describe, test, expect, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { run as verificationGate } from "../hooks/VerificationGate.hook";

// The hook CLIs on throwaway fixtures (never the checkout).

const HOOKS = join(import.meta.dir, "..", "hooks");

const made: string[] = [];
afterAll(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });

function tmp(prefix: string): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  made.push(d);
  return d;
}

async function runHook(file: string, payload: object, env?: Record<string, string>): Promise<{ out: string; err: string; code: number | null }> {
  const proc = Bun.spawn(["bun", join(HOOKS, file)], {
    stdin: new TextEncoder().encode(JSON.stringify(payload)),
    stdout: "pipe",
    stderr: "pipe",
    env: env ? { ...process.env, ...env } : undefined,
  });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  await proc.exited;
  return { out, err, code: proc.exitCode };
}

// ---------------------------------------------------------------- transcripts

const userMsg = (text: string) => ({ type: "user", message: { role: "user", content: text } });
const toolUse = (name: string, input: object) => ({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", name, input }] } });
const toolResult = () => ({ type: "user", message: { role: "user", content: [{ type: "tool_result", content: "ok" }] } });
const say = (text: string) => ({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text }] } });

function transcript(lines: object[]): string {
  const f = join(tmp("devos-hooks-tr-"), "transcript.jsonl");
  writeFileSync(f, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  return f;
}

type Decision = { decision?: string; reason?: string } | null;

async function grade(lines: object[]): Promise<Decision> {
  return (await verificationGate({ transcript_path: transcript(lines) })) as Decision;
}

describe("VerificationGate", () => {
  test("T1 — done-claim with no tool call THIS TURN blocks, despite an earlier turn's evidence", async () => {
    const d = await grade([
      userMsg("build it"),
      toolUse("Bash", { command: "curl -sS http://localhost:8787/" }),
      toolResult(),
      say("Built."),
      userMsg("so are we good?"),
      say("Yes — it is done and working."),
    ]);
    expect(d?.decision).toBe("block");
    expect(d?.reason).toContain("T1");
  });

  test("a probe in the current turn passes", async () => {
    const d = await grade([
      userMsg("check the page"),
      toolUse("Bash", { command: "curl -sS https://example.com/ -o /dev/null -w '%{http_code}'" }),
      toolResult(),
      say("The page is live and the deploy works."),
    ]);
    expect(d).toBeNull();
  });

  test("T2 — a probe from an EARLIER turn does not satisfy a later web claim", async () => {
    const d = await grade([
      userMsg("check the page"),
      toolUse("Bash", { command: "curl -sS https://example.com/" }),
      toolResult(),
      say("Looks fine."),
      userMsg("now change the header"),
      toolUse("Edit", { file_path: "/tmp/app/header.tsx" }),
      toolResult(),
      say("The page renders correctly — deployed and working."),
    ]);
    expect(d?.decision).toBe("block");
    expect(d?.reason).toContain("T2");
  });

  test("T2 — `latest` is not a test: a log read is not a probe", async () => {
    const d = await grade([
      userMsg("ship the ui"),
      toolUse("Bash", { command: "cat latest.log" }),
      toolResult(),
      say("The UI is fixed and the page is live."),
    ]);
    expect(d?.decision).toBe("block");
    expect(d?.reason).toContain("T2");
  });

  test("a real test run in the current turn is a probe", async () => {
    const d = await grade([
      userMsg("ship the ui"),
      toolUse("Bash", { command: "bun test tests/" }),
      toolResult(),
      say("The UI is fixed and the page is live."),
    ]);
    expect(d).toBeNull();
  });

  test("no findable turn boundary — no opinion", async () => {
    const d = await grade([say("Everything is done and the site is live.")]);
    expect(d).toBeNull();
  });

  test("no done-claim — no opinion", async () => {
    const d = await grade([userMsg("hi"), say("Here is what I would try next.")]);
    expect(d).toBeNull();
  });
});

// ----------------------------------------------------- ISAGate shim + StopGates

const BLOCKING_ISA = `---
phase: complete
progress: 1/1
---

## Claims
- [ ] ISC-1: Thing works.

## Not yet specified
- fog: leftover — undecided
`;

const CLEAN_ISA = `---
phase: complete
progress: 1/1
principal_stated_goal: "ship it"
---

## Claims
- [x] ISC-1: Anti: nothing regresses.

## Test Strategy
| claim | type | check | threshold | tool | anchors_to |
| ISC-1 | bash | probe exits 0 | exit 0 | bash | literal |
`;

/** An ISA.md fixture; `body: null` makes it a DIRECTORY, which makes gateReport throw. */
function isaFile(body: string | null): string {
  const p = join(tmp("devos-hooks-gate-"), "ISA.md");
  if (body === null) mkdirSync(p, { recursive: true });
  else writeFileSync(p, body);
  return p;
}

const editIsa = (isa: string) => toolUse("Edit", { file_path: isa });

describe("ISAGate CLI shim", () => {
  const gate = (lines: object[], env?: Record<string, string>) =>
    runHook("ISAGate.hook.ts", { transcript_path: transcript(lines) }, env);

  test("blocks when an ISA closed this session has hard violations", async () => {
    const isa = isaFile(BLOCKING_ISA);
    const r = await gate([userMsg("close it"), editIsa(isa), toolResult(), say("Set to complete.")]);
    expect(r.code).toBe(0);
    const d = JSON.parse(r.out) as { decision: string; reason: string };
    expect(d.decision).toBe("block");
    expect(d.reason).toContain("PROGRESS_FORMAT");
    expect(d.reason).toContain("FOG_AT_COMPLETE");
    expect(d.reason).toContain(isa);
  }, 20_000);

  test("stays silent on a clean close, and on an ISA nobody edited", async () => {
    const clean = await gate([userMsg("close it"), editIsa(isaFile(CLEAN_ISA)), toolResult(), say("Closed.")]);
    expect(clean.code).toBe(0);
    expect(clean.out.trim()).toBe("");

    const untouched = await gate([userMsg("hi"), toolUse("Read", { file_path: isaFile(BLOCKING_ISA) }), toolResult(), say("Read it.")]);
    expect(untouched.out.trim()).toBe("");
  }, 20_000);

  test("ISAGATE_OFF=1 disarms the shim", async () => {
    const isa = isaFile(BLOCKING_ISA);
    const lines = [userMsg("close it"), editIsa(isa), toolResult(), say("Set to complete.")];
    expect((await gate(lines, { ISAGATE_OFF: "1" })).out.trim()).toBe("");
  }, 20_000);

  test("fails open — an unreadable ISA never breaks the turn", async () => {
    const r = await gate([userMsg("close it"), editIsa(isaFile(null)), toolResult(), say("Set to complete.")]);
    expect(r.code).toBe(0);
    expect(r.out.trim()).toBe("");
  }, 20_000);

  test("no stdin at all is exit 0, no opinion", async () => {
    const r = await runHook("ISAGate.hook.ts", {});
    expect(r.code).toBe(0);
    expect(r.out.trim()).toBe("");
  }, 20_000);
});

describe("StopGates composition", () => {
  const stop = (lines: object[]) => runHook("StopGates.hook.ts", { transcript_path: transcript(lines) });

  test("first block wins — VerificationGate outranks ISAGate on the same turn", async () => {
    const isa = isaFile(BLOCKING_ISA);
    // Edit last turn, bare done-claim this turn: T1 and the ISA gate both fire.
    const lines = [
      userMsg("close it"), editIsa(isa), toolResult(), say("Set to complete."),
      userMsg("are we good?"), say("Yes — it is done."),
    ];
    const alone = JSON.parse((await runHook("ISAGate.hook.ts", { transcript_path: transcript(lines) })).out) as { decision: string };
    expect(alone.decision).toBe("block"); // ISAGate would have blocked this same input

    const d = JSON.parse((await stop(lines)).out) as { decision: string; reason: string };
    expect(d.decision).toBe("block");
    expect(d.reason).toContain("VerificationGate T1");
    expect(d.reason).not.toContain("ISA structural gate");
  }, 20_000);

  test("ISAGate is reached when VerificationGate has no opinion", async () => {
    const isa = isaFile(BLOCKING_ISA);
    const r = await stop([userMsg("close it"), editIsa(isa), toolResult(), say("Set the phase.")]);
    const d = JSON.parse(r.out) as { decision: string; reason: string };
    expect(d.decision).toBe("block");
    expect(d.reason).toContain("ISA structural gate");
  }, 20_000);

  test("a crashing gate is caught and named, never fatal", async () => {
    const r = await stop([userMsg("close it"), editIsa(isaFile(null)), toolResult(), say("Set the phase.")]);
    expect(r.code).toBe(0);
    expect(r.out.trim()).toBe("");
    expect(r.err).toContain("[StopGates] ISAGate error:");
    expect(r.err).not.toContain("[StopGates] fatal:");
  }, 20_000);

  test("both gates satisfied — nothing emitted", async () => {
    const r = await stop([
      userMsg("close it"), editIsa(isaFile(CLEAN_ISA)), toolResult(),
      toolUse("Bash", { command: "bun test tests/" }), toolResult(),
      say("Done — the suite is green."),
    ]);
    expect(r.code).toBe(0);
    expect(r.out.trim()).toBe("");
    expect(r.err.trim()).toBe("");
  }, 20_000);
});

// ------------------------------------------------------- checkpoint telemetry

const ORDERS: string[][] = [
  ["ISASync.hook.ts", "CheckpointPerISC.hook.ts"],
  ["CheckpointPerISC.hook.ts", "ISASync.hook.ts"],
];

function writeIsa(path: string, checked: string[]): void {
  const claim = (id: string) => `- [${checked.includes(id) ? "x" : " "}] ${id}: ${id} holds.`;
  writeFileSync(path, [
    "---", "slug: dv2", "phase: climbing", `progress: ${checked.length}/2`, "---", "",
    "## Claims", claim("ISC-1"), claim("ISC-2"), "",
  ].join("\n"));
}

function isaRepo(): { root: string; isa: string } {
  const root = tmp("devos-hooks-isa-");
  mkdirSync(join(root, "DEVOS"), { recursive: true });
  writeFileSync(join(root, "DEVOS", "SKILL.md"), "# DevOS\n");
  const isa = join(root, "ISA.md");
  writeIsa(isa, []);
  return { root, isa };
}

async function postToolUse(root: string, isa: string, order: string[]): Promise<void> {
  for (const hook of order) {
    const r = await runHook(hook, {
      hook_event_name: "PostToolUse",
      tool_name: "Edit",
      tool_input: { file_path: isa },
      cwd: root,
    });
    expect(r.code).toBe(0);
  }
}

const stateFile = (root: string, name: string) => join(root, "DEVOS", "MEMORY", "STATE", name);

describe("CheckpointPerISC + ISASync", () => {
  for (const order of ORDERS) {
    test(`a newly-checked claim is logged — order: ${order.map((o) => o.split(".")[0]).join(" then ")}`, async () => {
      const { root, isa } = isaRepo();
      await postToolUse(root, isa, order);

      writeIsa(isa, ["ISC-1"]);
      await postToolUse(root, isa, order);

      const log = stateFile(root, "checkpoints.jsonl");
      expect(existsSync(log)).toBe(true);
      const rows = readFileSync(log, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
      expect(rows).toHaveLength(1);
      expect(rows[0].slug).toBe("dv2");
      expect(rows[0].closed).toEqual(["ISC-1"]);
      expect(rows[0].progress).toBe("1/2");

      // ISASync still owns the derived mirror.
      const work = JSON.parse(readFileSync(stateFile(root, "work.json"), "utf-8"));
      expect(work.isas.dv2.checkedIds).toEqual(["ISC-1"]);
      expect(work.isas.dv2.phase).toBe("climbing");
    }, 30_000);
  }

  test("re-firing with nothing newly checked appends nothing", async () => {
    const { root, isa } = isaRepo();
    await postToolUse(root, isa, ORDERS[0]);
    writeIsa(isa, ["ISC-1"]);
    await postToolUse(root, isa, ORDERS[0]);
    await postToolUse(root, isa, ORDERS[0]);
    const rows = readFileSync(stateFile(root, "checkpoints.jsonl"), "utf-8").trim().split("\n");
    expect(rows).toHaveLength(1);
  }, 30_000);

  test("appends rather than rewrites — an existing log survives", async () => {
    const { root, isa } = isaRepo();
    await postToolUse(root, isa, ORDERS[0]);
    const log = stateFile(root, "checkpoints.jsonl");
    writeFileSync(log, JSON.stringify({ ts: "earlier", slug: "dv2", closed: ["ISC-0"], progress: "0/2" }) + "\n");
    writeIsa(isa, ["ISC-1", "ISC-2"]);
    await postToolUse(root, isa, ORDERS[0]);
    const rows = readFileSync(log, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
    expect(rows).toHaveLength(2);
    expect(rows[0].ts).toBe("earlier");
    expect(rows[1].closed).toEqual(["ISC-1", "ISC-2"]);
  }, 30_000);
});

// --------------------------------------------------------------- blast radius

const DESTRUCTIVE = [
  "rm -rf /",
  "rm -fr /",
  "rm -r -f /",
  "rm --recursive --force /",
  'rm -rf "$HOME"',
  "rm -rf ${HOME}/data",
  "rm -rf ~/Downloads",
  "sudo rm -rf /",
  "git push --force",
  "git push -f origin main",
  "git push origin +main",
  "git reset --hard",
  "git clean -df",
];

const ORDINARY = [
  "rm -rf node_modules",
  "rm -f package-lock.json",
  "git push origin main",
  "git push --set-upstream origin dev",
  "bun test tests/",
  "cat latest.log",
];

async function nudge(command: string): Promise<{ out: string; code: number | null }> {
  return runHook("AlgorithmNudge.hook.ts", { hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command } });
}

describe("AlgorithmNudge blast radius", () => {
  for (const command of DESTRUCTIVE) {
    test(`blocks: ${command}`, async () => {
      const r = await nudge(command);
      expect(r.code).toBe(0); // a gate never breaks the turn
      expect(JSON.parse(r.out).decision).toBe("block");
    }, 20_000);
  }

  for (const command of ORDINARY) {
    test(`allows: ${command}`, async () => {
      const r = await nudge(command);
      expect(r.code).toBe(0);
      expect(r.out.trim()).toBe("");
    }, 20_000);
  }
});
