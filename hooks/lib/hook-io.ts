#!/usr/bin/env bun
/**
 * DevOS hooks/lib/hook-io.ts — hook protocol helpers.
 * Hooks read ONE JSON object from stdin (absent on manual runs → null),
 * always exit 0, and fail open: any error means "no opinion", never a block.
 */

export interface HookInput {
  hook_event_name?: string;
  transcript_path?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  cwd?: string;
  prompt?: string;
  stop_hook_active?: boolean;
  [k: string]: unknown;
}

export async function readHookInput(): Promise<HookInput | null> {
  try {
    if (process.stdin.isTTY) return null;
    const chunks: Buffer[] = [];
    for await (const c of process.stdin) chunks.push(c as Buffer);
    const s = Buffer.concat(chunks).toString("utf-8").trim();
    if (!s) return null;
    return JSON.parse(s) as HookInput;
  } catch {
    return null;
  }
}

/** Stop-gate block, Claude-Code-shaped ({decision, reason}); other harnesses read stdout. */
export function block(reason: string): never {
  console.log(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

/** Advisory note to the model — rendered as a system message, never a block. */
export function note(text: string): never {
  console.log(JSON.stringify({ additionalContext: text }));
  process.exit(0);
}

// `never` is load-bearing: these exit, so callers narrow past `pass()` guards.
export function pass(): never {
  process.exit(0);
}
