#!/usr/bin/env bun
/**
 * IsaFrontier — dependency-edge reader and concurrent-session claim protocol.
 * The tool NEVER writes the ISA file — the AI stays sole writer. Lock state
 * lives under <devosRoot>/DEVOS/MEMORY/STATE/isa-locks/<sha1(realpath)>/.
 *
 * Usage:
 *   bun Tools/IsaFrontier.ts frontier <isa> [--state-dir <dir>]
 *   bun Tools/IsaFrontier.ts status   <isa> [--state-dir <dir>]
 *   bun Tools/IsaFrontier.ts claim    <isa> --id <C> --session <UUID> [--state-dir <dir>]
 *   bun Tools/IsaFrontier.ts release  <isa> --id <C> --session <UUID> [--force] [--state-dir <dir>]
 *   bun Tools/IsaFrontier.ts validate <isa>
 */

import { existsSync, mkdirSync, writeFileSync, unlinkSync, realpathSync, openSync, closeSync } from "node:fs";
import { join, dirname } from "node:path";
import { readIsa, frontier, validateEdges, readLocks, lockIsFresh, sha1, findDevosRoot } from "./isa";
import { parseArgs, emit } from "./lib";

function stateDirFor(isaPath: string, override: string | undefined): string {
  if (override) return override;
  const root = findDevosRoot(dirname(isaPath));
  return join(root || process.cwd(), "DEVOS", "MEMORY", "STATE");
}

function lockDirFor(isaPath: string, stateDir: string): string {
  let canon: string = isaPath;
  try { canon = realpathSync(isaPath); } catch { /* use as given */ }
  return join(stateDir, "isa-locks", sha1(canon));
}

function main(): void {
  const [cmd, isaPath, ...rest] = process.argv.slice(2).filter((a) => a !== "--json");
  const { flags, get } = parseArgs(rest);
  if (!cmd || !isaPath) {
    emit({ ok: false, error: "usage: bun Tools/IsaFrontier.ts <frontier|status|claim|release|validate> <isa> [--id C --session UUID] [--state-dir D] [--force]" }, 1);
  }
  if (!existsSync(isaPath!)) emit({ ok: false, error: `ISA not found: ${isaPath}` }, 1);

  let isa;
  try {
    isa = readIsa(isaPath!);
  } catch (e) {
    emit({ ok: false, error: `cannot parse ${isaPath}: ${String(e)}` }, 1);
  }

  if (cmd === "validate") {
    const problems = validateEdges(isa!);
    emit({ ok: true, valid: problems.length === 0, problems }, 0);
  }

  const stateDir = stateDirFor(isaPath!, get("--state-dir"));
  const lockDir = lockDirFor(isaPath!, stateDir);
  const locks = readLocks(lockDir);
  const f = frontier(isa!, locks);
  const fmt = (c: { id: string; text: string }) => `${c.id}: ${c.text}`;

  if (cmd === "frontier") {
    emit({
      ok: true, isa: isaPath,
      takeable: f.takeable.map(fmt),
      counts: { takeable: f.takeable.length, blocked: f.blocked.length, taken: f.taken.length },
    }, 0);
  }

  if (cmd === "status") {
    emit({
      ok: true, isa: isaPath,
      takeable: f.takeable.map(fmt),
      blocked: f.blocked.map((b) => ({ claim: fmt(b.claim), on: b.on })),
      taken: f.taken.map((t) => ({ claim: fmt(t.claim), by: t.by })),
      closed: isa!.claims.filter((c) => c.checked).map((c) => c.id),
      staleLocks: Object.entries(locks).filter(([, l]) => !lockIsFresh(l.ts)).map(([id]) => id),
    }, 0);
  }

  const id = get("--id");
  const session = get("--session");
  if ((cmd === "claim" || cmd === "release") && (!id || !session)) {
    emit({ ok: false, error: `${cmd} requires --id <claim> --session <uuid>` }, 1);
  }
  const claim = isa!.claims.find((c) => c.id === id);
  if (!claim) emit({ ok: false, error: `unknown claim ${id}` }, 1);

  if (cmd === "claim") {
    if (claim!.checked || claim!.dropped) emit({ ok: false, taken: false, reason: "closed" }, 2);
    const open = (claim!.after || []).filter((b) => {
      const dep = isa!.claims.find((c) => c.id === b);
      return !(dep && (dep.checked || dep.dropped));
    });
    if (open.length > 0) emit({ ok: false, taken: false, reason: `blocked on ${open.join(", ")}` }, 2);
    const lock = locks[id!];
    if (lock && lockIsFresh(lock.ts) && lock.session !== session) {
      emit({ ok: false, taken: false, reason: `held by ${lock.session}` }, 2);
    }
    mkdirSync(lockDir, { recursive: true });
    const lockFile = join(lockDir, `${id}.lock`);
    try {
      // Reaching here means the lock is absent, stale, or ours — all overwritable.
      // "wx" only when absent, so EEXIST still catches a genuine race.
      const fd = openSync(lockFile, lock ? "w" : "wx");
      writeFileSync(fd, JSON.stringify({ session, ts: new Date().toISOString() }));
      closeSync(fd);
    } catch (e) {
      const raced = !lock && (e as NodeJS.ErrnoException).code === "EEXIST";
      emit({ ok: false, taken: false, reason: raced ? "held (race)" : `cannot write lock: ${String(e)}` }, 2);
    }
    emit({ ok: true, taken: true, id, session }, 0);
  }

  if (cmd === "release") {
    const lockFile = join(lockDir, `${id}.lock`);
    const lock = locks[id!];
    if (!lock) emit({ ok: true, released: false, note: "no lock held" }, 0);
    if (lock!.session !== session && !flags.has("--force")) {
      emit({ ok: false, released: false, reason: `held by ${lock!.session} — use --force to override` }, 2);
    }
    try { unlinkSync(lockFile); } catch { /* already gone */ }
    emit({ ok: true, released: true, id }, 0);
  }

  emit({ ok: false, error: `unknown command ${cmd}` }, 1);
}

main();
