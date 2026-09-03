#!/usr/bin/env bun
/**
 * CheckpointPerISC.hook.ts — PostToolUse (Write|Edit on ISA.md). Diffs checked
 * claim IDs against the work.json mirror and appends newly-closed claims to
 * DEVOS/MEMORY/STATE/checkpoints.jsonl (one JSON object per line). Telemetry
 * only — never blocks, never writes the ISA. Fail open, always exit 0.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
    const workFile = join(stateDir, "work.json");
    let prevChecked: string[] = [];
    try {
      if (existsSync(workFile)) {
        const work = JSON.parse(readFileSync(workFile, "utf-8")) as { isas?: Record<string, { checkedIds?: string[] }> };
        prevChecked = work.isas?.[slug]?.checkedIds || [];
      }
    } catch { /* corrupt state — treat everything as new, still just telemetry */ }

    const fresh = nowChecked.filter((id) => !prevChecked.includes(id));
    if (fresh.length > 0) {
      const line = JSON.stringify({ ts: new Date().toISOString(), slug, closed: fresh, progress: isa.progress }) + "\n";
      const log = join(stateDir, "checkpoints.jsonl");
      const prev = existsSync(log) ? readFileSync(log, "utf-8") : "";
      writeFileSync(log, prev + line);
    }
    pass();
  } catch {
    pass(); // fail open
  }
}

main();
