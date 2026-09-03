#!/usr/bin/env bun
/**
 * ISAGate.hook.ts — deterministic ISA structural gate at the close transition.
 * BLOCK iff ALL hold: (1) not a recovery pass, (2) an ISA.md was Edit/Written
 * THIS TURN (legacy files never gated retroactively), (3) that ISA reads
 * `phase: complete` on disk, (4) gateReport finds ≥1 HARD violation.
 * Advisories NEVER block (a count-block manufactures the count).
 * Fail OPEN on any read/parse error. Env kill: ISAGATE_OFF=1.
 */

import { existsSync, readFileSync } from "node:fs";
import { readHookInput, block, pass, type HookInput } from "./lib/hook-io";
import { editedFiles } from "./lib/transcript";
import { gateReport } from "../Tools/isa";

export async function run(input: HookInput | null): Promise<object | null> {
  if (process.env.ISAGATE_OFF === "1") return null;
  if (!input) return null;
  if (input.stop_hook_active) return null;
  const tp = input.transcript_path;
  if (typeof tp !== "string" || !existsSync(tp)) return null;

  const isaPaths = [...new Set(editedFiles(tp).filter((p) => /(^|\/)ISA\.md$/.test(p)))];
  if (isaPaths.length === 0) return null;

  const offenders: string[] = [];
  for (const p of isaPaths) {
    if (!existsSync(p)) continue;
    if (!/^phase:\s*complete\b/m.test(readFileSync(p, "utf-8"))) continue;
    const r = gateReport(p);
    if (r.blocks) offenders.push(`${p}\n${r.hard.map((h) => `    ❌ [${h.code}] ${h.message}`).join("\n")}`);
  }
  if (offenders.length === 0) return null;

  return {
    decision: "block",
    reason:
      `ISA structural gate — an ISA closed this turn (phase: complete) has hard violations:\n` +
      offenders.join("\n") +
      `\n\nFix the ISA (mechanical M/N progress, graduate/kill fog, add anchors_to), or set phase back to climbing. ` +
      `Advisories don't block: \`bun Tools/ISAGate.ts <isa>\`.`,
  };
}

// Standalone shim — StopGates imports run(); direct invocation reads stdin.
if (import.meta.main) {
  try {
    const input = await readHookInput();
    const d = await run(input);
    if (d) block((d as { reason: string }).reason);
    pass();
  } catch {
    pass(); // fail open
  }
}
