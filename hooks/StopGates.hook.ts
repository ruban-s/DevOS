#!/usr/bin/env bun
/**
 * StopGates.hook.ts — the ONE Stop-event gate. Runs VerificationGate then
 * ISAGate in registration order; the FIRST block wins and is emitted.
 * Each gate fails open internally; this wrapper catches residual per-gate
 * crashes so one gate never silences the other. Always exit 0 — a gate
 * must never be why a Stop breaks.
 */

import { readHookInput } from "./lib/hook-io";
import { run as verificationGate } from "./VerificationGate.hook";
import { run as isaGate } from "./ISAGate.hook";

type GateFn = (input: Record<string, unknown>) => Promise<object | null>;

const GATES: Array<[string, GateFn]> = [
  // Evidence gaps outrank bookkeeping: a close with no proof blocks first.
  ["VerificationGate", verificationGate as GateFn],
  // Structural close violations second: non-M/N progress, fog-at-complete, missing anchors.
  ["ISAGate", isaGate as GateFn],
];

(async () => {
  const input = await readHookInput();
  if (!input) process.exit(0);
  let emitted: object | null = null;
  for (const [name, gate] of GATES) {
    try {
      const d = await gate(input);
      if (d && !emitted) {
        emitted = d;
        if ((d as { decision?: string }).decision === "block") break;
      }
    } catch (err) {
      console.error(`[StopGates] ${name} error:`, err);
    }
  }
  if (emitted) console.log(JSON.stringify(emitted));
  process.exit(0);
})().catch((err) => {
  console.error("[StopGates] fatal:", err);
  process.exit(0);
});
