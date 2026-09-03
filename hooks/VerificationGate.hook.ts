#!/usr/bin/env bun
/**
 * VerificationGate.hook.ts — claim-vs-evidence teeth at Stop.
 * Grades the transcript's actual tool calls, never the message's wording
 * (rewording never passes). Two teeth, both fail-open:
 *  T1 no-evidence close — a done/live/works/fixed claim with zero tool calls
 *     anywhere in the turn's transcript slice.
 *  T2 web-scope without a probe — a page/UI/deploy/endpoint claim with no
 *     browser, screenshot, curl, or test invocation in evidence.
 * Appearance-only nuance (viewed pixels) stays a model-side check per
 * RUNTIME/RULES/Verification.md V5 — this gate enforces evidence
 * existence, not evidence quality.
 */

import { existsSync } from "node:fs";
import { readHookInput, block, pass, type HookInput } from "./lib/hook-io";
import { evidence } from "./lib/transcript";

const DONE_RE = /\b(done|complete|completed|works?|working|verified|shipped|live|fixed|deployed|passing|green|ready)\b/i;
const WEB_RE = /\b(page|pages|ui|site|website|url|https?:|endpoint|deploy|browser|screenshot|frontend|component|layout|styling|css)\b/i;
const PROBE_TOOLS = new Set(["Bash", "Skill"]);
const PROBE_CMD = /curl|test|pytest|vitest|bun test|go test|cargo test|playwright|screenshot|capture|dig @|jq \.|SELECT/i;

function hasProbe(toolUses: Array<{ name: string; input: Record<string, unknown> }>): boolean {
  return toolUses.some((t) => {
    if (t.name === "Read") {
      const fp = t.input["file_path"];
      return typeof fp === "string" && /\.(png|jpg|jpeg|webp|gif)$/i.test(fp);
    }
    if (!PROBE_TOOLS.has(t.name)) return false;
    const blob = JSON.stringify(t.input || {});
    return PROBE_CMD.test(blob);
  });
}

export async function run(input: HookInput | null): Promise<object | null> {
  if (process.env.VERIFICATIONGATE_OFF === "1") return null;
  if (!input) return null;
  if (input.stop_hook_active) return null;
  const tp = input.transcript_path;
  if (typeof tp !== "string" || !existsSync(tp)) return null;

  const ev = evidence(tp as string);
  const text = ev.assistantText;
  if (!DONE_RE.test(text)) return null; // no done-claim in prose — nothing to grade

  if (ev.toolUses.length === 0) {
    return {
      decision: "block",
      reason: `VerificationGate T1 — a completion claim was made with zero tool calls in evidence. "Should work" is forbidden: run the probe (test, curl, screenshot, read-back) and cite it, or retract the claim.`,
    };
  }

  if (WEB_RE.test(text) && !hasProbe(ev.toolUses)) {
    return {
      decision: "block",
      reason: `VerificationGate T2 — a page/UI/deploy claim was made with no browser, screenshot, curl, or test invocation in evidence. Web output verifies through a real browser/screenshot before anyone sees it (RUNTIME/RULES/Verification.md); "curl returns 200" proves nothing about a page.`,
    };
  }
  return null;
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
