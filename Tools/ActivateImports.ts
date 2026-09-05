#!/usr/bin/env bun
/**
 * ActivateImports — Setup step 4. Ensures the target repo's pointer file carries
 * the DevOS pointer block (harness contract, constitution, spec format). The
 * filename follows the detected harness profile: CLAUDE.md on Claude Code,
 * AGENTS.md everywhere else.
 * Idempotent: present markers → block content refreshed in place; absent file →
 * created; absent block → appended. Dry-run by default. Refuses the DevOS
 * source checkout (exit 2) unless --allow-dev; errors when DEVOS/ is absent
 * (run DeployCore first) — exit 1.
 *
 * Usage: bun Tools/ActivateImports.ts [--target <dir>] [--apply] [--allow-dev]
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  parseArgs, emit, isDevTreeCheckout, resolveTarget, SOURCE_ROOT,
  IMPORTS_START, IMPORTS_END, managedBlockMode, upsertManagedBlock,
  detectHarness, harnessInstallProfile, homeDir,
} from "./lib";

function block(): string {
  return `${IMPORTS_START}
## DevOS harness

This repo uses DevOS (repo-local at \`DEVOS/\`). Harness contract: \`DEVOS/SKILL.md\`;
constitution: \`DEVOS/RUNTIME/SYSTEM_PROMPT.md\`; spec format: \`DEVOS/RUNTIME/ISA_FORMAT.md\`;
project spec: \`ISA.md\`.
${IMPORTS_END}`;
}

function main(): void {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const apply = flags.has("--apply");
  const allowDev = flags.has("--allow-dev");
  const harness = detectHarness(homeDir());
  const pointer = harnessInstallProfile(harness.name).pointer;
  const pointerPath = join(target, pointer);

  if ((target === SOURCE_ROOT || isDevTreeCheckout(target)) && !allowDev) {
    emit({ ok: false, refused: "dev-tree", detail: `${target} is the DevOS source checkout — refusing to edit it.` }, 2);
  }
  if (!existsSync(join(target, "DEVOS", "SKILL.md"))) {
    emit({ ok: false, error: `no DEVOS install at ${target} — run DeployCore --apply first` }, 1);
  }

  if (!apply) {
    emit({
      ok: true, dryRun: true, target, harness: harness.name, pointer,
      mode: `would-${managedBlockMode(pointerPath, IMPORTS_START, IMPORTS_END)}`,
      note: "dry run — nothing written; re-run with --apply",
    }, 0);
  }

  const mode = upsertManagedBlock(pointerPath, IMPORTS_START, IMPORTS_END, block(), pointer);
  emit({ ok: true, target, harness: harness.name, pointer, written: true, mode }, 0);
}

main();
