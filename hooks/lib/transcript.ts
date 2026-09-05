#!/usr/bin/env bun
/**
 * DevOS hooks/lib/transcript.ts — minimal transcript reader.
 * Parses harness JSONL transcripts for two facts gates need:
 * which files the session edited, and what tool evidence the CURRENT TURN
 * carries. Unknown shapes are skipped, never fatal — gates fail open.
 */

import { existsSync, readFileSync } from "node:fs";

export interface TurnEdit { target: string }
export interface Evidence {
  toolUses: Array<{ name: string; input: Record<string, unknown> }>;
  assistantText: string;
}

function blocksOf(obj: Record<string, unknown>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const msg = obj["message"] as Record<string, unknown> | undefined;
  const content = msg?.["content"];
  if (Array.isArray(content)) for (const b of content) if (b && typeof b === "object") out.push(b as Record<string, unknown>);
  // Some harnesses put content at top level.
  const top = obj["content"];
  if (Array.isArray(top)) for (const b of top) if (b && typeof b === "object") out.push(b as Record<string, unknown>);
  return out;
}

function readLines(path: string): Array<Record<string, unknown>> {
  if (!path || !existsSync(path)) return [];
  try {
    return readFileSync(path, "utf-8").split("\n")
      .filter((l) => l.trim() !== "")
      .map((l) => { try { return JSON.parse(l) as Record<string, unknown>; } catch { return null; } })
      .filter((o): o is Record<string, unknown> => o !== null);
  } catch {
    return [];
  }
}

/** file_path targets of Edit/Write/MultiEdit tool uses in the transcript. */
export function editedFiles(transcriptPath: string): string[] {
  const found = new Set<string>();
  for (const obj of readLines(transcriptPath)) {
    for (const b of blocksOf(obj)) {
      if (b["type"] !== "tool_use") continue;
      const name = String(b["name"] || "");
      if (!["Edit", "Write", "MultiEdit"].includes(name)) continue;
      const input = (b["input"] || {}) as Record<string, unknown>;
      const fp = input["file_path"];
      if (typeof fp === "string" && fp !== "") found.add(fp);
    }
  }
  return [...found];
}

/** A real human prompt — tool results are user-shaped too, and never open a turn. */
function isUserPrompt(obj: Record<string, unknown>): boolean {
  const msg = obj["message"] as Record<string, unknown> | undefined;
  const role = msg?.["role"] ?? obj["role"];
  if (obj["type"] !== "user" && role !== "user") return false;
  if (obj["isMeta"] === true) return false;
  const content = msg?.["content"] ?? obj["content"];
  if (typeof content === "string") return content.trim() !== "";
  if (Array.isArray(content)) {
    return !content.some((b) => b && typeof b === "object" && (b as Record<string, unknown>)["type"] === "tool_result");
  }
  return false;
}

/**
 * Tool uses + assistant prose since the last human prompt (the current turn).
 * null when no turn boundary is findable — a caller with no turn has no
 * opinion, rather than grading the whole session.
 */
export function turnEvidence(transcriptPath: string): Evidence | null {
  const lines = readLines(transcriptPath);
  let start = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (isUserPrompt(lines[i])) { start = i + 1; break; }
  }
  if (start < 0) return null;

  const toolUses: Evidence["toolUses"] = [];
  const texts: string[] = [];
  for (const obj of lines.slice(start)) {
    for (const b of blocksOf(obj)) {
      if (b["type"] === "tool_use") {
        toolUses.push({ name: String(b["name"] || ""), input: ((b["input"] || {}) as Record<string, unknown>) });
      } else if (b["type"] === "text" && typeof b["text"] === "string") {
        texts.push(b["text"] as string);
      }
    }
  }
  return { toolUses, assistantText: texts.join("\n") };
}
