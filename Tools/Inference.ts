#!/usr/bin/env bun
/**
 * DevOS Tools/Inference.ts — minimal model-call primitive for skills
 * (Evals judges/graders). Same export surface as the upstream it replaces
 * (InferenceOptions/InferenceResult/InferenceLevel/inference/normalizeLevel);
 * deliberately WITHOUT the upstream billing ladder, model-verification
 * envelope, and max→high fallback — those arrive with multi-rung dispatch.
 * Levels resolve to models via DEVOS_MODEL_<LOW|MEDIUM|HIGH|MAX> (defaults
 * below); `claude -p` must be on PATH with subscription auth.
 *
 * Usage: bun Tools/Inference.ts --level low <system_prompt> <user_prompt>
 */

export type InferenceLevel = "low" | "medium" | "high" | "max";

const VALID_LEVELS: InferenceLevel[] = ["low", "medium", "high", "max"];

const DEFAULT_TIMEOUT: Record<InferenceLevel, number> = {
  low: 15_000,
  medium: 30_000,
  high: 90_000,
  max: 120_000,
};

function modelFor(level: InferenceLevel): string {
  const env = process.env[`DEVOS_MODEL_${level.toUpperCase()}`];
  if (env) return env;
  // Defaults track the Claude Code tier aliases; override per level via env.
  return { low: "haiku", medium: "sonnet", high: "opus", max: "opus" }[level];
}

export function normalizeLevel(level: string | undefined): InferenceLevel {
  if (!level) return "medium";
  if ((VALID_LEVELS as readonly string[]).includes(level)) return level as InferenceLevel;
  throw new Error(`[Inference] unknown level '${level}' — use ${VALID_LEVELS.join(" | ")}`);
}

export interface InferenceOptions {
  systemPrompt: string;
  userPrompt: string;
  level?: InferenceLevel;
  expectJson?: boolean;
  timeout?: number;
}

export interface InferenceResult {
  success: boolean;
  output: string;
  parsed?: unknown;
  error?: string;
  latencyMs: number;
  level: InferenceLevel;
}

export async function inference(options: InferenceOptions): Promise<InferenceResult> {
  const level = normalizeLevel(options.level);
  const started = Date.now();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT[level];
  try {
    const proc = Bun.spawn(
      ["claude", "-p", "--model", modelFor(level), "--output-format", "json",
        "--system-prompt", options.systemPrompt, options.userPrompt],
      { stdout: "pipe", stderr: "pipe" },
    );
    const timer = setTimeout(() => { try { proc.kill(); } catch { /* exited */ } }, timeout);
    const raw = await new Response(proc.stdout).text();
    await proc.exited;
    clearTimeout(timer);
    if (proc.exitCode !== 0) {
      const err = await new Response(proc.stderr).text();
      return { success: false, output: "", error: err.trim() || `exit ${proc.exitCode}`, latencyMs: Date.now() - started, level };
    }
    let output = raw;
    try {
      const env = JSON.parse(raw) as { result?: string };
      if (typeof env.result === "string") output = env.result;
    } catch { /* plain-text envelope — use raw */ }
    if (options.expectJson) {
      try {
        const parsed: unknown = JSON.parse(output);
        return { success: true, output, parsed, latencyMs: Date.now() - started, level };
      } catch {
        return { success: false, output, error: "expected JSON output, got unparseable text", latencyMs: Date.now() - started, level };
      }
    }
    return { success: true, output, latencyMs: Date.now() - started, level };
  } catch (e) {
    return { success: false, output: "", error: String(e), latencyMs: Date.now() - started, level };
  }
}

if (import.meta.main) {
  const a = process.argv.slice(2);
  let level: InferenceLevel = "medium";
  let expectJson = false;
  const pos: string[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--level" && a[i + 1]) { level = normalizeLevel(a[++i]); }
    else if (a[i] === "--json") expectJson = true;
    else pos.push(a[i]);
  }
  if (pos.length < 2) { console.error("usage: bun Tools/Inference.ts [--level L] [--json] <system_prompt> <user_prompt>"); process.exit(2); }
  const r = await inference({ systemPrompt: pos[0], userPrompt: pos.slice(1).join(" "), level, expectJson });
  console.log(expectJson ? JSON.stringify(r) : r.output);
  process.exit(r.success ? 0 : 1);
}
