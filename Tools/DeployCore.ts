#!/usr/bin/env bun
/**
 * DeployCore — Setup step 3. Copies the DevOS payload into `<target>/DEVOS/`
 * (SKILL.md, RUNTIME/, skills/, hooks/, templates/), scaffolds
 * `DEVOS/MEMORY/{WORK,STATE,KNOWLEDGE,LEARNING}`, substitutes known harness
 * tokens, and verifies no harness placeholder survives.
 *
 * Additive only (copyMissing — never overwrites). Dry-run by default.
 * FAILS LOUD (exit 1) when a required payload source is absent — never silent.
 * Refuses the DevOS source checkout as target (exit 2) unless --allow-dev.
 *
 * Usage: bun Tools/DeployCore.ts [--target <dir>] [--apply] [--allow-dev]
 */

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  PAYLOAD, MEMORY_DIRS, HARNESS_NAME,
  parseArgs, emit, isDevTreeCheckout, resolveTarget,
  readHarnessVersion, copyMissing, substituteHarnessTokens,
  checkHarnessPlaceholders, planCopy, SOURCE_ROOT,
} from "./lib";

function main(): void {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const apply = flags.has("--apply");
  const allowDev = flags.has("--allow-dev");
  const devosDir = join(target, "DEVOS");

  if ((target === SOURCE_ROOT || isDevTreeCheckout(target)) && !allowDev) {
    emit({ ok: false, refused: "dev-tree", detail: `${target} is the DevOS source checkout — refusing to deploy into it.` }, 2);
  }

  // Fail loud on incomplete source checkout.
  const missing = PAYLOAD.map(([s]) => s).filter((s) => !existsSync(join(SOURCE_ROOT, s)));
  if (missing.length > 0) {
    emit({ ok: false, error: `source checkout incomplete — missing: ${missing.join(", ")}` }, 1);
  }

  let version: string;
  try {
    version = readHarnessVersion();
  } catch (e) {
    emit({ ok: false, error: String(e) }, 1);
  }

  if (!apply) {
    // Dry-run: existence checks only — writes nothing.
    const planned: string[] = [];
    const skipped: string[] = [];
    for (const [src, rel] of PAYLOAD) {
      const rep = planCopy(join(SOURCE_ROOT, src), join(devosDir, rel), target);
      planned.push(...rep.wouldAdd);
      skipped.push(...rep.wouldSkip);
    }
    emit({
      ok: true, dryRun: true, target, harness: HARNESS_NAME, version: version!,
      note: "dry run — nothing written; re-run with --apply",
      wouldAdd: planned, wouldSkip: skipped,
      memoryDirs: MEMORY_DIRS.map((d) => `DEVOS/MEMORY/${d}`),
    }, 0);
  }

  const added: string[] = [];
  const skipped: string[] = [];
  for (const [src, rel] of PAYLOAD) {
    const rep = copyMissing(join(SOURCE_ROOT, src), join(devosDir, rel), target);
    added.push(...rep.added);
    skipped.push(...rep.skipped);
  }
  for (const d of MEMORY_DIRS) mkdirSync(join(devosDir, "MEMORY", d), { recursive: true });

  const substituted = substituteHarnessTokens(devosDir, version!);
  const placeholders = checkHarnessPlaceholders(devosDir);

  emit({
    ok: true, target, harness: HARNESS_NAME, version: version!,
    added, skippedExisting: skipped, substituted,
    survivingPlaceholders: placeholders,
    note: added.length === 0
      ? "idempotent re-run — everything already present"
      : undefined,
  }, 0);
}

main();
