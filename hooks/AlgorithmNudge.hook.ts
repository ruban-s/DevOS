#!/usr/bin/env bun
/**
 * AlgorithmNudge.hook.ts — the live layer: questions asked at the moment
 * they're answerable. Deterministic, zero inference. A row may only ask about
 * state the model cannot observe from its own context — never phrase→procedure
 * mapping, never "a tool was invoked" pass conditions.
 *
 *  UserPromptSubmit: depth directive ("go heavy", "quick pass", …) with no
 *    run registered (no marking/climbing ISA visible) → nudge to write done
 *    down or state why inline is enough. The principal's call outranks judgment.
 *  PreToolUse Bash: destructive patterns → BLOCK with the blast-radius ask
 *    (ownership via authority, baseline flow, mitigation-as-claim). Env kill:
 *    ALGORITHMNUDGE_OFF=1.
 */

import { existsSync } from "node:fs";
import { readHookInput, block, note, pass } from "./lib/hook-io";
import { findIsas, readIsa } from "../Tools/isa";

const DEPTH_RE = /\b(go heavy|go deep|quick pass|think (deeply|hard)|take your time|be thorough|full (audit|review))\b/i;

const DESTRUCTIVE: Array<{ re: RegExp; what: string }> = [
  { re: /\brm\s+-rf?\s+(~|\$HOME|\/|\*)/, what: "recursive delete of a home/root-wide path" },
  { re: /\bgit\s+push\s+.*--force/, what: "forced push (rewrites shared history)" },
  { re: /\bgit\s+(reset\s+--hard|clean\s+-fd)/, what: "destructive git operation (destroys uncommitted work)" },
  { re: /\b(DROP\s+(TABLE|DATABASE)|drop\s+--force)/, what: "destructive database operation" },
  { re: /\bwrangler\s+(delete|destroy)/, what: "destructive infra delete" },
  { re: /\b(delete-bucket|delete-domain|delete-zone|records.*--delete)\b/, what: "provider-side delete" },
];

function hasActiveRun(cwd: string): boolean {
  try {
    for (const isa of findIsas(cwd)) {
      const phase = readIsa(isa).phase;
      if (["marking", "scoping", "starting", "climbing"].includes(phase)) return true;
    }
  } catch { /* fail open — no nudge without evidence */ }
  return false;
}

async function main(): Promise<void> {
  try {
    if (process.env.ALGORITHMNUDGE_OFF === "1") pass();
    const input = await readHookInput();
    if (!input) pass();
    const event = String(input.hook_event_name || "");

    if (event === "PreToolUse" && String(input.tool_name || "") === "Bash") {
      const cmd = String((input.tool_input as Record<string, unknown> | undefined)?.["command"] || "");
      for (const d of DESTRUCTIVE) {
        if (d.re.test(cmd)) {
          block(`AlgorithmNudge destructive-op — ${d.what}: \`${cmd.slice(0, 200)}\`. Before it runs: (1) what does the target OWN — enumerate via the provider's authority API, not a cached listing; (2) what is the baseline flow/rate that must survive, and what re-proves it after; (3) any safety mitigation is a claim with a falsifier first, prose never counts (RUNTIME/RULES/Verification.md V8, Loop D16).`);
        }
      }
      pass();
    }

    if (event === "UserPromptSubmit") {
      const prompt = String(input.prompt || "");
      if (!DEPTH_RE.test(prompt)) pass();
      const cwd = typeof input.cwd === "string" && existsSync(input.cwd) ? input.cwd : process.cwd();
      if (hasActiveRun(cwd)) pass();
      note(`AlgorithmNudge — the principal directed depth ("${(prompt.match(DEPTH_RE) || [""])[0]}") with no run registered (no marking/climbing ISA visible from ${cwd}). His call outranks your judgment: likely a run, not a chat turn — write done down (ISA: Goal + falsifiable claims) and name what it earns, or state why inline is enough.`);
    }
    pass();
  } catch {
    pass(); // fail open
  }
}

main();
