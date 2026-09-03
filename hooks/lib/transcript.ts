#!/usr/bin/env bun
/**
 * DevOS hooks/lib/transcript.ts — minimal transcript reader.
 * Parses harness JSONL transcripts for two facts gates need:
 * which files were edited this turn, and what tool evidence exists.
 * Unknown shapes are skipped, never fatal — gates fail open.
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

/** Tool uses + assistant prose in the transcript (whole session — gates scope by turn where cheap). */
export function evidence(transcriptPath: string): Evidence {
  const toolUses: Evidence["toolUses"] = [];
  const texts: string[] = [];
  for (const obj of readLines(transcriptPath)) {
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
