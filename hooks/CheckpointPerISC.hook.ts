#!/usr/bin/env bun
/**
 * CheckpointPerISC.hook.ts — PostToolUse (Write|Edit on ISA.md). Diffs checked
 * claim IDs against its OWN baseline (DEVOS/MEMORY/STATE/checkpoint-state.json)
 * and appends newly-closed claims to DEVOS/MEMORY/STATE/checkpoints.jsonl (one
 * JSON object per line). The baseline is private on purpose: ISASync binds the
 * same event and overwrites work.json's checkedIds, so sharing it made the log
 * depend on hook registration order. Telemetry only — never blocks, never
 * writes the ISA. Fail open, always exit 0.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { readHookInput, pass } from "./lib/hook-io";
import { readIsa, findDevosRoot } from "../Tools/isa";

async function main(): Promise<void> {
  try {
    const input = await readHookInput();
    const fp = input?.tool_input?.["file_path"];
    if (typeof fp !== "string" || !/(^|\/)ISA\.md$/.test(fp)) pass();
    if (!existsSync(fp!)) pass();

    const isa = readIsa(fp!);
    const slug = isa.frontmatter["slug"] || basename(dirname(fp!));
    const nowChecked = isa.claims.filter((c) => c.checked).map((c) => c.id);

    const root = findDevosRoot(dirname(fp!)) || input?.cwd || process.cwd();
    const stateDir = join(root, "DEVOS", "MEMORY", "STATE");
    mkdirSync(stateDir, { recursive: true });
    const seenFile = join(stateDir, "checkpoint-state.json");
    let seen: Record<string, string[]> = {};
    try {
      const parsed = existsSync(seenFile) ? JSON.parse(readFileSync(seenFile, "utf-8")) : null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) seen = parsed as typeof seen;
    } catch { /* corrupt state — treat everything as new, still just telemetry */ }

    const fresh = nowChecked.filter((id) => !(seen[slug] || []).includes(id));
    seen[slug] = nowChecked;
    writeFileSync(seenFile, JSON.stringify(seen, null, 2));

    if (fresh.length > 0) {
      const line = JSON.stringify({ ts: new Date().toISOString(), slug, closed: fresh, progress: isa.progress }) + "\n";
      appendFileSync(join(stateDir, "checkpoints.jsonl"), line);
    }
    pass();
  } catch {
    pass(); // fail open
  }
}

main();
