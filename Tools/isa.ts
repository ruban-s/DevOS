#!/usr/bin/env bun
/**
 * DevOS Tools/isa.ts — the one ISA reader. Frontmatter, claims, fog,
 * Test Strategy rows, dependency edges, progress math, and the mechanical
 * gate report live here so hooks, CLIs, and future tooling read identically.
 * Pure file reads — never writes the ISA.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

export interface Claim {
  id: string;
  checked: boolean;
  dropped: boolean;
  anti: boolean;
  antecedent: boolean;
  bridge: boolean;
  text: string;
  after: string[];
  line: number;
}

export interface TsRow { isc: string; cells: string[]; line: number }

export interface IsaDoc {
  path: string;
  frontmatter: Record<string, string>;
  phase: string;
  progress: string;
  statedGoal: string | null;
  claims: Claim[];
  fogLines: number;
  tsRows: TsRow[];
  /** Column index of anchors_to in the Test Strategy header; -1 when the column is absent. */
  tsAnchorsCol: number;
}

const ID_RE = /^([A-Z][A-Z0-9]*-\d[\d.]*|[A-Z]\d+)\s*[:\-–—]\s*(.*)$/;
const AFTER_RE = /\(after:\s*([^)]+)\)\.?\s*$/;

function parseFrontmatter(lines: string[]): { fm: Record<string, string>; bodyStart: number } {
  const fm: Record<string, string> = {};
  if (lines[0]?.trim() !== "---") return { fm, bodyStart: 0 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { end = i; break; }
  }
  if (end < 0) return { fm, bodyStart: 0 };
  let cur: string | null = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (/^\s+-\s+/.test(line) && cur) { fm[cur] += `\n${line.trim()}`; continue; }
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (m) {
      cur = m[1];
      let v = m[2].trim();
      // Strip one layer of matching YAML quotes ("…" or '…').
      if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
        v = v.slice(1, -1);
      }
      fm[cur] = v;
    }
  }
  return { fm, bodyStart: end + 1 };
}

export function readIsa(path: string): IsaDoc {
  const raw = readFileSync(path, "utf-8");
  const lines = raw.split("\n");
  const { fm, bodyStart } = parseFrontmatter(lines);
  const claims: Claim[] = [];
  const tsRows: TsRow[] = [];
  let fogLines = 0;
  let section = "";
  let inTsTable = false;
  let tsAnchorsCol = -1;

  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) { section = h2[1].toLowerCase(); inTsTable = false; continue; }

    if (section === "not yet specified") {
      if (/^\s*-\s*\S/.test(line)) fogLines++;
      continue;
    }

    if (section === "test strategy" || section === "teststrategy") {
      const t = line.trim();
      if (t.startsWith("|")) {
        const cells = t.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.every((c) => /^:?-+:?$/.test(c) || c === "")) continue; // separator
        // "claim" is the header the shipped template + ISA_FORMAT emit; "isc" is the older spelling.
        if (/^(isc|claim)$/i.test(cells[0] ?? "")) {
          tsAnchorsCol = cells.findIndex((c) => /^anchors_to$/i.test(c));
          inTsTable = true;
          continue;
        }
        if (inTsTable && cells.length > 0) tsRows.push({ isc: cells[0], cells, line: i + 1 });
      }
      continue;
    }

    if (["claims", "criteria", "isc criteria", "features", "bridge criteria", "anti-claims"].includes(section)) {
      const m = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.+)$/);
      if (!m) continue;
      const rest = m[3].trim();
      const idm = rest.match(ID_RE);
      if (!idm) continue; // checkbox without a claim ID is prose, not a claim
      let desc = idm[2].trim();
      let after: string[] = [];
      const am = desc.match(AFTER_RE);
      if (am) { after = am[1].split(",").map((s) => s.trim()).filter(Boolean); desc = desc.slice(0, am.index).trim().replace(/\s*\.?$/, ""); }
      claims.push({
        id: idm[1],
        checked: m[2].toLowerCase() === "x",
        dropped: /\[DROPPED/i.test(desc),
        anti: /^anti:/i.test(desc),
        antecedent: /^antecedent:/i.test(desc),
        bridge: /^bridge:/i.test(desc),
        text: desc,
        after,
        line: i + 1,
      });
    }
  }

  const goal = fm["principal_stated_goal"];
  return {
    path,
    frontmatter: fm,
    phase: (fm["phase"] || "").trim(),
    progress: (fm["progress"] || "").trim(),
    statedGoal: goal === undefined || goal === "" || goal === "null" ? null : goal,
    claims,
    fogLines,
    tsRows,
    tsAnchorsCol,
  };
}

export interface Finding { code: string; message: string }
export interface GateReport { path: string; hard: Finding[]; advisory: Finding[]; blocks: boolean }

export function gateReport(path: string): GateReport {
  const isa = readIsa(path);
  const hard: Finding[] = [];
  const advisory: Finding[] = [];

  const open = isa.claims.filter((c) => !c.dropped);
  const closed = open.filter((c) => c.checked).length;
  if (isa.progress !== `${closed}/${open.length}`) {
    hard.push({ code: "PROGRESS_FORMAT", message: `progress: "${isa.progress}" is not the mechanical count ${closed}/${open.length}` });
  }
  if (isa.phase === "complete" && isa.fogLines > 0) {
    hard.push({ code: "FOG_AT_COMPLETE", message: `${isa.fogLines} unresolved fog line(s) in ## Not yet specified — graduate or kill via Decisions` });
  }
  if (isa.statedGoal !== null) {
    const ac = isa.tsAnchorsCol;
    const unanchored = open.filter((c) => !isa.tsRows.some((r) => r.isc === c.id && ac >= 0 && (r.cells[ac] ?? "") !== ""));
    if (unanchored.length > 0) {
      hard.push({ code: "ANCHORS_MISSING", message: `${unanchored.length} claim(s) without anchors_to: ${unanchored.map((c) => c.id).join(", ")}` });
    }
  }

  if (!open.some((c) => c.anti)) advisory.push({ code: "NO_ANTI", message: "no Anti-claim — a goal with zero failure modes worth naming is under-specified" });
  const uncovered = open.filter((c) => !isa.tsRows.some((r) => r.isc === c.id));
  if (uncovered.length > 0) advisory.push({ code: "UNCOVERED", message: `${uncovered.length} claim(s) with no Test Strategy row: ${uncovered.map((c) => c.id).join(", ")}` });
  const bundled = open.filter((c) => /\b(and|with|including)\b/i.test(c.text) && c.text.length > 60);
  if (bundled.length > 0) advisory.push({ code: "BUNDLED", message: `${bundled.length} claim(s) look compound — run the Splitting Test: ${bundled.map((c) => c.id).join(", ")}` });

  return { path, hard, advisory, blocks: hard.length > 0 };
}

/** Edge integrity: unknown IDs, self-refs, duplicates, cycles. All loud. */
export function validateEdges(isa: IsaDoc): string[] {
  const problems: string[] = [];
  const ids = new Set(isa.claims.map((c) => c.id));
  const seen = new Set<string>();
  for (const c of isa.claims) {
    for (const b of c.after) {
      if (b === c.id) problems.push(`${c.id}: self-reference`);
      if (!ids.has(b)) problems.push(`${c.id}: unknown blocker "${b}"`);
      const k = `${c.id}→${b}`;
      if (seen.has(k)) problems.push(`${c.id}: duplicate edge to "${b}"`);
      seen.add(k);
    }
  }
  // Cycle detection over open claims.
  const adj = new Map(isa.claims.map((c) => [c.id, c.after.filter((b) => ids.has(b))]));
  const color = new Map<string, number>();
  const stack: string[] = [];
  const visit = (id: string): void => {
    color.set(id, 1); stack.push(id);
    for (const b of adj.get(id) || []) {
      if (color.get(b) === 1) problems.push(`cycle: ${[...stack.slice(stack.indexOf(b)), b].join(" → ")}`);
      else if (!color.get(b)) visit(b);
    }
    stack.pop(); color.set(id, 2);
  };
  for (const id of adj.keys()) if (!color.get(id)) visit(id);
  return problems;
}

export type LockMap = Record<string, { session: string; ts: string }>;

export function readLocks(lockDir: string): LockMap {
  const out: LockMap = {};
  if (!existsSync(lockDir)) return out;
  for (const f of readdirSync(lockDir)) {
    if (!f.endsWith(".lock")) continue;
    try { out[f.slice(0, -5)] = JSON.parse(readFileSync(join(lockDir, f), "utf-8")); } catch { /* ignore corrupt locks */ }
  }
  return out;
}

export function lockIsFresh(tsIso: string, ttlHours = 2): boolean {
  const age = Date.now() - Date.parse(tsIso);
  return !Number.isNaN(age) && age < ttlHours * 3600_000;
}

/** Takeable = open ∧ not dropped ∧ blockers resolved ∧ no fresh lock. */
export function frontier(isa: IsaDoc, locks: LockMap): { takeable: Claim[]; blocked: Array<{ claim: Claim; on: string[] }>; taken: Array<{ claim: Claim; by: string }> } {
  const byId = new Map(isa.claims.map((c) => [c.id, c]));
  const resolved = (id: string): boolean => {
    const c = byId.get(id);
    return !!c && (c.checked || c.dropped);
  };
  const takeable: Claim[] = [];
  const blocked: Array<{ claim: Claim; on: string[] }> = [];
  const taken: Array<{ claim: Claim; by: string }> = [];
  for (const c of isa.claims) {
    if (c.checked || c.dropped) continue;
    const open = c.after.filter((b) => !resolved(b));
    if (open.length > 0) { blocked.push({ claim: c, on: open }); continue; }
    const lock = locks[c.id];
    if (lock && lockIsFresh(lock.ts)) { taken.push({ claim: c, by: lock.session }); continue; }
    takeable.push(c);
  }
  return { takeable, blocked, taken };
}

export function sha1(s: string): string {
  return createHash("sha1").update(s).digest("hex");
}

/** Walk up from `start` for a dir containing DEVOS/SKILL.md. Null when none. */
export function findDevosRoot(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, "DEVOS", "SKILL.md"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** All ISAs visible from a repo root: project ISA.md + DEVOS/MEMORY/WORK slash ISAs. */
export function findIsas(repoRoot: string): string[] {
  const out: string[] = [];
  const proj = join(repoRoot, "ISA.md");
  if (existsSync(proj)) out.push(proj);
  const work = join(repoRoot, "DEVOS", "MEMORY", "WORK");
  if (existsSync(work)) {
    for (const e of readdirSync(work)) {
      const p = join(work, e, "ISA.md");
      try { if (statSync(join(work, e)).isDirectory() && existsSync(p)) out.push(p); } catch { /* ignore */ }
    }
  }
  return out;
}
