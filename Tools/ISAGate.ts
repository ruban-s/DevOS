#!/usr/bin/env bun
/**
 * ISAGate — mechanical ISA structural gate CLI. Reports hard violations
 * (block a close) and advisories (surface, never block). Read-only.
 *
 * Usage: bun Tools/ISAGate.ts <isa-path> [--json]   (--json is the only format)
 */

import { existsSync } from "node:fs";
import { gateReport } from "./isa";
import { emit } from "./lib";

function main(): void {
  const isa = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!isa) emit({ ok: false, error: "usage: bun Tools/ISAGate.ts <isa-path>" }, 1);
  if (!existsSync(isa!)) emit({ ok: false, error: `ISA not found: ${isa}` }, 1);
  try {
    const r = gateReport(isa!);
    emit({ ok: true, ...r, note: r.blocks ? "BLOCKS close — fix hard violations" : "passes — advisories do not block" }, 0);
  } catch (e) {
    emit({ ok: false, error: `cannot parse ${isa}: ${String(e)}` }, 1);
  }
}

main();
