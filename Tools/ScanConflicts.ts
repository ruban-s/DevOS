#!/usr/bin/env bun
/**
 * ScanConflicts — Setup step 2. READ-ONLY conflict report for a target repo:
 * existing DEVOS install, project ISA.md, AGENTS.md/CLAUDE.md pointer state
 * (managed-block markers, not a bare path mention), and skill-name collisions
 * under `<target>/DEVOS/skills` — the path the install actually writes.
 * Produces no mutations. Exit 0 always.
 *
 * Usage: bun Tools/ScanConflicts.ts [--target <dir>]
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, resolveTarget, hasDevosPointerBlock, SOURCE_ROOT } from "./lib";

function main(): void {
  const { get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const devosDir = join(target, "DEVOS");

  // Payload skill names vs the skills dir the install actually writes (DEVOS/skills).
  const collisions: Array<{ payload: string; existing: string; exact: boolean }> = [];
  const payloadSkills = join(SOURCE_ROOT, "skills");
  const targetSkills = join(devosDir, "skills");
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
    agentsMd: { present: agentsMdPresent, hasDevosPointer: hasDevosPointerBlock(join(target, "AGENTS.md")) },
    claudeMd: { present: claudeMdPresent, hasDevosPointer: hasDevosPointerBlock(join(target, "CLAUDE.md")) },
    skillCollisions: collisions,
    skillsScanned: targetSkills,
    needsReconciliation: devosPresent || isaPresent || collisions.length > 0,
  }, null, 2));
  process.exit(0);
}

main();
