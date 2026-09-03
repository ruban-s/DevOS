#!/usr/bin/env bun
/**
 * ISASync.hook.ts — PostToolUse (Write|Edit on ISA.md). Re-reads the ISA and
 * mirrors {slug, phase, progress, updated} into DEVOS/MEMORY/STATE/work.json
 * (keyed by slug). work.json is DERIVED state — the ISA file is the truth.
 * On a genuine phase change, emits the <devos-ascent-delta> block carrying
 * the strip resolved through Tools/ascent.ts (the one derivation table —
 * never self-computed). Fail open, always exit 0.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { readHookInput, pass } from "./lib/hook-io";
import { readIsa, findDevosRoot } from "../Tools/isa";
import { strip } from "../Tools/ascent";

function isaTarget(input: { tool_input?: Record<string, unknown> }): string | null {
  const fp = input.tool_input?.["file_path"];
  if (typeof fp !== "string") return null;
  if (!/(^|\/)ISA\.md$/.test(fp)) return null;
  return fp;
}

async function main(): Promise<void> {
  try {
    const input = await readHookInput();
    const target = input ? isaTarget(input) : null;
    if (!target || !existsSync(target)) pass();

    const isa = readIsa(target!);
    const slug = isa.frontmatter["slug"] || basename(dirname(target!));
    const root = findDevosRoot(dirname(target!)) || input?.cwd || process.cwd();
    const stateDir = join(root, "DEVOS", "MEMORY", "STATE");
    mkdirSync(stateDir, { recursive: true });
    const workFile = join(stateDir, "work.json");
    let work: Record<string, Record<string, unknown>> = { isas: {} };
    try {
      if (existsSync(workFile)) work = JSON.parse(readFileSync(workFile, "utf-8")) as typeof work;
    } catch { /* corrupt state — rebuild from the file, which is truth */ }
    if (!work.isas) work.isas = {};

    const prev = work.isas[slug] as Record<string, unknown> | undefined;
    work.isas[slug] = {
      path: target,
      phase: isa.phase,
      progress: isa.progress,
      updated: isa.frontmatter["updated"] || new Date().toISOString(),
      checkedIds: isa.claims.filter((c) => c.checked).map((c) => c.id),
    };
    writeFileSync(workFile, JSON.stringify(work, null, 2));

    if (prev && typeof prev["phase"] === "string" && prev["phase"] !== isa.phase) {
      console.log(`<devos-ascent-delta>\n${strip(isa.phase)}\n</devos-ascent-delta>`);
    }
    pass();
  } catch {
    pass(); // fail open — sync must never break the turn
  }
}

main();
