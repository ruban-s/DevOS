#!/usr/bin/env bun
/**
 * ScanConflicts — Setup step 2. READ-ONLY conflict report for a target repo:
 * existing DEVOS install, project ISA.md, AGENTS.md/CLAUDE.md pointer state,
 * and skill-name collisions. Produces no mutations. Exit 0 always.
 *
 * Usage: bun Tools/ScanConflicts.ts [--target <dir>]
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveTarget, SOURCE_ROOT } from "./lib";

const POINTER = "DEVOS/";

function filePointsAtDevos(path: string): boolean {
  if (!existsSync(path)) return false;
  try { return readFileSync(path, "utf-8").includes(POINTER); } catch { return false; }
}

function main(): void {
  const a = process.argv.slice(2);
  const ti = a.indexOf("--target");
  const target = resolveTarget(ti >= 0 ? a[ti + 1] : undefined);
  const devosDir = join(target, "DEVOS");

  // Payload skill names (future) vs any target-level skills dir.
  const collisions: Array<{ payload: string; existing: string; exact: boolean }> = [];
  const payloadSkills = join(SOURCE_ROOT, "skills");
  const targetSkills = join(target, "skills");
  if (existsSync(payloadSkills) && existsSync(targetSkills)) {
    const existingByLower = new Map<string, string>();
    for (const e of readdirSync(targetSkills)) existingByLower.set(e.toLowerCase(), e);
    for (const p of readdirSync(payloadSkills).sort()) {
      const m = existingByLower.get(p.toLowerCase());
      if (m !== undefined) collisions.push({ payload: p, existing: m, exact: m === p });
    }
  }

  const devosPresent = existsSync(devosDir);
  const isaPresent = existsSync(join(target, "ISA.md"));
  const agentsMdPresent = existsSync(join(target, "AGENTS.md"));
  const claudeMdPresent = existsSync(join(target, "CLAUDE.md"));

  console.log(JSON.stringify({
    target,
    devosPresent,
    isaPresent,
    agentsMd: { present: agentsMdPresent, hasDevosPointer: agentsMdPresent && filePointsAtDevos(join(target, "AGENTS.md")) },
    claudeMd: { present: claudeMdPresent, hasDevosPointer: claudeMdPresent && filePointsAtDevos(join(target, "CLAUDE.md")) },
    skillCollisions: collisions,
    needsReconciliation: devosPresent || isaPresent || collisions.length > 0,
  }, null, 2));
  process.exit(0);
}

main();
